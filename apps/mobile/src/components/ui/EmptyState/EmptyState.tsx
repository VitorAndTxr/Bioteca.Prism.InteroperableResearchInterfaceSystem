/**
 * EmptyState Component
 *
 * Displays a centered message when lists or content areas are empty.
 * Provides visual feedback and optional call-to-action button.
 */

import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmptyStateProps } from './EmptyState.types';
import { Button } from '../Button';
import { theme } from '@/theme';

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {action && (
        <View style={styles.actionContainer}>
          <Button
            title={action.label}
            onPress={action.onPress}
            variant="primary"
            size="md"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['4xl'],
  },

  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.6,
  },

  title: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },

  message: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },

  actionContainer: {
    marginTop: theme.spacing.md,
  },
});
