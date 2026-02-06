/**
 * History Screen
 *
 * Displays past sessions and allows review of historical data.
 * Accessible via the History tab in the bottom tab navigator.
 *
 * Features:
 * - List sessions in reverse chronological order
 * - Search/filter sessions by volunteer name or date
 * - Display sync status indicator (synced/pending)
 * - Export session data to CSV
 * - Empty state when no sessions exist
 */

import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import type { ClinicalSession, ClinicalData, Recording } from '@iris/domain';
import { theme } from '@/theme';
import { EmptyState } from '@/components/ui/EmptyState';
import { SessionRepository } from '@/data/repositories/SessionRepository';
import { RecordingRepository } from '@/data/repositories/RecordingRepository';
import { useDebounce } from '@/hooks/useDebounce';
import {
  exportSessionData,
  shareCSV,
  type SessionMetadata,
  type RecordingForExport,
  type RecordingDataPoint,
} from '@/utils/csvExport';
import { Search, Calendar, ChevronRight, FileDown } from 'lucide-react-native';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'History'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface SessionWithClinicalData extends ClinicalSession {
  clinicalData?: ClinicalData;
}

const sessionRepository = new SessionRepository();
const recordingRepository = new RecordingRepository();

/**
 * Format date to readable format: "Feb 2, 2026 14:30"
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${month} ${day}, ${year} ${hours}:${minutes}`;
}

/**
 * Format date to short format: "Feb 2, 2026"
 */
function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Format time to short format: "14:30"
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

