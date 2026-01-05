/**
 * useTour hook - Tour-specific control hook
 *
 * A simplified hook that provides only tour-related functionality.
 * For full control over both tours and hints, use useIntro instead.
 */

import { useCallback, useMemo } from 'react';
import { useIntroContext } from '../context/useIntroContext';
import type { StepPropsConfig } from '../context/IntroContext';
import type {
  StepConfig,
  TourOptions,
  TourCallbacks,
  TourControls,
} from '../types';

/**
 * Tour state returned by useTour hook
 */
interface UseTourState {
  /** Whether a tour is currently active */
  isActive: boolean;

  /** Current tour ID (null if not active) */
  tourId: string | null;

  /** Current step index (0-based) */
  currentStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** Current step configuration */
  currentStepConfig: StepConfig | null;

  /** Whether transitioning between steps */
  isTransitioning: boolean;
}

/**
 * Return type for useTour hook
 */
interface UseTourReturn extends UseTourState, TourControls {
  /** Set tour lifecycle callbacks */
  setCallbacks: (callbacks: TourCallbacks) => void;
}

/**
 * Hook for tour-specific control
 *
 * @throws Error if used outside of IntroProvider
 * @returns Tour controls, state, and callback setter
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const tour = useTour();
 *
 *   const startTour = () => {
 *     tour.start('welcome-tour', [
 *       { id: 'step-1', targetId: 'button-1', content: 'Click here!' },
 *       { id: 'step-2', targetId: 'button-2', content: 'Then click here!' },
 *     ]);
 *   };
 *
 *   return (
 *     <View>
 *       <Text>Current step: {tour.currentStep + 1} / {tour.totalSteps}</Text>
 *       <Button onPress={startTour} title="Start Tour" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useTour(): UseTourReturn {
  const { state, dispatch, measureAllSteps, setTourCallbacks, tourCallbacks } =
    useIntroContext();

  /**
   * Build step configs from registered TourStep props
   * Filters to steps with intro content and optionally a specific group
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

        // Only include steps with intro content defined via props
        if (!props?.intro) return;

        // Filter by group if specified
        if (group && props.group !== group) return;

        steps.push({ id, order: entry.order, props });
      });

      // Sort by order
      steps.sort((a, b) => a.order - b.order);

      // Convert to StepConfig format
      return steps.map((step, index) => ({
        id: `step-${index + 1}`,
        // Floating steps have no targetId (they're centered on screen)
        targetId: step.props.floating ? undefined : step.id,
        content: step.props.intro!,
        title: step.props.title,
        position: step.props.position,
        disableInteraction: step.props.disableInteraction,
        hideButtons: step.props.hideButtons,
        tooltipStyle: step.props.tooltipStyle,
        tooltipTitleStyle: step.props.tooltipTitleStyle,
        tooltipTextStyle: step.props.tooltipTextStyle,
      }));
    },
    [state.registry.steps]
  );

  /**
   * Start a tour
   *
   * Supports multiple calling patterns:
   * - start() - props-based, default tour
   * - start(options) - props-based with global options
   * - start(tourId) - props-based for specific group
   * - start(tourId, options) - props-based for group with options
   * - start(tourId, steps) - programmatic with explicit steps
   * - start(tourId, steps, options) - programmatic with steps and options
   */
  const start = useCallback(
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
          `[react-native-intro] No steps found for tour "${tourId}". ` +
            'Either pass steps to start() or define intro props on TourStep components.'
        );
        return;
      }

      // Call onBeforeStart callback
      if (tourCallbacks.onBeforeStart) {
        const shouldStart = await tourCallbacks.onBeforeStart(tourId);
        if (!shouldStart) return;
      }

      // Start the tour
      dispatch({ type: 'START_TOUR', tourId, steps: stepsToUse, options });

      // Measure all step targets
      await measureAllSteps();

      // Call onStart callback
      if (tourCallbacks.onStart) {
        tourCallbacks.onStart(tourId);
      }
    },
    [
      state.persistence.dismissedTours,
      tourCallbacks,
      dispatch,
      measureAllSteps,
      buildStepsFromProps,
    ]
  );

  // Go to next step
  const next = useCallback(async () => {
    const currentStep = state.tour.currentStepIndex;
    const nextStepIndex = currentStep + 1;

    // Check if this is the last step
    if (nextStepIndex >= state.tour.steps.length) {
      // Call onBeforeExit
      if (tourCallbacks.onBeforeExit) {
        const shouldExit = await tourCallbacks.onBeforeExit('completed');
        if (!shouldExit) return;
      }

      dispatch({ type: 'END_TOUR', reason: 'completed' });

      if (tourCallbacks.onComplete && state.tour.id) {
        tourCallbacks.onComplete(state.tour.id, 'completed');
      }
      return;
    }

    // Call onBeforeChange
    if (tourCallbacks.onBeforeChange) {
      const shouldChange = await tourCallbacks.onBeforeChange(
        currentStep,
        nextStepIndex,
        'next'
      );
      if (!shouldChange) return;
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
    dispatch({ type: 'NEXT_STEP' });

    // Call onChange
    if (tourCallbacks.onChange) {
      tourCallbacks.onChange(nextStepIndex, currentStep);
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
  }, [tourCallbacks, state.tour, dispatch]);

  // Go to previous step
  const prev = useCallback(async () => {
    const currentStep = state.tour.currentStepIndex;
    const prevStepIndex = Math.max(0, currentStep - 1);

    if (prevStepIndex === currentStep) return;

    // Call onBeforeChange
    if (tourCallbacks.onBeforeChange) {
      const shouldChange = await tourCallbacks.onBeforeChange(
        currentStep,
        prevStepIndex,
        'prev'
      );
      if (!shouldChange) return;
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
    dispatch({ type: 'PREV_STEP' });

    // Call onChange
    if (tourCallbacks.onChange) {
      tourCallbacks.onChange(prevStepIndex, currentStep);
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
  }, [tourCallbacks, state.tour.currentStepIndex, dispatch]);

  // Go to specific step
  const goTo = useCallback(
    async (stepIndex: number) => {
      const currentStep = state.tour.currentStepIndex;

      if (stepIndex === currentStep) return;
      if (stepIndex < 0 || stepIndex >= state.tour.steps.length) return;

      // Call onBeforeChange
      if (tourCallbacks.onBeforeChange) {
        const shouldChange = await tourCallbacks.onBeforeChange(
          currentStep,
          stepIndex,
          'goto'
        );
        if (!shouldChange) return;
      }

      dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
      dispatch({ type: 'GO_TO_STEP', stepIndex });

      // Call onChange
      if (tourCallbacks.onChange) {
        tourCallbacks.onChange(stepIndex, currentStep);
      }

      dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
    },
    [tourCallbacks, state.tour, dispatch]
  );

  // Stop the tour
  const stop = useCallback(
    async (reason: 'completed' | 'skipped' | 'dismissed' = 'dismissed') => {
      // Call onBeforeExit
      if (tourCallbacks.onBeforeExit) {
        const shouldExit = await tourCallbacks.onBeforeExit(reason);
        if (!shouldExit) return;
      }

      dispatch({ type: 'END_TOUR', reason });

      if (tourCallbacks.onComplete && state.tour.id) {
        tourCallbacks.onComplete(state.tour.id, reason);
      }
    },
    [tourCallbacks, state.tour.id, dispatch]
  );

  // Restart the tour
  const restart = useCallback(() => {
    dispatch({ type: 'GO_TO_STEP', stepIndex: 0 });
  }, [dispatch]);

  // Check if tour is dismissed
  const isDismissed = useCallback(
    (tourId: string): boolean => {
      return state.persistence.dismissedTours.has(tourId);
    },
    [state.persistence.dismissedTours]
  );

  // Clear dismissed state
  const clearDismissed = useCallback(
    (tourId: string) => {
      dispatch({ type: 'CLEAR_DISMISSED_TOUR', tourId });
    },
    [dispatch]
  );

  // Refresh measurements
  const refresh = useCallback(() => {
    measureAllSteps();
  }, [measureAllSteps]);

  // Set callbacks
  const setCallbacks = useCallback(
    (callbacks: TourCallbacks) => {
      setTourCallbacks(callbacks);
    },
    [setTourCallbacks]
  );

  // Build return value
  return useMemo(
    () => ({
      // State
      isActive: state.tour.state === 'active',
      tourId: state.tour.id,
      currentStep: state.tour.currentStepIndex,
      totalSteps: state.tour.steps.length,
      currentStepConfig: state.tour.steps[state.tour.currentStepIndex] ?? null,
      isTransitioning: state.ui.isTransitioning,

      // Controls
      start,
      next,
      prev,
      goTo,
      stop,
      restart,
      isDismissed,
      clearDismissed,
      refresh,
      setCallbacks,
    }),
    [
      state.tour,
      state.ui.isTransitioning,
      start,
      next,
      prev,
      goTo,
      stop,
      restart,
      isDismissed,
      clearDismissed,
      refresh,
      setCallbacks,
    ]
  );
}
