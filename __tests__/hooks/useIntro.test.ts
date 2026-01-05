/**
 * Hook tests for useIntro - Programmatic Tour Control
 *
 * Tests the combined tour and hints API, covering:
 * - Tour lifecycle (start, next, prev, goTo, stop, restart)
 * - State queries (isActive, currentStep, totalSteps, currentStepConfig)
 * - Dismissed tour management (isDismissed, clearDismissed)
 * - Hint controls (show, hide, showHint, hideHint, removeHint)
 * - Callbacks integration
 * - refresh() for re-measuring elements
 */

import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { useIntro } from '../../src/hooks/useIntro';
import { IntroProvider } from '../../src/components/IntroProvider';
import type { StepConfig, HintConfig } from '../../src/types';

// Wrapper component for hook tests
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(IntroProvider, null, children);
}

// Sample step configurations
const sampleSteps: StepConfig[] = [
  { id: 'step-1', targetId: 'target-1', content: 'First step content' },
  { id: 'step-2', targetId: 'target-2', content: 'Second step content' },
  { id: 'step-3', targetId: 'target-3', content: 'Third step content' },
];

// Sample hint configurations
const sampleHints: HintConfig[] = [
  { id: 'hint-1', targetId: 'target-1', content: 'First hint' },
  { id: 'hint-2', targetId: 'target-2', content: 'Second hint' },
];

