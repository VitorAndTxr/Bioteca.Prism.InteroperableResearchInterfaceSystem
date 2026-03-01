/**
 * SyncService Mappers
 *
 * Anti-corruption layer between mobile SQLite models (camelCase) and
 * backend PascalCase DTOs. Follows the established pattern from
 * VolunteerService.ts and ResearchService.ts.
 *
 * Implements US-MI-001, US-MI-002, US-MI-003, US-MI-004.
 */

import type { ClinicalSession, ClinicalData, Recording, Annotation } from '@iris/domain';

// ── Outbound payloads (mobile -> backend, PascalCase) ─────────────────

export interface TargetAreaPayload {
    BodyStructureCode: string;
    LateralityCode: string | null;
    TopographicalModifierCodes: string[];
}

export interface CreateClinicalSessionPayload {
    Id: string;
    ResearchId: string | null;
    VolunteerId: string;
    TargetArea: TargetAreaPayload | null;
    StartAt: string;
    FinishedAt: string | null;
}

export interface UpdateClinicalSessionPayload {
    FinishedAt: string | null;
    TargetArea?: TargetAreaPayload;
}

export interface CreateRecordingPayload {
    Id: string;
    SignalType: string;
    SamplingRate: number;
    SamplesCount: number;
    FileUrl: string;
    CollectionDate: string;
    SensorId: string | null;
}

export interface CreateAnnotationPayload {
    Id: string;
    Text: string;
    CreatedAt: string;
}

export interface UploadRecordingPayload {
    RecordingId: string;
    SessionId: string;
    FileName: string;
    ContentType: string;
    FileData: string;
    FileSizeBytes: number;
}

// ── Inbound DTOs (backend -> mobile, camelCase via System.Text.Json) ──

export interface ClinicalSessionResponseDTO {
    id: string;
    researchId: string | null;
    volunteerId: string;
    targetAreaId: string | null;
    startAt: string;
    finishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

// ── Outbound mappers ──────────────────────────────────────────────────

export function mapToCreateSessionPayload(
    session: ClinicalSession,
    clinicalData: ClinicalData
): CreateClinicalSessionPayload {
    return {
        Id: session.id,
        ResearchId: session.researchId ?? null,
        VolunteerId: session.volunteerId,
        TargetArea: clinicalData.bodyStructureSnomedCode ? {
            BodyStructureCode: clinicalData.bodyStructureSnomedCode,
            LateralityCode: clinicalData.laterality ?? null,
            TopographicalModifierCodes: clinicalData.topographyCodes ?? [],
        } : null,
        StartAt: session.startedAt,
        FinishedAt: session.endedAt ?? null,
    };
}

export function mapToUpdateSessionPayload(
    session: ClinicalSession
): UpdateClinicalSessionPayload {
    return {
        FinishedAt: session.endedAt ?? null,
    };
}

export function mapToCreateRecordingPayload(
    recording: Recording,
    sensorId?: string | null
): CreateRecordingPayload {
    return {
        Id: recording.id,
        SignalType: recording.dataType,
        SamplingRate: recording.sampleRate,
        SamplesCount: recording.sampleCount,
        FileUrl: '',
        CollectionDate: recording.recordedAt,
        SensorId: sensorId ?? null,
    };
}

export function mapToCreateAnnotationPayload(
    annotation: Annotation
): CreateAnnotationPayload {
    return {
        Id: annotation.id,
        Text: annotation.text,
        CreatedAt: annotation.createdAt,
    };
}

export function buildUploadPayload(
    recording: Recording,
    sessionId: string,
    base64Content: string,
    fileSizeBytes: number
): UploadRecordingPayload {
    return {
        RecordingId: recording.id,
        SessionId: sessionId,
        FileName: recording.filename,
        ContentType: 'text/csv',
        FileData: base64Content,
        FileSizeBytes: fileSizeBytes,
    };
}

// ── Inbound mapper ────────────────────────────────────────────────────

export function mapResponseToClinicalSession(
    dto: ClinicalSessionResponseDTO
): ClinicalSession {
    return {
        id: dto.id,
        volunteerId: dto.volunteerId,
        researcherId: '',
        startedAt: dto.startAt,
        endedAt: dto.finishedAt ?? undefined,
        durationSeconds: dto.finishedAt
            ? Math.floor((new Date(dto.finishedAt).getTime() - new Date(dto.startAt).getTime()) / 1000)
            : 0,
        syncStatus: 'synced',
        createdAt: dto.createdAt,
        researchId: dto.researchId ?? undefined,
    };
}
