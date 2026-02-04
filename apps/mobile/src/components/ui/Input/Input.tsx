/**
 * Input Component
 *
 * Text input field with label, error state, and optional icons.
 * Supports secure text entry and multiline mode.
 */

import React, { FC, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { InputProps } from './Input.types';
import { theme } from '@/theme';

export const Input: FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightElement,
  disabled = false,
  multiline = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          disabled && styles.inputWrapperDisabled,
          multiline && styles.inputWrapperMultiline,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            rightElement ? styles.inputWithRightElement : undefined,
            multiline ? styles.inputMultiline : undefined,
          ]}
          placeholderTextColor={theme.colors.textPlaceholder}
          editable={!disabled}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightElement && <View style={styles.rightElementContainer}>{rightElement}</View>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    ...theme.typography.uiSmall,
    color: theme.colors.textBody,
    marginBottom: theme.spacing.xs,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    minHeight: 48,
  },

  inputWrapperFocused: {
    borderColor: theme.colors.primaryDark,
    borderWidth: 1,
  },

  inputWrapperError: {
    borderColor: theme.colors.error,
  },

  inputWrapperDisabled: {
    backgroundColor: theme.colors.backgroundAlt,
    opacity: 0.6,
  },

  inputWrapperMultiline: {
    minHeight: 96,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
  },

  input: {
    flex: 1,
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  inputWithLeftIcon: {
    paddingLeft: 0,
  },

  inputWithRightElement: {
    paddingRight: 0,
  },

  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },

  leftIconContainer: {
    paddingLeft: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rightElementContainer: {
    paddingRight: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
