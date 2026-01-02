/**
 * Hook tests for useTour
 */

import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { useTour } from '../../src/hooks/useTour';
import { IntroProvider } from '../../src/components/IntroProvider';

// Wrapper component for hook tests
function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(IntroProvider, null, children);
}

describe('useTour', () => {
  describe('initial state', () => {
    it('returns inactive tour state initially', () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      expect(result.current.isActive).toBe(false);
      expect(result.current.tourId).toBeNull();
      expect(result.current.currentStep).toBe(0);
      expect(result.current.totalSteps).toBe(0);
      expect(result.current.currentStepConfig).toBeNull();
      expect(result.current.isTransitioning).toBe(false);
    });

    it('provides control methods', () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      expect(typeof result.current.start).toBe('function');
      expect(typeof result.current.next).toBe('function');
      expect(typeof result.current.prev).toBe('function');
      expect(typeof result.current.goTo).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.restart).toBe('function');
      expect(typeof result.current.isDismissed).toBe('function');
      expect(typeof result.current.clearDismissed).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.setCallbacks).toBe('function');
    });
  });

  describe('tour lifecycle', () => {
    it('starts a tour', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      await act(async () => {
        await result.current.start('test-tour', [
          { id: 'step-1', content: 'First step' },
          { id: 'step-2', content: 'Second step' },
        ]);
      });

      expect(result.current.isActive).toBe(true);
      expect(result.current.tourId).toBe('test-tour');
      expect(result.current.currentStep).toBe(0);
      expect(result.current.totalSteps).toBe(2);
    });

    it('goes to next step', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      await act(async () => {
        await result.current.start('test-tour', [
          { id: 'step-1', content: 'First' },
          { id: 'step-2', content: 'Second' },
          { id: 'step-3', content: 'Third' },
        ]);
      });

      expect(result.current.currentStep).toBe(0);

      await act(async () => {
        await result.current.next();
      });

      expect(result.current.currentStep).toBe(1);
    });

    it('goes to previous step', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      await act(async () => {
        await result.current.start('test-tour', [
          { id: 'step-1', content: 'First' },
          { id: 'step-2', content: 'Second' },
        ]);
      });

      await act(async () => {
        await result.current.next();
      });

      expect(result.current.currentStep).toBe(1);

      await act(async () => {
        await result.current.prev();
      });

      expect(result.current.currentStep).toBe(0);
    });

    it('goes to specific step', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      await act(async () => {
        await result.current.start('test-tour', [
          { id: 'step-1', content: 'First' },
          { id: 'step-2', content: 'Second' },
          { id: 'step-3', content: 'Third' },
        ]);
      });

      await act(async () => {
        await result.current.goTo(2);
      });

      expect(result.current.currentStep).toBe(2);
    });

    it('stops the tour', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      await act(async () => {
        await result.current.start('test-tour', [
          { id: 'step-1', content: 'Step' },
        ]);
      });

      expect(result.current.isActive).toBe(true);

      await act(async () => {
        await result.current.stop();
      });

      expect(result.current.isActive).toBe(false);
    });

    it('restarts the tour', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      await act(async () => {
        await result.current.start('test-tour', [
          { id: 'step-1', content: 'First' },
          { id: 'step-2', content: 'Second' },
        ]);
      });

      await act(async () => {
        await result.current.next();
      });

      expect(result.current.currentStep).toBe(1);

      await act(async () => {
        result.current.restart();
      });

      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('dismissed tours', () => {
    it('checks if tour is dismissed', () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      expect(result.current.isDismissed('some-tour')).toBe(false);
    });

    it('clears dismissed state', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      // Start and stop with dismiss
      await act(async () => {
        await result.current.start('test-tour', [
          { id: 'step-1', content: 'Step' },
        ]);
      });

      // The tour should be running, so we clear dismissed
      await act(async () => {
        result.current.clearDismissed('test-tour');
      });

      expect(result.current.isDismissed('test-tour')).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('accepts callbacks', async () => {
      const { result } = renderHook(() => useTour(), { wrapper });

      const onStart = jest.fn();
      const onComplete = jest.fn();

      await act(async () => {
        result.current.setCallbacks({
          onStart,
          onComplete,
        });
      });

      // Note: Callbacks are stored but we can't easily verify
      // they're called without triggering the full tour flow
      // This just verifies the method doesn't throw
    });
  });

  describe('error handling', () => {
    it('throws when used outside IntroProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useTour());
      }).toThrow('useIntroContext must be used within an IntroProvider');

      consoleSpy.mockRestore();
    });
  });
});
