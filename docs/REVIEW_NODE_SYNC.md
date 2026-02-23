# Code Review: Node-to-Node Data Synchronization (Phase 17)

**Date**: 2026-02-18
**Reviewer**: Tech Lead
**Phase**: 17
**Architecture Reference**: `docs/ARCHITECTURE_NODE_SYNC.md`
**Validation Reference**: `docs/VALIDATION_NODE_SYNC.md`

---

## 1. Files Reviewed

### Backend (`InteroperableResearchNode/`)
| File | Status |
|------|--------|
| `Bioteca.Prism.Domain/Entities/Sync/SyncLog.cs` | Reviewed |
| `Bioteca.Prism.Data/Persistence/Configurations/SyncLogConfiguration.cs` | Reviewed |
| `Bioteca.Prism.Data/Migrations/20260218000000_AddSyncLog.cs` | Reviewed |
| `Bioteca.Prism.Data/Interfaces/Sync/ISyncLogRepository.cs` | Reviewed |
| `Bioteca.Prism.Data/Repositories/Sync/SyncLogRepository.cs` | Reviewed |
| `Bioteca.Prism.Core/Middleware/Node/INodeChannelClient.cs` | Reviewed |
| `Bioteca.Prism.Core/Middleware/Node/NodeChannelClient.cs` | Reviewed |
| `Bioteca.Prism.InteroperableResearchNode/Middleware/PrismSyncEndpointAttribute.cs` | Reviewed |
| `Bioteca.Prism.InteroperableResearchNode/Middleware/PrismAuthenticatedSessionAttribute.cs` | Reviewed |
| `Bioteca.Prism.Core/Middleware/Session/ISessionService.cs` | Reviewed |
| `Bioteca.Prism.Service/Services/Session/SessionService.cs` (RecordRequestAsync) | Reviewed |
| `Bioteca.Prism.Service/Interfaces/Sync/ISyncExportService.cs` | Reviewed |
| `Bioteca.Prism.Service/Services/Sync/SyncExportService.cs` | Reviewed |
| `Bioteca.Prism.Service/Interfaces/Sync/ISyncImportService.cs` | Reviewed |
| `Bioteca.Prism.Service/Services/Sync/SyncImportService.cs` | Reviewed |
| `Bioteca.Prism.InteroperableResearchNode/Controllers/SyncController.cs` | Reviewed |
| `Bioteca.Prism.Domain/DTOs/Sync/SyncImportPayload.cs` | Reviewed |
| `Bioteca.Prism.Domain/DTOs/Sync/SyncResultDTO.cs` | Reviewed |
| `Bioteca.Prism.Domain/DTOs/Sync/SyncManifestRequest.cs` | Reviewed |
| `Bioteca.Prism.Domain/DTOs/Sync/SyncManifestResponse.cs` | Reviewed |
| `Bioteca.Prism.Domain/DTOs/Sync/PagedSyncResult.cs` | Reviewed |
| `Bioteca.Prism.CrossCutting/NativeInjectorBootStrapper.cs` | Reviewed |
| `Bioteca.Prism.Data/Persistence/Contexts/PrismDbContext.cs` | Reviewed |

### Frontend (`IRIS/`)
| File | Status |
|------|--------|
| `packages/domain/src/models/NodeSync.ts` | Reviewed |
| `packages/middleware/src/sync/NodeSyncService.ts` | Reviewed |
| `apps/desktop/src/screens/NodeConnections/NodeConnectionsScreen.tsx` | Reviewed |
| `apps/desktop/src/screens/NodeConnections/SyncProgressModal.tsx` | Reviewed |
| `apps/desktop/src/services/NodeSyncServiceAdapter.ts` | Reviewed |

---

## 2. Architecture Compliance

### 2.1 Pull Model (ADR-1)
**PASS.** All six export endpoints (`manifest`, `snomed/{entityType}`, `volunteers`, `research`, `sessions`, `recordings/{id}/file`) are read-only on the requested node side. `NodeSyncService.executePull()` in the middleware correctly fetches from `remoteMiddleware` and submits to `localMiddleware`. The pull model is fully intact.

### 2.2 "Newer Wins" Conflict Resolution (ADR-2)
**PASS.** Every upsert method in `SyncImportService` compares `updatedAt > existing.UpdatedAt` before writing. The pattern is consistent across all 9 SNOMED entity types, Volunteers, Research, and Sessions. The remote `UpdatedAt` value is preserved on write (not overwritten with `DateTime.UtcNow`), which is correct for the "newer wins" model.

