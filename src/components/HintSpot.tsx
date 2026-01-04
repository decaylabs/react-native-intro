/**
 * HintSpot - Wrapper component to register elements as hint targets
 *
 * Renders hint indicators directly within itself so they scroll with content.
 */

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import { measureElement } from '../hooks/useMeasure';
import type {
  HintSpotProps,
  HintConfig,
  HintPosition,
  HintType,
} from '../types';
import type { Theme } from '../themes/types';

/**
 * Get position styles for indicator placement
 */
function getIndicatorPositionStyle(
  position: HintPosition = 'top-right',
  size: number
) {
  const halfSize = size / 2;
  const [vertical, horizontal] = position.split('-') as [
    'top' | 'middle' | 'bottom',
    'left' | 'center' | 'right',
  ];

  const style: {
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    marginTop?: number;
    marginLeft?: number;
  } = {};

  // Vertical positioning
  switch (vertical) {
    case 'top':
      style.top = -halfSize;
      break;
    case 'middle':
      style.top = '50%';
      style.marginTop = -halfSize;
      break;
    case 'bottom':
      style.bottom = -halfSize;
      break;
  }

  // Horizontal positioning
  switch (horizontal) {
    case 'left':
      style.left = -halfSize;
      break;
    case 'center':
      style.left = '50%';
      style.marginLeft = -halfSize;
      break;
    case 'right':
      style.right = -halfSize;
      break;
  }

  return style;
}

/**
 * Get colors based on hint type
 */
function getTypeColors(theme: Theme, type?: HintType) {
  if (!type || type === 'default') {
    return {
      backgroundColor: theme.hint.backgroundColor,
      pulseColor: theme.hint.pulseColor,
      icon: null,
    };
  }
  return theme.hint.types[type];
}

interface HintIndicatorProps {
  hint: HintConfig;
  theme: Theme;
  animate: boolean;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
}

/**
 * Internal indicator component with animation
 */
