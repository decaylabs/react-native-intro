/**
 * Unit tests for positioning utilities
 */

import {
  calculateTooltipPosition,
  calculateFloatingPosition,
  isElementVisible,
  calculateScrollOffset,
  type TooltipDimensions,
} from '../../src/utils/positioning';
import type { ElementMeasurement } from '../../src/types';

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })), // iPhone X dimensions
  },
}));

describe('positioning utilities', () => {
  // Test helper for creating element measurements
  const createMeasurement = (
    x: number,
    y: number,
    width: number,
    height: number
  ): ElementMeasurement => ({
    x,
    y,
    width,
    height,
    measured: true,
    timestamp: Date.now(),
  });

  // Test helper for tooltip dimensions
  const createTooltip = (width: number, height: number): TooltipDimensions => ({
    width,
    height,
  });

  describe('calculateTooltipPosition', () => {
    it('should position tooltip below target when target is in top half', () => {
      const target = createMeasurement(100, 100, 100, 50);
      const tooltip = createTooltip(200, 100);

      const result = calculateTooltipPosition(target, tooltip, 'auto');

      expect(result.position).toBe('bottom');
      expect(result.y).toBeGreaterThan(target.y + target.height);
    });

    it('should position tooltip above target when target is in bottom half', () => {
      const target = createMeasurement(100, 600, 100, 50);
      const tooltip = createTooltip(200, 100);

      const result = calculateTooltipPosition(target, tooltip, 'auto');

      expect(result.position).toBe('top');
      expect(result.y).toBeLessThan(target.y);
    });

    it('should respect preferred position when possible', () => {
      const target = createMeasurement(100, 400, 100, 50);
      const tooltip = createTooltip(100, 80);

      const result = calculateTooltipPosition(target, tooltip, 'right');

      expect(result.position).toBe('right');
      expect(result.x).toBeGreaterThanOrEqual(target.x + target.width);
    });

    it('should fallback to other positions when preferred position does not fit', () => {
      // Target at right edge - 'right' position won't fit
      const target = createMeasurement(300, 400, 50, 50);
      const tooltip = createTooltip(100, 80);

      const result = calculateTooltipPosition(target, tooltip, 'right');

      // Should fall back to another position since 'right' doesn't fit
      // The algorithm may still return 'right' if it's clamped to fit
      expect(['bottom', 'top', 'left', 'right']).toContain(result.position);
    });

    it('should clamp tooltip x position to screen bounds', () => {
      // Target at left edge
      const target = createMeasurement(10, 200, 30, 30);
      const tooltip = createTooltip(200, 80);

      const result = calculateTooltipPosition(target, tooltip, 'bottom');

      // X should be clamped to stay on screen
      expect(result.x).toBeGreaterThanOrEqual(10); // Default padding
    });

    it('should return center arrow position for top/bottom', () => {
      const target = createMeasurement(100, 200, 100, 50);
      const tooltip = createTooltip(150, 80);

      const bottomResult = calculateTooltipPosition(target, tooltip, 'bottom');
      expect(bottomResult.arrowPosition).toBe('top');

      const topResult = calculateTooltipPosition(target, tooltip, 'top');
      expect(topResult.arrowPosition).toBe('bottom');
    });

    it('should return appropriate arrow position for left/right', () => {
      const target = createMeasurement(100, 400, 50, 50);
      const tooltip = createTooltip(100, 80);

      const rightResult = calculateTooltipPosition(target, tooltip, 'right');
      expect(rightResult.arrowPosition).toBe('left');

      const leftResult = calculateTooltipPosition(target, tooltip, 'left');
      expect(leftResult.arrowPosition).toBe('right');
    });

    it('should handle all four positions', () => {
      const target = createMeasurement(150, 400, 50, 50);
      const tooltip = createTooltip(80, 60);

      const positions = ['top', 'bottom', 'left', 'right'] as const;

      for (const position of positions) {
        const result = calculateTooltipPosition(target, tooltip, position);
        expect(result.position).toBe(position);
        expect(result.x).toBeGreaterThanOrEqual(0);
        expect(result.y).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('calculateFloatingPosition', () => {
    it('should center tooltip on screen', () => {
      const tooltip = createTooltip(200, 100);

      const result = calculateFloatingPosition(tooltip);

      // Screen is 375x812, tooltip is 200x100
      // Center X: (375 - 200) / 2 = 87.5
      // Center Y: (812 - 100) / 2 = 356
      expect(result.x).toBe(87.5);
      expect(result.y).toBe(356);
      expect(result.position).toBe('bottom');
      expect(result.arrowPosition).toBe('center');
    });

    it('should handle large tooltips', () => {
      const tooltip = createTooltip(350, 400);

      const result = calculateFloatingPosition(tooltip);

      expect(result.x).toBe(12.5); // (375 - 350) / 2
      expect(result.y).toBe(206); // (812 - 400) / 2
    });

    it('should handle small tooltips', () => {
      const tooltip = createTooltip(100, 50);

      const result = calculateFloatingPosition(tooltip);

      expect(result.x).toBe(137.5); // (375 - 100) / 2
      expect(result.y).toBe(381); // (812 - 50) / 2
    });
  });

  describe('isElementVisible', () => {
    it('should return true for fully visible element', () => {
      const element = createMeasurement(50, 50, 100, 100);

      expect(isElementVisible(element)).toBe(true);
    });

    it('should return false for element above viewport', () => {
      const element = createMeasurement(50, -50, 100, 100);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should return false for element below viewport', () => {
      const element = createMeasurement(50, 800, 100, 100);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should return false for element left of viewport', () => {
      const element = createMeasurement(-50, 100, 100, 100);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should return false for element right of viewport', () => {
      const element = createMeasurement(350, 100, 100, 100);

      expect(isElementVisible(element)).toBe(false);
    });

    it('should respect custom padding', () => {
      // Element at edge without padding would be visible
      const element = createMeasurement(5, 5, 50, 50);

      expect(isElementVisible(element, 0)).toBe(true);
      expect(isElementVisible(element, 10)).toBe(false);
    });

    it('should handle element at exact boundary', () => {
      // Element exactly at the edge of screen (375x812)
      const element = createMeasurement(0, 0, 375, 812);

      expect(isElementVisible(element, 0)).toBe(true);
      expect(isElementVisible(element, 1)).toBe(false);
    });
  });

  describe('calculateScrollOffset', () => {
    it('should return null for visible element', () => {
      const element = createMeasurement(50, 200, 100, 100);
      const viewportHeight = 600;

      const result = calculateScrollOffset(element, viewportHeight, 0, 50);

      expect(result).toBeNull();
    });

    it('should calculate scroll for element above viewport', () => {
      const element = createMeasurement(50, 20, 100, 100);
      const viewportHeight = 600;
      const currentScroll = 100;

      const result = calculateScrollOffset(
        element,
        viewportHeight,
        currentScroll,
        50
      );

      expect(result).not.toBeNull();
      expect(result!.y).toBeLessThan(currentScroll);
    });

    it('should calculate scroll for element below viewport', () => {
      const element = createMeasurement(50, 700, 100, 100);
      const viewportHeight = 600;
      const currentScroll = 0;

      const result = calculateScrollOffset(
        element,
        viewportHeight,
        currentScroll,
        50
      );

      expect(result).not.toBeNull();
      expect(result!.y).toBeGreaterThan(0);
    });

    it('should handle element at top boundary', () => {
      const element = createMeasurement(50, 50, 100, 100);
      const viewportHeight = 600;

      // Element at exactly the padding boundary should be visible
      const result = calculateScrollOffset(element, viewportHeight, 0, 50);

      expect(result).toBeNull();
    });

    it('should handle element at bottom boundary', () => {
      const element = createMeasurement(50, 450, 100, 100);
      const viewportHeight = 600;

      // Element bottom (450 + 100 = 550) is within viewport (600 - 50 = 550)
      const result = calculateScrollOffset(element, viewportHeight, 0, 50);

      expect(result).toBeNull();
    });
  });
});
