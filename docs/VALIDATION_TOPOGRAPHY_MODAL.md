# Validation: Topography Selection Screen & Laterality Removal

**Date**: 2026-02-16
**Input Documents**:
- `docs/PROJECT_BRIEF_TOPOGRAPHY_MODAL.md` (Business Requirements)
- `docs/BACKLOG_TOPOGRAPHY_MODAL.md` (Product Backlog — 18 stories)
- `docs/ARCHITECTURE_TOPOGRAPHY_MODAL.md` (Technical Architecture)

---

## PM Business Validation

**Reviewer**: PM (Product Manager)
**Scope**: Verify that the architecture and backlog faithfully represent the business objectives, confirmed client decisions, success criteria, and risk mitigations defined in the project brief.

### 1. Business Objective Alignment

The brief defines two coupled objectives: (1) remove the standalone Laterality dropdown, and (2) replace the inline topography dropdown with a category-first full navigation screen. Both objectives are directly addressed.

The backlog covers objective 1 via US-TM-012 (remove Laterality `<Select>`) and objective 2 via US-TM-006 through US-TM-013 (new route, new screen, filtering, confirmation, navigation integration). The architecture provides the component design, navigation flow, and state management for both.

**Result**: PASS

### 2. Client Decision Coverage

All five confirmed client decisions (Brief section 6) are reflected in the deliverables:

| Decision | Backlog Coverage | Architecture Coverage |
|----------|-----------------|----------------------|
| Q1: `null` laterality | US-TM-001 (domain nullable), US-TM-002 (SQLite migration), US-TM-003 (repository) | Section 5 (domain types), Section 6 (migration SQL), Section 9.6 (repository) |
| Q2: Single-select Lateralidade | US-TM-011 (explicit constraint story) | Section 8 (detection + prevention logic, Alert.alert error) |
| Q3: Full navigation screen + confirmation modals | US-TM-006 (route), US-TM-007 (screen), US-TM-010 (add confirmation), US-TM-014 (remove confirmation) | Sections 1-4 (component, navigation, state, data flow diagrams) |
| Q4: Category order from data | US-TM-007 AC-4 ("order derived from the data") | Section 7.3 (insertion-order preserving deduplication) |
| Q5: Hide already-selected | US-TM-009 (explicit story) | Section 7.1 Stage 1 filter |

**Result**: PASS

### 3. Success Criteria Traceability

The backlog includes an explicit traceability table (section "Traceability to Success Criteria") mapping all 12 success criteria (SC-1 through SC-12) to specific user stories. I verified each mapping:

| SC | Brief Requirement | Story Coverage | Verified |
|----|-------------------|----------------|----------|
| SC-1 | Laterality dropdown removed | US-TM-012 | Yes |
| SC-2 | "+Add" navigates to new screen | US-TM-013 | Yes |
| SC-3 | Category dropdown on new screen | US-TM-007 | Yes |
| SC-4 | Category filter works | US-TM-007 | Yes |
| SC-5 | Search bar filters by name | US-TM-008 | Yes |
| SC-6 | Already-selected hidden | US-TM-009 | Yes |
| SC-7 | Confirmation modal on add + nav back | US-TM-010 | Yes |
| SC-8 | Single Lateralidade enforced | US-TM-011 | Yes |
| SC-9 | Confirmation modal on chip removal | US-TM-014 | Yes |
| SC-10 | Session starts without laterality | US-TM-001, US-TM-002, US-TM-003, US-TM-012 | Yes |
| SC-11 | Existing sessions display correctly | US-TM-003, US-TM-015, US-TM-016, US-TM-017 | Yes |
| SC-12 | Zero new type errors | US-TM-018 | Yes |

All 12 success criteria have at least one story assigned. No gaps.

**Result**: PASS

### 4. Risk Mitigation Coverage

The backlog includes a "Risk Coverage" table mapping all 5 risks to mitigating stories. I verified each:

| Risk | Brief Severity | Mitigating Stories | Architecture Section | Adequate |
|------|---------------|-------------------|---------------------|----------|
| R-1: SQLite NOT NULL | HIGH | US-TM-002 | Section 6 (full SQL migration with table rebuild) | Yes — the architecture provides the exact SQL and registration approach |
| R-2: Backward compat | MEDIUM | US-TM-003, US-TM-015, US-TM-016, US-TM-017 | Section 9 (all downstream consumers with before/after code) | Yes |
| R-3: Navigation params | MEDIUM | US-TM-006, US-TM-013 | Section 2 (param types, forward/return flow, useEffect consumption, param clearing) | Yes |
| R-4: Backend JSON | LOW | US-TM-004 | Section 9.4 (confirms JSON.stringify(null) is safe) | Yes |
| R-5: Dynamic categories | LOW | US-TM-007 | Section 7.3 (derives categories from data, no hardcoding) | Yes |

