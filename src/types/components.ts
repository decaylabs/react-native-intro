/**
 * Component prop types
 */

import type { ReactNode, RefObject } from 'react';
import type { View, ViewStyle, TextStyle } from 'react-native';
import type { Theme, ThemeName } from '../themes/types';
import type { TourOptions, HintOptions } from './options';
import type {
  TooltipPosition,
  HintPosition,
  ElementMeasurement,
} from './positions';
import type { HintType } from './hint';

/**
 * Storage adapter interface for persistence
 * Compatible with AsyncStorage API
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * Props for IntroProvider component
 */
export interface IntroProviderProps {
  children: ReactNode;

  /** Default theme for all tours/hints (default: 'classic') */
  theme?: Theme | ThemeName;

  /** Default tour options */
  defaultTourOptions?: TourOptions;

  /** Default hint options */
  defaultHintOptions?: HintOptions;

  /** Custom storage adapter for persistence */
  storageAdapter?: StorageAdapter;

  /** Disable all persistence */
  disablePersistence?: boolean;
}

/**
 * Props for TourStep wrapper component
 *
 * Supports two usage patterns:
 * 1. Props-based: Define step config via props, then call tour.start()
 * 2. Programmatic: Just use id, pass config to tour.start(steps)
 */
export interface TourStepProps {
  /** Unique ID to reference this step target */
  id: string;

  /** Child element to wrap */
  children: ReactNode;

  /** Step order (1-indexed, lower = earlier) */
  order?: number;

  /** Step content - shown in tooltip body */
  intro?: string | ReactNode;

  /** Step title - shown in tooltip header */
  title?: string;

  /** Tooltip position relative to element */
  position?: TooltipPosition;

  /** Prevent user interaction with highlighted element */
  disableInteraction?: boolean;

  /** Tour group identifier (for multi-tour apps) */
  group?: string;

  /** Hide navigation buttons for this step */
  hideButtons?: boolean;

  /** Custom styles for this step's tooltip container */
  tooltipStyle?: ViewStyle;

  /** Custom styles for this step's tooltip title */
  tooltipTitleStyle?: TextStyle;

  /** Custom styles for this step's tooltip text (only applies to string content) */
  tooltipTextStyle?: TextStyle;
}

/**
 * Props for HintSpot wrapper component
 *
 * Supports two usage patterns:
 * 1. Props-based: Define hint config via props, then call hints.show()
 * 2. Programmatic: Just use id, pass config to hints.show(configs)
 */
export interface HintSpotProps {
  /** Unique ID to reference this hint target */
  id: string;

  /** Child element to wrap */
  children: ReactNode;

  /** Hint content - shown in tooltip when indicator is tapped */
  hint?: string | ReactNode;

  /** Indicator position on the element */
  hintPosition?: HintPosition;

  /** Enable pulsing animation on indicator (default: true) */
  hintAnimation?: boolean;

  /** Hint type for semantic styling (info, warning, error, success) */
  hintType?: HintType;

  /** Custom styles for the hint indicator */
  indicatorStyle?: ViewStyle;

  /** Custom styles for the hint tooltip */
  tooltipStyle?: ViewStyle;
}

/**
 * Internal registry entry for TourStep
 */
export interface StepRegistryEntry {
  ref: RefObject<View>;
  order: number;
  measurement: ElementMeasurement | null;
  /** Props-based step configuration */
  props?: {
    intro?: string | ReactNode;
    title?: string;
    position?: TooltipPosition;
    disableInteraction?: boolean;
    group?: string;
    hideButtons?: boolean;
    tooltipStyle?: ViewStyle;
    tooltipTitleStyle?: TextStyle;
    tooltipTextStyle?: TextStyle;
  };
}

/**
 * Internal registry entry for HintSpot
 */
export interface HintRegistryEntry {
  ref: RefObject<View>;
  order: number;
  measurement: ElementMeasurement | null;
  /** Props-based hint configuration */
  props?: {
    hint?: string | ReactNode;
    hintPosition?: HintPosition;
    hintAnimation?: boolean;
    hintType?: HintType;
    indicatorStyle?: ViewStyle;
    tooltipStyle?: ViewStyle;
  };
}

/**
 * @deprecated Use StepRegistryEntry or HintRegistryEntry instead
 */
export interface RegistryEntry {
  ref: RefObject<View>;
  order: number;
  measurement: ElementMeasurement | null;
}
