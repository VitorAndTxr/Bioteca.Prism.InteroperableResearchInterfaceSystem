/**
 * Application Form Screen
 *
 * Modal form to create or edit an application linked to a research project.
 *
 * Features (US-RC-029):
 * - Text inputs: Name, URL, Description, Additional Info
 * - Create/Save button (label changes by mode)
 * - Validation: name and URL required
 * - Loads existing data in edit mode (applicationId provided)
 * - On success: navigation.goBack()
 */

import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { researchService } from '@/services/ResearchService';
import { Button, Input } from '@/components/ui';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'ApplicationForm'>;

export const ApplicationFormScreen: FC<Props> = ({ route, navigation }) => {
  const { researchId, applicationId } = route.params;
  const isEditMode = !!applicationId;

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    const loadExisting = async () => {
      try {
        setIsLoadingExisting(true);
        const apps = await researchService.getApplications(researchId);
        const existing = apps.find((a) => a.id === applicationId);
        if (existing) {
          setName(existing.name);
          setUrl(existing.url);
          setDescription(existing.description);
          setAdditionalInfo(existing.additionalInfo);
        }
      } catch (err) {
        console.error('[ApplicationFormScreen] Load error:', err);
        Alert.alert('Error', 'Failed to load application data.');
      } finally {
        setIsLoadingExisting(false);
      }
    };

    loadExisting();
  }, [isEditMode, researchId, applicationId]);

  const isFormValid = name.trim().length > 0 && url.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setIsSubmitting(true);

      if (isEditMode && applicationId) {
        await researchService.updateApplication(researchId, applicationId, {
          name: name.trim(),
          url: url.trim(),
          description: description.trim(),
          additionalInfo: additionalInfo.trim(),
        });
      } else {
        await researchService.createApplication(researchId, {
          researchId,
          name: name.trim(),
          url: url.trim(),
          description: description.trim(),
          additionalInfo: additionalInfo.trim(),
        });
      }

      navigation.goBack();
    } catch (err) {
      console.error('[ApplicationFormScreen] Submit error:', err);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} application.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingExisting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading application...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Input
            label="Name *"
            placeholder="Application name"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.inputSpacing}>
            <Input
              label="URL *"
              placeholder="https://example.com"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={styles.inputSpacing}>
            <Input
              label="Description"
              placeholder="Brief description of the application"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.inputSpacing}>
            <Input
              label="Additional Info"
              placeholder="Any additional information"
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isEditMode ? 'Save' : 'Create'}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          onPress={handleSubmit}
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
