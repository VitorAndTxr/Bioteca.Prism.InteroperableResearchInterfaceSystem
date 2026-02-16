/**
 * Topography Select Screen
 *
 * Full navigation screen for selecting topographical modifiers.
 * Replaces the inline dropdown that was embedded in SessionConfigScreen.
 *
 * Features:
 * - Category dropdown filter
 * - Search bar for filtering by display name (client-side)
 * - Already-selected modifiers hidden from list
 * - Confirmation modal on selection (Alert.alert)
 * - Single-selection enforcement for Lateralidade category
 *
 * Implements US-TM-007, US-TM-008, US-TM-009, US-TM-010, US-TM-011.
 */

import React, { FC, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { HomeStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Select, Input } from '@/components/ui';
import { snomedService } from '@/services/SnomedService';
import type { SnomedTopographicalModifier } from '@iris/domain';
import { Search } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'TopographySelect'>;

const LATERALIDADE_CATEGORY = 'Lateralidade';

export const TopographySelectScreen: FC<Props> = ({ navigation, route }) => {
  const [topographies, setTopographies] = useState<SnomedTopographicalModifier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load topographies on every screen focus (handles native-stack reuse)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      setSelectedCategory('');
      setSearchQuery('');

      const loadData = async () => {
        try {
          setIsLoading(true);
          const modifiers = await snomedService.getTopographicalModifiers();
          if (!cancelled) {
            setTopographies(modifiers);
          }
        } catch (error) {
          console.error('[TopographySelectScreen] Failed to load topographies:', error);
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      };

      loadData();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  // Derive categories from the full topography list (preserving insertion order)
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of topographies) {
      if (!seen.has(t.category)) {
        seen.add(t.category);
        result.push(t.category);
      }
    }
    return result;
  }, [topographies]);

  // Check if a Lateralidade modifier is already selected
  const hasLateralidade = route.params.selectedModifiers.some(
    (m) => m.category === LATERALIDADE_CATEGORY
  );

  // Three-stage filter: hide selected -> category -> search
  const filteredTopographies = useMemo(() => {
    const selectedCodes = new Set(
      route.params.selectedModifiers.map((m) => m.snomedCode)
    );

    let filtered = topographies.filter((t) => !selectedCodes.has(t.snomedCode));

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.displayName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [topographies, route.params.selectedModifiers, selectedCategory, searchQuery]);

  const handleModifierPress = (modifier: SnomedTopographicalModifier) => {
    // Lateralidade single-selection enforcement
    if (modifier.category === LATERALIDADE_CATEGORY && hasLateralidade) {
      Alert.alert(
        'Laterality Limit',
        'Only one laterality modifier is allowed. Remove the existing one first.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirmation modal
    Alert.alert(
      'Add Modifier',
      `Add ${modifier.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            const updatedList = [
              ...route.params.selectedModifiers,
              {
                snomedCode: modifier.snomedCode,
                displayName: modifier.displayName,
                category: modifier.category,
              },
            ];
            navigation.navigate('SessionConfig', {
              updatedTopographies: updatedList,
            });
          },
        },
      ]
    );
  };

  // Determine empty state message
  const getEmptyMessage = (): string => {
    if (!selectedCategory) {
      return 'Select a category to view modifiers.';
    }
    if (searchQuery.trim()) {
      return 'No modifiers match your search.';
    }
    return 'All modifiers in this category are already selected.';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading topographies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Category dropdown */}
        <View style={styles.filterSection}>
          <Select
            label="Category"
            placeholder="Select a category..."
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(String(value))}
            options={categories.map((cat) => ({
              label: cat,
              value: cat,
            }))}
          />
        </View>

        {/* Search bar */}
        <View style={styles.filterSection}>
          <Input
            label="Search"
            placeholder="Search modifiers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={20} color={theme.colors.textMuted} />}
          />
        </View>

        {/* Modifier list */}
        {!selectedCategory ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTopographies}
            keyExtractor={(item) => item.snomedCode}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modifierItem}
                onPress={() => handleModifierPress(item)}
              >
                <Text style={styles.modifierName}>{item.displayName}</Text>
                <Text style={styles.modifierCategory}>{item.category}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
              </View>
            }
          />
        )}
      </View>
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
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  filterSection: {
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing['2xl'],
  },
  modifierItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.surface,
  },
  modifierName: {
    ...theme.typography.bodyBase,
    color: theme.colors.textTitle,
    fontWeight: '600',
  },
  modifierCategory: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  emptyText: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
