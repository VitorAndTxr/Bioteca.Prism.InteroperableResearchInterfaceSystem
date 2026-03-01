# Validation: NewSession Screen Redesign

**Date**: 2026-03-01
**Reviewer**: PM (Product Manager)
**Phase**: 20
**Documents Reviewed**:
- `IRIS/docs/PROJECT_BRIEF_SESSION_REDESIGN.md`
- `IRIS/docs/ARCHITECTURE_SESSION_REDESIGN.md`
- Backlog stories US-033 through US-039

---

## 1. Business Objectives Alignment

| # | Objective | Brief Status | Architecture Coverage | Backlog Coverage | Verdict |
|---|-----------|-------------|----------------------|-----------------|---------|
| 1 | Remove research project selection from session config | Clearly scoped | ADR-1 (env var), Section 9.1 (removals table) | US-033 (env var), US-038 (UI removal) | PASS |
| 2 | Add sensor selection step to session creation | Well defined | ADR-2 (separate screen), ADR-3 (context state), Section 8 (SensorSelectScreen design) | US-037 (SensorSelectScreen) | PASS |
| 3 | Update data model to carry sensor selections | Fully specified | Section 5 (type changes), Section 7 (SQLite migration) | US-034 (context), US-035 (domain types), US-036 (migration) | PASS |
| 4 | Maintain favorites parity | Addressed | Section 4.3 (favorites persistence), Section 7.3 (FavoriteRepository) | US-039 (favorites save/apply) | PASS |

All four business objectives have clear traceability from brief through architecture to backlog stories.

---

## 2. Scope Validation

### In-Scope Items (Brief vs. Architecture)

Every in-scope item from the brief has a corresponding section in the architecture document. The architecture adds specificity without expanding scope. Key mappings:

- Research removal: Architecture Section 9.1 lists exact line ranges and elements to remove.
- Env var: Architecture ADR-1 + Section 4.1 flow diagram covers startup validation and data flow.
- SensorSelectScreen: Architecture Section 8 provides component structure, data source, selection behavior, and UI pattern.
- Context changes: Architecture Section 5.1 shows exact before/after type definitions.
- SQLite migration: Architecture Section 7 provides migration SQL and repository changes.
- Favorites: Architecture Section 4.3 diagrams save/apply flow with sensor fields.

### Out-of-Scope Verification

The architecture explicitly states scope is limited to `IRIS/apps/mobile` and `@iris/domain`. No backend, desktop, device, or middleware changes are proposed. This matches the brief's out-of-scope list. No scope creep detected.

---

## 3. Risk Assessment Review

### Business Risks (Brief)

| # | Risk | Mitigation Adequate? | Notes |
|---|------|---------------------|-------|
| 1 | Missing env var | YES | Architecture ADR-1 + US-033 includes startup validation with error screen |
| 2 | Empty sensor list | YES | ADR-5 defines conditional validation (non-blocking when empty) |
| 3 | Existing favorites lose research data | YES | Architecture keeps research fields in schema (backward compat) |
| 4 | User confusion from research removal | YES | Institution-level deployment model makes this a non-issue |

### Technical Risks (TL Assessment)

All 8 technical risks from the TL assessment have mitigations. Risk #5 (API contract mismatch) was the highest concern but code inspection confirmed `researchService.getDeviceSensors()` exists at line 425 of ResearchService.ts. Risk #8 (laterality deprecation) is deferred -- fields kept for backward compatibility, no migration needed now. This is a reasonable decision.

---

## 4. Backlog Completeness

### Story Coverage Matrix

| Brief Objective | Stories | Gaps |
|----------------|---------|------|
| Env var setup + validation | US-033 | None |
| Context state expansion | US-034 | None |
| Domain type changes | US-035 | None |
| SQLite migration v6 | US-036 | None |
| SensorSelectScreen creation | US-037 | None |
| SessionConfigScreen updates | US-038 | None |
| Favorites parity | US-039 | None |

All 7 stories are in "Ready" status with Must priority.

### Story Quality

Stories US-033 through US-039 were reviewed against the backlog (via `backlog_manager.py list`). Each story has:
- Feature area clearly tagged (`Session Redesign: *`)
- Must priority (matching brief)
- Ready status (appropriate for development start)

### Missing Stories

