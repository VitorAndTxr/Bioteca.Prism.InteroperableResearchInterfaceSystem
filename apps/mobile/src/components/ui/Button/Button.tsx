/**
 * Button Component
 *
 * Primary interactive element for user actions.
 * Supports multiple variants, sizes, loading state, and optional icons.
 */

import React, { FC } from 'react';
import { Text, View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { ButtonProps } from './Button.types';
import { theme } from '@/theme';

export const Button: FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const computeStyles = (pressed: boolean) => [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    pressed && !isDisabled && styles.pressed,
    style,
  ];

  return (
    <Pressable
      style={({ pressed }) => computeStyles(pressed)}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.surface}
          style={styles.loader}
        />
      )}
      {!loading && icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
          styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles],
          isDisabled && styles.textDisabled,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.sm,
  },

  // Size variants
  sm: {
    height: 32,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    height: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    height: 56,
    paddingHorizontal: theme.spacing.xl,
  },

  // Color variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  outline: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },

  // Icon and loader
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  loader: {
    marginRight: theme.spacing.sm,
  },

  // Text styles
  text: {
    ...theme.typography.uiBase,
  },
  textSm: {
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.sm,
  },
  textMd: {
    fontSize: theme.fontSize.base,
    lineHeight: theme.lineHeight.base,
  },
  textLg: {
    fontSize: theme.fontSize.lg,
    lineHeight: theme.lineHeight.lg,
  },

  // Text color variants
  textPrimary: {
    color: theme.colors.surface,
  },
  textSecondary: {
    color: theme.colors.surface,
  },
  textDanger: {
    color: theme.colors.surface,
  },
  textGhost: {
    color: theme.colors.primary,
  },
  textOutline: {
    color: theme.colors.textBody,
  },
  textDisabled: {
    opacity: 1, // Reset parent opacity for text
  },
});
