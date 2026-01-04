/**
 * useReduceMotion - Hook to detect and respect user's reduced motion preference
 *
 * This hook monitors the system's reduce motion setting and returns whether
 * animations should be reduced. It updates automatically when the user
 * changes their accessibility settings.
 *
 * @returns boolean - true if animations should be reduced, false otherwise
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const reduceMotion = useReduceMotion();
 *
 *   // Use simpler animations when reduceMotion is true
 *   const animationDuration = reduceMotion ? 0 : 300;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import {
  isReduceMotionEnabled,
  addReduceMotionListener,
} from '../utils/accessibility';

/**
 * Hook to detect and respond to the user's reduce motion preference.
 *
 * Automatically listens for changes to the system accessibility setting
 * and updates the returned value accordingly.
 *
 * @returns boolean - true if reduce motion is enabled, false otherwise
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    isReduceMotionEnabled().then(setReduceMotion);

    // Listen for changes
    const cleanup = addReduceMotionListener(setReduceMotion);

    return cleanup;
  }, []);

  return reduceMotion;
}
