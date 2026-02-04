/**
 * Annotation Models
 *
 * Defines types for text annotations associated with clinical sessions.
 */

import { SyncStatus } from './SyncStatus';

/**
 * Annotation
 *
 * Represents a text annotation added to a clinical session.
 * Annotations are used to capture researcher observations, notes,
 * or other contextual information during a session.
 */
export interface Annotation {
    id: string;
    sessionId: string;
    text: string;
    syncStatus: SyncStatus;
    createdAt: string; // ISO 8601
}

/**
 * New Annotation Data
 *
 * Data transfer object for creating a new annotation.
 */
export interface NewAnnotationData {
    sessionId: string;
    text: string;
}
