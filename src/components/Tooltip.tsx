/**
 * Tooltip - Positioned tooltip displaying step content and navigation
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { logTooltip as log } from '../utils/debug';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  type ViewStyle,
  type LayoutChangeEvent,
} from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import {
  calculateTooltipPosition,
  calculateFloatingPosition,
} from '../utils/positioning';
import {
  getNavigationButtonAccessibilityLabel,
  getTourStepAccessibilityLabel,
  announceTourComplete,
} from '../utils/accessibility';
import { classicTheme } from '../themes/classic';
import { ProgressBar } from './ProgressBar';
import { StepBullets } from './StepBullets';
import type {
  StepConfig,
  StepImageConfig,
  TourOptions,
  Theme,
  ElementMeasurement,
  TooltipPosition,
} from '../types';

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
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });
  const [hasMeasured, setHasMeasured] = useState(false);

  // Use context state for "Don't show again" checkbox (persists across steps)
  const dontShowAgain = state.tour.dontShowAgainChecked;

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  // Reset measurement state when step changes to prevent stale size calculations
  useEffect(() => {
    log('Step changed, resetting measurement state', { stepIndex });
    setHasMeasured(false);
    setTooltipSize({ width: 0, height: 0 });
  }, [stepIndex]);

  // Handle tooltip layout to get actual size
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      log('Layout measured', { width, height, stepIndex });
      setTooltipSize({ width, height });
      setHasMeasured(true);
    },
    [stepIndex]
  );

  // Calculate tooltip position based on actual measured size
  const tooltipPosition = useMemo(() => {
    // Use actual measured size if available, otherwise estimate
    const actualSize = hasMeasured
      ? tooltipSize
      : { width: theme.tooltip.maxWidth, height: 250 }; // Better initial estimate

    log('Calculating position', {
      stepIndex,
      hasMeasured,
      actualSize,
      targetMeasurement,
      preferredPosition: step.position ?? 'auto',
    });

    // Floating tooltip (no target measurement) - center on screen
    if (!targetMeasurement) {
      const result = calculateFloatingPosition(actualSize);
      log('Floating position result', result);
      return result;
    }

    // Normal tooltip - position relative to target
    const preferredPosition: TooltipPosition = step.position ?? 'auto';
    const result = calculateTooltipPosition(
      targetMeasurement,
      actualSize,
      preferredPosition
    );
    log('Position result', result);
    return result;
  }, [
    targetMeasurement,
    step.position,
    theme.tooltip.maxWidth,
    tooltipSize,
    hasMeasured,
    stepIndex,
  ]);

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

      // Announce tour completion for screen readers
      announceTourComplete('completed');

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

    // Announce tour skip for screen readers
    announceTourComplete('skipped');

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
    dispatch({ type: 'SET_DONT_SHOW_AGAIN', checked: !dontShowAgain });
  }, [dispatch, dontShowAgain]);

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

  // Render image component if provided
  const renderImage = (imageConfig: StepImageConfig) => {
    const imageStyle: ViewStyle = {
      width: imageConfig.width ?? '100%',
      height: imageConfig.height ?? 150,
      borderRadius: imageConfig.borderRadius ?? 8,
      overflow: 'hidden',
    };

    return (
      <View style={[styles.imageContainer, imageStyle]}>
        <Image
          source={imageConfig.source}
          style={styles.image}
          resizeMode={imageConfig.resizeMode ?? 'cover'}
          accessibilityLabel={imageConfig.alt}
        />
      </View>
    );
  };

  // Determine image position
  const imagePosition = step.image?.position ?? 'top';

  // Generate accessibility label for the tooltip container
  const tooltipAccessibilityLabel = getTourStepAccessibilityLabel(
    stepIndex,
    totalSteps,
    typeof step.title === 'string' ? step.title : undefined
  );

  return (
    <View
      style={tooltipStyle}
      onLayout={handleLayout}
      accessible={true}
      accessibilityRole="dialog"
      accessibilityLabel={tooltipAccessibilityLabel}
      accessibilityViewIsModal={true}
    >
      {/* Image at top position */}
      {step.image && imagePosition === 'top' && renderImage(step.image)}

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
            // Add margin top if image is above
            step.image && imagePosition === 'top' && styles.titleAfterImage,
            // Per-step title style override
            step.tooltipTitleStyle,
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

      {/* Image at bottom position */}
      {step.image && imagePosition === 'bottom' && renderImage(step.image)}

      {/* Progress indicator */}
      {options.showProgress && (
        <ProgressBar
          currentStep={stepIndex}
          totalSteps={totalSteps}
          theme={theme.progress}
        />
      )}

      {/* Step bullets */}
      {options.showBullets && (
        <StepBullets
          currentStep={stepIndex}
          totalSteps={totalSteps}
          theme={theme.progress}
        />
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
      {options.showButtons && !step.hideButtons && (
        <View
          style={styles.buttonsContainer}
          accessibilityRole="toolbar"
          accessibilityLabel="Tour navigation"
        >
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
              accessibilityLabel={getNavigationButtonAccessibilityLabel(
                'skip',
                stepIndex,
                totalSteps
              )}
              accessibilityHint="Exits the tour without completing all steps"
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
                accessibilityLabel={getNavigationButtonAccessibilityLabel(
                  'prev',
                  stepIndex,
                  totalSteps
                )}
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
              accessibilityLabel={getNavigationButtonAccessibilityLabel(
                isLastStep ? 'done' : 'next',
                stepIndex,
                totalSteps
              )}
              accessibilityHint={
                isLastStep ? 'Completes the tour' : 'Advances to the next step'
              }
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
  imageContainer: {
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginBottom: 8,
  },
  titleAfterImage: {
    marginTop: 4,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    lineHeight: 20,
  },
  dontShowAgainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#999',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 13,
    textAlign: 'center',
  },
  dontShowAgainText: {
    fontSize: 14,
    color: '#555',
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
