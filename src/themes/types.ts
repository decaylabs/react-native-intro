/**
 * Theme type definitions
 */

import type { TextStyle } from 'react-native';

/**
 * Overlay visual style
 */
export interface OverlayStyle {
  backgroundColor: string;
  opacity: number;
}

/**
 * Tooltip visual style
 */
export interface TooltipStyleConfig {
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  maxWidth: number;
  titleColor: string;
  titleFontSize: number;
  titleFontWeight: TextStyle['fontWeight'];
  contentColor: string;
  contentFontSize: number;
}

/**
 * Button visual style
 */
export interface ButtonStyleConfig {
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
  disabledOpacity: number;
}

/**
 * Hint type colors for semantic hints
 */
export interface HintTypeColors {
  backgroundColor: string;
  pulseColor: string;
  icon: string;
}

/**
 * Hint indicator visual style
 */
export interface HintStyleConfig {
  backgroundColor: string;
  pulseColor: string;
  size: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  /** Colors for different hint types */
  types: {
    info: HintTypeColors;
    warning: HintTypeColors;
    error: HintTypeColors;
    success: HintTypeColors;
  };
}

/**
 * Progress indicator visual style
 */
export interface ProgressStyleConfig {
  barBackgroundColor: string;
  barFillColor: string;
  barHeight: number;
  bulletColor: string;
  bulletActiveColor: string;
  bulletSize: number;
}

/**
 * Complete theme configuration
 */
export interface Theme {
  name: string;
  overlay: OverlayStyle;
  tooltip: TooltipStyleConfig;
  buttons: {
    primary: ButtonStyleConfig;
    secondary: ButtonStyleConfig;
  };
  hint: HintStyleConfig;
  progress: ProgressStyleConfig;
}

/**
 * Theme name for built-in themes
 */
export type ThemeName = 'classic' | 'modern' | 'dark';
