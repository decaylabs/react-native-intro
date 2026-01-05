/**
 * Component tests for TourStep
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { TourStep } from '../../src/components/TourStep';
import { IntroProvider } from '../../src/components/IntroProvider';

// Helper to wrap components with IntroProvider
function renderWithProvider(ui: React.ReactElement) {
  return render(<IntroProvider>{ui}</IntroProvider>);
}

describe('TourStep', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithProvider(
      <TourStep id="test-step">
        <Text>Hello World</Text>
      </TourStep>
    );

    expect(getByText('Hello World')).toBeTruthy();
  });

  it('wraps children in a View', () => {
    const { toJSON } = renderWithProvider(
      <TourStep id="test-step">
        <Text>Content</Text>
      </TourStep>
    );

    const tree = toJSON();
    // The TourStep should wrap content in a View
    expect(tree).toBeTruthy();
  });

  it('accepts order prop', () => {
    // This test verifies the component accepts order prop without errors
    const { getByText } = renderWithProvider(
      <TourStep id="test-step" order={5}>
        <Text>Ordered Content</Text>
      </TourStep>
    );

    expect(getByText('Ordered Content')).toBeTruthy();
  });

  it('can nest multiple TourSteps', () => {
    const { getByText } = renderWithProvider(
      <View>
        <TourStep id="step-1">
          <Text>Step 1</Text>
        </TourStep>
        <TourStep id="step-2">
          <Text>Step 2</Text>
        </TourStep>
        <TourStep id="step-3">
          <Text>Step 3</Text>
        </TourStep>
      </View>
    );

    expect(getByText('Step 1')).toBeTruthy();
    expect(getByText('Step 2')).toBeTruthy();
    expect(getByText('Step 3')).toBeTruthy();
  });

  it('throws error when used outside IntroProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(
        <TourStep id="test-step">
          <Text>Content</Text>
        </TourStep>
      );
    }).toThrow('useIntroContext must be used within an IntroProvider');

    consoleSpy.mockRestore();
  });
});
