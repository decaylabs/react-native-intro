/**
 * Theme exports for react-native-intro
 */

import type { Theme, ThemeName } from './types';
import { classicTheme } from './classic';

// Re-export types
export type { Theme, ThemeName } from './types';

// Re-export themes
export { classicTheme } from './classic';

// Placeholder themes until Phase 7
export const modernTheme: Theme = {
  ...classicTheme,
  name: 'modern',
};

export const darkTheme: Theme = {
  ...classicTheme,
  name: 'dark',
  overlay: {
    backgroundColor: '#000000',
    opacity: 0.85,
  },
  tooltip: {
    ...classicTheme.tooltip,
    backgroundColor: '#1e1e1e',
    titleColor: '#ffffff',
    contentColor: '#cccccc',
  },
};

/**
 * Built-in themes map
 */
export const themes: Record<ThemeName, Theme> = {
  classic: classicTheme,
  modern: modernTheme,
  dark: darkTheme,
};

/**
 * Resolve a theme from name or object
 *
 * @param theme - Theme name string or custom Theme object
 * @returns Resolved Theme object
 */
export function resolveTheme(theme: ThemeName | Theme): Theme {
  if (typeof theme === 'string') {
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
 * Merge a partial theme with a base theme
 *
 * @param base - Base theme to extend
 * @param partial - Partial theme overrides
 * @returns Merged theme
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
    hint: {
      ...base.hint,
      ...partial.hint,
    },
    progress: {
      ...base.progress,
      ...partial.progress,
    },
  };
}
