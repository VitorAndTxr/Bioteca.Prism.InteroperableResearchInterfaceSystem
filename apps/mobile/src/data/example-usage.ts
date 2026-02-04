/**
 * Example Usage: Local Data Persistence Layer
 *
 * This file demonstrates how to use the persistence layer to create
 * clinical sessions, recordings, and annotations.
 *
 * NOTE: This is an example file for documentation purposes.
 */

import { databaseManager } from './database';
import { SessionRepository, RecordingRepository, AnnotationRepository } from './repositories';
import { SessionConfig, ClinicalSession, Recording, Annotation } from '@iris/domain';

/**
 * Example: Complete session workflow
 */
export async function exampleSessionWorkflow(): Promise<void> {
    // Step 1: Initialize database
    await databaseManager.initialize();

    // Step 2: Create repository instances
    const sessionRepo = new SessionRepository();
    const recordingRepo = new RecordingRepository();
    const annotationRepo = new AnnotationRepository();

    // Step 3: Create a new session
    const sessionConfig: SessionConfig = {
        volunteerId: 'volunteer-001',
        volunteerName: 'John Doe',
        researcherId: 'researcher-123',
        deviceId: 'device-456',
        clinicalData: {
            bodyStructureSnomedCode: '76505004',
            bodyStructureName: 'Biceps brachii muscle structure',
            laterality: 'left',
            topographyCodes: ['40983000', '32849002'],
            topographyNames: ['Upper arm structure', 'Anterior compartment of upper arm']
        }
    };

    const session: ClinicalSession = await sessionRepo.create(sessionConfig);
    console.log(`Created session: ${session.id}`);

    // Step 4: Add a recording
    const recording1: Recording = await recordingRepo.create({
        sessionId: session.id,
        filename: 'emg-recording-001.csv',
        durationSeconds: 120,
        sampleCount: 25800,
        dataType: 'raw',
        sampleRate: 215,
        filePath: '/data/recordings/emg-recording-001.csv'
    });
    console.log(`Created recording: ${recording1.id}`);

    // Step 5: Add another recording (filtered data)
    const recording2: Recording = await recordingRepo.create({
        sessionId: session.id,
        filename: 'emg-recording-001-filtered.csv',
        durationSeconds: 120,
        sampleCount: 25800,
        dataType: 'filtered',
        sampleRate: 215,
        filePath: '/data/recordings/emg-recording-001-filtered.csv'
    });
    console.log(`Created filtered recording: ${recording2.id}`);

    // Step 6: Add annotations
    const annotation1: Annotation = await annotationRepo.create({
        sessionId: session.id,
        text: 'Patient reported mild discomfort at 30 seconds'
    });
    console.log(`Created annotation: ${annotation1.id}`);

    const annotation2: Annotation = await annotationRepo.create({
        sessionId: session.id,
        text: 'Good muscle activation observed throughout session'
    });
    console.log(`Created annotation: ${annotation2.id}`);

    // Step 7: End the session
    await sessionRepo.endSession(session.id);
    console.log('Session ended');

    // Step 8: Retrieve session data
    const updatedSession = await sessionRepo.getById(session.id);
    console.log(`Session duration: ${updatedSession?.durationSeconds} seconds`);

    const recordings = await recordingRepo.getBySession(session.id);
    console.log(`Total recordings: ${recordings.length}`);

    const annotations = await annotationRepo.getBySession(session.id);
    console.log(`Total annotations: ${annotations.length}`);

    // Step 9: Query sessions by researcher
    const researcherSessions = await sessionRepo.getByResearcher('researcher-123', 0, 10);
    console.log(`Researcher has ${researcherSessions.length} sessions`);
}

/**
 * Example: Query pending items for synchronization
 */
export async function exampleSyncWorkflow(): Promise<void> {
    const sessionRepo = new SessionRepository();
    const recordingRepo = new RecordingRepository();
    const annotationRepo = new AnnotationRepository();

    // Get all pending items
    const pendingSessions = await sessionRepo.getPending();
    const pendingRecordings = await recordingRepo.getPending();
    const pendingAnnotations = await annotationRepo.getPending();

    console.log(`Pending sessions: ${pendingSessions.length}`);
    console.log(`Pending recordings: ${pendingRecordings.length}`);
    console.log(`Pending annotations: ${pendingAnnotations.length}`);

    // Sync sessions
    for (const session of pendingSessions) {
        try {
            // TODO: Call backend API to sync session
            // await backendAPI.syncSession(session);

            // Mark as synced
            await sessionRepo.update(session.id, { syncStatus: 'synced' });
            console.log(`Synced session: ${session.id}`);
        } catch (error) {
            // Mark as failed
            await sessionRepo.update(session.id, { syncStatus: 'failed' });
            console.error(`Failed to sync session: ${session.id}`, error);
        }
    }

    // Sync recordings
    for (const recording of pendingRecordings) {
        try {
            // TODO: Call backend API to sync recording
            // await backendAPI.syncRecording(recording);

            await recordingRepo.markAsSynced(recording.id);
            console.log(`Synced recording: ${recording.id}`);
        } catch (error) {
            await recordingRepo.markAsFailed(recording.id);
            console.error(`Failed to sync recording: ${recording.id}`, error);
        }
    }

    // Sync annotations
    for (const annotation of pendingAnnotations) {
        try {
            // TODO: Call backend API to sync annotation
            // await backendAPI.syncAnnotation(annotation);

            await annotationRepo.markAsSynced(annotation.id);
            console.log(`Synced annotation: ${annotation.id}`);
        } catch (error) {
            await annotationRepo.markAsFailed(annotation.id);
            console.error(`Failed to sync annotation: ${annotation.id}`, error);
        }
    }
}

