/**
 * Component tests for ProgressBar
 */

import { render } from '@testing-library/react-native';
import { ProgressBar } from '../../src/components/ProgressBar';
import type { ProgressStyleConfig } from '../../src/themes/types';

// Mock theme for progress bar
const mockTheme: ProgressStyleConfig = {
  barHeight: 4,
  barBackgroundColor: '#e0e0e0',
  barFillColor: '#007AFF',
  bulletSize: 8,
  bulletColor: '#ccc',
  bulletActiveColor: '#007AFF',
};

describe('ProgressBar', () => {
  describe('Progress calculation', () => {
    it('shows correct progress text for first step', () => {
      const { getByText } = render(
        <ProgressBar currentStep={0} totalSteps={5} theme={mockTheme} />
      );

      expect(getByText('1 / 5')).toBeTruthy();
    });

    it('shows correct progress text for middle step', () => {
      const { getByText } = render(
        <ProgressBar currentStep={2} totalSteps={5} theme={mockTheme} />
      );

      expect(getByText('3 / 5')).toBeTruthy();
    });

    it('shows correct progress text for last step', () => {
      const { getByText } = render(
        <ProgressBar currentStep={4} totalSteps={5} theme={mockTheme} />
      );

      expect(getByText('5 / 5')).toBeTruthy();
    });
  });

  describe('Text visibility', () => {
    it('shows text by default', () => {
      const { getByText } = render(
        <ProgressBar currentStep={1} totalSteps={3} theme={mockTheme} />
      );

      expect(getByText('2 / 3')).toBeTruthy();
    });

    it('hides text when showText is false', () => {
      const { queryByText } = render(
        <ProgressBar
          currentStep={1}
          totalSteps={3}
          theme={mockTheme}
          showText={false}
        />
      );

      expect(queryByText('2 / 3')).toBeNull();
    });

    it('shows text when showText is true', () => {
      const { getByText } = render(
        <ProgressBar
          currentStep={1}
          totalSteps={3}
          theme={mockTheme}
          showText={true}
        />
      );

      expect(getByText('2 / 3')).toBeTruthy();
    });
  });

  describe('Single step tour', () => {
    it('handles single step tour correctly', () => {
      const { getByText } = render(
        <ProgressBar currentStep={0} totalSteps={1} theme={mockTheme} />
      );

      expect(getByText('1 / 1')).toBeTruthy();
    });
  });
});