No gaps identified. The 7 stories cover the full scope of the brief. The architecture's dependency chain (Section in implementability notes) maps cleanly to the story order:
1. US-033 (env var) -- parallel/independent
2. US-034 (context) -- blocker for others
3. US-036 (migration) -- parallel with context
4. US-035 (domain types) -- after context
5. US-037 (SensorSelectScreen) -- after context
6. US-038 (SessionConfigScreen) -- after sensor screen
7. US-039 (favorites) -- after migration + context

---

## 5. Architecture Quality

### ADR Evaluation

Five ADRs are provided, each with clear Decision / Rationale / Consequence structure. Key observations:

**ADR-1 (Env Var)**: Sound decision. Expo's `EXPO_PUBLIC_*` pattern is standard. Build-time binding matches the institution-level deployment model described in the brief. The architecture correctly preserves research management screens for browsing while removing the session config linkage.

**ADR-2 (Separate Screen)**: Correct choice. Follows the established TopographySelectScreen pattern, which reduces implementation risk and maintains UX consistency. The alternative (inline dropdown/modal) would clutter SessionConfigScreen.

**ADR-3 (Context State)**: Appropriate. Context survives navigation and unmount/remount cycles. Route params would not provide the necessary lifecycle management (persistence across screens, reset on session end).

**ADR-4 (SQLite v6)**: Low-risk approach. Matches the existing v4/v5 migration pattern with JSON text columns. Default values ensure backward compatibility.

**ADR-5 (Conditional Validation)**: Pragmatic decision. Blocking session start when backend has no sensor data would prevent clinical work. The conditional approach (require selection only when sensors exist) is the right tradeoff.

### Data Flow

The Mermaid diagrams in Sections 4.1, 4.2, and 4.3 clearly show the target state. State ownership is well-defined: env var for researchId, context for sensor selection, SQLite for favorites persistence.

### Type Safety

Before/after type definitions in Section 5 are explicit and complete. The `CreateFavoritePayload` inheritance via `Omit` is correctly identified. No `any` types introduced.

---

## 6. Implementability Assessment

The Dev Specialist's implementability notes (embedded in the brief) provide high-confidence estimates:

- Total effort: 6-9 story points (1 sprint)
- All referenced files exist in the codebase (verified: SessionConfigFormContext.tsx, TopographySelectScreen.tsx, ClinicalSession.ts, SessionConfigScreen.tsx)
- `researchService.getDeviceSensors()` API exists (confirmed at ResearchService.ts:425)
- TopographySelectScreen provides ~70% boilerplate for SensorSelectScreen
- SQLite migration follows established v4/v5 patterns

The dependency chain is well-ordered with no circular dependencies. The 3-day implementation schedule is realistic given the pattern reuse.

---

## 7. Testability Assessment

The QA Specialist's testability notes cover 5 critical test paths:

1. Environment variable binding (3 scenarios)
2. SensorSelectScreen integration (8 scenarios)
3. SessionConfigScreen removal and migration (5 scenarios)
4. Favorites persistence (5 scenarios)
5. Data model consistency (4 scenarios)

The end-to-end happy path (10 steps) is clearly defined. Ambiguous acceptance criteria have been resolved with explicit clarifications. No testability gaps.

---

## 8. Findings Summary

### Strengths

- Tight scope with no creep beyond the brief's boundaries
- Clear traceability: brief objectives -> architecture ADRs -> backlog stories
- Pattern reuse (TopographySelectScreen) reduces risk significantly
- Conditional sensor validation (ADR-5) prevents blocking clinical workflows
- Backward-compatible schema migration preserves existing data

### Concerns

None blocking. Minor observations:

1. **Laterality deprecation deferred**: Research fields and laterality are kept in the schema for backward compatibility. This is acceptable for now but should be tracked for a future cleanup migration.

2. **SensorSelectScreen does not pre-populate from context**: Each visit starts fresh. This is intentional (avoids stale references after device change) but may surprise users who expect their previous selection to persist when navigating back. The brief does not require pre-population, so this is acceptable.

3. **Backlog stories from previous phases (US-001 through US-032)** remain in the backlog with various statuses. This does not affect the current phase but the backlog should be groomed to archive completed stories.

---

## 9. Verdict

The project brief, architecture, and backlog are aligned and complete. All business objectives are traceable through architecture decisions to backlog stories. Technical risks are identified and mitigated. The implementation approach is sound, leveraging existing patterns to minimize risk. No blocking issues found.

[VERDICT:APPROVED]

---

## TL Technical Validation

**Reviewer**: Tech Lead (Claude Code)
**Date**: 2026-03-01

