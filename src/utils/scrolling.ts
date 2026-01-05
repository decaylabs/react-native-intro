/**
 * Scrolling utilities for auto-scroll functionality
 *
 * Provides pure, testable functions to calculate scroll offsets
 * and scroll elements into view during tour navigation.
 */

import { Dimensions } from 'react-native';
import type { RefObject } from 'react';
import type { ElementMeasurement, ScrollPadding } from '../types';

/**
 * Resolved directional padding with all edges defined
 */
export interface ResolvedPadding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Normalize scroll padding to directional format
 * Converts a single number to uniform padding on all edges
 */
export function resolvePadding(
  padding: ScrollPadding | undefined,
  defaultValue: number = 50
): ResolvedPadding {
  if (padding === undefined) {
    return {
      top: defaultValue,
      bottom: defaultValue,
      left: defaultValue,
      right: defaultValue,
    };
  }

  if (typeof padding === 'number') {
    return { top: padding, bottom: padding, left: padding, right: padding };
  }

  return {
    top: padding.top ?? defaultValue,
    bottom: padding.bottom ?? defaultValue,
    left: padding.left ?? defaultValue,
    right: padding.right ?? defaultValue,
  };
}

/**
 * Minimal interface for scrollable components
 * Supports ScrollView, FlatList, and other scrollable components
 */
export interface ScrollableRef {
  scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void;
}

/**
 * Scroll configuration options
 */
export interface ScrollOptions {
  /**
   * Padding from screen edges when scrolling element into view.
   * Can be a single number for uniform padding, or directional values.
   */
  padding?: ScrollPadding;
  /** Whether to animate the scroll */
  animated?: boolean;
  /** Duration to wait for scroll animation to complete (ms) */
  scrollDuration?: number;
}

/**
 * Default scroll options
 */
const DEFAULT_SCROLL_OPTIONS: Required<ScrollOptions> = {
  padding: 50,
  animated: true,
  scrollDuration: 350,
};

/**
 * Result of visibility check
 */
export interface VisibilityResult {
  /** Whether the element is fully visible */
  isVisible: boolean;
  /** Whether the element is above the visible area */
  isAbove: boolean;
  /** Whether the element is below the visible area */
  isBelow: boolean;
  /** Whether the element is to the left of visible area */
  isLeft: boolean;
  /** Whether the element is to the right of visible area */
  isRight: boolean;
}

/**
 * Scroll offset calculation result
 */
export interface ScrollOffset {
  x: number;
  y: number;
}

/**
 * Check if an element is visible within the viewport
 *
 * @param element - Element measurement
 * @param options - Scroll options
 * @returns Visibility result with details about position
 */
export function checkElementVisibility(
  element: ElementMeasurement,
  options: ScrollOptions = {}
): VisibilityResult {
  const resolved = resolvePadding(options.padding);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const isAbove = element.y < resolved.top;
  const isBelow = element.y + element.height > screenHeight - resolved.bottom;
  const isLeft = element.x < resolved.left;
  const isRight = element.x + element.width > screenWidth - resolved.right;

  return {
    isVisible: !isAbove && !isBelow && !isLeft && !isRight,
    isAbove,
    isBelow,
    isLeft,
    isRight,
  };
}

/**
 * Calculate the scroll offset needed to bring an element into view
 *
 * @param element - Element measurement (absolute screen coordinates)
 * @param options - Scroll options
 * @returns Scroll offset needed, or null if element is already visible
 */
export function calculateScrollToElement(
  element: ElementMeasurement,
  options: ScrollOptions = {}
): ScrollOffset | null {
  const resolved = resolvePadding(options.padding);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const visibility = checkElementVisibility(element, options);

  if (visibility.isVisible) {
    return null;
  }

  let scrollX = 0;
  let scrollY = 0;

  // Calculate vertical scroll using directional padding
  if (visibility.isAbove) {
    scrollY = element.y - resolved.top;
  } else if (visibility.isBelow) {
    scrollY = element.y + element.height - screenHeight + resolved.bottom;
  }

  // Calculate horizontal scroll using directional padding
  if (visibility.isLeft) {
    scrollX = element.x - resolved.left;
  } else if (visibility.isRight) {
    scrollX = element.x + element.width - screenWidth + resolved.right;
  }

  // Ensure we don't scroll to negative values
  scrollY = Math.max(0, scrollY);
  scrollX = Math.max(0, scrollX);

  return { x: scrollX, y: scrollY };
}

/**
 * Calculate scroll offset to center an element in the viewport
 *
 * @param element - Element measurement
 * @returns Scroll offset to center the element
 */
export function calculateScrollToCenter(
  element: ElementMeasurement
): ScrollOffset {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const targetCenterY = screenHeight / 2;
  const targetCenterX = screenWidth / 2;

  const elementCenterY = element.y + element.height / 2;
  const elementCenterX = element.x + element.width / 2;

  const scrollY = Math.max(0, elementCenterY - targetCenterY);
  const scrollX = Math.max(0, elementCenterX - targetCenterX);

  return { x: scrollX, y: scrollY };
}

/**
 * Perform scroll to bring element into view
 *
 * This function checks if the element is outside the visible safe zone
 * and scrolls to center it if needed. The centering approach is more
 * reliable than minimal scrolling because measure() returns screen
 * coordinates which can't be directly converted to content offsets
 * without tracking scroll position.
 *
 * @param scrollRef - Reference to scrollable component
 * @param element - Element measurement (screen coordinates)
 * @param currentScrollY - Current vertical scroll offset (required for accurate scrolling)
 * @param options - Scroll options
 * @returns Promise that resolves when scroll is complete
 */
export async function scrollToElement(
  scrollRef: RefObject<ScrollableRef | null>,
  element: ElementMeasurement,
  options: ScrollOptions = {},
  currentScrollY: number = 0
): Promise<boolean> {
  const {
    animated = DEFAULT_SCROLL_OPTIONS.animated,
    scrollDuration = DEFAULT_SCROLL_OPTIONS.scrollDuration,
  } = options;

  if (!scrollRef.current) {
    return false;
  }

  const resolved = resolvePadding(options.padding);
  const { height: screenHeight } = Dimensions.get('window');

  // Check if element is within the safe visible area
  const safeTop = resolved.top;
  const safeBottom = screenHeight - resolved.bottom;
  const elementTop = element.y;
  const elementBottom = element.y + element.height;

  const isAbove = elementTop < safeTop;
  const isBelow = elementBottom > safeBottom;

  if (!isAbove && !isBelow) {
    // Element is already in the safe zone
    return true;
  }

  // Calculate element's content position (screen position + current scroll)
  const elementContentY = element.y + currentScrollY;

  // Calculate target scroll position to center the element
  // Account for bottom padding by adjusting the target center point
  const targetCenterY = (screenHeight - resolved.bottom + resolved.top) / 2;
  const elementCenterY = element.height / 2;
  const targetScrollY = Math.max(
    0,
    elementContentY - targetCenterY + elementCenterY
  );

  try {
    scrollRef.current.scrollTo({
      y: targetScrollY,
      animated,
    });

    // Wait for scroll animation to complete
    if (animated && scrollDuration > 0) {
      await new Promise((resolve) => setTimeout(resolve, scrollDuration));
    }

    return true;
  } catch {
    return false;
  }
}
