/**
 * Component tests for IntroProvider
 *
 * Tests the context provider including:
 * - Basic rendering and context provision
 * - Theme resolution (classic, modern, dark, auto)
 * - Storage adapter integration
 * - TourOverlay rendering
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { IntroProvider } from '../../src/components/IntroProvider';
import { useIntroContext } from '../../src/context/useIntroContext';
import { useIntro } from '../../src/hooks/useIntro';
import type { StorageAdapter } from '../../src/types';

// Test component that uses the context
function TestConsumer() {
  const context = useIntroContext();
  return (
    <View testID="test-consumer">
      <Text testID="tour-state">{context.state.tour.state}</Text>
      <Text testID="persistence-initialized">
        {context.state.persistence.initialized ? 'true' : 'false'}
      </Text>
    </View>
  );
}

// Test component that uses useIntro hook
function HookConsumer({
  onMount,
}: {
  onMount?: (intro: ReturnType<typeof useIntro>) => void;
}) {
  const intro = useIntro();

  React.useEffect(() => {
    onMount?.(intro);
  }, [intro, onMount]);

  return (
    <View testID="hook-consumer">
      <Text testID="is-active">{intro.tour.isActive ? 'true' : 'false'}</Text>
    </View>
  );
}

describe('IntroProvider', () => {
  describe('basic rendering', () => {
    it('renders children', () => {
      const { getByTestId } = render(
        <IntroProvider>
          <Text testID="child">Hello</Text>
        </IntroProvider>
      );

      expect(getByTestId('child')).toBeTruthy();
    });

    it('provides context to consumers', () => {
      const { getByTestId } = render(
        <IntroProvider>
          <TestConsumer />
        </IntroProvider>
      );

      expect(getByTestId('tour-state')).toBeTruthy();
      expect(getByTestId('tour-state').props.children).toBe('idle');
    });

    it('supports useIntro hook', () => {
      const { getByTestId } = render(
        <IntroProvider>
          <HookConsumer />
        </IntroProvider>
      );

      expect(getByTestId('is-active').props.children).toBe('false');
    });
  });

  describe('theme prop', () => {
    it('uses classic theme by default', () => {
      const { getByTestId } = render(
        <IntroProvider>
          <TestConsumer />
        </IntroProvider>
      );

      // Provider renders without error, meaning theme resolved correctly
      expect(getByTestId('test-consumer')).toBeTruthy();
    });

    it('accepts classic theme', () => {
      const { getByTestId } = render(
        <IntroProvider theme="classic">
          <TestConsumer />
        </IntroProvider>
      );

      expect(getByTestId('test-consumer')).toBeTruthy();
    });

    it('accepts modern theme', () => {
      const { getByTestId } = render(
        <IntroProvider theme="modern">
          <TestConsumer />
        </IntroProvider>
      );

      expect(getByTestId('test-consumer')).toBeTruthy();
    });

    it('accepts dark theme', () => {
      const { getByTestId } = render(
        <IntroProvider theme="dark">
          <TestConsumer />
        </IntroProvider>
      );

      expect(getByTestId('test-consumer')).toBeTruthy();
    });

    it('accepts auto theme', () => {
      const { getByTestId } = render(
        <IntroProvider theme="auto">
          <TestConsumer />
        </IntroProvider>
      );

      expect(getByTestId('test-consumer')).toBeTruthy();
    });

    it('accepts custom theme object', () => {
      // Import a built-in theme and use it as a custom theme
      const { classicTheme } = require('../../src/themes');

      const { getByTestId } = render(
        <IntroProvider theme={classicTheme}>
          <TestConsumer />
        </IntroProvider>
      );

      expect(getByTestId('test-consumer')).toBeTruthy();
    });
  });

  describe('persistence', () => {
    it('initializes persistence state', async () => {
      const { getByTestId } = render(
        <IntroProvider>
          <TestConsumer />
        </IntroProvider>
      );

      // Wait for persistence to initialize
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(getByTestId('persistence-initialized').props.children).toBe(
        'true'
      );
    });

    it('accepts custom storage adapter', async () => {
      const customAdapter: StorageAdapter = {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      };

      const { getByTestId } = render(
        <IntroProvider storageAdapter={customAdapter}>
          <TestConsumer />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(customAdapter.getItem).toHaveBeenCalled();
      expect(getByTestId('test-consumer')).toBeTruthy();
    });

    it('loads persisted dismissed tours', async () => {
      const persistedData = JSON.stringify({
        version: 1,
        dismissedTours: ['dismissed-tour'],
        lastUpdated: new Date().toISOString(),
      });

      const customAdapter: StorageAdapter = {
        getItem: jest.fn().mockResolvedValue(persistedData),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      };

      const introRef = { current: null as ReturnType<typeof useIntro> | null };

      render(
        <IntroProvider storageAdapter={customAdapter}>
          <HookConsumer
            onMount={(intro) => {
              introRef.current = intro;
            }}
          />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(introRef.current?.tour.isDismissed('dismissed-tour')).toBe(true);
    });

    it('respects disablePersistence prop', async () => {
      const customAdapter: StorageAdapter = {
        getItem: jest.fn().mockResolvedValue(null),
        setItem: jest.fn().mockResolvedValue(undefined),
        removeItem: jest.fn().mockResolvedValue(undefined),
      };

      const { getByTestId } = render(
        <IntroProvider storageAdapter={customAdapter} disablePersistence={true}>
          <TestConsumer />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // Storage should not be accessed when persistence is disabled
      expect(customAdapter.getItem).not.toHaveBeenCalled();
      expect(getByTestId('persistence-initialized').props.children).toBe(
        'true'
      );
    });
  });

  describe('tour functionality', () => {
    it('starts a tour successfully', async () => {
      const introRef = { current: null as ReturnType<typeof useIntro> | null };

      const { getByTestId } = render(
        <IntroProvider>
          <HookConsumer
            onMount={(intro) => {
              introRef.current = intro;
            }}
          />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      await act(async () => {
        await introRef.current?.tour.start('test-tour', [
          { id: 'step-1', content: 'Step 1' },
          { id: 'step-2', content: 'Step 2' },
        ]);
      });

      expect(getByTestId('is-active').props.children).toBe('true');
    });

    it('provides tour navigation methods', async () => {
      const introRef = { current: null as ReturnType<typeof useIntro> | null };

      render(
        <IntroProvider>
          <HookConsumer
            onMount={(intro) => {
              introRef.current = intro;
            }}
          />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(introRef.current).not.toBeNull();
      expect(typeof introRef.current?.tour.start).toBe('function');
      expect(typeof introRef.current?.tour.next).toBe('function');
      expect(typeof introRef.current?.tour.prev).toBe('function');
      expect(typeof introRef.current?.tour.goTo).toBe('function');
      expect(typeof introRef.current?.tour.stop).toBe('function');
      expect(typeof introRef.current?.tour.restart).toBe('function');
    });
  });

  describe('hint functionality', () => {
    it('shows hints successfully', async () => {
      const introRef = { current: null as ReturnType<typeof useIntro> | null };

      render(
        <IntroProvider>
          <HookConsumer
            onMount={(intro) => {
              introRef.current = intro;
            }}
          />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      await act(async () => {
        introRef.current?.hints.show([
          { id: 'hint-1', targetId: 'target-1', content: 'Hint 1' },
        ]);
      });

      expect(introRef.current?.hints.isVisible).toBe(true);
    });

    it('provides hint control methods', async () => {
      const introRef = { current: null as ReturnType<typeof useIntro> | null };

      render(
        <IntroProvider>
          <HookConsumer
            onMount={(intro) => {
              introRef.current = intro;
            }}
          />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(typeof introRef.current?.hints.show).toBe('function');
      expect(typeof introRef.current?.hints.hide).toBe('function');
      expect(typeof introRef.current?.hints.showHint).toBe('function');
      expect(typeof introRef.current?.hints.hideHint).toBe('function');
      expect(typeof introRef.current?.hints.removeHint).toBe('function');
    });
  });

  describe('callbacks', () => {
    it('provides callback setters', async () => {
      const introRef = { current: null as ReturnType<typeof useIntro> | null };

      render(
        <IntroProvider>
          <HookConsumer
            onMount={(intro) => {
              introRef.current = intro;
            }}
          />
        </IntroProvider>
      );

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(typeof introRef.current?.callbacks.setTourCallbacks).toBe(
        'function'
      );
      expect(typeof introRef.current?.callbacks.setHintCallbacks).toBe(
        'function'
      );

      // Should not throw when setting callbacks
      await act(async () => {
        introRef.current?.callbacks.setTourCallbacks({
          onStart: jest.fn(),
          onComplete: jest.fn(),
        });
        introRef.current?.callbacks.setHintCallbacks({
          onHintsShow: jest.fn(),
          onHintsHide: jest.fn(),
        });
      });
    });
  });

  describe('nested providers', () => {
    it('throws when useIntroContext is used outside provider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useIntroContext must be used within an IntroProvider');

      consoleSpy.mockRestore();
    });
  });
});
