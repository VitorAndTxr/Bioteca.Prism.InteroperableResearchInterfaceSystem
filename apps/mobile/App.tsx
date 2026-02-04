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

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { BluetoothContextProvider } from './src/context/BluetoothContext';
import { AuthProvider } from './src/context/AuthContext';
import { SessionProvider } from './src/context/SessionContext';
import { SyncProvider } from './src/context/SyncContext';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
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
  );
}
