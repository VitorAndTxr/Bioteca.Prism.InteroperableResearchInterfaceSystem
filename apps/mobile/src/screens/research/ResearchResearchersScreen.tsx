/**
 * Research Researchers Screen
 *
 * List, add, remove researchers assigned to a research project.
 * Includes principal investigator designation.
 *
 * Features (US-RC-025):
 * - FlatList of researcher cards with name, email, institution, ORCID, PI badge
 * - "Add Researcher" header button
 * - Long-press to remove with confirmation dialog
 * - Tap card to toggle isPrincipal
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
import { ResearchResearcher } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/theme';
import { Users, Shield, UserPlus, AlertCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResearchResearchers'>;

export const ResearchResearchersScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId } = route.params;
  const [researchers, setResearchers] = useState<ResearchResearcher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResearchers = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);
        const data = await researchService.getResearchers(researchId);
        setResearchers(data);
      } catch (err) {
        console.error('[ResearchResearchersScreen] Fetch error:', err);
        setError('Failed to load researchers.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [researchId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchResearchers();
    }, [researchId]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleAddResearcher} style={styles.headerButton}>
          <UserPlus size={20} color={theme.colors.surface} />
        </Pressable>
      ),
    });
  }, [navigation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddResearcher = () => {
    Alert.prompt?.(
      'Add Researcher',
      'Enter researcher ID to assign:',
      async (researcherId: string) => {
        if (!researcherId?.trim()) return;
        try {
          await researchService.assignResearcher(researchId, {
            researcherId: researcherId.trim(),
            isPrincipal: false,
          });
          fetchResearchers();
        } catch (err) {
          console.error('[ResearchResearchersScreen] Assign error:', err);
          Alert.alert('Error', 'Failed to assign researcher.');
        }
      }
    ) ??
      Alert.alert('Add Researcher', 'Researcher assignment would open a search picker in the full implementation.');
  };

  const handleTogglePrincipal = async (item: ResearchResearcher) => {
    try {
      await researchService.updateResearcher(researchId, item.researcherId, {
        isPrincipal: !item.isPrincipal,
      });
      fetchResearchers();
    } catch (err) {
      console.error('[ResearchResearchersScreen] Toggle PI error:', err);
      Alert.alert('Error', 'Failed to update researcher.');
    }
  };

  const handleRemoveResearcher = (item: ResearchResearcher) => {
    const name = item.researcher?.name ?? item.researcherId;
    Alert.alert('Remove Researcher', `Are you sure you want to remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await researchService.removeResearcher(researchId, item.researcherId);
            fetchResearchers();
          } catch (err) {
            console.error('[ResearchResearchersScreen] Remove error:', err);
            Alert.alert('Error', 'Failed to remove researcher.');
          }
        },
      },
    ]);
  };

  const renderResearcherCard = ({ item }: { item: ResearchResearcher }) => {
    const researcher = item.researcher;
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleTogglePrincipal(item)}
        onLongPress={() => handleRemoveResearcher(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{researcher?.name ?? 'Unknown'}</Text>
            {researcher?.email && (
              <Text style={styles.cardEmail}>{researcher.email}</Text>
            )}
          </View>
          {item.isPrincipal && (
            <View style={styles.piBadge}>
              <Shield size={12} color="#92400E" />
              <Text style={styles.piBadgeText}>PI</Text>
            </View>
          )}
        </View>

        {researcher?.institution && (
          <Text style={styles.cardDetail}>{researcher.institution}</Text>
        )}
        {researcher?.orcid && (
          <Text style={styles.cardOrcid}>ORCID: {researcher.orcid}</Text>
        )}
        <Text style={styles.cardHint}>Tap to toggle PI | Long-press to remove</Text>
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
          action={{ label: 'Retry', onPress: () => fetchResearchers() }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={researchers}
        keyExtractor={(item) => item.researcherId}
        renderItem={renderResearcherCard}
        contentContainerStyle={[
          styles.listContent,
          researchers.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchResearchers(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<Users size={48} color={theme.colors.textMuted} />}
            title="No researchers assigned"
            message="Tap the + button in the header to assign a researcher."
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
  piBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  piBadgeText: {
    ...theme.typography.uiSmall,
    color: '#92400E',
    fontWeight: '700',
  },
  cardDetail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textBody,
    marginTop: theme.spacing.xs,
  },
  cardOrcid: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  cardHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    fontSize: 11,
  },
});
