/**
 * New Annotation Screen
 *
 * Form to create a new annotation for the current session.
 * Captures timestamp and text content.
 */

import React, { FC, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { AnnotationRepository } from '@/data/repositories/AnnotationRepository';
import { X } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'NewAnnotation'>;

const annotationRepository = new AnnotationRepository();

export const NewAnnotationScreen: FC<Props> = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus on mount
    const timer = setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => {
    if (text.trim().length > 0) {
      Alert.alert(
        'Discard changes?',
        'Your annotation has not been saved. Do you want to discard it?',
        [
          { text: 'Continue editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      return;
    }

    try {
      setIsSaving(true);
      await annotationRepository.create({
        sessionId,
        text: trimmedText,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save annotation:', error);
      Alert.alert(
        'Error',
        'Failed to save annotation. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = text.trim().length > 0 && !isSaving;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleCancel} disabled={isSaving}>
            <X size={24} color={isSaving ? theme.colors.textMuted : theme.colors.textBody} />
          </Pressable>
          <Text style={styles.headerTitle}>New Annotation</Text>
          <Pressable onPress={handleSave} disabled={!canSave}>
            <Text style={[styles.saveButton, !canSave && styles.disabledButton]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="Enter your clinical observation..."
            placeholderTextColor={theme.colors.textPlaceholder}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            editable={!isSaving}
          />
        </View>

        {/* Footer with character count */}
        <View style={styles.footer}>
          <Text style={styles.characterCount}>{text.length} characters</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  headerTitle: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
  },

  saveButton: {
    ...theme.typography.bodyBase,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.5,
  },

  inputContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },

  textInput: {
    flex: 1,
    ...theme.typography.bodyLarge,
    color: theme.colors.textBody,
    textAlignVertical: 'top',
  },

  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
    alignItems: 'flex-end',
  },

  characterCount: {
    ...theme.typography.bodyExtraSmall,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
});
