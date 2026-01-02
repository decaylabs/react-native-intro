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
import { View, Dimensions } from 'react-native';
import {
  IntroContext,
  initialIntroState,
  type IntroContextValue,
  type RegistryEntry,
  type ScrollableRef,
  type StepPropsConfig,
  type HintPropsConfig,
} from '../context/IntroContext';
import { introReducer } from '../context/reducer';
import { measureElement } from '../hooks/useMeasure';
import {
  createStorageAdapter,
  loadPersistedData,
  savePersistedData,
} from '../utils/storage';
import { TourOverlay } from './TourOverlay';
import { classicTheme, modernTheme, darkTheme, resolveTheme } from '../themes';
import type {
  IntroProviderProps,
  TourCallbacks,
  HintCallbacks,
  ElementMeasurement,
  Theme,
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
  theme = 'classic',
  defaultTourOptions: _defaultTourOptions,
  defaultHintOptions: _defaultHintOptions,
  storageAdapter: customStorageAdapter,
  disablePersistence = false,
}: IntroProviderProps) {
  // Resolve theme
  const resolvedTheme: Theme = useMemo(() => resolveTheme(theme), [theme]);

  // State management
  const [state, dispatch] = useReducer(introReducer, initialIntroState);

  // Callbacks refs
  const tourCallbacksRef = useRef<TourCallbacks>({});
  const hintCallbacksRef = useRef<HintCallbacks>({});

  // ScrollView ref for auto-scrolling
  const scrollViewRef = useRef<RefObject<ScrollableRef | null> | null>(null);

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
    (
      id: string,
      ref: RefObject<View | null>,
      order: number = 0,
      props?: StepPropsConfig
    ) => {
      state.registry.steps.set(id, { ref, order, props });
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
    (id: string, ref: RefObject<View | null>, props?: HintPropsConfig) => {
      state.registry.hints.set(id, { ref, order: 0, props });
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

  // Scroll methods
  const registerScrollView = useCallback(
    (ref: RefObject<ScrollableRef | null>) => {
      scrollViewRef.current = ref;
    },
    []
  );

  const unregisterScrollView = useCallback(() => {
    scrollViewRef.current = null;
  }, []);

  const scrollToElementById = useCallback(
    async (id: string): Promise<void> => {
      const scrollRef = scrollViewRef.current;
      if (!scrollRef?.current) return;

      const stepEntry = state.registry.steps.get(id);
      if (!stepEntry?.ref.current) return;

      const screenHeight = Dimensions.get('window').height;
      const scrollPadding = state.tour.options.scrollPadding ?? 50;

      try {
        // Measure the element
        const measurement = await measureElement(stepEntry.ref);

        // Check if element is within visible screen bounds
        const isAboveScreen = measurement.y < scrollPadding;
        const isBelowScreen =
          measurement.y + measurement.height > screenHeight - scrollPadding;

        if (isAboveScreen || isBelowScreen) {
          // Calculate the target scroll position to center the element
          // We need to estimate based on current element position
          scrollRef.current.scrollTo({
            y: Math.max(
              0,
              measurement.y - screenHeight / 2 + measurement.height / 2
            ),
            animated: true,
          });

          // Wait for scroll animation to complete, then re-measure
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      } catch {
        // Ignore scroll errors
      }
    },
    [state.registry.steps, state.tour.options.scrollPadding]
  );

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
      registerScrollView,
      unregisterScrollView,
      scrollToElement: scrollToElementById,
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
      registerScrollView,
      unregisterScrollView,
      scrollToElementById,
      setTourCallbacks,
      setHintCallbacks,
    ]
  );

  return (
    <IntroContext.Provider value={contextValue}>
      <View style={{ flex: 1 }}>
        {children}
        <TourOverlay theme={resolvedTheme} />
      </View>
    </IntroContext.Provider>
  );
}

// Re-export themes for consumers
export { classicTheme, modernTheme, darkTheme };
