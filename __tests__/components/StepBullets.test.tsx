/**
 * Component tests for StepBullets
 */

import { render, fireEvent } from '@testing-library/react-native';
import { StepBullets } from '../../src/components/StepBullets';
import type { ProgressStyleConfig } from '../../src/themes/types';

// Mock theme for step bullets
const mockTheme: ProgressStyleConfig = {
  barHeight: 4,
  barBackgroundColor: '#e0e0e0',
  barFillColor: '#007AFF',
  bulletSize: 8,
  bulletColor: '#ccc',
  bulletActiveColor: '#007AFF',
};

describe('StepBullets', () => {
  describe('Bullet rendering', () => {
    it('renders correct number of bullets', () => {
      const { getByLabelText } = render(
        <StepBullets currentStep={0} totalSteps={5} theme={mockTheme} />
      );

      // Verify all 5 bullets are present via accessibility labels
      expect(getByLabelText('Step 1 of 5, current')).toBeTruthy();
      expect(getByLabelText('Step 2 of 5')).toBeTruthy();
      expect(getByLabelText('Step 3 of 5')).toBeTruthy();
      expect(getByLabelText('Step 4 of 5')).toBeTruthy();
      expect(getByLabelText('Step 5 of 5')).toBeTruthy();
    });

    it('renders single bullet for single step tour', () => {
      const { getByLabelText } = render(
        <StepBullets currentStep={0} totalSteps={1} theme={mockTheme} />
      );

      expect(getByLabelText('Step 1 of 1, current')).toBeTruthy();
    });
  });

  describe('Active step indication', () => {
    it('marks first step as current', () => {
      const { getByLabelText } = render(
        <StepBullets currentStep={0} totalSteps={3} theme={mockTheme} />
      );

      expect(getByLabelText('Step 1 of 3, current')).toBeTruthy();
      expect(getByLabelText('Step 2 of 3')).toBeTruthy();
      expect(getByLabelText('Step 3 of 3')).toBeTruthy();
    });

    it('marks middle step as current', () => {
      const { getByLabelText } = render(
        <StepBullets currentStep={1} totalSteps={3} theme={mockTheme} />
      );

      expect(getByLabelText('Step 1 of 3')).toBeTruthy();
      expect(getByLabelText('Step 2 of 3, current')).toBeTruthy();
      expect(getByLabelText('Step 3 of 3')).toBeTruthy();
    });

    it('marks last step as current', () => {
      const { getByLabelText } = render(
        <StepBullets currentStep={2} totalSteps={3} theme={mockTheme} />
      );

      expect(getByLabelText('Step 1 of 3')).toBeTruthy();
      expect(getByLabelText('Step 2 of 3')).toBeTruthy();
      expect(getByLabelText('Step 3 of 3, current')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('renders bullets as pressable when onBulletPress is provided', () => {
      const onBulletPress = jest.fn();
      const { getByLabelText } = render(
        <StepBullets
          currentStep={0}
          totalSteps={3}
          theme={mockTheme}
          onBulletPress={onBulletPress}
        />
      );

      // With onBulletPress, labels change to "Go to step X"
      expect(getByLabelText('Go to step 1')).toBeTruthy();
      expect(getByLabelText('Go to step 2')).toBeTruthy();
      expect(getByLabelText('Go to step 3')).toBeTruthy();
    });

    it('calls onBulletPress with correct index when bullet is pressed', () => {
      const onBulletPress = jest.fn();
      const { getByLabelText } = render(
        <StepBullets
          currentStep={0}
          totalSteps={3}
          theme={mockTheme}
          onBulletPress={onBulletPress}
        />
      );

      fireEvent.press(getByLabelText('Go to step 2'));
      expect(onBulletPress).toHaveBeenCalledWith(1);

      fireEvent.press(getByLabelText('Go to step 3'));
      expect(onBulletPress).toHaveBeenCalledWith(2);
    });

    it('renders bullets as non-pressable views when onBulletPress is not provided', () => {
      const { queryByLabelText } = render(
        <StepBullets currentStep={0} totalSteps={3} theme={mockTheme} />
      );

      // Without onBulletPress, labels are "Step X of Y" format (not "Go to step X")
      expect(queryByLabelText('Go to step 1')).toBeNull();
      expect(queryByLabelText('Go to step 2')).toBeNull();
      expect(queryByLabelText('Go to step 3')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility structure', () => {
      const { toJSON } = render(
        <StepBullets currentStep={0} totalSteps={3} theme={mockTheme} />
      );

      const tree = toJSON();
      // Container should have tablist role
      expect(tree?.props.accessibilityRole).toBe('tablist');
    });

    it('marks active bullet as selected when navigable', () => {
      const onBulletPress = jest.fn();
      const { getByLabelText } = render(
        <StepBullets
          currentStep={1}
          totalSteps={3}
          theme={mockTheme}
          onBulletPress={onBulletPress}
        />
      );

      const activeButton = getByLabelText('Go to step 2');
      expect(activeButton.props.accessibilityState.selected).toBe(true);
    });
  });
});
