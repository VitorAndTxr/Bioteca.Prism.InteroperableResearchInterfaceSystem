# Project Brief: Topography Selection Screen & Laterality Removal

**Date**: 2026-02-16
**Author**: PM (Product Manager)
**Status**: APPROVED (client decisions confirmed)

---

## 1. Business Objective

The current `SessionConfigScreen` in the IRIS mobile app presents topographical modifiers as a flat, unsorted list when the user taps "+Add". With dozens of modifiers spanning four distinct categories (Lateralidade, Localização, Distribuição, Orientação), this flat list is difficult to navigate and leads to selection errors.

Additionally, "Laterality" is currently a separate standalone dropdown in the Clinical Data section. However, Laterality is actually one of the four topographical modifier categories (Lateralidade). Having it as both a dedicated select AND part of topographical modifiers creates data duplication and user confusion.

This initiative addresses both issues in a single change:

1. **Remove** the standalone Laterality dropdown from the Clinical Data UI.
2. **Replace** the inline topography dropdown with a **full navigation screen** that provides category-based filtering, search, and confirmation dialogs — matching the desktop `AddTopographicModifierForm` category model.

The result is a cleaner, more consistent UI where laterality is selected as a topographical modifier (under the "Lateralidade" category), not as a separate field.

---

## 2. Scope

### 2.1 In Scope

**UI Changes — SessionConfigScreen**:
- Remove the Laterality `<Select>` component from the Clinical Data section (lines 315-326)
- Remove the inline topography FlatList dropdown (lines 350-366)
- The "+Add" button now navigates to a new `TopographySelect` screen (full-page, not a modal)
- Selected modifiers continue to display as chip tags
- Removing a chip tag requires a **confirmation modal** ("Are you sure you want to remove [modifier name]?") before removal

**UI Changes — New TopographySelectScreen**:
- New full navigation screen registered in the Home stack
- Layout from top to bottom:
  1. **Category `<Select>` dropdown** at the top (Lateralidade, Localização, Distribuição, Orientação) — order derived from data
  2. **Search bar** below the dropdown for filtering modifiers by name within the selected category
  3. **Filtered modifier list** below the search bar showing only modifiers matching the selected category AND search query
- Modifiers already selected on SessionConfigScreen are **hidden** from the list (not shown at all)
- Tapping a modifier shows a **confirmation modal** ("Add [modifier name]?") — on confirm, the modifier is added and the screen navigates BACK to SessionConfigScreen with the new chip
- **Lateralidade category constraint**: Only ONE modifier allowed from the "Lateralidade" category. If the user already has a Lateralidade modifier selected and tries to add another, show an error/warning instead of the confirmation modal

**Navigation Changes**:
- New route `TopographySelect` added to `HomeStackParamList` in navigation types
- Route params must carry the currently selected topography codes (so the screen can hide them) and return the selected modifier back to SessionConfigScreen

**Domain Type Changes**:
- `ClinicalData.laterality` becomes `laterality: Laterality | null` (nullable)
- `SessionConfig.clinicalData.laterality` becomes `laterality: Laterality | null` (nullable)
- The `Laterality` type itself remains unchanged (`'left' | 'right' | 'bilateral'`)

**Data Model Adjustments**:
- New SQLite migration (`v3_relax_laterality_constraint`) to make the `laterality` column nullable (remove `NOT NULL` and relax the CHECK constraint to allow `NULL`)
- `SessionConfigScreen` passes `null` for `laterality` in the `clinicalData` payload to `startSession()`

**Form Validation Changes**:
- Remove `selectedLaterality` from the `isFormValid()` check
- Topography selection remains required (at least one modifier selected)

**Downstream Consumers (Graceful null handling)**:
- `SyncService.mappers.ts`: sends `laterality: null` inside `ClinicalContext` JSON blob for new sessions
- `ActiveSessionScreen.tsx`: laterality abbreviation display hides the parenthetical when value is null
- `csvExport.ts`: `SessionMetadata.laterality` shows "N/A" when null
- `HistoryScreen.tsx`: handles null laterality in CSV export metadata

### 2.2 Out of Scope

