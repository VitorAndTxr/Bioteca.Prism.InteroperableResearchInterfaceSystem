/**
 * Annotations List Screen
 *
 * Displays all annotations recorded during a session.
 * Allows reviewing annotations and creating new ones.
 */

import React, { FC, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Pressable,
  ListRenderItemInfo,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { AnnotationRepository } from '@/data/repositories/AnnotationRepository';
import type { Annotation } from '@iris/domain';
import { ChevronLeft, Plus, MoreVertical } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'AnnotationsList'>;

const annotationRepository = new AnnotationRepository();

export const AnnotationsListScreen: FC<Props> = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnnotations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await annotationRepository.getBySession(sessionId);
      setAnnotations(data);
    } catch (error) {
      console.error('Failed to load annotations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useFocusEffect(
    useCallback(() => {
      loadAnnotations();
    }, [loadAnnotations])
  );

  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    if (isToday) {
      return `Today, ${timeString}`;
    }

    const monthDay = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${monthDay}, ${timeString}`;
  };

  const handleNewAnnotation = () => {
    navigation.navigate('NewAnnotation', { sessionId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderAnnotationItem = ({ item }: ListRenderItemInfo<Annotation>) => (
    <Card style={styles.annotationCard}>
      <View style={styles.annotationHeader}>
        <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
        <MoreVertical size={16} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.annotationText}>{item.text}</Text>
    </Card>
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No annotations yet"
      message="Add your first annotation to capture observations during this session"
      action={{
        label: 'Add annotation',
        onPress: handleNewAnnotation,
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.textBody} />
        </Pressable>
        <Text style={styles.headerTitle}>Annotations</Text>
        <Pressable onPress={handleNewAnnotation} style={styles.addButton}>
          <Plus size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      {/* Annotations List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading annotations...</Text>
        </View>
      ) : (
        <FlatList
          data={annotations}
          renderItem={renderAnnotationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            annotations.length === 0 ? styles.emptyListContent : styles.listContent
          }
          ListEmptyComponent={renderEmptyState}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },

  headerTitle: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
  },

  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
  },

  listContent: {
    padding: theme.spacing.lg,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
  },

  annotationCard: {
    marginBottom: theme.spacing.md,
  },

  annotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  timestamp: {
    ...theme.typography.bodyExtraSmall,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },

  annotationText: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
    lineHeight: 22,
  },
});
