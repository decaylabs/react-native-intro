/**
 * React Native Intro Library - Type Exports
 *
 * This file exports all public types for the library.
 */

// Position types
export type {
  TooltipPosition,
  HintPosition,
  ElementMeasurement,
} from './positions';

// Tour types
export type {
  TourState,
  StepConfig,
  TourControls,
  TourStateInfo,
} from './tour';

// Hint types
export type { HintConfig, HintControls, HintsState, HintType } from './hint';

// Options types
export type { ButtonLabels, TourOptions, HintOptions } from './options';

// Event/callback types
export type { TourCallbacks, HintCallbacks } from './events';

// Component prop types
export type {
  StorageAdapter,
  IntroProviderProps,
  TourStepProps,
  HintSpotProps,
  RegistryEntry,
  StepRegistryEntry,
  HintRegistryEntry,
} from './components';

// Theme types (re-exported from themes)
export type {
  Theme,
  ThemeName,
  OverlayStyle,
  TooltipStyleConfig,
  ButtonStyleConfig,
  HintStyleConfig,
  ProgressStyleConfig,
} from '../themes/types';

// Combined hook return type
import type { TourStateInfo, TourControls } from './tour';
import type { HintsState, HintControls } from './hint';
import type { TourCallbacks, HintCallbacks } from './events';

/**
 * Complete return type for useIntro hook
 */
export interface UseIntroReturn {
  tour: TourStateInfo & TourControls;
  hints: HintsState & HintControls;
  callbacks: {
    setTourCallbacks: (callbacks: TourCallbacks) => void;
    setHintCallbacks: (callbacks: HintCallbacks) => void;
  };
}