---

### 1. Architecture Review

#### 1.1 ADR Assessment

All five ADRs are well-reasoned and grounded in existing codebase patterns:

**ADR-1 (Build-Time Research ID)** — APPROVED. The `EXPO_PUBLIC_*` env var mechanism is native to Expo and already used in the project. Replacing runtime research selection with a build-time constant correctly matches the institution-level deployment model. The architecture correctly keeps `researchId` and `researchTitle` in `SessionConfig` for data continuity.

**ADR-2 (SensorSelectScreen as Separate Screen)** — APPROVED. Following the `TopographySelectScreen` pattern (`apps/mobile/src/screens/TopographySelectScreen.tsx`) ensures UX consistency. The pattern is proven: `useFocusEffect` for data loading, `FlatList` for display, navigation return via context/params.

**ADR-3 (Sensor State in Context, Not Route Params)** — APPROVED. This is the correct decision. Unlike `TopographySelectScreen` which passes `updatedTopographies` via route params (a one-shot callback), sensor selections need to survive across multiple screen transitions and reset on session end. `SessionConfigFormContext` already handles both lifecycle concerns (lines 80-87 in current code).

**ADR-4 (SQLite Migration v6 with JSON Text)** — APPROVED. Follows the exact pattern of `topography_codes`/`topography_names` in the v4 migration. The `FavoriteRepository` already has `parseJsonArray()` (line 191-198) and `JSON.stringify()` helpers. Default `'[]'` ensures backward compatibility.

**ADR-5 (Conditional Sensor Validation)** — APPROVED. Blocking session start when the backend has no sensors registered would halt clinical work. The conditional logic (require if available, skip if empty) is correct.

#### 1.2 Affected Components Analysis

Verified all 9 affected files against codebase:

| Component | File | Exists | Verified |
|-----------|------|--------|----------|
| SessionConfigFormContext | `apps/mobile/src/context/SessionConfigFormContext.tsx` | Yes (130 lines) | Fields to add/remove match architecture |
| SessionConfig domain type | `packages/domain/src/models/ClinicalSession.ts` | Yes (104 lines) | Current type shape matches architecture's "BEFORE" |
| SessionConfigScreen | `apps/mobile/src/screens/SessionConfigScreen.tsx` | Yes (834 lines) | Research card at lines 376-383, dropdown 386-400 match |
| SensorSelectScreen | `apps/mobile/src/screens/SensorSelectScreen.tsx` | New file | Template: TopographySelectScreen (290 lines) |
| Navigation types | `apps/mobile/src/navigation/types.ts` | Yes (63 lines) | `HomeStackParamList` at line 44 — correct insertion point |
| HomeStack navigator | `apps/mobile/src/navigation/HomeStack.tsx` | Yes | Registration needed |
| SQLite migration v6 | `apps/mobile/src/data/migrations/v6_add_sensor_columns.ts` | New file | Migration pattern: v1-v5 verified |
| Database manager | `apps/mobile/src/data/database.ts` | Yes (152 lines) | `MIGRATIONS` array at line 21 — add v6 entry |
| FavoriteRepository | `apps/mobile/src/data/repositories/FavoriteRepository.ts` | Yes (202 lines) | `FavoriteRow` interface, `create()`, `update()`, `mapRow()` all verified |

#### 1.3 Data Flow Verification

The architecture's data flow diagrams (Sections 4.1-4.3) are correct:

1. **Env var -> startSession()**: `process.env.EXPO_PUBLIC_RESEARCH_ID` is read directly (Expo bundles it). Used in `startSession()` for `config.researchId` and in `SensorSelectScreen` for `getDeviceSensors()`. No provider needed — correct.

2. **SensorSelectScreen -> Context -> SessionConfigScreen**: Unidirectional. SensorSelectScreen writes to context on confirm, SessionConfigScreen reads and displays chips. No circular dependency risk.

3. **Favorites persistence**: `FavoriteRepository.create()` serializes `sensorIds`/`sensorNames` as JSON -> SQLite. `mapRow()` deserializes back. Pattern identical to topography fields. Verified.

#### 1.4 Type Safety Verification

Confirmed all type changes are safe:

