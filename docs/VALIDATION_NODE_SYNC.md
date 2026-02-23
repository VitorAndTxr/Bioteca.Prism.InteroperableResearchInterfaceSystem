# Validation: Node-to-Node Data Synchronization (Phase 17)

**Date**: 2026-02-18
**Validator**: PM (Product Manager)
**Status**: APPROVED
**Artifacts Reviewed**:
- `docs/PROJECT_BRIEF_NODE_SYNC.md` (Business Requirements)
- `docs/ARCHITECTURE_NODE_SYNC.md` (Technical Design)
- Backlog: 15 stories (US-001 through US-015)

---

## 1. Business Objectives Coverage

| # | Business Objective | Architecture Coverage | Verdict |
|---|-------------------|-----------------------|---------|
| 1 | Enable one-way incremental data pull between authorized nodes | SyncController (6 export endpoints), SyncExportService with `since` filtering, NodeSyncService pull orchestration, dependency-ordered entity fetch (SNOMED -> Volunteers -> Research -> Sessions -> Recordings) | COVERED |
| 2 | Guarantee transactional integrity | SyncImportService wraps all upserts in a single `IDbContextTransaction`. On failure, `RollbackAsync()` is called and a separate transaction logs the error to SyncLog. Section 4.4 specifies explicit rollback path. | COVERED |
| 3 | Incremental sync with "newer wins" conflict resolution | `?since=ISO8601` parameter on all export endpoints filters by `UpdatedAt > since`. SyncImportService compares `UpdatedAt` per record and keeps the newer version. SyncLog stores `last_synced_at` watermark for next incremental run. | COVERED |
| 4 | Require ReadWrite capability | `[PrismAuthenticatedSession(RequiredCapability = NodeAccessTypeEnum.ReadWrite)]` on SyncController. Desktop UI checks `nodeAccessLevel` before opening sync modal and shows error for ReadOnly connections. | COVERED |

**Result**: All 4 business objectives are fully addressed.

---

## 2. Acceptance Criteria Traceability

| # | Acceptance Criterion | Architecture Component | Section | Story |
|---|---------------------|----------------------|---------|-------|
| AC-1 | Sync button works | `NodeConnectionsScreen.tsx` wiring replaces `console.log` stub with `handleSync()` | 7.1 | US-011 |
| AC-2 | Manifest preview | `POST /api/sync/manifest` returns `SyncManifest` with entity counts and sizes; `NodeSyncService.pull()` returns manifest for UI confirmation before `proceed()` | 4.2, 5.1 | US-010, US-012 |
| AC-3 | Incremental transfer | All export endpoints accept `?since=` parameter; `SyncExportService` applies `.Where(e => e.UpdatedAt > since)`; SyncLog stores watermark | 4.3 | US-008 |
| AC-4 | Newer wins | `SyncImportService` compares `UpdatedAt` and updates only when remote is newer via `CurrentValues.SetValues()` | 4.4 | US-009 |
| AC-5 | Transactional rollback | Single `BeginTransactionAsync()` wrapping all upserts; `RollbackAsync()` on any exception | 4.4 | US-009 |
| AC-6 | Recording files | `GET /api/sync/recordings/{id}/file` streams binary; `InvokeStreamAsync` overload for raw stream; files stored within transaction | 4.2, 4.5 | US-008 |
| AC-7 | Progress feedback | `SyncProgressCallback` interface; `onProgress` called per page fetch and per recording; `SyncProgressModal` shows phase label + completion percentage | 5.1, 7.2 | US-012 |
| AC-8 | Sync history | `GET /api/sync/log` endpoint; connection table shows last sync badge (green/red/gray) | 4.6, 7.3 | US-013, US-014 |
| AC-9 | ReadWrite enforcement | `RequiredCapability = ReadWrite` on controller; desktop `handleSync()` checks access level first | 4.2, 7.1 | US-011 |
| AC-10 | No regression | Architecture adds new controller/services without modifying existing CRUD controllers. Rate limit change is scoped via `PrismSyncEndpointAttribute` marker. Existing `PrismAuthenticatedSessionAttribute` modified minimally (3 lines for sync flag check). | 4.7 | US-015 |

