/**
 * React Native Intro Library
 *
 * A React Native implementation of intro.js for mobile app onboarding.
 * Provides step-by-step guided tours and persistent hint indicators.
 */

// Components
export { IntroProvider } from './components/IntroProvider';
export { TourStep, TourStepRef } from './components/TourStep';
export { TourOverlay } from './components/TourOverlay';
export { Tooltip } from './components/Tooltip';

// Hooks
export { useIntro } from './hooks/useIntro';
export { useTour } from './hooks/useTour';
export {
  useMeasure,
  measureElement,
  measureElements,
} from './hooks/useMeasure';

// Context (for advanced usage)
export { useIntroContext } from './context/useIntroContext';

// Utils
export {
  validateTour,
  validateStep,
  validateHint,
  validateHints,
} from './utils/validation';
export { calculateTooltipPosition } from './utils/positioning';

// Themes
export {
  classicTheme,
  modernTheme,
  darkTheme,
  themes,
  getTheme,
  mergeTheme,
  resolveTheme,
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
