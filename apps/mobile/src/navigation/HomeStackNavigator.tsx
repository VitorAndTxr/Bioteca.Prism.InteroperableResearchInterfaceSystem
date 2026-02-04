/**
 * Home Stack Navigator
 *
 * Nested stack navigator within the Home tab.
 * Handles the main session workflow: configuration → active session → capture → annotations.
 *
 * Features:
 * - SessionConfigScreen has logout button in header
 * - CaptureScreen hides the parent tab bar for immersive experience
 * - Stack state is preserved when switching tabs
 */

import React, { FC } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import { theme } from '@/theme';
import { useAuth } from '@/context/AuthContext';

// Import screens
import { SessionConfigScreen } from '@/screens/SessionConfigScreen';
import { ActiveSessionScreen } from '@/screens/ActiveSessionScreen';
import { CaptureScreen } from '@/screens/CaptureScreen';
import { AnnotationsListScreen } from '@/screens/AnnotationsListScreen';
import { NewAnnotationScreen } from '@/screens/NewAnnotationScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[HomeStackNavigator] Logout error:', error);
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="SessionConfig"
        component={SessionConfigScreen}
        options={{
          title: 'New Session',
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>⎋</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        options={{
          title: 'Active Session',
        }}
      />
      <Stack.Screen
        name="Capture"
        component={CaptureScreen}
        options={{
          title: 'Data Capture',
          // Hide tab bar on this screen for full-screen experience
          tabBarStyle: { display: 'none' },
        }}
      />
      <Stack.Screen
        name="AnnotationsList"
        component={AnnotationsListScreen}
        options={{
          title: 'Annotations',
        }}
      />
      <Stack.Screen
        name="NewAnnotation"
        component={NewAnnotationScreen}
        options={{
          title: 'Add Annotation',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  logoutText: {
    color: theme.colors.surface,
    fontSize: 20,
  },
});
