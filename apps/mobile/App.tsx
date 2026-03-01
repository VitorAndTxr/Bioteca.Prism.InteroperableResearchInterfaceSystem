/**
 * IRIS Mobile App
 *
 * Main application entry point.
 * Wraps the app with necessary providers and navigation.
 *
 * Provider hierarchy:
 * 1. BluetoothContextProvider - Device communication
 * 2. AuthProvider - Authentication state
 * 3. SessionProvider - Clinical session management
 * 4. SessionConfigFormProvider - Form state persistence across navigation
 * 5. SyncProvider - Data synchronization (starts when authenticated)
 * 6. NavigationContainer - React Navigation
 * 7. RootNavigator - Auth-gated navigation
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Overpass_800ExtraBold,
  Overpass_700Bold,
} from '@expo-google-fonts/overpass';
import {
  Inter_600SemiBold,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
} from '@expo-google-fonts/nunito';
import { BluetoothContextProvider } from './src/context/BluetoothContext';
import { AuthProvider } from './src/context/AuthContext';
import { SessionProvider } from './src/context/SessionContext';
import { SyncProvider } from './src/context/SyncContext';
import { SessionConfigFormProvider } from './src/context/SessionConfigFormContext';
import { RootNavigator } from './src/navigation';
import { databaseManager } from './src/data/database';

SplashScreen.preventAutoHideAsync();

const envErrorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#C0392B',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidResearchId(value: string | undefined): boolean {
  if (!value || value.trim() === '') return false;
  return UUID_REGEX.test(value.trim());
}

export default function App() {
  const researchId = process.env.EXPO_PUBLIC_RESEARCH_ID;
  const researchIdValid = isValidResearchId(researchId);

  const [fontsLoaded] = useFonts({
    'Overpass-ExtraBold': Overpass_800ExtraBold,
    'Overpass-Bold': Overpass_700Bold,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Medium': Inter_500Medium,
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
  });

  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    databaseManager.initialize()
      .then(() => setDbReady(true))
      .catch((error) => console.error('[App] Database initialization failed:', error));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && dbReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) {
    return null;
  }

  if (!researchIdValid) {
    return (
      <View style={envErrorStyles.container} onLayout={onLayoutRootView}>
        <Text style={envErrorStyles.title}>Configuration Error</Text>
        <Text style={envErrorStyles.message}>
          {`EXPO_PUBLIC_RESEARCH_ID is missing or invalid.\n\nSet it to a valid UUID in your .env file and rebuild the app.\n\nCurrent value: "${researchId ?? '(not set)'}"`}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <BluetoothContextProvider>
        <AuthProvider>
          <SessionProvider>
            <SessionConfigFormProvider>
              <SyncProvider syncIntervalMs={60000} maxRetries={5}>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </SyncProvider>
            </SessionConfigFormProvider>
          </SessionProvider>
        </AuthProvider>
      </BluetoothContextProvider>
    </View>
  );
}
