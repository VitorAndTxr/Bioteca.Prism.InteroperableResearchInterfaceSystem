/**
 * Research Detail Screen
 *
 * Overview of a single research project with sub-entity navigation sections.
 * Uses researchService.getById() and useFocusEffect for data refresh.
 *
 * Features (US-RC-023):
 * - Header card with title, status badge, description, dates
 * - Sub-entity summary cards (Researchers, Volunteers, Applications, Devices)
 * - Tappable cards navigate to sub-entity screens
 * - useFocusEffect re-fetches on return from sub-entity screens
 */

import React, { FC, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { ResearchDetail, ResearchStatus } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/theme';
import {
  Users,
  Heart,
  AppWindow,
  Cpu,
  ChevronRight,
  CalendarDays,
  AlertCircle,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResearchDetail'>;

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  [ResearchStatus.ACTIVE]: { bg: '#D1FAE5', text: '#065F46' },
  [ResearchStatus.PLANNING]: { bg: '#DBEAFE', text: '#1E40AF' },
  [ResearchStatus.COMPLETED]: { bg: '#E0E7FF', text: '#3730A3' },
  [ResearchStatus.SUSPENDED]: { bg: '#FEF3C7', text: '#92400E' },
  [ResearchStatus.CANCELLED]: { bg: '#F3F4F6', text: '#6B7280' },
};

export const ResearchDetailScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId } = route.params;
  const [research, setResearch] = useState<ResearchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setIsRefreshing(true);
        } else if (!research) {
          setIsLoading(true);
        }
        setError(null);
        const detail = await researchService.getById(researchId);
        setResearch(detail);
      } catch (err) {
        console.error('[ResearchDetailScreen] Fetch error:', err);
        setError('Failed to load research details.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [researchId, research]
  );

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [researchId]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading research details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !research) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon={<AlertCircle size={48} color={theme.colors.error} />}
          title="Error"
          message={error ?? 'Research not found.'}
          action={{ label: 'Go Back', onPress: () => navigation.goBack() }}
        />
      </SafeAreaView>
    );
  }

  const statusColors =
    STATUS_BADGE_COLORS[research.status] ?? STATUS_BADGE_COLORS[ResearchStatus.CANCELLED];

  const subEntitySections = [
    {
      key: 'researchers',
      label: 'Researchers',
      count: research.researcherCount,
      icon: <Users size={20} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('ResearchResearchers', { researchId }),
    },
    {
      key: 'volunteers',
      label: 'Volunteers',
      count: research.volunteerCount,
      icon: <Heart size={20} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('ResearchVolunteers', { researchId }),
    },
    {
      key: 'applications',
      label: 'Applications',
      count: research.applicationCount,
      icon: <AppWindow size={20} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('ResearchApplications', { researchId }),
    },
    {
      key: 'devices',
      label: 'Devices',
      count: research.deviceCount,
      icon: <Cpu size={20} color={theme.colors.primary} />,
      onPress: () => navigation.navigate('ResearchDevices', { researchId }),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchDetail(true)}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{research.title}</Text>
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.badgeText, { color: statusColors.text }]}>
                {research.status.charAt(0).toUpperCase() + research.status.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{research.description}</Text>

          {/* Dates */}
          <View style={styles.datesRow}>
            {research.startDate && (
              <View style={styles.dateItem}>
                <CalendarDays size={14} color={theme.colors.textMuted} />
                <Text style={styles.dateLabel}>Start:</Text>
                <Text style={styles.dateValue}>{research.startDate}</Text>
              </View>
            )}
            {research.endDate && (
              <View style={styles.dateItem}>
                <CalendarDays size={14} color={theme.colors.textMuted} />
                <Text style={styles.dateLabel}>End:</Text>
                <Text style={styles.dateValue}>{String(research.endDate)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Sub-Entity Sections */}
        <Text style={styles.sectionTitle}>Management</Text>

        {subEntitySections.map((section) => (
          <Pressable
            key={section.key}
            style={({ pressed }) => [styles.sectionCard, pressed && styles.sectionCardPressed]}
            onPress={section.onPress}
          >
            <View style={styles.sectionCardLeft}>
              {section.icon}
              <Text style={styles.sectionCardLabel}>{section.label}</Text>
            </View>
            <View style={styles.sectionCardRight}>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{section.count}</Text>
              </View>
              <ChevronRight size={16} color={theme.colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
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
  loadingText: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
    ...theme.shadow.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
    flex: 1,
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
  description: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
    marginBottom: theme.spacing.md,
  },
  datesRow: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  dateValue: {
    ...theme.typography.bodySmall,
    color: theme.colors.textBody,
    fontWeight: '600',
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.md,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  sectionCardPressed: {
    opacity: 0.7,
  },
  sectionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  sectionCardLabel: {
    ...theme.typography.bodyBase,
    color: theme.colors.textTitle,
    fontWeight: '600',
  },
  sectionCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  countBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    minWidth: 28,
    alignItems: 'center',
  },
  countBadgeText: {
    ...theme.typography.uiSmall,
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
});
