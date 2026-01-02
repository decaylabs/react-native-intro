/**
 * Hint-related types
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { HintPosition } from './positions';
import type { HintOptions } from './options';

/**
 * Hint type for semantic styling
 */
export type HintType = 'default' | 'info' | 'warning' | 'error' | 'success';

/**
 * Configuration for a hint
 */
export interface HintConfig {
  /** Unique identifier for the hint */
  id: string;

  /** ID of the registered HintSpot component */
  targetId: string;

  /** Hint content - string or custom React component */
  content: string | ReactNode;

  /** Hint indicator and tooltip position */
  position?: HintPosition;

  /** Enable pulsing animation on indicator (default: true) */
  animation?: boolean;

  /** Hint type for semantic styling (default, info, warning, error, success) */
  type?: HintType;

  /** Custom styles for the hint indicator */
  indicatorStyle?: ViewStyle;

  /** Custom styles for the hint tooltip */
  tooltipStyle?: ViewStyle;
}

/**
 * Hint control methods returned by useIntro/useHints hooks
 */
export interface HintControls {
  /**
   * Show hints
   *
   * Supports multiple calling patterns:
   * - show() - uses props from HintSpot components
   * - show(options) - uses props with global options
   * - show(hints) - uses explicit hint configs
   * - show(hints, options) - uses explicit hints with options
   */
  show: (
    hintsOrOptions?: HintConfig[] | HintOptions,
    options?: HintOptions
  ) => void;

  /** Hide all hints */
  hide: () => void;

  /** Show a specific hint's tooltip */
  showHint: (hintId: string) => void;

  /** Hide a specific hint's tooltip */
  hideHint: (hintId: string) => void;

  /** Remove a hint entirely */
  removeHint: (hintId: string) => void;

  /** Refresh hint positions */
  refresh: () => void;
}

/**
 * Hint state returned by useIntro/useHints hooks
 */
export interface HintsState {
  /** Whether hints are currently visible */
  isVisible: boolean;

  /** Currently active hint ID (tooltip open) */
  activeHintId: string | null;

  /** All registered hint configurations */
  hints: HintConfig[];
}