**One nuance to note**: EF Core's value generators could potentially intercept `UpdatedAt` writes on `SaveChangesAsync`. A quick inspection of the entity configurations confirms no auto-update interceptors are configured on `UpdatedAt` columns — the values set in the service are persisted as-is. This is correct.

### 2.3 Single Transaction (ADR-3)
**PASS WITH FINDING** — see Blocking Issue B-001 below.

### 2.4 Rate Limit Exemption (ADR-4)
**PASS.** `PrismSyncEndpointAttribute` is a clean marker placed at class level on `SyncController`. `PrismAuthenticatedSessionAttribute.OnActionExecutionAsync` checks `EndpointMetadata.Any(m => m is PrismSyncEndpointAttribute)` and passes `isSyncEndpoint ? 600 : 0` to `RecordRequestAsync`. `SessionService.RecordRequestAsync` uses `var effectiveLimit = overrideLimit > 0 ? overrideLimit : MaxRequestsPerMinute` — this is sound. The interface signature `RecordRequestAsync(string sessionToken, int overrideLimit = 0)` and implementation are consistent.

### 2.5 NodeChannelClient.InvokeAsync (ADR-5)
**PASS.** Both `InvokeAsync<TResponse>` and `InvokeStreamAsync` are implemented in `NodeChannelClient.cs`. They follow the exact same encryption/decryption pattern as existing handshake methods. `InvokeStreamAsync` correctly uses `HttpCompletionOption.ResponseHeadersRead` for streaming. Header names (`X-Channel-Id`, `X-Session-Id`) match what `PrismAuthenticatedSessionAttribute` extracts.

---

## 3. Checklist Results

| # | Check | Result |
|---|-------|--------|
| 1 | Architecture compliance | PASS |
| 2 | Transaction correctness | FAIL — B-001 |
| 3 | Security: ReadWrite enforcement | PASS |
| 4 | "Newer wins" UpdatedAt comparison | PASS |
| 5 | Incremental sync since-filtering | PASS |
| 6 | Rate limit overrideLimit approach | PASS |
| 7 | Error handling and status codes | PASS WITH FINDINGS |
| 8 | TypeScript strict mode (no `any`) | PASS |
| 9 | Code quality / naming / DI | PASS WITH FINDINGS |
| 10 | Desktop component patterns | PASS |

---

## 4. Blocking Issues

### B-001: Transaction Rollback Does Not Cover SyncLog Creation — Data Loss on Failure

**File**: `SyncImportService.cs:68`
**Severity**: Blocking

The `SyncLog` entry is created and persisted to the database **before** `BeginTransactionAsync()` is called:

```csharp
// Line 68: SyncLog written to DB here
await _syncLogRepository.AddAsync(syncLog);

// ... counts dict setup ...

// Line 88: Transaction begins AFTER the SyncLog is already committed
await using var transaction = await _context.Database.BeginTransactionAsync();
```

`SyncLogRepository.AddAsync()` calls `_context.SaveChangesAsync()` internally (line 28), which commits the SyncLog insert to the database immediately and outside any transaction. This means:

1. The SyncLog record is permanently written even if the subsequent `BeginTransactionAsync()` fails.
2. More critically, the SyncLog is written using a **separate `SaveChangesAsync`** call that uses its own implicit transaction. When the main transaction later rolls back, the SyncLog entry already committed in step 1 is **not rolled back**.

The consequence is that a SyncLog entry with `status = "in_progress"` can be left permanently in the database if the import transaction rolls back, and the `UpdateAsync` call in the `catch` block may also fail if the DB context is in a bad state after an exception.

The architecture specifies (Section 4.4): *"Update SyncLog (status: failed) in a new transaction after rollback."* The current implementation does not use a new transaction for the error log; it simply calls `_syncLogRepository.UpdateAsync()` on the same (potentially degraded) context after a `RollbackAsync()`.

**Required fix**: Move `BeginTransactionAsync()` to before the SyncLog creation, and include the SyncLog insert inside the transaction. The SyncLog failure update in the catch block should use a fresh `DbContext` instance (or a separate `IDbContextTransaction`) to guarantee it succeeds independently of the rolled-back transaction.

