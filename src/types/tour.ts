/**
 * Tour-related types
 */

import type { ReactNode } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import type { TooltipPosition } from './positions';

/**
 * Tour lifecycle state
 */
export type TourState =
  | 'idle'
  | 'active'
  | 'completed'
  | 'skipped'
  | 'dismissed';

/**
 * Configuration for a single tour step
 */
export interface StepConfig {
  /** Unique identifier for the step */
  id: string;

  /** ID of the registered TourStep component (null for floating tooltips) */
  targetId?: string | null;

  /** Step title displayed in tooltip header */
  title?: string;

  /** Step content - string or custom React component */
  content: string | ReactNode;

  /** Preferred tooltip position (default: 'auto') */
  position?: TooltipPosition;

  /** Prevent user interaction with highlighted element */
  disableInteraction?: boolean;

  /** Custom styles for this step's tooltip */
  tooltipStyle?: ViewStyle;

  /** Custom styles for this step's tooltip text */
  tooltipTextStyle?: TextStyle;
}

/**
 * Tour control methods returned by useIntro/useTour hooks
 */
export interface TourControls {
  /** Start a tour with the given configuration */
  start: (
    tourId: string,
    steps: StepConfig[],
    options?: import('./options').TourOptions
  ) => void;

  /** Go to next step */
  next: () => void;

  /** Go to previous step */
  prev: () => void;

  /** Go to specific step by index */
  goTo: (stepIndex: number) => void;

  /** End the tour */
  stop: (reason?: 'completed' | 'skipped' | 'dismissed') => void;

  /** Restart the current tour from beginning */
  restart: () => void;

  /** Check if a tour was permanently dismissed */
  isDismissed: (tourId: string) => boolean;

  /** Clear dismissed state for a tour */
  clearDismissed: (tourId: string) => void;

  /** Refresh element measurements */
  refresh: () => void;
}

/**
 * Tour state returned by useIntro/useTour hooks
 */
export interface TourStateInfo {
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
