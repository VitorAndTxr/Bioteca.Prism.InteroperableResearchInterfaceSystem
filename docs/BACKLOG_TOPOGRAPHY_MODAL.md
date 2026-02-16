# BACKLOG: Topography Selection Screen & Laterality Removal

**Document Type**: Product Backlog
**Date**: 2026-02-16
**Author**: PO (Product Owner)
**Status**: READY FOR VALIDATION
**Input**: `docs/PROJECT_BRIEF_TOPOGRAPHY_MODAL.md`
**Total Stories**: 18

---

## Summary

This backlog breaks the Topography Selection Screen & Laterality Removal project brief into 18 user stories across 5 work areas. Stories are ordered by dependency: domain type changes and SQLite migration first, then repository and mapper adjustments, then the new TopographySelectScreen, then SessionConfigScreen modifications, and finally downstream consumer graceful handling and verification.

**Dependency Chain**:

```
WA1 (Domain Types + SQLite Migration) ──> WA2 (Repository + Mapper Updates)
                                      ──> WA3 (TopographySelectScreen)
                                      ──> WA4 (SessionConfigScreen Modifications)
WA2 + WA3 + WA4 ──> WA5 (Downstream Graceful Handling + Verification)
```

**Story ID Format**: `US-TM-XXX` (Topography Modal)

---

## Work Area 1 -- Domain Types and SQLite Migration (Foundation Layer)

These stories must be completed first. Every subsequent change depends on the domain type allowing `null` laterality and the SQLite schema supporting it.

---

### US-TM-001: Make ClinicalData.laterality nullable in @iris/domain

**Priority**: HIGH
**Feature**: Domain Type Changes
**Status**: Ready

**As a** developer
**I want** the `ClinicalData.laterality` and `SessionConfig.clinicalData.laterality` fields to accept `null`
**So that** sessions can be created without a standalone laterality selection

**Acceptance Criteria**:
1. In `packages/domain/src/models/ClinicalSession.ts`, `ClinicalData.laterality` type changes from `Laterality` to `Laterality | null`
2. In `packages/domain/src/models/ClinicalSession.ts`, `SessionConfig.clinicalData.laterality` type changes from `Laterality` to `Laterality | null`
3. The `Laterality` type union itself remains unchanged (`'left' | 'right' | 'bilateral'`)
4. No other fields in `ClinicalData` or `SessionConfig` are modified
5. Zero new type errors introduced in `@iris/domain` (`npm run type-check:all` for the domain package)

**Technical Notes**: The `Laterality` type is exported from `ClinicalSession.ts` and used by multiple consumers (SessionRepository, SyncService.mappers, ActiveSessionScreen, csvExport). Making the field nullable will surface type errors in those consumers, which are addressed by subsequent stories.

---

### US-TM-002: Create SQLite migration v3 to relax laterality NOT NULL constraint

**Priority**: HIGH
**Feature**: Data Model Adjustment
**Status**: Ready

**As a** developer
**I want** a new SQLite migration that makes the `laterality` column nullable in the `clinical_data` table
**So that** new sessions can be inserted with `NULL` laterality without violating the CHECK constraint

**Acceptance Criteria**:
1. New migration file created at `apps/mobile/src/data/migrations/v3_relax_laterality_constraint.ts`
2. Migration uses SQLite table rebuild pattern (CREATE temp table, copy data, DROP original, RENAME temp) because SQLite does not support `ALTER COLUMN`
3. New CHECK constraint allows NULL: `CHECK(laterality IS NULL OR laterality IN ('left','right','bilateral'))`
4. All existing data with non-null laterality values ('left', 'right', 'bilateral') is preserved during the rebuild
5. All other columns and constraints on `clinical_data` remain unchanged (id, session_id FK, body_structure_snomed_code, body_structure_name, topography_codes, topography_names)
6. The migration is registered in the database initialization logic (wherever v1 and v2 are registered)

