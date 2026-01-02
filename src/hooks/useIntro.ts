/**
 * useIntro hook - Main programmatic control for tours and hints
 */

import { useContext, useCallback, useMemo } from 'react';
import {
  IntroContext,
  type StepPropsConfig,
  type HintPropsConfig,
} from '../context/IntroContext';
import type {
  StepConfig,
  HintConfig,
  TourOptions,
  HintOptions,
  TourCallbacks,
  HintCallbacks,
  UseIntroReturn,
} from '../types';

/**
 * Hook to access and control tours and hints
 *
 * @throws Error if used outside of IntroProvider
 * @returns Tour and hint controls, state, and callback setters
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tour, hints, callbacks } = useIntro();
 *
 *   const startTour = () => {
 *     tour.start('my-tour', [
 *       { id: 'step-1', targetId: 'button-1', content: 'Click here!' },
 *       { id: 'step-2', targetId: 'button-2', content: 'Then click here!' },
 *     ]);
 *   };
 *
 *   return <Button onPress={startTour} title="Start Tour" />;
 * }
 * ```
 */
export function useIntro(): UseIntroReturn {
  const context = useContext(IntroContext);

  if (!context) {
    throw new Error('useIntro must be used within an IntroProvider');
  }

  const {
    state,
    dispatch,
    measureAllSteps,
    setTourCallbacks,
    setHintCallbacks,
  } = context;

  // =========================================================================
  // TOUR CONTROLS
  // =========================================================================

  /**
   * Build step configs from registered TourStep props
   */
  const buildStepsFromProps = useCallback(
    (group?: string): StepConfig[] => {
      const steps: Array<{
        id: string;
        order: number;
        props: StepPropsConfig;
      }> = [];

      state.registry.steps.forEach((entry, id) => {
        const props = entry.props as StepPropsConfig | undefined;
        if (!props?.intro) return;
        if (group && props.group !== group) return;
        steps.push({ id, order: entry.order, props });
      });

      steps.sort((a, b) => a.order - b.order);

      return steps.map((step, index) => ({
        id: `step-${index + 1}`,
        targetId: step.id,
        content: step.props.intro!,
        title: step.props.title,
        position: step.props.position,
        disableInteraction: step.props.disableInteraction,
        tooltipStyle: step.props.tooltipStyle,
        tooltipTextStyle: step.props.tooltipTextStyle,
      }));
    },
    [state.registry.steps]
  );

  const startTour = useCallback(
    async (
      tourIdOrOptions?: string | TourOptions,
      stepsOrOptions?: StepConfig[] | TourOptions,
      maybeOptions?: TourOptions
    ) => {
      // Detect calling pattern
      let tourId: string = 'default';
      let steps: StepConfig[] | undefined;
      let options: TourOptions | undefined;

      if (tourIdOrOptions === undefined) {
        // start() - no args
      } else if (typeof tourIdOrOptions === 'object') {
        // start(options) - first arg is options object
        options = tourIdOrOptions;
      } else if (typeof tourIdOrOptions === 'string') {
        // First arg is tour ID
        tourId = tourIdOrOptions;

        if (Array.isArray(stepsOrOptions)) {
          // start(tourId, steps) or start(tourId, steps, options)
          steps = stepsOrOptions;
          options = maybeOptions;
        } else if (stepsOrOptions && typeof stepsOrOptions === 'object') {
          // start(tourId, options) - second arg is options
          options = stepsOrOptions;
        }
      }

      // Check if tour is dismissed
      if (state.persistence.dismissedTours.has(tourId)) {
        return;
      }

      // Build steps from props if not provided
      const stepsToUse =
        steps || buildStepsFromProps(tourId !== 'default' ? tourId : undefined);

      if (stepsToUse.length === 0) {
        console.warn(
          `[react-native-intro] No steps found for tour "${tourId}".`
        );
        return;
      }

      // Call onBeforeStart callback
      const callbacks = context.tourCallbacks;
      if (callbacks.onBeforeStart) {
        const shouldStart = await callbacks.onBeforeStart(tourId);
        if (!shouldStart) return;
      }

      // Start the tour
      dispatch({ type: 'START_TOUR', tourId, steps: stepsToUse, options });

      // Measure all step targets
      await measureAllSteps();

      // Call onStart callback
      if (callbacks.onStart) {
        callbacks.onStart(tourId);
      }
    },
    [
      state.persistence.dismissedTours,
      context.tourCallbacks,
      dispatch,
      measureAllSteps,
      buildStepsFromProps,
    ]
  );

  const nextStep = useCallback(async () => {
    const callbacks = context.tourCallbacks;
    const currentStep = state.tour.currentStepIndex;
    const nextStepIndex = currentStep + 1;

    // Check if this is the last step
    if (nextStepIndex >= state.tour.steps.length) {
      // Call onBeforeExit
      if (callbacks.onBeforeExit) {
        const shouldExit = await callbacks.onBeforeExit('completed');
        if (!shouldExit) return;
      }

      dispatch({ type: 'END_TOUR', reason: 'completed' });

      if (callbacks.onComplete && state.tour.id) {
        callbacks.onComplete(state.tour.id, 'completed');
      }
      return;
    }

    // Call onBeforeChange
    if (callbacks.onBeforeChange) {
      const shouldChange = await callbacks.onBeforeChange(
        currentStep,
        nextStepIndex,
        'next'
      );
      if (!shouldChange) return;
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
    dispatch({ type: 'NEXT_STEP' });

    // Call onChange
    if (callbacks.onChange) {
      callbacks.onChange(nextStepIndex, currentStep);
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
  }, [context.tourCallbacks, state.tour, dispatch]);

  const prevStep = useCallback(async () => {
    const callbacks = context.tourCallbacks;
    const currentStep = state.tour.currentStepIndex;
    const prevStepIndex = Math.max(0, currentStep - 1);

    if (prevStepIndex === currentStep) return;

    // Call onBeforeChange
    if (callbacks.onBeforeChange) {
      const shouldChange = await callbacks.onBeforeChange(
        currentStep,
        prevStepIndex,
        'prev'
      );
      if (!shouldChange) return;
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
    dispatch({ type: 'PREV_STEP' });

    // Call onChange
    if (callbacks.onChange) {
      callbacks.onChange(prevStepIndex, currentStep);
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
  }, [context.tourCallbacks, state.tour.currentStepIndex, dispatch]);

  const goToStep = useCallback(
    async (stepIndex: number) => {
      const callbacks = context.tourCallbacks;
      const currentStep = state.tour.currentStepIndex;

      if (stepIndex === currentStep) return;
      if (stepIndex < 0 || stepIndex >= state.tour.steps.length) return;

      // Call onBeforeChange
      if (callbacks.onBeforeChange) {
        const shouldChange = await callbacks.onBeforeChange(
          currentStep,
          stepIndex,
          'goto'
        );
        if (!shouldChange) return;
      }

      dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
      dispatch({ type: 'GO_TO_STEP', stepIndex });

      // Call onChange
      if (callbacks.onChange) {
        callbacks.onChange(stepIndex, currentStep);
      }

      dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
    },
    [context.tourCallbacks, state.tour, dispatch]
  );

  const stopTour = useCallback(
    async (reason: 'completed' | 'skipped' | 'dismissed' = 'dismissed') => {
      const callbacks = context.tourCallbacks;

      // Call onBeforeExit
      if (callbacks.onBeforeExit) {
        const shouldExit = await callbacks.onBeforeExit(reason);
        if (!shouldExit) return;
      }

      dispatch({ type: 'END_TOUR', reason });

      if (callbacks.onComplete && state.tour.id) {
        callbacks.onComplete(state.tour.id, reason);
      }
    },
    [context.tourCallbacks, state.tour.id, dispatch]
  );

  const restartTour = useCallback(() => {
    dispatch({ type: 'GO_TO_STEP', stepIndex: 0 });
  }, [dispatch]);

  const isDismissed = useCallback(
    (tourId: string): boolean => {
      return state.persistence.dismissedTours.has(tourId);
    },
    [state.persistence.dismissedTours]
  );

  const clearDismissed = useCallback(
    (tourId: string) => {
      dispatch({ type: 'CLEAR_DISMISSED_TOUR', tourId });
    },
    [dispatch]
  );

  const refreshMeasurements = useCallback(() => {
    measureAllSteps();
  }, [measureAllSteps]);

  // =========================================================================
  // HINT CONTROLS
  // =========================================================================

  /**
   * Build hint configs from registered HintSpot props
   */
  const buildHintsFromProps = useCallback((): HintConfig[] => {
    const hints: HintConfig[] = [];

    state.registry.hints.forEach((entry, id) => {
      const props = entry.props as HintPropsConfig | undefined;
      if (!props?.hint) return;

      hints.push({
        id: `hint-${id}`,
        targetId: id,
        content: props.hint,
        position: props.hintPosition,
        animation: props.hintAnimation,
        type: props.hintType,
        indicatorStyle: props.indicatorStyle,
        tooltipStyle: props.tooltipStyle,
      });
    });

    return hints;
  }, [state.registry.hints]);

  const showHints = useCallback(
    (
      hintsOrOptions?: HintConfig[] | HintOptions,
      maybeOptions?: HintOptions
    ) => {
      // Detect calling pattern
      let hints: HintConfig[] | undefined;
      let options: HintOptions | undefined;

      if (Array.isArray(hintsOrOptions)) {
        hints = hintsOrOptions;
        options = maybeOptions;
      } else if (hintsOrOptions && typeof hintsOrOptions === 'object') {
        hints = undefined;
        options = hintsOrOptions;
      }

      const hintsToUse = hints || buildHintsFromProps();

      if (hintsToUse.length === 0) {
        console.warn('[react-native-intro] No hints found.');
        return;
      }

      dispatch({ type: 'SHOW_HINTS', hints: hintsToUse, options });

      const callbacks = context.hintCallbacks;
      if (callbacks.onHintsShow) {
        callbacks.onHintsShow();
      }
    },
    [context.hintCallbacks, dispatch, buildHintsFromProps]
  );

  const hideHints = useCallback(() => {
    dispatch({ type: 'HIDE_HINTS' });

    const callbacks = context.hintCallbacks;
    if (callbacks.onHintsHide) {
      callbacks.onHintsHide();
    }
  }, [context.hintCallbacks, dispatch]);

  const showHint = useCallback(
    (hintId: string) => {
      dispatch({ type: 'SHOW_HINT', hintId });

      const callbacks = context.hintCallbacks;
      if (callbacks.onHintClick) {
        callbacks.onHintClick(hintId);
      }
    },
    [context.hintCallbacks, dispatch]
  );

  const hideHint = useCallback(
    (hintId: string) => {
      dispatch({ type: 'HIDE_HINT', hintId });

      const callbacks = context.hintCallbacks;
      if (callbacks.onHintClose) {
        callbacks.onHintClose(hintId);
      }
    },
    [context.hintCallbacks, dispatch]
  );

  const removeHint = useCallback(
    (hintId: string) => {
      dispatch({ type: 'REMOVE_HINT', hintId });
    },
    [dispatch]
  );

  const refreshHints = useCallback(() => {
    // Re-measure hint targets
    measureAllSteps();
  }, [measureAllSteps]);

  // =========================================================================
  // CALLBACK SETTERS
  // =========================================================================

  const setTourCallbacksWrapper = useCallback(
    (callbacks: TourCallbacks) => {
      setTourCallbacks(callbacks);
    },
    [setTourCallbacks]
  );

  const setHintCallbacksWrapper = useCallback(
    (callbacks: HintCallbacks) => {
      setHintCallbacks(callbacks);
    },
    [setHintCallbacks]
  );

  // =========================================================================
  // RETURN VALUE
  // =========================================================================

  const tourState = useMemo(
    () => ({
      isActive: state.tour.state === 'active',
      tourId: state.tour.id,
      currentStep: state.tour.currentStepIndex,
      totalSteps: state.tour.steps.length,
      currentStepConfig: state.tour.steps[state.tour.currentStepIndex] ?? null,
      isTransitioning: state.ui.isTransitioning,
    }),
    [state.tour, state.ui.isTransitioning]
  );

  const hintsState = useMemo(
    () => ({
      isVisible: state.hints.visible,
      activeHintId: state.hints.activeHintId,
      hints: state.hints.items,
    }),
    [state.hints]
  );

  return useMemo(
    () => ({
      tour: {
        ...tourState,
        start: startTour,
        next: nextStep,
        prev: prevStep,
        goTo: goToStep,
        stop: stopTour,
        restart: restartTour,
        isDismissed,
        clearDismissed,
        refresh: refreshMeasurements,
      },
      hints: {
        ...hintsState,
        show: showHints,
        hide: hideHints,
        showHint,
        hideHint,
        removeHint,
        refresh: refreshHints,
      },
      callbacks: {
        setTourCallbacks: setTourCallbacksWrapper,
        setHintCallbacks: setHintCallbacksWrapper,
      },
    }),
    [
      tourState,
      startTour,
      nextStep,
      prevStep,
      goToStep,
      stopTour,
      restartTour,
      isDismissed,
      clearDismissed,
      refreshMeasurements,
      hintsState,
      showHints,
      hideHints,
      showHint,
      hideHint,
      removeHint,
      refreshHints,
      setTourCallbacksWrapper,
      setHintCallbacksWrapper,
    ]
  );
}
