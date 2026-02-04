/**
 * IRIS Mobile - Color Palette
 *
 * Defines the complete color system for the application.
 * Based on MobilePrototype Tailwind theme and design specifications.
 */

export const colors = {
  // Primary colors (Teal/Cyan)
  primary: '#49A2A8',
  primaryLight: '#DAFAFD',
  primaryDark: '#387F84',
  primaryDarker: '#285F63',

  // Secondary colors (Purple)
  secondary: '#7B6FDB',
  secondaryDark: '#5244AB',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  errorDark: '#DC2626',

  // Text colors
  textTitle: '#2C3131',
  textBody: '#444B59',
  textMuted: '#9CA3AF',
  textPlaceholder: '#9CA3AF',

  // Background colors
  background: '#F9FAFB',
  backgroundAlt: '#F3F4F6',
  surface: '#FFFFFF',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradient colors (for special backgrounds)
  gradientStart: '#C8F3F6',
  gradientEnd: '#6BE6EF',

  // Shadow colors
  shadowDark: '#000000',
} as const;

export type ColorKey = keyof typeof colors;