**Technical Notes**: The current v1 migration defines `laterality TEXT NOT NULL CHECK(laterality IN ('left','right','bilateral'))`. SQLite does not support `ALTER TABLE ... ALTER COLUMN`, so the entire table must be rebuilt. Follow the pattern: CREATE TABLE clinical_data_temp with the relaxed constraint, INSERT INTO clinical_data_temp SELECT * FROM clinical_data, DROP TABLE clinical_data, ALTER TABLE clinical_data_temp RENAME TO clinical_data, recreate the index on session_id.

---

## Work Area 2 -- Repository and Mapper Updates

These stories adapt the persistence and sync layers to handle nullable laterality.

---

### US-TM-003: Update SessionRepository to handle null laterality

**Priority**: HIGH
**Feature**: Repository Update
**Status**: Ready
**Depends On**: US-TM-001, US-TM-002

**As a** developer
**I want** the SessionRepository to correctly insert and read `null` laterality values
**So that** sessions without laterality can be persisted and retrieved from SQLite

**Acceptance Criteria**:
1. `SessionRepository.create()` passes `null` (not the string `'null'`) to the SQL INSERT when `config.clinicalData.laterality` is `null`
2. `SessionRepository.mapClinicalData()` returns `null` for laterality when the database row contains `NULL`, not the string `'null'` or `undefined`
3. The `ClinicalDataRow` interface in SessionRepository is updated: `laterality: string | null`
4. The type cast in `mapClinicalData` accounts for `null`: `laterality: row.laterality as Laterality | null`
5. Existing sessions with non-null laterality continue to be read correctly

**Technical Notes**: Currently at `SessionRepository.ts:301`, the cast is `row.laterality as 'left' | 'right' | 'bilateral'`. This must become `row.laterality as Laterality | null` to handle null values from the database. The INSERT at line 162 already passes `config.clinicalData.laterality` directly, which will naturally pass `null` when the value is `null`.

---

### US-TM-004: Update SyncService.mappers to handle null laterality

**Priority**: HIGH
**Feature**: Sync Mapper Update
**Status**: Ready
**Depends On**: US-TM-001

**As a** developer
**I want** the SyncService mappers to correctly serialize `null` laterality in the ClinicalContext JSON blob
**So that** sessions synced to the backend include `laterality: null` instead of omitting the field

**Acceptance Criteria**:
1. In `mapToCreateSessionPayload()`, the `ClinicalContext` JSON string includes `"laterality": null` when `clinicalData.laterality` is `null`
2. No changes needed to the actual logic (JSON.stringify naturally handles `null` values), but verify the function signature accepts `ClinicalData` with nullable laterality without type errors
3. Zero type errors in `SyncService.mappers.ts` after the domain type change

**Technical Notes**: The current `mapToCreateSessionPayload` at line 80 does `laterality: clinicalData.laterality`. Since `JSON.stringify` serializes `null` as `null` (not omitted), no code change should be needed beyond ensuring the type compiles. The `ClinicalContext` is a free-form JSON blob on the backend, so `null` is safe.

---

### US-TM-005: Update SyncService.test.ts fixture for nullable laterality

**Priority**: MEDIUM
**Feature**: Test Update
**Status**: Ready
**Depends On**: US-TM-001

**As a** developer
**I want** the SyncService test fixtures to reflect the nullable laterality domain type
**So that** tests compile and validate behavior for both null and non-null laterality

**Acceptance Criteria**:
1. The mock `getClinicalData` return value at `SyncService.test.ts:71` remains valid (non-null laterality `'left'` is still a valid value)
2. If any type error surfaces from the domain change, the fixture is updated to compile cleanly
3. Consider adding a comment noting that `null` laterality is valid for new sessions

**Technical Notes**: The existing fixture uses `laterality: 'left'`, which remains valid after the type change. This story is primarily about verification, not code change. If the type system flags an issue, fix it.

---

## Work Area 3 -- TopographySelectScreen (New Component)

