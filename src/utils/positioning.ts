/**
 * Positioning utilities for tooltips and overlays
 */

import { Dimensions } from 'react-native';
import { logPositioning as log } from './debug';
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
 * Overflow amounts for a placement (positive = overflow, negative = space remaining)
 */
interface PlacementOverflow {
  position: Exclude<TooltipPosition, 'auto'>;
  x: number;
  y: number;
  arrowPosition: PositionResult['arrowPosition'];
  overflow: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Total overflow (sum of positive overflow values) - lower is better */
  score: number;
}

/**
 * Calculate position and overflow for a specific placement
 * Uses Floating UI's detectOverflow approach
 */
function calculatePlacementOverflow(
  target: ElementMeasurement,
  tooltip: TooltipDimensions,
  screen: { width: number; height: number },
  position: Exclude<TooltipPosition, 'auto'>,
  padding: number = DEFAULT_PADDING,
  gap: number = DEFAULT_GAP
): PlacementOverflow {
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

  // Clamp X to screen bounds (shift behavior)
  const clampedX = Math.max(
    padding,
    Math.min(x, screen.width - padding - tooltip.width)
  );

  // Clamp Y to screen bounds (shift behavior)
  const clampedY = Math.max(
    padding,
    Math.min(y, screen.height - padding - tooltip.height)
  );

  // Calculate overflow amounts (positive = overflow, negative = space remaining)
  const overflow = {
    top: padding - clampedY,
    right: clampedX + tooltip.width - (screen.width - padding),
    bottom: clampedY + tooltip.height - (screen.height - padding),
    left: padding - clampedX,
  };

  // Calculate score: sum of positive overflow values (lower is better)
  // A perfect fit has score 0
  const score =
    Math.max(0, overflow.top) +
    Math.max(0, overflow.right) +
    Math.max(0, overflow.bottom) +
    Math.max(0, overflow.left);

  return {
    position,
    x: clampedX,
    y: clampedY,
    arrowPosition,
    overflow,
    score,
  };
}

/**
 * Check if a placement would cause the tooltip to overlap the target
 */
