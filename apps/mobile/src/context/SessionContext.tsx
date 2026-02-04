/**
 * Session Context
 *
 * Manages active clinical session state, recordings, and session lifecycle.
 * Provides session creation, ending, and recording management.
 *
 * Features:
 * - Creates and manages active clinical sessions
 * - Tracks elapsed time relative to session start
 * - Manages recordings associated with the session
 * - Checks for orphaned sessions on mount
 * - Automatic session duration calculation
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, FC, useRef } from 'react';
import { ClinicalSession, ClinicalData, SessionConfig, Recording, NewRecordingData } from '@iris/domain';
import { SessionRepository } from '@/data/repositories/SessionRepository';
import { RecordingRepository } from '@/data/repositories/RecordingRepository';

interface SessionContextValue {
  activeSession: ClinicalSession | null;
  clinicalData: ClinicalData | null;
  recordings: Recording[];
  elapsedSeconds: number;
  startSession: (config: SessionConfig) => Promise<ClinicalSession>;
  endSession: () => Promise<void>;
  addRecording: (recording: NewRecordingData) => Promise<Recording>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

const sessionRepository = new SessionRepository();
const recordingRepository = new RecordingRepository();

export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<ClinicalSession | null>(null);
  const [clinicalData, setClinicalData] = useState<ClinicalData | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for orphaned sessions on mount
  useEffect(() => {
    const checkForOrphanedSessions = async () => {
      try {
        console.log('[SessionContext] Checking for orphaned sessions...');
        const orphanedSession = await sessionRepository.getActiveSession();

        if (orphanedSession) {
          console.warn('[SessionContext] Found orphaned session:', orphanedSession.id);

          // Auto-end orphaned session
          const now = new Date().toISOString();
          const startedAt = new Date(orphanedSession.startedAt);
          const durationSeconds = Math.floor((new Date(now).getTime() - startedAt.getTime()) / 1000);

          await sessionRepository.update(orphanedSession.id, {
            endedAt: now,
            durationSeconds,
          });

          console.log('[SessionContext] Orphaned session auto-ended');
        } else {
          console.log('[SessionContext] No orphaned sessions found');
        }
      } catch (error) {
        console.error('[SessionContext] Failed to check for orphaned sessions:', error);
      }
    };

    checkForOrphanedSessions();
  }, []);

  // Timer effect for active session
  useEffect(() => {
    if (activeSession) {
      // Calculate initial elapsed time
      const startedAt = new Date(activeSession.startedAt);
      const now = new Date();
      const initialElapsed = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      setElapsedSeconds(initialElapsed);

      // Start timer
      timerRef.current = setInterval(() => {
        const currentTime = new Date();
        const elapsed = Math.floor((currentTime.getTime() - startedAt.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);

      console.log('[SessionContext] Timer started for session:', activeSession.id);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          console.log('[SessionContext] Timer stopped');
        }
      };
    } else {
      // Clear timer when no active session
      setElapsedSeconds(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [activeSession]);

  /**
   * Start a new clinical session.
   * Creates session in SQLite and sets as active.
   */
  const startSession = useCallback(async (config: SessionConfig): Promise<ClinicalSession> => {
    try {
      console.log('[SessionContext] Starting new session...');

      // Check for existing active session
      const existingActive = await sessionRepository.getActiveSession();
      if (existingActive) {
        throw new Error('An active session already exists. Please end it before starting a new one.');
      }

      // Create session
      const session = await sessionRepository.create(config);
      setActiveSession(session);

      // Load clinical data
      const clinical = await sessionRepository.getClinicalData(session.id);
      setClinicalData(clinical);

      setRecordings([]);
      setElapsedSeconds(0);

      console.log('[SessionContext] Session started:', session.id);
      return session;
    } catch (error) {
      console.error('[SessionContext] Failed to start session:', error);
      throw error;
    }
  }, []);

  /**
   * End the active session.
   * Sets endedAt timestamp, calculates duration, and clears active state.
   */
  const endSession = useCallback(async (): Promise<void> => {
    if (!activeSession) {
      throw new Error('No active session to end');
    }

    try {
      console.log('[SessionContext] Ending session:', activeSession.id);

      // Calculate duration
      const endedAt = new Date().toISOString();
      const startedAt = new Date(activeSession.startedAt);
      const durationSeconds = Math.floor((new Date(endedAt).getTime() - startedAt.getTime()) / 1000);

      // Update session in database
      await sessionRepository.update(activeSession.id, {
        endedAt,
        durationSeconds,
      });

      // Clear active state
      setActiveSession(null);
      setClinicalData(null);
      setRecordings([]);
      setElapsedSeconds(0);

      console.log('[SessionContext] Session ended successfully');
    } catch (error) {
      console.error('[SessionContext] Failed to end session:', error);
      throw error;
    }
  }, [activeSession]);

  /**
   * Add a recording to the active session.
   * Creates recording in SQLite and updates recordings list.
   */
  const addRecording = useCallback(
    async (recordingData: NewRecordingData): Promise<Recording> => {
      if (!activeSession) {
        throw new Error('No active session to add recording to');
      }

      if (recordingData.sessionId !== activeSession.id) {
        throw new Error('Recording session ID does not match active session');
      }

      try {
        console.log('[SessionContext] Adding recording to session:', activeSession.id);

        const recording = await recordingRepository.create(recordingData);
        setRecordings((prev) => [...prev, recording]);

        console.log('[SessionContext] Recording added:', recording.id);
        return recording;
      } catch (error) {
        console.error('[SessionContext] Failed to add recording:', error);
        throw error;
      }
    },
    [activeSession]
  );

  const value: SessionContextValue = {
    activeSession,
    clinicalData,
    recordings,
    elapsedSeconds,
    startSession,
    endSession,
    addRecording,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
