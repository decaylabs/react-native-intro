/**
 * AnimatedTooltip - Tooltip with animation support
 *
 * Uses React Native's Animated API for smooth animations.
 * Automatically animates in/out based on visibility.
 */

import { useEffect, useRef, useState } from 'react';
import { logAnimatedTooltip as log } from '../utils/debug';
import { Animated, Easing } from 'react-native';
import { Tooltip } from './Tooltip';
import { hasReanimated } from '../utils/optionalDependencies';
import type {
  StepConfig,
  TourOptions,
  Theme,
  ElementMeasurement,
} from '../types';

interface AnimatedTooltipProps {
  step: StepConfig;
  stepIndex: number;
  totalSteps: number;
  targetMeasurement: ElementMeasurement | null;
  options: TourOptions;
  theme: Theme;
  visible: boolean;
}

/**
 * Wrapper component that adds animations to the Tooltip
 */
export function AnimatedTooltip({ visible, ...props }: AnimatedTooltipProps) {
  const { options, stepIndex, targetMeasurement } = props;
  const animateSetting = options.animate ?? 'auto';
  const duration = options.animationDuration ?? 300;

  log('AnimatedTooltip render', {
    visible,
    stepIndex,
    targetMeasurement,
    animateSetting,
  });

  // Determine animation mode
  const reanimatedAvailable = hasReanimated();
  const shouldAnimate =
    animateSetting === 'auto' ? reanimatedAvailable : animateSetting === true;

  // If no animation, just show/hide
  if (!shouldAnimate) {
    log('No animation, direct render', { visible });
    if (!visible) return null;
    return <Tooltip {...props} />;
  }

  // Use the Animated API for animations
  return (
    <FallbackAnimatedTooltip visible={visible} duration={duration} {...props} />
  );
}

/**
 * Tooltip with React Native Animated
 */
function FallbackAnimatedTooltip({
  visible,
  duration,
  ...props
}: AnimatedTooltipProps & { duration: number }) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(visible ? 1 : 0.9)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : 10)).current;

  const [shouldRender, setShouldRender] = useState(visible);

  // Track the target visibility to prevent race conditions
  const targetVisibleRef = useRef(visible);

  useEffect(() => {
    // Update the target visibility
    targetVisibleRef.current = visible;
    log('Visibility effect triggered', { visible, shouldRender });

    if (visible) {
      log('Starting show animation');
      setShouldRender(true);
      // Stop any ongoing animations
      opacity.stopAnimation();
      scale.stopAnimation();
      translateY.stopAnimation();

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        log('Show animation complete');
      });
    } else {
      log('Starting hide animation');
      // Stop any ongoing animations
      opacity.stopAnimation();
      scale.stopAnimation();
      translateY.stopAnimation();

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        log('Hide animation complete', {
          targetVisibleRef: targetVisibleRef.current,
        });
        // Only hide if visibility hasn't changed back to true
        if (!targetVisibleRef.current) {
          setShouldRender(false);
        }
      });
    }
  }, [visible, opacity, scale, translateY, duration, shouldRender]);

  if (!shouldRender) return null;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ scale }, { translateY }],
      }}
    >
      <Tooltip {...props} />
    </Animated.View>
  );
}
