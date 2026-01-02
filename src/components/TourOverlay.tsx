/**
 * TourOverlay - Full-screen overlay with spotlight cutout for tour steps
 *
 * Provides a clean step transition pattern:
 * 1. Fade out current spotlight (show full overlay)
 * 2. Scroll to new target element
 * 3. Measure element position
 * 4. Fade in spotlight at new position
 * 5. Show tooltip
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  type ViewStyle,
} from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import { AnimatedTooltip } from './AnimatedTooltip';
import { classicTheme } from '../themes/classic';
import { hasReanimated } from '../utils/optionalDependencies';
import type { ElementMeasurement, Theme } from '../types';

interface TourOverlayProps {
  theme?: Theme;
}

/**
 * Transition states for step changes
 */
type TransitionState = 'idle' | 'fading-out' | 'scrolling' | 'ready';

/**
 * TourOverlay component
 *
 * Renders a full-screen overlay with a spotlight cutout around the current
 * tour step's target element. Also renders the tooltip for the current step.
 */
export function TourOverlay({ theme = classicTheme }: TourOverlayProps) {
  const { state, dispatch, measureElement, scrollToElement, tourCallbacks } =
    useIntroContext();

  const { tour, ui } = state;
  const currentStep = tour.steps[tour.currentStepIndex];

  // Animation settings
  const animateSetting = tour.options.animate ?? 'auto';
  const duration = tour.options.animationDuration ?? 300;
  const reanimatedAvailable = hasReanimated();
  const shouldAnimate =
    animateSetting === 'auto' ? reanimatedAvailable : animateSetting === true;

  // Local transition state for coordinating animations
  const [transitionState, setTransitionState] =
    useState<TransitionState>('idle');
  const [spotlightMeasurement, setSpotlightMeasurement] =
    useState<ElementMeasurement | null>(null);

  // Cache the displayed step to prevent content changing during fade-out
  const [displayedStep, setDisplayedStep] = useState(currentStep);
  const [displayedStepIndex, setDisplayedStepIndex] = useState(
    tour.currentStepIndex
  );

  // Track which step we're currently showing/transitioning to
  const currentStepRef = useRef<number>(-1);

  // Handle step transitions
  useEffect(() => {
    const stepIndex = tour.currentStepIndex;
    const targetId = currentStep?.targetId;

    // Skip if tour isn't active or no target
    if (tour.state !== 'active' || !targetId) {
      return;
    }

    // Skip if we're already on this step
    if (currentStepRef.current === stepIndex) {
      return;
    }

    const isFirstStep = currentStepRef.current === -1;
    currentStepRef.current = stepIndex;

    const performTransition = async () => {
      // Step 1: Fade out (skip for first step)
      // Wait slightly longer than the animation to ensure tooltip is fully hidden
      if (!isFirstStep && shouldAnimate) {
        setTransitionState('fading-out');
        await new Promise((resolve) => setTimeout(resolve, duration / 2 + 50));
      }

      // Step 2: Update displayed step content (after tooltip is fully hidden)
      setDisplayedStep(currentStep);
      setDisplayedStepIndex(stepIndex);

      // Step 3: Scroll to element
      setTransitionState('scrolling');
      if (tour.options.scrollToElement) {
        await scrollToElement(targetId);
      }

      // Step 4: Measure element at final position
      const measurement = await measureElement(targetId);

      // Debug: Log measurement to help diagnose spotlight issues
      if (__DEV__) {
        console.log(`[TourOverlay] Step ${stepIndex} measurement:`, {
          targetId,
          x: measurement?.x,
          y: measurement?.y,
          width: measurement?.width,
          height: measurement?.height,
          measured: measurement?.measured,
        });
      }

      // Step 5: Update spotlight position and fade in
      if (measurement) {
        setSpotlightMeasurement(measurement);
      }
      setTransitionState('ready');

      // Step 6: Show tooltip
      dispatch({ type: 'SHOW_TOOLTIP' });
    };

    performTransition();
  }, [
    tour.currentStepIndex,
    tour.state,
    currentStep,
    tour.options.scrollToElement,
    shouldAnimate,
    duration,
    measureElement,
    scrollToElement,
    dispatch,
  ]);

  // Reset when tour ends
  useEffect(() => {
    if (tour.state !== 'active') {
      currentStepRef.current = -1;
      setTransitionState('idle');
      setSpotlightMeasurement(null);
    }
  }, [tour.state]);

  // Handle overlay tap
  const handleOverlayPress = useCallback(async () => {
    if (!tour.options.exitOnOverlayClick) return;

    // Check onBeforeExit callback
    if (tourCallbacks.onBeforeExit) {
      const shouldExit = await tourCallbacks.onBeforeExit('dismissed');
      if (!shouldExit) return;
    }

    dispatch({ type: 'END_TOUR', reason: 'dismissed' });

    if (tourCallbacks.onComplete && tour.id) {
      tourCallbacks.onComplete(tour.id, 'dismissed');
    }
  }, [tour.options.exitOnOverlayClick, tour.id, tourCallbacks, dispatch]);

  // Overlay fade animation
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isActive = tour.state === 'active' && ui.overlayVisible;

    if (isActive) {
      setIsVisible(true);
      if (shouldAnimate) {
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        overlayOpacity.setValue(1);
      }
    } else {
      if (shouldAnimate) {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(() => setIsVisible(false));
      } else {
        overlayOpacity.setValue(0);
        setIsVisible(false);
      }
    }
  }, [tour.state, ui.overlayVisible, shouldAnimate, overlayOpacity, duration]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Determine if spotlight should be shown (must have valid measurement)
  const showSpotlight =
    transitionState === 'ready' &&
    spotlightMeasurement &&
    spotlightMeasurement.measured &&
    spotlightMeasurement.width > 0 &&
    spotlightMeasurement.height > 0;

  return (
    <Animated.View
      style={[styles.container, { opacity: overlayOpacity }]}
      pointerEvents="box-none"
    >
      {/* Overlay with spotlight */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {showSpotlight ? (
          <SpotlightOverlay
            measurement={spotlightMeasurement}
            overlayColor={theme.overlay.backgroundColor}
            overlayOpacity={
              tour.options.overlayOpacity ?? theme.overlay.opacity
            }
            animate={shouldAnimate}
            duration={duration}
            onOverlayPress={handleOverlayPress}
            disableInteraction={
              displayedStep?.disableInteraction ??
              tour.options.disableInteraction ??
              false
            }
          />
        ) : (
          <TouchableWithoutFeedback onPress={handleOverlayPress}>
            <View
              style={[
                styles.fullOverlay,
                {
                  backgroundColor: theme.overlay.backgroundColor,
                  opacity: tour.options.overlayOpacity ?? theme.overlay.opacity,
                },
              ]}
            />
          </TouchableWithoutFeedback>
        )}
      </View>

      {/* Animated Tooltip - uses cached displayedStep to prevent content flash */}
      {displayedStep && (
        <AnimatedTooltip
          step={displayedStep}
          stepIndex={displayedStepIndex}
          totalSteps={tour.steps.length}
          targetMeasurement={spotlightMeasurement}
          options={tour.options}
          theme={theme}
          visible={ui.tooltipVisible && transitionState === 'ready'}
        />
      )}
    </Animated.View>
  );
}

