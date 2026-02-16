/**
 * History Screen
 *
 * Displays past sessions with backend integration, local merge, offline
 * fallback, sync status badges, and per-session retry.
 *
 * Implements US-MI-014 through US-MI-018.
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
import type { ClinicalSession, ClinicalData, PaginatedResponse } from '@iris/domain';
import { theme } from '@/theme';
import { EmptyState } from '@/components/ui/EmptyState';
import { SessionRepository } from '@/data/repositories/SessionRepository';
import { RecordingRepository } from '@/data/repositories/RecordingRepository';
import { AnnotationRepository } from '@/data/repositories/AnnotationRepository';
import { SyncService } from '@/services/SyncService';
import { middleware } from '@/services/middleware';
import {
  mapResponseToClinicalSession,
  type ClinicalSessionResponseDTO,
} from '@/services/SyncService.mappers';
import { useDebounce } from '@/hooks/useDebounce';
import {
  exportSessionData,
  shareCSV,
  type SessionMetadata,
  type RecordingForExport,
  type RecordingDataPoint,
} from '@/utils/csvExport';
import {
  Search,
  Calendar,
  ChevronRight,
  FileDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  WifiOff,
  RefreshCw,
} from 'lucide-react-native';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'History'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface SessionWithClinicalData extends ClinicalSession {
  clinicalData?: ClinicalData;
}

const sessionRepository = new SessionRepository();
const recordingRepository = new RecordingRepository();
const annotationRepository = new AnnotationRepository();
const syncService = new SyncService(sessionRepository, recordingRepository, annotationRepository);

function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDate(isoString: string): string {
  const hours = new Date(isoString).getHours().toString().padStart(2, '0');
  const minutes = new Date(isoString).getMinutes().toString().padStart(2, '0');
  return `${formatDateShort(isoString)} ${hours}:${minutes}`;
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Merge backend and local session data.
 * Backend is authoritative for synced sessions.
 * Local-only sessions keep their current syncStatus.
 */
