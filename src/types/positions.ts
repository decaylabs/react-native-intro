/**
 * Position types for tooltips and hints
 */

/**
 * Tooltip position relative to the target element
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * Hint indicator position relative to the target element
 */
export type HintPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * Element measurement data
 */
export interface ElementMeasurement {
  x: number;
  y: number;
  width: number;
  height: number;
  measured: boolean;
  timestamp: number;
}
