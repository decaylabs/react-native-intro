/**
 * useMeasure hook - Element measurement utilities
 */

import { useRef, useCallback } from 'react';
import { findNodeHandle, UIManager } from 'react-native';
import type { View } from 'react-native';
import type { ElementMeasurement } from '../types';

/**
 * Measure callback type
 */
type MeasureCallback = (
  x: number,
  y: number,
  width: number,
  height: number
) => void;

/**
 * Measure a view using UIManager
 */
function measureViewInWindow(
  viewRef: React.RefObject<View | null>,
  callback: MeasureCallback
): void {
  const nodeHandle = findNodeHandle(viewRef.current);
  if (nodeHandle == null) {
    callback(0, 0, 0, 0);
    return;
  }

  UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
    callback(x ?? 0, y ?? 0, width ?? 0, height ?? 0);
  });
}

/**
 * Hook for measuring element positions using measureInWindow
 *
 * @returns Object with ref and measure function
 */
export function useMeasure() {
  const ref = useRef<View | null>(null);

  const measure = useCallback((): Promise<ElementMeasurement> => {
    return new Promise((resolve, reject) => {
      if (!ref.current) {
        reject(new Error('Ref not attached to a component'));
        return;
      }

      measureViewInWindow(ref, (x, y, width, height) => {
        // Android can return 0 values initially, retry if needed
        if (width === 0 && height === 0) {
          // Schedule retry on next frame
          requestAnimationFrame(() => {
            if (ref.current) {
              measureViewInWindow(ref, (x2, y2, width2, height2) => {
                resolve({
                  x: x2,
                  y: y2,
                  width: width2,
                  height: height2,
                  measured: width2 > 0 || height2 > 0,
                  timestamp: Date.now(),
                });
              });
            } else {
              resolve({
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                measured: false,
                timestamp: Date.now(),
              });
            }
          });
        } else {
          resolve({
            x,
            y,
            width,
            height,
            measured: true,
            timestamp: Date.now(),
          });
        }
      });
    });
  }, []);

  return { ref, measure };
}

/**
 * Measure a specific View ref
 *
 * @param viewRef - React ref to a View component
 * @returns Promise resolving to element measurement
 */
export function measureElement(
  viewRef: React.RefObject<View | null>
): Promise<ElementMeasurement> {
  return new Promise((resolve, reject) => {
    if (!viewRef.current) {
      reject(new Error('Ref not attached'));
      return;
    }

    measureViewInWindow(viewRef, (x, y, width, height) => {
      resolve({
        x,
        y,
        width,
        height,
        measured: width > 0 || height > 0,
        timestamp: Date.now(),
      });
    });
  });
}

/**
 * Measure multiple elements and return a map of measurements
 *
 * @param refs - Map of id to View refs
 * @returns Promise resolving to Map of id to measurements
 */
export async function measureElements(
  refs: Map<string, { ref: React.RefObject<View | null> }>
): Promise<Map<string, ElementMeasurement>> {
  const measurements = new Map<string, ElementMeasurement>();

  const measurePromises = Array.from(refs.entries()).map(
    async ([id, entry]) => {
      try {
        const measurement = await measureElement(entry.ref);
        measurements.set(id, measurement);
      } catch {
        // Element not measurable, skip
        measurements.set(id, {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          measured: false,
          timestamp: Date.now(),
        });
      }
    }
  );

  await Promise.all(measurePromises);
  return measurements;
}