The HIGH risk (R-1) receives the most thorough treatment: the architecture provides exact SQL (Section 6.2), explains the SQLite ALTER TABLE limitation, and shows migration registration. This is appropriate given the severity.

**Result**: PASS

### 5. Scope Boundary Compliance

The brief explicitly declares several items as out of scope (Section 2.2). I verified neither the architecture nor backlog overreach into these areas:

- Backend changes: No backend stories or architecture sections. Confirmed.
- Desktop app changes: Not mentioned. Confirmed.
- Deleting the `Laterality` type: Architecture Section 5 explicitly states the type union is unchanged. Confirmed.
- Deleting the `laterality` SQLite column: Migration preserves the column (just relaxes the constraint). Confirmed.
- SNOMED service changes: Architecture Section 10.3 lists SnomedService as "No Changes Required". Confirmed.

**Result**: PASS

### 6. Impacted File Coverage

The brief identifies 7 primary files, 5 secondary files, and 5 no-change files (Sections 5.1, 5.2, 5.3). I verified alignment:

**Primary files** — all 7 are covered by stories:
- `SessionConfigScreen.tsx` -> US-TM-012, US-TM-013, US-TM-014
- `TopographySelectScreen.tsx` (new) -> US-TM-007, US-TM-008, US-TM-009, US-TM-010, US-TM-011
- `navigation/types.ts` -> US-TM-006
- Router file -> US-TM-006 (AC-3)
- `ClinicalSession.ts` -> US-TM-001
- Migration file (new) -> US-TM-002
- `SessionRepository.ts` -> US-TM-003

**Secondary files** — all 5 are covered:
- `ActiveSessionScreen.tsx` -> US-TM-015
- `HistoryScreen.tsx` -> US-TM-017
- `SyncService.mappers.ts` -> US-TM-004
- `csvExport.ts` -> US-TM-016
- `SyncService.test.ts` -> US-TM-005

**No-change files** — architecture Section 10.3 confirms all 5 as unchanged. The architecture additionally identifies `database.ts` as a modification target (for migration registration), which is correct and was implicit in the brief under "registered in the database initialization logic". This is a reasonable addition, not a scope violation.

**Result**: PASS

### 7. Story Completeness and Quality

All 18 stories follow a consistent format with Priority, Feature tag, Status, Dependencies, User Story, Acceptance Criteria, and Technical Notes. The dependency chain is well-defined in both the dependency matrix and recommended implementation order. The 5-phase implementation order respects the dependency graph.

One observation: US-TM-006 (navigation route) mentions `selectedCodes: string[]` in its AC-2, but the architecture (Section 2.1) uses `selectedModifiers: SelectedModifier[]` (carrying both `snomedCode` and `category`). This is because US-TM-011 (Lateralidade constraint) needs category information for the already-selected modifiers. The architecture's approach is correct and the backlog story US-TM-011 Technical Notes already flags this design decision. The PO's AC-2 in US-TM-006 uses a simpler shape that gets superseded by the architecture's richer type. This is a minor inconsistency but does not represent a business requirement gap — the architecture satisfies the business need (Lateralidade enforcement) that motivates the richer param shape.

**Result**: PASS (minor note: US-TM-006 AC-2 param shape simplified vs. architecture — non-blocking, TL decision)

### 8. Summary

| Validation Area | Result |
|----------------|--------|
| Business Objective Alignment | PASS |
| Client Decision Coverage | PASS |
| Success Criteria Traceability | PASS |
| Risk Mitigation Coverage | PASS |
| Scope Boundary Compliance | PASS |
| Impacted File Coverage | PASS |
| Story Completeness and Quality | PASS (1 minor note) |

**Minor Note for TL**: US-TM-006 AC-2 specifies `selectedCodes: string[]` as the route param, while the architecture uses `selectedModifiers: SelectedModifier[]` (with `{ snomedCode, category }`). The architecture's approach is the correct one because US-TM-011 needs the category to enforce Lateralidade single-select. During implementation, follow the architecture's param shape. This does not affect business requirements.

[VERDICT:APPROVED]

