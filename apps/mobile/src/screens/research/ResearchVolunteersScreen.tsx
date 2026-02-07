/**
 * Research Volunteers Screen
 *
 * List enrolled volunteers, manage enrollment status, withdraw.
 *
 * Features (US-RC-026):
 * - FlatList of volunteer cards with name, email, enrollment status badge, consent date
 * - Status badge colors per enrollment status
 * - "Enroll Volunteer" button navigates to EnrollVolunteerForm modal
 * - Long-press to withdraw with confirmation
 * - Tap card to update enrollment status via action sheet
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
import { ResearchVolunteer, EnrollmentStatus } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/theme';
import { Heart, UserPlus, AlertCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResearchVolunteers'>;

const ENROLLMENT_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  [EnrollmentStatus.ENROLLED]: { bg: '#D1FAE5', text: '#065F46' },
  [EnrollmentStatus.ACTIVE]: { bg: '#DBEAFE', text: '#1E40AF' },
  [EnrollmentStatus.COMPLETED]: { bg: '#E0E7FF', text: '#3730A3' },
  [EnrollmentStatus.WITHDRAWN]: { bg: '#F3F4F6', text: '#6B7280' },
  [EnrollmentStatus.EXCLUDED]: { bg: '#FEE2E2', text: '#991B1B' },
};

export const ResearchVolunteersScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId } = route.params;
  const [volunteers, setVolunteers] = useState<ResearchVolunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVolunteers = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);
        const data = await researchService.getVolunteers(researchId);
        setVolunteers(data);
      } catch (err) {
        console.error('[ResearchVolunteersScreen] Fetch error:', err);
        setError('Failed to load volunteers.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [researchId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchVolunteers();
    }, [researchId]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('EnrollVolunteerForm', { researchId })}
          style={styles.headerButton}
        >
          <UserPlus size={20} color={theme.colors.surface} />
        </Pressable>
      ),
    });
  }, [navigation, researchId]);

  const handleWithdrawVolunteer = (item: ResearchVolunteer) => {
    const name = item.volunteer?.name ?? item.volunteerId;
    Alert.alert('Withdraw Volunteer', `Are you sure you want to withdraw ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            await researchService.withdrawVolunteer(researchId, item.volunteerId);
            fetchVolunteers();
          } catch (err) {
            console.error('[ResearchVolunteersScreen] Withdraw error:', err);
            Alert.alert('Error', 'Failed to withdraw volunteer.');
          }
        },
      },
    ]);
  };

  const handleUpdateStatus = (item: ResearchVolunteer) => {
    const statuses = [
      EnrollmentStatus.ENROLLED,
      EnrollmentStatus.ACTIVE,
      EnrollmentStatus.COMPLETED,
      EnrollmentStatus.EXCLUDED,
    ].filter((s) => s !== item.enrollmentStatus);

    Alert.alert(
      'Update Enrollment Status',
      `Current: ${item.enrollmentStatus}`,
      [
        ...statuses.map((status) => ({
          text: status,
          onPress: async () => {
            try {
              await researchService.updateVolunteer(researchId, item.volunteerId, {
                enrollmentStatus: status,
              });
              fetchVolunteers();
            } catch (err) {
              console.error('[ResearchVolunteersScreen] Update error:', err);
              Alert.alert('Error', 'Failed to update enrollment status.');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderVolunteerCard = ({ item }: { item: ResearchVolunteer }) => {
    const volunteer = item.volunteer;
    const badgeColors =
      ENROLLMENT_BADGE_COLORS[item.enrollmentStatus] ?? ENROLLMENT_BADGE_COLORS[EnrollmentStatus.ENROLLED];

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleUpdateStatus(item)}
        onLongPress={() => handleWithdrawVolunteer(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{volunteer?.name ?? 'Unknown'}</Text>
            {volunteer?.email && <Text style={styles.cardEmail}>{volunteer.email}</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badgeColors.text }]}>
              {item.enrollmentStatus}
            </Text>
          </View>
        </View>

        {item.consentDate && (
          <Text style={styles.cardDetail}>Consent: {item.consentDate} (v{item.consentVersion})</Text>
        )}
        <Text style={styles.cardHint}>Tap to change status | Long-press to withdraw</Text>
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
          action={{ label: 'Retry', onPress: () => fetchVolunteers() }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={volunteers}
        keyExtractor={(item) => item.volunteerId}
        renderItem={renderVolunteerCard}
        contentContainerStyle={[
          styles.listContent,
          volunteers.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchVolunteers(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Heart size={48} color={theme.colors.textMuted} />}
            title="No volunteers enrolled"
            message="Tap the + button in the header to enroll a volunteer."
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
  cardEmail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeText: {
    ...theme.typography.uiSmall,
    fontWeight: '600',
  },
  cardDetail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textBody,
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