- Backend (`InteroperableResearchNode`) changes — `ClinicalContext` is a free-form JSON blob, no schema migration needed
- Desktop app changes — `AddTopographicModifierForm` is already category-first
- Deleting the `Laterality` type from `@iris/domain` (backward compatibility)
- Deleting the `laterality` column from the SQLite `clinical_data` table (existing data must be preserved)
- Changes to the SNOMED service or backend topographical modifier endpoints
- Changes to how `SnomedService.getTopographicalModifiers()` fetches data (already returns all modifiers with `category` field)

---

## 3. Success Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| SC-1 | Laterality dropdown is no longer visible in the Clinical Data section | Visual inspection |
| SC-2 | "+Add" button on Topography navigates to the new `TopographySelectScreen` | Visual inspection |
| SC-3 | TopographySelectScreen has a category `<Select>` dropdown showing all available categories | Visual inspection |
| SC-4 | Selecting a category filters the list to show only modifiers in that category | Functional test |
| SC-5 | Search bar further filters modifiers by display name within the selected category | Functional test |
| SC-6 | Modifiers already selected on SessionConfigScreen are hidden from the list | Functional test |
| SC-7 | Tapping a modifier shows a confirmation modal; confirming adds it and navigates back | Functional test |
| SC-8 | Only ONE Lateralidade modifier can be selected at a time; attempting to add a second shows an error | Functional test |
| SC-9 | Removing a chip on SessionConfigScreen shows a confirmation modal before removal | Functional test |
| SC-10 | Session can be started without a standalone laterality selection (laterality is null) | End-to-end test |
| SC-11 | Existing sessions with laterality data continue to display correctly in history and active session views | Regression test |
| SC-12 | TypeScript strict mode: zero new type errors introduced | `npm run type-check:all` |

---

## 4. Known Risks and Constraints

### 4.1 Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R-1 | **SQLite NOT NULL constraint on laterality** — The `v1_initial.ts` migration defines `laterality TEXT NOT NULL CHECK(laterality IN ('left','right','bilateral'))`. New sessions with `null` laterality will fail the INSERT. | HIGH | Create a new migration (`v3_relax_laterality_constraint`) that rebuilds the `clinical_data` table with `laterality TEXT CHECK(laterality IS NULL OR laterality IN ('left','right','bilateral'))`. SQLite does not support `ALTER COLUMN`, so a table rebuild (create temp, copy data, drop original, rename) is required. |
| R-2 | **Backward compatibility for existing data** — Sessions created before this change have meaningful `laterality` values ('left', 'right', 'bilateral'). These must be preserved and displayed correctly. | MEDIUM | Read-path code (ActiveSessionScreen, HistoryScreen, CSV export) must gracefully handle both old sessions (with laterality) and new sessions (null). |
| R-3 | **Navigation param passing** — The new TopographySelectScreen needs to receive the currently selected topography codes and return the chosen modifier back to SessionConfigScreen. React Navigation's `params` and `route.params` must be used correctly. | MEDIUM | Use navigation params to pass selected codes forward, and use `navigation.navigate('SessionConfig', { addedModifier })` or a shared state/callback pattern to pass the selection back. |
| R-4 | **Backend ClinicalContext JSON** — The `SyncService.mappers.ts` sends `laterality` inside `ClinicalContext`. If the backend or downstream consumers parse and validate this field, `null` may cause issues. | LOW | `ClinicalContext` is a free-form JSON string. Backend stores it as-is. No server-side validation on `laterality` within the JSON blob. |
| R-5 | **Category list dynamic derivation** — The desktop app hardcodes categories as `mockCategoryOptions`. Categories should be derived dynamically from the topographies data to avoid maintenance burden. | LOW | Derive categories from `[...new Set(topographies.map(t => t.category))]` in the TopographySelectScreen. |

### 4.2 Constraints

| # | Constraint |
|---|-----------|
| C-1 | Must follow existing IRIS mobile design patterns (theme, typography, spacing from `@/theme`) |
| C-2 | The `SnomedTopographicalModifier` type already has `category: string` — no domain type changes needed for filtering |
| C-3 | The `SnomedService.getTopographicalModifiers()` already loads all modifiers on mount in SessionConfigScreen — the data can be passed as navigation params or re-fetched in the new screen |
| C-4 | New route must be added to `HomeStackParamList` in `apps/mobile/src/navigation/types.ts` |
| C-5 | TypeScript strict mode must be maintained (zero `any` types) |
| C-6 | Confirmation modals should use React Native `Alert.alert()` for consistency with the existing `ActiveSessionScreen` end-session confirmation pattern |

