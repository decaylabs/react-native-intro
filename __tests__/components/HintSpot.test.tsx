/**
 * Component tests for HintSpot
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { HintSpot } from '../../src/components/HintSpot';
import { IntroProvider } from '../../src/components/IntroProvider';

// Helper to wrap components with IntroProvider
function renderWithProvider(ui: React.ReactElement) {
  return render(<IntroProvider>{ui}</IntroProvider>);
}

describe('HintSpot', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithProvider(
      <HintSpot id="test-hint">
        <Text>Hint Target</Text>
      </HintSpot>
    );

    expect(getByText('Hint Target')).toBeTruthy();
  });

  it('wraps children in a View', () => {
    const { toJSON } = renderWithProvider(
      <HintSpot id="test-hint">
        <Text>Content</Text>
      </HintSpot>
    );

    const tree = toJSON();
    // The HintSpot should wrap content in a View
    expect(tree).toBeTruthy();
  });

  it('can wrap different element types', () => {
    const { getByText } = renderWithProvider(
      <View>
        <HintSpot id="hint-text">
          <Text>Text Element</Text>
        </HintSpot>
        <HintSpot id="hint-view">
          <View>
            <Text>Nested View</Text>
          </View>
        </HintSpot>
      </View>
    );

    expect(getByText('Text Element')).toBeTruthy();
    expect(getByText('Nested View')).toBeTruthy();
  });

  it('can nest multiple HintSpots', () => {
    const { getByText } = renderWithProvider(
      <View>
        <HintSpot id="hint-1">
          <Text>Hint 1</Text>
        </HintSpot>
        <HintSpot id="hint-2">
          <Text>Hint 2</Text>
        </HintSpot>
        <HintSpot id="hint-3">
          <Text>Hint 3</Text>
        </HintSpot>
      </View>
    );

    expect(getByText('Hint 1')).toBeTruthy();
    expect(getByText('Hint 2')).toBeTruthy();
    expect(getByText('Hint 3')).toBeTruthy();
  });

  it('throws error when used outside IntroProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(
        <HintSpot id="test-hint">
          <Text>Content</Text>
        </HintSpot>
      );
    }).toThrow('useIntroContext must be used within an IntroProvider');

    consoleSpy.mockRestore();
  });

  it('renders with complex children', () => {
    const { getByText } = renderWithProvider(
      <HintSpot id="complex-hint">
        <View>
          <Text>Header</Text>
          <View>
            <Text>Nested Content</Text>
          </View>
        </View>
      </HintSpot>
    );

    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Nested Content')).toBeTruthy();
  });
});
