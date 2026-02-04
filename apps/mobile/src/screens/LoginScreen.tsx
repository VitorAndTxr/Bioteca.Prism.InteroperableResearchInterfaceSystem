/**
 * Login Screen
 *
 * Primary authentication screen for researcher login.
 * Displayed when no valid session exists.
 *
 * Features:
 * - Email/username input with validation
 * - Password input with visibility toggle
 * - Loading state during authentication
 * - Inline error messages
 * - PRISM/IRIS branding
 * - Keyboard-aware layout
 */

import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: FC<Props> = ({ route }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const sessionExpiredMessage = route.params?.sessionExpiredMessage;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError(undefined);
    return true;
  };

  const handleLogin = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      return;
    }

    if (!password) {
      return;
    }

    // Attempt login
    await login(email, password);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background Gradient */}
        <View style={styles.gradientBackground} />
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.content}>
          {/* Branding */}
          <View style={styles.branding}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>IRIS</Text>
              </View>
            </View>
            <Text style={styles.title}>IRIS MOBILE</Text>
            <Text style={styles.subtitle}>PRISM FRAMEWORK</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formCard}>
            <View style={styles.formContent}>
              {/* Email Input */}
              <Input
                label="Email"
                placeholder="researcher@institution.edu"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                error={emailError}
                editable={!isLoading}
              />

              {/* Password Input */}
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                editable={!isLoading}
                rightElement={
                  <Pressable onPress={togglePasswordVisibility} disabled={isLoading}>
                    <Text style={styles.passwordToggle}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </Pressable>
                }
              />

              {/* Session Expired Message */}
              {sessionExpiredMessage && !error && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>{sessionExpiredMessage}</Text>
                </View>
              )}

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Login Button */}
              <Button
                title="Login"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading || !email || !password}
                fullWidth
                size="lg"
              />
            </View>
          </View>

          {/* Version Info */}
          <Text style={styles.version}>Version 2.1.0 (Build 45)</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Background
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['3xl'],
    paddingVertical: theme.spacing['4xl'],
  },

  // Branding
  branding: {
    alignItems: 'center',
    marginBottom: theme.spacing['4xl'],
  },
  logoContainer: {
    marginBottom: theme.spacing['2xl'],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius['2xl'],
    backgroundColor: theme.colors.surface,
    ...theme.shadow.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    ...theme.typography.title2,
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  title: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
    letterSpacing: 4,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.uiBase,
    color: theme.colors.textTitle,
    opacity: 0.7,
  },

  // Form Card
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius['2xl'],
    ...theme.shadow.lg,
    overflow: 'hidden',
  },
  formContent: {
    padding: theme.spacing['2xl'],
    gap: theme.spacing.lg,
  },

  // Warning (session expired)
  warningContainer: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  warningText: {
    ...theme.typography.bodySmall,
    color: theme.colors.surface,
    textAlign: 'center',
  },

  // Error
  errorContainer: {
    backgroundColor: theme.colors.errorDark,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  errorText: {
    ...theme.typography.bodySmall,
    color: theme.colors.surface,
    textAlign: 'center',
  },

  // Version
  version: {
    ...theme.typography.bodySmall,
    color: theme.colors.textTitle,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: theme.spacing['3xl'],
  },

  // Password toggle
  passwordToggle: {
    fontSize: 20,
  },
});
