/**
 * TourStep - Wrapper component to register elements as tour step targets
 */

import { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import type { TourStepProps } from '../types';

/**
 * TourStep wrapper component
 *
 * Wraps a child element to register it as a target for tour steps.
 * The wrapped element can then be referenced by its ID in tour step configurations.
 *
 * @example
 * ```tsx
 * <TourStep id="welcome-button" order={1}>
 *   <Button title="Welcome" onPress={handleWelcome} />
 * </TourStep>
 * ```
 */
export function TourStep({ id, children, order = 0 }: TourStepProps) {
  const viewRef = useRef<any>(null);
  const { registerStep, unregisterStep } = useIntroContext();

  // Register on mount, unregister on unmount
  useEffect(() => {
    registerStep(id, viewRef, order);

    return () => {
      unregisterStep(id);
    };
  }, [id, order, registerStep, unregisterStep]);

  // Wrap the child in a View to ensure we can measure it
  // collapsable={false} is required for accurate measurement on Android
  return (
    <View ref={viewRef} collapsable={false}>
      {children}
    </View>
  );
}

/**
 * Alias for TourStep for backwards compatibility
 * @deprecated Use TourStep instead
 */
export const TourStepRef = TourStep;