The new full navigation screen that replaces the inline topography dropdown.

---

### US-TM-006: Add TopographySelect route to HomeStack navigation

**Priority**: HIGH
**Feature**: Navigation
**Status**: Ready

**As a** developer
**I want** a `TopographySelect` route registered in the Home stack navigator
**So that** the SessionConfigScreen can navigate to the new TopographySelectScreen

**Acceptance Criteria**:
1. `HomeStackParamList` in `apps/mobile/src/navigation/types.ts` includes a `TopographySelect` entry
2. Route params include `selectedCodes: string[]` (codes of already-selected topographies, to hide them from the list)
3. The Home stack navigator (router file) registers the `TopographySelectScreen` component for the `TopographySelect` route
4. The screen header title is "Select Topography" (or similar descriptive title)
5. Navigation back (hardware back button, header back arrow) returns to SessionConfigScreen without adding a modifier

**Technical Notes**: The return mechanism for the selected modifier should use `navigation.navigate('SessionConfig', { addedModifier: ... })` or equivalent. The `SessionConfig` route params in `HomeStackParamList` must be updated from `undefined` to accept optional `addedModifier` data. The `addedModifier` param should carry `{ snomedCode: string; displayName: string; category: string }`.

---

### US-TM-007: Create TopographySelectScreen with category dropdown

**Priority**: HIGH
**Feature**: New Screen
**Status**: Ready
**Depends On**: US-TM-006

**As a** developer
**I want** a TopographySelectScreen with a category `<Select>` dropdown at the top
**So that** users can filter topographical modifiers by category before selecting one

**Acceptance Criteria**:
1. New file created at `apps/mobile/src/screens/TopographySelectScreen.tsx`
2. Screen layout from top to bottom: category `<Select>` dropdown, search bar, filtered modifier list
3. The category dropdown shows all unique categories derived from the topographies data (`[...new Set(topographies.map(t => t.category))]`)
4. Categories appear in the dropdown in the order they are derived from the data (no hardcoded ordering)
5. When no category is selected, the modifier list is empty (user must pick a category first)
6. Screen uses existing `<Select>` component from `@/components/ui`
7. Screen follows IRIS mobile design patterns (theme, typography, spacing from `@/theme`)

**Technical Notes**: The topographies data can be either (a) passed via navigation params from SessionConfigScreen, or (b) re-fetched from `snomedService.getTopographicalModifiers()` on mount. Option (a) avoids a redundant API call but increases param size. Option (b) is simpler. Architecture doc should decide. The `SnomedTopographicalModifier` type already has `category: string`.

---

### US-TM-008: Implement search bar filtering on TopographySelectScreen

**Priority**: HIGH
**Feature**: Search and Filtering
**Status**: Ready
**Depends On**: US-TM-007

**As a** developer
**I want** a search bar that filters modifiers by display name within the selected category
**So that** users can quickly find a specific modifier without scrolling through the full list

**Acceptance Criteria**:
1. A search `<Input>` is rendered below the category dropdown with a search icon
2. Typing in the search bar filters the modifier list to show only items whose `displayName` contains the search text (case-insensitive)
3. The search filter is combined with the category filter (both must match)
4. Clearing the search bar restores the full list for the selected category
5. Search is responsive (no network call -- client-side filtering only)

**Technical Notes**: Use the existing `<Input>` component with `leftIcon` set to a `<Search>` icon from lucide-react-native, matching the volunteer search pattern in SessionConfigScreen.

---

### US-TM-009: Hide already-selected modifiers from the TopographySelectScreen list

**Priority**: HIGH
**Feature**: Selection State
**Status**: Ready
**Depends On**: US-TM-007

**As a** developer
**I want** modifiers that are already selected as chips on SessionConfigScreen to be hidden from the TopographySelectScreen list
**So that** users cannot add duplicate modifiers

