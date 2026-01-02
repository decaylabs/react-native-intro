/**
 * Callback types for tour and hint lifecycle events
 */

/**
 * Tour lifecycle callbacks
 */
export interface TourCallbacks {
  /** Called before tour starts, return false to prevent */
  onBeforeStart?: (tourId: string) => boolean | Promise<boolean>;

  /** Called after tour starts */
  onStart?: (tourId: string) => void;

  /** Called before step change, return false to prevent */
  onBeforeChange?: (
    currentStep: number,
    nextStep: number,
    direction: 'next' | 'prev' | 'goto'
  ) => boolean | Promise<boolean>;

  /** Called after step change */
  onChange?: (currentStep: number, previousStep: number) => void;

  /** Called before tour exit, return false to prevent (for confirm dialog) */
  onBeforeExit?: (
    reason: 'completed' | 'skipped' | 'dismissed'
  ) => boolean | Promise<boolean>;

  /** Called after tour ends */
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
