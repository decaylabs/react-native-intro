/**
 * ProgressBar - Visual progress indicator for tour steps
 *
 * Displays a horizontal progress bar showing tour completion percentage
 * along with a text indicator showing current step / total steps.
 *
 * Includes accessibility support for screen readers.
 */

import { View, Text, StyleSheet } from 'react-native';
import { getProgressAccessibilityValue } from '../utils/accessibility';
import type { ProgressStyleConfig } from '../themes/types';

export interface ProgressBarProps {
  /** Current step index (0-based) */
  currentStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** Progress theme styling */
  theme: ProgressStyleConfig;

  /** Whether to show the text indicator (e.g., "3 / 7") */
  showText?: boolean;
}

/**
 * ProgressBar component
 *
 * Shows tour progress as a horizontal bar with optional text indicator.
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   currentStep={2}
 *   totalSteps={5}
 *   theme={theme.progress}
 * />
 * ```
 */
export function ProgressBar({
  currentStep,
  totalSteps,
  theme,
  showText = true,
}: ProgressBarProps) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const accessibilityValue = getProgressAccessibilityValue(
    currentStep,
    totalSteps
  );

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel="Tour progress"
      accessibilityValue={{
        min: accessibilityValue.min,
        max: accessibilityValue.max,
        now: accessibilityValue.now,
        text: accessibilityValue.text,
      }}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.barBackgroundColor,
            height: theme.barHeight,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.barFillColor,
              width: `${progressPercent}%`,
            },
          ]}
        />
      </View>
      {showText && (
        <Text style={styles.text} importantForAccessibility="no">
          {currentStep + 1} / {totalSteps}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
});
