/**
 * TourOverlay - Full-screen overlay with spotlight cutout for tour steps
 *
 * Animation sequence (matching intro.js):
 * 1. Tooltip disappears
 * 2. Page scrolls to new target (if needed)
 * 3. Spotlight morphs to new target position/size
 * 4. Tooltip appears
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
import {
  announceStepChange,
  announceTourComplete,
} from '../utils/accessibility';
import { useReduceMotion } from '../hooks/useReduceMotion';
import type { ElementMeasurement, Theme } from '../types';

interface TourOverlayProps {
  theme?: Theme;
}

/**
 * Transition states for step changes
 */
type TransitionState =
  | 'idle'
  | 'hiding-tooltip'
  | 'scrolling'
  | 'morphing'
  | 'ready';

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

  // Detect user's reduce motion preference
  const reduceMotion = useReduceMotion();

  // Animation settings - respect reduce motion preference
  const animateSetting = tour.options.animate ?? 'auto';
  const duration = reduceMotion ? 0 : (tour.options.animationDuration ?? 300);
  const reanimatedAvailable = hasReanimated();

  // Disable animations if reduce motion is enabled
  const shouldAnimate = reduceMotion
    ? false
    : animateSetting === 'auto'
      ? reanimatedAvailable
      : animateSetting === true;

  // Local transition state for coordinating animations
  const [transitionState, setTransitionState] =
    useState<TransitionState>('idle');

  // Spotlight measurement - this is what the spotlight animates TO
  const [spotlightMeasurement, setSpotlightMeasurement] =
    useState<ElementMeasurement | null>(null);

  // Cache the displayed step to prevent content changing during transitions
  const [displayedStep, setDisplayedStep] = useState(currentStep);
  const [displayedStepIndex, setDisplayedStepIndex] = useState(
    tour.currentStepIndex
  );

  // Track which step we're currently showing/transitioning to
  const currentStepRef = useRef<number>(-1);

  // Callback to signal morph animation is complete
  const onMorphComplete = useCallback(() => {
    setTransitionState('ready');
    dispatch({ type: 'SHOW_TOOLTIP' });
  }, [dispatch]);

  // Handle step transitions
  useEffect(() => {
    const stepIndex = tour.currentStepIndex;
    const targetId = currentStep?.targetId;

    // Skip if tour isn't active
    if (tour.state !== 'active') {
      return;
    }

    // Skip if we're already on this step
    if (currentStepRef.current === stepIndex) {
      return;
    }

    const isFirstStep = currentStepRef.current === -1;
    currentStepRef.current = stepIndex;

    // Check if this is a floating tooltip (no target element)
    const isFloating = !targetId;

    const performTransition = async () => {
      // Step 1: Hide tooltip (keep spotlight visible)
      if (!isFirstStep) {
        setTransitionState('hiding-tooltip');
        dispatch({ type: 'HIDE_TOOLTIP' });
        // Wait for tooltip to fade out
        if (shouldAnimate) {
          await new Promise((resolve) => setTimeout(resolve, duration / 2));
        }
      }

      // For floating tooltips, skip scroll and measurement
      if (isFloating) {
        // Update displayed step content
        setDisplayedStep(currentStep);
        setDisplayedStepIndex(stepIndex);

        // Announce step change for screen readers
        announceStepChange(
          stepIndex,
          tour.steps.length,
          typeof currentStep?.title === 'string'
            ? currentStep.title
            : undefined,
          typeof currentStep?.content === 'string'
            ? currentStep.content
            : undefined
        );

        // Clear spotlight for floating tooltip
        setTransitionState('morphing');
        setSpotlightMeasurement(null);

        // Complete immediately (no morph animation for floating)
        onMorphComplete();
        return;
      }

      // Step 2: Scroll to element (if needed)
      setTransitionState('scrolling');
      if (tour.options.scrollToElement !== false) {
        await scrollToElement(targetId);
      }

      // Step 3: Measure element at final position
      const measurement = await measureElement(targetId);

      // Update displayed step content
      setDisplayedStep(currentStep);
      setDisplayedStepIndex(stepIndex);

      // Announce step change for screen readers
      announceStepChange(
        stepIndex,
        tour.steps.length,
        typeof currentStep?.title === 'string' ? currentStep.title : undefined,
        typeof currentStep?.content === 'string'
          ? currentStep.content
          : undefined
      );

      // Step 4: Start morph animation to new position
      if (measurement) {
        setTransitionState('morphing');
        setSpotlightMeasurement(measurement);

        // For first step or no animation, complete immediately
        if (isFirstStep || !shouldAnimate) {
          onMorphComplete();
        }
        // Otherwise, onMorphComplete will be called by SpotlightOverlay
      }
    };

    performTransition();
  }, [
    tour.currentStepIndex,
    tour.state,
    tour.steps.length,
    currentStep,
    tour.options.scrollToElement,
    shouldAnimate,
    duration,
    measureElement,
    scrollToElement,
    dispatch,
    onMorphComplete,
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

    // Announce tour dismissal for screen readers
    announceTourComplete('dismissed');

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

  // Determine if spotlight should be shown
  const showSpotlight =
    spotlightMeasurement &&
    spotlightMeasurement.measured &&
    spotlightMeasurement.width > 0 &&
    spotlightMeasurement.height > 0;

  // Show tooltip only when ready (after morph animation completes)
  const showTooltip = ui.tooltipVisible && transitionState === 'ready';

  return (
    <Animated.View
      style={[styles.container, { opacity: overlayOpacity }]}
      pointerEvents="box-none"
    >
      {/* Overlay with spotlight */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {showSpotlight ? (
          <SpotlightOverlay
            // Key forces fresh component instance for each step, ensuring
            // isFirstRender is reset when transitioning from floating steps
            key={`spotlight-${tour.currentStepIndex}`}
            measurement={spotlightMeasurement}
            overlayColor={theme.overlay.backgroundColor}
            overlayOpacity={
              tour.options.overlayOpacity ?? theme.overlay.opacity
            }
            animate={shouldAnimate}
            duration={duration}
            onOverlayPress={handleOverlayPress}
            onMorphComplete={onMorphComplete}
            isMorphing={transitionState === 'morphing'}
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

      {/* Animated Tooltip */}
      {displayedStep && (
        <AnimatedTooltip
          step={displayedStep}
          stepIndex={displayedStepIndex}
          totalSteps={tour.steps.length}
          targetMeasurement={spotlightMeasurement}
          options={tour.options}
          theme={theme}
          visible={showTooltip}
        />
      )}
    </Animated.View>
  );
}

/**
 * SpotlightOverlay - Renders overlay with spotlight cutout
 *
 * Uses 4 rectangles around the target to create the spotlight effect.
 * Animates position and size when measurement changes (morph effect).
 */
function SpotlightOverlay({
  measurement,
  overlayColor,
  overlayOpacity: targetOpacity,
  animate,
  duration,
  onOverlayPress,
  onMorphComplete,
  isMorphing,
  disableInteraction,
}: {
  measurement: ElementMeasurement;
  overlayColor: string;
  overlayOpacity: number;
  animate: boolean;
  duration: number;
  onOverlayPress: () => void;
  onMorphComplete: () => void;
  isMorphing: boolean;
  disableInteraction: boolean;
}) {
  const padding = 8;

  // Animated values for spotlight position/size
  const animX = useRef(new Animated.Value(0)).current;
  const animY = useRef(new Animated.Value(0)).current;
  const animWidth = useRef(new Animated.Value(0)).current;
  const animHeight = useRef(new Animated.Value(0)).current;

  // Track if this is the first render (no animation needed)
  const isFirstRender = useRef(true);

  // Update animated values when measurement changes
  useEffect(() => {
    const targetX = Math.max(0, measurement.x - padding);
    const targetY = Math.max(0, measurement.y - padding);
    const targetWidth = measurement.width + padding * 2;
    const targetHeight = measurement.height + padding * 2;

    if (isFirstRender.current || !animate) {
      // First render or no animation - set values immediately
      animX.setValue(targetX);
      animY.setValue(targetY);
      animWidth.setValue(targetWidth);
      animHeight.setValue(targetHeight);
      isFirstRender.current = false;

      if (isMorphing) {
        onMorphComplete();
      }
    } else {
      // Animate to new position/size
      Animated.parallel([
        Animated.timing(animX, {
          toValue: targetX,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // Can't use native driver for layout props
        }),
        Animated.timing(animY, {
          toValue: targetY,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animWidth, {
          toValue: targetWidth,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animHeight, {
          toValue: targetHeight,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (isMorphing) {
          onMorphComplete();
        }
      });
    }
  }, [
    measurement,
    animate,
    duration,
    animX,
    animY,
    animWidth,
    animHeight,
    isMorphing,
    onMorphComplete,
  ]);

  const overlayStyle: ViewStyle = {
    backgroundColor: overlayColor,
    opacity: targetOpacity,
    position: 'absolute',
  };

  // Calculate animated bottom and right edges
  const animBottom = Animated.add(animY, animHeight);
  const animRight = Animated.add(animX, animWidth);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Top rectangle - from top of screen to top of spotlight */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <Animated.View
          style={[
            overlayStyle,
            {
              top: 0,
              left: 0,
              right: 0,
              height: animY,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Bottom rectangle - from bottom of spotlight to bottom of screen */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <Animated.View
          style={[
            overlayStyle,
            {
              top: animBottom,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Left rectangle - left side of spotlight row */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <Animated.View
          style={[
            overlayStyle,
            {
              top: animY,
              left: 0,
              width: animX,
              height: animHeight,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Right rectangle - right side of spotlight row */}
      <TouchableWithoutFeedback onPress={onOverlayPress}>
        <Animated.View
          style={[
            overlayStyle,
            {
              top: animY,
              left: animRight,
              right: 0,
              height: animHeight,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Interaction blocker over spotlight - only when disableInteraction is true */}
      {disableInteraction && (
        <Animated.View
          style={{
            position: 'absolute',
            top: animY,
            left: animX,
            width: animWidth,
            height: animHeight,
          }}
        />
      )}
    </View>
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