function wouldOverlapTarget(
  placement: PlacementOverflow,
  target: ElementMeasurement,
  tooltip: TooltipDimensions,
  gap: number = DEFAULT_GAP
): boolean {
  const tooltipLeft = placement.x;
  const tooltipRight = placement.x + tooltip.width;
  const tooltipTop = placement.y;
  const tooltipBottom = placement.y + tooltip.height;

  // Target bounds with gap (tooltip should stay outside this area)
  const targetLeft = target.x - gap;
  const targetRight = target.x + target.width + gap;
  const targetTop = target.y - gap;
  const targetBottom = target.y + target.height + gap;

  // Check for intersection
  const horizontalOverlap =
    tooltipLeft < targetRight && tooltipRight > targetLeft;
  const verticalOverlap =
    tooltipTop < targetBottom && tooltipBottom > targetTop;

  return horizontalOverlap && verticalOverlap;
}

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
  const placement = calculatePlacementOverflow(
    target,
    tooltip,
    screen,
    position,
    padding,
    gap
  );

  // Reject if there's any overflow or if it overlaps the target
  if (
    placement.score > 0 ||
    wouldOverlapTarget(placement, target, tooltip, gap)
  ) {
    return null;
  }

  return {
    position: placement.position,
    x: placement.x,
    y: placement.y,
    arrowPosition: placement.arrowPosition,
  };
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

  log('calculateTooltipPosition called', {
    target,
    tooltip,
    preferredPosition,
    screen,
  });

  // For 'auto' mode, determine best priority based on target position
  // If target is in bottom half of screen, prefer 'top' first
  const targetCenterY = target.y + target.height / 2;
  const isTargetInBottomHalf = targetCenterY > screen.height / 2;
  log('Target analysis', { targetCenterY, isTargetInBottomHalf });

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
  log('Trying positions in order', uniquePositions);

  // Try each position in order
  for (const position of uniquePositions) {
    const result = tryPosition(target, tooltip, screen, position, padding);
    log(`tryPosition '${position}':`, result ? 'SUCCESS' : 'FAILED');
    if (result) {
      log('Using position', result);
      return result;
    }
  }

  // Fallback: Use Floating UI's "bestFit" strategy
  // Calculate overflow for all positions and pick the one with:
  // 1. No overlap with target (if possible)
  // 2. Lowest overflow score (most space available)

  log('All positions failed, using fallback strategy');

  const allPlacements = (['top', 'bottom', 'left', 'right'] as const).map(
    (pos) => {
      const placement = calculatePlacementOverflow(
        target,
        tooltip,
        screen,
        pos,
        padding
      );
      const overlaps = wouldOverlapTarget(placement, target, tooltip);
      return { ...placement, overlaps };
    }
  );

  log('All placements calculated', allPlacements);

  // First, try to find a placement that doesn't overlap
  const nonOverlapping = allPlacements.filter((p) => !p.overlaps);
  log('Non-overlapping placements', nonOverlapping);

  if (nonOverlapping.length > 0) {
    // Pick the one with the lowest score (least overflow)
    nonOverlapping.sort((a, b) => a.score - b.score);
    const best = nonOverlapping[0]!;
    log('Using best non-overlapping placement', best);
    return {
      position: best.position,
      x: best.x,
      y: best.y,
      arrowPosition: best.arrowPosition,
    };
  }

  // All placements overlap - we need to adjust position to avoid overlap
  // This is an edge case (very large tooltip or very constrained screen)
  // Strategy: Find the placement direction with most space, then adjust Y
  // to ensure no overlap even if it means going partially off-screen

  log('All placements overlap! Using adjusted fallback');

  // Sort by score (least overflow first) to find best direction
  allPlacements.sort((a, b) => a.score - b.score);
  // allPlacements always has 4 elements since we map over a fixed array
  const bestDirection = allPlacements[0]!;
  log('Best direction before adjustment', bestDirection);

  // Calculate position that guarantees no overlap with target
  let finalX = bestDirection.x;
  let finalY = bestDirection.y;

  // Adjust based on position to ensure no overlap
  switch (bestDirection.position) {
    case 'top':
      // Position tooltip so its bottom edge is above the target (with gap)
      finalY = Math.min(finalY, target.y - tooltip.height - DEFAULT_GAP);
      break;
    case 'bottom':
      // Position tooltip so its top edge is below the target (with gap)
      finalY = Math.max(finalY, target.y + target.height + DEFAULT_GAP);
      break;
    case 'left':
      // Position tooltip so its right edge is left of target (with gap)
      finalX = Math.min(finalX, target.x - tooltip.width - DEFAULT_GAP);
      // Also adjust Y to prevent vertical overlap if tooltip is taller than target
      if (finalY + tooltip.height > target.y - DEFAULT_GAP) {
        // Tooltip bottom extends into target area - move it up
        finalY = Math.min(finalY, target.y - tooltip.height - DEFAULT_GAP);
      }
      break;
    case 'right':
      // Position tooltip so its left edge is right of target (with gap)
      finalX = Math.max(finalX, target.x + target.width + DEFAULT_GAP);
      // Also adjust Y to prevent vertical overlap if tooltip is taller than target
      if (finalY + tooltip.height > target.y - DEFAULT_GAP) {
        // Tooltip bottom extends into target area - move it up
        finalY = Math.min(finalY, target.y - tooltip.height - DEFAULT_GAP);
      }
      break;
  }

  // Final clamp to keep at least partially visible
  finalX = Math.max(-tooltip.width + 50, Math.min(finalX, screen.width - 50));
  finalY = Math.max(-tooltip.height + 50, Math.min(finalY, screen.height - 50));

  const finalResult = {
    position: bestDirection.position,
    x: finalX,
    y: finalY,
    arrowPosition: bestDirection.arrowPosition,
  };
  log('Final adjusted position', finalResult);
  return finalResult;
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