function HintIndicatorInternal({
  hint,
  theme,
  animate,
  isActive,
  onPress,
  onClose,
}: HintIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const indicatorRef = useRef<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const typeColors = getTypeColors(theme, hint.type);
  const indicatorSize = theme.hint.size;
  const positionStyle = getIndicatorPositionStyle(hint.position, indicatorSize);
  const screen = Dimensions.get('window');

  // Measure indicator position when activated
  useEffect(() => {
    if (isActive && indicatorRef.current) {
      measureElement(indicatorRef).then((measurement) => {
        const tooltipWidth = Math.min(
          theme.tooltip.maxWidth,
          screen.width - 40
        );
        const tooltipHeight = 80; // Approximate height
        const padding = 12;

        // Position tooltip below indicator by default
        let top = measurement.y + measurement.height + padding;
        let left = measurement.x - tooltipWidth / 2 + measurement.width / 2;

        // If tooltip would go off bottom, position above
        if (top + tooltipHeight > screen.height - 100) {
          top = measurement.y - tooltipHeight - padding;
        }

        // Keep tooltip within horizontal bounds
        if (left < padding) {
          left = padding;
        } else if (left + tooltipWidth > screen.width - padding) {
          left = screen.width - tooltipWidth - padding;
        }

        setTooltipPosition({ top, left });
      });
    }
  }, [isActive, theme.tooltip.maxWidth, screen.width, screen.height]);

  // Pulsing animation
  useEffect(() => {
    if (!animate || isActive) {
      pulseAnim.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [pulseAnim, animate, isActive]);

  // Fade animation for tooltip
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim, isActive]);

  const handleBackdropPress = useCallback(() => {
    onClose();
  }, [onClose]);

  const styles = StyleSheet.create({
    indicatorContainer: {
      position: 'absolute',
      ...positionStyle,
      width: indicatorSize,
      height: indicatorSize,
      zIndex: 9999,
    },
    touchableArea: {
      width: indicatorSize,
      height: indicatorSize,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pulseRing: {
      position: 'absolute',
      width: indicatorSize,
      height: indicatorSize,
      borderRadius: theme.hint.borderRadius,
      backgroundColor: typeColors.pulseColor,
    },
    indicator: {
      width: indicatorSize,
      height: indicatorSize,
      borderRadius: theme.hint.borderRadius,
      backgroundColor: typeColors.backgroundColor,
      borderWidth: theme.hint.borderWidth,
      borderColor: theme.hint.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconText: {
      fontSize: indicatorSize * 0.45,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    tooltipContainer: {
      position: 'absolute',
      width: Math.min(theme.tooltip.maxWidth, screen.width - 40),
      backgroundColor: theme.tooltip.backgroundColor,
      borderRadius: theme.tooltip.borderRadius,
      padding: theme.tooltip.padding,
      shadowColor: theme.tooltip.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.tooltip.shadowOpacity,
      shadowRadius: theme.tooltip.shadowRadius,
      elevation: 5,
    },
    tooltipText: {
      color: theme.tooltip.contentColor,
      fontSize: theme.tooltip.contentFontSize,
    },
  });

  // Render icon based on type
  const renderIcon = () => {
    if (!typeColors.icon) return null;

    // Use text-based icons for simplicity
    const iconMap: Record<string, string> = {
      'ℹ️': 'i',
      '⚠️': '!',
      '❌': '×',
      '✓': '✓',
    };

    const iconChar = iconMap[typeColors.icon] || '';
    if (!iconChar) return null;

    return <Text style={styles.iconText}>{iconChar}</Text>;
  };

  return (
    <>
      <View
        ref={indicatorRef}
        style={[styles.indicatorContainer, hint.indicatorStyle]}
        collapsable={false}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={`Hint: ${typeof hint.content === 'string' ? hint.content : 'Tap for more info'}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to show hint tooltip"
          style={styles.touchableArea}
        >
          {/* Pulse effect */}
          {animate && !isActive && (
            <Animated.View
              style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
            />
          )}

          {/* Main indicator */}
          <View style={styles.indicator}>{renderIcon()}</View>
        </TouchableOpacity>
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={isActive}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          <Animated.View
            style={[
              styles.tooltipContainer,
              {
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                opacity: opacityAnim,
              },
              hint.tooltipStyle,
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {typeof hint.content === 'string' ? (
                <Text style={styles.tooltipText}>{hint.content}</Text>
              ) : (
                hint.content
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

/**
 * HintSpot wrapper component
 *
 * Wraps a child element to register it as a target for hints.
 * Supports two usage patterns:
 *
 * 1. Props-based: Define hint content via props, then call hints.show()
 * 2. Programmatic: Just use id, pass config to hints.show(configs)
 *
 * @example
 * ```tsx
 * // Props-based (recommended)
 * <HintSpot id="profile-photo" hint="Tap to change photo" hintPosition="bottom-right">
 *   <Image source={profilePic} style={styles.avatar} />
 * </HintSpot>
 *
 * // Then show hints:
 * hints.show(); // Uses props from registered HintSpots
 *
 * // Programmatic (legacy)
 * <HintSpot id="profile-photo">
 *   <Image source={profilePic} style={styles.avatar} />
 * </HintSpot>
 * hints.show([{ id: 'hint-1', targetId: 'profile-photo', content: '...' }]);
 * ```
 */
export function HintSpot({
  id,
  children,
  hint,
  hintPosition,
  hintAnimation,
  hintType,
  indicatorStyle,
  tooltipStyle,
}: HintSpotProps) {
  const viewRef = useRef<any>(null);
  const {
    state,
    dispatch,
    registerHint,
    unregisterHint,
    hintCallbacks,
    theme,
  } = useIntroContext();

  // Build props config object (only include defined values)
  const propsConfig = useMemo(() => {
    const config: Record<string, unknown> = {};
    if (hint !== undefined) config.hint = hint;
    if (hintPosition !== undefined) config.hintPosition = hintPosition;
    if (hintAnimation !== undefined) config.hintAnimation = hintAnimation;
    if (hintType !== undefined) config.hintType = hintType;
    if (indicatorStyle !== undefined) config.indicatorStyle = indicatorStyle;
    if (tooltipStyle !== undefined) config.tooltipStyle = tooltipStyle;
    return Object.keys(config).length > 0 ? config : undefined;
  }, [
    hint,
    hintPosition,
    hintAnimation,
    hintType,
    indicatorStyle,
    tooltipStyle,
  ]);

  // Register on mount, unregister on unmount
  useEffect(() => {
    registerHint(id, viewRef, propsConfig);

    return () => {
      unregisterHint(id);
    };
  }, [id, propsConfig, registerHint, unregisterHint]);

  // Find hint config for this spot
  const hintConfig = state.hints.visible
    ? state.hints.items.find((h) => h.targetId === id)
    : null;

  const isActive = state.hints.activeHintId === hintConfig?.id;

  // Determine if animation is enabled
  // Per-hint animation overrides global option
  const animationEnabled =
    hintConfig?.animation ?? state.hints.options.animation ?? true;

  const handlePress = useCallback(() => {
    if (!hintConfig) return;

    if (isActive) {
      dispatch({ type: 'HIDE_HINT', hintId: hintConfig.id });
      if (hintCallbacks.onHintClose) {
        hintCallbacks.onHintClose(hintConfig.id);
      }
    } else {
      dispatch({ type: 'SHOW_HINT', hintId: hintConfig.id });
      if (hintCallbacks.onHintClick) {
        hintCallbacks.onHintClick(hintConfig.id);
      }
    }
  }, [hintConfig, isActive, dispatch, hintCallbacks]);

  const handleClose = useCallback(() => {
    if (!hintConfig) return;
    dispatch({ type: 'HIDE_HINT', hintId: hintConfig.id });
    if (hintCallbacks.onHintClose) {
      hintCallbacks.onHintClose(hintConfig.id);
    }
  }, [hintConfig, dispatch, hintCallbacks]);

  return (
    <View ref={viewRef} collapsable={false} style={{ position: 'relative' }}>
      {children}
      {hintConfig && (
        <HintIndicatorInternal
          hint={hintConfig}
          theme={theme}
          animate={animationEnabled}
          isActive={isActive}
          onPress={handlePress}
          onClose={handleClose}
        />
      )}
    </View>
  );
}

/**
 * Alias for HintSpot for backwards compatibility
 * @deprecated Use HintSpot instead
 */
export const HintSpotRef = HintSpot;
