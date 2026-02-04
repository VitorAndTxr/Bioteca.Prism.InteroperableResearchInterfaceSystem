/**
 * Bluetooth Screen
 *
 * Manages Bluetooth device connection and pairing.
 * Accessible via the Bluetooth tab in the bottom tab navigator.
 *
 * User Stories:
 * - US-019: View Bluetooth Devices
 * - US-020: Connect/Disconnect Device
 * - US-021: Troubleshooting Guide
 */

import React, { FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useBluetoothContext } from '@/context/BluetoothContext';
import { BluetoothDevice } from 'react-native-bluetooth-classic';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Bluetooth'>,
  NativeStackScreenProps<RootStackParamList>
>;

type DeviceWithStatus = BluetoothDevice & { active: boolean };

export const BluetoothScreen: FC<Props> = ({ navigation }) => {
  const {
    bluetoothOn,
    pairedDevices,
    isScanning,
    selectedDevice,
    signalStrength,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    openBluetoothSettings,
  } = useBluetoothContext();

  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    if (bluetoothOn) {
      scanForDevices();
    }
  }, []);

  const handleRefresh = async () => {
    if (!bluetoothOn) {
      Alert.alert(
        'Bluetooth Disabled',
        'Please enable Bluetooth to scan for devices.',
        [{ text: 'OK' }]
      );
      return;
    }

    await scanForDevices();
  };

  const handleConnect = async (device: DeviceWithStatus) => {
    if (device.active) {
      Alert.alert(
        'Disconnect Device',
        `Do you want to disconnect from ${device.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              try {
                await disconnectDevice();
                Alert.alert('Success', 'Device disconnected successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to disconnect device');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Connect Device',
        `Connect to ${device.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: async () => {
              try {
                await connectToDevice(device.address);
                Alert.alert('Success', `Connected to ${device.name}`);
              } catch (error) {
                Alert.alert(
                  'Connection Failed',
                  'Unable to connect to device. Please ensure the device is powered on and in range.'
                );
              }
            },
          },
        ]
      );
    }
  };

  const getDeviceStatus = (device: DeviceWithStatus): 'connected' | 'available' | 'unavailable' => {
    if (device.active) {
      return 'connected';
    }
    return 'available';
  };

  const getStatusBadge = (status: 'connected' | 'available' | 'unavailable') => {
    switch (status) {
      case 'connected':
        return {
          text: 'Connected',
          style: styles.statusConnected,
          textStyle: styles.statusConnectedText,
        };
      case 'available':
        return {
          text: 'Available',
          style: styles.statusAvailable,
          textStyle: styles.statusAvailableText,
        };
      case 'unavailable':
        return {
          text: 'Unavailable',
          style: styles.statusUnavailable,
          textStyle: styles.statusUnavailableText,
        };
    }
  };

  const renderDevice = ({ item }: { item: DeviceWithStatus }) => {
    const status = getDeviceStatus(item);
    const badge = getStatusBadge(status);
    const deviceSignal = item.active && selectedDevice?.address === item.address ? signalStrength : null;

    return (
      <TouchableOpacity
        style={styles.deviceCard}
        onPress={() => handleConnect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.deviceInfo}>
          <View style={[
            styles.deviceIcon,
            item.active ? styles.deviceIconConnected : styles.deviceIconInactive,
          ]}>
            <Text style={styles.deviceIconText}>📱</Text>
          </View>
          <View style={styles.deviceDetails}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceAddress}>
              {deviceSignal !== null ? `Signal: ${deviceSignal}%` : item.address}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, badge.style]}>
          <Text style={badge.textStyle}>{badge.text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bluetooth Devices</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isScanning}
          style={styles.refreshButton}
        >
          <Text style={[styles.refreshIcon, isScanning && styles.refreshIconAnimated]}>
            ↻
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {!bluetoothOn && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Bluetooth is disabled</Text>
              <Text style={styles.warningText}>
                Enable Bluetooth to scan and connect to devices.
              </Text>
              <TouchableOpacity
                style={styles.enableButton}
                onPress={openBluetoothSettings}
              >
                <Text style={styles.enableButtonText}>Enable Bluetooth</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isScanning && (
          <View style={styles.scanningCard}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.scanningText}>Searching for devices...</Text>
          </View>
        )}

        {bluetoothOn && !isScanning && pairedDevices.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateText}>No paired devices found</Text>
            <Text style={styles.emptyStateSubtext}>
              Pair a device in system Bluetooth settings, then refresh this screen.
            </Text>
          </View>
        )}

        {bluetoothOn && pairedDevices.length > 0 && (
          <FlatList
            data={pairedDevices as DeviceWithStatus[]}
            renderItem={renderDevice}
            keyExtractor={(item) => item.address}
            contentContainerStyle={styles.deviceList}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>PAIRED DEVICES</Text>
            }
          />
        )}

        <View style={styles.troubleshootingSection}>
          <Pressable
            style={styles.troubleshootingHeader}
            onPress={() => setShowTroubleshooting(!showTroubleshooting)}
          >
            <Text style={styles.troubleshootingTitle}>
              ❌ Connection Problems?
            </Text>
            <Text style={styles.troubleshootingToggle}>
              {showTroubleshooting ? '▼' : '▶'}
            </Text>
          </Pressable>

          {showTroubleshooting && (
            <View style={styles.troubleshootingContent}>
              <View style={styles.troubleshootingItem}>
                <Text style={styles.troubleshootingItemTitle}>
                  Device not appearing
                </Text>
                <Text style={styles.troubleshootingItemText}>
                  • Ensure the device is powered on{'\n'}
                  • Check that the device is within range{'\n'}
                  • Verify the device is paired in system Bluetooth settings{'\n'}
                  • Tap the refresh button to rescan
                </Text>
              </View>

              <View style={styles.troubleshootingItem}>
                <Text style={styles.troubleshootingItemTitle}>
                  Connection drops
                </Text>
                <Text style={styles.troubleshootingItemText}>
                  • Check device battery level{'\n'}
                  • Reduce distance between phone and device{'\n'}
                  • For sEMG devices, ensure base station is powered on{'\n'}
                  • Restart both the app and the device
                </Text>
              </View>

              <View style={styles.troubleshootingItem}>
                <Text style={styles.troubleshootingItemTitle}>
                  No signal detected
                </Text>
                <Text style={styles.troubleshootingItemText}>
                  • Power cycle the device (turn off and on){'\n'}
                  • Disconnect and reconnect in this screen{'\n'}
                  • Unpair and re-pair in system settings{'\n'}
                  • Verify device firmware is up to date
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  title: {
    ...theme.typography.title1,
    color: theme.colors.textTitle,
  },
  refreshButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  refreshIcon: {
    fontSize: 24,
    color: theme.colors.textMuted,
  },
  refreshIconAnimated: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing['2xl'],
  },
  warningCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.primary + '33',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    ...theme.typography.bodyBase,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.md,
  },
  enableButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  enableButtonText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  scanningCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
    gap: theme.spacing.md,
  },
  scanningText: {
    ...theme.typography.bodyBase,
    fontWeight: '500',
    color: theme.colors.primaryDark,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyStateText: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  sectionTitle: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: theme.spacing.lg,
  },
  deviceList: {
    paddingBottom: theme.spacing['2xl'],
  },
  deviceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceIconConnected: {
    backgroundColor: theme.colors.success + '1A',
  },
  deviceIconInactive: {
    backgroundColor: theme.colors.backgroundAlt,
  },
  deviceIconText: {
    fontSize: 20,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    ...theme.typography.bodyBase,
    fontWeight: '600',
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.xs / 2,
  },
  deviceAddress: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  statusConnected: {
    backgroundColor: theme.colors.success + '1A',
  },
  statusConnectedText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.success,
  },
  statusAvailable: {
    backgroundColor: theme.colors.primary + '1A',
  },
  statusAvailableText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  statusUnavailable: {
    backgroundColor: theme.colors.textMuted + '1A',
  },
  statusUnavailableText: {
    ...theme.typography.bodySmall,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  troubleshootingSection: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginTop: theme.spacing['2xl'],
  },
  troubleshootingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  troubleshootingTitle: {
    ...theme.typography.bodyBase,
    fontWeight: '700',
    color: theme.colors.textBody,
  },
  troubleshootingToggle: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
  },
  troubleshootingContent: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  troubleshootingItem: {
    gap: theme.spacing.sm,
  },
  troubleshootingItemTitle: {
    ...theme.typography.bodyBase,
    fontWeight: '600',
    color: theme.colors.textTitle,
  },
  troubleshootingItemText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textBody,
    lineHeight: 20,
  },
});