**Acceptance Criteria**:
1. The `selectedCodes` navigation param (string array of SNOMED codes) is used to filter out already-selected modifiers from the displayed list
2. A modifier whose `snomedCode` is in `selectedCodes` does not appear in the list regardless of category or search query
3. If all modifiers in a category are already selected, the list shows an empty state message (e.g., "All modifiers in this category are already selected")
4. When a modifier is added and the user navigates back and then opens TopographySelectScreen again, the newly added modifier is also hidden

**Technical Notes**: The filtering is straightforward: `topographies.filter(t => !selectedCodes.includes(t.snomedCode))`. Apply this filter before category and search filters.

---

### US-TM-010: Implement confirmation modal on modifier selection

**Priority**: HIGH
**Feature**: Confirmation UX
**Status**: Ready
**Depends On**: US-TM-007

**As a** developer
**I want** a confirmation modal to appear when the user taps a modifier in the TopographySelectScreen list
**So that** accidental selections are prevented

**Acceptance Criteria**:
1. Tapping a modifier item in the list triggers `Alert.alert()` with title "Add Modifier" and message "Add [modifier displayName]?"
2. Alert has two buttons: "Cancel" (style: 'cancel') and "Add" (style: 'default')
3. Pressing "Cancel" dismisses the alert with no action
4. Pressing "Add" adds the modifier and navigates back to SessionConfigScreen with the selected modifier as a navigation param
5. Uses `Alert.alert()` from React Native for consistency with the existing end-session confirmation pattern on ActiveSessionScreen

**Technical Notes**: The navigation back should use `navigation.navigate('SessionConfig', { addedModifier: { snomedCode, displayName, category } })`. The SessionConfigScreen must handle this param to append the modifier to its `selectedTopographies` state.

---

### US-TM-011: Enforce single-selection for Lateralidade category

**Priority**: HIGH
**Feature**: Lateralidade Constraint
**Status**: Ready
**Depends On**: US-TM-009, US-TM-010

**As a** developer
**I want** the TopographySelectScreen to prevent adding a second modifier from the "Lateralidade" category
**So that** only one laterality-type modifier is active at a time

**Acceptance Criteria**:
1. When the user taps a modifier from the "Lateralidade" category AND there is already a modifier from "Lateralidade" in the `selectedCodes`, an error alert is shown instead of the confirmation modal
2. Error alert title: "Laterality Limit" (or similar). Message: "Only one laterality modifier is allowed. Remove the existing one first."
3. Error alert has a single "OK" button that dismisses it
4. The check compares the tapped modifier's `category` against the categories of the already-selected modifiers (passed via `selectedCodes` + corresponding categories, or by passing full selected modifiers as params)
5. This constraint applies ONLY to the "Lateralidade" category. Other categories (Localização, Distribuição, Orientação) allow unlimited selections

**Technical Notes**: To check whether an existing Lateralidade modifier is selected, the TopographySelectScreen needs to know both the codes AND categories of already-selected modifiers. Two options: (a) pass full `SnomedTopographicalModifier[]` as params instead of just `string[]` codes, or (b) pass `selectedCodes` and a separate `selectedLateralidadeCode: string | null` flag. Option (a) is cleaner. The architecture doc should confirm the param shape.

---

## Work Area 4 -- SessionConfigScreen Modifications

Adapt the existing SessionConfigScreen to remove the laterality dropdown, replace the inline topography dropdown with navigation, and add confirmation modals.

---

### US-TM-012: Remove Laterality <Select> from SessionConfigScreen

**Priority**: HIGH
**Feature**: UI Removal
**Status**: Ready
**Depends On**: US-TM-001

**As a** developer
**I want** the standalone Laterality `<Select>` dropdown removed from the Clinical Data section of SessionConfigScreen
**So that** laterality is no longer selected as a separate field (it becomes a topographical modifier category)

