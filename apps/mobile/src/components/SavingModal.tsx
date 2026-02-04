/**
 * Saving Modal
 *
 * Overlay modal shown during recording save operations.
 * Displays saving progress, success, and error states.
 */

import React, { FC } from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/theme';

export interface SavingModalProps {
  visible: boolean;
  status: 'saving' | 'success' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
}

export const SavingModal: FC<SavingModalProps> = ({
  visible,
  status,
  errorMessage,
  onRetry,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {status === 'saving' && (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.message}>Saving recording...</Text>
              <Text style={styles.submessage}>
                Please wait while we save your data
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.message}>Recording saved!</Text>
            </>
          )}

          {status === 'error' && (
            <>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>✕</Text>
              </View>
              <Text style={styles.errorMessage}>Save failed</Text>
              {errorMessage && (
                <Text style={styles.errorDetail}>{errorMessage}</Text>
              )}
              {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing['2xl'],
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 320,
    ...theme.shadow.lg,
  },
  message: {
    fontFamily: theme.fontFamily.title,
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.extrabold,
    lineHeight: theme.lineHeight['2xl'],
    color: theme.colors.textTitle,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  submessage: {
    fontFamily: theme.fontFamily.body,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.normal,
    lineHeight: theme.lineHeight.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.surface,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.surface,
  },
  errorMessage: {
    fontFamily: theme.fontFamily.title,
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.extrabold,
    lineHeight: theme.lineHeight['2xl'],
    color: theme.colors.error,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  errorDetail: {
    fontFamily: theme.fontFamily.body,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.normal,
    lineHeight: theme.lineHeight.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  retryButton: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    fontFamily: theme.fontFamily.ui,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    lineHeight: theme.lineHeight.base,
    color: theme.colors.surface,
  },
});
