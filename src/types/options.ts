/**
 * Configuration options for tours and hints
 */

import type { ViewStyle } from 'react-native';

/**
 * Custom button labels for tour navigation
 */
export interface ButtonLabels {
  next?: string;
  prev?: string;
  done?: string;
  skip?: string;
  dontShowAgain?: string;
}

/**
 * Tour-level options
 */
export interface TourOptions {
  /** Show progress bar (default: true) */
  showProgress?: boolean;

  /** Show step bullets/dots (default: true) */
  showBullets?: boolean;

  /** Show navigation buttons (default: true) */
  showButtons?: boolean;

  /** Close tour when tapping overlay (default: false) */
  exitOnOverlayClick?: boolean;

  /** Show "Don't show again" checkbox (default: false) */
  dontShowAgain?: boolean;

  /** Disable interaction with highlighted elements (default: false) */
  disableInteraction?: boolean;

  /** Auto-scroll to off-screen elements (default: true) */
  scrollToElement?: boolean;

  /** Padding when scrolling to element (default: 50) */
  scrollPadding?: number;

  /** Overlay opacity 0-1 (default: 0.75) */
  overlayOpacity?: number;

  /** Overlay color (default: theme-dependent) */
  overlayColor?: string;

  /** Animation duration in ms (default: 300) */
  animationDuration?: number;

  /** Custom button labels */
  buttonLabels?: ButtonLabels;

  /** Custom tooltip styles */
  tooltipStyle?: ViewStyle;

  /** Custom overlay styles */
  overlayStyle?: ViewStyle;
}

/**
 * Hint-level options
 */
export interface HintOptions {
  /** Show all hints on render (default: false) */
  autoShow?: boolean;

  /** Enable pulsing animation (default: true) */
  animation?: boolean;

  /** Close hint on tap outside (default: true) */
  closeOnOutsideClick?: boolean;

  /** Hint indicator size (default: 20) */
  indicatorSize?: number;

  /** Custom indicator styles */
  indicatorStyle?: ViewStyle;

  /** Custom tooltip styles */
  tooltipStyle?: ViewStyle;
}
