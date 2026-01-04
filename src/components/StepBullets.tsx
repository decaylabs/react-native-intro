/**
 * StepBullets - Step indicator dots for tour navigation
 *
 * Displays a row of bullet indicators showing current position
 * in the tour sequence. Active step is highlighted.
 */

import { View, StyleSheet, TouchableOpacity } from 'react-native';
import type { ProgressStyleConfig } from '../themes/types';

export interface StepBulletsProps {
  /** Current step index (0-based) */
  currentStep: number;

  /** Total number of steps */
  totalSteps: number;

  /** Progress theme styling */
  theme: ProgressStyleConfig;

  /** Optional callback when a bullet is pressed (for navigation) */
  onBulletPress?: (stepIndex: number) => void;
}

/**
 * StepBullets component
 *
 * Shows tour progress as a row of bullet dots. The active step
 * is highlighted with a different color.
 *
 * @example
 * ```tsx
 * <StepBullets
 *   currentStep={2}
 *   totalSteps={5}
 *   theme={theme.progress}
 *   onBulletPress={(index) => tour.goTo(index)}
 * />
 * ```
 */
export function StepBullets({
  currentStep,
  totalSteps,
  theme,
  onBulletPress,
}: StepBulletsProps) {
  const bullets = Array.from({ length: totalSteps }, (_, index) => {
    const isActive = index === currentStep;
    const bulletStyle = {
      backgroundColor: isActive ? theme.bulletActiveColor : theme.bulletColor,
      width: theme.bulletSize,
      height: theme.bulletSize,
      borderRadius: theme.bulletSize / 2,
    };

    if (onBulletPress) {
      return (
        <TouchableOpacity
          key={index}
          style={[styles.bullet, bulletStyle]}
          onPress={() => onBulletPress(index)}
          accessibilityRole="button"
          accessibilityLabel={`Go to step ${index + 1}`}
          accessibilityState={{ selected: isActive }}
        />
      );
    }

    return (
      <View
        key={index}
        style={[styles.bullet, bulletStyle]}
        accessibilityRole="image"
        accessibilityLabel={
          isActive
            ? `Step ${index + 1} of ${totalSteps}, current`
            : `Step ${index + 1} of ${totalSteps}`
        }
      />
    );
  });

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {bullets}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bullet: {
    marginHorizontal: 4,
  },
});