- `Sensor` type in `@iris/domain` (`packages/domain/src/models/Sensor.ts`): has `id: string` and `name: string` — matches architecture's selection model (store IDs, display names).
- `SessionConfig.clinicalData` adding optional `sensorIds?: string[]` and `sensorNames?: string[]` — backward compatible (optional fields).
- `SessionFavorite` adding optional `sensorIds?: string[]` and `sensorNames?: string[]` — backward compatible.
- `CreateFavoritePayload` derives from `SessionFavorite` via `Omit<..., 'id' | 'createdAt' | 'updatedAt'>` — inherits new fields automatically. No manual change needed.

---

### 2. Backlog Review

#### 2.1 Story Coverage

7 stories (US-033 through US-039) covering all requirements from the brief:

| Story | Brief Requirement | Covered |
|-------|------------------|---------|
| US-033 | Env var + startup validation | Yes |
| US-034 | Context expansion (add sensors, remove research) | Yes |
| US-035 | Domain types + startSession integration | Yes |
| US-036 | SQLite migration v6 | Yes |
| US-037 | SensorSelectScreen creation | Yes |
| US-038 | SessionConfigScreen updates | Yes |
| US-039 | Favorites save/apply with sensors | Yes |

No missing stories detected. All "In Scope" items from the brief map to at least one story.

#### 2.2 Dependency Chain

Dependencies declared in backlog are correct and match architecture Section 12:

```
US-033 (env var) -> US-034 (context)
US-034 -> US-035 (domain types)
US-034 -> US-036 (SQLite migration)
US-034 -> US-037 (SensorSelectScreen)
US-037 -> US-038 (SessionConfigScreen)
US-036 + US-038 -> US-039 (favorites)
```

This matches the architecture's dependency graph. Implementation order is sound.

#### 2.3 Acceptance Criteria Quality

All stories have specific, testable acceptance criteria. Notable observations:

**US-033**: AC includes `.env.example` update, startup validation, error modal, and documentation updates. Complete.

**US-034**: AC correctly specifies both additions (`selectedSensorIds`, `selectedSensorNames`) and removals (`selectedResearchId`, `selectedResearchTitle`, `researchProjects` fetch). This is critical — the removal side is explicitly tracked.

**US-035**: AC says "researchId is sourced from EXPO_PUBLIC_RESEARCH_ID env var inside startSession(), not from a caller-supplied parameter." This is a key architectural decision correctly captured. Currently `SessionConfigScreen.handleStartSession()` (line 341) passes `researchId: selectedResearchId || undefined` — this will change to reading from env var.

**US-036**: AC includes idempotency requirement ("running it twice does not raise an error"). The `DatabaseManager.runMigrations()` (line 66-109 in `database.ts`) uses a `migrations` table to track applied versions, so a migration is never re-executed. The idempotency AC is satisfied by the migration framework itself, not the SQL. No code change needed.

**US-037**: 10 acceptance criteria covering all edge cases (no device, empty list, fetch failure, multi-select, confirm/discard). Thorough.

**US-038**: AC covers both removals and additions. Includes conditional validation logic (ADR-5). The AC "Changing the selected device clears the sensor chip strip" correctly addresses stale sensor data.

**US-039**: AC covers both new favorites (with sensors) and legacy favorites (without sensors). Backward compatibility is explicitly tested.

---

### 3. Architecture-to-Backlog Alignment

| Architecture Section | Covered by Story |
|---------------------|-----------------|
| Section 2 (ADRs) | Implicitly by US-033-039 |
| Section 4 (Data Flow) | US-034, US-035, US-037 |
| Section 5 (Type Changes) | US-034, US-035, US-036 |
| Section 6 (Navigation) | US-037 |
| Section 7 (SQLite Migration) | US-036 |
| Section 8 (SensorSelectScreen) | US-037 |
| Section 9 (SessionConfigScreen) | US-038 |
| Section 10 (Env Var) | US-033 |
| Section 12 (Dependency Graph) | Matches backlog dependencies |
| Section 13 (Risks) | Mitigations embedded in ACs |
| Section 15 (Testability) | Comprehensive test plans |

No gaps found between architecture and backlog.

---

### 4. Technical Findings

#### F-001: Conditional Validation Requires State Tracking (Medium, Non-Blocking)

**Context**: ADR-5 and US-038 AC specify conditional sensor validation — require sensors only if backend returned a non-empty list. This means `SessionConfigScreen` must know whether the backend has sensors for the selected device.

**Assessment**: The architecture does not explicitly describe how `SessionConfigScreen` knows the sensor count. `SensorSelectScreen` fetches sensors but this data is local to that screen. **Recommendation**: Add a `deviceHasSensors: boolean | null` field to `SessionConfigFormContext` (set by `SensorSelectScreen` on fetch, reset on device change). This is a minor addition that aligns with the existing pattern. Can be resolved during US-037/US-038 implementation.

