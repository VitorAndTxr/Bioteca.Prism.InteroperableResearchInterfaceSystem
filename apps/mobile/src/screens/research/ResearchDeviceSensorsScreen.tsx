/**
 * Research Device Sensors Screen
 *
 * Read-only list of sensors for a device within a research project.
 *
 * Features (US-RC-031):
 * - FlatList of sensor cards: name, sampling rate, unit, accuracy, range
 * - Header title shows device name from params
 * - Read-only — no add/edit/delete actions
 * - Empty state if no sensors attached
 * - Pull-to-refresh
 */

import React, { FC, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { Sensor } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/theme';
import { Radio, AlertCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResearchDeviceSensors'>;

export const ResearchDeviceSensorsScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId, deviceId, deviceName } = route.params;
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `Sensors — ${deviceName}`,
    });
  }, [navigation, deviceName]);

  const fetchSensors = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);
        const data = await researchService.getDeviceSensors(researchId, deviceId);
        setSensors(data);
      } catch (err) {
        console.error('[ResearchDeviceSensorsScreen] Fetch error:', err);
        setError('Failed to load sensors.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [researchId, deviceId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchSensors();
    }, [researchId, deviceId]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  const renderSensorCard = ({ item }: { item: Sensor }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item.name}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Sampling Rate</Text>
        <Text style={styles.detailValue}>{item.maxSamplingRate} Hz</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Unit</Text>
        <Text style={styles.detailValue}>{item.unit}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Accuracy</Text>
        <Text style={styles.detailValue}>{item.accuracy}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Range</Text>
        <Text style={styles.detailValue}>
          {item.minRange} to {item.maxRange} {item.unit}
        </Text>
      </View>

      {item.additionalInfo ? (
        <Text style={styles.additionalInfo}>{item.additionalInfo}</Text>
      ) : null}
    </View>
  );

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
          action={{ label: 'Retry', onPress: () => fetchSensors() }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sensors}
        keyExtractor={(item) => item.id}
        renderItem={renderSensorCard}
        contentContainerStyle={[
          styles.listContent,
          sensors.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchSensors(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Radio size={48} color={theme.colors.textMuted} />}
            title="No sensors"
            message="This device has no sensors attached."
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
  cardName: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  detailLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  detailValue: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
    fontWeight: '600',
  },
  additionalInfo: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.md,
  },
});
