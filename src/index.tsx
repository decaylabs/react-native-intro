/**
 * React Native Intro Library
 *
 * A React Native implementation of intro.js for mobile app onboarding.
 * Provides step-by-step guided tours and persistent hint indicators.
 */

// Components
export { IntroProvider } from './components/IntroProvider';

// Hooks
export { useIntro } from './hooks/useIntro';
export {
  useMeasure,
  measureElement,
  measureElements,
} from './hooks/useMeasure';

// Themes
export { classicTheme, themes, getTheme, mergeTheme } from './themes';

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
