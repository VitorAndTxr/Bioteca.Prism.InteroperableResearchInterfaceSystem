# Sync Service

The Sync Service manages periodic synchronization of local data with the Research Node backend.

## Overview

The Sync Service is responsible for:
- Synchronizing pending clinical sessions, recordings, and annotations
- Handling retry logic for failed sync attempts
- Preventing concurrent sync operations
- Providing sync status reports

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Mobile App                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐                               │
│  │   SyncProvider   │ ◄─── Starts on authentication │
│  │   (Context)      │                               │
│  └────────┬─────────┘                               │
│           │                                          │
│  ┌────────▼─────────┐                               │
│  │   SyncService    │ ◄─── Periodic sync (60s)     │
│  └────────┬─────────┘                               │
│           │                                          │
│  ┌────────▼──────────────────────────┐             │
│  │  SessionRepository                │             │
│  │  RecordingRepository              │             │
│  │  AnnotationRepository             │             │
│  └────────┬──────────────────────────┘             │
│           │                                          │
│  ┌────────▼─────────┐                               │
│  │   SQLite DB      │                               │
│  │  (sync_status)   │                               │
│  └──────────────────┘                               │
│                                                      │
└──────────────────────────────────────────────────────┘
           │
           │ HTTPS (TODO: Implement)
           │
┌──────────▼──────────────────────────────────────────┐
│         Research Node Backend                        │
│  /api/clinicalsession/new                           │
│  /api/recording/upload                              │
│  /api/annotation/new                                │
└─────────────────────────────────────────────────────┘
```

## Components

### SyncService

Core service class that manages sync operations.

**Constructor**:
```typescript
constructor(
    sessionRepo: SessionRepository,
    recordingRepo: RecordingRepository,
    annotationRepo: AnnotationRepository,
    maxRetries?: number // Default: 5
)
```

**Methods**:
- `start(intervalMs?: number)` - Start periodic sync (default: 60000ms)
- `stop()` - Stop periodic sync
- `isRunning()` - Check if sync is running
- `syncAll()` - Manually trigger sync for all entity types

### SyncProvider

React Context provider that manages sync service lifecycle.

**Props**:
```typescript
interface SyncProviderProps {
    children: ReactNode;
    syncIntervalMs?: number;  // Default: 60000 (1 minute)
    maxRetries?: number;       // Default: 5
    enabled?: boolean;         // Default: true
}
```

**Behavior**:
- Automatically starts sync when user is authenticated
- Automatically stops sync when user logs out
- Prevents sync when disabled via `enabled` prop

### useSyncContext Hook

Access sync status and trigger manual syncs.

**Returns**:
```typescript
interface SyncContextValue {
    syncReport: SyncReport | null;
    syncNow: () => Promise<SyncReport>;
    isRunning: boolean;
    isSyncing: boolean;
}
```

## Usage

### Basic Setup

The SyncProvider is already integrated in `App.tsx`:

```typescript
<BluetoothContextProvider>
  <AuthProvider>
    <SessionProvider>
      <SyncProvider syncIntervalMs={60000} maxRetries={5}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SyncProvider>
    </SessionProvider>
  </AuthProvider>
</BluetoothContextProvider>
```

### Using in Components

```typescript
import { useSyncContext } from '@/context/SyncContext';

function SettingsScreen() {
  const { syncReport, syncNow, isRunning, isSyncing } = useSyncContext();

  const handleManualSync = async () => {
    try {
      const report = await syncNow();
      Alert.alert('Sync Complete',
        `Sessions: ${report.sessions.synced} synced\n` +
        `Recordings: ${report.recordings.synced} synced\n` +
        `Annotations: ${report.annotations.synced} synced`
      );
    } catch (error) {
      Alert.alert('Sync Failed', error.message);
    }
  };

  return (
    <View>
      <Text>Sync Status: {isRunning ? 'Running' : 'Stopped'}</Text>

      {syncReport && (
        <View>
          <Text>Last sync: {new Date(syncReport.timestamp).toLocaleString()}</Text>
          <Text>Sessions synced: {syncReport.sessions.synced}</Text>
          <Text>Recordings synced: {syncReport.recordings.synced}</Text>
          <Text>Annotations synced: {syncReport.annotations.synced}</Text>
        </View>
      )}

      <Button
        title={isSyncing ? 'Syncing...' : 'Sync Now'}
        onPress={handleManualSync}
        disabled={isSyncing}
      />
    </View>
  );
}
```

### Alternative: useSyncStatus Hook

```typescript
import { useSyncStatus } from '@/hooks/useSyncStatus';

