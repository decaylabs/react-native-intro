/**
 * React Native Intro Library
 *
 * A React Native implementation of intro.js for mobile app onboarding.
 * Provides step-by-step guided tours and persistent hint indicators.
 */

// Components
export { IntroProvider } from './components/IntroProvider';
export { TourStep, TourStepRef } from './components/TourStep';
export { HintSpot, HintSpotRef } from './components/HintSpot';
export { TourOverlay } from './components/TourOverlay';
export { Tooltip } from './components/Tooltip';
export { ProgressBar } from './components/ProgressBar';
export { StepBullets } from './components/StepBullets';
export { HintBubble, HintIndicator } from './components/HintBubble';

// Hooks
export { useIntro } from './hooks/useIntro';
export { useTour } from './hooks/useTour';
export { useHints } from './hooks/useHints';
export { useScrollView } from './hooks/useScrollView';
export {
  useMeasure,
  measureElement,
  measureElements,
} from './hooks/useMeasure';
export { useReduceMotion } from './hooks/useReduceMotion';

// Context (for advanced usage)
export { useIntroContext } from './context/useIntroContext';
export type { ScrollableRef } from './context/IntroContext';

// Utils
export {
  validateTour,
  validateStep,
  validateHint,
  validateHints,
} from './utils/validation';
export { calculateTooltipPosition } from './utils/positioning';
export { setDebugEnabled, isDebugEnabled } from './utils/debug';
export {
  announceForAccessibility,
  announceStepChange,
  announceTourComplete,
  announceHintRevealed,
  isReduceMotionEnabled,
  isScreenReaderEnabled,
} from './utils/accessibility';

// Themes
export {
  classicTheme,
  modernTheme,
  darkTheme,
  themes,
  getTheme,
  mergeTheme,
  createTheme,
  resolveTheme,
  resolveThemeWithColorScheme,
} from './themes';

// Types
export type {
  // Position types
  TooltipPosition,
  HintPosition,
  ElementMeasurement,
  // Tour types
  TourState,
  StepConfig,
  TourControls,
  TourStateInfo,
  // Hint types
  HintConfig,
  HintControls,
  HintsState,
  HintType,
  // Options types
  ButtonLabels,
  TourOptions,
  HintOptions,
  // Event/callback types
  TourCallbacks,
  HintCallbacks,
  // Component prop types
  StorageAdapter,
  IntroProviderProps,
  TourStepProps,
  HintSpotProps,
  // Theme types
  Theme,
  ThemeName,
  OverlayStyle,
  TooltipStyleConfig,
  ButtonStyleConfig,
  HintStyleConfig,
  ProgressStyleConfig,
  // Hook return type
  UseIntroReturn,
} from './types';
