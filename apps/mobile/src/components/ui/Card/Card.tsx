/**
 * Card Component
 *
 * Container component with elevated surface styling.
 * Used for grouping related content with visual separation.
 */

import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { CardProps } from './Card.types';
import { theme } from '@/theme';

export const Card: FC<CardProps> = ({
  children,
  variant = 'default',
  padded = true,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        padded && styles.padded,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },

  default: {
    ...theme.shadow.base,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },

  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },

  padded: {
    padding: theme.spacing.lg,
  },
});
