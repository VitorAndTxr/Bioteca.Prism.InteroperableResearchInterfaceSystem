/**
 * Session Configuration Screen
 *
 * Allows researchers to configure a new clinical session.
 * Entry point for the Home tab stack.
 *
 * Features (US-004, US-005, US-006, US-007):
 * - Volunteer search with debounced input
 * - Body structure selection (SNOMED CT)
 * - Laterality selection (left/right/bilateral)
 * - Topography multi-select with tag chips
 * - Device selection from paired Bluetooth devices
 * - Form validation before session start
 */

import React, { FC, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { HomeStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Button, Input, Select, Card } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { volunteerService } from '@/services/VolunteerService';
import { snomedService } from '@/services/SnomedService';
import { researchService } from '@/services/ResearchService';
import type { Research, SessionFavorite } from '@iris/domain';
import { useBluetoothContext } from '@/context/BluetoothContext';
import { useSession } from '@/context/SessionContext';
import { useAuth } from '@/context/AuthContext';
import { Volunteer, SnomedBodyStructure, SnomedTopographicalModifier } from '@iris/domain';
import { Search, Plus, ClipboardList, ChevronRight, Star, Settings } from 'lucide-react-native';
import { favoriteRepository } from '@/data/repositories/FavoriteRepository';
import { NamePromptModal } from '@/components/NamePromptModal';

type Props = NativeStackScreenProps<HomeStackParamList, 'SessionConfig'>;

export const SessionConfigScreen: FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { neuraDevices } = useBluetoothContext();
  const { startSession } = useSession();

  // Volunteer state
  const [volunteerSearchQuery, setVolunteerSearchQuery] = useState('');
  const [volunteerSearchResults, setVolunteerSearchResults] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showVolunteerDropdown, setShowVolunteerDropdown] = useState(false);

  // Clinical data state
  const [bodyStructures, setBodyStructures] = useState<SnomedBodyStructure[]>([]);
  const [selectedBodyStructure, setSelectedBodyStructure] = useState<string>('');
  const [selectedTopographies, setSelectedTopographies] = useState<SnomedTopographicalModifier[]>([]);

  // Research state
  const [researchProjects, setResearchProjects] = useState<Research[]>([]);
  const [selectedResearchId, setSelectedResearchId] = useState<string>('');
  const [selectedResearchTitle, setSelectedResearchTitle] = useState<string>('');

  // Device state
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Favorites state
  const [favorites, setFavorites] = useState<SessionFavorite[]>([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [savePromptDefault, setSavePromptDefault] = useState('');

  // Loading states
  const [isLoadingSnomedData, setIsLoadingSnomedData] = useState(true);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Debounce volunteer search
  const debouncedSearchQuery = useDebounce(volunteerSearchQuery, 500);

  // Load favorites on every screen focus (refreshes after save/delete/rename)
  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const data = await favoriteRepository.getAll();
          setFavorites(data);
        } catch (error) {
          console.warn('[SessionConfigScreen] Failed to load favorites:', error);
        }
      };
      loadFavorites();
    }, [])
  );

  // Load SNOMED data and research projects on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingSnomedData(true);
        const [structures] = await Promise.all([
          snomedService.getBodyStructures(),
          snomedService.getTopographicalModifiers(), // warm cache for TopographySelectScreen
        ]);
        setBodyStructures(structures);
      } catch (error) {
        console.error('[SessionConfigScreen] Failed to load SNOMED data:', error);
      } finally {
        setIsLoadingSnomedData(false);
      }

      // Load research projects (non-blocking -- failure is silent)
      try {
        const response = await researchService.getActive();
        setResearchProjects(response.data ?? []);
      } catch (error) {
        console.warn('[SessionConfigScreen] Failed to load research projects:', error);
      }
    };

    loadInitialData();
  }, []);

  // Search volunteers when debounced query changes
  useEffect(() => {
    const searchVolunteers = async () => {
      if (!debouncedSearchQuery.trim()) {
        setVolunteerSearchResults([]);
        setShowVolunteerDropdown(false);
        return;
      }

      try {
        setIsSearching(true);
        const result = await volunteerService.search(debouncedSearchQuery);
        setVolunteerSearchResults(result.items);
        setShowVolunteerDropdown(result.items.length > 0);
      } catch (error) {
        console.error('[SessionConfigScreen] Volunteer search failed:', error);
        setVolunteerSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchVolunteers();
  }, [debouncedSearchQuery]);

  // Consume updatedTopographies from TopographySelectScreen return navigation
  useEffect(() => {
    const updated = route.params?.updatedTopographies;
    if (!updated) return;

    setSelectedTopographies(
      updated.map((m) => ({
        snomedCode: m.snomedCode,
        displayName: m.displayName,
        category: m.category,
        description: '',
      }))
    );

    // Clear param to prevent re-applying on subsequent focus events
    navigation.setParams({ updatedTopographies: undefined });
  }, [route.params?.updatedTopographies, navigation]);

  // Handle volunteer selection
  const handleSelectVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setVolunteerSearchQuery('');
    setShowVolunteerDropdown(false);
  };

  // Handle research selection
  const handleResearchChange = (value: string | number) => {
    const id = String(value);
    setSelectedResearchId(id);
    const project = researchProjects.find((r) => r.id === id);
    setSelectedResearchTitle(project?.title ?? '');
  };

  // Handle topography removal with confirmation
  const handleRemoveTopography = (modifier: SnomedTopographicalModifier) => {
    Alert.alert(
      'Remove Modifier',
      `Remove ${modifier.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedTopographies(
              selectedTopographies.filter((t) => t.snomedCode !== modifier.snomedCode)
            );
          },
        },
      ]
    );
  };

  // Apply a saved favorite to the form
  const applyFavorite = (favorite: SessionFavorite) => {
    // Body structure
    setSelectedBodyStructure(favorite.bodyStructureSnomedCode);

    // Topographies -- reconstruct from parallel arrays including category (M1 fix)
    const topographies: SnomedTopographicalModifier[] = favorite.topographyCodes.map(
      (code, index) => ({
        snomedCode: code,
        displayName: favorite.topographyNames[index] ?? code,
        category: favorite.topographyCategories[index] ?? '',
        description: '',
      })
    );
    setSelectedTopographies(topographies);

    // Research linkage with stale-data validation (US-SF-017)
    if (favorite.researchId) {
      const projectExists = researchProjects.find(r => r.id === favorite.researchId);
      if (projectExists) {
        setSelectedResearchId(favorite.researchId);
        setSelectedResearchTitle(favorite.researchTitle ?? '');
      } else {
        setSelectedResearchId('');
        setSelectedResearchTitle('');
        Alert.alert(
          'Research Unavailable',
          `Research project "${favorite.researchTitle}" is no longer available. ` +
          'Favorite applied without research linkage.'
        );
      }
    } else {
      setSelectedResearchId('');
      setSelectedResearchTitle('');
    }

    // Device with stale-device validation
    if (favorite.deviceId) {
      const deviceExists = neuraDevices.find(d => d.address === favorite.deviceId);
      if (deviceExists) {
        setSelectedDeviceId(favorite.deviceId);
      } else {
        setSelectedDeviceId('');
        Alert.alert(
          'Device Unavailable',
          'The saved device is no longer paired. Please select a device manually.'
        );
      }
    } else {
      setSelectedDeviceId('');
    }

    // Body structure stale-data warning (US-SF-018)
    const structureExists = bodyStructures.find(
      bs => bs.snomedCode === favorite.bodyStructureSnomedCode
    );
    if (!structureExists) {
      Alert.alert(
        'Body Structure Notice',
        `Body structure "${favorite.bodyStructureName}" was not found in the current SNOMED set. ` +
        'The saved code has been applied.'
      );
    }
  };

  // Whether the current form state has enough data to save as a favorite
  const canSaveFavorite = (): boolean => {
    return !!(selectedBodyStructure && selectedTopographies.length > 0);
  };

  // Open save-as-favorite prompt
  const handleOpenSavePrompt = () => {
    const defaultName = bodyStructures.find(
      bs => bs.snomedCode === selectedBodyStructure
    )?.displayName ?? 'My Favorite';
    setSavePromptDefault(defaultName);
    setShowSavePrompt(true);
  };

  // Persist a new favorite
  const handleSaveFavorite = async (name: string) => {
    setShowSavePrompt(false);
    try {
      await favoriteRepository.create({
        name,
        bodyStructureSnomedCode: selectedBodyStructure,
        bodyStructureName: bodyStructures.find(
          bs => bs.snomedCode === selectedBodyStructure
        )?.displayName ?? '',
        topographyCodes: selectedTopographies.map(t => t.snomedCode),
        topographyNames: selectedTopographies.map(t => t.displayName),
        topographyCategories: selectedTopographies.map(t => t.category),
        deviceId: selectedDeviceId || undefined,
        laterality: null,
        researchId: selectedResearchId || undefined,
        researchTitle: selectedResearchTitle || undefined,
      });

      const updated = await favoriteRepository.getAll();
      setFavorites(updated);
    } catch (error) {
      console.error('[SessionConfigScreen] Failed to save favorite:', error);
    }
  };

  // Validation
  const isFormValid = (): boolean => {
    return !!(
      selectedVolunteer &&
      selectedBodyStructure &&
      selectedTopographies.length > 0 &&
      selectedDeviceId
    );
  };

  // Start session handler
  const handleStartSession = async () => {
    if (!isFormValid() || !selectedVolunteer || !user) {
      return;
    }

    try {
      setIsStartingSession(true);

      const bodyStructure = bodyStructures.find((bs) => bs.snomedCode === selectedBodyStructure);
      if (!bodyStructure) {
        throw new Error('Selected body structure not found');
      }

      const session = await startSession({
        volunteerId: selectedVolunteer.id,
        volunteerName: selectedVolunteer.name,
        researcherId: user.id,
        deviceId: selectedDeviceId,
        researchId: selectedResearchId || undefined,
        researchTitle: selectedResearchTitle || undefined,
        clinicalData: {
          bodyStructureSnomedCode: bodyStructure.snomedCode,
          bodyStructureName: bodyStructure.displayName,
          laterality: null,
          topographyCodes: selectedTopographies.map((t) => t.snomedCode),
          topographyNames: selectedTopographies.map((t) => t.displayName),
        },
      });

      console.log('[SessionConfigScreen] Session started:', session.id);
      navigation.navigate('ActiveSession', { sessionId: session.id });
    } catch (error) {
      console.error('[SessionConfigScreen] Failed to start session:', error);
    } finally {
      setIsStartingSession(false);
    }
  };

  if (isLoadingSnomedData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading configuration data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Research Projects Entry Point */}
        <Pressable
          style={({ pressed }) => [styles.researchCard, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.navigate('ResearchList')}
        >
          <ClipboardList size={20} color={theme.colors.primary} />
          <Text style={styles.researchCardTitle}>Research Projects</Text>
          <ChevronRight size={16} color={theme.colors.textMuted} />
        </Pressable>

        {/* Research Project Selector (optional linkage) */}
        {researchProjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link to Research (Optional)</Text>
            <Select
              label="Research Project"
              placeholder="No research linked"
              value={selectedResearchId}
              onValueChange={handleResearchChange}
              options={researchProjects.map((r) => ({
                label: r.title,
                value: r.id,
              }))}
            />
          </View>
        )}

        {/* Favorites Chip Strip */}
        {favorites.length > 0 && (
          <View style={styles.favoritesSection}>
            <View style={styles.favoritesSectionHeader}>
              <Star size={16} color={theme.colors.primary} />
              <Text style={styles.favoritesSectionTitle}>Favorites</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesStripContent}
            >
              {favorites.map(fav => (
                <TouchableOpacity
                  key={fav.id}
                  style={styles.favoriteChip}
                  onPress={() => applyFavorite(fav)}
                >
                  <Star size={12} color={theme.colors.primary} />
                  <Text style={styles.favoriteChipText} numberOfLines={1}>
                    {fav.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.favoriteManageChip}
                onPress={() => navigation.navigate('FavoritesManage')}
              >
                <Settings size={12} color={theme.colors.textMuted} />
                <Text style={styles.favoriteManageText}>Manage</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Volunteer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volunteer</Text>

          <View style={styles.volunteerSearchContainer}>
            <Input
              label="Search Volunteer"
              placeholder="Type name or email..."
              value={volunteerSearchQuery}
              onChangeText={setVolunteerSearchQuery}
              leftIcon={
                isSearching ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Search size={20} color={theme.colors.textMuted} />
                )
              }
            />

            {showVolunteerDropdown && (
              <Card variant="outlined" style={styles.dropdownCard}>
                <FlatList
                  data={volunteerSearchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectVolunteer(item)}
                    >
                      <Text style={styles.dropdownItemName}>{item.name}</Text>
                      <Text style={styles.dropdownItemEmail}>{item.email}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.dropdownList}
                />
              </Card>
            )}

            {selectedVolunteer && (
              <Card variant="outlined" style={styles.selectedVolunteerCard}>
                <Text style={styles.selectedVolunteerName}>{selectedVolunteer.name}</Text>
                <Text style={styles.selectedVolunteerEmail}>{selectedVolunteer.email}</Text>
              </Card>
            )}
          </View>
        </View>

        {/* Clinical Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Data</Text>

          <Select
            label="Body Structure (SNOMED CT)"
            placeholder="Select body structure..."
            value={selectedBodyStructure}
            onValueChange={(value) => setSelectedBodyStructure(String(value))}
            options={bodyStructures.map((bs) => ({
              label: bs.displayName,
              value: bs.snomedCode,
            }))}
          />

          <View style={styles.topographyContainer}>
            <Text style={styles.inputLabel}>Topography</Text>
            <View style={styles.topographyChips}>
              {selectedTopographies.map((topography) => (
                <View key={topography.snomedCode} style={styles.chip}>
                  <Text style={styles.chipText}>{topography.displayName}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTopography(topography)}>
                    <Text style={styles.chipRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.chipAdd}
                onPress={() =>
                  navigation.navigate('TopographySelect', {
                    selectedModifiers: selectedTopographies.map((t) => ({
                      snomedCode: t.snomedCode,
                      displayName: t.displayName,
                      category: t.category,
                    })),
                  })
                }
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Plus size={14} color={theme.colors.textMuted} />
                  <Text style={styles.chipAddText}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Hardware Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hardware</Text>

          <Select
            label="Capture Device"
            placeholder="Select device..."
            value={selectedDeviceId}
            onValueChange={(value) => setSelectedDeviceId(String(value))}
            options={neuraDevices.map((device) => ({
              label: `${device.name} ${device.active ? '(Connected)' : ''}`,
              value: device.address,
            }))}
          />

          {selectedDeviceId && (
            <View style={styles.deviceStatus}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: neuraDevices.find((d) => d.address === selectedDeviceId)?.active
                      ? theme.colors.success
                      : theme.colors.warning,
                  },
                ]}
              />
              <Text style={styles.deviceStatusText}>
                {neuraDevices.find((d) => d.address === selectedDeviceId)?.active
                  ? 'Connected'
                  : 'Not Connected'}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer - Save as Favorite + Start Session */}
      <View style={styles.footer}>
        <Button
          title="Save as Favorite"
          variant="secondary"
          size="md"
          fullWidth
          disabled={!canSaveFavorite()}
          onPress={handleOpenSavePrompt}
          leftIcon={<Star size={16} color={canSaveFavorite() ? theme.colors.primary : theme.colors.textMuted} />}
        />
        <View style={{ height: theme.spacing.sm }} />
        <Button
          title="Start Session"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid() || isStartingSession}
          loading={isStartingSession}
          onPress={handleStartSession}
        />
      </View>

      {/* Save Favorite Name Prompt */}
      <NamePromptModal
        visible={showSavePrompt}
        title="Save as Favorite"
        placeholder="Enter a name for this favorite..."
        defaultValue={savePromptDefault}
        onConfirm={handleSaveFavorite}
        onCancel={() => setShowSavePrompt(false)}
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
    paddingBottom: theme.spacing['2xl'],
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.md,
  },
  volunteerSearchContainer: {
    position: 'relative',
  },
  dropdownCard: {
    marginTop: theme.spacing.sm,
    maxHeight: 200,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  dropdownItemName: {
    ...theme.typography.bodyBase,
    color: theme.colors.textTitle,
    fontWeight: '600',
  },
  dropdownItemEmail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  selectedVolunteerCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  selectedVolunteerName: {
    ...theme.typography.bodyBase,
    color: theme.colors.textTitle,
    fontWeight: '600',
  },
  selectedVolunteerEmail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  topographyContainer: {
    marginTop: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.uiSmall,
    color: theme.colors.textBody,
    marginBottom: theme.spacing.xs,
  },
  topographyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  chipText: {
    ...theme.typography.uiSmall,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  chipRemove: {
    ...theme.typography.bodyBase,
    color: theme.colors.primaryDark,
    fontSize: 18,
    fontWeight: '600',
  },
  chipAdd: {
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  chipAddText: {
    ...theme.typography.uiSmall,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  deviceStatusText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textBody,
  },
  researchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadow.sm,
  },
  researchCardTitle: {
    ...theme.typography.bodyBase,
    color: theme.colors.textTitle,
    fontWeight: '600',
    flex: 1,
  },
  // Favorites strip
  favoritesSection: {
    marginBottom: theme.spacing.xl,
  },
  favoritesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  favoritesSectionTitle: {
    ...theme.typography.uiSmall,
    color: theme.colors.textBody,
    fontWeight: '600',
  },
  favoritesStripContent: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  favoriteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
    maxWidth: 160,
  },
  favoriteChipText: {
    ...theme.typography.uiSmall,
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  favoriteManageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.textMuted,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  favoriteManageText: {
    ...theme.typography.uiSmall,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: theme.spacing['2xl'],
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
});
