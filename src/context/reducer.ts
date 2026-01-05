/**
 * State reducer for intro library
 */

import type { IntroState, IntroAction } from './IntroContext';
import { defaultTourOptions, defaultHintOptions } from './IntroContext';

/**
 * Main reducer for handling all intro state changes
 */
export function introReducer(
  state: IntroState,
  action: IntroAction
): IntroState {
  switch (action.type) {
    // =========================================================================
    // TOUR ACTIONS
    // =========================================================================

    case 'START_TOUR': {
      // Don't start if tour is dismissed
      if (state.persistence.dismissedTours.has(action.tourId)) {
        return state;
      }

      return {
        ...state,
        tour: {
          state: 'active',
          id: action.tourId,
          currentStepIndex: 0,
          steps: action.steps,
          options: { ...defaultTourOptions, ...action.options },
          dontShowAgainChecked: false,
        },
        ui: {
          ...state.ui,
          overlayVisible: true,
          tooltipVisible: false,
          isTransitioning: true,
        },
      };
    }

    case 'NEXT_STEP': {
      if (state.tour.state !== 'active') return state;

      const nextIndex = state.tour.currentStepIndex + 1;
      if (nextIndex >= state.tour.steps.length) {
        // Tour complete
        return {
          ...state,
          tour: {
            ...state.tour,
            state: 'completed',
          },
          ui: {
            ...state.ui,
            overlayVisible: false,
            tooltipVisible: false,
          },
        };
      }

      return {
        ...state,
        tour: {
          ...state.tour,
          currentStepIndex: nextIndex,
        },
        ui: {
          ...state.ui,
          tooltipVisible: false,
          isTransitioning: true,
        },
      };
    }

    case 'PREV_STEP': {
      if (state.tour.state !== 'active') return state;

      const prevIndex = Math.max(0, state.tour.currentStepIndex - 1);
      return {
        ...state,
        tour: {
          ...state.tour,
          currentStepIndex: prevIndex,
        },
        ui: {
          ...state.ui,
          tooltipVisible: false,
          isTransitioning: true,
        },
      };
    }

    case 'GO_TO_STEP': {
      if (state.tour.state !== 'active') return state;

      const { stepIndex } = action;
      if (stepIndex < 0 || stepIndex >= state.tour.steps.length) {
        return state;
      }

      return {
        ...state,
        tour: {
          ...state.tour,
          currentStepIndex: stepIndex,
        },
      };
    }

    case 'END_TOUR': {
      return {
        ...state,
        tour: {
          ...state.tour,
          state: action.reason,
        },
        ui: {
          ...state.ui,
          overlayVisible: false,
          tooltipVisible: false,
          isTransitioning: false,
        },
      };
    }

    case 'SET_TRANSITIONING': {
      return {
        ...state,
        ui: {
          ...state.ui,
          isTransitioning: action.isTransitioning,
        },
      };
    }

    case 'SET_DONT_SHOW_AGAIN': {
      return {
        ...state,
        tour: {
          ...state.tour,
          dontShowAgainChecked: action.checked,
        },
      };
    }

    case 'SHOW_TOOLTIP': {
      return {
        ...state,
        ui: {
          ...state.ui,
          tooltipVisible: true,
          isTransitioning: false,
        },
      };
    }

    case 'HIDE_TOOLTIP': {
      return {
        ...state,
        ui: {
          ...state.ui,
          tooltipVisible: false,
        },
      };
    }

    // =========================================================================
    // HINT ACTIONS
    // =========================================================================

    case 'SHOW_HINTS': {
      return {
        ...state,
        hints: {
          ...state.hints,
          visible: true,
          items: action.hints,
          activeHintId: null,
          options: { ...defaultHintOptions, ...action.options },
        },
      };
    }

    case 'HIDE_HINTS': {
      return {
        ...state,
        hints: {
          ...state.hints,
          visible: false,
          activeHintId: null,
        },
      };
    }

    case 'SHOW_HINT': {
      return {
        ...state,
        hints: {
          ...state.hints,
          activeHintId: action.hintId,
        },
      };
    }

    case 'HIDE_HINT': {
      if (state.hints.activeHintId !== action.hintId) return state;

      return {
        ...state,
        hints: {
          ...state.hints,
          activeHintId: null,
        },
      };
    }

    case 'REMOVE_HINT': {
      const newItems = state.hints.items.filter((h) => h.id !== action.hintId);
      return {
        ...state,
        hints: {
          ...state.hints,
          items: newItems,
          activeHintId:
            state.hints.activeHintId === action.hintId
              ? null
              : state.hints.activeHintId,
        },
      };
    }

    // =========================================================================
    // MEASUREMENT ACTIONS
    // =========================================================================

    case 'UPDATE_MEASUREMENT': {
      const newMeasurements = new Map(state.measurements);
      newMeasurements.set(action.id, action.measurement);
      return {
        ...state,
        measurements: newMeasurements,
      };
    }

    case 'CLEAR_MEASUREMENTS': {
      return {
        ...state,
        measurements: new Map(),
      };
    }

    // =========================================================================
    // PERSISTENCE ACTIONS
    // =========================================================================

    case 'DISMISS_TOUR_PERMANENTLY': {
      const newDismissed = new Set(state.persistence.dismissedTours);
      newDismissed.add(action.tourId);
      return {
        ...state,
        persistence: {
          ...state.persistence,
          dismissedTours: newDismissed,
        },
      };
    }

    case 'CLEAR_DISMISSED_TOUR': {
      const newDismissed = new Set(state.persistence.dismissedTours);
      newDismissed.delete(action.tourId);
      return {
        ...state,
        persistence: {
          ...state.persistence,
          dismissedTours: newDismissed,
        },
      };
    }

    case 'LOAD_PERSISTED_STATE': {
      return {
        ...state,
        persistence: {
          ...state.persistence,
          dismissedTours: new Set(action.dismissedTours),
          initialized: true,
        },
      };
    }

    case 'SET_PERSISTENCE_INITIALIZED': {
      return {
        ...state,
        persistence: {
          ...state.persistence,
          initialized: true,
        },
      };
    }

    default:
      return state;
  }
}