**Acceptance Criteria**:
1. The `<Select>` component for laterality (lines 315-326 in SessionConfigScreen.tsx) is removed from the JSX
2. The `selectedLaterality` state variable and its setter are removed
3. The `isFormValid()` function no longer requires `selectedLaterality` (remove from the boolean check)
4. The `clinicalData` payload in `handleStartSession()` passes `laterality: null` instead of `selectedLaterality as Laterality`
5. The `Laterality` import can remain (still used by the type system) but is no longer used in state logic

**Technical Notes**: The current `isFormValid()` at line 163 checks `selectedVolunteer && selectedBodyStructure && selectedLaterality && selectedTopographies.length > 0 && selectedDeviceId`. After this change it becomes `selectedVolunteer && selectedBodyStructure && selectedTopographies.length > 0 && selectedDeviceId`. The `inputSpacing` style on the laterality Select was also providing vertical spacing between body structure and topography; ensure spacing remains correct after removal.

---

### US-TM-013: Replace inline topography dropdown with navigation to TopographySelectScreen

**Priority**: HIGH
**Feature**: Navigation Integration
**Status**: Ready
**Depends On**: US-TM-006, US-TM-007

**As a** developer
**I want** the "+Add" button on SessionConfigScreen to navigate to TopographySelectScreen instead of toggling an inline dropdown
**So that** users get the full category-filtered search experience for selecting modifiers

**Acceptance Criteria**:
1. The `showTopographyDropdown` state variable and its setter are removed
2. The inline `FlatList` dropdown for topographies (lines 350-366) is removed from the JSX
3. The "+Add" button's `onPress` handler navigates to `TopographySelect` with `selectedCodes` (or full modifiers array) as a param
4. When returning from TopographySelectScreen, the `addedModifier` navigation param is consumed and appended to `selectedTopographies`
5. The `handleAddTopography` function is updated to work with the navigation return param (or a new handler replaces it)
6. `useEffect` or `useFocusEffect` is used to read `route.params?.addedModifier` and add it to state when navigating back

**Technical Notes**: The `SessionConfig` route in `HomeStackParamList` must be updated from `undefined` to `{ addedModifier?: { snomedCode: string; displayName: string; category: string } } | undefined`. Use `route.params?.addedModifier` in a `useEffect` that watches for param changes. After consuming the param, clear it to prevent re-adding on subsequent focus events.

---

### US-TM-014: Add confirmation modal for chip removal on SessionConfigScreen

**Priority**: HIGH
**Feature**: Confirmation UX
**Status**: Ready
**Depends On**: US-TM-012

**As a** developer
**I want** a confirmation modal to appear when the user taps the "x" button on a topography chip
**So that** accidental removal of modifiers is prevented

**Acceptance Criteria**:
1. Tapping the "x" button on a topography chip triggers `Alert.alert()` with title "Remove Modifier" and message "Remove [modifier displayName]?"
2. Alert has two buttons: "Cancel" (style: 'cancel') and "Remove" (style: 'destructive')
3. Pressing "Cancel" dismisses the alert with no action
4. Pressing "Remove" removes the modifier from `selectedTopographies` state
5. Uses `Alert.alert()` from React Native for consistency with the existing end-session confirmation pattern

**Technical Notes**: The current `handleRemoveTopography` at line 158 directly removes the modifier. Wrap it in an `Alert.alert()` call. The `style: 'destructive'` on the "Remove" button renders it in red on iOS, signaling a destructive action.

---

## Work Area 5 -- Downstream Graceful Handling and Verification

These stories ensure all consumers of the laterality field handle `null` gracefully and that the overall change is type-safe.

---

### US-TM-015: Handle null laterality in ActiveSessionScreen

**Priority**: MEDIUM
**Feature**: Graceful Null Handling
**Status**: Ready
**Depends On**: US-TM-001

**As a** developer
**I want** the ActiveSessionScreen to gracefully display sessions without a laterality value
**So that** the structure summary line does not show a broken abbreviation

