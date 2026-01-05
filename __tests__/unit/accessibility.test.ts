/**
 * Unit tests for accessibility utilities
 */

import {
  announceForAccessibility,
  announceStepChange,
  announceTourComplete,
  announceHintRevealed,
  isReduceMotionEnabled,
  isScreenReaderEnabled,
  getTourStepAccessibilityLabel,
  getNavigationButtonAccessibilityLabel,
  getHintAccessibilityHint,
  getProgressAccessibilityValue,
} from '../../src/utils/accessibility';
import { AccessibilityInfo, Platform } from 'react-native';

// Mock React Native modules
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    announceForAccessibility: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    isScreenReaderEnabled: jest.fn(),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('Accessibility Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('announceForAccessibility', () => {
    it('should call AccessibilityInfo.announceForAccessibility on iOS', () => {
      (Platform as any).OS = 'ios';
      announceForAccessibility('Test message');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Test message'
      );
    });

    it('should call AccessibilityInfo.announceForAccessibility on Android', () => {
      (Platform as any).OS = 'android';
      announceForAccessibility('Test message');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Test message'
      );
    });

    it('should not call AccessibilityInfo on web', () => {
      (Platform as any).OS = 'web';
      announceForAccessibility('Test message');
      expect(AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
    });
  });

  describe('announceStepChange', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should announce step number and title', () => {
      announceStepChange(0, 5, 'Welcome');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Step 1 of 5: Welcome'
      );
    });

    it('should announce step number and content when no title', () => {
      announceStepChange(2, 5, undefined, 'This is the content');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Step 3 of 5: This is the content'
      );
    });

    it('should truncate long content', () => {
      const longContent = 'A'.repeat(150);
      announceStepChange(0, 3, undefined, longContent);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        `Step 1 of 3: ${'A'.repeat(100)}...`
      );
    });

    it('should announce just step number when no title or content', () => {
      announceStepChange(1, 3);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Step 2 of 3'
      );
    });
  });

  describe('announceTourComplete', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should announce tour completed', () => {
      announceTourComplete('completed');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Tour completed'
      );
    });

    it('should announce tour skipped', () => {
      announceTourComplete('skipped');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Tour skipped'
      );
    });

    it('should announce tour dismissed', () => {
      announceTourComplete('dismissed');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Tour dismissed'
      );
    });
  });

  describe('announceHintRevealed', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should announce hint content', () => {
      announceHintRevealed('Click here to edit');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Hint: Click here to edit'
      );
    });
  });

  describe('isReduceMotionEnabled', () => {
    it('should return true when reduce motion is enabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(
        true
      );
      const result = await isReduceMotionEnabled();
      expect(result).toBe(true);
    });

    it('should return false when reduce motion is disabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(
        false
      );
      const result = await isReduceMotionEnabled();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );
      const result = await isReduceMotionEnabled();
      expect(result).toBe(false);
    });
  });

  describe('isScreenReaderEnabled', () => {
    it('should return true when screen reader is enabled', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(
        true
      );
      const result = await isScreenReaderEnabled();
      expect(result).toBe(true);
    });

    it('should return false when screen reader is disabled', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(
        false
      );
      const result = await isScreenReaderEnabled();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );
      const result = await isScreenReaderEnabled();
      expect(result).toBe(false);
    });
  });

  describe('getTourStepAccessibilityLabel', () => {
    it('should return label with title', () => {
      const label = getTourStepAccessibilityLabel(0, 5, 'Welcome');
      expect(label).toBe('Tour step 1 of 5: Welcome');
    });

    it('should return label without title', () => {
      const label = getTourStepAccessibilityLabel(2, 5);
      expect(label).toBe('Tour step 3 of 5');
    });
  });

  describe('getNavigationButtonAccessibilityLabel', () => {
    it('should return label for next button', () => {
      const label = getNavigationButtonAccessibilityLabel('next', 1, 5);
      expect(label).toBe('Go to step 3 of 5');
    });

    it('should return label for next button on last step', () => {
      const label = getNavigationButtonAccessibilityLabel('next', 4, 5);
      expect(label).toBe('Complete tour');
    });

    it('should return label for prev button', () => {
      const label = getNavigationButtonAccessibilityLabel('prev', 2, 5);
      expect(label).toBe('Go back to step 2 of 5');
    });

    it('should return disabled label for prev button on first step', () => {
      const label = getNavigationButtonAccessibilityLabel('prev', 0, 5);
      expect(label).toBe('Previous step (disabled)');
    });

    it('should return label for skip button', () => {
      const label = getNavigationButtonAccessibilityLabel('skip', 1, 5);
      expect(label).toBe('Skip the remaining tour');
    });

    it('should return label for done button', () => {
      const label = getNavigationButtonAccessibilityLabel('done', 4, 5);
      expect(label).toBe('Complete the tour');
    });
  });

  describe('getHintAccessibilityHint', () => {
    it('should return hint with content preview', () => {
      const hint = getHintAccessibilityHint('Click here to edit');
      expect(hint).toBe('Double tap to reveal: Click here to edit');
    });

    it('should truncate long content', () => {
      const longContent = 'A'.repeat(100);
      const hint = getHintAccessibilityHint(longContent);
      expect(hint).toBe(`Double tap to reveal: ${'A'.repeat(50)}...`);
    });

    it('should return default hint when no content', () => {
      const hint = getHintAccessibilityHint();
      expect(hint).toBe('Double tap to reveal hint');
    });
  });

  describe('getProgressAccessibilityValue', () => {
    it('should return correct values for first step', () => {
      const value = getProgressAccessibilityValue(0, 5);
      expect(value).toEqual({
        min: 0,
        max: 100,
        now: 20,
        text: '20% complete, step 1 of 5',
      });
    });

    it('should return correct values for middle step', () => {
      const value = getProgressAccessibilityValue(2, 5);
      expect(value).toEqual({
        min: 0,
        max: 100,
        now: 60,
        text: '60% complete, step 3 of 5',
      });
    });

    it('should return correct values for last step', () => {
      const value = getProgressAccessibilityValue(4, 5);
      expect(value).toEqual({
        min: 0,
        max: 100,
        now: 100,
        text: '100% complete, step 5 of 5',
      });
    });
  });
});