#### F-002: `handleSaveFavorite` References to Removed Context Fields (Sequencing)

**Context**: `SessionConfigScreen.handleSaveFavorite()` (lines 287-310) currently passes `researchId: selectedResearchId` and `researchTitle: selectedResearchTitle` to `favoriteRepository.create()`.

**Assessment**: After US-034 removes these fields from context, this code breaks. US-039 handles the fix, but US-038 executes before US-039. During development, US-038 will temporarily break save-favorite until US-039 is completed. This is acceptable given sequential implementation, but developers should be aware. **Recommendation**: Implement US-038 and US-039 in the same PR or resolve research field references in US-038 as part of the cleanup.

#### F-003: SensorSelectScreen Does Not Pre-Populate from Context (Design, Acknowledged)

**Context**: Architecture Section 8.3 states each visit starts with a clean selection.

**Assessment**: Intentional to avoid stale sensor references after device change. Acceptable for current UX. Can be revisited if user feedback requests pre-population.

---

### 5. Risk Assessment

| # | Risk | Architecture Coverage | Backlog Coverage | Gap |
|---|------|----------------------|-----------------|-----|
| 1 | Missing env var | Section 10, Risk #1 | US-033 AC | None |
| 2 | Empty sensor list | ADR-5, Risk #2 | US-037 AC, US-038 AC | None |
| 3 | SQLite migration failure | Section 7, Risk #3 | US-036 AC | None |
| 4 | Stale sensors on device change | Section 9.4, Risk #4 | US-038 AC | None |
| 5 | API contract mismatch | Risk #5 | US-037 (verified at ResearchService.ts:425) | None |
| 6 | Conditional validation state | Not explicit | US-038 AC | F-001 (minor) |

---

### 6. Effort Assessment

Architecture estimates 6-9 story points. Code-verified breakdown:

| Story | SP | Confidence | Rationale |
|-------|----|------------|-----------|
| US-033 | 0.5 | High | Trivial env var + validation |
| US-034 | 1 | High | Mechanical additions/removals in proven pattern |
| US-035 | 1 | High | Domain type + startSession signature changes |
| US-036 | 1 | High | Copy v4 migration pattern |
| US-037 | 2 | High | TopographySelectScreen provides 70% template |
| US-038 | 2 | Medium-High | 834-line file, targeted surgery |
| US-039 | 1 | High | Favorites integration |
| **Total** | **8.5** | | Within 6-9 range, 1 sprint |

---

### 7. TL Verdict

The architecture is well-designed, follows established codebase patterns, and all source files referenced have been verified against the actual codebase. The backlog covers all brief requirements with complete, testable acceptance criteria. Dependencies are correctly ordered.

One minor finding (F-001: conditional validation state tracking) can be resolved during implementation without blocking. One sequencing note (F-002) is acceptable given the ordered implementation plan.

**No blocking issues found.**

[VERDICT:APPROVED]

---

## PO Review - Business Alignment Validation

**Reviewer**: Product Owner (Claude Code)
**Date**: 2026-03-01
**Phase**: 20 - Session Redesign

---

### 1. Story-to-Brief Traceability

All seven stories (US-033 through US-039) are aligned with the project brief objectives:

| Brief Objective | Stories | Verdict |
|-----------------|---------|---------|
| Remove research session selection from UI | US-034, US-038 | PASS — Context fields removed, SessionConfigScreen research card deleted |
| Add sensor selection step | US-037, US-038 | PASS — Dedicated SensorSelectScreen created, chip display added to SessionConfigScreen |
| Update data model for sensors | US-034, US-035, US-036 | PASS — Context state, domain types, and SQLite schema updated |
| Maintain favorites parity | US-036, US-039 | PASS — Backward-compatible migration, legacy favorites apply cleanly |

### 2. Acceptance Criteria Alignment with Architecture

All 46 acceptance criteria across the 7 stories are implementable and testable:

**Environment Configuration (US-033)**:
- AC1-5 directly implement ADR-1 (Build-Time Research ID). `.env.example` documentation, startup validation, error modal all specified. ✅

**Context State (US-034)**:
- AC1-6 implement exact type changes from Architecture Section 5.1. Field removals (`selectedResearchId`, `selectedResearchTitle`, `researchProjects`) and additions (`selectedSensorIds`, `selectedSensorNames`) are explicit. ✅