**Acceptance Criteria**:
1. At line 160, when `clinicalData?.laterality` is `null`, the parenthetical abbreviation `(L)`, `(R)`, or `(B)` is hidden entirely
2. Display shows only the body structure name (e.g., "Biceps") without trailing parentheses or dash
3. Existing sessions with non-null laterality continue to display the abbreviation correctly (e.g., "Biceps (L)")
4. No runtime error or crash when laterality is null

**Technical Notes**: Current code is `{clinicalData?.bodyStructureName || 'Unknown'} ({clinicalData?.laterality?.[0]?.toUpperCase() || '-'})`. When laterality is null, `?.[0]?.toUpperCase()` returns `undefined`, so it falls through to `'-'`. The fix should conditionally render the parenthetical: only show `(X)` when laterality is non-null.

---

### US-TM-016: Handle null laterality in csvExport.ts

**Priority**: MEDIUM
**Feature**: Graceful Null Handling
**Status**: Ready
**Depends On**: US-TM-001

**As a** developer
**I want** the CSV export to show "N/A" for laterality when the value is null
**So that** exported CSV files have a clear indicator for sessions without laterality

**Acceptance Criteria**:
1. In `csvExport.ts`, the `SessionMetadata.laterality` type becomes `string | null`
2. The CSV line at line 196 outputs `Laterality,N/A` when laterality is null
3. Existing exports with non-null laterality continue to show the actual value (e.g., `Laterality,left`)
4. No other CSV fields are affected

**Technical Notes**: The `laterality` field in `SessionMetadata` (line 136) is typed as `string`. It should become `string | null` or the caller should already map `null` to `'N/A'`. Either approach works -- prefer the approach that minimizes changes.

---

### US-TM-017: Handle null laterality in HistoryScreen.tsx

**Priority**: MEDIUM
**Feature**: Graceful Null Handling
**Status**: Ready
**Depends On**: US-TM-001

**As a** developer
**I want** the HistoryScreen to handle null laterality when building CSV export metadata
**So that** the CSV export flow does not crash for sessions without laterality

**Acceptance Criteria**:
1. At line 202 in HistoryScreen.tsx, `session.clinicalData?.laterality ?? 'Unknown'` becomes `session.clinicalData?.laterality ?? 'N/A'`
2. The value passed to `SessionMetadata.laterality` is `'N/A'` when laterality is null, not `'Unknown'`
3. All other CSV metadata fields remain unchanged
4. No runtime error when a session with null laterality appears in history

**Technical Notes**: The `??` operator already guards against null/undefined, so the only change is the fallback string. Using `'N/A'` instead of `'Unknown'` aligns with the csvExport convention from US-TM-016.

---

### US-TM-018: Type-check verification across all workspaces

**Priority**: HIGH
**Feature**: Verification
**Status**: Ready
**Depends On**: US-TM-001 through US-TM-017

**As a** developer
**I want** zero new TypeScript errors introduced by the topography screen and laterality changes
**So that** the codebase remains in a compilable, type-safe state

**Acceptance Criteria**:
1. Run `npm run type-check:all` from the IRIS root and confirm zero NEW type errors in modified files
2. Specifically verify: `packages/domain/src/models/ClinicalSession.ts`, `apps/mobile/src/screens/TopographySelectScreen.tsx`, `apps/mobile/src/screens/SessionConfigScreen.tsx`, `apps/mobile/src/data/repositories/SessionRepository.ts`, `apps/mobile/src/services/SyncService.mappers.ts`, `apps/mobile/src/screens/ActiveSessionScreen.tsx`, `apps/mobile/src/screens/HistoryScreen.tsx`, `apps/mobile/src/utils/csvExport.ts`
3. Pre-existing type errors in files NOT modified by this initiative do not count against this criterion
4. No `any` types introduced in any modified file

