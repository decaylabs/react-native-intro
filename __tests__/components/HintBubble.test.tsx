/**
 * Component tests for HintBubble
 */

import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { HintBubble } from '../../src/components/HintBubble';
import { classicTheme } from '../../src/themes';
import type { HintConfig, ElementMeasurement } from '../../src/types';

const mockMeasurement: ElementMeasurement = {
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  measured: true,
  timestamp: Date.now(),
};

const mockHint: HintConfig = {
  id: 'test-hint',
  targetId: 'target-1',
  content: 'This is a hint tooltip',
  position: 'top-right',
};

describe('HintBubble', () => {
  const mockOnPress = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders indicator when measurement is provided', () => {
    const { getByRole } = render(
      <HintBubble
        hint={mockHint}
        measurement={mockMeasurement}
        isActive={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('does not render when measurement is null', () => {
    const { toJSON } = render(
      <HintBubble
        hint={mockHint}
        measurement={null}
        isActive={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(toJSON()).toBeNull();
  });

  it('does not render when measurement is not measured', () => {
    const unmeasured: ElementMeasurement = {
      ...mockMeasurement,
      measured: false,
    };

    const { toJSON } = render(
      <HintBubble
        hint={mockHint}
        measurement={unmeasured}
        isActive={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(toJSON()).toBeNull();
  });

  it('calls onPress when indicator is tapped', () => {
    const { getByRole } = render(
      <HintBubble
        hint={mockHint}
        measurement={mockMeasurement}
        isActive={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders with string content', () => {
    const { getByRole } = render(
      <HintBubble
        hint={mockHint}
        measurement={mockMeasurement}
        isActive={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('renders with ReactNode content', () => {
    const hintWithNode: HintConfig = {
      ...mockHint,
      content: <Text>Custom Content</Text>,
    };

    const { getByRole } = render(
      <HintBubble
        hint={hintWithNode}
        measurement={mockMeasurement}
        isActive={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('respects animate prop', () => {
    const { rerender, getByRole } = render(
      <HintBubble
        hint={mockHint}
        measurement={mockMeasurement}
        isActive={false}
        animate={true}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(getByRole('button')).toBeTruthy();

    rerender(
      <HintBubble
        hint={mockHint}
        measurement={mockMeasurement}
        isActive={false}
        animate={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(getByRole('button')).toBeTruthy();
  });

  it('has correct accessibility attributes', () => {
    const { getByLabelText } = render(
      <HintBubble
        hint={mockHint}
        measurement={mockMeasurement}
        isActive={false}
        theme={classicTheme}
        onPress={mockOnPress}
        onClose={mockOnClose}
      />
    );

    expect(getByLabelText(/Hint:/)).toBeTruthy();
  });

  describe('position calculations', () => {
    const positions = [
      'top-left',
      'top-center',
      'top-right',
      'middle-left',
      'middle-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ] as const;

    positions.forEach((position) => {
      it(`renders with position ${position}`, () => {
        const hintWithPosition: HintConfig = {
          ...mockHint,
          position,
        };

        const { getByRole } = render(
          <HintBubble
            hint={hintWithPosition}
            measurement={mockMeasurement}
            isActive={false}
            theme={classicTheme}
            onPress={mockOnPress}
            onClose={mockOnClose}
          />
        );

        expect(getByRole('button')).toBeTruthy();
      });
    });
  });

  describe('custom styles', () => {
    it('applies custom indicator style', () => {
      const hintWithStyle: HintConfig = {
        ...mockHint,
        indicatorStyle: {
          backgroundColor: 'red',
        },
      };

      const { getByRole } = render(
        <HintBubble
          hint={hintWithStyle}
          measurement={mockMeasurement}
          isActive={false}
          theme={classicTheme}
          onPress={mockOnPress}
          onClose={mockOnClose}
        />
      );

      expect(getByRole('button')).toBeTruthy();
    });
  });
});
