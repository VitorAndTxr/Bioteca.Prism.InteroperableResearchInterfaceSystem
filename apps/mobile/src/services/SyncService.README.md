# Sync Service

The Sync Service manages periodic synchronization of local data with the Research Node backend via the PRISM encrypted middleware channel.

## Overview

The Sync Service is responsible for:
- Synchronizing pending clinical sessions, recordings, and annotations to the backend
- Enforcing dependency ordering: sessions first, then recordings, then annotations
- Two-step recording sync: metadata POST + base64 file upload
- Exponential backoff retry with jitter and error classification (transient vs permanent)
- Preventing concurrent sync operations via `isSyncing` mutex
- Providing sync status reports with per-entity error details

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Mobile App                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐                               │
│  │  SessionContext   │ ◄─── Triggers syncAll() on   │
│  │                   │      endSession() (fire&forget)│
│  └────────┬─────────┘                               │
│           │                                          │
│  ┌────────▼─────────┐                               │
│  │   SyncService    │ ◄─── Periodic sync (60s)     │
│  │                   │      + manual trigger         │
│  └────────┬─────────┘                               │
│           │                                          │
│  ┌────────▼──────────────────────────┐             │
│  │  SyncService.mappers              │             │
│  │  (DTO interfaces + mapper fns)    │             │
│  └────────┬──────────────────────────┘             │
│           │                                          │
│  ┌────────▼──────────────────────────┐             │
│  │  Repositories                     │             │
│  │  SessionRepo / RecordingRepo /    │             │
│  │  AnnotationRepo                   │             │
│  └────────┬──────────────────────────┘             │
│           │                                          │
│  ┌────────▼─────────┐                               │
│  │   SQLite DB      │                               │
│  │  (sync_status)   │                               │
│  └──────────────────┘                               │
│                                                      │
└──────────────────────────────────────────────────────┘
           │
           │ middleware.invoke()
           │ (PRISM Encrypted Channel)
           │
┌──────────▼──────────────────────────────────────────┐
│         Research Node Backend                        │
│  POST /api/ClinicalSession/New                      │
│  PUT  /api/ClinicalSession/Update/{id}              │
│  POST /api/ClinicalSession/{sid}/recordings/New     │
│  POST /api/Upload/recording                         │
│  POST /api/ClinicalSession/{sid}/annotations/New    │
│  GET  /api/ClinicalSession/GetAllPaginated          │
└─────────────────────────────────────────────────────┘
```

## Components

### SyncService

Core service class that manages sync operations with real backend integration.

**Constructor**:
```typescript
constructor(
    sessionRepo: SessionRepository,
    recordingRepo: RecordingRepository,
    annotationRepo: AnnotationRepository,
    maxRetries?: number // Default: 5
)
```

**Public Methods**:
- `start(intervalMs?: number)` - Start periodic sync (default: 60000ms)
- `stop()` - Stop periodic sync
- `isRunning()` - Check if sync is running
- `syncAll()` - Manually trigger sync for all entity types
- `resetEntityRetry(entityId: string)` - Reset retry state for an entity (used by retry button)

### SyncService.mappers

Anti-corruption layer between mobile domain types and backend DTOs.

**Outbound Payload Interfaces** (mobile -> backend, PascalCase):
- `CreateClinicalSessionPayload` - Session creation with ClinicalContext JSON
- `UpdateClinicalSessionPayload` - Session update (FinishedAt)
- `CreateRecordingPayload` - Recording metadata
- `CreateAnnotationPayload` - Annotation data
- `UploadRecordingPayload` - Base64 file upload with metadata

**Inbound DTO** (backend -> mobile, camelCase):
- `ClinicalSessionResponseDTO` - Backend session response

**Mapper Functions**:
- `mapToCreateSessionPayload(session, clinicalData)` - Maps session + clinical data to backend payload
- `mapToCreateRecordingPayload(recording)` - Maps recording to backend payload
- `mapToCreateAnnotationPayload(annotation)` - Maps annotation to backend payload
- `buildUploadPayload(recording, sessionId, base64, size)` - Builds file upload payload
- `mapResponseToClinicalSession(dto)` - Maps backend response to mobile ClinicalSession

### SyncService.types

TypeScript interfaces for sync reporting:
- `SyncReport` - Aggregate report with per-entity results and timestamp
- `SyncEntityReport` - Per-entity report with synced/failed/pending counts and optional errorDetails

## Sync Protocol

### Dependency Ordering

The sync executes in strict order to respect backend foreign key constraints:

1. **Sessions** (`syncSessions`) - Fetches pending sessions, loads ClinicalData, maps to backend payload, POSTs via middleware
2. **Recordings** (`syncRecordings`) - Only processes recordings whose parent session is already synced (SQL JOIN via `getPendingWithSyncedParent()`)
3. **Annotations** (`syncAnnotations`) - Only processes annotations whose parent session is synced (client-side filter via Set)

### Two-Step Recording Sync

Each recording requires two backend calls treated as an atomic retry unit:
1. `POST /api/ClinicalSession/{sid}/recordings/New` - Create recording metadata
2. `POST /api/Upload/recording` - Upload base64-encoded CSV file (via `expo-file-system`)

If either step fails, the recording stays as `pending` and both steps retry on the next cycle. The backend upsert ensures step 1 is idempotent.

### Session End Trigger

When `SessionContext.endSession()` is called:
1. Session is updated in SQLite with `endedAt` and `durationSeconds`
2. If the session was previously synced, a PUT request sends `{ FinishedAt }` to update the backend
3. `syncService.syncAll()` is triggered fire-and-forget (non-blocking)

### Retry Logic

Exponential backoff with jitter:
- Formula: `min(1000 * 2^attempt + random(0-500), 300000ms)`
- Max attempts: 5 (configurable)
- Error classification:
  - **Permanent** (4xx except 408/429): Fail immediately, no retry
  - **Transient** (5xx, network, 408, 429): Retry with backoff
- In-memory retry tracking via `Map<string, number>` (resets on app restart)

## Backend Endpoints

### Session Sync
```
POST /api/ClinicalSession/New
Body: { Id, ResearchId, VolunteerId, ClinicalContext, StartAt, FinishedAt }
Response: 200 OK (upsert on client-generated UUID)
```

### Session Update
```
PUT /api/ClinicalSession/Update/{id}
Body: { FinishedAt, ClinicalContext? }
```

### Recording Metadata
```
POST /api/ClinicalSession/{sessionId}/recordings/New
Body: { Id, SignalType, SamplingRate, SamplesCount, FileUrl, CollectionDate, SensorId }
```

### Recording File Upload
```
POST /api/Upload/recording
Body: { RecordingId, SessionId, FileName, ContentType, FileData, FileSizeBytes }
Response: { message, fileUrl }
```

### Annotation Sync
```
POST /api/ClinicalSession/{sessionId}/annotations/New
Body: { Id, Text, CreatedAt }
```

### History Fetch
```
GET /api/ClinicalSession/GetAllPaginated?page=1&pageSize=50
Response: { items: ClinicalSessionResponseDTO[], totalCount, page, pageSize }
```

## Sync Status Tracking

Each entity (session, recording, annotation) has a `syncStatus` field:
- `'pending'` - Not yet synced
- `'synced'` - Successfully synced to backend
- `'failed'` - Permanently failed after max retries

## Sync Report

```typescript
interface SyncReport {
    sessions: SyncEntityReport;
    recordings: SyncEntityReport;
    annotations: SyncEntityReport;
    timestamp: string; // ISO 8601
}

