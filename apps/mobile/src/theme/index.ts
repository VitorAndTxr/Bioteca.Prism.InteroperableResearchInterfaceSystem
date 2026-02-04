/**
 * IRIS Mobile - Theme Index
 *
 * Central export for all theme tokens.
 * Import this file to access the complete theme system.
 *
 * @example
 * import { theme } from '@/theme';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing.lg,
 *     borderRadius: theme.borderRadius.lg,
 *   },
 *   title: {
 *     ...theme.typography.title1,
 *     color: theme.colors.textTitle,
 *   },
 * });
 */

import { colors } from './colors';
import { typography, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from './typography';
import { spacing, borderRadius, shadow } from './spacing';

export const theme = {
  colors,
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  spacing,
  borderRadius,
  shadow,
} as const;

// Re-export individual modules for convenience
export { colors } from './colors';
export { typography, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } from './typography';
export { spacing, borderRadius, shadow } from './spacing';

// Re-export types
export type { ColorKey } from './colors';
export type { TypographyPreset } from './typography';
export type { SpacingKey, BorderRadiusKey, ShadowKey } from './spacing';
