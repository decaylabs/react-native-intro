/**
 * Accessibility utilities for react-native-intro
 *
 * Provides helpers for screen reader announcements, reduced motion detection,
 * and accessibility labeling for tour and hint components.
 */

import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Announce a message to screen readers.
 *
 * Uses AccessibilityInfo.announceForAccessibility on iOS/Android.
 * On web, this is a no-op as web uses ARIA live regions.
 *
 * @param message - The message to announce
 * @param options - Optional configuration
 * @param options.priority - 'polite' (default) or 'assertive' for urgent announcements
 */
export function announceForAccessibility(
  message: string,
  _options?: { priority?: 'polite' | 'assertive' }
): void {
  // On web, we don't use this - ARIA live regions handle announcements
  if (Platform.OS === 'web') {
    return;
  }

  // iOS and Android both support announceForAccessibility
  // Note: React Native doesn't distinguish between polite/assertive natively
  // The _options parameter is for future extensibility
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Announce a tour step change to screen readers.
 *
 * Formats a message like "Step 2 of 5: Welcome to the app"
 *
 * @param stepIndex - Current step index (0-based)
 * @param totalSteps - Total number of steps
 * @param title - Optional step title
 * @param content - Optional step content (will be truncated if too long)
 */
export function announceStepChange(
  stepIndex: number,
  totalSteps: number,
  title?: string,
  content?: string
): void {
  const stepNumber = stepIndex + 1;
  let message = `Step ${stepNumber} of ${totalSteps}`;

  if (title) {
    message += `: ${title}`;
  } else if (content && typeof content === 'string') {
    // Truncate long content for announcements
    const maxLength = 100;
    const truncatedContent =
      content.length > maxLength
        ? `${content.substring(0, maxLength)}...`
        : content;
    message += `: ${truncatedContent}`;
  }

  announceForAccessibility(message);
}

/**
 * Announce tour completion to screen readers.
 *
 * @param reason - Why the tour ended ('completed', 'skipped', 'dismissed')
 */
export function announceTourComplete(
  reason: 'completed' | 'skipped' | 'dismissed'
): void {
  const messages = {
    completed: 'Tour completed',
    skipped: 'Tour skipped',
    dismissed: 'Tour dismissed',
  };

  announceForAccessibility(messages[reason]);
}

/**
 * Announce hint reveal to screen readers.
 *
 * @param content - The hint content
 */
export function announceHintRevealed(content: string): void {
  announceForAccessibility(`Hint: ${content}`);
}

/**
 * Check if reduce motion is enabled on the device.
 *
 * Returns a promise that resolves to true if the user has enabled
 * reduce motion in their device accessibility settings.
 *
 * @returns Promise<boolean> - Whether reduce motion is enabled
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    // If we can't detect, default to false (enable animations)
    return false;
  }
}

/**
 * Add a listener for reduce motion preference changes.
 *
 * @param callback - Function called when reduce motion setting changes
 * @returns Cleanup function to remove the listener
 */
export function addReduceMotionListener(
  callback: (enabled: boolean) => void
): () => void {
  const subscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    callback
  );

  return () => {
    subscription.remove();
  };
}

/**
 * Check if a screen reader is currently active.
 *
 * @returns Promise<boolean> - Whether a screen reader is active
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch {
    // If we can't detect, default to false
    return false;
  }
}

/**
 * Add a listener for screen reader state changes.
 *
 * @param callback - Function called when screen reader state changes
 * @returns Cleanup function to remove the listener
 */
export function addScreenReaderListener(
  callback: (enabled: boolean) => void
): () => void {
  const subscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    callback
  );

  return () => {
    subscription.remove();
  };
}

/**
 * Generate accessibility label for a tour step.
 *
 * @param stepIndex - Current step index (0-based)
 * @param totalSteps - Total number of steps
 * @param title - Optional step title
 * @returns Accessibility label string
 */
export function getTourStepAccessibilityLabel(
  stepIndex: number,
  totalSteps: number,
  title?: string
): string {
  const stepNumber = stepIndex + 1;

  if (title) {
    return `Tour step ${stepNumber} of ${totalSteps}: ${title}`;
  }

  return `Tour step ${stepNumber} of ${totalSteps}`;
}

/**
 * Generate accessibility label for navigation buttons.
 *
 * @param action - The button action
 * @param stepIndex - Current step index (0-based)
 * @param totalSteps - Total number of steps
 * @returns Accessibility label string
 */
export function getNavigationButtonAccessibilityLabel(
  action: 'next' | 'prev' | 'skip' | 'done',
  stepIndex: number,
  totalSteps: number
): string {
  const stepNumber = stepIndex + 1;
  const isLastStep = stepNumber === totalSteps;
  const isFirstStep = stepNumber === 1;

  switch (action) {
    case 'next':
      return isLastStep
        ? 'Complete tour'
        : `Go to step ${stepNumber + 1} of ${totalSteps}`;
    case 'prev':
      return isFirstStep
        ? 'Previous step (disabled)'
        : `Go back to step ${stepNumber - 1} of ${totalSteps}`;
    case 'skip':
      return 'Skip the remaining tour';
    case 'done':
      return 'Complete the tour';
    default:
      return action;
  }
}

/**
 * Generate accessibility hint for a hint indicator.
 *
 * @param hintContent - The hint content (used to describe what will be shown)
 * @returns Accessibility hint string
 */
export function getHintAccessibilityHint(hintContent?: string): string {
  if (hintContent && typeof hintContent === 'string') {
    // Truncate if too long
    const maxLength = 50;
    const truncated =
      hintContent.length > maxLength
        ? `${hintContent.substring(0, maxLength)}...`
        : hintContent;
    return `Double tap to reveal: ${truncated}`;
  }

  return 'Double tap to reveal hint';
}

/**
 * Generate accessibility value for progress indicators.
 *
 * @param currentStep - Current step index (0-based)
 * @param totalSteps - Total number of steps
 * @returns Object with min, max, now, and text values
 */
export function getProgressAccessibilityValue(
  currentStep: number,
  totalSteps: number
): {
  min: number;
  max: number;
  now: number;
  text: string;
} {
  const stepNumber = currentStep + 1;
  const percentComplete = Math.round((stepNumber / totalSteps) * 100);

  return {
    min: 0,
    max: 100,
    now: percentComplete,
    text: `${percentComplete}% complete, step ${stepNumber} of ${totalSteps}`,
  };
}
