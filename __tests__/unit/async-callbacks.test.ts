/**
 * Comprehensive tests for async callback support
 *
 * Tests all async callback scenarios for tour lifecycle:
 * - onBeforeStart: Can prevent tour from starting
 * - onBeforeChange: Can prevent step navigation
 * - onBeforeExit: Can prevent tour from ending
 * - Async (Promise) vs sync (boolean) callback behavior
 * - Callback argument validation
 */

import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { useIntro } from '../../src/hooks/useIntro';
import { IntroProvider } from '../../src/components/IntroProvider';
import type { StepConfig } from '../../src/types';

// Wrapper component for hook tests
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(IntroProvider, null, children);
}

// Sample step configurations
const sampleSteps: StepConfig[] = [
  { id: 'step-1', targetId: 'target-1', content: 'First step' },
  { id: 'step-2', targetId: 'target-2', content: 'Second step' },
  { id: 'step-3', targetId: 'target-3', content: 'Third step' },
];

describe('Async Callbacks', () => {
  describe('onBeforeStart', () => {
    it('allows tour to start when returning true synchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeStart = jest.fn().mockReturnValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeStart });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(onBeforeStart).toHaveBeenCalledWith('my-tour');
      expect(result.current.tour.isActive).toBe(true);
    });

    it('allows tour to start when returning true asynchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeStart = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeStart });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(onBeforeStart).toHaveBeenCalledWith('my-tour');
      expect(result.current.tour.isActive).toBe(true);
    });

    it('prevents tour from starting when returning false synchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeStart = jest.fn().mockReturnValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeStart });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(onBeforeStart).toHaveBeenCalledWith('my-tour');
      expect(result.current.tour.isActive).toBe(false);
    });

    it('prevents tour from starting when returning false asynchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeStart = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeStart });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(onBeforeStart).toHaveBeenCalledWith('my-tour');
      expect(result.current.tour.isActive).toBe(false);
    });

    it('waits for async callback before starting tour', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      // Create a delayed async callback
      const onBeforeStart = jest.fn().mockImplementation(async () => {
        // Simulate async operation (e.g., API call)
        await new Promise((resolve) => setTimeout(resolve, 10));
        return true;
      });

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeStart });
      });

      // Start the tour - it should wait for the async callback
      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // After awaiting, the callback should have been called and tour started
      expect(onBeforeStart).toHaveBeenCalledWith('my-tour');
      expect(result.current.tour.isActive).toBe(true);
    });
  });

  describe('onBeforeChange', () => {
    it('allows step change when returning true synchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeChange = jest.fn().mockReturnValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(onBeforeChange).toHaveBeenCalledWith(0, 1, 'next');
      expect(result.current.tour.currentStep).toBe(1);
    });

    it('allows step change when returning true asynchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeChange = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(onBeforeChange).toHaveBeenCalledWith(0, 1, 'next');
      expect(result.current.tour.currentStep).toBe(1);
    });

    it('prevents step change when returning false synchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeChange = jest.fn().mockReturnValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(onBeforeChange).toHaveBeenCalledWith(0, 1, 'next');
      expect(result.current.tour.currentStep).toBe(0);
    });

    it('prevents step change when returning false asynchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeChange = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(onBeforeChange).toHaveBeenCalledWith(0, 1, 'next');
      expect(result.current.tour.currentStep).toBe(0);
    });

    it('passes correct direction for prev navigation', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeChange = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // Move to step 1
      await act(async () => {
        await result.current.tour.next();
      });

      // Go back
      await act(async () => {
        await result.current.tour.prev();
      });

      expect(onBeforeChange).toHaveBeenLastCalledWith(1, 0, 'prev');
    });

    it('passes correct direction for goTo navigation', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeChange = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.goTo(2);
      });

      expect(onBeforeChange).toHaveBeenCalledWith(0, 2, 'goto');
    });

    it('can conditionally block based on step index', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      // Block navigation to step 2
      const onBeforeChange = jest
        .fn()
        .mockImplementation((_current, next) => next !== 2);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // Navigate to step 1 - should work
      await act(async () => {
        await result.current.tour.next();
      });
      expect(result.current.tour.currentStep).toBe(1);

      // Navigate to step 2 - should be blocked
      await act(async () => {
        await result.current.tour.next();
      });
      expect(result.current.tour.currentStep).toBe(1);

      // Direct goTo step 2 - should also be blocked
      await act(async () => {
        await result.current.tour.goTo(2);
      });
      expect(result.current.tour.currentStep).toBe(1);
    });
  });

  describe('onBeforeExit', () => {
    it('allows tour exit when returning true synchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeExit = jest.fn().mockReturnValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeExit });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('dismissed');
      });

      expect(onBeforeExit).toHaveBeenCalledWith('dismissed');
      expect(result.current.tour.isActive).toBe(false);
    });

    it('allows tour exit when returning true asynchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeExit = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeExit });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('skipped');
      });

      expect(onBeforeExit).toHaveBeenCalledWith('skipped');
      expect(result.current.tour.isActive).toBe(false);
    });

    it('prevents tour exit when returning false synchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeExit = jest.fn().mockReturnValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeExit });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('dismissed');
      });

      expect(onBeforeExit).toHaveBeenCalledWith('dismissed');
      expect(result.current.tour.isActive).toBe(true);
    });

    it('prevents tour exit when returning false asynchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeExit = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeExit });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('dismissed');
      });

      expect(onBeforeExit).toHaveBeenCalledWith('dismissed');
      expect(result.current.tour.isActive).toBe(true);
    });

    it('is called with completed reason when finishing tour', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onBeforeExit = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeExit });
      });

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

      // Next on last step ends tour
      await act(async () => {
        await result.current.tour.next();
      });

      expect(onBeforeExit).toHaveBeenCalledWith('completed');
    });

    it('can implement confirmation dialog pattern', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      let confirmationResult = false;
      const onBeforeExit = jest.fn().mockImplementation(async () => {
        // Simulate async confirmation dialog
        return confirmationResult;
      });

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeExit });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // First attempt - user cancels confirmation
      await act(async () => {
        await result.current.tour.stop('dismissed');
      });
      expect(result.current.tour.isActive).toBe(true);

      // Second attempt - user confirms
      confirmationResult = true;
      await act(async () => {
        await result.current.tour.stop('dismissed');
      });
      expect(result.current.tour.isActive).toBe(false);
    });
  });

  describe('onStart callback', () => {
    it('is called after tour successfully starts', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const callOrder: string[] = [];
      const onStart = jest.fn().mockImplementation(() => {
        callOrder.push('onStart');
      });
      const onBeforeStart = jest.fn().mockImplementation(async () => {
        callOrder.push('onBeforeStart');
        return true;
      });

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onStart, onBeforeStart });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // Verify onBeforeStart was called before onStart
      expect(callOrder).toEqual(['onBeforeStart', 'onStart']);
      expect(onStart).toHaveBeenCalledWith('my-tour');
    });

    it('is not called when onBeforeStart returns false', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onStart = jest.fn();
      const onBeforeStart = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onStart, onBeforeStart });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      expect(onBeforeStart).toHaveBeenCalled();
      expect(onStart).not.toHaveBeenCalled();
    });
  });

  describe('onChange callback', () => {
    it('is called after step successfully changes', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onChange = jest.fn();
      const onBeforeChange = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onChange, onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(onChange).toHaveBeenCalledWith(1, 0);
    });

    it('is not called when onBeforeChange returns false', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onChange = jest.fn();
      const onBeforeChange = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onChange, onBeforeChange });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.next();
      });

      expect(onBeforeChange).toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('onComplete callback', () => {
    it('is called after tour successfully ends', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onComplete = jest.fn();
      const onBeforeExit = jest.fn().mockResolvedValue(true);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onComplete, onBeforeExit });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('dismissed');
      });

      expect(onComplete).toHaveBeenCalledWith('my-tour', 'dismissed');
    });

    it('is not called when onBeforeExit returns false', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onComplete = jest.fn();
      const onBeforeExit = jest.fn().mockResolvedValue(false);

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onComplete, onBeforeExit });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('dismissed');
      });

      expect(onBeforeExit).toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });

    it('receives correct reason for completed tours', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onComplete = jest.fn();

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onComplete });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // Navigate through all steps
      await act(async () => {
        await result.current.tour.next();
      });
      await act(async () => {
        await result.current.tour.next();
      });
      await act(async () => {
        await result.current.tour.next();
      });

      expect(onComplete).toHaveBeenCalledWith('my-tour', 'completed');
    });

    it('receives correct reason for skipped tours', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const onComplete = jest.fn();

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onComplete });
      });

      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      await act(async () => {
        await result.current.tour.stop('skipped');
      });

      expect(onComplete).toHaveBeenCalledWith('my-tour', 'skipped');
    });
  });

  describe('callback error handling', () => {
    it('handles callback that throws synchronously', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const onBeforeStart = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeStart });
      });

      // Should not throw but may log error
      await expect(
        act(async () => {
          await result.current.tour.start('my-tour', sampleSteps);
        })
      ).rejects.toThrow('Callback error');

      consoleSpy.mockRestore();
    });

    it('handles callback that rejects', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const onBeforeStart = jest
        .fn()
        .mockRejectedValue(new Error('Async callback error'));

      await act(async () => {
        result.current.callbacks.setTourCallbacks({ onBeforeStart });
      });

      // Should reject with the error
      await expect(
        act(async () => {
          await result.current.tour.start('my-tour', sampleSteps);
        })
      ).rejects.toThrow('Async callback error');

      consoleSpy.mockRestore();
    });
  });

  describe('multiple callbacks', () => {
    it('executes all callbacks in correct order', async () => {
      const { result } = renderHook(() => useIntro(), { wrapper });

      const callOrder: string[] = [];

      const onBeforeStart = jest.fn().mockImplementation(async () => {
        callOrder.push('onBeforeStart');
        return true;
      });

      const onStart = jest.fn().mockImplementation(() => {
        callOrder.push('onStart');
      });

      const onBeforeChange = jest.fn().mockImplementation(async () => {
        callOrder.push('onBeforeChange');
        return true;
      });

      const onChange = jest.fn().mockImplementation(() => {
        callOrder.push('onChange');
      });

      const onBeforeExit = jest.fn().mockImplementation(async () => {
        callOrder.push('onBeforeExit');
        return true;
      });

      const onComplete = jest.fn().mockImplementation(() => {
        callOrder.push('onComplete');
      });

      await act(async () => {
        result.current.callbacks.setTourCallbacks({
          onBeforeStart,
          onStart,
          onBeforeChange,
          onChange,
          onBeforeExit,
          onComplete,
        });
      });

      // Start tour
      await act(async () => {
        await result.current.tour.start('my-tour', sampleSteps);
      });

      // Navigate
      await act(async () => {
        await result.current.tour.next();
      });

      // Stop tour
      await act(async () => {
        await result.current.tour.stop();
      });

      expect(callOrder).toEqual([
        'onBeforeStart',
        'onStart',
        'onBeforeChange',
        'onChange',
        'onBeforeExit',
        'onComplete',
      ]);
    });
  });
});
