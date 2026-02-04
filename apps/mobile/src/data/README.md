# Local Data Persistence Layer

This module implements the local data persistence layer (US-028) for the IRIS Mobile app, providing SQLite-based storage for clinical session data, recordings, and annotations.

## Architecture

### Database Schema

The persistence layer uses SQLite with four main tables:

1. **clinical_sessions**: Research sessions with volunteers
2. **clinical_data**: Clinical context (body structure, laterality, topography)
3. **recordings**: sEMG data recordings
4. **annotations**: Session annotations

### Components

- **DatabaseManager** (`database.ts`): Singleton manager for database initialization and migrations
- **Repositories** (`repositories/`): Data access layer with CRUD operations
  - `SessionRepository`: Manage clinical sessions and clinical data
  - `RecordingRepository`: Manage sEMG recordings
  - `AnnotationRepository`: Manage session annotations

## Usage

### Initialize Database

Initialize the database before using repositories:

```typescript
import { databaseManager } from '@/data';

// In App.tsx or root component
useEffect(() => {
    const initDb = async () => {
        try {
            await databaseManager.initialize();
            console.log('Database initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    };

    initDb();
}, []);
```

### Create a Session

```typescript
import { SessionRepository } from '@/data/repositories';
import { SessionConfig } from '@iris/domain';

const sessionRepo = new SessionRepository();

const config: SessionConfig = {
    volunteerId: 'volunteer-123',
    volunteerName: 'John Doe',
    researcherId: 'researcher-456',
    deviceId: 'device-789',
    clinicalData: {
        bodyStructureSnomedCode: '12345',
        bodyStructureName: 'Biceps brachii',
        laterality: 'left',
        topographyCodes: ['T001', 'T002'],
        topographyNames: ['Upper arm', 'Anterior compartment']
    }
};

const session = await sessionRepo.create(config);
console.log('Created session:', session.id);
```

### Create a Recording

```typescript
import { RecordingRepository } from '@/data/repositories';

const recordingRepo = new RecordingRepository();

const recording = await recordingRepo.create({
    sessionId: session.id,
    filename: 'recording-001.csv',
    durationSeconds: 120,
    sampleCount: 25800,
    dataType: 'raw',
    sampleRate: 215,
    filePath: '/data/recordings/recording-001.csv'
});

console.log('Created recording:', recording.id);
```

### Create an Annotation

```typescript
import { AnnotationRepository } from '@/data/repositories';

const annotationRepo = new AnnotationRepository();

const annotation = await annotationRepo.create({
    sessionId: session.id,
    text: 'Patient reported mild discomfort at 30 seconds'
});

console.log('Created annotation:', annotation.id);
```

### Query Sessions

```typescript
// Get all sessions
const allSessions = await sessionRepo.getAll();

// Get sessions by researcher
const researcherSessions = await sessionRepo.getByResearcher('researcher-456', 0, 20);

// Search sessions
const searchResults = await sessionRepo.search('John');

// Get pending sessions (not synced)
const pendingSessions = await sessionRepo.getPending();

// Get active session
const activeSession = await sessionRepo.getActiveSession();
```

### Query Recordings

```typescript
// Get recordings for a session
const recordings = await recordingRepo.getBySession(session.id);

// Get pending recordings
const pendingRecordings = await recordingRepo.getPending();

// Mark as synced
await recordingRepo.markAsSynced(recording.id);
```

### Query Annotations

```typescript
// Get annotations for a session
const annotations = await annotationRepo.getBySession(session.id);

// Get pending annotations
const pendingAnnotations = await annotationRepo.getPending();
```

### End a Session

```typescript
// End session (sets ended_at and calculates duration)
await sessionRepo.endSession(session.id);
```

### Update Sync Status

```typescript
// Update session sync status
await sessionRepo.update(session.id, { syncStatus: 'synced' });

// Update recording sync status
await recordingRepo.update(recording.id, { syncStatus: 'failed' });

// Update annotation sync status
await annotationRepo.update(annotation.id, { syncStatus: 'synced' });
```

## Data Models

All models are defined in `@iris/domain`:

- `ClinicalSession`: Session metadata
- `ClinicalData`: Clinical context (body structure, laterality, topography)
- `Recording`: sEMG recording metadata
- `Annotation`: Session annotation
- `SyncStatus`: Synchronization state ('synced' | 'pending' | 'failed')
- `SessionConfig`: Configuration for creating a new session

## Database Migrations

Migrations are located in `migrations/` and are automatically applied when the database is initialized.

### Current Migrations

- **v1_initial**: Initial schema with clinical_sessions, clinical_data, recordings, and annotations tables

### Adding Migrations

1. Create a new migration file in `migrations/` (e.g., `v2_add_fields.ts`)
2. Export the SQL as a string constant
3. Add the migration to the `MIGRATIONS` array in `database.ts`

## Testing

### Reset Database (Development)

```typescript
import { databaseManager } from '@/data';

// WARNING: This deletes all data
await databaseManager.reset();
```

### Close Database

```typescript
await databaseManager.close();
```

## Type Safety

All repositories use TypeScript strict mode with no `any` types. Database rows are mapped from snake_case (SQLite) to camelCase (TypeScript) automatically.

## Performance

### Indexes

The following indexes are created for query optimization:

- `idx_sessions_researcher`: Researcher ID lookup
- `idx_sessions_sync`: Sync status filtering
- `idx_recordings_session`: Session recordings lookup
- `idx_annotations_session`: Session annotations lookup
- `idx_clinical_data_session`: Session clinical data lookup

### Pagination

Use pagination for large datasets:

```typescript
// Get page 2 (20 sessions per page)
const sessions = await sessionRepo.getByResearcher('researcher-456', 2, 20);
```

## Error Handling

All repository methods can throw errors. Always wrap in try-catch:

```typescript
try {
    const session = await sessionRepo.create(config);
} catch (error) {
    console.error('Failed to create session:', error);
    // Handle error
}
```

## Synchronization

The persistence layer uses a `SyncStatus` field to track synchronization state:

- `pending`: Not yet synced to backend
- `synced`: Successfully synced to backend
- `failed`: Sync attempt failed

Use the `getPending()` methods to retrieve items that need synchronization:

```typescript
const pendingSessions = await sessionRepo.getPending();
const pendingRecordings = await recordingRepo.getPending();
const pendingAnnotations = await annotationRepo.getPending();

// Sync each item to backend...
```

## Future Enhancements

- Background sync service
- Conflict resolution for offline edits
- Data export (CSV, JSON)
- Encryption at rest
- Backup and restore
