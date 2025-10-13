/**
 * Session Management Models
 *
 * Defines types for FES therapy sessions and their status.
 */

/**
 * FES Parameters
 */
export interface FESParameters {
    a: number; // Amplitude (V)
    f: number; // Frequency (Hz)
    pw: number; // Pulse width (ms)
    df: number; // Difficulty (%)
    pd: number; // Pulse duration (s)
}

/**
 * Session Status
 */
export interface SessionStatus {
    parameters: FESParameters;
    status: SessionStatusMetrics;
}

/**
 * Session Status Metrics
 */
export interface SessionStatusMetrics {
    csa: number; // Complete stimuli amount
    isa: number; // Interrupted stimuli amount
    tlt: number; // Time of last trigger (ms)
    sd: number; // Session duration (ms)
}

/**
 * Session State
 */
export enum SessionState {
    IDLE = 'idle',
    ACTIVE = 'active',
    PAUSED = 'paused',
    STOPPED = 'stopped',
    ERROR = 'error'
}

/**
 * Session Metadata (for desktop app)
 */
export interface SessionMetadata {
    id: string;
    patientId?: string;
    startTime: Date;
    endTime?: Date;
    duration: number; // seconds
    parameters: FESParameters;
    status: SessionStatusMetrics;
    notes?: string;
}

/**
 * Session Event
 */
export interface SessionEvent {
    timestamp: number; // milliseconds since session start
    type: SessionEventType;
    data?: any;
}

/**
 * Session Event Types
 */
export enum SessionEventType {
    START = 'start',
    STOP = 'stop',
    PAUSE = 'pause',
    RESUME = 'resume',
    TRIGGER = 'trigger',
    EMERGENCY_STOP = 'emergency_stop',
    PARAMETER_CHANGE = 'parameter_change'
}