describe('useIntro', () => {
  describe('initial state', () => {
    it('returns the correct initial tour state', () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(result.current.tour.isActive).toBe(false);
      expect(result.current.tour.tourId).toBeNull();
      expect(result.current.tour.currentStep).toBe(0);
      expect(result.current.tour.totalSteps).toBe(0);
      expect(result.current.tour.currentStepConfig).toBeNull();
      expect(result.current.tour.isTransitioning).toBe(false);
    });

    it('returns the correct initial hints state', () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(result.current.hints.isVisible).toBe(false);
      expect(result.current.hints.activeHintId).toBeNull();
      expect(result.current.hints.hints).toEqual([]);
    });

    it('provides all tour control methods', () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(typeof result.current.tour.start).toBe('function');
      expect(typeof result.current.tour.next).toBe('function');
      expect(typeof result.current.tour.prev).toBe('function');
      expect(typeof result.current.tour.goTo).toBe('function');
      expect(typeof result.current.tour.stop).toBe('function');
      expect(typeof result.current.tour.restart).toBe('function');
      expect(typeof result.current.tour.isDismissed).toBe('function');
      expect(typeof result.current.tour.clearDismissed).toBe('function');
      expect(typeof result.current.tour.refresh).toBe('function');
    });

    it('provides all hint control methods', () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(typeof result.current.hints.show).toBe('function');
      expect(typeof result.current.hints.hide).toBe('function');
      expect(typeof result.current.hints.showHint).toBe('function');
      expect(typeof result.current.hints.hideHint).toBe('function');
      expect(typeof result.current.hints.removeHint).toBe('function');
      expect(typeof result.current.hints.refresh).toBe('function');
    });

    it('provides callback setters', () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(typeof result.current.callbacks.setTourCallbacks).toBe('function');
      expect(typeof result.current.callbacks.setHintCallbacks).toBe('function');
    });
  });

  describe('tour lifecycle', () => {
    it('starts a tour with explicit steps', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(result.current.tour.isActive).toBe(true);
      expect(result.current.tour.tourId).toBe('my-tour');
      expect(result.current.tour.currentStep).toBe(0);
      expect(result.current.tour.totalSteps).toBe(3);
      expect(result.current.tour.currentStepConfig).toEqual(sampleSteps[0]);
    });

    it('starts a tour with options', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps, {
          showProgress: true,
          showBullets: false,
        });
      });

      expect(result.current.tour.isActive).toBe(true);
      expect(result.current.tour.tourId).toBe('my-tour');
    });

    it('navigates to next step', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(result.current.tour.currentStep).toBe(0);

      await act(async () => {
        await result.current.tour.next();
      });

      expect(result.current.tour.currentStep).toBe(1);
      expect(result.current.tour.currentStepConfig).toEqual(sampleSteps[1]);
    });

    it('navigates to previous step', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(result.current.tour.currentStep).toBe(1);

      await act(async () => {
        await result.current.tour.prev();
      });

      expect(result.current.tour.currentStep).toBe(0);
    });

    it('does not go below step 0', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(result.current.tour.currentStep).toBe(0);

      await act(async () => {
        await result.current.tour.prev();
      });

      expect(result.current.tour.currentStep).toBe(0);
    });

    it('stops the tour when next() is called on last step', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // Navigate to last step
      await act(async () => {
        await result.current.tour.next();
      });
      await act(async () => {
        await result.current.tour.next();
      });

      expect(result.current.tour.currentStep).toBe(2);

      // Next on last step ends tour
      await act(async () => {
        await result.current.tour.next();
      });

      expect(result.current.tour.isActive).toBe(false);
    });

    it('stops the tour manually', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(result.current.tour.isActive).toBe(true);

      await act(async () => {
        await result.current.tour.stop();
      });

      expect(result.current.tour.isActive).toBe(false);
    });
  });

  describe('goToStep', () => {
    it('navigates to a specific step by index', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.goTo(2);
      });

      expect(result.current.tour.currentStep).toBe(2);
      expect(result.current.tour.currentStepConfig).toEqual(sampleSteps[2]);
    });

    it('navigates backwards using goTo', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.goTo(2);
      });

      await act(async () => {
        await result.current.tour.goTo(0);
      });

      expect(result.current.tour.currentStep).toBe(0);
    });

    it('ignores invalid step index (negative)', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.goTo(-1);
      });

      expect(result.current.tour.currentStep).toBe(0);
    });

    it('ignores invalid step index (beyond total)', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.goTo(10);
      });

      expect(result.current.tour.currentStep).toBe(0);
    });

    it('ignores goTo when already at target step', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.goTo(0);
      });

      expect(result.current.tour.currentStep).toBe(0);
    });
  });

  describe('restart', () => {
    it('restarts the tour from step 0', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });
      await act(async () => {
        await result.current.tour.next();
      });

      expect(result.current.tour.currentStep).toBe(2);

      await act(async () => {
        result.current.tour.restart();
      });

      expect(result.current.tour.currentStep).toBe(0);
      expect(result.current.tour.isActive).toBe(true);
    });
  });

  describe('state queries', () => {
    it('tracks isActive state correctly', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(result.current.tour.isActive).toBe(false);

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(result.current.tour.isActive).toBe(true);

      await act(async () => {
        await result.current.tour.stop();
      });

      expect(result.current.tour.isActive).toBe(false);
    });

    it('tracks currentStep correctly through navigation', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      const steps = [0, 1, 2, 1, 0];
      let expectedStep = 0;

      for (const targetStep of steps) {
        if (targetStep > expectedStep) {
          await act(async () => {
            await result.current.tour.next();
          });
        } else if (targetStep < expectedStep) {
          await act(async () => {
            await result.current.tour.prev();
          });
        }
        expectedStep = targetStep;
        expect(result.current.tour.currentStep).toBe(expectedStep);
      }
    });

    it('tracks totalSteps correctly', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(result.current.tour.totalSteps).toBe(0);

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(result.current.tour.totalSteps).toBe(3);
    });

    it('tracks currentStepConfig correctly', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(result.current.tour.currentStepConfig).toBeNull();

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(result.current.tour.currentStepConfig).toEqual(sampleSteps[0]);

      await act(async () => {
        await result.current.tour.next();
      });

      expect(result.current.tour.currentStepConfig).toEqual(sampleSteps[1]);
    });

    it('tracks tourId correctly', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(result.current.tour.tourId).toBeNull();

      await act(async () => {
        await result.current.tour.start('unique-tour-id', sampleSteps);
      });

      expect(result.current.tour.tourId).toBe('unique-tour-id');
    });
  });

  describe('dismissed tour management', () => {
    it('returns false for non-dismissed tours', () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      expect(result.current.tour.isDismissed('some-tour')).toBe(false);
    });

    it('clearDismissed does not throw for non-dismissed tour', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        result.current.tour.clearDismissed('some-tour');
      });

      expect(result.current.tour.isDismissed('some-tour')).toBe(false);
    });
  });

  describe('refresh', () => {
    it('refresh() does not throw when called', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // refresh() should not throw
      await act(async () => {
        result.current.tour.refresh();
      });

      expect(result.current.tour.isActive).toBe(true);
    });
  });

  describe('hint controls', () => {
    it('shows hints', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        result.current.hints.show(sampleHints);
      });

      expect(result.current.hints.isVisible).toBe(true);
      expect(result.current.hints.hints).toEqual(sampleHints);
    });

    it('hides hints', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        result.current.hints.show(sampleHints);
      });

      expect(result.current.hints.isVisible).toBe(true);

      await act(async () => {
        result.current.hints.hide();
      });

      expect(result.current.hints.isVisible).toBe(false);
    });

    it('shows a specific hint', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        result.current.hints.show(sampleHints);
      });

      await act(async () => {
        result.current.hints.showHint('hint-1');
      });

      expect(result.current.hints.activeHintId).toBe('hint-1');
    });

    it('hides a specific hint', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        result.current.hints.show(sampleHints);
      });

      await act(async () => {
        result.current.hints.showHint('hint-1');
      });

      expect(result.current.hints.activeHintId).toBe('hint-1');

      await act(async () => {
        result.current.hints.hideHint('hint-1');
      });

      expect(result.current.hints.activeHintId).toBeNull();
    });

    it('removes a hint from the list', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        result.current.hints.show(sampleHints);
      });

      expect(result.current.hints.hints.length).toBe(2);

      await act(async () => {
        result.current.hints.removeHint('hint-1');
      });

      expect(result.current.hints.hints.length).toBe(1);
      expect(result.current.hints.hints[0]?.id).toBe('hint-2');
    });

    it('hint refresh() does not throw', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        result.current.hints.show(sampleHints);
      });

      await act(async () => {
        result.current.hints.refresh();
      });

      expect(result.current.hints.isVisible).toBe(true);
    });
  });

  describe('callbacks', () => {
    it('sets tour callbacks', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onStart = jest.fn();
      const onComplete = jest.fn();

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onStart,
          onComplete,
        });
      });

      // Verify callbacks can be set without throwing
      expect(typeof result.current.callbacks.setTourCallbacks).toBe('function');
    });

    it('sets hint callbacks', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onHintClick = jest.fn();
      const onHintClose = jest.fn();

      await act(async () => {
        result.current.callbacks.setHintCallbacks({
          onHintClick,
          onHintClose,
        });
      });

      // Verify callbacks can be set without throwing
      expect(typeof result.current.callbacks.setHintCallbacks).toBe('function');
    });

    it('calls onStart callback when tour starts', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onStart = jest.fn();

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onStart,
        });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(onStart).toHaveBeenCalledWith('my-tour');
    });

    it('calls onComplete callback when tour ends', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onComplete = jest.fn();

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onComplete,
        });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('dismissed');
      });

      expect(onComplete).toHaveBeenCalledWith('my-tour', 'dismissed');
    });

    it('calls onChange callback on step change', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onChange = jest.fn();

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onChange,
        });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(onChange).toHaveBeenCalledWith(1, 0);
    });

    it('calls onChange with correct args for goTo', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onChange = jest.fn();

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onChange,
        });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.goTo(2);
      });

      expect(onChange).toHaveBeenCalledWith(2, 0);
    });

    it('respects onBeforeChange returning false', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeChange = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onBeforeChange,
        });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      // Step should not have changed
      expect(result.current.tour.currentStep).toBe(0);
      expect(onBeforeChange).toHaveBeenCalledWith(0, 1, 'next');
    });

    it('respects onBeforeExit returning false', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeExit = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onBeforeExit,
        });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop();
      });

      // Tour should still be active
      expect(result.current.tour.isActive).toBe(true);
      expect(onBeforeExit).toHaveBeenCalledWith('dismissed');
    });

    it('calls hint callbacks on hint interactions', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onHintClick = jest.fn();
      const onHintClose = jest.fn();

      await act(async () => {
        result.current.callbacks.setHintCallbacks({
          onHintClick,
          onHintClose,
        });
      });

      await act(async () => {
        result.current.hints.show(sampleHints);
      });

      await act(async () => {
        result.current.hints.showHint('hint-1');
      });

      expect(onHintClick).toHaveBeenCalledWith('hint-1');

      await act(async () => {
        result.current.hints.hideHint('hint-1');
      });

      expect(onHintClose).toHaveBeenCalledWith('hint-1');
    });
  });

  describe('error handling', () => {
    it('throws when used outside IntroProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useIntro());
      }).toThrow('useIntro must be used within an IntroProvider');

      consoleSpy.mockRestore();
    });

    it('warns when starting tour with no steps', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await act(async () => {
        await result.current.tour.start('empty-tour', []);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No steps found')
      );

      consoleSpy.mockRestore();
    });

    it('warns when showing hints with no hints', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await act(async () => {
        result.current.hints.show([]);
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No hints found')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('multiple operations', () => {
    it('handles rapid step changes correctly', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // Rapid navigation: next (0->1), next (1->2), prev (2->1)
      await act(async () => {
        await result.current.tour.next();
      });
      await act(async () => {
        await result.current.tour.next();
      });
      await act(async () => {
        await result.current.tour.prev();
      });

      expect(result.current.tour.currentStep).toBe(1);
    });

    it('prevents starting a new tour while one is active', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });
      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      await act(async () => {
        await result.current.tour.start('tour-1', sampleSteps);
      });

      expect(result.current.tour.tourId).toBe('tour-1');
      expect(result.current.tour.totalSteps).toBe(3);

      const newSteps: StepConfig[] = [
        { id: 'new-step', content: 'New content' },
      ];

      // Attempting to start a new tour while one is active should be ignored
      await act(async () => {
        await result.current.tour.start('tour-2', newSteps);
      });

      // Original tour should still be active
      expect(result.current.tour.tourId).toBe('tour-1');
      expect(result.current.tour.totalSteps).toBe(3);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot start tour')
      );

      consoleSpy.mockRestore();
    });

    it('allows starting a new tour after stopping the current one', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      await act(async () => {
        await result.current.tour.start('tour-1', sampleSteps);
      });

      expect(result.current.tour.tourId).toBe('tour-1');

      // Stop the first tour
      await act(async () => {
        await result.current.tour.stop();
      });

      const newSteps: StepConfig[] = [
        { id: 'new-step', content: 'New content' },
      ];

      // Now starting a new tour should work
      await act(async () => {
        await result.current.tour.start('tour-2', newSteps);
      });

      expect(result.current.tour.tourId).toBe('tour-2');
      expect(result.current.tour.totalSteps).toBe(1);
    });
  });
});