---

## 5. Impacted Files and Systems

### 5.1 Primary Changes (Must Modify)

| File | Change Description |
|------|-------------------|
| `apps/mobile/src/screens/SessionConfigScreen.tsx` | Remove Laterality `<Select>`, remove `selectedLaterality` state, remove inline topography dropdown, "+Add" navigates to TopographySelectScreen, add confirmation modal on chip removal, update `isFormValid()`, pass `null` for laterality in clinicalData payload |
| `apps/mobile/src/screens/TopographySelectScreen.tsx` | **NEW FILE** — Full navigation screen with category `<Select>`, search bar, filtered modifier list, confirmation modal on selection, Lateralidade single-select enforcement, hide already-selected modifiers |
| `apps/mobile/src/navigation/types.ts` | Add `TopographySelect` route to `HomeStackParamList` with appropriate params (selected codes in, chosen modifier out) |
| `apps/mobile/src/navigation/` (router file) | Register `TopographySelectScreen` in the Home stack navigator |
| `packages/domain/src/models/ClinicalSession.ts` | Make `ClinicalData.laterality` and `SessionConfig.clinicalData.laterality` nullable (`Laterality \| null`) |
| `apps/mobile/src/data/migrations/` | **NEW FILE** (`v3_relax_laterality_constraint.ts`) — SQLite table rebuild to make `laterality` nullable |
| `apps/mobile/src/data/repositories/SessionRepository.ts` | Update `create()` to handle `null` laterality, update `mapClinicalData()` to handle null laterality |

### 5.2 Secondary Changes (Adjust Gracefully)

| File | Change Description |
|------|-------------------|
| `apps/mobile/src/screens/ActiveSessionScreen.tsx` | Line 160: Handle null laterality — hide parenthetical abbreviation when null |
| `apps/mobile/src/screens/HistoryScreen.tsx` | Line 202: Handle null laterality in CSV export metadata (show "N/A") |
| `apps/mobile/src/services/SyncService.mappers.ts` | Line 80: Send `null` for `laterality` in `ClinicalContext` JSON when value is null |
| `apps/mobile/src/utils/csvExport.ts` | Line 196: Handle null laterality in CSV header (display "N/A") |
| `apps/mobile/src/services/SyncService.test.ts` | Line 71: Update test fixture to reflect nullable laterality |

### 5.3 No Changes Required (Confirmed)

| File | Reason |
|------|--------|
| `packages/domain/src/models/Snomed.ts` | `SnomedTopographicalModifier` already has `category: string` |
| `apps/mobile/src/services/SnomedService.ts` | Already fetches all modifiers; no changes needed |
| `apps/mobile/src/context/SessionContext.tsx` | Calls `sessionRepository.create(config)` — repository handles the data |
| Backend (`InteroperableResearchNode`) | `ClinicalContext` is a free-form JSON blob, no schema validation |

---

## 6. Confirmed Client Decisions

All questions from the initial draft have been answered by the client. Decisions are recorded here for traceability.

| # | Question | Decision |
|---|----------|----------|
| Q1 | Default laterality for new sessions | **`null`** (nullable). The `laterality` field becomes nullable in domain types and SQLite. `null` means "not specified". |
| Q2 | Multiple modifiers per category | **Single-select for Lateralidade** category only. Other categories (Localização, Distribuição, Orientação) allow multiple modifiers. |
| Q3 | UI approach | **Full navigation screen**, not a modal. The screen has a category `<Select>` dropdown, a search bar, and a filtered list. Tapping a modifier shows a **confirmation modal** before adding. Removing a chip on SessionConfigScreen also requires a **confirmation modal**. |
| Q4 | Category display order | Categories appear in the `<Select>` dropdown in the **order they come from the data** (no specific order mandated). |
| Q5 | Already-selected indicator | **Hidden from list** — modifiers already selected as chips are not shown in the filtered list at all. |

---

## 7. Estimated Complexity

**Frontend change** affecting 1 existing screen (`SessionConfigScreen`), 1 new screen (`TopographySelectScreen`), navigation types/router, domain types, and a SQLite migration. Graceful adjustments in 5 other files. No backend changes. No new external dependencies.

**Risk level**: MODERATE (SQLite table rebuild for nullable laterality, navigation param passing for modifier selection).
