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
 * 4. SyncProvider - Data synchronization (starts when authenticated)
 * 5. NavigationContainer - React Navigation
 * 6. RootNavigator - Auth-gated navigation
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
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
import { RootNavigator } from './src/navigation';
import { databaseManager } from './src/data/database';

SplashScreen.preventAutoHideAsync();

export default function App() {
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

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <BluetoothContextProvider>
        <AuthProvider>
          <SessionProvider>
            <SyncProvider syncIntervalMs={60000} maxRetries={5}>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </SyncProvider>
          </SessionProvider>
        </AuthProvider>
      </BluetoothContextProvider>
    </View>
  );
}