**Result**: All 10 acceptance criteria have direct architecture components and story mappings.

---

## 3. Scope Boundary Validation

| Out-of-Scope Item | Creeping In? | Evidence |
|-------------------|-------------|----------|
| Bidirectional sync | NO | ADR-1 explicitly states "pull model"; requested node only exposes read-only export endpoints |
| Real-time / automatic sync | NO | Section 7.1 shows sync is user-initiated via button click; no scheduled jobs or webhooks |
| Conflict resolution UI | NO | ADR-2 specifies "no user-facing conflict resolution UI"; newer wins is automatic |
| Mobile app sync | NO | Architecture only touches `apps/desktop` and `packages/middleware`; no changes to `apps/mobile` |
| File deduplication | NO | Section 4.5 note on streaming says files are downloaded as-is |
| ABAC / fine-grained permissions | NO | Only ReadWrite capability check; no per-entity access control |
| Event sourcing / vector clocks | NO | ADR-2 explicitly defers these; uses timestamp watermarks |
| Partial entity selection | NO | `NodeSyncService.executePull()` fetches all entity types sequentially; no selection UI |

**Result**: No scope creep detected. All out-of-scope items remain excluded.

---

## 4. Risk Mitigation Assessment

| Brief Risk | Mitigation in Architecture | Adequate? |
|-----------|---------------------------|-----------|
| R1: Large dataset timeouts | Paginated responses (100/page), file streaming, configurable HttpClient.Timeout (5 min) | YES |
| R2: Clock skew | ADR-2 documents NTP requirement; one-way pull limits exposure; remote timestamps used as-is | YES (acceptable for v1) |
| R3: Recording file download failure | Files downloaded within transaction; failure triggers full rollback (Section 4.4) | YES |
| R4: Duplicate volunteers | Treated as separate records (different GUIDs); documented as known limitation with future cross-node ID mapping | YES (acceptable for v1) |
| R5: Rate limiting blocks sync | `PrismSyncEndpointAttribute` elevates to 600 req/min; architecture risk table (Section 10, Risk 3) confirms this allows ~60,000 records/min | YES |
| R6: PII transfer | ReadWrite capability ensures institutional trust; architecture does not introduce any additional PII exposure beyond what the handshake already permits | YES (acceptable for v1) |

**Result**: All 6 risks have adequate mitigations. Risks R2, R4, and R6 are acknowledged as "acceptable for v1" with future improvements noted.

---

## 5. Effort Estimation Review

The project brief estimates the total effort as **XL** (4-6 development cycles). The architecture document decomposes this into 12 implementation steps with clear dependency ordering.

| Component | Brief Estimate | Architecture Complexity | Assessment |
|-----------|---------------|------------------------|------------|
| Backend sync export (6 endpoints) | L | SyncExportService with 6 methods, eager loading, pagination, `since` filtering across 20+ tables | Reasonable — L is appropriate |
| Backend sync import + transaction | XL | SyncImportService with batch upsert, dependency ordering, single transaction, error recovery | Reasonable — most complex component |
| NodeChannelClient.InvokeAsync | S | Single method addition + InvokeStreamAsync for binary files | Reasonable |
| SyncLog table + migration | S | Standard entity + repository + migration | Reasonable |
| Rate limit exemption | S | Marker attribute + 3-line check in existing attribute | Reasonable |
| Middleware NodeSyncService | M | Pull orchestration, pagination loop, progress callbacks, memory collection | Reasonable |
| Domain types | S | Type definitions only | Reasonable |
| Desktop sync UI | M | Modal with 4 states, progress bar, sync badge on table | Reasonable |

**Result**: Effort estimation is reasonable and consistent between brief and architecture.

---

## 6. Success Metrics Achievability

| Success Metric | Architecture Support | Achievable? |
|---------------|---------------------|-------------|
| Sync 1000+ records across all entity types without errors | Paginated export (100/page), transactional import, dependency ordering | YES |
| Incremental sync with no changes completes in < 2 seconds | Manifest query counts with `since` filter returns zeros; short-circuit possible if all counts are 0 | YES (architecture could explicitly add short-circuit, but current design naturally handles it via empty page responses) |
| Simulated mid-transfer failure results in zero persisted changes | Single transaction with `RollbackAsync()` on exception | YES |
| Desktop UI shows accurate progress and final summary | `SyncProgressCallback` per phase/page, `SyncResult` with entity counts | YES |

