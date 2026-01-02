/**
 * useAnimation - Utilities for animation detection
 *
 * Provides helpers for detecting whether react-native-reanimated
 * is available and if animations should be enabled.
 */

import { hasReanimated, getReanimated } from '../utils/optionalDependencies';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Enable animations ('auto' detects Reanimated, true/false forces) */
  animate?: boolean | 'auto';
  /** Animation duration in ms */
  duration?: number;
}

/**
 * Simple hook to check if animations should be enabled based on config
 */
export function useAnimationEnabled(
  animate: boolean | 'auto' = 'auto'
): boolean {
  const reanimatedAvailable = hasReanimated();
  return animate === 'auto' ? reanimatedAvailable : animate === true;
}

/**
 * Get Reanimated module or null if not available
 * Re-exported for convenience
 */
export { getReanimated, hasReanimated };
