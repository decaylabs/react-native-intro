/**
 * Callback types for tour and hint lifecycle events
 *
 * All "onBefore*" callbacks support both synchronous and asynchronous
 * (Promise-based) return values. Return `false` or `Promise<false>` to
 * prevent the action from proceeding.
 *
 * @example Sync callback
 * ```tsx
 * const callbacks = {
 *   onBeforeChange: (current, next, direction) => {
 *     // Synchronously prevent going to step 3
 *     return next !== 2;
 *   },
 * };
 * ```
 *
 * @example Async callback
 * ```tsx
 * const callbacks = {
 *   onBeforeExit: async (reason) => {
 *     // Show confirmation dialog and wait for user response
 *     const confirmed = await showConfirmDialog('Exit tour?');
 *     return confirmed;
 *   },
 * };
 * ```
 */

/**
 * Tour lifecycle callbacks
 *
 * These callbacks allow you to hook into the tour lifecycle and optionally
 * control navigation through async/sync return values.
 *
 * ## Async Callback Pattern
 *
 * All "onBefore*" callbacks support Promises, enabling patterns like:
 * - Form validation before allowing step change
 * - Confirmation dialogs before exiting
 * - Loading data before starting a tour
 * - Analytics tracking with async APIs
 *
 * @example Complete callback setup
 * ```tsx
 * useEffect(() => {
 *   callbacks.setTourCallbacks({
 *     // Async: Check if user can start tour
 *     onBeforeStart: async (tourId) => {
 *       const canStart = await checkUserPermissions();
 *       return canStart;
 *     },
 *
 *     // Called when tour starts
 *     onStart: (tourId) => {
 *       analytics.track('tour_started', { tourId });
 *     },
 *
 *     // Async: Validate before step change
 *     onBeforeChange: async (current, next, direction) => {
 *       if (current === 1 && direction === 'next') {
 *         const formValid = await validateForm();
 *         if (!formValid) {
 *           showError('Please complete the form first');
 *           return false;
 *         }
 *       }
 *       return true;
 *     },
 *
 *     // Called after each step change
 *     onChange: (currentStep, previousStep) => {
 *       analytics.track('tour_step', { step: currentStep });
 *     },
 *
 *     // Async: Confirm before exit
 *     onBeforeExit: async (reason) => {
 *       if (reason !== 'completed') {
 *         return await showConfirmDialog('Exit tour early?');
 *       }
 *       return true;
 *     },
 *
 *     // Called when tour ends
 *     onComplete: (tourId, reason) => {
 *       analytics.track('tour_completed', { tourId, reason });
 *     },
 *   });
 * }, []);
 * ```
 */
export interface TourCallbacks {
  /**
   * Called before tour starts
   *
   * Return `false` or `Promise<false>` to prevent the tour from starting.
   * Useful for permission checks, loading prerequisites, or user prompts.
   *
   * @param tourId - The ID of the tour about to start
   * @returns Whether to proceed with starting the tour
   *
   * @example
   * ```tsx
   * onBeforeStart: async (tourId) => {
   *   const hasSeenTour = await checkIfSeenBefore(tourId);
   *   return !hasSeenTour; // Only start if not seen before
   * }
   * ```
   */
  onBeforeStart?: (tourId: string) => boolean | Promise<boolean>;

  /**
   * Called after tour successfully starts
   *
   * This callback is only invoked if `onBeforeStart` returned true.
   *
   * @param tourId - The ID of the tour that started
   *
   * @example
   * ```tsx
   * onStart: (tourId) => {
   *   analytics.track('tour_started', { tourId });
   * }
   * ```
   */
  onStart?: (tourId: string) => void;

  /**
   * Called before step change
   *
   * Return `false` or `Promise<false>` to prevent navigation to the next step.
   * Useful for form validation, data loading, or conditional navigation.
   *
   * @param currentStep - Current step index (0-based)
   * @param nextStep - Target step index (0-based)
   * @param direction - Navigation direction: 'next', 'prev', or 'goto'
   * @returns Whether to proceed with the step change
   *
   * @example Block navigation to specific step
   * ```tsx
   * onBeforeChange: (current, next, direction) => {
   *   // Prevent going to step 3 until form is complete
   *   if (next === 2 && !formIsComplete) {
   *     Alert.alert('Please complete the form first');
   *     return false;
   *   }
   *   return true;
   * }
   * ```
   *
   * @example Async validation
   * ```tsx
   * onBeforeChange: async (current, next, direction) => {
   *   const valid = await validateCurrentStep(current);
   *   return valid;
   * }
   * ```
   */
  onBeforeChange?: (
    currentStep: number,
    nextStep: number,
    direction: 'next' | 'prev' | 'goto'
  ) => boolean | Promise<boolean>;

  /**
   * Called after step successfully changes
   *
   * This callback is only invoked if `onBeforeChange` returned true.
   *
   * @param currentStep - New current step index (0-based)
   * @param previousStep - Previous step index (0-based)
   *
   * @example
   * ```tsx
   * onChange: (currentStep, previousStep) => {
   *   console.log(`Moved from step ${previousStep} to ${currentStep}`);
   * }
   * ```
   */
  onChange?: (currentStep: number, previousStep: number) => void;

  /**
   * Called before tour exit
   *
   * Return `false` or `Promise<false>` to prevent the tour from ending.
   * Perfect for implementing confirmation dialogs or unsaved changes prompts.
   *
   * @param reason - Why the tour is ending:
   *   - 'completed': User finished all steps
   *   - 'skipped': User clicked Skip button
   *   - 'dismissed': User tapped overlay or called stop()
   * @returns Whether to proceed with exiting the tour
   *
   * @example Confirmation dialog
   * ```tsx
   * onBeforeExit: async (reason) => {
   *   if (reason !== 'completed') {
   *     return new Promise((resolve) => {
   *       Alert.alert(
   *         'Exit Tour?',
   *         'You will lose your progress.',
   *         [
   *           { text: 'Cancel', onPress: () => resolve(false) },
   *           { text: 'Exit', onPress: () => resolve(true) },
   *         ]
   *       );
   *     });
   *   }
   *   return true;
   * }
   * ```
   */
  onBeforeExit?: (
    reason: 'completed' | 'skipped' | 'dismissed'
  ) => boolean | Promise<boolean>;

  /**
   * Called after tour ends
   *
   * This callback is only invoked if `onBeforeExit` returned true.
   *
   * @param tourId - The ID of the tour that ended
   * @param reason - Why the tour ended:
   *   - 'completed': User finished all steps
   *   - 'skipped': User clicked Skip button
   *   - 'dismissed': User tapped overlay or called stop()
   *
   * @example
   * ```tsx
   * onComplete: (tourId, reason) => {
   *   analytics.track('tour_ended', { tourId, reason });
   *   if (reason === 'completed') {
   *     markTourAsCompleted(tourId);
   *   }
   * }
   * ```
   */
  onComplete?: (
    tourId: string,
    reason: 'completed' | 'skipped' | 'dismissed'
  ) => void;
}

/**
 * Hint lifecycle callbacks
 */
export interface HintCallbacks {
  /** Called when hints are shown */
  onHintsShow?: () => void;

  /** Called when hints are hidden */
  onHintsHide?: () => void;

  /** Called when a hint indicator is tapped */
  onHintClick?: (hintId: string) => void;

  /** Called when a hint tooltip is closed */
  onHintClose?: (hintId: string) => void;
}