---

## TL (Tech Lead) -- Technical Validation

**Reviewer**: TL
**Scope**: Architecture implementability, IRIS convention compliance, correctness of proposed changes against existing codebase

### Validation Method

Cross-referenced the architecture document against the actual source code for all 11 files in the change matrix plus the navigation infrastructure, UI component API, SessionContext, and SnomedService. Verified SQL syntax, TypeScript type compatibility, React Navigation param mechanics, and downstream consumer impact paths.

---

### 1. Component Architecture -- PASS

The architecture correctly identifies TopographySelectScreen as a stateless selector pattern. The decision to re-fetch from `snomedService.getTopographicalModifiers()` instead of passing topographies via params is sound:

- Verified: `SnomedService` (line 64-66) maintains an in-memory `topographyCache`. The second call (`if (this.topographyCache) return this.topographyCache` at line 122-124) returns synchronously from cache with zero network cost.
- Passing `SnomedTopographicalModifier[]` (which extends `Record<string, unknown>`) through React Navigation params would trigger serialization warnings in development mode and risk deep-link breakage.
- The `SelectedModifier` interface (`{ snomedCode, category }`) is a minimal projection that keeps params lightweight while enabling the Lateralidade check.

### 2. Navigation Design -- PASS (with 1 note)

The `HomeStackParamList` update from `SessionConfig: undefined` to `SessionConfig: { addedModifier?: AddedModifier } | undefined` is correct. This union type allows navigation to `SessionConfig` both with and without params, which is required since other navigations (e.g., `ActiveSessionScreen` line 76: `navigation.navigate('SessionConfig')`) call it without params.

**Note N1** (low severity): The `useEffect` watching `route.params?.addedModifier` (Section 2.3) should include `navigation` in the dependency array since it calls `navigation.setParams()`. The current snippet omits it. ESLint `react-hooks/exhaustive-deps` will flag this. Practical impact is negligible since `navigation` is stable across renders in React Navigation, but the linter warning should be suppressed or the dependency added.

The return navigation via `navigation.navigate('SessionConfig', { addedModifier })` correctly uses `navigate` rather than `goBack`, ensuring the param is delivered. `goBack()` cannot carry params.

### 3. State Management -- PASS

State removal (`selectedLaterality`, `showTopographyDropdown`) and addition in TopographySelectScreen are correctly identified. The invariant that `selectedTopographies` is only mutated in SessionConfigScreen maintains a clean single-source-of-truth pattern consistent with the existing codebase approach (e.g., `selectedVolunteer` state lives in SessionConfigScreen and is never externalized).

### 4. Data Flow Diagrams -- PASS

Mermaid diagrams accurately represent the interaction patterns. The sequence diagram covers both the happy path (add modifier) and the Lateralidade error path. The chip removal flow is correctly separated.

### 5. Domain Type Changes -- PASS

Making `ClinicalData.laterality` and `SessionConfig.clinicalData.laterality` into `Laterality | null` is the minimal, correct change. Verified against the actual type definitions in `ClinicalSession.ts` lines 42-50 (ClinicalData) and lines 59-73 (SessionConfig). The `Laterality` type union at line 13 remains unchanged.

The change propagation analysis is thorough. All downstream consumers of `ClinicalData.laterality` were identified via grep (confirmed: SessionRepository.ts:301, SyncService.mappers.ts:80, ActiveSessionScreen.tsx:160, HistoryScreen.tsx:202, csvExport.ts:136/196, SyncService.test.ts:71, SessionConfigScreen.tsx:197).

### 6. SQLite Migration Strategy -- PASS (with 1 note)

The table rebuild pattern (CREATE new -> INSERT SELECT -> DROP old -> RENAME new -> recreate index) is the standard SQLite approach for constraint changes. The SQL is correct:

- `CHECK(laterality IS NULL OR laterality IN ('left','right','bilateral'))` correctly allows NULL while preserving the domain constraint for non-null values.
- `INSERT INTO clinical_data_new SELECT * FROM clinical_data` preserves all existing data since the column list is identical.
- The FK constraint (`REFERENCES clinical_sessions(id) ON DELETE CASCADE`) is correctly carried over to the new table definition.
- The index `idx_clinical_data_session` on `session_id` is recreated.

