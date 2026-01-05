/**
 * HintBubble - Pulsing hint indicator with tooltip
 *
 * Displays a pulsing indicator that, when tapped, reveals a tooltip.
 * Supports tap-outside-to-dismiss behavior.
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  getHintAccessibilityHint,
  announceHintRevealed,
} from '../utils/accessibility';
import { useReduceMotion } from '../hooks/useReduceMotion';
import type {
  HintConfig,
  Theme,
  ElementMeasurement,
  HintPosition,
} from '../types';

interface HintBubbleProps {
  /** Hint configuration */
  hint: HintConfig;

  /** Target element measurement */
  measurement: ElementMeasurement | null;

  /** Whether this hint's tooltip is active/open */
  isActive: boolean;

  /** Whether pulsing animation is enabled */
  animate?: boolean;

  /** Theme for styling */
  theme: Theme;

  /** Close on tap outside tooltip (default: true) */
  closeOnOutsideClick?: boolean;

  /** Called when indicator is tapped */
  onPress: () => void;

  /** Called when tooltip should close */
  onClose: () => void;
}

/**
 * Calculate indicator position based on HintPosition and measurement
 */
function calculateIndicatorPosition(
  measurement: ElementMeasurement,
  position: HintPosition = 'top-right',
  indicatorSize: number
): { left: number; top: number } {
  const { x, y, width, height } = measurement;
  const halfIndicator = indicatorSize / 2;

  // Parse position string
  const [vertical, horizontal] = position.split('-') as [
    'top' | 'middle' | 'bottom',
    'left' | 'center' | 'right',
  ];

  let left: number;
  let top: number;

  // Calculate horizontal position
  switch (horizontal) {
    case 'left':
      left = x - halfIndicator;
      break;
    case 'center':
      left = x + width / 2 - halfIndicator;
      break;
    case 'right':
    default:
      left = x + width - halfIndicator;
      break;
  }

  // Calculate vertical position
  switch (vertical) {
    case 'top':
      top = y - halfIndicator;
      break;
    case 'middle':
      top = y + height / 2 - halfIndicator;
      break;
    case 'bottom':
    default:
      top = y + height - halfIndicator;
      break;
  }

  return { left, top };
}

/**
 * Calculate tooltip position relative to indicator
 */
function calculateTooltipPosition(
  indicatorPosition: { left: number; top: number },
  indicatorSize: number,
  tooltipWidth: number = 200,
  tooltipHeight: number = 100
): { left: number; top: number } {
  const screen = Dimensions.get('window');
  const padding = 10;

  // Default: position tooltip to the right and below indicator
  let left = indicatorPosition.left + indicatorSize + padding;
  let top = indicatorPosition.top;

  // Adjust if tooltip would go off right edge
  if (left + tooltipWidth > screen.width - padding) {
    left = indicatorPosition.left - tooltipWidth - padding;
  }

  // Adjust if tooltip would go off left edge
  if (left < padding) {
    left = padding;
  }

  // Adjust if tooltip would go off bottom edge
  if (top + tooltipHeight > screen.height - padding) {
    top = screen.height - tooltipHeight - padding;
  }

  // Adjust if tooltip would go off top edge
  if (top < padding) {
    top = padding;
  }

  return { left, top };
}

/**
 * HintBubble component
 */
export function HintBubble({
  hint,
  measurement,
  isActive,
  animate = true,
  theme,
  closeOnOutsideClick = true,
  onPress,
  onClose,
}: HintBubbleProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Detect user's reduce motion preference
  const reduceMotion = useReduceMotion();

  // Respect reduce motion preference
  const shouldAnimate = animate && !reduceMotion;

  // Pulsing animation
  useEffect(() => {
    if (!shouldAnimate || isActive) {
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
  }, [pulseAnim, shouldAnimate, isActive]);

  // Fade in/out animation for tooltip
  useEffect(() => {
    // Use instant transition if reduce motion is enabled
    const animationDuration = reduceMotion ? 0 : 200;

    Animated.timing(opacityAnim, {
      toValue: isActive ? 1 : 0,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();

    // Announce hint content when revealed
    if (isActive && typeof hint.content === 'string') {
      announceHintRevealed(hint.content);
    }
  }, [opacityAnim, isActive, reduceMotion, hint.content]);

  const handleBackdropPress = useCallback(() => {
    if (closeOnOutsideClick) {
      onClose();
    }
  }, [closeOnOutsideClick, onClose]);

  // Don't render if no measurement
  if (!measurement || !measurement.measured) {
    return null;
  }

  const indicatorSize = theme.hint.size;
  const indicatorPosition = calculateIndicatorPosition(
    measurement,
    hint.position,
    indicatorSize
  );

  const styles = createStyles(theme, indicatorSize, indicatorPosition);

  return (
    <>
      {/* Indicator (pulsing dot) */}
      <TouchableOpacity
        style={styles.indicatorContainer}
        onPress={onPress}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={
          typeof hint.content === 'string'
            ? `Hint available: ${hint.content.substring(0, 50)}${hint.content.length > 50 ? '...' : ''}`
            : 'Hint available'
        }
        accessibilityRole="button"
        accessibilityHint={getHintAccessibilityHint(
          typeof hint.content === 'string' ? hint.content : undefined
        )}
        accessibilityState={{ expanded: isActive }}
      >
        {/* Pulse effect (behind indicator) */}
        {shouldAnimate && !isActive && (
          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
          />
        )}

        {/* Main indicator */}
        <View style={[styles.indicator, hint.indicatorStyle]} />
      </TouchableOpacity>

      {/* Tooltip Modal */}
      <Modal
        visible={isActive}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
        accessibilityViewIsModal={true}
      >
        {/* Backdrop for tap-outside-to-dismiss */}
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          accessibilityLabel="Dismiss hint"
          accessibilityRole="button"
        >
          <Animated.View
            style={[
              styles.tooltipContainer,
              {
                left: calculateTooltipPosition(indicatorPosition, indicatorSize)
                  .left,
                top: calculateTooltipPosition(indicatorPosition, indicatorSize)
                  .top,
                opacity: opacityAnim,
              },
              hint.tooltipStyle,
            ]}
            accessible={true}
            accessibilityRole="alert"
            accessibilityLabel={
              typeof hint.content === 'string'
                ? `Hint: ${hint.content}`
                : 'Hint tooltip'
            }
            accessibilityLiveRegion="polite"
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
 * Create styles based on theme
 */
function createStyles(
  theme: Theme,
  indicatorSize: number,
  indicatorPosition: { left: number; top: number }
) {
  return StyleSheet.create({
    indicatorContainer: {
      position: 'absolute',
      left: indicatorPosition.left,
      top: indicatorPosition.top,
      width: indicatorSize,
      height: indicatorSize,
      zIndex: 9999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pulseRing: {
      position: 'absolute',
      width: indicatorSize,
      height: indicatorSize,
      borderRadius: theme.hint.borderRadius,
      backgroundColor: theme.hint.pulseColor,
    },
    indicator: {
      width: indicatorSize,
      height: indicatorSize,
      borderRadius: theme.hint.borderRadius,
      backgroundColor: theme.hint.backgroundColor,
      borderWidth: theme.hint.borderWidth,
      borderColor: theme.hint.borderColor,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    tooltipContainer: {
      position: 'absolute',
      maxWidth: theme.tooltip.maxWidth,
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
}

/**
 * Alias for HintBubble for backwards compatibility
 * @deprecated Use HintBubble instead
 */
export const HintIndicator = HintBubble;
