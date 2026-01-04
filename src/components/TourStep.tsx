/**
 * TourStep - Wrapper component to register elements as tour step targets
 */

import { useRef, useEffect, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useIntroContext } from '../context/useIntroContext';
import type { TourStepProps } from '../types';

interface TourStepPropsWithStyle extends TourStepProps {
  /**
   * Style for the wrapper View. Useful for absolutely positioned elements
   * where the wrapper needs matching positioning.
   */
  style?: ViewStyle;
}

/**
 * TourStep wrapper component
 *
 * Wraps a child element to register it as a target for tour steps.
 * Supports two usage patterns:
 *
 * 1. Props-based: Define step content via props, then call tour.start()
 * 2. Programmatic: Just use id, pass config to tour.start(steps)
 *
 * @example
 * ```tsx
 * // Props-based (recommended)
 * <TourStep id="welcome" order={1} intro="Welcome to the app!" title="Hello">
 *   <Button title="Welcome" onPress={handleWelcome} />
 * </TourStep>
 *
 * // Then start the tour:
 * tour.start(); // Uses props from registered TourSteps
 *
 * // Programmatic (legacy)
 * <TourStep id="welcome">
 *   <Button title="Welcome" />
 * </TourStep>
 * tour.start('tour-id', [{ id: 'step-1', targetId: 'welcome', content: '...' }]);
 * ```
 *
 * @example
 * ```tsx
 * // Absolutely positioned elements (e.g., FAB buttons)
 * // Pass positioning styles to the `style` prop so the wrapper
 * // matches the child's position and can be measured correctly.
 *
 * <TourStep
 *   id="fab"
 *   style={{ position: 'absolute', bottom: 20, right: 20 }}
 * >
 *   <TouchableOpacity style={styles.fabButton}>
 *     <Text>+</Text>
 *   </TouchableOpacity>
 * </TourStep>
 * ```
 *
 * @example
 * ```tsx
 * // Floating step (no target element)
 * // Perfect for welcome messages or intro screens
 *
 * <TourStep
 *   id="welcome"
 *   order={1}
 *   floating
 *   title="Welcome!"
 *   intro="This is a floating tooltip that appears centered on screen."
 * />
 * ```
 */
export function TourStep({
  id,
  children,
  order = 0,
  intro,
  title,
  position,
  disableInteraction,
  group,
  hideButtons,
  tooltipStyle,
  tooltipTitleStyle,
  tooltipTextStyle,
  floating,
  style,
}: TourStepPropsWithStyle) {
  // Use 'any' to work around complex RN 0.81 View typing issues
  const viewRef = useRef<any>(null);
  // Floating steps don't need a ref since there's no element to measure
  const floatingRef = useRef<any>(null);
  const { registerStep, unregisterStep } = useIntroContext();

  // Build props config object (only include defined values)
  const propsConfig = useMemo(() => {
    const config: Record<string, unknown> = {};
    if (intro !== undefined) config.intro = intro;
    if (title !== undefined) config.title = title;
    if (position !== undefined) config.position = position;
    if (disableInteraction !== undefined)
      config.disableInteraction = disableInteraction;
    if (group !== undefined) config.group = group;
    if (hideButtons !== undefined) config.hideButtons = hideButtons;
    if (tooltipStyle !== undefined) config.tooltipStyle = tooltipStyle;
    if (tooltipTitleStyle !== undefined)
      config.tooltipTitleStyle = tooltipTitleStyle;
    if (tooltipTextStyle !== undefined)
      config.tooltipTextStyle = tooltipTextStyle;
    if (floating !== undefined) config.floating = floating;
    return Object.keys(config).length > 0 ? config : undefined;
  }, [
    intro,
    title,
    position,
    disableInteraction,
    group,
    hideButtons,
    tooltipStyle,
    tooltipTitleStyle,
    tooltipTextStyle,
    floating,
  ]);

  // Register on mount, unregister on unmount
  useEffect(() => {
    // Use null ref for floating steps (no element to measure)
    registerStep(id, floating ? floatingRef : viewRef, order, propsConfig);

    return () => {
      unregisterStep(id);
    };
  }, [id, order, propsConfig, floating, registerStep, unregisterStep]);

  // Floating steps don't render anything
  if (floating) {
    return null;
  }

  // Wrap the child in a View to ensure we can measure it
  // collapsable={false} is required for accurate measurement on Android
  return (
    <View ref={viewRef} collapsable={false} style={style}>
      {children}
    </View>
  );
}

/**
 * Alias for TourStep for backwards compatibility
 * @deprecated Use TourStep instead
 */
export const TourStepRef = TourStep;
