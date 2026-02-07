/**
 * Research List Screen
 *
 * Browse research projects with status filtering.
 * Uses researchService.getAll() and getByStatus() through middleware channel.
 *
 * Features (US-RC-022):
 * - Status filter chips (All, Active, Planning, Completed, Suspended)
 * - Research cards with title, status badge, description preview
 * - Pull-to-refresh
 * - Navigate to ResearchDetail on tap
 */

import React, { FC, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { Research, ResearchStatus } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/theme';
import { ClipboardList } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResearchList'>;

type StatusFilter = 'all' | ResearchStatus;

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: ResearchStatus.ACTIVE },
  { label: 'Planning', value: ResearchStatus.PLANNING },
  { label: 'Completed', value: ResearchStatus.COMPLETED },
  { label: 'Suspended', value: ResearchStatus.SUSPENDED },
];

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  [ResearchStatus.ACTIVE]: { bg: '#D1FAE5', text: '#065F46' },
  [ResearchStatus.PLANNING]: { bg: '#DBEAFE', text: '#1E40AF' },
  [ResearchStatus.COMPLETED]: { bg: '#E0E7FF', text: '#3730A3' },
  [ResearchStatus.SUSPENDED]: { bg: '#FEF3C7', text: '#92400E' },
  [ResearchStatus.CANCELLED]: { bg: '#F3F4F6', text: '#6B7280' },
};

export const ResearchListScreen: FC<Props> = ({ navigation }) => {
  const [researches, setResearches] = useState<Research[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearch = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const result =
          statusFilter === 'all'
            ? await researchService.getAll()
            : await researchService.getByStatus(statusFilter);

        setResearches(result.data ?? []);
      } catch (err) {
        console.error('[ResearchListScreen] Fetch error:', err);
        setError('Failed to load research projects.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  const handleRefresh = useCallback(() => {
    fetchResearch(true);
  }, [fetchResearch]);

  const renderStatusBadge = (status: ResearchStatus) => {
    const colors = STATUS_BADGE_COLORS[status] ?? STATUS_BADGE_COLORS[ResearchStatus.CANCELLED];
    return (
      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.badgeText, { color: colors.text }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const renderResearchCard = ({ item }: { item: Research }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => navigation.navigate('ResearchDetail', { researchId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {renderStatusBadge(item.status)}
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: filter }) => (
            <Pressable
              style={[
                styles.filterChip,
                statusFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading research projects...</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon={<ClipboardList size={48} color={theme.colors.error} />}
          title="Error"
          message={error}
          action={{ label: 'Retry', onPress: () => fetchResearch() }}
        />
      ) : (
        <FlatList
          data={researches}
          keyExtractor={(item) => item.id}
          renderItem={renderResearchCard}
          contentContainerStyle={[
            styles.listContent,
            researches.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<ClipboardList size={48} color={theme.colors.textMuted} />}
              title="No research projects"
              message="No research projects match the current filter."
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  filterList: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    ...theme.typography.uiSmall,
    color: theme.colors.textBody,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  cardTitle: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    flex: 1,
  },
  cardDescription: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    ...theme.typography.uiSmall,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
