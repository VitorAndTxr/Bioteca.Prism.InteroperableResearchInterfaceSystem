/**
 * Settings Screen
 *
 * Application settings and user preferences.
 * Accessible via the Settings tab in the bottom tab navigator.
 *
 * Features:
 * - Profile card with user information
 * - Appearance settings (light/dark mode placeholder)
 * - Export format preferences
 * - App version info
 * - Logout with active session warning
 */

import React, { FC, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { preferencesService } from '@/services/PreferencesService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

const APP_VERSION = '1.0.0';

export const SettingsScreen: FC<Props> = ({ navigation }) => {
  const { user, researcher, logout } = useAuth();

  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [appearancePref, exportPref] = await Promise.all([
        preferencesService.getAppearance(),
        preferencesService.getExportFormat(),
      ]);
      setAppearance(appearancePref);
      setExportFormat(exportPref);
    } catch (error) {
      console.error('[SettingsScreen] Failed to load preferences:', error);
    }
  };

  const handleAppearanceToggle = useCallback(async () => {
    const newAppearance = appearance === 'light' ? 'dark' : 'light';
    setAppearance(newAppearance);
    try {
      await preferencesService.setAppearance(newAppearance);
    } catch (error) {
      console.error('[SettingsScreen] Failed to save appearance:', error);
      Alert.alert('Error', 'Failed to save appearance preference');
    }
  }, [appearance]);

  const handleExportFormatToggle = useCallback(async () => {
    const newFormat = exportFormat === 'csv' ? 'json' : 'csv';
    setExportFormat(newFormat);
    try {
      await preferencesService.setExportFormat(newFormat);
    } catch (error) {
      console.error('[SettingsScreen] Failed to save export format:', error);
      Alert.alert('Error', 'Failed to save export format preference');
    }
  }, [exportFormat]);

  const handleLogout = useCallback(() => {
    // TODO: Check for active session when SessionContext is implemented
    // For now, show a simple confirmation
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('[SettingsScreen] Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [logout]);

  // Get display name and email
  const displayName = researcher?.name || user?.name || user?.username || 'User';
  const displayEmail = researcher?.email || user?.email || '';
  const displayRole = researcher?.role === 'chief_researcher'
    ? 'Lead Researcher'
    : researcher?.role === 'researcher'
    ? 'Researcher'
    : 'User';

  // Get initials for avatar
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileRole}>{displayRole}</Text>
              {displayEmail && <Text style={styles.profileEmail}>{displayEmail}</Text>}
            </View>
          </View>
        </Card>

        {/* General Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>GENERAL</Text>
          <Card padded={false}>
            <SettingRow
              label="Appearance"
              value={appearance === 'light' ? 'Light' : 'Dark'}
              onPress={handleAppearanceToggle}
              showBorder
            />
            <SettingRow
              label="Export Preferences"
              value={exportFormat.toUpperCase()}
              onPress={handleExportFormatToggle}
            />
          </Card>
        </View>

        {/* System Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SYSTEM</Text>
          <Card padded={false}>
            <SettingRow
              label="App Version"
              value={APP_VERSION}
              onPress={undefined}
            />
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            variant="outline"
            fullWidth
            onPress={handleLogout}
          />
          <Text style={styles.copyright}>
            IRIS Mobile v{APP_VERSION}{'\n'}
            © 2026 PRISM Framework
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// SettingRow Component
interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showBorder?: boolean;
}

const SettingRow: FC<SettingRowProps> = ({ label, value, onPress, showBorder }) => {
  const content = (
    <>
      <Text style={styles.settingLabel}>{label}</Text>
      {value && (
        <View style={styles.settingValueContainer}>
          <Text style={styles.settingValue}>{value}</Text>
          {onPress && <Text style={styles.chevron}>›</Text>}
        </View>
      )}
    </>
  );

  const rowStyle = [
    styles.settingRow,
    showBorder && styles.settingRowBorder,
    !onPress && styles.settingRowDisabled,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={rowStyle} onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={rowStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },

  // Header
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
  },

  // Profile Card
  profileCard: {
    marginBottom: theme.spacing['2xl'],
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.title3,
    color: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  profileName: {
    ...theme.typography.uiLarge,
    color: theme.colors.textTitle,
  },
  profileRole: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
  },
  profileEmail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },

  // Section
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionHeader: {
    ...theme.typography.bodyExtraSmall,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textMuted,
    letterSpacing: theme.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    minHeight: 56,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  settingRowDisabled: {
    opacity: 1,
  },
  settingLabel: {
    ...theme.typography.uiBase,
    color: theme.colors.textBody,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  settingValue: {
    ...theme.typography.bodySmall,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  chevron: {
    ...theme.typography.title3,
    color: theme.colors.textMuted,
    lineHeight: theme.lineHeight['2xl'],
  },

  // Logout
  logoutContainer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  copyright: {
    ...theme.typography.bodyExtraSmall,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.lineHeight.sm,
  },
});
