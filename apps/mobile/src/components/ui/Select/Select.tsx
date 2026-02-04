/**
 * Select Component
 *
 * Dropdown picker for selecting from predefined options.
 * Uses @react-native-picker/picker for cross-platform support.
 */

import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SelectProps } from './Select.types';
import { theme } from '@/theme';

export const Select: FC<SelectProps> = ({
  label,
  value,
  options,
  onValueChange,
  placeholder,
  error,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.pickerWrapper,
          error && styles.pickerWrapperError,
          disabled && styles.pickerWrapperDisabled,
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={styles.picker}
        >
          {placeholder && (
            <Picker.Item
              label={placeholder}
              value=""
              enabled={false}
            />
          )}
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
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

  pickerWrapper: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },

  pickerWrapperError: {
    borderColor: theme.colors.error,
  },

  pickerWrapperDisabled: {
    backgroundColor: theme.colors.backgroundAlt,
    opacity: 0.6,
  },

  picker: {
    height: 50,
    color: theme.colors.textBody,
  },

  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