**Technical Notes**: Run type-check from `D:\Repos\Faculdade\PRISM\IRIS\` with `npm run type-check:all`. Only errors in files listed in sections 5.1 and 5.2 of the project brief are relevant.

---

## Story Dependency Matrix

```
US-TM-001 (domain types)  ──> US-TM-003 (SessionRepo)
                           ──> US-TM-004 (SyncMappers)
                           ──> US-TM-005 (test fixture)
                           ──> US-TM-012 (remove laterality select)
                           ──> US-TM-015 (ActiveSession null)
                           ──> US-TM-016 (csvExport null)
                           ──> US-TM-017 (History null)

US-TM-002 (SQLite migration) ──> US-TM-003 (SessionRepo)

US-TM-006 (navigation route) ──> US-TM-007 (TopographySelectScreen)
                              ──> US-TM-013 (SessionConfig nav)

US-TM-007 (screen component) ──> US-TM-008 (search bar)
                              ──> US-TM-009 (hide selected)
                              ──> US-TM-010 (confirmation modal)
                              ──> US-TM-013 (SessionConfig nav)

US-TM-009 + US-TM-010 ──> US-TM-011 (Lateralidade constraint)

US-TM-012 (remove laterality) ──> US-TM-014 (chip removal confirmation)

ALL (US-TM-001..017) ──> US-TM-018 (type-check verification)
```

---

## Recommended Implementation Order

**Phase 1 -- Foundation** (can be done in parallel):
1. US-TM-001 (domain types)
2. US-TM-002 (SQLite migration)

**Phase 2 -- Persistence & Sync** (depends on Phase 1):
3. US-TM-003 (SessionRepository)
4. US-TM-004 (SyncService.mappers)
5. US-TM-005 (test fixture)

**Phase 3 -- New Screen** (depends on Phase 1, parallel with Phase 2):
6. US-TM-006 (navigation route)
7. US-TM-007 (TopographySelectScreen base)
8. US-TM-008 (search filtering)
9. US-TM-009 (hide selected)
10. US-TM-010 (confirmation modal)
11. US-TM-011 (Lateralidade constraint)

**Phase 4 -- SessionConfigScreen Modifications** (depends on Phase 3):
12. US-TM-012 (remove laterality select)
13. US-TM-013 (replace dropdown with navigation)
14. US-TM-014 (chip removal confirmation)

**Phase 5 -- Downstream + Verification** (depends on all above):
15. US-TM-015 (ActiveSessionScreen null handling)
16. US-TM-016 (csvExport null handling)
17. US-TM-017 (HistoryScreen null handling)
18. US-TM-018 (type-check verification)

---

## Traceability to Success Criteria

| Success Criterion | Stories |
|---|---|
| SC-1: Laterality dropdown removed from Clinical Data | US-TM-012 |
| SC-2: "+Add" navigates to TopographySelectScreen | US-TM-013 |
| SC-3: Category dropdown showing all categories | US-TM-007 |
| SC-4: Category filter works | US-TM-007 |
| SC-5: Search bar filters by name | US-TM-008 |
| SC-6: Already-selected hidden from list | US-TM-009 |
| SC-7: Confirmation modal on add + navigate back | US-TM-010 |
| SC-8: Single Lateralidade modifier enforced | US-TM-011 |
| SC-9: Confirmation modal on chip removal | US-TM-014 |
| SC-10: Session starts without standalone laterality | US-TM-001, US-TM-002, US-TM-003, US-TM-012 |
| SC-11: Existing sessions display correctly | US-TM-003, US-TM-015, US-TM-016, US-TM-017 |
| SC-12: Zero new type errors | US-TM-018 |

---

## Risk Coverage

| Risk | Mitigating Stories |
|---|---|
| R-1: SQLite NOT NULL constraint | US-TM-002 (table rebuild migration) |
| R-2: Backward compatibility for existing data | US-TM-003, US-TM-015, US-TM-016, US-TM-017 |
| R-3: Navigation param passing | US-TM-006, US-TM-013 |
| R-4: Backend ClinicalContext JSON | US-TM-004 |
| R-5: Category list dynamic derivation | US-TM-007 |
