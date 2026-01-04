/**
 * Positioning utilities for tooltips and overlays
 */

import { Dimensions } from 'react-native';
import type { TooltipPosition, ElementMeasurement } from '../types';

/**
 * Screen dimensions helper
 */
export function getScreenDimensions() {
  return Dimensions.get('window');
}

/**
 * Result of tooltip position calculation
 */
export interface PositionResult {
  position: TooltipPosition;
  x: number;
  y: number;
  arrowPosition: 'left' | 'center' | 'right' | 'top' | 'bottom';
}

/**
 * Tooltip dimensions for positioning calculation
 */
export interface TooltipDimensions {
  width: number;
  height: number;
}

/**
 * Default padding from screen edges
 */
const DEFAULT_PADDING = 10;

/**
 * Gap between target element and tooltip
 * Must be larger than spotlight padding (8px) to avoid overlap
 */
const DEFAULT_GAP = 16;

/**
 * Try to position tooltip at a specific position
 *
 * @returns Position result if valid, null if position doesn't fit
 */
function tryPosition(
  target: ElementMeasurement,
  tooltip: TooltipDimensions,
  screen: { width: number; height: number },
  position: Exclude<TooltipPosition, 'auto'>,
  padding: number = DEFAULT_PADDING,
  gap: number = DEFAULT_GAP
): PositionResult | null {
  let x: number;
  let y: number;
  let arrowPosition: PositionResult['arrowPosition'] = 'center';

  switch (position) {
    case 'bottom':
      x = target.x + (target.width - tooltip.width) / 2;
      y = target.y + target.height + gap;
      arrowPosition = 'top';
      break;

    case 'top':
      x = target.x + (target.width - tooltip.width) / 2;
      y = target.y - tooltip.height - gap;
      arrowPosition = 'bottom';
      break;

    case 'right':
      x = target.x + target.width + gap;
      y = target.y + (target.height - tooltip.height) / 2;
      arrowPosition = 'left';
      break;

    case 'left':
      x = target.x - tooltip.width - gap;
      y = target.y + (target.height - tooltip.height) / 2;
      arrowPosition = 'right';
      break;
  }

  // Clamp X to screen bounds
  if (x < padding) {
    x = padding;
  } else if (x + tooltip.width > screen.width - padding) {
    x = screen.width - padding - tooltip.width;
  }

  // Check if Y is within bounds
  if (y < padding || y + tooltip.height > screen.height - padding) {
    return null;
  }

  return { position, x, y, arrowPosition };
}

/**
 * Calculate optimal tooltip position relative to target element
 *
 * @param target - Target element measurement
 * @param tooltip - Tooltip dimensions
 * @param preferredPosition - Preferred position (default: 'auto')
 * @param padding - Padding from screen edges
 * @returns Calculated position
 */
export function calculateTooltipPosition(
  target: ElementMeasurement,
  tooltip: TooltipDimensions,
  preferredPosition: TooltipPosition = 'auto',
  padding: number = DEFAULT_PADDING
): PositionResult {
  const screen = getScreenDimensions();

  // For 'auto' mode, determine best priority based on target position
  // If target is in bottom half of screen, prefer 'top' first
  const targetCenterY = target.y + target.height / 2;
  const isTargetInBottomHalf = targetCenterY > screen.height / 2;

  // Priority order based on preferred position and target location
  let positions: Exclude<TooltipPosition, 'auto'>[];
  if (preferredPosition !== 'auto') {
    positions = [preferredPosition, 'bottom', 'top', 'right', 'left'];
  } else if (isTargetInBottomHalf) {
    // Target is in bottom half - prefer top positioning
    positions = ['top', 'bottom', 'left', 'right'];
  } else {
    // Target is in top half - prefer bottom positioning
    positions = ['bottom', 'top', 'right', 'left'];
  }

  // Remove duplicates
  const uniquePositions = [...new Set(positions)];

  // Try each position in order
  for (const position of uniquePositions) {
    const result = tryPosition(target, tooltip, screen, position, padding);
    if (result) {
      return result;
    }
  }

  // Fallback: smart positioning that avoids overlapping the target
  const x = Math.max(
    padding,
    Math.min(
      target.x + (target.width - tooltip.width) / 2,
      screen.width - padding - tooltip.width
    )
  );

  // Calculate both possible Y positions
  const bottomY = target.y + target.height + DEFAULT_GAP;
  const topY = target.y - tooltip.height - DEFAULT_GAP;

  // Check if bottom position would overlap the target
  const bottomYClamped = Math.min(
    bottomY,
    screen.height - padding - tooltip.height
  );
  const wouldOverlapIfBottom = bottomYClamped < target.y + target.height;

  // Check if top position is valid (not above screen)
  const topYClamped = Math.max(padding, topY);
  const wouldOverlapIfTop =
    topYClamped + tooltip.height > target.y && topYClamped < target.y;

  // Prefer top if bottom would overlap, otherwise use bottom
  if (wouldOverlapIfBottom && !wouldOverlapIfTop && topYClamped >= padding) {
    return {
      position: 'top',
      x,
      y: topYClamped,
      arrowPosition: 'bottom',
    };
  }

  return {
    position: 'bottom',
    x,
    y: bottomYClamped,
    arrowPosition: 'top',
  };
}

/**
 * Calculate floating tooltip position (centered on screen)
 *
 * @param tooltip - Tooltip dimensions
 * @returns Centered position
 */
export function calculateFloatingPosition(
  tooltip: TooltipDimensions
): PositionResult {
  const screen = getScreenDimensions();

  return {
    position: 'bottom',
    x: (screen.width - tooltip.width) / 2,
    y: (screen.height - tooltip.height) / 2,
    arrowPosition: 'center',
  };
}

/**
 * Check if an element is visible within the viewport
 *
 * @param element - Element measurement
 * @param padding - Optional padding to consider
 * @returns True if element is fully visible
 */
export function isElementVisible(
  element: ElementMeasurement,
  padding: number = 0
): boolean {
  const screen = getScreenDimensions();

  return (
    element.x >= padding &&
    element.y >= padding &&
    element.x + element.width <= screen.width - padding &&
    element.y + element.height <= screen.height - padding
  );
}

/**
 * Calculate scroll offset needed to bring element into view
 *
 * @param element - Element measurement
 * @param viewportHeight - Height of the scrollable viewport
 * @param currentScrollY - Current scroll position
 * @param padding - Padding around element
 * @returns Required scroll offset, or null if element is visible
 */
export function calculateScrollOffset(
  element: ElementMeasurement,
  viewportHeight: number,
  currentScrollY: number = 0,
  padding: number = 50
): { y: number } | null {
  const elementTop = element.y - currentScrollY;
  const elementBottom = elementTop + element.height;

  // Element is above viewport
  if (elementTop < padding) {
    return { y: currentScrollY + elementTop - padding };
  }

  // Element is below viewport
  if (elementBottom > viewportHeight - padding) {
    return { y: currentScrollY + (elementBottom - viewportHeight + padding) };
  }

  // Element is visible
  return null;
}
