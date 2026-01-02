/**
 * IntroProvider - Context provider for tour and hint functionality
 */

import {
  useReducer,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type RefObject,
} from 'react';
import type { View } from 'react-native';
import {
  IntroContext,
  initialIntroState,
  type IntroContextValue,
  type RegistryEntry,
} from '../context/IntroContext';
import { introReducer } from '../context/reducer';
import { measureElement } from '../hooks/useMeasure';
import {
  createStorageAdapter,
  loadPersistedData,
  savePersistedData,
} from '../utils/storage';
import { classicTheme } from '../themes/classic';
import type {
  IntroProviderProps,
  TourCallbacks,
  HintCallbacks,
  ElementMeasurement,
} from '../types';

/**
 * IntroProvider component
 *
 * Wraps your app to provide tour and hint functionality.
 *
 * @example
 * ```tsx
 * <IntroProvider>
 *   <App />
 * </IntroProvider>
 * ```
 */
export function IntroProvider({
  children,
  theme: _theme = 'classic',
  defaultTourOptions: _defaultTourOptions,
  defaultHintOptions: _defaultHintOptions,
  storageAdapter: customStorageAdapter,
  disablePersistence = false,
}: IntroProviderProps) {
  // State management
  const [state, dispatch] = useReducer(introReducer, initialIntroState);

  // Callbacks refs
  const tourCallbacksRef = useRef<TourCallbacks>({});
  const hintCallbacksRef = useRef<HintCallbacks>({});

  // Storage adapter
  const storageAdapter = useMemo(
    () =>
      disablePersistence ? null : createStorageAdapter(customStorageAdapter),
    [customStorageAdapter, disablePersistence]
  );

  // Load persisted state on mount
  useEffect(() => {
    if (!storageAdapter) {
      dispatch({ type: 'SET_PERSISTENCE_INITIALIZED' });
      return;
    }

    loadPersistedData(storageAdapter).then((data) => {
      if (data) {
        dispatch({
          type: 'LOAD_PERSISTED_STATE',
          dismissedTours: data.dismissedTours,
        });
      } else {
        dispatch({ type: 'SET_PERSISTENCE_INITIALIZED' });
      }
    });
  }, [storageAdapter]);

  // Save persisted state when dismissed tours change
  useEffect(() => {
    if (!storageAdapter || !state.persistence.initialized) return;

    savePersistedData(storageAdapter, state.persistence.dismissedTours);
  }, [
    storageAdapter,
    state.persistence.dismissedTours,
    state.persistence.initialized,
  ]);

  // Registry methods
  const registerStep = useCallback(
    (id: string, ref: RefObject<View | null>, order: number = 0) => {
      state.registry.steps.set(id, { ref, order });
    },
    [state.registry.steps]
  );

  const unregisterStep = useCallback(
    (id: string) => {
      state.registry.steps.delete(id);
    },
    [state.registry.steps]
  );

  const registerHint = useCallback(
    (id: string, ref: RefObject<View | null>) => {
      state.registry.hints.set(id, { ref, order: 0 });
    },
    [state.registry.hints]
  );

  const unregisterHint = useCallback(
    (id: string) => {
      state.registry.hints.delete(id);
    },
    [state.registry.hints]
  );

  // Measurement methods
  const measureElementById = useCallback(
    async (id: string): Promise<ElementMeasurement | null> => {
      const stepEntry = state.registry.steps.get(id);
      const hintEntry = state.registry.hints.get(id);
      const entry: RegistryEntry | undefined = stepEntry || hintEntry;

      if (!entry) return null;

      try {
        const measurement = await measureElement(entry.ref);
        dispatch({ type: 'UPDATE_MEASUREMENT', id, measurement });
        return measurement;
      } catch {
        return null;
      }
    },
    [state.registry.steps, state.registry.hints]
  );

  const measureAllSteps = useCallback(async () => {
    const measurePromises: Promise<void>[] = [];

    state.registry.steps.forEach((entry, id) => {
      measurePromises.push(
        measureElement(entry.ref)
          .then((measurement) => {
            dispatch({ type: 'UPDATE_MEASUREMENT', id, measurement });
          })
          .catch(() => {
            // Skip unmeasurable elements
          })
      );
    });

    await Promise.all(measurePromises);
  }, [state.registry.steps]);

  // Callback setters
  const setTourCallbacks = useCallback((callbacks: TourCallbacks) => {
    tourCallbacksRef.current = callbacks;
  }, []);

  const setHintCallbacks = useCallback((callbacks: HintCallbacks) => {
    hintCallbacksRef.current = callbacks;
  }, []);

  // Context value
  const contextValue: IntroContextValue = useMemo(
    () => ({
      state,
      dispatch,
      registerStep,
      unregisterStep,
      registerHint,
      unregisterHint,
      measureElement: measureElementById,
      measureAllSteps,
      tourCallbacks: tourCallbacksRef.current,
      setTourCallbacks,
      hintCallbacks: hintCallbacksRef.current,
      setHintCallbacks,
    }),
    [
      state,
      registerStep,
      unregisterStep,
      registerHint,
      unregisterHint,
      measureElementById,
      measureAllSteps,
      setTourCallbacks,
      setHintCallbacks,
    ]
  );

  return (
    <IntroContext.Provider value={contextValue}>
      {children}
    </IntroContext.Provider>
  );
}

// Re-export theme for consumers
export { classicTheme };