/**
 * SpotlightOverlay - Renders overlay with spotlight cutout
 *
 * Uses 4 rectangles around the target to create the spotlight effect.
 * Fades in when shown, no position animation (position is set immediately).
 */
function SpotlightOverlay({
  measurement,
  overlayColor,
  overlayOpacity: targetOpacity,
  animate,
  duration,
  onOverlayPress,
  disableInteraction,
}: {
  measurement: ElementMeasurement;
  overlayColor: string;
  overlayOpacity: number;
  animate: boolean;
  duration: number;
  onOverlayPress: () => void;
  disableInteraction: boolean;
}) {
  const { x, y, width, height } = measurement;

  // Add padding around the spotlight
  const padding = 8;
  const spotX = Math.max(0, x - padding);
  const spotY = Math.max(0, y - padding);
  const spotWidth = width + padding * 2;
  const spotHeight = height + padding * 2;
  const spotBottom = spotY + spotHeight;
  const spotRight = spotX + spotWidth;

  // Fade-in animation for the spotlight
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [animate, duration, fadeAnim, measurement]);

  const overlayStyle: ViewStyle = {
    backgroundColor: overlayColor,
    opacity: targetOpacity,
    position: 'absolute',
  };

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      {/* Top rectangle */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <View
          style={[
            overlayStyle,
            {
              top: 0,
              left: 0,
              right: 0,
              height: spotY,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      {/* Bottom rectangle */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <View
          style={[
            overlayStyle,
            {
              top: spotBottom,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      {/* Left rectangle */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <View
          style={[
            overlayStyle,
            {
              top: spotY,
              left: 0,
              width: spotX,
              height: spotHeight,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      {/* Right rectangle */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <View
          style={[
            overlayStyle,
            {
              top: spotY,
              left: spotRight,
              right: 0,
              height: spotHeight,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      {/* Interaction blocker over spotlight - only when disableInteraction is true */}
      {disableInteraction && (
        <View
          style={{
            position: 'absolute',
            top: spotY,
            left: spotX,
            width: spotWidth,
            height: spotHeight,
          }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
