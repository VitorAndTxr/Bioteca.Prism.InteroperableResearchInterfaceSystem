/**
 * Root Navigator
 *
 * Top-level navigator handling authentication flow.
 *
 * Flow:
 * 1. If isLoading → Show splash/loading screen
 * 2. If isAuthenticated → Show Main tab navigator
 * 3. Else → Show Login screen
 *
 * Acceptance Criteria:
 * - AC-002.1: Unauthenticated users redirected to LoginScreen
 * - AC-002.2: Authenticated users can navigate freely
 * - AC-002.3: Token expiry redirects to LoginScreen with message
 * - AC-026.4: Tab bar not visible on LoginScreen
 */

import React, { FC, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';

// Import navigators and screens
import { MainTabNavigator } from './MainTabNavigator';
import { LoginScreen } from '@/screens/LoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: FC = () => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // Monitor for token expiry errors
  useEffect(() => {
    if (error && error.includes('expired')) {
      setSessionExpiredMessage('Your session has expired. Please log in again.');
    }
  }, [error]);

  // Show loading screen while auth state is being determined
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading IRIS...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        // Authenticated: Show main app with tabs
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        // Not authenticated: Show login screen
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{
            sessionExpiredMessage: sessionExpiredMessage,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
  },
});