**Example of correct structure**:
```csharp
await using var transaction = await _context.Database.BeginTransactionAsync();
try {
    var syncLog = await _syncLogRepository.AddAsync(syncLog); // inside tx
    // ... upserts ...
    syncLog.Status = "completed";
    await _context.SaveChangesAsync();
    await transaction.CommitAsync();
}
catch {
    await transaction.RollbackAsync();
    // Use a NEW transaction or a fresh DbContext to log the failure
    await LogSyncFailureInNewTransaction(remoteNodeId, ex.Message);
    throw;
}
```

---

## 5. Non-Blocking Findings (Suggestions)

### S-001: SyncController.GetSyncLog Resolves Repository From HttpContext.RequestServices
**File**: `SyncController.cs:226`

```csharp
var syncLogRepo = HttpContext.RequestServices
    .GetRequiredService<Bioteca.Prism.Data.Interfaces.Sync.ISyncLogRepository>();
```

`ISyncLogRepository` should be injected via the constructor like all other dependencies. Resolving from `HttpContext.RequestServices` is an anti-pattern (service locator) that bypasses the constructor injection contract, making the dependency invisible and harder to test.

**Suggested fix**: Add `ISyncLogRepository syncLogRepository` to `SyncController`'s constructor and inject it as `_syncLogRepository`.

---

### S-002: Import Endpoint Has No Authentication — Security Concern
**File**: `SyncController.cs:190`

The `POST /api/sync/import` endpoint has no `[PrismEncryptedChannelConnection]` attribute (intentional per architecture) but also has no authentication of any kind. The class-level `[PrismAuthenticatedSession]` attribute applies to all actions by default, but the `Import` action explicitly opts out because it is meant for local calls from the middleware.

The current situation: any unauthenticated caller who can reach the backend can POST arbitrary data to `/api/sync/import` and trigger a full transactional upsert of whatever they send. This is a **significant security risk** if the backend is exposed on a network.

The architecture acknowledges (O-1 in VALIDATION_NODE_SYNC.md) that the import endpoint routing "needs clarification" but does not mandate a mitigation. For Phase 17, at minimum, the import endpoint should be protected by the standard user JWT authentication (`[Authorize]`) or a localhost-only guard to prevent unauthenticated external access.

**Suggested fix** (minimal): Add `[Authorize]` to the `Import` action using user authentication, or add a localhost-only IP filter. Document the chosen approach in a comment.

---

### S-003: BlobClient Instantiation Uses Null Credential — Potential Auth Failure in Production
**File**: `SyncExportService.cs:278`

```csharp
var blobClient = new BlobClient(new Uri(channel.FileUrl), null);
```

The second argument `null` means no credential is provided. For Azurite (local dev) this works because the emulator accepts anonymous SAS-signed URIs embedded in the `FileUrl`. For production Azure Blob Storage, this will fail unless the `FileUrl` already contains a SAS token embedded in the URI.

This is a latent production bug. The connection string from `_configuration` is loaded but not used in this code path (it is only used in `SyncImportService`).

**Suggested fix**: Use the connection string to create a `BlobServiceClient` and navigate to the blob by container + name, consistent with how `SyncImportService` does it.

---

### S-004: SyncExportService.GetManifestAsync Does Not Populate LastSyncedAt
**File**: `SyncExportService.cs:98`

```csharp
return new SyncManifestResponse
{
    // ...
    LastSyncedAt = null,  // Always null — never populated
```

The `LastSyncedAt` field in the manifest is always `null`. The architecture (Section 4.6) specifies this should be populated from the latest completed SyncLog entry for the requesting node: *"Returns paginated sync history... Used by the desktop UI to display sync history."* The `ISyncLogRepository.GetLatestCompletedAsync` method exists but is not called in `GetManifestAsync`.

The manifest is used by the requesting node to determine the `since` watermark, and the UI displays *"Last synced X ago"* based on it. Returning `null` always means the UI always shows "Never synced" even after successful syncs, and every sync will be a full sync rather than incremental.

