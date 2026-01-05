/**
 * Debug logging utility for react-native-intro
 *
 * Enable debug logging by:
 * 1. Setting INTRO_DEBUG=true in your .env file
 * 2. Or calling setDebugEnabled(true) at runtime
 * 3. Or running: INTRO_DEBUG=true yarn start
 *
 * In the example app, you can also use the debug toggle in Advanced screen.
 */

// Check for environment variable (works in Metro bundler)
const envDebug =
  typeof process !== 'undefined' &&
  (process.env as Record<string, string | undefined>)?.INTRO_DEBUG === 'true';

// Runtime toggle - can be set programmatically
let debugEnabled = envDebug || false;

/**
 * Enable or disable debug logging at runtime
 */
export function setDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled;
  if (enabled) {
    console.log('[react-native-intro] Debug logging ENABLED');
  }
}

/**
 * Check if debug logging is enabled
 */
export function isDebugEnabled(): boolean {
  return debugEnabled;
}

/**
 * Create a debug logger for a specific module
 */
export function createLogger(module: string) {
  return (...args: unknown[]) => {
    if (debugEnabled) {
      console.log(`[${module}]`, ...args);
    }
  };
}

// Pre-created loggers for each module
export const logTourOverlay = createLogger('TourOverlay');
export const logTooltip = createLogger('Tooltip');
export const logPositioning = createLogger('Positioning');
export const logAnimatedTooltip = createLogger('AnimatedTooltip');
