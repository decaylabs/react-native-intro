/**
 * useColorScheme - Hook for detecting system color scheme
 *
 * Returns the current system color scheme ('light' or 'dark') and
 * updates automatically when the user changes their system preference.
 */

import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

/**
 * Hook to detect system color scheme preference
 *
 * @returns Current color scheme ('light' or 'dark')
 *
 * @example
 * ```tsx
 * const colorScheme = useColorScheme();
 * const isDark = colorScheme === 'dark';
 * ```
 */
export function useColorScheme(): ColorScheme {
  const scheme = useRNColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}
