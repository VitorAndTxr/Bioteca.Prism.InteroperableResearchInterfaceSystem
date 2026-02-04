/**
 * IRIS Mobile - Typography System
 *
 * Defines font families, sizes, weights, and line heights.
 * Uses system fonts with weights specified for later custom font integration.
 *
 * Font Stack (to be loaded via expo-font later):
 * - Title: Overpass (weight 800)
 * - UI: Inter (weight 600)
 * - Body: Nunito (weight 400)
 */

// Font families
export const fontFamily = {
  title: 'System', // Will be 'Overpass' when loaded
  ui: 'System',    // Will be 'Inter' when loaded
  body: 'System',  // Will be 'Nunito' when loaded
} as const;

// Font weights
export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Font sizes (in pixels)
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// Line heights (in pixels)
export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 30,
  '2xl': 32,
  '3xl': 36,
  '4xl': 42,
} as const;

// Letter spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
} as const;

// Typography presets
export const typography = {
  // Titles (Overpass, weight 800)
  title1: {
    fontFamily: fontFamily.title,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: lineHeight['4xl'],
    letterSpacing: letterSpacing.wide,
  },
  title2: {
    fontFamily: fontFamily.title,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: lineHeight['3xl'],
    letterSpacing: letterSpacing.wide,
  },
  title3: {
    fontFamily: fontFamily.title,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    lineHeight: lineHeight['2xl'],
    letterSpacing: letterSpacing.normal,
  },

  // UI Elements (Inter, weight 600)
  uiLarge: {
    fontFamily: fontFamily.ui,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.lg,
  },
  uiBase: {
    fontFamily: fontFamily.ui,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.base,
  },
  uiSmall: {
    fontFamily: fontFamily.ui,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.sm,
  },

  // Body Text (Nunito, weight 400)
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.lg,
  },
  bodyBase: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.base,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.sm,
  },
  bodyExtraSmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.xs,
  },

  // Button text (Inter, weight 600)
  buttonLarge: {
    fontFamily: fontFamily.ui,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.lg,
  },
  buttonBase: {
    fontFamily: fontFamily.ui,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.base,
  },
  buttonSmall: {
    fontFamily: fontFamily.ui,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.sm,
  },
} as const;

export type TypographyPreset = keyof typeof typography;