interface SyncEntityReport {
    synced: number;   // Successfully synced this cycle
    failed: number;   // Failed this cycle
    pending: number;  // Still pending after cycle
    errorDetails?: Array<{ entityId: string; error: string }>;
}
```

## Error Handling

### Error Classification
- **Transient errors** (5xx, network failures, 408 timeout, 429 rate limit): Retry with exponential backoff
- **Permanent errors** (4xx except 408/429): Fail immediately, mark entity as `'failed'`

### Error Reporting
Each sync cycle produces a `SyncReport` with optional `errorDetails` arrays containing the entity ID and error message for each failure.

## Performance Considerations

- **Concurrent Sync Prevention**: `isSyncing` flag prevents overlapping sync cycles
- **Dependency Ordering**: Recordings and annotations only sync after their parent session is synced
- **Incremental Sync**: Only pending items are processed each cycle
- **Base64 Streaming**: `expo-file-system` reads files natively to base64 without loading into JS memory
- **In-Memory Retry**: V1 uses Map-based tracking (resets on restart); SQLite persistence planned for V2

## Testing

Unit tests in `SyncService.test.ts` cover:
- Start/stop lifecycle management
- Empty report when no pending items
- Session sync with middleware.invoke() and getClinicalData()
- Recording two-step sync (metadata + file upload)
- Annotation sync with parent session filtering
- Concurrent sync prevention via isSyncing mutex
- Error handling: transient retry vs permanent failure
- Retry backoff behavior

Run with: `npm test src/services/SyncService.test.ts`

## Configuration

### Default Settings

```typescript
syncIntervalMs: 60000     // 1 minute
maxRetries: 5             // Max retry attempts per entity
```

## Files

```
apps/mobile/src/
├── services/
│   ├── SyncService.ts              # Core service (middleware.invoke, retry, dependency ordering)
│   ├── SyncService.mappers.ts      # DTO interfaces + 6 mapper functions
│   ├── SyncService.types.ts        # SyncReport, SyncEntityReport interfaces
│   ├── SyncService.test.ts         # Unit tests (vitest)
│   ├── SyncService.README.md       # This file
│   ├── middleware.ts               # PRISM encrypted channel singleton
│   └── index.ts                    # Barrel export
├── context/
│   └── SessionContext.tsx           # endSession() triggers syncAll()
├── screens/
│   └── HistoryScreen.tsx            # Backend fetch, merge, sync badges
└── data/
    ├── repositories/
    │   ├── SessionRepository.ts     # getPending(), getClinicalData(), research columns
    │   ├── RecordingRepository.ts   # getPendingWithSyncedParent() (SQL JOIN)
    │   └── AnnotationRepository.ts  # getPending()
    ├── migrations/
    │   └── v2_add_research_columns.ts  # research_id, research_title columns
    └── database.ts                  # Migration registry
```

## References

- **Architecture**: `docs/ARCHITECTURE_MOBILE_INTEGRATION.md`
- **User Stories**: US-MI-001 through US-MI-020
- **Domain Models**: `packages/domain/src/models/`
- **Middleware**: `packages/middleware/src/service/ResearchNodeMiddleware.ts`
- **Backend Endpoints**: `docs/ARCHITECTURE_INTEGRATION_SURVEY.md`
