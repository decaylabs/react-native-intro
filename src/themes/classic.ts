/**
 * Classic theme - Default theme for react-native-intro
 */

import type { Theme } from './types';

/**
 * Classic theme with a clean, professional look
 */
export const classicTheme: Theme = {
  name: 'classic',

  overlay: {
    backgroundColor: '#000000',
    opacity: 0.75,
  },

  tooltip: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    maxWidth: 320,
    titleColor: '#333333',
    titleFontSize: 18,
    titleFontWeight: '600',
    contentColor: '#666666',
    contentFontSize: 14,
  },

  buttons: {
    primary: {
      backgroundColor: '#3498db',
      textColor: '#ffffff',
      borderRadius: 4,
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: 14,
      disabledOpacity: 0.5,
    },
    secondary: {
      backgroundColor: 'transparent',
      textColor: '#3498db',
      borderRadius: 4,
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: 14,
      disabledOpacity: 0.5,
    },
  },

  hint: {
    backgroundColor: '#3498db',
    pulseColor: 'rgba(52, 152, 219, 0.4)',
    size: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  progress: {
    barBackgroundColor: '#e0e0e0',
    barFillColor: '#3498db',
    barHeight: 4,
    bulletColor: '#cccccc',
    bulletActiveColor: '#3498db',
    bulletSize: 8,
  },
};