**Result**: All 4 success metrics are achievable with the proposed design.

---

## 7. Specialist Feedback Incorporation

### Dev Specialist Findings

| Finding | Addressed? | Evidence |
|---------|-----------|----------|
| ISyncImportService decoupled from BaseRepository | YES | Section 4.4: `SyncImportService` uses `PrismDbContext` directly, not `BaseRepository`. Registered as its own scoped service in DI (Section 4.8). |
| IsSyncRequest flag for rate limits | YES | ADR-4 and Section 4.7: `PrismSyncEndpointAttribute` marker + `PrismAuthenticatedSessionAttribute` check. Architecture chose attribute-based approach over flag-in-context, which is cleaner. |
| InvokeAsync<T> + InvokeStreamAsync needed | YES | Section 4.5: Both methods specified. `InvokeAsync<T>` for JSON payloads, `InvokeStreamAsync` for binary recording files. |
| Document file size constraints | PARTIALLY | Section 5.1 mentions "memory concern" for large datasets but does not specify explicit file size limits. Acceptable for v1 given pagination and manual trigger. |

### QA Specialist Findings

| Finding | Addressed? | Evidence |
|---------|-----------|----------|
| All testable | YES | Section 11 maps all stories to architecture. US-015 covers integration tests. Clear inputs/outputs on all services. |
| Docker multi-node ready | YES | Project brief Section 7 references `docker-compose.application.yml` (NodeA + NodeB). Architecture Section 12, step 12 specifies "End-to-end NodeA -> NodeB Docker test". |
| Playwright for desktop UI | YES | IRIS already has Playwright skill (`.claude/skills/playwright/SKILL.md`) with 16 scripts. SyncProgressModal (Section 7.2) has 4 discrete states testable via Playwright. |
| Rate limit needs IsSyncRequest flag approach | YES | ADR-4 and Section 4.7 implement this via `PrismSyncEndpointAttribute`. |

**Result**: All specialist findings are adequately incorporated. The file size constraint documentation is the only partial item, which is non-blocking for v1.

---

## 8. Backlog Alignment

The backlog contains 15 stories (US-001 through US-015). The architecture document's Section 11 (Story-to-Architecture Mapping) correctly maps US-007 through US-015 to architecture components. US-001 through US-006 are Phase 16 carry-overs for `blob_url` and export fixes, correctly identified as unrelated to the node sync architecture.

All 9 Phase 17 stories (US-007 through US-015) have corresponding architecture sections with sufficient detail for implementation.

---

## 9. Observations and Recommendations

**Non-blocking observations** (do not affect approval):

1. **Incremental sync short-circuit**: The architecture could explicitly short-circuit when the manifest shows all entity counts as zero (no changes since last sync), avoiding unnecessary page fetches. Current design handles this implicitly through empty responses, but an explicit check would improve the < 2 second success metric.

2. **Import endpoint**: The architecture introduces `POST /api/sync/import` (Section 5.1, line 629) on the local backend, but this endpoint is not listed in the SyncController definition (Section 4.2). This needs to be added during implementation — it could be a separate `SyncImportController` or an additional action on `SyncController`.

3. **Concurrent sync prevention**: No mechanism prevents a user from clicking "Sync" twice simultaneously on the same connection. A simple SyncLog status check (reject if `in_progress` exists for the same `remote_node_id`) would prevent duplicate syncs.

4. **File size documentation**: Per Dev specialist feedback, explicit file size limits or warnings for very large recording files should be documented during implementation, even if not enforced in v1.

---

## Final Verdict

The architecture document `ARCHITECTURE_NODE_SYNC.md` comprehensively addresses all 4 business objectives, maps to all 10 acceptance criteria, respects all scope boundaries, mitigates all 6 identified risks, and incorporates both Dev and QA specialist feedback. The effort estimation is reasonable, success metrics are achievable, and the backlog is properly aligned.

