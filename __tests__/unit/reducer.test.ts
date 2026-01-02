/**
 * Unit tests for intro reducer - tour actions
 */

import { introReducer } from '../../src/context/reducer';
import {
  initialIntroState,
  type IntroState,
  type IntroAction,
} from '../../src/context/IntroContext';

describe('introReducer - Tour Actions', () => {
  let initialState: IntroState;

  beforeEach(() => {
    // Create a fresh copy of initial state for each test
    initialState = {
      ...initialIntroState,
      registry: {
        steps: new Map(),
        hints: new Map(),
      },
      measurements: new Map(),
      persistence: {
        dismissedTours: new Set(),
        initialized: true,
      },
    };
  });

  describe('START_TOUR', () => {
    it('should start a tour with provided steps', () => {
      const action: IntroAction = {
        type: 'START_TOUR',
        tourId: 'test-tour',
        steps: [
          { id: 'step-1', content: 'First step' },
          { id: 'step-2', content: 'Second step' },
        ],
      };

      const state = introReducer(initialState, action);

      expect(state.tour.state).toBe('active');
      expect(state.tour.id).toBe('test-tour');
      expect(state.tour.currentStepIndex).toBe(0);
      expect(state.tour.steps).toHaveLength(2);
      expect(state.ui.overlayVisible).toBe(true);
      expect(state.ui.tooltipVisible).toBe(true);
    });

    it('should apply provided tour options', () => {
      const action: IntroAction = {
        type: 'START_TOUR',
        tourId: 'test-tour',
        steps: [{ id: 'step-1', content: 'Step' }],
        options: {
          showProgress: false,
          exitOnOverlayClick: true,
          overlayOpacity: 0.5,
        },
      };

      const state = introReducer(initialState, action);

      expect(state.tour.options.showProgress).toBe(false);
      expect(state.tour.options.exitOnOverlayClick).toBe(true);
      expect(state.tour.options.overlayOpacity).toBe(0.5);
    });

    it('should not start a dismissed tour', () => {
      initialState.persistence.dismissedTours.add('test-tour');

      const action: IntroAction = {
        type: 'START_TOUR',
        tourId: 'test-tour',
        steps: [{ id: 'step-1', content: 'Step' }],
      };

      const state = introReducer(initialState, action);

      expect(state.tour.state).toBe('idle');
      expect(state.tour.id).toBeNull();
    });
  });

  describe('NEXT_STEP', () => {
    beforeEach(() => {
      initialState = introReducer(initialState, {
        type: 'START_TOUR',
        tourId: 'test-tour',
        steps: [
          { id: 'step-1', content: 'First' },
          { id: 'step-2', content: 'Second' },
          { id: 'step-3', content: 'Third' },
        ],
      });
    });

    it('should go to the next step', () => {
      const state = introReducer(initialState, { type: 'NEXT_STEP' });

      expect(state.tour.currentStepIndex).toBe(1);
      expect(state.tour.state).toBe('active');
    });

    it('should complete tour when on last step', () => {
      // Go to last step
      let state = introReducer(initialState, { type: 'NEXT_STEP' }); // index 1
      state = introReducer(state, { type: 'NEXT_STEP' }); // index 2
      state = introReducer(state, { type: 'NEXT_STEP' }); // should complete

      expect(state.tour.state).toBe('completed');
      expect(state.ui.overlayVisible).toBe(false);
      expect(state.ui.tooltipVisible).toBe(false);
    });

    it('should not advance if tour is not active', () => {
      const state = introReducer(
        { ...initialState, tour: { ...initialState.tour, state: 'idle' } },
        { type: 'NEXT_STEP' }
      );

      expect(state.tour.currentStepIndex).toBe(0);
    });
  });

  describe('PREV_STEP', () => {
    beforeEach(() => {
      initialState = introReducer(initialState, {
        type: 'START_TOUR',
        tourId: 'test-tour',
        steps: [
          { id: 'step-1', content: 'First' },
          { id: 'step-2', content: 'Second' },
          { id: 'step-3', content: 'Third' },
        ],
      });
      // Go to step 2
      initialState = introReducer(initialState, { type: 'NEXT_STEP' });
    });

    it('should go to the previous step', () => {
      expect(initialState.tour.currentStepIndex).toBe(1);

      const state = introReducer(initialState, { type: 'PREV_STEP' });

      expect(state.tour.currentStepIndex).toBe(0);
    });

    it('should not go below step 0', () => {
      let state = introReducer(initialState, { type: 'PREV_STEP' }); // index 0
      state = introReducer(state, { type: 'PREV_STEP' }); // should stay at 0

      expect(state.tour.currentStepIndex).toBe(0);
    });
  });

  describe('GO_TO_STEP', () => {
    beforeEach(() => {
      initialState = introReducer(initialState, {
        type: 'START_TOUR',
        tourId: 'test-tour',
        steps: [
          { id: 'step-1', content: 'First' },
          { id: 'step-2', content: 'Second' },
          { id: 'step-3', content: 'Third' },
        ],
      });
    });

    it('should go to a specific step', () => {
      const state = introReducer(initialState, {
        type: 'GO_TO_STEP',
        stepIndex: 2,
      });

      expect(state.tour.currentStepIndex).toBe(2);
    });

    it('should not go to invalid step index (negative)', () => {
      const state = introReducer(initialState, {
        type: 'GO_TO_STEP',
        stepIndex: -1,
      });

      expect(state.tour.currentStepIndex).toBe(0);
    });

    it('should not go to invalid step index (too large)', () => {
      const state = introReducer(initialState, {
        type: 'GO_TO_STEP',
        stepIndex: 10,
      });

      expect(state.tour.currentStepIndex).toBe(0);
    });
  });

  describe('END_TOUR', () => {
    beforeEach(() => {
      initialState = introReducer(initialState, {
        type: 'START_TOUR',
        tourId: 'test-tour',
        steps: [{ id: 'step-1', content: 'Step' }],
      });
    });

    it('should end tour with completed reason', () => {
      const state = introReducer(initialState, {
        type: 'END_TOUR',
        reason: 'completed',
      });

      expect(state.tour.state).toBe('completed');
      expect(state.ui.overlayVisible).toBe(false);
      expect(state.ui.tooltipVisible).toBe(false);
    });

    it('should end tour with skipped reason', () => {
      const state = introReducer(initialState, {
        type: 'END_TOUR',
        reason: 'skipped',
      });

      expect(state.tour.state).toBe('skipped');
    });

    it('should end tour with dismissed reason', () => {
      const state = introReducer(initialState, {
        type: 'END_TOUR',
        reason: 'dismissed',
      });

      expect(state.tour.state).toBe('dismissed');
    });
  });

  describe('SET_TRANSITIONING', () => {
    it('should set transitioning state', () => {
      const state = introReducer(initialState, {
        type: 'SET_TRANSITIONING',
        isTransitioning: true,
      });

      expect(state.ui.isTransitioning).toBe(true);
    });

    it('should clear transitioning state', () => {
      initialState.ui.isTransitioning = true;

      const state = introReducer(initialState, {
        type: 'SET_TRANSITIONING',
        isTransitioning: false,
      });

      expect(state.ui.isTransitioning).toBe(false);
    });
  });

  describe('DISMISS_TOUR_PERMANENTLY', () => {
    it('should add tour to dismissed set', () => {
      const state = introReducer(initialState, {
        type: 'DISMISS_TOUR_PERMANENTLY',
        tourId: 'my-tour',
      });

      expect(state.persistence.dismissedTours.has('my-tour')).toBe(true);
    });
  });

  describe('CLEAR_DISMISSED_TOUR', () => {
    it('should remove tour from dismissed set', () => {
      initialState.persistence.dismissedTours.add('my-tour');

      const state = introReducer(initialState, {
        type: 'CLEAR_DISMISSED_TOUR',
        tourId: 'my-tour',
      });

      expect(state.persistence.dismissedTours.has('my-tour')).toBe(false);
    });
  });
});
