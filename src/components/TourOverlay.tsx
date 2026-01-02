/**
 * TourOverlay - Full-screen overlay with spotlight cutout for tour steps
 */

import { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  type ViewStyle,
} from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import { Tooltip } from './Tooltip';
import { classicTheme } from '../themes/classic';
import type { ElementMeasurement, Theme } from '../types';

interface TourOverlayProps {
  theme?: Theme;
}

/**
 * TourOverlay component
 *
 * Renders a full-screen overlay with a spotlight cutout around the current
 * tour step's target element. Also renders the tooltip for the current step.
 */
export function TourOverlay({ theme = classicTheme }: TourOverlayProps) {
  const { state, dispatch, measureElement, tourCallbacks } = useIntroContext();

  const { tour, ui, measurements } = state;
  const currentStep = tour.steps[tour.currentStepIndex];

  // Get measurement for current step's target
  const targetMeasurement: ElementMeasurement | null = currentStep?.targetId
    ? measurements.get(currentStep.targetId) ?? null
    : null;

  // Measure current step target when step changes
  useEffect(() => {
    if (currentStep?.targetId && tour.state === 'active') {
      measureElement(currentStep.targetId);
    }
  }, [currentStep?.targetId, tour.state, measureElement]);

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

  // Don't render if tour is not active or overlay is not visible
  if (tour.state !== 'active' || !ui.overlayVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Overlay with spotlight */}
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.overlayContainer}>
          {targetMeasurement && targetMeasurement.measured ? (
            <SpotlightOverlay
              measurement={targetMeasurement}
              overlayColor={theme.overlay.backgroundColor}
              overlayOpacity={
                tour.options.overlayOpacity ?? theme.overlay.opacity
              }
            />
          ) : (
            <View
              style={[
                styles.fullOverlay,
                {
                  backgroundColor: theme.overlay.backgroundColor,
                  opacity: tour.options.overlayOpacity ?? theme.overlay.opacity,
                },
              ]}
            />
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Tooltip */}
      {ui.tooltipVisible && currentStep && (
        <Tooltip
          step={currentStep}
          stepIndex={tour.currentStepIndex}
          totalSteps={tour.steps.length}
          targetMeasurement={targetMeasurement}
          options={tour.options}
          theme={theme}
        />
      )}
    </View>
  );
}

/**
 * SpotlightOverlay - Renders overlay with a transparent cutout
 *
 * Uses 4 rectangles around the target to create the spotlight effect.
 * This is more performant than using SVG paths on React Native.
 */
function SpotlightOverlay({
  measurement,
  overlayColor,
  overlayOpacity,
}: {
  measurement: ElementMeasurement;
  overlayColor: string;
  overlayOpacity: number;
}) {
  const { x, y, width, height } = measurement;

  // Add padding around the spotlight
  const padding = 8;
  const spotX = Math.max(0, x - padding);
  const spotY = Math.max(0, y - padding);
  const spotWidth = width + padding * 2;
  const spotHeight = height + padding * 2;

  const overlayStyle: ViewStyle = {
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
    position: 'absolute',
  };

  return (
    <>
      {/* Top rectangle */}
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
      {/* Bottom rectangle */}
      <View
        style={[
          overlayStyle,
          {
            top: spotY + spotHeight,
            left: 0,
            right: 0,
            bottom: 0,
          },
        ]}
      />
      {/* Left rectangle */}
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
      {/* Right rectangle */}
      <View
        style={[
          overlayStyle,
          {
            top: spotY,
            left: spotX + spotWidth,
            right: 0,
            height: spotHeight,
          },
        ]}
      />
    </>
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
