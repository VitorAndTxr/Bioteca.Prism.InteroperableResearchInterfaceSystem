# Local Data Persistence - Quick Reference

## Setup

```typescript
import { databaseManager } from '@/data';

// Initialize once in App.tsx
await databaseManager.initialize();
```

## Create Session

```typescript
import { SessionRepository } from '@/data/repositories';

const repo = new SessionRepository();

const session = await repo.create({
    volunteerId: 'vol-123',
    volunteerName: 'John Doe',
    researcherId: 'res-456',
    deviceId: 'dev-789',
    clinicalData: {
        bodyStructureSnomedCode: '76505004',
        bodyStructureName: 'Biceps brachii',
        laterality: 'left',
        topographyCodes: ['40983000'],
        topographyNames: ['Upper arm']
    }
});
```

## Create Recording

```typescript
import { RecordingRepository } from '@/data/repositories';

const repo = new RecordingRepository();

const recording = await repo.create({
    sessionId: session.id,
    filename: 'emg-001.csv',
    durationSeconds: 120,
    sampleCount: 25800,
    dataType: 'raw',
    sampleRate: 215,
    filePath: '/data/recordings/emg-001.csv'
});
```

## Create Annotation

```typescript
import { AnnotationRepository } from '@/data/repositories';

const repo = new AnnotationRepository();

const annotation = await repo.create({
    sessionId: session.id,
    text: 'Patient reported discomfort'
});
```

## Query Operations

```typescript
const sessionRepo = new SessionRepository();

// Get by ID
const session = await sessionRepo.getById('session-id');

// Get all
const allSessions = await sessionRepo.getAll();

// Get by researcher (paginated)
const page1 = await sessionRepo.getByResearcher('res-123', 0, 20);

// Search
const results = await sessionRepo.search('John');

// Get pending (not synced)
const pending = await sessionRepo.getPending();

// Get active session
const active = await sessionRepo.getActiveSession();
```

## Update Operations

```typescript
const sessionRepo = new SessionRepository();

// Update fields
await sessionRepo.update(sessionId, {
    volunteerName: 'Updated Name',
    syncStatus: 'synced'
});

// End session
await sessionRepo.endSession(sessionId);
```

## Sync Status

```typescript
// Mark as synced
await recordingRepo.markAsSynced(recordingId);

// Mark as failed
await recordingRepo.markAsFailed(recordingId);

// Update manually
await sessionRepo.update(sessionId, { syncStatus: 'synced' });
```

## Delete Operations

```typescript
const sessionRepo = new SessionRepository();

// Delete session (cascades to recordings, annotations, clinical data)
await sessionRepo.delete(sessionId);

// Delete recording
await recordingRepo.delete(recordingId);

// Delete annotation
await annotationRepo.delete(annotationId);
```

## Data Models

```typescript
import {
    ClinicalSession,
    ClinicalData,
    Recording,
    Annotation,
    SessionConfig,
    SyncStatus,
    Laterality,
    DataType
} from '@iris/domain';

// Types
type SyncStatus = 'synced' | 'pending' | 'failed';
type Laterality = 'left' | 'right' | 'bilateral';
type DataType = 'raw' | 'filtered' | 'rms';
```

## Common Workflows

### Complete Session

```typescript
const sessionRepo = new SessionRepository();
const recordingRepo = new RecordingRepository();

// Create session
const session = await sessionRepo.create(config);

// Add recording
const recording = await recordingRepo.create({
    sessionId: session.id,
    filename: 'recording.csv',
    durationSeconds: 120,
    sampleCount: 25800,
    dataType: 'raw',
    sampleRate: 215
});

// End session
await sessionRepo.endSession(session.id);
```

### Sync to Backend

```typescript
const pendingSessions = await sessionRepo.getPending();

for (const session of pendingSessions) {
    try {
        // Sync to backend
        await backendAPI.syncSession(session);

        // Mark as synced
        await sessionRepo.update(session.id, { syncStatus: 'synced' });
    } catch (error) {
        // Mark as failed
        await sessionRepo.update(session.id, { syncStatus: 'failed' });
    }
}
```

### Search and Filter

```typescript
// By volunteer name
const johnSessions = await sessionRepo.search('John');

// By date
const todaySessions = await sessionRepo.search('2026-02-02');

// By researcher
const researcherSessions = await sessionRepo.getByResearcher('res-123', 0, 20);
```

## Error Handling

```typescript
try {
    const session = await sessionRepo.create(config);
} catch (error) {
    console.error('Failed to create session:', error);
    // Handle error
}
```

## Performance

### Indexes
Optimized queries for:
- Researcher ID lookup
- Sync status filtering
- Session relationships (recordings, annotations, clinical data)

### Pagination
```typescript
// Page 0 (first 20)
const page1 = await sessionRepo.getByResearcher('res-123', 0, 20);

// Page 1 (next 20)
const page2 = await sessionRepo.getByResearcher('res-123', 1, 20);
```

## Development Tools

### Reset Database
```typescript
// WARNING: Deletes all data
await databaseManager.reset();
```

### Close Database
```typescript
await databaseManager.close();
```

## File Locations

- **Database**: `iris_clinical.db` (app data directory)
- **Code**: `apps/mobile/src/data/`
- **Models**: `packages/domain/src/models/`
- **Docs**: `apps/mobile/src/data/README.md`
- **Examples**: `apps/mobile/src/data/example-usage.ts`
