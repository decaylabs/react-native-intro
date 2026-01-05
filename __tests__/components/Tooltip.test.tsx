/**
 * Component tests for Tooltip
 */

import { render } from '@testing-library/react-native';
import { Tooltip } from '../../src/components/Tooltip';
import { IntroProvider } from '../../src/components/IntroProvider';
import { classicTheme } from '../../src/themes/classic';
import type {
  StepConfig,
  TourOptions,
  ElementMeasurement,
} from '../../src/types';

// Mock measurement
const mockMeasurement: ElementMeasurement = {
  x: 100,
  y: 200,
  width: 100,
  height: 50,
  measured: true,
  timestamp: Date.now(),
};

// Default tour options
const defaultOptions: TourOptions = {
  showProgress: true,
  showBullets: true,
  showButtons: true,
  exitOnOverlayClick: false,
  dontShowAgain: false,
};

// Helper to render Tooltip with provider
function renderTooltip(props: {
  step: StepConfig;
  stepIndex?: number;
  totalSteps?: number;
  targetMeasurement?: ElementMeasurement | null;
  options?: TourOptions;
}) {
  return render(
    <IntroProvider>
      <Tooltip
        step={props.step}
        stepIndex={props.stepIndex ?? 0}
        totalSteps={props.totalSteps ?? 1}
        targetMeasurement={props.targetMeasurement ?? mockMeasurement}
        options={{ ...defaultOptions, ...props.options }}
        theme={classicTheme}
      />
    </IntroProvider>
  );
}

describe('Tooltip', () => {
  describe('Content rendering', () => {
    it('renders step content as text', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-1', content: 'This is step content' },
      });

      expect(getByText('This is step content')).toBeTruthy();
    });

    it('renders step title when provided', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-1', title: 'Step Title', content: 'Content' },
      });

      expect(getByText('Step Title')).toBeTruthy();
      expect(getByText('Content')).toBeTruthy();
    });

    it('renders without title when not provided', () => {
      const { queryByText, getByText } = renderTooltip({
        step: { id: 'step-1', content: 'Only content' },
      });

      expect(getByText('Only content')).toBeTruthy();
      // Should not have any title element
      expect(queryByText('undefined')).toBeNull();
    });
  });

  describe('Navigation buttons', () => {
    it('shows Next button on first step', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-1', content: 'First step' },
        stepIndex: 0,
        totalSteps: 3,
      });

      expect(getByText('Next')).toBeTruthy();
    });

    it('shows Done button on last step', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-3', content: 'Last step' },
        stepIndex: 2,
        totalSteps: 3,
      });

      expect(getByText('Done')).toBeTruthy();
    });

    it('shows Back button on middle steps', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-2', content: 'Middle step' },
        stepIndex: 1,
        totalSteps: 3,
      });

      expect(getByText('Back')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
    });

    it('hides buttons when showButtons is false', () => {
      const { queryByText } = renderTooltip({
        step: { id: 'step-1', content: 'Content' },
        options: { ...defaultOptions, showButtons: false },
      });

      expect(queryByText('Next')).toBeNull();
      expect(queryByText('Skip')).toBeNull();
    });

    it('shows Skip button except on last step', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-1', content: 'First step' },
        stepIndex: 0,
        totalSteps: 3,
      });

      expect(getByText('Skip')).toBeTruthy();
    });
  });

  describe('Progress indicator', () => {
    it('shows progress when showProgress is true', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-1', content: 'Content' },
        stepIndex: 1,
        totalSteps: 5,
        options: { ...defaultOptions, showProgress: true },
      });

      expect(getByText('2 / 5')).toBeTruthy();
    });

    it('hides progress when showProgress is false', () => {
      const { queryByText } = renderTooltip({
        step: { id: 'step-1', content: 'Content' },
        stepIndex: 1,
        totalSteps: 5,
        options: { ...defaultOptions, showProgress: false },
      });

      expect(queryByText('2 / 5')).toBeNull();
    });
  });

  describe('Custom button labels', () => {
    it('uses custom button labels', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-1', content: 'Content' },
        stepIndex: 0,
        totalSteps: 2,
        options: {
          ...defaultOptions,
          buttonLabels: {
            next: 'Continue',
            skip: 'Exit',
          },
        },
      });

      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Exit')).toBeTruthy();
    });
  });

  describe("Don't show again checkbox", () => {
    it('shows checkbox when dontShowAgain option is true', () => {
      const { getByText } = renderTooltip({
        step: { id: 'step-1', content: 'Content' },
        options: { ...defaultOptions, dontShowAgain: true },
      });

      expect(getByText("Don't show again")).toBeTruthy();
    });

    it('hides checkbox when dontShowAgain option is false', () => {
      const { queryByText } = renderTooltip({
        step: { id: 'step-1', content: 'Content' },
        options: { ...defaultOptions, dontShowAgain: false },
      });

      expect(queryByText("Don't show again")).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      const { getByLabelText } = renderTooltip({
        step: { id: 'step-1', content: 'Content' },
        stepIndex: 1,
        totalSteps: 3,
      });

      // Accessibility labels now include step information for screen readers
      expect(getByLabelText(/Go to step 3 of 3/)).toBeTruthy(); // Next
      expect(getByLabelText(/Go back to step 1 of 3/)).toBeTruthy(); // Back
      expect(getByLabelText(/Skip the remaining tour/)).toBeTruthy(); // Skip
    });
  });
});