/**
 * Example: Search and filter sessions
 */
export async function exampleSearchWorkflow(): Promise<void> {
    const sessionRepo = new SessionRepository();

    // Search by volunteer name
    const johnSessions = await sessionRepo.search('John');
    console.log(`Found ${johnSessions.length} sessions for 'John'`);

    // Search by date
    const todaySessions = await sessionRepo.search('2026-02');
    console.log(`Found ${todaySessions.length} sessions in February 2026`);

    // Get active session
    const activeSession = await sessionRepo.getActiveSession();
    if (activeSession) {
        console.log(`Active session: ${activeSession.id}`);
        console.log(`Started at: ${activeSession.startedAt}`);
        console.log(`Volunteer: ${activeSession.volunteerName}`);
    } else {
        console.log('No active session');
    }
}

/**
 * Example: Pagination
 */
export async function examplePaginationWorkflow(): Promise<void> {
    const sessionRepo = new SessionRepository();
    const researcherId = 'researcher-123';

    // Page 1 (first 20 sessions)
    const page1 = await sessionRepo.getByResearcher(researcherId, 0, 20);
    console.log(`Page 1: ${page1.length} sessions`);

    // Page 2 (next 20 sessions)
    const page2 = await sessionRepo.getByResearcher(researcherId, 1, 20);
    console.log(`Page 2: ${page2.length} sessions`);

    // Custom page size
    const page1_50 = await sessionRepo.getByResearcher(researcherId, 0, 50);
    console.log(`Page 1 (50 per page): ${page1_50.length} sessions`);
}

/**
 * Example: Update operations
 */
export async function exampleUpdateWorkflow(): Promise<void> {
    const sessionRepo = new SessionRepository();
    const recordingRepo = new RecordingRepository();

    // Get a session
    const sessions = await sessionRepo.getAll();
    if (sessions.length === 0) {
        console.log('No sessions to update');
        return;
    }

    const session = sessions[0];

    // Update volunteer name
    await sessionRepo.update(session.id, {
        volunteerName: 'John Doe (Updated)'
    });
    console.log('Updated volunteer name');

    // Update sync status
    await sessionRepo.update(session.id, {
        syncStatus: 'synced'
    });
    console.log('Updated sync status');

    // Get recordings for the session
    const recordings = await recordingRepo.getBySession(session.id);
    if (recordings.length > 0) {
        const recording = recordings[0];

        // Update recording metadata
        await recordingRepo.update(recording.id, {
            durationSeconds: 125,
            sampleCount: 26875
        });
        console.log('Updated recording metadata');
    }
}

/**
 * Example: Delete operations
 */
export async function exampleDeleteWorkflow(): Promise<void> {
    const sessionRepo = new SessionRepository();
    const recordingRepo = new RecordingRepository();
    const annotationRepo = new AnnotationRepository();

    // Create a test session
    const session = await sessionRepo.create({
        volunteerId: 'test-volunteer',
        volunteerName: 'Test Delete',
        researcherId: 'test-researcher',
        clinicalData: {
            bodyStructureSnomedCode: '12345',
            bodyStructureName: 'Test',
            laterality: 'left',
            topographyCodes: [],
            topographyNames: []
        }
    });

    // Add recordings and annotations
    const recording = await recordingRepo.create({
        sessionId: session.id,
        filename: 'test.csv',
        durationSeconds: 10,
        sampleCount: 2150,
        dataType: 'raw',
        sampleRate: 215
    });

    const annotation = await annotationRepo.create({
        sessionId: session.id,
        text: 'Test annotation'
    });

    console.log(`Created session ${session.id} with recording and annotation`);

    // Delete session (cascades to recordings and annotations)
    await sessionRepo.delete(session.id);
    console.log('Deleted session and related data');

    // Verify deletion
    const deletedSession = await sessionRepo.getById(session.id);
    const deletedRecording = await recordingRepo.getById(recording.id);
    const deletedAnnotation = await annotationRepo.getById(annotation.id);

    console.log(`Session deleted: ${deletedSession === null}`);
    console.log(`Recording deleted: ${deletedRecording === null}`);
    console.log(`Annotation deleted: ${deletedAnnotation === null}`);
}
