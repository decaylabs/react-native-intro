/**
 * HintsOverlay - Renders all active hint bubbles
 *
 * This component is rendered by IntroProvider and displays
 * HintBubble components for all visible hints.
 */

import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import { HintBubble } from './HintBubble';
import type { Theme } from '../types';

interface HintsOverlayProps {
  theme: Theme;
}

/**
 * HintsOverlay component
 *
 * Renders hint bubbles for all registered hints when hints are visible.
 */
export function HintsOverlay({ theme }: HintsOverlayProps) {
  const { state, dispatch, hintCallbacks } = useIntroContext();

  const handleHintPress = useCallback(
    (hintId: string) => {
      // Toggle: if already active, hide it; otherwise show it
      if (state.hints.activeHintId === hintId) {
        dispatch({ type: 'HIDE_HINT', hintId });
        if (hintCallbacks.onHintClose) {
          hintCallbacks.onHintClose(hintId);
        }
      } else {
        dispatch({ type: 'SHOW_HINT', hintId });
        if (hintCallbacks.onHintClick) {
          hintCallbacks.onHintClick(hintId);
        }
      }
    },
    [state.hints.activeHintId, dispatch, hintCallbacks]
  );

  const handleHintClose = useCallback(
    (hintId: string) => {
      dispatch({ type: 'HIDE_HINT', hintId });
      if (hintCallbacks.onHintClose) {
        hintCallbacks.onHintClose(hintId);
      }
    },
    [dispatch, hintCallbacks]
  );

  // Don't render if hints aren't visible
  if (!state.hints.visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {state.hints.items.map((hint) => {
        const measurement = state.measurements.get(hint.targetId);

        return (
          <HintBubble
            key={hint.id}
            hint={hint}
            measurement={measurement ?? null}
            isActive={state.hints.activeHintId === hint.id}
            animate={state.hints.options.animation}
            theme={theme}
            closeOnOutsideClick={state.hints.options.closeOnOutsideClick}
            onPress={() => handleHintPress(hint.id)}
            onClose={() => handleHintClose(hint.id)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
});
