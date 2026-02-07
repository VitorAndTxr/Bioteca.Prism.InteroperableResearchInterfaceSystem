/**
 * Enroll Volunteer Form Screen
 *
 * Modal form to enroll an existing volunteer in a research project.
 * Uses volunteer search with debounce, consent date/version inputs.
 *
 * Features (US-RC-027):
 * - Volunteer search input with debounced dropdown
 * - Consent date text input (ISO format)
 * - Consent version text input
 * - Validation: all fields required, consent date not in future
 * - On success: navigation.goBack()
 */

import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { Volunteer } from '@iris/domain';
import { researchService } from '@/services/ResearchService';
import { volunteerService } from '@/services/VolunteerService';
import { Button, Input, Card } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { theme } from '@/theme';
import { Search } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'EnrollVolunteerForm'>;

export const EnrollVolunteerFormScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId } = route.params;

  // Volunteer search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Volunteer[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Form state
  const [consentDate, setConsentDate] = useState('');
  const [consentVersion, setConsentVersion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      try {
        setIsSearching(true);
        const result = await volunteerService.search(debouncedQuery);
        setSearchResults(result.items);
        setShowDropdown(result.items.length > 0);
      } catch (err) {
        console.error('[EnrollVolunteerForm] Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    search();
  }, [debouncedQuery]);

  const handleSelectVolunteer = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setSearchQuery(volunteer.name);
    setShowDropdown(false);
  };

  const isFormValid =
    selectedVolunteer !== null && consentDate.trim().length > 0 && consentVersion.trim().length > 0;

  const handleEnroll = async () => {
    if (!isFormValid || !selectedVolunteer) return;

    // Validate consent date is not in the future
    const parsedDate = new Date(consentDate);
    if (isNaN(parsedDate.getTime())) {
      Alert.alert('Validation Error', 'Please enter a valid date (YYYY-MM-DD).');
      return;
    }
    if (parsedDate > new Date()) {
      Alert.alert('Validation Error', 'Consent date cannot be in the future.');
      return;
    }

    try {
      setIsSubmitting(true);
      await researchService.enrollVolunteer(researchId, {
        volunteerId: selectedVolunteer.id,
        consentDate: consentDate.trim(),
        consentVersion: consentVersion.trim(),
      });
      navigation.goBack();
    } catch (err) {
      console.error('[EnrollVolunteerForm] Enroll error:', err);
      Alert.alert('Error', 'Failed to enroll volunteer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Volunteer Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volunteer</Text>

          <View style={styles.searchContainer}>
            <Input
              label="Search Volunteer"
              placeholder="Type name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={
                isSearching ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Search size={20} color={theme.colors.textMuted} />
                )
              }
            />

            {showDropdown && (
              <Card variant="outlined" style={styles.dropdownCard}>
                <FlatList
                  data={searchResults}
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
              <Card variant="outlined" style={styles.selectedCard}>
                <Text style={styles.selectedName}>{selectedVolunteer.name}</Text>
                <Text style={styles.selectedEmail}>{selectedVolunteer.email}</Text>
              </Card>
            )}
          </View>
        </View>

        {/* Consent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consent Information</Text>

          <Input
            label="Consent Date"
            placeholder="YYYY-MM-DD"
            value={consentDate}
            onChangeText={setConsentDate}
          />

          <View style={styles.inputSpacing}>
            <Input
              label="Consent Version"
              placeholder="e.g., 1.2"
              value={consentVersion}
              onChangeText={setConsentVersion}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Enroll"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          onPress={handleEnroll}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  searchContainer: {
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
  selectedCard: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  selectedName: {
    ...theme.typography.bodyBase,
    color: theme.colors.textTitle,
    fontWeight: '600',
  },
  selectedEmail: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  inputSpacing: {
    marginTop: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadow.sm,
  },
});