The observations in Section 9 are non-blocking improvements that can be addressed during implementation.

**[VERDICT:APPROVED]**

The architecture is approved for implementation. Proceed to development phase.

---

## Tech Lead Validation

**Reviewer**: Tech Lead
**Date**: 2026-02-18

### Validation Methodology

All claims in `ARCHITECTURE_NODE_SYNC.md` were cross-referenced against the actual codebase at the time of review. The following source files were inspected:

- `InteroperableResearchNode/Bioteca.Prism.Core/Middleware/Node/INodeChannelClient.cs`
- `InteroperableResearchNode/Bioteca.Prism.Core/Middleware/Node/NodeChannelClient.cs`
- `InteroperableResearchNode/Bioteca.Prism.InteroperableResearchNode/Middleware/PrismAuthenticatedSessionAttribute.cs`
- `InteroperableResearchNode/Bioteca.Prism.Service/Services/Session/SessionService.cs`
- `InteroperableResearchNode/Bioteca.Prism.Domain/Entities/Snomed/*.cs`
- `InteroperableResearchNode/Bioteca.Prism.Domain/Entities/Record/*.cs`
- `InteroperableResearchNode/Bioteca.Prism.Domain/Entities/Clinical/*.cs`
- `InteroperableResearchNode/Bioteca.Prism.Domain/Entities/Volunteer/*.cs`
- `InteroperableResearchNode/Bioteca.Prism.InteroperableResearchNode/Program.cs` (line 85: Singleton registration)
- `IRIS/packages/middleware/src/service/ResearchNodeMiddleware.ts`
- `IRIS/apps/desktop/src/screens/NodeConnections/NodeConnectionsScreen.tsx` (line 229: sync stub)

---

### Checklist Results

#### 1. Transaction Semantics (BEGIN -> upserts -> COMMIT/ROLLBACK)

**PASS**. Section 4.4 correctly specifies `PrismDbContext.Database.BeginTransactionAsync()` wrapping all upserts, with `CommitAsync()` on success and `RollbackAsync()` in the catch block. The pattern is idiomatic EF Core. The design also correctly handles SyncLog failure logging in a separate transaction after rollback (line 401: "new transaction for the error log"), which avoids losing the failed SyncLog entry when the main transaction rolls back.

One note: `SaveChangesAsync()` is called "after each entity type batch" (Section 4.4, point 4). This is correct within a transaction since EF Core does not actually commit until `CommitAsync()`. The architecture should explicitly document that `SaveChangesAsync()` within a transaction flushes SQL commands to the database without committing, which is necessary for FK resolution between batches (e.g., SNOMED entities must be visible to Volunteer upserts within the same transaction). This is technically sound but worth a developer comment.

#### 2. Incremental Sync Watermark Logic

**PASS**. The watermark is stored in `SyncLog.LastSyncedAt` and set to `payload.ManifestGeneratedAt` (the timestamp when the manifest was generated on the remote node). This is correct because:
- It captures the point-in-time of the remote node's data snapshot.
- Subsequent syncs use `since = lastSyncedAt`, which queries `UpdatedAt > since`.
- Any records modified between manifest generation and sync completion will be captured in the next sync (they will have `UpdatedAt > manifestGeneratedAt`).

This avoids the "lost update" problem where records modified during a long sync would be missed.

#### 3. "Newer Wins" Conflict Resolution

**PASS with NOTE**. The strategy (compare `UpdatedAt`, keep the newer version) is correct for the one-way pull model. However, there is a subtlety that should be documented: when upserting via `_context.Entry(entity).CurrentValues.SetValues(remote)`, the local `UpdatedAt` will be overwritten with the remote's value. This is correct behavior for the "newer wins" model, but developers must ensure that no `SaveChangesAsync` interceptor or value generator automatically overwrites `UpdatedAt` with `DateTime.UtcNow` on the local node, which would defeat the purpose of preserving the remote timestamp.

#### 4. Rate Limit Exemption Approach