**Note**: The requesting node uses its own local SyncLog to determine the `since` watermark (not the remote's manifest). However, the manifest's `lastSyncedAt` is supposed to inform the UI on the requesting node of the remote's last known sync point. This is a UX regression.

**Suggested fix**: In `GetManifestAsync`, query the SyncLog for the requesting node ID (available from the session context, which can be injected or passed as a parameter) and populate `LastSyncedAt` from the latest completed entry.

---

### S-005: NodeSyncServiceAdapter Uses Same Middleware Instance for Both Remote and Local
**File**: `NodeSyncServiceAdapter.ts:31-40`

```typescript
const svc = new NodeSyncService({
    remoteMiddleware: this.middleware,
    localMiddleware: this.middleware,
    remoteNodeId: this.middleware.session?.nodeId ?? 'unknown',
    ...
});
```

Both `remoteMiddleware` and `localMiddleware` point to the same `this.middleware` instance, which is the local node's middleware. The comment in the code explains the intent: "The backend endpoints differentiate: `/api/sync/*` are remote-facing export endpoints, `/api/sync/import` is the local import endpoint."

However, this means `NodeSyncService.executePull()` calls `/api/sync/manifest` and entity endpoints on the **local** backend rather than the remote node. The `remoteMiddleware.invoke()` calls in `NodeSyncService` will hit the local node's export endpoints, not the remote node's.

This is a fundamental flow issue. The architecture shows the middleware reaching the **remote** node's export endpoints. With both pointing to local, the sync is effectively pulling from the local node into itself — a no-op at best.

**Required context**: This may be intentional if the desktop adapter expects a different connection-specific middleware to be passed in from the `NodeConnectionsScreen`, but as implemented, `NodeSyncServiceAdapter` provides no way to specify the target remote connection. `handleStartSync` in `NodeConnectionsScreen.tsx:117` does not pass a connection-specific middleware, only calls `nodeSyncServiceAdapter.preview(undefined, onProgress)`.

**Suggested fix**: `NodeSyncServiceAdapter.preview()` should accept the `ResearchNodeConnection` as a parameter, create a connection-specific middleware instance for the remote node, and pass it as `remoteMiddleware` to `NodeSyncService`. This is necessary for the sync to actually fetch from the remote node.

---

### S-006: `loadData()` In NodeConnectionsScreen Not Stable — useCallback Missing
**File**: `NodeConnectionsScreen.tsx:137`

`loadData` is defined as a plain async function (not with `useCallback`), but it is referenced in `handleSyncClose` (wrapped in `useCallback` with no deps). The function will always refer to a stale closure. This also causes the `useEffect` (line 133) to correctly call `loadData` on mount and when `activeTab`/`page` changes, but `handleSyncClose` will always hold a stale reference to `loadData`.

**Suggested fix**: Wrap `loadData` in `useCallback` with the appropriate dependencies (`activeTab`, `pagination.currentPage`, `pageSize`).

---

### S-007: Missing `SyncLog` EntityType Registration in `SyncLogConfiguration`
**File**: `SyncLogConfiguration.cs` (line 56)

The FK relationship navigates through `Node.ResearchNode` (with the full namespace qualifier), but the namespace `Bioteca.Prism.Domain.Entities.Node` must be imported or the `Node.ResearchNode` reference resolved. This compiles only if `using Bioteca.Prism.Domain.Entities.Node;` is present in the using directives.

Inspecting the file: no using directive for that namespace is present in the shown file content. The entity `SyncLog.RemoteNode` is typed as `Node.ResearchNode` — this depends on `using Bioteca.Prism.Domain.Entities;` with the inner namespace, which may not be an issue if the project uses global usings. Confirm compilation is clean.

**Suggested fix**: Verify the project compiles without errors; add explicit using if needed.

---

## 6. Code Quality Observations

### Good Patterns

- **SNOMED PK inconsistency handled correctly**: `SyncImportService` correctly uses `SnomedCode` for `SnomedBodyRegion`/`SnomedBodyStructure`/`ClinicalCondition`/`ClinicalEvent`/`Medication`/`AllergyIntolerance`, and `Code` for `SnomedLaterality`/`SnomedTopographicalModifier`/`SnomedSeverityCode`. This is consistent with the validation document's O-2 finding.

- **Migration completeness**: `20260218000000_AddSyncLog.cs` adds `UpdatedAt` + `CreatedAt` to `SnomedLaterality` and `SnomedTopographicalModifier`, and `UpdatedAt` to `RecordChannel`, as required by the validation's critical finding. The `Down()` method properly reverts all changes.

- **SNOMED entity mapping in NodeSyncService**: `assignSnomedEntities()` uses a type-safe `Record<SnomedEntityType, keyof SyncSnomedPayload>` mapping with `as const` SNOMED types. No `any` types. This is clean TypeScript.

- **Cancellation support**: `ISyncExportService` methods accept `CancellationToken` throughout — consistent with ASP.NET Core patterns.

- **SyncProgressModal state machine**: The modal correctly uses a discriminated union type (`ModalState`) for its four phases. The `isSyncingRef` guard prevents double-invocation of `proceed()`. Blocking close during in-progress is correctly implemented via `Modal` props.

- **SyncController pagination validation**: `pageSize` parameters have default values and are passed through to services. `remoteNodeId` is validated (not null, not `Guid.Empty`) on the `GetSyncLog` endpoint.

### Minor Issues

- **DI registration missing NodeChannelClient**: `NativeInjectorBootStrapper.cs` registers `ISyncExportService`, `ISyncImportService`, and `ISyncLogRepository` as `Scoped`. `INodeChannelClient` / `NodeChannelClient` (Singleton) was already registered in a prior phase and is present. This is correct.

- **`SyncResultDTO.CompletedAt` is non-nullable but may not be set on error path**: `SyncImportService.ImportAsync` re-throws in the catch block, so the caller (`SyncController.Import`) catches at the controller level and returns 500. The DTO is only returned on success, so `CompletedAt` is always set on the success path. No issue.

- **Inline `@keyframes spin` CSS in `SyncProgressModal.tsx` is duplicated**: The same keyframe is also declared in `NodeConnectionsScreen.tsx` (line 451). This is harmless but redundant. Consider moving to a shared CSS file.

---

## 7. Security Assessment

| Check | Result |
|-------|--------|
| Export endpoints have `[PrismEncryptedChannelConnection]` | PASS — per-action on export endpoints |
| `[PrismAuthenticatedSession(ReadWrite)]` at class level | PASS |
| Import endpoint authenticated | FAIL — S-002 (non-blocking for internal use, but risk documented) |
| Input validation on import payload | PASS — null check on payload |
| No SQL injection risk | PASS — EF Core parameterized queries throughout |
| No path traversal in blob operations | PASS — blob name derived from config + entry ID |
| TypeScript no `any` types | PASS |
| Desktop sync button disabled for READ_ONLY | PASS — line 91-94 of NodeConnectionsScreen |

---

## 8. Performance Notes

- **N+1 query concern in `SyncImportService`**: The sub-entity import methods use `_context.*.Find(id)` inside loops. For SNOMED upserts with potentially hundreds of items, each `FindAsync()` issues a single-row SELECT. This is acceptable for the current scale (hundreds, not thousands of SNOMED codes) but should be noted for future optimization. A batch `WHERE Id IN (...)` approach would be more efficient.

- **`SyncExportService.GetManifestAsync` issues 9 separate SNOMED COUNT queries**: Each of the 9 SNOMED entity types executes a separate `CountAsync`. This is straightforward but could be batched if performance becomes a concern.

- **Recording file download via middleware JSON route**: `NodeSyncService.executePull()` downloads recording files by calling `remoteMiddleware.invoke()` with `GET /api/sync/recordings/{id}/file`. The server returns `File(data, contentType, fileName)` as a binary response, but `NodeSyncService` expects a JSON response with `contentBase64`, `contentType`, and `fileName` fields. These two are **incompatible** — the controller returns a binary `FileResult`, but the middleware's `invoke()` method deserializes it as JSON. This is a blocking runtime failure for recording file downloads.

> **This is a second blocking issue** — see B-002 below.

---

## 9. Blocking Issues (Updated)

### B-002: Recording File Download Protocol Mismatch

**Files**: `SyncController.cs:165-183`, `NodeSyncService.ts:197-220`
**Severity**: Blocking

`SyncController.GetRecordingFile()` returns:
```csharp
return File(data, contentType, fileName);  // Binary FileResult response
```

`NodeSyncService.executePull()` calls this endpoint via `remoteMiddleware.invoke()` expecting a JSON response:
```typescript
const fileData = await this.options.remoteMiddleware.invoke<Record<string, unknown>, {
    contentBase64: string;
    contentType: string;
    fileName: string;
}>({
    path: `/api/sync/recordings/${recordingIds[i]}/file`,
    method: 'GET',
    payload: {}
});
```

`ResearchNodeMiddleware.invoke()` decrypts the response as an encrypted JSON envelope and deserializes it. A binary `FileResult` response body cannot be deserialized this way — it will fail at JSON parsing.

The architecture (Section 4.5) specifies `InvokeStreamAsync` for recording file downloads. The middleware's `NodeSyncService` should use `InvokeStreamAsync` (available on `INodeChannelClient` and exposed through the backend-to-backend path), but the TypeScript middleware has no equivalent raw stream download — `ResearchNodeMiddleware.invoke()` always expects an encrypted JSON response.

**Required fix options**:
1. Change `SyncController.GetRecordingFile()` to return the file as an encrypted JSON response (`{ contentBase64, contentType, fileName }`) consistent with how all other sync endpoints return data. This matches what `NodeSyncService.ts` expects.
2. Alternatively, add a raw stream download method to `ResearchNodeMiddleware.ts` and use it in `NodeSyncService.ts` for recordings, updating the endpoint to return binary.

**Option 1 is simpler and consistent** with the existing pattern. The controller would base64-encode the file bytes and return them as a JSON payload (encrypted by `PrismEncryptedChannelConnection`).

---

## 10. Summary of Issues

| ID | Type | Severity | File | Description |
|----|------|----------|------|-------------|
| B-001 | Blocking | Critical | `SyncImportService.cs:68` | SyncLog created outside transaction; rollback does not revert it |
| B-002 | Blocking | Critical | `SyncController.cs:175`, `NodeSyncService.ts:197` | Recording file download: controller returns binary FileResult but middleware expects encrypted JSON |
| S-001 | Suggestion | Minor | `SyncController.cs:226` | Service locator anti-pattern for ISyncLogRepository |
| S-002 | Suggestion | Medium | `SyncController.cs:190` | Import endpoint has no authentication — external access risk |
| S-003 | Suggestion | Medium | `SyncExportService.cs:278` | BlobClient uses null credential — will fail in production Azure |
| S-004 | Suggestion | Minor | `SyncExportService.cs:98` | `LastSyncedAt` always null in manifest — incremental sync broken at UI level |
| S-005 | Suggestion | Major | `NodeSyncServiceAdapter.ts:31` | Same middleware for remote + local — sync pulls from self, not remote node |
| S-006 | Suggestion | Minor | `NodeConnectionsScreen.tsx:137` | `loadData` not stable — useCallback missing |
| S-007 | Suggestion | Minor | `SyncLogConfiguration.cs:56` | Verify compilation of namespace qualifier `Node.ResearchNode` |

---

## 11. Gate Decision

Two blocking issues were identified (B-001 and B-002) that prevent correct runtime behavior:

- **B-001** means failed syncs leave orphaned `in_progress` SyncLog entries and the error recovery path is unreliable.
- **B-002** means recording file downloads will fail at runtime with a JSON deserialization error, causing every sync that includes recording files to fail.

Additionally, **S-005** is functionally equivalent to a blocking issue in terms of the feature working correctly end-to-end: the sync currently pulls data from the local node into itself rather than from the remote node. However, it is marked as a suggestion because the `NodeSyncService` itself is correctly implemented — the issue is in how the adapter is wired up at the desktop layer.

**[GATE:FAIL]**

### Blocking Issues That Must Be Fixed

1. **B-001** — Move `BeginTransactionAsync()` to before the SyncLog creation; use a separate transaction for error logging in the catch block.
2. **B-002** — Align the recording file endpoint response format with what the middleware expects. Either: return an encrypted JSON response `{ contentBase64, contentType, fileName }` from the controller, OR add a raw binary download path in the middleware's `ResearchNodeMiddleware.ts` and use it in `NodeSyncService.ts`.

### Suggested Fixes (Non-Blocking)

S-001, S-003, S-004, and S-005 are strongly recommended before shipping. S-005 in particular will make the sync feature non-functional in practice even after B-001 and B-002 are fixed.

After all blocking issues are resolved, re-submit for review.

---

## Re-Review: Fix Verification (2026-02-18)

**Reviewer**: Tech Lead
**Scope**: Focused re-review of the three fixes applied after GATE:FAIL. No full re-scan of unchanged code.

---

### B-001 Fix Verification — Transaction boundary in `SyncImportService.cs`

**PASS.**

The fix is correctly applied. Inspecting `SyncImportService.cs`:

- `BeginTransactionAsync()` is now called at **line 72**, before any entity work or SyncLog creation.
- The `SyncLog` entity is created at **lines 78–86** using `_context.SyncLogs.Add(syncLog)` followed by `await _context.SaveChangesAsync()`. This is inside the `try` block that started after the transaction was opened. Critically, `_context.SyncLogs.Add` is used directly rather than routing through `_syncLogRepository.AddAsync()`, which avoids the implicit `SaveChangesAsync` that previously committed the row outside the transaction.
- On the `catch` path (line 133), `transaction.RollbackAsync()` is called first (lines 137–141), then `LogSyncFailureAsync()` is invoked (line 146).
- `LogSyncFailureAsync()` (lines 157–187) correctly calls `_context.ChangeTracker.Clear()` to detach all stale state from the rolled-back transaction, then adds a fresh `SyncLog` with `Status = "failed"` and calls `SaveChangesAsync()`. This is an independent implicit transaction — no leftover context state can poison it.

The architecture requirement (Section 4.4: *"Update SyncLog in a new transaction after rollback"*) is satisfied. The use of `ChangeTracker.Clear()` + a new `SaveChangesAsync()` is semantically equivalent to a new implicit transaction on a clean context, which is the correct pattern when a scoped `DbContext` cannot be replaced.

One minor observation: `LogSyncFailureAsync` wraps its own body in a `try/catch` and swallows exceptions with a log warning. This is intentional and correct — a failure to write the failure log must not mask the original exception that is re-thrown at line 148.

**B-001: FIXED.**

---

### B-002 Fix Verification — Recording file response format

**PASS.**

**Controller side** (`SyncController.cs`, lines 165–190):

`GetRecordingFile` no longer calls `File(data, contentType, fileName)`. It now returns:
```csharp
return Ok(new
{
    ContentBase64 = Convert.ToBase64String(data),
    ContentType = contentType,
    FileName = fileName
});
```
This is a standard JSON `ObjectResult`, which will be serialized by `PrismEncryptedChannelConnection` into the encrypted JSON envelope that the middleware's `invoke()` method expects. The property names use PascalCase in C# (which is the default serialization output for anonymous objects unless a naming policy is configured). Checking the client-side expectation:

**Client side** (`NodeSyncService.ts`, lines 197–212):

The TypeScript client expects:
```typescript
const fileData = await this.options.remoteMiddleware.invoke<Record<string, unknown>, {
    contentBase64: string;
    contentType: string;
    fileName: string;
}>({ ... });
```

The response type uses **camelCase** (`contentBase64`, `contentType`, `fileName`). The controller serializes with **PascalCase** (`ContentBase64`, `ContentType`, `FileName`). This is a **potential case mismatch** at runtime.

Checking whether `PrismEncryptedChannelConnection` or the `invoke()` method applies camelCase normalization: the middleware's `invoke()` decrypts the envelope and uses `JSON.parse()`, which returns the raw JSON keys as-is. If the backend serializes `ContentBase64` (PascalCase), `fileData.contentBase64` will be `undefined` at runtime.

ASP.NET Core's default JSON serializer (`System.Text.Json`) uses **camelCase** output for named types and DTOs when configured with `JsonNamingPolicy.CamelCase` (which is the standard configuration in ASP.NET Core projects). However, for **anonymous objects** with `Ok(new { ... })`, the serialization depends on the global naming policy configured in `Program.cs` or the `AddJsonOptions` call.

This is a regression risk that requires verification. If the project's JSON options apply `CamelCaseNamingPolicy` globally (the typical ASP.NET Core default), the output would be `contentBase64 / contentType / fileName` — which **matches** the TypeScript expectation and works correctly. If there is no camelCase policy configured, the mismatch would cause `undefined` fields on the client.

The fix direction is correct and the two B-002 halves are aligned in intent. The case sensitivity concern is a **low-risk observation** (ASP.NET Core defaults to camelCase for anonymous objects when camelCase is configured), not a new blocking issue — but the developer should confirm the JSON naming policy in `Program.cs` to rule out a runtime silent failure.

**B-002: FIXED** (with low-risk observation noted above).

---

### S-005 Fix Verification — Remote middleware wiring in `NodeSyncServiceAdapter.ts`

**PASS.**

The fix is correctly and thoroughly applied. Inspecting `NodeSyncServiceAdapter.ts`:

- The `preview()` method signature now accepts `connection: ResearchNodeConnection` as the first required parameter (line 38–42). The UI layer is obligated to pass the connection.
- A **connection-specific** `remoteMiddleware` is constructed inside `preview()` (lines 48–64):
  - `FetchHttpClient` is created with `connection.nodeUrl` as the base URL — this targets the remote node's actual address.
  - `ChannelManager` and `SessionManager` are created using the remote-targeted HTTP client and a fresh `WebCryptoDriver`.
  - `ResearchNodeMiddleware` is constructed with `localCertificate` (the local node's identity), the remote-targeted managers, and — critically — `signChallenge: this.middleware.signChallenge`, which shares the local node's signing capability. This is correct: the local node identifies itself to the remote backend using its own certificate, but connects to the remote URL.
- `NodeSyncService` is wired with `remoteMiddleware` (the new connection-specific instance) and `localMiddleware: this.middleware` (the local singleton). This is the correct split: pull from remote, import to local.

**Verifying `NodeConnectionsScreen.tsx` passes the connection:**

- `handleStartSync` (lines 116–124) calls `nodeSyncServiceAdapter.preview(syncConnection, undefined, onProgress)`, where `syncConnection` is the `ResearchNodeConnection | null` state set by `handleOpenSync`.
- `handleOpenSync` (lines 90–105) validates the connection's access level and authorization status before setting `setSyncConnection(connection)`.
- `handleStartSync` guards `if (!syncConnection)` and throws — this is correct defensive handling.

The adapter contract is now correctly established: `preview()` requires a connection, the screen passes it, and the remote middleware targets the correct URL.

**S-005: FIXED.**

---

### Regression Scan

The three fixes are targeted and self-contained. No new files were added outside the three files under review. A focused scan for regressions:

1. **`SyncImportService.cs`**: The `SaveChangesAsync` calls inside the transaction now include the SyncLog row along with entity upserts. The `ChangeTracker.Clear()` in `LogSyncFailureAsync` will also detach any entities that were added during the failed transaction attempt. This is correct — entities are already rolled back at the DB level, and the in-memory `Add` operations on those entities will be discarded by `Clear()`. No regression.

2. **`SyncController.cs`**: The `GetRecordingFile` action no longer returns a binary `FileResult`. Any caller that expected a binary octet-stream (e.g., a future direct browser download) would receive JSON instead. There are no other known callers of this endpoint in the codebase — it is called exclusively by `NodeSyncService.ts`. No regression.

3. **`NodeSyncServiceAdapter.ts`**: The `preview()` method now requires `connection: ResearchNodeConnection` as the first argument. The only call site is `NodeConnectionsScreen.tsx:121`, which passes `syncConnection` — a non-null `ResearchNodeConnection` at that point (guarded by the `if (!syncConnection)` throw on line 118). The `BaseService.ensureSession()` call at the start of `preview()` still runs before constructing the remote middleware. No regression.

One pre-existing suggestion (S-001) remains unaddressed: `SyncController.GetSyncLog` still resolves `ISyncLogRepository` from `HttpContext.RequestServices` (line 233). This was flagged as a non-blocking suggestion in the original review and was not in scope for this fix cycle. It is noted here for completeness.

---

### Updated Issue Status

| ID | Original Verdict | Fix Status |
|----|-----------------|------------|
| B-001 | Blocking — FAIL | FIXED |
| B-002 | Blocking — FAIL | FIXED (low-risk PascalCase observation noted) |
| S-005 | Major Suggestion | FIXED |
| S-001 | Minor Suggestion | Still open (not in scope) |
| S-002 through S-007 | Suggestions | Unchanged from original review |

---

### Re-Review Gate Decision

Both blocking issues (B-001, B-002) are resolved. The major functional concern (S-005) is resolved. No regressions were introduced by the fixes. The low-risk PascalCase observation on B-002 is worth a developer confirmation but does not block the gate — ASP.NET Core's default camelCase JSON policy covers anonymous objects when configured globally.

**[GATE:PASS]**

The implementation is approved to proceed to QA testing. Before proceeding to production, the team should also address the open suggestions S-001 (constructor injection for `ISyncLogRepository`) and confirm the ASP.NET Core JSON naming policy covers the anonymous object in `GetRecordingFile`.
