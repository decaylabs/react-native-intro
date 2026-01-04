/**
 * Unit tests for scrolling utilities
 */

import {
  checkElementVisibility,
  calculateScrollToElement,
  calculateScrollToCenter,
  scrollToElement,
  type ScrollableRef,
} from '../../src/utils/scrolling';
import type { ElementMeasurement } from '../../src/types';
import type { RefObject } from 'react';

// Mock Dimensions
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })), // iPhone X dimensions
  },
}));

describe('scrolling utilities', () => {
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

  // Mock scrollable ref
  const createMockScrollRef = (): {
    ref: RefObject<ScrollableRef>;
    scrollTo: jest.Mock;
  } => {
    const scrollTo = jest.fn();
    const ref = {
      current: { scrollTo },
    } as unknown as RefObject<ScrollableRef>;
    return { ref, scrollTo };
  };

  describe('checkElementVisibility', () => {
    it('should return visible for element fully in viewport', () => {
      const element = createMeasurement(50, 100, 100, 100);

      const result = checkElementVisibility(element);

      expect(result.isVisible).toBe(true);
      expect(result.isAbove).toBe(false);
      expect(result.isBelow).toBe(false);
      expect(result.isLeft).toBe(false);
      expect(result.isRight).toBe(false);
    });

    it('should detect element above viewport', () => {
      const element = createMeasurement(50, 20, 100, 100);

      const result = checkElementVisibility(element);

      expect(result.isVisible).toBe(false);
      expect(result.isAbove).toBe(true);
    });

    it('should detect element below viewport', () => {
      const element = createMeasurement(50, 800, 100, 100);

      const result = checkElementVisibility(element);

      expect(result.isVisible).toBe(false);
      expect(result.isBelow).toBe(true);
    });

    it('should detect element left of viewport', () => {
      const element = createMeasurement(-20, 100, 100, 100);

      const result = checkElementVisibility(element);

      expect(result.isVisible).toBe(false);
      expect(result.isLeft).toBe(true);
    });

    it('should detect element right of viewport', () => {
      const element = createMeasurement(360, 100, 100, 100);

      const result = checkElementVisibility(element);

      expect(result.isVisible).toBe(false);
      expect(result.isRight).toBe(true);
    });

    it('should respect custom padding option', () => {
      // Element at x=100, y=100 - clearly visible with any reasonable padding
      const visibleElement = createMeasurement(100, 100, 50, 50);

      // With small padding, element should be visible
      const withSmallPadding = checkElementVisibility(visibleElement, {
        padding: 10,
      });
      expect(withSmallPadding.isVisible).toBe(true);

      // Element at x=20 - might be at edge depending on padding
      const edgeElement = createMeasurement(20, 100, 50, 50);

      // With small padding (10), element at x=20 should be visible
      const edgeWithSmallPadding = checkElementVisibility(edgeElement, {
        padding: 10,
      });
      expect(edgeWithSmallPadding.isVisible).toBe(true);

      // With large padding (30), element at x=20 should be out of bounds
      const edgeWithLargePadding = checkElementVisibility(edgeElement, {
        padding: 30,
      });
      expect(edgeWithLargePadding.isVisible).toBe(false);
      expect(edgeWithLargePadding.isLeft).toBe(true);
    });
  });

  describe('calculateScrollToElement', () => {
    it('should return null for visible element', () => {
      const element = createMeasurement(50, 200, 100, 100);

      const result = calculateScrollToElement(element);

      expect(result).toBeNull();
    });

    it('should calculate scroll offset for element above viewport', () => {
      const element = createMeasurement(50, 20, 100, 100);

      const result = calculateScrollToElement(element);

      expect(result).not.toBeNull();
      expect(result!.y).toBeLessThan(20);
    });

    it('should calculate scroll offset for element below viewport', () => {
      const element = createMeasurement(50, 800, 100, 100);

      const result = calculateScrollToElement(element);

      expect(result).not.toBeNull();
      expect(result!.y).toBeGreaterThan(0);
    });

    it('should not return negative scroll values', () => {
      const element = createMeasurement(50, 10, 100, 100);

      const result = calculateScrollToElement(element);

      if (result) {
        expect(result.x).toBeGreaterThanOrEqual(0);
        expect(result.y).toBeGreaterThanOrEqual(0);
      }
    });

    it('should respect custom padding option', () => {
      // Element at y=40 - might need scrolling depending on padding
      const element = createMeasurement(50, 40, 100, 100);

      // With small padding (10), element should be visible (no scroll needed)
      const withSmallPadding = calculateScrollToElement(element, {
        padding: 10,
      });
      expect(withSmallPadding).toBeNull();

      // With large padding (50), element should need scrolling
      const withLargePadding = calculateScrollToElement(element, {
        padding: 50,
      });
      expect(withLargePadding).not.toBeNull();
    });
  });

  describe('calculateScrollToCenter', () => {
    it('should calculate offset to center element', () => {
      // Element in top-left corner
      const element = createMeasurement(50, 100, 100, 100);

      const result = calculateScrollToCenter(element);

      // Element center: (100, 150)
      // Screen center: (187.5, 406)
      // Scroll offset should move element center to screen center
      expect(result).toBeDefined();
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('should handle element already near center', () => {
      // Element near center
      const element = createMeasurement(137.5, 356, 100, 100);

      const result = calculateScrollToCenter(element);

      // Should still work, but offset should be small
      expect(result).toBeDefined();
    });

    it('should not return negative values', () => {
      // Element already centered or above center
      const element = createMeasurement(187.5, 100, 100, 100);

      const result = calculateScrollToCenter(element);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });
  });

  describe('scrollToElement', () => {
    it('should call scrollTo when element is not visible', async () => {
      const { ref, scrollTo } = createMockScrollRef();
      const element = createMeasurement(50, 800, 100, 100);

      const result = await scrollToElement(ref, element, {
        animated: false,
        scrollDuration: 0,
      });

      expect(result).toBe(true);
      expect(scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({
          animated: false,
        })
      );
    });

    it('should return true without scrolling if element is visible', async () => {
      const { ref, scrollTo } = createMockScrollRef();
      const element = createMeasurement(50, 200, 100, 100);

      const result = await scrollToElement(ref, element);

      expect(result).toBe(true);
      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('should return false if scrollRef is null', async () => {
      const ref = { current: null } as RefObject<ScrollableRef | null>;
      const element = createMeasurement(50, 800, 100, 100);

      const result = await scrollToElement(ref, element);

      expect(result).toBe(false);
    });

    it('should wait for scroll animation when animated', async () => {
      const { ref } = createMockScrollRef();
      const element = createMeasurement(50, 800, 100, 100);

      const start = Date.now();
      await scrollToElement(ref, element, {
        animated: true,
        scrollDuration: 100,
      });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
    });

    it('should use default options when not provided', async () => {
      const { ref, scrollTo } = createMockScrollRef();
      const element = createMeasurement(50, 800, 100, 100);

      await scrollToElement(ref, element);

      expect(scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({
          animated: true,
        })
      );
    });
  });
});
