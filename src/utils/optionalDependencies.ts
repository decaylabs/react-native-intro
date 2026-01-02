/**
 * Optional dependency detection
 *
 * Detects presence of optional peer dependencies at runtime
 * and provides fallbacks when they're not available.
 */

/**
 * Reanimated module type (subset of what we use)
 */
interface ReanimatedModule {
  useSharedValue: <T>(value: T) => { value: T };
  useAnimatedStyle: <T extends object>(
    updater: () => T,
    dependencies?: unknown[]
  ) => T;
  withTiming: <T>(
    value: T,
    config?: { duration?: number; easing?: unknown }
  ) => T;
  withSpring: <T>(value: T, config?: object) => T;
  Easing: {
    linear: unknown;
    ease: unknown;
    quad: unknown;
    cubic: unknown;
    inOut: (easing: unknown) => unknown;
  };
  ReduceMotion: {
    System: unknown;
    Always: unknown;
    Never: unknown;
  };
  runOnJS: <T extends (...args: unknown[]) => unknown>(fn: T) => T;
}

/**
 * AsyncStorage module type
 */
interface AsyncStorageModule {
  default: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
}

/**
 * Optional dependencies holder
 */
interface OptionalDeps {
  Reanimated: ReanimatedModule | null;
  AsyncStorage: AsyncStorageModule['default'] | null;
}

const deps: OptionalDeps = {
  Reanimated: null,
  AsyncStorage: null,
};

let reanimatedChecked = false;
let asyncStorageChecked = false;

/**
 * Check for react-native-reanimated
 */
function checkReanimated(): ReanimatedModule | null {
  if (reanimatedChecked) {
    return deps.Reanimated;
  }
  reanimatedChecked = true;

  try {
    deps.Reanimated = require('react-native-reanimated');
  } catch {
    if (__DEV__) {
      console.warn(
        '[react-native-intro] react-native-reanimated not found. ' +
          'Animations will use the fallback Animated API. ' +
          'Install react-native-reanimated for better performance.'
      );
    }
  }

  return deps.Reanimated;
}

/**
 * Check for @react-native-async-storage/async-storage
 */
function checkAsyncStorage(): AsyncStorageModule['default'] | null {
  if (asyncStorageChecked) {
    return deps.AsyncStorage;
  }
  asyncStorageChecked = true;

  try {
    const module =
      require('@react-native-async-storage/async-storage') as AsyncStorageModule;
    deps.AsyncStorage = module.default;
  } catch {
    if (__DEV__) {
      console.warn(
        '[react-native-intro] @react-native-async-storage/async-storage not found. ' +
          '"Don\'t show again" persistence will be disabled. ' +
          'Install async-storage to enable persistence.'
      );
    }
  }

  return deps.AsyncStorage;
}

/**
 * Get Reanimated module if available
 */
export function getReanimated(): ReanimatedModule | null {
  return checkReanimated();
}

/**
 * Get AsyncStorage module if available
 */
export function getAsyncStorage(): AsyncStorageModule['default'] | null {
  return checkAsyncStorage();
}

/**
 * Check if Reanimated is available
 */
export function hasReanimated(): boolean {
  return checkReanimated() !== null;
}

/**
 * Check if AsyncStorage is available
 */
export function hasAsyncStorage(): boolean {
  return checkAsyncStorage() !== null;
}

/**
 * Reset checks (for testing purposes)
 */
export function resetDependencyChecks(): void {
  reanimatedChecked = false;
  asyncStorageChecked = false;
  deps.Reanimated = null;
  deps.AsyncStorage = null;
}
