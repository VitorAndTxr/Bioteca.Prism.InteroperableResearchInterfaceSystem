/**
 * Main Tab Navigator
 *
 * Bottom tab navigation for authenticated users.
 * Contains 4 main tabs: Home (nested stack), History, Bluetooth, Settings.
 *
 * NOTE: Requires @react-navigation/bottom-tabs to be installed
 * Run: cd apps/mobile && npm install @react-navigation/bottom-tabs
 *
 * Features:
 * - Tab bar hidden on Login screen
 * - Tab bar hidden on Capture screen (controlled by nested stack)
 * - Unicode icons as placeholders (will be replaced with Heroicons later)
 * - Theme-based styling
 */

import React, { FC } from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { theme } from '@/theme';

// Import navigators and screens
import { HomeStackNavigator } from './HomeStackNavigator';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { BluetoothScreen } from '@/screens/BluetoothScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Headers handled by nested navigators
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🏠" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="📋" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bluetooth"
        component={BluetoothScreen}
        options={{
          title: 'Bluetooth',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="📶" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="⚙️" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Temporary TabIcon component using Unicode emoji
 * TODO: Replace with Heroicons when available
 */
interface TabIconProps {
  icon: string;
  color: string;
}

const TabIcon: FC<TabIconProps> = ({ icon, color }) => {
  return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
};
