/**
 * Research Applications Screen
 *
 * List, create, edit, delete applications for a research project.
 *
 * Features (US-RC-028):
 * - FlatList of application cards with name, URL, description
 * - "Add Application" FAB navigates to ApplicationForm modal
 * - Tap card navigates to ApplicationForm in edit mode
 * - Long-press to delete with confirmation
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
  Linking,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { Application } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { EmptyState } from '@/components/ui/EmptyState';
import { theme } from '@/theme';
import { AppWindow, Plus, AlertCircle, ExternalLink } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ResearchApplications'>;

export const ResearchApplicationsScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId } = route.params;
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);
        const data = await researchService.getApplications(researchId);
        setApplications(data);
      } catch (err) {
        console.error('[ResearchApplicationsScreen] Fetch error:', err);
        setError('Failed to load applications.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [researchId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchApplications();
    }, [researchId]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('ApplicationForm', { researchId })}
          style={styles.headerButton}
        >
          <Plus size={20} color={theme.colors.surface} />
        </Pressable>
      ),
    });
  }, [navigation, researchId]);

  const handleDeleteApplication = (item: Application) => {
    Alert.alert('Delete Application', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await researchService.deleteApplication(researchId, item.id);
            fetchApplications();
          } catch (err) {
            console.error('[ResearchApplicationsScreen] Delete error:', err);
            Alert.alert('Error', 'Failed to delete application.');
          }
        },
      },
    ]);
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Cannot open this URL.');
    });
  };

  const renderApplicationCard = ({ item }: { item: Application }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() =>
        navigation.navigate('ApplicationForm', { researchId, applicationId: item.id })
      }
      onLongPress={() => handleDeleteApplication(item)}
    >
      <Text style={styles.cardName}>{item.name}</Text>

      <Pressable
        style={styles.urlRow}
        onPress={() => handleOpenUrl(item.url)}
      >
        <ExternalLink size={12} color={theme.colors.primary} />
        <Text style={styles.cardUrl} numberOfLines={1}>{item.url}</Text>
      </Pressable>

      {item.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <Text style={styles.cardHint}>Tap to edit | Long-press to delete</Text>
    </Pressable>
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
          action={{ label: 'Retry', onPress: () => fetchApplications() }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderApplicationCard}
        contentContainerStyle={[
          styles.listContent,
          applications.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchApplications(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={<AppWindow size={48} color={theme.colors.textMuted} />}
            title="No applications"
            message="Tap the + button in the header to add an application."
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
  cardName: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.xs,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  cardUrl: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    flex: 1,
  },
  cardDescription: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
    marginBottom: theme.spacing.sm,
  },
  cardHint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    fontSize: 11,
  },
});