**Domain Types (US-035)**:
- AC1-5 implement the critical `startSession()` signature change from env var reading. All call sites identified for update. ✅

**SQLite Migration (US-036)**:
- AC1-6 implement the v6 migration pattern with idempotency guarantee via existing `migrations` table framework. JSON serialization helpers already exist in FavoriteRepository. ✅

**SensorSelectScreen (US-037)**:
- AC1-10 comprehensively cover edge cases: missing device (skip fetch), empty sensor list (non-blocking), fetch failure (retry), multi-select, confirm/discard. Matches Architecture Section 8 design exactly. ✅

**SessionConfigScreen Updates (US-038)**:
- AC1-9 cover both removal (research fields) and addition (sensor chips). Conditional validation logic (AC7-8) directly implements ADR-5. Device-change clearing of sensors (AC6) prevents stale data. ✅

**Favorites Integration (US-039)**:
- AC1-5 explicitly address backward compatibility ("Favorites saved before v6 migration apply cleanly") and optional sensors. No breaking changes to the favorite schema. ✅

### 3. No Scope Creep Detected

Stories strictly cover the brief scope:
- Mobile app only (IRIS/apps/mobile + @iris/domain)
- No backend changes required
- No device firmware changes required
- No desktop app changes required

Out-of-scope items correctly excluded:
- Backend sensor management (already implemented via `researchService.getDeviceSensors()` — verified at ResearchService.ts:425)
- Device sensor configuration (handled by Bluetooth protocol, out of scope)
- Production certificate management (deferred)

### 4. Business Rule Completeness

**Institution-Level Deployment Model**:
- Brief states: "ResearchId as environment variable set at build time per institution"
- US-033 AC implements this exactly: "no user interaction is required to supply a researchId during session creation"
- Result: ✅ Researchers cannot accidentally select the wrong institution's research project

**Conditional Sensor Validation (ADR-5)**:
- Brief: "Allow sessions to start even if no sensors are selected"
- US-038 AC7-8 implements: "If backend returned a non-empty sensor list, button is disabled; if backend returned zero sensors, button is NOT blocked"
- Result: ✅ Clinical work is not halted by empty sensor data; users can add sensors later

**Backward Compatibility**:
- Brief: "Ensure existing data is not lost during migration"
- US-036 AC2: "Existing v5 rows are preserved after migration"
- US-039 AC3: "Favorites saved before v6 migration apply cleanly"
- Result: ✅ No data loss on upgrade; legacy favorites continue to work

### 5. Risk Mitigation Alignment

All risks from the brief and TL assessment have explicit story coverage:

| Risk | Mitigation | Story | AC Reference |
|------|-----------|-------|--------------|
| Missing env var | Startup validation + error modal | US-033 | AC3-4 |
| Empty sensor list | Conditional validation, not blocking | US-038 | AC7-8 |
| Existing favorites lose sensor data | Keep schema fields, don't truncate | US-036, US-039 | AC2, AC3 |
| User confusion from research removal | Institution-level deployment (no choice to remove) | Brief scoping, US-033 | AC1 |
| Conditional validation state tracking | deviceHasSensors field (noted in TL F-001) | US-038 | AC6 |

### 6. Dependencies Are Correctly Ordered

The 7 stories form a sound dependency chain:

```
US-033 (env var setup)
  ↓
US-034 (context expansion) ← must occur before screen development
  ├→ US-035 (domain types) ← depends on context pattern
  ├→ US-036 (SQLite v6) ← parallel work on persistence
  └→ US-037 (SensorSelectScreen) ← depends on context pattern
        ↓
      US-038 (SessionConfigScreen updates) ← must wire SensorSelectScreen
        ↓
      US-039 (favorites integration) ← must include migration + screen updates
```

No circular dependencies. Implementation order is optimal (parallel paths for US-035/036/037, sequential for UI integration).

### 7. Product Owner Verdict

**All business objectives are traceable from brief → architecture → backlog stories.**

**All seven stories (US-033 through US-039) are aligned, complete, and ready for development.**

No ambiguities detected. No missing coverage. Acceptance criteria are specific and testable. Risk mitigations are explicit.

**Approval Status: ✅ READY FOR DEVELOPMENT**

Stories should be moved from "Ready" to "In Development" once the dev team begins US-033.

[PO_ALIGNMENT_NOTES:APPROVED]
