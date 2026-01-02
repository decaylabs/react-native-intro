/**
 * Component prop types
 */

import type { ReactNode, RefObject } from 'react';
import type { View } from 'react-native';
import type { Theme, ThemeName } from '../themes/types';
import type { TourOptions, HintOptions } from './options';
import type { ElementMeasurement } from './positions';

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
 */
export interface TourStepProps {
  /** Unique ID to reference this step target */
  id: string;

  /** Child element to wrap */
  children: ReactNode;

  /** Step order (lower = earlier, default: registration order) */
  order?: number;
}

/**
 * Props for HintSpot wrapper component
 */
export interface HintSpotProps {
  /** Unique ID to reference this hint target */
  id: string;

  /** Child element to wrap */
  children: ReactNode;
}

/**
 * Internal registry entry
 */
export interface RegistryEntry {
  ref: RefObject<View>;
  order: number;
  measurement: ElementMeasurement | null;
}
