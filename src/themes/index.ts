/**
 * Theme exports for react-native-intro
 */

import type { Theme, ThemeName, HintStyleConfig } from './types';
import { classicTheme } from './classic';
import { modernTheme } from './modern';
import { darkTheme } from './dark';

// Re-export types
export type { Theme, ThemeName } from './types';

// Re-export themes
export { classicTheme } from './classic';
export { modernTheme } from './modern';
export { darkTheme } from './dark';

/**
 * Built-in themes map (excludes 'auto' which is resolved dynamically)
 */
export const themes: Record<Exclude<ThemeName, 'auto'>, Theme> = {
  classic: classicTheme,
  modern: modernTheme,
  dark: darkTheme,
};

/**
 * Color scheme type for auto theme resolution
 */
export type ColorScheme = 'light' | 'dark';

/**
 * Resolve a theme from name or object
 *
 * For static theme resolution (without system color scheme detection).
 * For 'auto' theme, defaults to 'classic' (light).
 * Use resolveThemeWithColorScheme for dynamic theme resolution.
 *
 * @param theme - Theme name string or custom Theme object
 * @returns Resolved Theme object
 */
export function resolveTheme(theme: ThemeName | Theme): Theme {
  if (typeof theme === 'string') {
    if (theme === 'auto') {
      // Default to classic for static resolution
      return classicTheme;
    }
    return themes[theme] ?? classicTheme;
  }
  return theme;
}

/**
 * Resolve a theme with color scheme awareness
 *
 * Use this when you have access to the system color scheme.
 * For 'auto' theme, returns 'dark' theme in dark mode, 'classic' in light mode.
 *
 * @param theme - Theme name string or custom Theme object
 * @param colorScheme - Current system color scheme ('light' or 'dark')
 * @returns Resolved Theme object
 *
 * @example
 * ```tsx
 * const colorScheme = useColorScheme();
 * const theme = resolveThemeWithColorScheme('auto', colorScheme);
 * // Returns darkTheme when system is in dark mode
 * ```
 */
export function resolveThemeWithColorScheme(
  theme: ThemeName | Theme,
  colorScheme: ColorScheme
): Theme {
  if (typeof theme === 'string') {
    if (theme === 'auto') {
      return colorScheme === 'dark' ? darkTheme : classicTheme;
    }
    return themes[theme] ?? classicTheme;
  }
  return theme;
}

/**
 * Get a theme by name
 *
 * @param name - Theme name or custom theme object
 * @returns Resolved theme
 */
export function getTheme(name: ThemeName | Theme): Theme {
  return resolveTheme(name);
}

/**
 * Deep merge hint style config
 */
function mergeHintStyle(
  base: HintStyleConfig,
  partial?: Partial<HintStyleConfig>
): HintStyleConfig {
  if (!partial) return base;

  return {
    ...base,
    ...partial,
    types: {
      info: { ...base.types.info, ...partial.types?.info },
      warning: { ...base.types.warning, ...partial.types?.warning },
      error: { ...base.types.error, ...partial.types?.error },
      success: { ...base.types.success, ...partial.types?.success },
    },
  };
}

/**
 * Merge a partial theme with a base theme
 *
 * Performs deep merging for nested objects like buttons and hint types.
 *
 * @param base - Base theme to extend
 * @param partial - Partial theme overrides
 * @returns Merged theme
 *
 * @example
 * ```tsx
 * import { classicTheme, mergeTheme } from 'react-native-intro';
 *
 * const customTheme = mergeTheme(classicTheme, {
 *   tooltip: { backgroundColor: '#f0f0f0' },
 *   buttons: { primary: { backgroundColor: '#ff6600' } },
 * });
 * ```
 */
export function mergeTheme(base: Theme, partial: Partial<Theme>): Theme {
  return {
    name: partial.name ?? base.name,
    overlay: {
      ...base.overlay,
      ...partial.overlay,
    },
    tooltip: {
      ...base.tooltip,
      ...partial.tooltip,
    },
    buttons: {
      primary: {
        ...base.buttons.primary,
        ...partial.buttons?.primary,
      },
      secondary: {
        ...base.buttons.secondary,
        ...partial.buttons?.secondary,
      },
    },
    hint: mergeHintStyle(base.hint, partial.hint),
    progress: {
      ...base.progress,
      ...partial.progress,
    },
  };
}

/**
 * Create a custom theme based on a built-in theme
 *
 * Convenience function that resolves a theme name and merges overrides.
 * Note: 'auto' is not valid as a base theme - use 'classic' or 'dark' instead.
 *
 * @param baseName - Name of built-in theme to extend ('classic', 'modern', or 'dark')
 * @param overrides - Partial theme overrides
 * @returns Complete custom theme
 *
 * @example
 * ```tsx
 * const myTheme = createTheme('dark', {
 *   buttons: { primary: { backgroundColor: '#8b5cf6' } },
 * });
 * ```
 */
export function createTheme(
  baseName: Exclude<ThemeName, 'auto'>,
  overrides: Partial<Theme>
): Theme {
  const baseTheme = themes[baseName] ?? classicTheme;
  return mergeTheme(baseTheme, overrides);
}