function mergeSessionData(
  backendSessions: ClinicalSession[],
  localSessions: SessionWithClinicalData[]
): SessionWithClinicalData[] {
  const mergedMap = new Map<string, SessionWithClinicalData>();

  for (const bs of backendSessions) {
    mergedMap.set(bs.id, { ...bs, syncStatus: 'synced' });
  }

  for (const ls of localSessions) {
    if (mergedMap.has(ls.id)) {
      const backend = mergedMap.get(ls.id)!;
      mergedMap.set(ls.id, {
        ...backend,
        clinicalData: ls.clinicalData,
        volunteerName: ls.volunteerName ?? backend.volunteerName,
        syncStatus: 'synced',
      });
    } else {
      mergedMap.set(ls.id, ls);
    }
  }

  return Array.from(mergedMap.values())
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export const HistoryScreen: FC<Props> = ({ navigation }) => {
  const [sessions, setSessions] = useState<SessionWithClinicalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [exportingSessionId, setExportingSessionId] = useState<string | null>(null);
  const [retryingSessionId, setRetryingSessionId] = useState<string | null>(null);

  const debouncedSearchText = useDebounce(searchText, 300);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setIsOffline(false);

      // Load local sessions
      const localSessions = await sessionRepository.getAll();
      const localWithData: SessionWithClinicalData[] = await Promise.all(
        localSessions.map(async (session) => {
          const clinicalData = await sessionRepository.getClinicalData(session.id);
          return { ...session, clinicalData: clinicalData ?? undefined };
        })
      );

      // Try fetching from backend
      let backendSessions: ClinicalSession[] = [];
      try {
        const response = await middleware.invoke<Record<string, unknown>, PaginatedResponse<ClinicalSessionResponseDTO>>({
          path: '/api/ClinicalSession/GetAllPaginated?page=1&pageSize=50',
          method: 'GET',
          payload: {},
        });
        backendSessions = (response.data ?? []).map(mapResponseToClinicalSession);
      } catch {
        setIsOffline(true);
        console.warn('[HistoryScreen] Backend fetch failed, showing local data only');
      }

      if (backendSessions.length > 0) {
        setSessions(mergeSessionData(backendSessions, localWithData));
      } else {
        setSessions(localWithData.sort((a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        ));
      }
    } catch (error) {
      console.error('[HistoryScreen] Failed to load sessions:', error);
      Alert.alert('Error', 'Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredSessions = useMemo(() => {
    if (!debouncedSearchText.trim()) return sessions;

    const searchLower = debouncedSearchText.toLowerCase();
    return sessions.filter((session) => {
      const volunteerName = session.volunteerName?.toLowerCase() ?? '';
      const dateString = formatDate(session.startedAt).toLowerCase();
      return volunteerName.includes(searchLower) || dateString.includes(searchLower);
    });
  }, [sessions, debouncedSearchText]);

  const handleExportSession = useCallback(async (session: SessionWithClinicalData) => {
    try {
      setExportingSessionId(session.id);
      const recordings = await recordingRepository.getBySession(session.id);

      if (recordings.length === 0) {
        Alert.alert('No Data', 'This session has no recordings to export.');
        return;
      }

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

      const recordingsForExport: RecordingForExport[] = recordings.map((rec) => ({
        id: rec.id,
        filename: rec.filename,
        recordedAt: rec.recordedAt,
        dataType: rec.dataType,
        sampleRate: rec.sampleRate,
        sampleCount: rec.sampleCount,
      }));

      const dataPoints: RecordingDataPoint[][] = recordings.map(() => []);
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
   * Retry sync for a failed session.
   * Resets retry state and triggers a full sync cycle.
   */
  const handleRetrySync = useCallback(async (sessionId: string) => {
    try {
      setRetryingSessionId(sessionId);
      await sessionRepository.update(sessionId, { syncStatus: 'pending' });
      syncService.resetEntityRetry(sessionId);
      await syncService.syncAll();
      await loadSessions();
    } catch (error) {
      console.error('[HistoryScreen] Retry failed:', error);
    } finally {
      setRetryingSessionId(null);
    }
  }, [loadSessions]);

  /**
   * Render sync status badge
   */
  const renderSyncBadge = useCallback((session: SessionWithClinicalData) => {
    const isRetrying = retryingSessionId === session.id;

    switch (session.syncStatus) {
      case 'synced':
        return (
          <View style={styles.syncBadge}>
            <CheckCircle2 size={12} color={theme.colors.success} />
            <Text style={[styles.syncBadgeText, { color: theme.colors.success }]}>Synced</Text>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.syncBadge}>
            <Clock size={12} color={theme.colors.warning} />
            <Text style={[styles.syncBadgeText, { color: theme.colors.warning }]}>Pending</Text>
          </View>
        );
      case 'syncing':
        return (
          <View style={styles.syncBadge}>
            <Loader2 size={12} color={theme.colors.primary} />
            <Text style={[styles.syncBadgeText, { color: theme.colors.primary }]}>Syncing...</Text>
          </View>
        );
      case 'failed':
        return (
          <View style={styles.syncBadgeRow}>
            <View style={styles.syncBadge}>
              <AlertCircle size={12} color={theme.colors.error} />
              <Text style={[styles.syncBadgeText, { color: theme.colors.error }]}>Failed</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}
              onPress={() => handleRetrySync(session.id)}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <RefreshCw size={14} color={theme.colors.primary} />
              )}
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  }, [retryingSessionId, handleRetrySync]);

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
                  {formatDateShort(session.startedAt)} {formatTime(session.startedAt)}
                </Text>
              </View>
            </View>
            {renderSyncBadge(session)}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.sessionInfo}>
              <Text style={styles.volunteerName} numberOfLines={1}>
                {session.volunteerName ?? 'Unknown Volunteer'}
              </Text>
              <Text style={styles.bodyStructure} numberOfLines={1}>
                {session.clinicalData?.bodyStructureName ?? 'Unknown Body Structure'}
              </Text>
              {session.researchTitle && (
                <Text style={styles.researchLabel} numberOfLines={1}>
                  {session.researchTitle}
                </Text>
              )}
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
    [exportingSessionId, handleExportSession, renderSyncBadge]
  );

  const renderEmptyState = useCallback(() => {
    if (loading) return null;

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

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <WifiOff size={14} color={theme.colors.textBody} />
          <Text style={styles.offlineBannerText}>Offline -- showing local data only</Text>
        </View>
      )}

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
          onRefresh={loadSessions}
          refreshing={loading}
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.warning + '20',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.warning,
  },
  offlineBannerText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textBody,
    fontWeight: '600',
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
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncBadgeText: {
    ...theme.typography.uiSmall,
    fontWeight: '600',
  },
  syncBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    padding: 4,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sessionInfo: {
    flex: 1,
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
  researchLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
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
