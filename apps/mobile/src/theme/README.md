# IRIS Mobile - Design System Theme

This directory contains the complete design system theme for IRIS Mobile, providing consistent design tokens across the application.

## Overview

The theme system is based on the MobilePrototype Tailwind design and adapted for React Native. It includes:

- **Colors**: Complete color palette including primary, secondary, status, text, and background colors
- **Typography**: Font families, sizes, weights, line heights, and preset text styles
- **Spacing**: Consistent spacing scale and border radius values
- **Shadows**: Shadow elevation system for depth and hierarchy

## Usage

Import the unified theme object or individual modules:

```typescript
import { theme } from '@/theme';

// Or import individual modules
import { colors, typography, spacing } from '@/theme';
```

## Theme Structure

### Colors (`colors.ts`)

The color system includes:

```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,     // #F9FAFB
    borderColor: theme.colors.border,             // #E5E7EB
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,        // #49A2A8 (Teal)
  },
  title: {
    color: theme.colors.textTitle,               // #2C3131
  },
});
```

**Available Colors:**
- `primary`, `primaryLight`, `primaryDark`, `primaryDarker` - Teal brand colors
- `secondary`, `secondaryDark` - Purple accent colors
- `success`, `warning`, `error`, `errorDark` - Status colors
- `textTitle`, `textBody`, `textMuted`, `textPlaceholder` - Text colors
- `background`, `backgroundAlt`, `surface` - Background colors
- `border`, `borderLight` - Border colors
- `overlay`, `overlayLight` - Overlay colors

### Typography (`typography.ts`)

Typography includes font families, sizes, and preset text styles:

```typescript
const styles = StyleSheet.create({
  title: {
    ...theme.typography.title1,  // Large title (36px, extrabold)
  },
  body: {
    ...theme.typography.bodyBase,  // Body text (16px, normal)
  },
  button: {
    ...theme.typography.buttonBase,  // Button text (16px, semibold)
  },
});
```

**Typography Presets:**
- **Titles**: `title1`, `title2`, `title3` (Overpass font, weight 800)
- **UI Elements**: `uiLarge`, `uiBase`, `uiSmall` (Inter font, weight 600)
- **Body Text**: `bodyLarge`, `bodyBase`, `bodySmall`, `bodyExtraSmall` (Nunito font, weight 400)
- **Buttons**: `buttonLarge`, `buttonBase`, `buttonSmall` (Inter font, weight 600)

**Font Sizes:**
- `xs` (12px), `sm` (14px), `base` (16px), `lg` (18px)
- `xl` (20px), `2xl` (24px), `3xl` (30px), `4xl` (36px)

### Spacing (`spacing.ts`)

Consistent spacing scale based on 4px base unit:

```typescript
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,           // 16px
    marginBottom: theme.spacing['2xl'],  // 24px
    borderRadius: theme.borderRadius.xl, // 16px
    ...theme.shadow.base,                // Elevation shadow
  },
});
```

**Spacing Values:**
- `xs` (4px), `sm` (8px), `md` (12px), `lg` (16px)
- `xl` (20px), `2xl` (24px), `3xl` (32px), `4xl` (48px)
- `5xl` (64px), `6xl` (80px)

**Border Radius:**
- `none` (0), `sm` (4px), `md` (8px), `lg` (12px)
- `xl` (16px), `2xl` (20px), `3xl` (24px), `full` (9999px)

**Shadow Elevations:**
- `none`, `sm`, `base`, `md`, `lg`, `xl`

## Complete Example

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const ExampleComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello IRIS</Text>
      <Text style={styles.body}>This uses the design system</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadow.base,
  },
  title: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.sm,
  },
  body: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
  },
});
```

## Design Principles

1. **Consistency**: Use theme tokens instead of hardcoded values
2. **Maintainability**: Change values in one place to update the entire app
3. **Type Safety**: All tokens are strongly typed with TypeScript
4. **Performance**: Uses StyleSheet.create for optimized styles
5. **Accessibility**: Color contrast ratios meet WCAG standards

## Custom Fonts

The theme currently uses system fonts with appropriate weights. To load custom fonts:

1. Install expo-font: `npm install expo-font`
2. Add font files to `assets/fonts/`
3. Update `fontFamily` values in `typography.ts`
4. Load fonts in App.tsx using `useFonts` hook

```typescript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Overpass-ExtraBold': require('./assets/fonts/Overpass-ExtraBold.ttf'),
  'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
  'Nunito-Regular': require('./assets/fonts/Nunito-Regular.ttf'),
});
```

## References

- MobilePrototype: `D:\Repos\Faculdade\PRISM\MobilePrototype\styles\globals.css`
- UI Components: `apps/mobile/src/components/ui/`
- Design Tokens: [Tailwind CSS Color Palette](https://tailwindcss.com/docs/customizing-colors)
