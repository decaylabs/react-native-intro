/**
 * Tooltip - Positioned tooltip displaying step content and navigation
 */

import { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  type ViewStyle,
} from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import { calculateTooltipPosition } from '../utils/positioning';
import { classicTheme } from '../themes/classic';
import type {
  StepConfig,
  TourOptions,
  Theme,
  ElementMeasurement,
  TooltipPosition,
} from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TooltipProps {
  step: StepConfig;
  stepIndex: number;
  totalSteps: number;
  targetMeasurement: ElementMeasurement | null;
  options: TourOptions;
  theme?: Theme;
}

/**
 * Tooltip component
 *
 * Displays the content for the current tour step with navigation buttons.
 */
export function Tooltip({
  step,
  stepIndex,
  totalSteps,
  targetMeasurement,
  options,
  theme = classicTheme,
}: TooltipProps) {
  const { dispatch, tourCallbacks, state } = useIntroContext();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  // Calculate tooltip position
  const tooltipPosition = useMemo(() => {
    const preferredPosition: TooltipPosition = step.position ?? 'auto';

    // Use default measurement if null (for floating tooltips)
    const measurement: ElementMeasurement = targetMeasurement ?? {
      x: SCREEN_WIDTH / 2 - theme.tooltip.maxWidth / 2,
      y: SCREEN_HEIGHT / 2 - 100,
      width: 0,
      height: 0,
      measured: false,
      timestamp: Date.now(),
    };

    return calculateTooltipPosition(
      measurement,
      { width: theme.tooltip.maxWidth, height: 200 }, // Estimated tooltip size
      preferredPosition
    );
  }, [targetMeasurement, step.position, theme.tooltip.maxWidth]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    const callbacks = tourCallbacks;

    if (isLastStep) {
      // Handle tour completion
      if (callbacks.onBeforeExit) {
        const shouldExit = await callbacks.onBeforeExit('completed');
        if (!shouldExit) return;
      }

      // Handle "Don't show again"
      if (dontShowAgain && options.dontShowAgain && state.tour.id) {
        dispatch({ type: 'DISMISS_TOUR_PERMANENTLY', tourId: state.tour.id });
      }

      dispatch({ type: 'END_TOUR', reason: 'completed' });

      if (callbacks.onComplete && state.tour.id) {
        callbacks.onComplete(state.tour.id, 'completed');
      }
      return;
    }

    // Go to next step
    if (callbacks.onBeforeChange) {
      const shouldChange = await callbacks.onBeforeChange(
        stepIndex,
        stepIndex + 1,
        'next'
      );
      if (!shouldChange) return;
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
    dispatch({ type: 'NEXT_STEP' });

    if (callbacks.onChange) {
      callbacks.onChange(stepIndex + 1, stepIndex);
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
  }, [
    isLastStep,
    stepIndex,
    tourCallbacks,
    dontShowAgain,
    options.dontShowAgain,
    state.tour.id,
    dispatch,
  ]);

  const handlePrev = useCallback(async () => {
    if (isFirstStep) return;

    const callbacks = tourCallbacks;

    if (callbacks.onBeforeChange) {
      const shouldChange = await callbacks.onBeforeChange(
        stepIndex,
        stepIndex - 1,
        'prev'
      );
      if (!shouldChange) return;
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: true });
    dispatch({ type: 'PREV_STEP' });

    if (callbacks.onChange) {
      callbacks.onChange(stepIndex - 1, stepIndex);
    }

    dispatch({ type: 'SET_TRANSITIONING', isTransitioning: false });
  }, [isFirstStep, stepIndex, tourCallbacks, dispatch]);

  const handleSkip = useCallback(async () => {
    const callbacks = tourCallbacks;

    if (callbacks.onBeforeExit) {
      const shouldExit = await callbacks.onBeforeExit('skipped');
      if (!shouldExit) return;
    }

    // Handle "Don't show again"
    if (dontShowAgain && options.dontShowAgain && state.tour.id) {
      dispatch({ type: 'DISMISS_TOUR_PERMANENTLY', tourId: state.tour.id });
    }

    dispatch({ type: 'END_TOUR', reason: 'skipped' });

    if (callbacks.onComplete && state.tour.id) {
      callbacks.onComplete(state.tour.id, 'skipped');
    }
  }, [
    tourCallbacks,
    dontShowAgain,
    options.dontShowAgain,
    state.tour.id,
    dispatch,
  ]);

  const handleDontShowAgainToggle = useCallback(() => {
    setDontShowAgain((prev) => !prev);
  }, []);

  // Get button labels
  const labels = {
    next: options.buttonLabels?.next ?? 'Next',
    prev: options.buttonLabels?.prev ?? 'Back',
    done: options.buttonLabels?.done ?? 'Done',
    skip: options.buttonLabels?.skip ?? 'Skip',
    dontShowAgain: options.buttonLabels?.dontShowAgain ?? "Don't show again",
  };

  // Build tooltip styles
  const tooltipStyle: ViewStyle = {
    position: 'absolute',
    left: tooltipPosition.x,
    top: tooltipPosition.y,
    maxWidth: theme.tooltip.maxWidth,
    backgroundColor: theme.tooltip.backgroundColor,
    borderRadius: theme.tooltip.borderRadius,
    padding: theme.tooltip.padding,
    shadowColor: theme.tooltip.shadowColor,
    shadowOpacity: theme.tooltip.shadowOpacity,
    shadowRadius: theme.tooltip.shadowRadius,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    ...step.tooltipStyle,
    ...options.tooltipStyle,
  };

  return (
    <View style={tooltipStyle}>
      {/* Title */}
      {step.title && (
        <Text
          style={[
            styles.title,
            {
              color: theme.tooltip.titleColor,
              fontSize: theme.tooltip.titleFontSize,
              fontWeight: theme.tooltip.titleFontWeight,
            },
          ]}
        >
          {step.title}
        </Text>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        {typeof step.content === 'string' ? (
          <Text
            style={[
              styles.content,
              {
                color: theme.tooltip.contentColor,
                fontSize: theme.tooltip.contentFontSize,
              },
              step.tooltipTextStyle,
            ]}
          >
            {step.content}
          </Text>
        ) : (
          step.content
        )}
      </View>

      {/* Progress indicator */}
      {options.showProgress && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.progress.barBackgroundColor },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.progress.barFillColor,
                  width: `${((stepIndex + 1) / totalSteps) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {stepIndex + 1} / {totalSteps}
          </Text>
        </View>
      )}

      {/* Step bullets */}
      {options.showBullets && (
        <View style={styles.bulletsContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.bullet,
                {
                  backgroundColor:
                    index === stepIndex
                      ? theme.progress.bulletActiveColor
                      : theme.progress.bulletColor,
                  width: theme.progress.bulletSize,
                  height: theme.progress.bulletSize,
                  borderRadius: theme.progress.bulletSize / 2,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Don't show again checkbox */}
      {options.dontShowAgain && (
        <TouchableOpacity
          style={styles.dontShowAgainContainer}
          onPress={handleDontShowAgainToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: dontShowAgain }}
          accessibilityLabel={labels.dontShowAgain}
        >
          <View
            style={[
              styles.checkbox,
              dontShowAgain && styles.checkboxChecked,
              dontShowAgain && {
                backgroundColor: theme.buttons.primary.backgroundColor,
              },
            ]}
          >
            {dontShowAgain && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.dontShowAgainText}>{labels.dontShowAgain}</Text>
        </TouchableOpacity>
      )}

      {/* Navigation buttons */}
      {options.showButtons && (
        <View style={styles.buttonsContainer}>
          {/* Skip button (always visible except on last step) */}
          {!isLastStep && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.buttons.secondary.backgroundColor,
                  borderRadius: theme.buttons.secondary.borderRadius,
                  paddingVertical: theme.buttons.secondary.paddingVertical,
                  paddingHorizontal: theme.buttons.secondary.paddingHorizontal,
                },
              ]}
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel={labels.skip}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.buttons.secondary.textColor,
                    fontSize: theme.buttons.secondary.fontSize,
                  },
                ]}
              >
                {labels.skip}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.navButtons}>
            {/* Prev button */}
            {!isFirstStep && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.buttons.secondary.backgroundColor,
                    borderRadius: theme.buttons.secondary.borderRadius,
                    paddingVertical: theme.buttons.secondary.paddingVertical,
                    paddingHorizontal:
                      theme.buttons.secondary.paddingHorizontal,
                  },
                ]}
                onPress={handlePrev}
                accessibilityRole="button"
                accessibilityLabel={labels.prev}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: theme.buttons.secondary.textColor,
                      fontSize: theme.buttons.secondary.fontSize,
                    },
                  ]}
                >
                  {labels.prev}
                </Text>
              </TouchableOpacity>
            )}

            {/* Next/Done button */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                {
                  backgroundColor: theme.buttons.primary.backgroundColor,
                  borderRadius: theme.buttons.primary.borderRadius,
                  paddingVertical: theme.buttons.primary.paddingVertical,
                  paddingHorizontal: theme.buttons.primary.paddingHorizontal,
                },
              ]}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={isLastStep ? labels.done : labels.next}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.buttons.primary.textColor,
                    fontSize: theme.buttons.primary.fontSize,
                  },
                ]}
              >
                {isLastStep ? labels.done : labels.next}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  bulletsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bullet: {
    marginHorizontal: 4,
  },
  dontShowAgainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: 'transparent',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dontShowAgainText: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    minWidth: 60,
    alignItems: 'center',
  },
  primaryButton: {},
  secondaryButton: {},
  buttonText: {
    fontWeight: '600',
  },
});