function DataScreen() {
  const { syncReport, syncNow, isRunning } = useSyncStatus();

  // Use sync status...
}
```

## Sync Status Tracking

Each entity (session, recording, annotation) has a `syncStatus` field:
- `'pending'` - Not yet synced
- `'synced'` - Successfully synced to backend
- `'failed'` - Permanently failed after max retries

## Sync Report

The sync report provides details about each sync cycle:

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
}
```

## Current Implementation Status

### ✅ Complete
- SyncService core logic
- Periodic sync scheduler
- Concurrent sync prevention
- Repository integration
- Context provider
- Authentication-based lifecycle

### 🚧 TODO: Backend Integration
- Replace mock sync with actual middleware calls
- Implement retry count tracking (currently all errors treated as transient)
- Add error classification (transient vs permanent)
- Implement max retry logic (mark as 'failed' after N attempts)

### Mock Implementation

Current implementation uses mock network calls:

```typescript
// Current (mock)
await this.simulateNetworkDelay();
await this.sessionRepo.update(session.id, { syncStatus: 'synced' });

// Future (real)
await middleware.invoke({
    method: 'POST',
    path: '/api/clinicalsession/new',
    payload: session
});
await this.sessionRepo.update(session.id, { syncStatus: 'synced' });
```

## Backend Endpoints (To Be Implemented)

### Session Sync
```
POST /api/clinicalsession/new
Body: ClinicalSession + ClinicalData
```

### Recording Sync
```
POST /api/recording/upload
Body: Recording (with file reference)
```

### Annotation Sync
```
POST /api/annotation/new
Body: Annotation
```

## Error Handling

### Transient Errors
Network failures, timeouts, rate limits → Keep as `'pending'`, retry later

### Permanent Errors
Validation failures, authorization denied → Mark as `'failed'` after max retries

### Future Enhancement
```typescript
interface SyncMetadata {
    retryCount: number;
    lastAttempt: string;
    lastError?: string;
}

// Store in SQLite for each entity
```

## Performance Considerations

- **Concurrent Sync Prevention**: `isSyncing` flag prevents overlapping sync cycles
- **Batch Processing**: All pending items synced in a single cycle
- **Background Execution**: Sync runs on interval without blocking UI
- **Incremental Sync**: Only pending items are processed

## Testing

### Manual Testing

1. Create sessions/recordings/annotations in the app
2. Check database to confirm `sync_status = 'pending'`
3. Wait for sync cycle (60s) or trigger manual sync
4. Verify `sync_status` updated to `'synced'`
5. Check sync report for accurate counts

### Test Scenarios

- ✅ Sync starts on authentication
- ✅ Sync stops on logout
- ✅ Concurrent sync prevented
- ✅ Manual sync trigger works
- ✅ Sync report accurate
- ⏳ Network error handling (requires backend)
- ⏳ Retry logic (requires backend)
- ⏳ Max retry enforcement (requires backend)

## Configuration

### Default Settings

```typescript
syncIntervalMs: 60000     // 1 minute
maxRetries: 5             // Max retry attempts
enabled: true             // Sync enabled by default
```

### Customization

```typescript
<SyncProvider
  syncIntervalMs={30000}  // 30 seconds
  maxRetries={3}          // Max 3 retries
  enabled={true}          // Enable/disable sync
>
  {children}
</SyncProvider>
```

## Files

```
apps/mobile/src/
├── services/
│   ├── SyncService.ts              # Core service implementation
│   ├── SyncService.types.ts        # TypeScript types
│   ├── SyncService.README.md       # This file
│   └── index.ts                    # Barrel export
├── context/
│   └── SyncContext.tsx             # React Context provider
├── hooks/
│   └── useSyncStatus.ts            # Convenience hook
└── data/repositories/
    ├── SessionRepository.ts        # getPending() method
    ├── RecordingRepository.ts      # getPending() method
    └── AnnotationRepository.ts     # getPending() method
```

## References

- **US-025**: Data Synchronization user story
- **Domain Models**: `packages/domain/src/models/`
- **Middleware**: `packages/middleware/src/service/ResearchNodeMiddleware.ts`
- **Repositories**: `apps/mobile/src/data/repositories/`
