/**
 * Dark theme - Optimized for dark mode interfaces
 */

import type { Theme } from './types';

/**
 * Dark theme for low-light environments
 *
 * Features:
 * - Dark backgrounds with light text
 * - Higher overlay opacity for better focus
 * - Cyan accent color for visibility
 * - Reduced contrast for eye comfort
 */
export const darkTheme: Theme = {
  name: 'dark',

  overlay: {
    backgroundColor: '#000000',
    opacity: 0.9,
  },

  tooltip: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    maxWidth: 320,
    titleColor: '#ffffff',
    titleFontSize: 18,
    titleFontWeight: '600',
    contentColor: '#a0aec0',
    contentFontSize: 14,
  },

  buttons: {
    primary: {
      backgroundColor: '#06b6d4',
      textColor: '#000000',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 18,
      fontSize: 14,
      disabledOpacity: 0.4,
    },
    secondary: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      textColor: '#06b6d4',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 18,
      fontSize: 14,
      disabledOpacity: 0.4,
    },
  },

  hint: {
    // Default: cyan for visibility on dark backgrounds
    backgroundColor: '#06b6d4',
    pulseColor: 'rgba(6, 182, 212, 0.4)',
    size: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1e1e1e',
    types: {
      info: {
        backgroundColor: '#60a5fa',
        pulseColor: 'rgba(96, 165, 250, 0.4)',
        icon: 'i',
      },
      warning: {
        backgroundColor: '#fbbf24',
        pulseColor: 'rgba(251, 191, 36, 0.4)',
        icon: '!',
      },
      error: {
        backgroundColor: '#f87171',
        pulseColor: 'rgba(248, 113, 113, 0.4)',
        icon: 'x',
      },
      success: {
        backgroundColor: '#34d399',
        pulseColor: 'rgba(52, 211, 153, 0.4)',
        icon: '✓',
      },
    },
  },

  progress: {
    barBackgroundColor: '#374151',
    barFillColor: '#06b6d4',
    barHeight: 4,
    bulletColor: '#374151',
    bulletActiveColor: '#06b6d4',
    bulletSize: 8,
  },
};
