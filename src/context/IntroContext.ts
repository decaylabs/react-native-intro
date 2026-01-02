/**
 * IntroContext - Core context for tour and hint state management
 */

import { createContext, type RefObject, type ReactNode } from 'react';
import type { View, ViewStyle, TextStyle } from 'react-native';
import type {
  TourState,
  StepConfig,
  HintConfig,
  TourOptions,
  HintOptions,
  ElementMeasurement,
  TourCallbacks,
  HintCallbacks,
  TooltipPosition,
  HintPosition,
  HintType,
} from '../types';

/**
 * ScrollView-like interface for scroll registration
 * Using a minimal interface to support both RN ScrollView and FlatList
 */
export interface ScrollableRef {
  scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void;
}

/**
 * Props-based configuration for tour steps
 */
export interface StepPropsConfig {
  intro?: string | ReactNode;
  title?: string;
  position?: TooltipPosition;
  disableInteraction?: boolean;
  group?: string;
  tooltipStyle?: ViewStyle;
  tooltipTextStyle?: TextStyle;
}

/**
 * Props-based configuration for hints
 */
export interface HintPropsConfig {
  hint?: string | ReactNode;
  hintPosition?: HintPosition;
  hintAnimation?: boolean;
  hintType?: HintType;
  indicatorStyle?: ViewStyle;
  tooltipStyle?: ViewStyle;
}

/**
 * Registry entry for a registered element
 */
export interface RegistryEntry {
  ref: RefObject<View | null>;
  order: number;
  /** Props-based configuration (for TourStep or HintSpot) */
  props?: StepPropsConfig | HintPropsConfig;
}

/**
 * Internal state shape for the intro library
 */
export interface IntroState {
  // Tour state
  tour: {
    state: TourState;
    id: string | null;
    currentStepIndex: number;
    steps: StepConfig[];
    options: TourOptions;
  };

  // Hints state
  hints: {
    visible: boolean;
    items: HintConfig[];
    activeHintId: string | null;
    options: HintOptions;
  };

  // Element registry
  registry: {
    steps: Map<string, RegistryEntry>;
    hints: Map<string, RegistryEntry>;
  };

  // Element measurements
  measurements: Map<string, ElementMeasurement>;

  // UI state
  ui: {
    tooltipVisible: boolean;
    isTransitioning: boolean;
    overlayVisible: boolean;
  };

  // Persistence state
  persistence: {
    dismissedTours: Set<string>;
    initialized: boolean;
  };
}

/**
 * Default tour options
 */
export const defaultTourOptions: TourOptions = {
  showProgress: true,
  showBullets: true,
  showButtons: true,
  exitOnOverlayClick: false,
  dontShowAgain: false,
  disableInteraction: false,
  scrollToElement: true,
  scrollPadding: 50,
  overlayOpacity: 0.75,
  animate: 'auto',
  animationDuration: 300,
};

/**
 * Default hint options
 */
export const defaultHintOptions: HintOptions = {
  autoShow: false,
  animation: true,
  closeOnOutsideClick: true,
  indicatorSize: 20,
};

/**
 * Initial state for the intro context
 */
export const initialIntroState: IntroState = {
  tour: {
    state: 'idle',
    id: null,
    currentStepIndex: 0,
    steps: [],
    options: defaultTourOptions,
  },
  hints: {
    visible: false,
    items: [],
    activeHintId: null,
    options: defaultHintOptions,
  },
  registry: {
    steps: new Map(),
    hints: new Map(),
  },
  measurements: new Map(),
  ui: {
    tooltipVisible: false,
    isTransitioning: false,
    overlayVisible: false,
  },
  persistence: {
    dismissedTours: new Set(),
    initialized: false,
  },
};

/**
 * Context value interface
 */
export interface IntroContextValue {
  state: IntroState;
  dispatch: React.Dispatch<IntroAction>;

  // Registry methods
  registerStep: (
    id: string,
    ref: RefObject<View | null>,
    order?: number,
    props?: StepPropsConfig
  ) => void;
  unregisterStep: (id: string) => void;
  registerHint: (
    id: string,
    ref: RefObject<View | null>,
    props?: HintPropsConfig
  ) => void;
  unregisterHint: (id: string) => void;

  // Measurement methods
  measureElement: (id: string) => Promise<ElementMeasurement | null>;
  measureAllSteps: () => Promise<void>;

  // Scroll methods
  registerScrollView: (ref: RefObject<ScrollableRef | null>) => void;
  unregisterScrollView: () => void;
  scrollToElement: (id: string) => Promise<void>;

  // Callbacks
  tourCallbacks: TourCallbacks;
  setTourCallbacks: (callbacks: TourCallbacks) => void;
  hintCallbacks: HintCallbacks;
  setHintCallbacks: (callbacks: HintCallbacks) => void;
}

/**
 * Action types for the reducer
 */
export type IntroAction =
  // Tour actions
  | {
      type: 'START_TOUR';
      tourId: string;
      steps: StepConfig[];
      options?: TourOptions;
    }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; stepIndex: number }
  | { type: 'END_TOUR'; reason: 'completed' | 'skipped' | 'dismissed' }
  | { type: 'SET_TRANSITIONING'; isTransitioning: boolean }
  | { type: 'SHOW_TOOLTIP' }
  // Hint actions
  | { type: 'SHOW_HINTS'; hints: HintConfig[]; options?: HintOptions }
  | { type: 'HIDE_HINTS' }
  | { type: 'SHOW_HINT'; hintId: string }
  | { type: 'HIDE_HINT'; hintId: string }
  | { type: 'REMOVE_HINT'; hintId: string }
  // Measurement actions
  | { type: 'UPDATE_MEASUREMENT'; id: string; measurement: ElementMeasurement }
  | { type: 'CLEAR_MEASUREMENTS' }
  // Persistence actions
  | { type: 'DISMISS_TOUR_PERMANENTLY'; tourId: string }
  | { type: 'CLEAR_DISMISSED_TOUR'; tourId: string }
  | { type: 'LOAD_PERSISTED_STATE'; dismissedTours: string[] }
  | { type: 'SET_PERSISTENCE_INITIALIZED' };

/**
 * The IntroContext
 */
export const IntroContext = createContext<IntroContextValue | null>(null);

IntroContext.displayName = 'IntroContext';