export const HistoryScreen: FC<Props> = ({ navigation }) => {
  const [sessions, setSessions] = useState<SessionWithClinicalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [exportingSessionId, setExportingSessionId] = useState<string | null>(null);

  const debouncedSearchText = useDebounce(searchText, 300);

  /**
   * Load sessions from database
   */
  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const loadedSessions = await sessionRepository.getAll();

      // Load clinical data for each session
      const sessionsWithData = await Promise.all(
        loadedSessions.map(async (session) => {
          const clinicalData = await sessionRepository.getClinicalData(session.id);
          return {
            ...session,
            clinicalData: clinicalData ?? undefined,
          };
        })
      );

      setSessions(sessionsWithData);
    } catch (error) {
      console.error('[HistoryScreen] Failed to load sessions:', error);
      Alert.alert('Error', 'Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filter sessions by search text
   */
  const filteredSessions = useMemo(() => {
    if (!debouncedSearchText.trim()) {
      return sessions;
    }

    const searchLower = debouncedSearchText.toLowerCase();

    return sessions.filter((session) => {
      const volunteerName = session.volunteerName?.toLowerCase() ?? '';
      const dateString = formatDate(session.startedAt).toLowerCase();
      const dateShort = formatDateShort(session.startedAt).toLowerCase();

      return (
        volunteerName.includes(searchLower) ||
        dateString.includes(searchLower) ||
        dateShort.includes(searchLower)
      );
    });
  }, [sessions, debouncedSearchText]);

  /**
   * Handle export session data
   */
  const handleExportSession = useCallback(async (session: SessionWithClinicalData) => {
    try {
      setExportingSessionId(session.id);

      // Load recordings for this session
      const recordings = await recordingRepository.getBySession(session.id);

      if (recordings.length === 0) {
        Alert.alert('No Data', 'This session has no recordings to export.');
        return;
      }

      // Prepare metadata
      const metadata: SessionMetadata = {
        sessionId: session.id,
        volunteerId: session.volunteerId,
        volunteerName: session.volunteerName,
        bodyStructure: session.clinicalData?.bodyStructureName ?? 'Unknown',
        laterality: session.clinicalData?.laterality ?? 'Unknown',
        startedAt: session.startedAt,
        durationSeconds: session.durationSeconds,
        sampleRate: recordings[0]?.sampleRate ?? 215,
        dataType: recordings[0]?.dataType ?? 'raw',
      };

      // Prepare recordings for export
      const recordingsForExport: RecordingForExport[] = recordings.map((rec) => ({
        id: rec.id,
        filename: rec.filename,
        recordedAt: rec.recordedAt,
        dataType: rec.dataType,
        sampleRate: rec.sampleRate,
        sampleCount: rec.sampleCount,
      }));

      // For now, use empty data points (in real implementation, load from file storage)
      // TODO: Load actual recording data from file paths
      const dataPoints: RecordingDataPoint[][] = recordings.map(() => []);

      // Export and share
      const fileUri = await exportSessionData(metadata, recordingsForExport, dataPoints);
      await shareCSV(fileUri);
    } catch (error) {
      console.error('[HistoryScreen] Export failed:', error);
      Alert.alert('Export Failed', 'Failed to export session data. Please try again.');
    } finally {
      setExportingSessionId(null);
    }
  }, []);

  /**
   * Render session card
   */
  const renderSessionCard = useCallback(
    ({ item: session }: { item: SessionWithClinicalData }) => {
      const isExporting = exportingSessionId === session.id;

      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.dateTimeContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Calendar size={12} color={theme.colors.textMuted} />
                <Text style={styles.dateTime}>
                  {formatDateShort(session.startedAt)} • {formatTime(session.startedAt)}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.syncIndicator,
                session.syncStatus === 'synced' ? styles.syncIndicatorSynced : styles.syncIndicatorPending,
              ]}
            />
          </View>

          <View style={styles.cardBody}>
            <View style={styles.sessionInfo}>
              <Text style={styles.volunteerName} numberOfLines={1}>
                {session.volunteerName ?? 'Unknown Volunteer'}
              </Text>
              <Text style={styles.bodyStructure} numberOfLines={1}>
                {session.clinicalData?.bodyStructureName ?? 'Unknown Body Structure'}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>

          <View style={styles.cardFooter}>
            <Pressable
              style={({ pressed }) => [styles.exportButton, pressed && styles.exportButtonPressed]}
              onPress={() => handleExportSession(session)}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FileDown size={14} color={theme.colors.primary} />
                  <Text style={styles.exportButtonText}>Export CSV</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      );
    },
    [exportingSessionId, handleExportSession]
  );

  /**
   * Render empty state
   */
  const renderEmptyState = useCallback(() => {
    if (loading) {
      return null;
    }

    if (debouncedSearchText.trim() && filteredSessions.length === 0) {
      return (
        <EmptyState
          title="No sessions found"
          message="No sessions match your search criteria. Try a different search term."
        />
      );
    }

    if (sessions.length === 0) {
      return (
        <EmptyState
          title="No sessions yet"
          message="Start your first session to see it appear here."
        />
      );
    }

    return null;
  }, [loading, debouncedSearchText, filteredSessions.length, sessions.length]);

  /**
   * Load sessions on mount
   */
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Session History</Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by volunteer or date..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderSessionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredSessions.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={true}
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
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadow.sm,
  },

  title: {
    ...theme.typography.title1,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.md,
  },

  searchContainer: {
    marginBottom: theme.spacing.sm,
  },

  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.backgroundAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
  },

  searchInput: {
    ...theme.typography.bodyBase,
    flex: 1,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textBody,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['2xl'],
  },

  loadingText: {
    ...theme.typography.bodyBase,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
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
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },

  dateTimeContainer: {
    flex: 1,
  },

  dateTime: {
    ...theme.typography.bodySmall,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  syncIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  syncIndicatorSynced: {
    backgroundColor: theme.colors.success,
  },

  syncIndicatorPending: {
    backgroundColor: theme.colors.warning,
  },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },

  sessionInfo: {
    gap: theme.spacing.xs,
  },

  volunteerName: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
  },

  bodyStructure: {
    ...theme.typography.bodyBase,
    color: theme.colors.textBody,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },

  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundAlt,
  },

  exportButtonPressed: {
    opacity: 0.7,
  },

  exportButtonText: {
    ...theme.typography.uiBase,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
