/**
 * Tour-related types
 */

import type { ReactNode } from 'react';
import type { ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';
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
 * Image configuration for a tour step
 */
export interface StepImageConfig {
  /** Image source (require() for local, { uri: '...' } for remote) */
  source: ImageSourcePropType;

  /** Image width (default: '100%') */
  width?: number | string;

  /** Image height (default: 150) */
  height?: number;

  /** Border radius for the image (default: 8) */
  borderRadius?: number;

  /** Image resize mode (default: 'cover') */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';

  /** Alt text for accessibility */
  alt?: string;

  /** Position of image relative to content (default: 'top') */
  position?: 'top' | 'bottom';
}

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

  /** Image to display in the tooltip */
  image?: StepImageConfig;

  /** Preferred tooltip position (default: 'auto') */
  position?: TooltipPosition;

  /** Prevent user interaction with highlighted element */
  disableInteraction?: boolean;

  /** Hide navigation buttons for this step (useful for interactive elements) */
  hideButtons?: boolean;

  /** Custom styles for this step's tooltip container */
  tooltipStyle?: ViewStyle;

  /** Custom styles for this step's tooltip title */
  tooltipTitleStyle?: TextStyle;

  /** Custom styles for this step's tooltip text (only applies to string content) */
  tooltipTextStyle?: TextStyle;
}

/**
 * Tour control methods returned by useIntro/useTour hooks
 */
export interface TourControls {
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
  start: (
    tourIdOrOptions?: string | import('./options').TourOptions,
    stepsOrOptions?: StepConfig[] | import('./options').TourOptions,
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
