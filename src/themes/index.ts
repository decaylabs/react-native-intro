/**
 * Theme exports for react-native-intro
 */

import type { Theme, ThemeName } from './types';
import { classicTheme } from './classic';

// Re-export types
export type { Theme, ThemeName } from './types';

// Re-export themes
export { classicTheme } from './classic';

/**
 * Built-in themes map
 */
export const themes: Record<ThemeName, Theme> = {
  classic: classicTheme,
  modern: classicTheme, // TODO: Implement modern theme in Phase 7
  dark: classicTheme, // TODO: Implement dark theme in Phase 7
};

/**
 * Get a theme by name
 *
 * @param name - Theme name or custom theme object
 * @returns Resolved theme
 */
export function getTheme(name: ThemeName | Theme): Theme {
  if (typeof name === 'string') {
    return themes[name] ?? classicTheme;
  }
  return name;
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
