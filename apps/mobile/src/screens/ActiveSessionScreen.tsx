/**
 * Active Session Screen
 *
 * Displays real-time session monitoring and control.
 * Shows current session status, timer, recordings list, and control buttons.
 *
 * Features:
 * - Running session timer (MM:SS format)
 * - Session summary card with volunteer, body structure, device
 * - Large circular record button for starting captures
 * - Recordings list with sync status badges
 * - Empty state when no recordings
 * - Annotations navigation
 * - End session with confirmation dialog
 */

import React, { FC } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSession } from '@/context/SessionContext';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { Recording } from '@iris/domain';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, FileText, XCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'ActiveSession'>;

export const ActiveSessionScreen: FC<Props> = ({ navigation }) => {
  const { activeSession, clinicalData, recordings, elapsedSeconds, endSession } = useSession();
  const formattedTime = useSessionTimer(elapsedSeconds);

  if (!activeSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>No active session found</Text>
          <Button
            title="Go to Session Config"
            onPress={() => navigation.navigate('SessionConfig')}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleEndSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session? All recordings will be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await endSession();
              navigation.navigate('SessionConfig');
            } catch (error) {
              Alert.alert('Error', 'Failed to end session. Please try again.');
              console.error('Failed to end session:', error);
            }
          },
        },
      ]
    );
  };

  const handleRecord = () => {
    navigation.navigate('Capture', { sessionId: activeSession.id });
  };

  const handleAnnotations = () => {
    navigation.navigate('AnnotationsList', { sessionId: activeSession.id });
  };

  const renderRecordingItem = ({ item, index }: { item: Recording; index: number }) => {
    const syncStatusColor = {
      synced: theme.colors.success,
      pending: theme.colors.warning,
      failed: theme.colors.error,
    }[item.syncStatus];

    const syncStatusLabel = {
      synced: 'Synced',
      pending: 'Pending',
      failed: 'Failed',
    }[item.syncStatus];

    const recordedTime = new Date(item.recordedAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.recordingItem}>
        <View style={styles.recordingContent}>
          <View style={styles.recordingNumber}>
            <Text style={styles.recordingNumberText}>#{index + 1}</Text>
          </View>
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingFilename}>{item.filename}</Text>
            <Text style={styles.recordingMeta}>
              {recordedTime} • {item.durationSeconds}s
            </Text>
          </View>
        </View>
        <View style={[styles.syncBadge, { backgroundColor: `${syncStatusColor}15` }]}>
          <Text style={[styles.syncBadgeText, { color: syncStatusColor }]}>
            {syncStatusLabel}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Timer */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Active Session</Text>
          <View style={styles.timerContainer}>
            <Clock size={16} color={theme.colors.primary} />
            <Text style={styles.timerText}>{formattedTime}</Text>
          </View>
        </View>
        <View style={styles.volunteerBadge}>
          <Text style={styles.volunteerBadgeText}>
            {activeSession.volunteerName || `Volunteer #${activeSession.volunteerId.slice(0, 4)}`}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Session Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Structure</Text>
              <Text style={styles.summaryValue}>
                {clinicalData?.bodyStructureName || 'Unknown'} ({clinicalData?.laterality?.[0]?.toUpperCase() || '-'})
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Device</Text>
              <Text style={styles.summaryValue}>
                {activeSession.deviceId ? `Device ${activeSession.deviceId.slice(0, 8)}` : 'No Device'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Recordings Section */}
        <View style={styles.recordingsSection}>
          <Text style={styles.sectionTitle}>Recordings</Text>
          {recordings.length === 0 ? (
            <EmptyState
              title="No recordings yet"
              message="Tap Record to start capturing data."
              style={styles.emptyState}
            />
          ) : (
            <FlatList
              data={recordings}
              renderItem={renderRecordingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.recordingsList}
            />
          )}
        </View>

        {/* Large Record Button */}
        <View style={styles.recordButtonContainer}>
          <Pressable onPress={handleRecord} style={({ pressed }) => [pressed && styles.recordButtonPressed]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recordButton}
            >
              <View style={styles.recordButtonInner}>
                <View style={styles.recordButtonDot} />
              </View>
              <Text style={styles.recordButtonText}>RECORD</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <Pressable style={[styles.footerButton, styles.footerButtonSecondary]} onPress={handleAnnotations}>
            <FileText size={18} color={theme.colors.primary} />
            <Text style={styles.footerButtonSecondaryText}>Annotations</Text>
          </Pressable>
          <Pressable style={[styles.footerButton, styles.footerButtonDanger]} onPress={handleEndSession}>
            <XCircle size={18} color={theme.colors.surface} />
            <Text style={styles.footerButtonDangerText}>End Session</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },

  errorText: {
    ...theme.typography.bodyBase,
    color: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },

  // Header
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    ...theme.shadow.sm,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  headerTitle: {
    ...theme.typography.title2,
    color: theme.colors.textTitle,
  },

  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },

  timerText: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontVariant: ['tabular-nums'],
  },

  volunteerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.secondary}15`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },

  volunteerBadgeText: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.xs,
    color: theme.colors.secondary,
  },

  // Scroll Content
  scrollContent: {
    flex: 1,
  },

  scrollContentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },

  // Summary Card
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },

  summaryValue: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.base,
    color: theme.colors.textBody,
  },

  // Recordings Section
  recordingsSection: {
    marginBottom: theme.spacing.xl,
  },

  sectionTitle: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },

  recordingsList: {
    gap: theme.spacing.md,
  },

  recordingItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadow.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  recordingNumber: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },

  recordingNumberText: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textBody,
  },

  recordingInfo: {
    flex: 1,
  },

  recordingFilename: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textTitle,
    marginBottom: 2,
  },

  recordingMeta: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },

  syncBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },

  syncBadgeText: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.xs,
  },

  emptyState: {
    paddingVertical: theme.spacing['2xl'],
  },

  // Record Button
  recordButtonContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },

  recordButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.xl,
  },

  recordButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },

  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },

  recordButtonDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },

  recordButtonText: {
    ...theme.typography.uiBase,
    fontSize: theme.fontSize.base,
    color: theme.colors.surface,
    letterSpacing: 1,
  },

  // Footer
  footer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  footerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },

  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },

  footerButtonSecondary: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },

  footerButtonSecondaryText: {
    ...theme.typography.uiBase,
    color: theme.colors.primary,
  },

  footerButtonDanger: {
    backgroundColor: theme.colors.error,
  },

  footerButtonDangerText: {
    ...theme.typography.uiBase,
    color: theme.colors.surface,
  },
});
