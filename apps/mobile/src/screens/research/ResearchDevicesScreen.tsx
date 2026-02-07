/**
 * Research Devices Screen
 *
 * List, assign, remove devices from research project with calibration status.
 *
 * Features (US-RC-030):
 * - FlatList of device cards with device ID, role, calibration badge, last calibration date
 * - Calibration badge colors: Calibrated (green), NotCalibrated (yellow), Expired (red), InProgress (blue)
 * - Tap card navigates to ResearchDeviceSensors
 * - "Assign Device" header button
 * - Long-press to remove with confirmation
 */

import React, { FC, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { ResearchDevice, CalibrationStatus } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/theme';
import { Cpu, Plus, AlertCircle, ChevronRight } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResearchDevices'>;

const CALIBRATION_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  [CalibrationStatus.CALIBRATED]: { bg: '#D1FAE5', text: '#065F46' },
  [CalibrationStatus.NOT_CALIBRATED]: { bg: '#FEF3C7', text: '#92400E' },
  [CalibrationStatus.EXPIRED]: { bg: '#FEE2E2', text: '#991B1B' },
  [CalibrationStatus.IN_PROGRESS]: { bg: '#DBEAFE', text: '#1E40AF' },
};

export const ResearchDevicesScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId } = route.params;
  const [devices, setDevices] = useState<ResearchDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);
        const data = await researchService.getDevices(researchId);
        setDevices(data);
      } catch (err) {
        console.error('[ResearchDevicesScreen] Fetch error:', err);
        setError('Failed to load devices.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [researchId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchDevices();
    }, [researchId]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleAssignDevice} style={styles.headerButton}>
          <Plus size={20} color={theme.colors.surface} />
        </Pressable>
      ),
    });
  }, [navigation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAssignDevice = () => {
    Alert.alert(
      'Assign Device',
      'Device assignment by ID would be implemented with a dedicated input dialog. For now, this is a mock placeholder.'
    );
  };

  const handleRemoveDevice = (item: ResearchDevice) => {
    Alert.alert('Remove Device', `Are you sure you want to remove device ${item.deviceId}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await researchService.removeDevice(researchId, item.deviceId);
            fetchDevices();
          } catch (err) {
            console.error('[ResearchDevicesScreen] Remove error:', err);
            Alert.alert('Error', 'Failed to remove device.');
          }
        },
      },
    ]);
  };

  const renderDeviceCard = ({ item }: { item: ResearchDevice }) => {
    const badgeColors =
      CALIBRATION_BADGE_COLORS[item.calibrationStatus] ??
      CALIBRATION_BADGE_COLORS[CalibrationStatus.NOT_CALIBRATED];

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() =>
          navigation.navigate('ResearchDeviceSensors', {
            researchId,
            deviceId: item.deviceId,
            deviceName: item.deviceId,
          })
        }
        onLongPress={() => handleRemoveDevice(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>Device: {item.deviceId}</Text>
            <Text style={styles.cardRole}>{item.role}</Text>
          </View>
          <View style={styles.cardRight}>
            <View style={[styles.calibrationBadge, { backgroundColor: badgeColors.bg }]}>
              <Text style={[styles.calibrationBadgeText, { color: badgeColors.text }]}>
                {item.calibrationStatus}
              </Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textMuted} />
          </View>
        </View>

        {item.lastCalibrationDate && (
          <Text style={styles.cardDetail}>Last calibration: {item.lastCalibrationDate}</Text>
        )}
        <Text style={styles.cardHint}>Tap to view sensors | Long-press to remove</Text>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon={<AlertCircle size={48} color={theme.colors.error} />}
          title="Error"
          message={error}
          action={{ label: 'Retry', onPress: () => fetchDevices() }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.deviceId}
        renderItem={renderDeviceCard}
        contentContainerStyle={[
          styles.listContent,
          devices.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchDevices(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Cpu size={48} color={theme.colors.textMuted} />}
            title="No devices assigned"
            message="Tap the + button in the header to assign a device."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
  },
  cardRole: {
    ...theme.typography.bodySmall,
    color: theme.colors.textBody,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  calibrationBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  calibrationBadgeText: {
    ...theme.typography.uiSmall,
    fontWeight: '600',
  },
  cardDetail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  cardHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    fontSize: 11,
  },
});