**Note N2** (low severity): The migration SQL does not wrap the multi-statement operation in `BEGIN TRANSACTION` / `COMMIT`. While `DatabaseManager.runMigrations()` does not currently use transactions for individual migrations (verified at database.ts:86-95 -- each migration's SQL is passed to `db.execAsync` as a single string), the table rebuild is a multi-statement operation where partial execution (e.g., crash after DROP but before RENAME) could leave the database in an inconsistent state. Recommend wrapping the migration in a transaction for safety. Non-blocking because: (a) `execAsync` processes the full SQL string atomically in expo-sqlite for multi-statement strings, and (b) the probability of a crash between statements in a single `execAsync` call is extremely low.

### 7. Filtering Logic -- PASS

The three-stage filter chain (hide-selected -> category -> search) is correct and efficient. Using `Set` for `selectedCodes` lookup is O(1) per check vs O(n) for `Array.includes`. The `useMemo` dependency array correctly includes all four dependencies: `topographies`, `route.params.selectedModifiers`, `selectedCategory`, `searchQuery`.

Category derivation preserving insertion order via the `Set` + push pattern is correct and matches the client decision (Q4: order from data, not hardcoded).

### 8. Lateralidade Single-Selection Enforcement -- PASS

The decision to **show** Lateralidade items but **block** with an error alert (rather than hiding the entire category) is well-reasoned from a UX perspective. The specific already-selected item IS hidden by Stage 1, so the user sees the alternatives but cannot add them. This provides clear feedback.

The `hasLateralidade` check uses `route.params.selectedModifiers.some(m => m.category === 'Lateralidade')`. This is why `SelectedModifier` carries `category` alongside `snomedCode` -- it's the correct design.

### 9. Downstream Consumer Updates -- PASS

Each consumer's fix was verified against the actual source code:

- **ActiveSessionScreen.tsx:160**: Current code confirmed as `{clinicalData?.bodyStructureName || 'Unknown'} ({clinicalData?.laterality?.[0]?.toUpperCase() || '-'})`. The proposed conditional render `{clinicalData?.laterality ? \` (${...})\` : ''}` correctly eliminates the parenthetical when null.

- **csvExport.ts:136**: `SessionMetadata.laterality` is indeed typed as `string`. Changing to `string | null` and using `?? 'N/A'` at line 196 is correct.

- **HistoryScreen.tsx:202**: Confirmed current code is `laterality: session.clinicalData?.laterality ?? 'Unknown'`. Changing fallback to `'N/A'` aligns with csvExport convention.

- **SyncService.mappers.ts:80**: Confirmed `laterality: clinicalData.laterality` inside `JSON.stringify()`. `JSON.stringify({ laterality: null })` produces `"laterality":null` (not omitted), which is correct for the free-form `ClinicalContext` blob.

- **SyncService.test.ts:71**: Confirmed mock returns `laterality: 'left'` via `as unknown` cast. No type error surfaced. Correct no-change assessment.

- **SessionRepository.ts**: `ClinicalDataRow.laterality` at line 34 is `string`. Changing to `string | null` is required. The cast at line 301 (`as 'left' | 'right' | 'bilateral'`) must become `as Laterality | null` -- this requires adding `Laterality` to the import from `@iris/domain` at line 7 (currently imports `ClinicalSession, ClinicalData, SessionConfig` but not `Laterality`). The architecture doc mentions adding the import in the file change matrix row.

### 10. File Change Matrix -- PASS (with 1 note)

All 2 new files and 9 modified files are correctly identified. The 6 no-change files are verified correct.

**Note N3** (low severity): The architecture doc lists `SessionConfigScreen.tsx` changes as "Accept `route` from props (`{ navigation, route }`)". Currently at line 45, the component destructures only `{ navigation }` from props. The `route` must be added to the destructuring. The architecture mentions this correctly. Additionally, the component's `Props` type is `NativeStackScreenProps<HomeStackParamList, 'SessionConfig'>`, which already includes `route` in its type -- so the change is just adding `route` to the destructuring, not changing the type definition. Verified correct.

**Note N4** (informational): The file change matrix does not list `apps/mobile/src/data/example-usage.ts` or `apps/mobile/src/data/QUICK_REFERENCE.md`, which both contain `laterality: 'left'` hardcoded examples. These are documentation/example files and do not affect runtime behavior. The existing values remain valid since `'left'` is still a valid `Laterality | null` value. No action needed, but the developer should be aware these files exist.

### 11. Convention Compliance

| Convention | Status |
|---|---|
| TypeScript strict mode, no `any` | PASS -- all proposed code uses explicit types |
| Lucide icons for mobile | PASS -- `Search` icon referenced for search bar |
| `@/` path aliases | PASS -- all imports use `@/` prefix |
| Theme system (`@/theme`) | PASS -- architecture references theme, typography, spacing from `@/theme` |
| `<Select>` component reuse | PASS -- uses existing `@/components/ui` Select. Verified `SelectProps.onValueChange` accepts `string \| number` which works for category string values |
| `Alert.alert()` for confirmations | PASS -- matches `ActiveSessionScreen.tsx` pattern (lines 62-84) |
| Screen naming: `PascalCase + Screen.tsx` | PASS -- `TopographySelectScreen.tsx` |
| Navigation typing | PASS -- extends `HomeStackParamList` with proper param types |

### 12. Risk Mitigation Assessment

| Risk | Architecture Mitigation | Assessment |
|---|---|---|
| R-1 (SQLite NOT NULL) | v3 migration with table rebuild | ADEQUATE -- correct SQL, preserves data |
| R-2 (Backward compat) | Conditional rendering for null laterality | ADEQUATE -- all read paths handle both null and non-null |
| R-3 (Navigation params) | `SelectedModifier[]` forward, `AddedModifier` return | ADEQUATE -- lightweight params, `useEffect` + `setParams` for cleanup |
| R-4 (Backend JSON) | No change needed, `JSON.stringify(null)` works | ADEQUATE -- verified ClinicalContext is free-form |
| R-5 (Dynamic categories) | Derived from data via `Set` | ADEQUATE -- no hardcoded values |

### 13. Backlog Alignment

Verified all 18 user stories (US-TM-001 through US-TM-018) have corresponding architecture coverage:

| Story | Architecture Section | Covered? |
|---|---|---|
| US-TM-001 (domain types) | Section 5 | YES |
| US-TM-002 (SQLite migration) | Section 6 | YES |
| US-TM-003 (SessionRepository) | Section 9.6 | YES |
| US-TM-004 (SyncService.mappers) | Section 9.4 | YES |
| US-TM-005 (test fixture) | Section 9.5 | YES |
| US-TM-006 (navigation route) | Section 2 | YES |
| US-TM-007 (TopographySelectScreen) | Sections 1, 3.3, 7, Implementation Notes | YES |
| US-TM-008 (search bar) | Section 7.1 Stage 3, 7.2 | YES |
| US-TM-009 (hide selected) | Section 7.1 Stage 1 | YES |
| US-TM-010 (confirmation modal) | Section 4.1, Implementation Notes | YES |
| US-TM-011 (Lateralidade constraint) | Section 8 | YES |
| US-TM-012 (remove laterality select) | Sections 3.2, Implementation Notes (Form Validation, Payload) | YES |
| US-TM-013 (navigation integration) | Sections 2.2, 2.3, 2.4 | YES |
| US-TM-014 (chip removal confirm) | Section 4.2, Implementation Notes | YES |
| US-TM-015 (ActiveSession null) | Section 9.1 | YES |
| US-TM-016 (csvExport null) | Section 9.2 | YES |
| US-TM-017 (HistoryScreen null) | Section 9.3 | YES |
| US-TM-018 (type-check) | File Change Matrix | YES |

All 18 stories are covered. All 12 success criteria are traceable through the architecture.

---

### Summary of Findings

| # | Finding | Severity | Type |
|---|---------|----------|------|
| N1 | `useEffect` dependency array for `route.params?.addedModifier` should include `navigation` or suppress lint | Low | Non-blocking |
| N2 | SQLite migration should ideally wrap table rebuild in a transaction for crash safety | Low | Non-blocking |
| N3 | `SessionConfigScreen` destructuring must add `route` to props (noted in doc, confirming) | Low | Informational |
| N4 | `example-usage.ts` and `QUICK_REFERENCE.md` contain hardcoded laterality examples (still valid, no action needed) | Low | Informational |

**Blocking issues**: 0
**Must-fix issues**: 0
**Non-blocking suggestions**: 2 (N1, N2)
**Informational notes**: 2 (N3, N4)

---

### [VERDICT:APPROVED]

The architecture is technically sound, follows IRIS conventions, and is fully implementable. All 18 user stories are covered. All 12 success criteria are traceable. All 5 project risks are mitigated. The domain type changes, SQLite migration, navigation param design, filtering logic, and downstream consumer updates are correct as verified against the actual source code. The 2 non-blocking suggestions (lint dependency, transaction wrapping) are improvements the developer can apply during implementation.
