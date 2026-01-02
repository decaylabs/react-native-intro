/**
 * useHints hook - Hint-specific control hook
 *
 * A simplified hook that provides only hint-related functionality.
 * For full control over both tours and hints, use useIntro instead.
 */

import { useCallback, useMemo } from 'react';
import { useIntroContext } from '../context/useIntroContext';
import type { HintPropsConfig } from '../context/IntroContext';
import type {
  HintConfig,
  HintOptions,
  HintCallbacks,
  HintControls,
  HintsState,
} from '../types';

/**
 * Return type for useHints hook
 */
interface UseHintsReturn extends HintsState, HintControls {
  /** Set hint lifecycle callbacks */
  setCallbacks: (callbacks: HintCallbacks) => void;
}

/**
 * Hook for hint-specific control
 *
 * @throws Error if used outside of IntroProvider
 * @returns Hint controls, state, and callback setter
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hints = useHints();
 *
 *   const showHints = () => {
 *     hints.show([
 *       { id: 'hint-1', targetId: 'button-1', content: 'Click here for help!' },
 *       { id: 'hint-2', targetId: 'button-2', content: 'This is another feature!' },
 *     ]);
 *   };
 *
 *   return (
 *     <View>
 *       <Text>Hints visible: {hints.isVisible ? 'Yes' : 'No'}</Text>
 *       <Button onPress={showHints} title="Show Hints" />
 *       <Button onPress={hints.hide} title="Hide Hints" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useHints(): UseHintsReturn {
  const { state, dispatch, measureElement, setHintCallbacks, hintCallbacks } =
    useIntroContext();

  /**
   * Build hint configs from registered HintSpot props
   */
  const buildHintsFromProps = useCallback((): HintConfig[] => {
    const hints: HintConfig[] = [];

    state.registry.hints.forEach((entry, id) => {
      const props = entry.props as HintPropsConfig | undefined;

      // Only include hints with content defined via props
      if (!props?.hint) return;

      hints.push({
        id: `hint-${id}`,
        targetId: id,
        content: props.hint,
        position: props.hintPosition,
        animation: props.hintAnimation,
        type: props.hintType,
        indicatorStyle: props.indicatorStyle,
        tooltipStyle: props.tooltipStyle,
      });
    });

    return hints;
  }, [state.registry.hints]);

  /**
   * Show hints
   *
   * Supports multiple calling patterns:
   * - show() - uses props from HintSpot components
   * - show(options) - uses props with global options
   * - show(hints) - uses explicit hint configs
   * - show(hints, options) - uses explicit hints with options
   */
  const show = useCallback(
    async (
      hintsOrOptions?: HintConfig[] | HintOptions,
      maybeOptions?: HintOptions
    ) => {
      // Detect calling pattern: is first arg hints array or options object?
      let hints: HintConfig[] | undefined;
      let options: HintOptions | undefined;

      if (Array.isArray(hintsOrOptions)) {
        // show(hints) or show(hints, options)
        hints = hintsOrOptions;
        options = maybeOptions;
      } else if (hintsOrOptions && typeof hintsOrOptions === 'object') {
        // show(options) - first arg is options, not hints
        hints = undefined;
        options = hintsOrOptions;
      }
      // else: show() - no args

      // Build hints from props if not provided
      const hintsToUse = hints || buildHintsFromProps();

      if (hintsToUse.length === 0) {
        console.warn(
          '[react-native-intro] No hints found. ' +
            'Either pass hints to show() or define hint props on HintSpot components.'
        );
        return;
      }

      // Start showing hints
      dispatch({ type: 'SHOW_HINTS', hints: hintsToUse, options });

      // Measure all hint targets
      const measurePromises = hintsToUse.map((hint) =>
        measureElement(hint.targetId).catch(() => null)
      );
      await Promise.all(measurePromises);

      // Call onHintsShow callback
      if (hintCallbacks.onHintsShow) {
        hintCallbacks.onHintsShow();
      }
    },
    [dispatch, measureElement, hintCallbacks, buildHintsFromProps]
  );

  // Hide all hints
  const hide = useCallback(() => {
    dispatch({ type: 'HIDE_HINTS' });

    // Call onHintsHide callback
    if (hintCallbacks.onHintsHide) {
      hintCallbacks.onHintsHide();
    }
  }, [dispatch, hintCallbacks]);

  // Show a specific hint's tooltip
  const showHint = useCallback(
    (hintId: string) => {
      dispatch({ type: 'SHOW_HINT', hintId });

      // Call onHintClick callback
      if (hintCallbacks.onHintClick) {
        hintCallbacks.onHintClick(hintId);
      }
    },
    [dispatch, hintCallbacks]
  );

  // Hide a specific hint's tooltip
  const hideHint = useCallback(
    (hintId: string) => {
      dispatch({ type: 'HIDE_HINT', hintId });

      // Call onHintClose callback
      if (hintCallbacks.onHintClose) {
        hintCallbacks.onHintClose(hintId);
      }
    },
    [dispatch, hintCallbacks]
  );

  // Remove a hint entirely
  const removeHint = useCallback(
    (hintId: string) => {
      dispatch({ type: 'REMOVE_HINT', hintId });
    },
    [dispatch]
  );

  // Refresh hint positions
  const refresh = useCallback(async () => {
    const measurePromises = state.hints.items.map((hint) =>
      measureElement(hint.targetId).catch(() => null)
    );
    await Promise.all(measurePromises);
  }, [state.hints.items, measureElement]);

  // Set callbacks
  const setCallbacks = useCallback(
    (callbacks: HintCallbacks) => {
      setHintCallbacks(callbacks);
    },
    [setHintCallbacks]
  );

  // Build return value
  return useMemo(
    () => ({
      // State
      isVisible: state.hints.visible,
      activeHintId: state.hints.activeHintId,
      hints: state.hints.items,

      // Controls
      show,
      hide,
      showHint,
      hideHint,
      removeHint,
      refresh,
      setCallbacks,
    }),
    [
      state.hints.visible,
      state.hints.activeHintId,
      state.hints.items,
      show,
      hide,
      showHint,
      hideHint,
      removeHint,
      refresh,
      setCallbacks,
    ]
  );
}