**PASS**. The `PrismSyncEndpointAttribute` marker approach is clean and minimally invasive. Verified that `PrismAuthenticatedSessionAttribute` (line 161) calls `sessionService.RecordRequestAsync(sessionToken)` where the 60 req/min check lives in `SessionService.cs:234` (`requestCount >= MaxRequestsPerMinute`). The proposed modification to check `EndpointMetadata` for `PrismSyncEndpointAttribute` and use 600 req/min is viable -- `ActionExecutingContext.ActionDescriptor.EndpointMetadata` is the standard ASP.NET Core way to inspect endpoint attributes.

The Dev review's recommendation to use an `IsSyncRequest` flag on `SessionContext` is an alternative, but the architecture's approach of reading endpoint metadata directly is simpler and avoids modifying the `SessionContext` type. Both approaches work; the architecture's choice is acceptable.

#### 5. Security: ReadWrite Capability Enforcement

**PASS**. Section 4.2 specifies both `[PrismEncryptedChannelConnection]` and `[PrismAuthenticatedSession(RequiredCapability = NodeAccessTypeEnum.ReadWrite)]` at the controller level. Verified that `PrismAuthenticatedSessionAttribute` (line 139) correctly compares `sessionContext.NodeAccessLevel < RequiredCapability` and returns 403 Forbidden. The desktop UI (Section 7.1) also correctly checks `connection.nodeAccessLevel === NodeAccessLevel.READ_ONLY` before initiating sync.

#### 6. Recording File Streaming Approach

**PASS with FINDING**. The architecture correctly identifies the need for `InvokeStreamAsync` for binary file downloads (Section 4.5, line 480). The `RecordChannel.FileUrl` property (verified in `RecordChannel.cs:33`) stores the file path. However, the architecture document refers to a `recordings/{id}/file` endpoint using a recording "ID" (Guid), but the actual data model does not have a standalone "Recording" entity -- files are referenced via `RecordChannel.FileUrl`. The architecture should clarify that the recording ID maps to `RecordChannel.Id`, not a separate recording entity. This is a naming inconsistency, not a design flaw.

#### 7. Error Handling and Rollback Coverage

**PASS**. The architecture covers:
- Transaction rollback on any exception during import (Section 4.4, catch block).
- SyncLog error recording in a separate transaction after rollback.
- Network interruption during fetch: no data written since everything is collected in memory first (Section 5.1, "Import Path").
- Rate limit errors: standard 429 response from the existing attribute.
- Session expiry during long sync: `ResearchNodeMiddleware.ensureSessionValid()` (verified in middleware source, line 248) automatically renews sessions approaching expiry.

One gap: the architecture does not explicitly address what happens if the **local** backend's `POST /api/sync/import` endpoint itself is unreachable (e.g., local backend crashed after collecting data). This is a minor edge case -- the middleware would throw an exception and the desktop UI would show an error. No data corruption risk since nothing was written.

#### 8. NodeChannelClient.InvokeAsync Design Compatibility

**PASS**. Verified that `NodeChannelClient` (registered as Singleton in `Program.cs:85`) already has:
- `_httpClientFactory` (IHttpClientFactory) for creating HTTP clients.
- `_encryptionService` (IChannelEncryptionService) for encrypt/decrypt via `EncryptPayload`/`DecryptPayload`.
- `_channelStore` (IChannelStore) for retrieving channel context by ID.

The proposed `InvokeAsync<TResponse>` method (Section 4.5) follows the exact same pattern as existing methods like `IdentifyNodeAsync` and `RegisterNodeAsync`: get channel context -> encrypt payload -> send request -> decrypt response. The implementation is a straightforward generalization. The method adds `X-Channel-Id` and `X-Session-Id` headers, which matches the existing `PrismAuthenticatedSessionAttribute`'s token extraction logic (line 56: reads from `X-Session-Id` header).

Note: Since `NodeChannelClient` is a **Singleton** and the proposed method creates `HttpClient` via `_httpClientFactory.CreateClient()` per request, there is no thread-safety concern. This is the correct pattern.

#### 9. Architectural Anti-Patterns Assessment

**PASS with OBSERVATIONS**.

The architecture is clean and well-structured. No anti-patterns detected. Specific positive observations:

- **SyncImportService decoupled from BaseRepository**: The Dev review recommended this, and the architecture correctly uses `PrismDbContext` directly instead of going through `BaseRepository<T,K>`. This is appropriate because sync upsert logic (batch `WHERE Id IN (...)` + conditional update) does not fit the CRUD-oriented `BaseRepository` interface.

- **Middleware as orchestrator, not persistence layer**: Section 5.1 correctly identifies that the middleware collects data and sends it to the local backend for import, rather than trying to write to the database directly.

- **Separation of export/import concerns**: `SyncExportService` (read-only, on the data source) and `SyncImportService` (write, on the data consumer) are correctly separated.

One minor observation: the architecture introduces a `SyncController` that inherits from `ControllerBase` (not the project's custom `BaseController`). This is intentional and correct -- `BaseController` provides `HandleQueryParameters()` which is incompatible with the `since` parameter. However, this means the sync controller will not have the standard `ServiceInvoke()` error handling helpers. The sync controller should implement its own consistent error response format.

#### 10. EF Core Migration for SyncLog

**PASS**. Section 4.9 correctly specifies the `sync_logs` table with appropriate columns, FK to `research_nodes(id)`, and indexes on `remote_node_id` and `status`. The `entities_received` column using `jsonb` type is appropriate for PostgreSQL.

---

### Critical Finding: Missing UpdatedAt Columns

**ISSUE (Non-Blocking, Must Fix During Implementation)**

The architecture document (Section 4.1) states: "audit reveals all key entities already have UpdatedAt". This is **partially incorrect**. The following entities are **missing `UpdatedAt`** (and in some cases `CreatedAt`):

| Entity | Has `CreatedAt` | Has `UpdatedAt` | Impact |
|--------|:-:|:-:|--------|
| `SnomedLaterality` | NO | NO | Cannot do incremental sync on this entity |
| `SnomedTopographicalModifier` | NO | NO | Cannot do incremental sync on this entity |
| `RecordChannel` | YES | NO | Cannot do incremental sync on this entity |

These entities are part of the sync scope (SNOMED lateralities and topographical modifiers are listed in Section 5.1 as sync entity types; RecordChannel is a child of Record included in session sync).

**Resolution**: The `AddSyncLog` migration (Section 4.9) must also add `UpdatedAt` (and `CreatedAt` where missing) columns to these three entities. The architecture already anticipated this possibility ("Also adds UpdatedAt columns to any entities currently missing them"), but the specific entities were not identified.

Additionally, the `SnomedSeverityCode` entity uses `Code` as its PK property name, not `SnomedCode` (which `SnomedBodyRegion` and `SnomedBodyStructure` use). The upsert logic must account for this naming inconsistency when matching SNOMED entities by their natural key.

---

### Additional Observations

**O-1: Import endpoint routing to local backend**. The middleware sends `POST /api/sync/import` to the local backend (Section 5.1, line 629). However, the `SyncController` is defined on the remote backend's export endpoints. There is no explicit mention of a separate import endpoint on the local backend. The architecture should clarify: is `POST /api/sync/import` handled by the same `SyncController`, or does it need a separate `SyncImportController`? Since the import endpoint is called locally (not through the encrypted channel), it does not need `[PrismEncryptedChannelConnection]` -- it may need standard user authentication or a local-only authorization scheme. This needs clarification.

**O-2: SNOMED PK property name inconsistency**. The architecture refers to SNOMED entities using `SnomedCode` as PK, but the actual entities have different property names: `SnomedBodyRegion.SnomedCode`, `SnomedBodyStructure.SnomedCode`, `SnomedSeverityCode.Code`, `SnomedLaterality.Code`, `SnomedTopographicalModifier.Code`. The `SyncExportService` and `SyncImportService` must handle this inconsistency, likely via entity-specific mapping rather than a generic approach.

**O-3: RecordChannel has no `UpdatedAt` but has `FileUrl`**. Recording files are referenced via `RecordChannel.FileUrl`, not a separate recording entity. The `GET /api/sync/recordings/{id}/file` endpoint should accept a `RecordChannel` ID, not a "recording" ID. The architecture's naming is slightly misleading but functionally correct if the ID parameter maps to `RecordChannel.Id`.

**O-4: Memory usage for large recording files**. The middleware collects recording file bytes in memory (Section 5.1, line 619: `collected.recordings.push({ id, ...fileData })`). For large files, this could be problematic. Consider streaming files directly to the local backend's file storage instead of collecting them in the import payload. This is acknowledged in the architecture as a "future optimization" (Section 5.1, "Memory concern") and is acceptable for the first version.

**O-5: NodeChannelClient is Singleton but SyncImportService is Scoped**. This is correct: `InvokeAsync<T>` on the Singleton `NodeChannelClient` is thread-safe (creates new `HttpClient` per request). The Scoped `SyncImportService` gets a fresh `PrismDbContext` per request, which is necessary for the transaction to work correctly.

---

### Dev Review Findings -- Incorporation Assessment

| Dev Finding | Architecture Response | Assessment |
|-------------|----------------------|------------|
| ISyncImportService decoupled from BaseRepository | Uses `PrismDbContext` directly | ADDRESSED |
| IsSyncRequest flag for rate limit | Uses `PrismSyncEndpointAttribute` marker (equivalent approach) | ADDRESSED (acceptable alternative) |
| Both InvokeAsync and InvokeStreamAsync needed | Section 4.5 mentions both | ADDRESSED |
| SaveChangesAsync contract documented | Partially -- mentions "calls SaveChangesAsync after each entity type batch" | NEEDS developer comment about flush-vs-commit semantics |

### QA Review Findings -- Incorporation Assessment

| QA Finding | Architecture Response | Assessment |
|------------|----------------------|------------|
| All paths testable via Docker multi-node setup | Section 12 step 12: "End-to-end NodeA->NodeB Docker test" | ADDRESSED |
| Playwright available for desktop UI testing | SyncProgressModal uses standard Modal component | ADDRESSED (testable) |

---

### Summary

| # | Checklist Item | Result |
|---|---------------|--------|
| 1 | Transaction semantics | PASS |
| 2 | Incremental sync watermark logic | PASS |
| 3 | "Newer wins" conflict resolution | PASS (with documentation note) |
| 4 | Rate limit exemption approach | PASS |
| 5 | ReadWrite capability enforcement | PASS |
| 6 | Recording file streaming | PASS (naming clarification needed) |
| 7 | Error handling and rollback | PASS |
| 8 | NodeChannelClient.InvokeAsync compatibility | PASS |
| 9 | No architectural anti-patterns | PASS |
| 10 | EF Core migration for SyncLog | PASS |

**Critical Finding**: Three entities (`SnomedLaterality`, `SnomedTopographicalModifier`, `RecordChannel`) are missing `UpdatedAt` columns. The migration must add these columns. This is a known gap that does not invalidate the architecture but must be addressed during implementation.

**Observations**: Five non-blocking observations (O-1 through O-5) documented above for implementation guidance.

---

### Verdict

The architecture is technically sound, well-aligned with the existing codebase, and implementable. The transaction model, watermark logic, rate limit approach, and security enforcement are all correct. The `NodeChannelClient.InvokeAsync` extension follows established patterns. The middleware orchestration and desktop UI wiring are well-designed.

The missing `UpdatedAt` columns are a concrete gap that the migration must address, but this was already anticipated by the architecture document. The import endpoint routing (O-1) needs clarification during implementation but does not require an architecture revision.

All Dev and QA review findings are adequately addressed.

**[VERDICT:APPROVED]**

Approved with the following mandatory implementation notes:
1. Add `UpdatedAt` + `CreatedAt` columns to `SnomedLaterality`, `SnomedTopographicalModifier`, and `RecordChannel` in the `AddSyncLog` migration.
2. Account for SNOMED PK property name inconsistency (`SnomedCode` vs `Code`) in the upsert logic.
3. Clarify whether `POST /api/sync/import` is on the same `SyncController` or a separate local-only controller (no encrypted channel required for local import).
4. Add developer comments about `SaveChangesAsync()` flush-vs-commit behavior within transactions.
