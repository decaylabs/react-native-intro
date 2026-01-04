/**
 * Modern theme - Contemporary design with rounded corners and soft shadows
 */

import type { Theme } from './types';

/**
 * Modern theme with a sleek, contemporary look
 *
 * Features:
 * - Rounded corners throughout
 * - Soft shadows with larger blur radius
 * - Vibrant primary accent color (indigo)
 * - Larger, more prominent UI elements
 */
export const modernTheme: Theme = {
  name: 'modern',

  overlay: {
    backgroundColor: '#1a1a2e',
    opacity: 0.85,
  },

  tooltip: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    maxWidth: 340,
    titleColor: '#1a1a2e',
    titleFontSize: 20,
    titleFontWeight: '700',
    contentColor: '#4a5568',
    contentFontSize: 15,
  },

  buttons: {
    primary: {
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 15,
      disabledOpacity: 0.4,
    },
    secondary: {
      backgroundColor: 'transparent',
      textColor: '#6366f1',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 15,
      disabledOpacity: 0.4,
    },
  },

  hint: {
    // Default: vibrant indigo
    backgroundColor: '#6366f1',
    pulseColor: 'rgba(99, 102, 241, 0.35)',
    size: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#ffffff',
    types: {
      info: {
        backgroundColor: '#3B82F6',
        pulseColor: 'rgba(59, 130, 246, 0.35)',
        icon: 'i',
      },
      warning: {
        backgroundColor: '#F59E0B',
        pulseColor: 'rgba(245, 158, 11, 0.35)',
        icon: '!',
      },
      error: {
        backgroundColor: '#EF4444',
        pulseColor: 'rgba(239, 68, 68, 0.35)',
        icon: 'x',
      },
      success: {
        backgroundColor: '#10B981',
        pulseColor: 'rgba(16, 185, 129, 0.35)',
        icon: '✓',
      },
    },
  },

  progress: {
    barBackgroundColor: '#e2e8f0',
    barFillColor: '#6366f1',
    barHeight: 6,
    bulletColor: '#e2e8f0',
    bulletActiveColor: '#6366f1',
    bulletSize: 10,
  },
};
