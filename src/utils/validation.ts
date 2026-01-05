/**
 * Validation utilities for tour and hint configurations
 */

import type { StepConfig, HintConfig } from '../types';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a tour configuration
 *
 * Checks:
 * - Tour ID is provided
 * - At least one step exists
 * - All step IDs are unique
 * - All steps have content
 *
 * @param tourId - Tour identifier
 * @param steps - Array of step configurations
 * @returns Validation result
 */
export function validateTour(
  tourId: string,
  steps: StepConfig[]
): ValidationResult {
  const errors: string[] = [];

  // Validate tour ID
  if (!tourId || tourId.trim() === '') {
    errors.push('Tour ID is required');
  }

  // Validate steps array
  if (!steps || !Array.isArray(steps)) {
    errors.push('Steps must be an array');
    return { valid: false, errors };
  }

  if (steps.length === 0) {
    errors.push('Tour must have at least one step');
  }

  // Validate each step
  const stepIds = new Set<string>();

  steps.forEach((step, index) => {
    // Check step ID
    if (!step.id || step.id.trim() === '') {
      errors.push(`Step at index ${index} must have an ID`);
    } else if (stepIds.has(step.id)) {
      errors.push(`Duplicate step ID: ${step.id}`);
    } else {
      stepIds.add(step.id);
    }

    // Check step content
    if (step.content === undefined || step.content === null) {
      errors.push(`Step ${step.id || `at index ${index}`} must have content`);
    } else if (typeof step.content === 'string' && step.content.trim() === '') {
      errors.push(
        `Step ${step.id || `at index ${index}`} content cannot be empty`
      );
    }

    // Validate position if provided
    if (step.position !== undefined) {
      const validPositions = ['top', 'bottom', 'left', 'right', 'auto'];
      if (!validPositions.includes(step.position)) {
        errors.push(
          `Step ${step.id || `at index ${index}`} has invalid position: ${
            step.position
          }`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single step configuration
 *
 * @param step - Step configuration
 * @returns Validation result
 */
export function validateStep(step: StepConfig): ValidationResult {
  const errors: string[] = [];

  if (!step.id || step.id.trim() === '') {
    errors.push('Step ID is required');
  }

  if (step.content === undefined || step.content === null) {
    errors.push('Step content is required');
  } else if (typeof step.content === 'string' && step.content.trim() === '') {
    errors.push('Step content cannot be empty');
  }

  if (step.position !== undefined) {
    const validPositions = ['top', 'bottom', 'left', 'right', 'auto'];
    if (!validPositions.includes(step.position)) {
      errors.push(`Invalid position: ${step.position}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a hint configuration
 *
 * Checks:
 * - Hint ID is provided
 * - Target ID is provided
 * - Content is provided
 *
 * @param hint - Hint configuration
 * @returns Validation result
 */
export function validateHint(hint: HintConfig): ValidationResult {
  const errors: string[] = [];

  if (!hint.id || hint.id.trim() === '') {
    errors.push('Hint ID is required');
  }

  if (!hint.targetId || hint.targetId.trim() === '') {
    errors.push('Hint targetId is required');
  }

  if (hint.content === undefined || hint.content === null) {
    errors.push('Hint content is required');
  } else if (typeof hint.content === 'string' && hint.content.trim() === '') {
    errors.push('Hint content cannot be empty');
  }

  if (hint.position !== undefined) {
    const validPositions = [
      'top-left',
      'top-center',
      'top-right',
      'middle-left',
      'middle-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];
    if (!validPositions.includes(hint.position)) {
      errors.push(`Invalid hint position: ${hint.position}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple hints
 *
 * @param hints - Array of hint configurations
 * @returns Validation result
 */
export function validateHints(hints: HintConfig[]): ValidationResult {
  const errors: string[] = [];

  if (!hints || !Array.isArray(hints)) {
    errors.push('Hints must be an array');
    return { valid: false, errors };
  }

  const hintIds = new Set<string>();

  hints.forEach((hint, index) => {
    const result = validateHint(hint);
    errors.push(...result.errors.map((e) => `Hint at index ${index}: ${e}`));

    if (hint.id && hintIds.has(hint.id)) {
      errors.push(`Duplicate hint ID: ${hint.id}`);
    } else if (hint.id) {
      hintIds.add(hint.id);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
