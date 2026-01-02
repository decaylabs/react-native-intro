/**
 * useIntro hook - Main programmatic control for tours and hints
 */

import { useContext, useCallback, useMemo } from 'react';
import { IntroContext } from '../context/IntroContext';
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

  const startTour = useCallback(
    async (tourId: string, steps: StepConfig[], options?: TourOptions) => {
      // Check if tour is dismissed
      if (state.persistence.dismissedTours.has(tourId)) {
        return;
      }

      // Call onBeforeStart callback
      const callbacks = context.tourCallbacks;
      if (callbacks.onBeforeStart) {
        const shouldStart = await callbacks.onBeforeStart(tourId);
        if (!shouldStart) return;
      }

      // Start the tour
      dispatch({ type: 'START_TOUR', tourId, steps, options });

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

  const showHints = useCallback(
    (hints: HintConfig[], options?: HintOptions) => {
      dispatch({ type: 'SHOW_HINTS', hints, options });

      const callbacks = context.hintCallbacks;
      if (callbacks.onHintsShow) {
        callbacks.onHintsShow();
      }
    },
    [context.hintCallbacks, dispatch]
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
