# Code Review: NewSession Screen Redesign (Phase 20)

**Date**: 2026-03-01
**Reviewer**: TL (Tech Lead)
**Phase**: 20
**Stories**: US-033, US-034, US-035, US-036, US-037, US-038, US-039
**Architecture Reference**: `docs/ARCHITECTURE_SESSION_REDESIGN.md`

---

## Summary

All seven stories (US-033–US-039) are implemented. The overall quality is high: no `any` types, correct `@/` aliases throughout, Lucide icons used exclusively in the mobile app, and the TopographySelectScreen pattern is faithfully followed. The implementation satisfies the primary objective (remove research picker, add sensor selection step).

Two issues require attention before QA testing proceeds.

---

## Issues

### B-001 — BLOCKING: `deviceHasSensors` flag not implemented; US-038 AC7/AC8 violated

**Story**: US-038
**File**: `apps/mobile/src/screens/SessionConfigScreen.tsx:299–306`

**Description**: The architecture (ADR-4) and TL validation finding F-001 both specify that `isFormValid()` must account for whether the backend returned sensors for the current device. Specifically:

- If the backend returned a **non-empty** sensor list, at least one sensor must be selected before `Start Session` is enabled (AC7).
- If the backend returned **zero** sensors, the Start Session button must **not** be blocked by sensor validation (AC8).

The current implementation uses an unconditional check:

```typescript
const isFormValid = (): boolean => {
  return !!(
    selectedVolunteer &&
    selectedBodyStructure &&
    selectedTopographies.length > 0 &&
    selectedDeviceId &&
    selectedSensorIds.length > 0  // ← always required
  );
};
```

This hardcodes the "sensors required" path with no awareness of whether the device actually has sensors in the backend. A device with zero registered sensors will always fail validation, making it impossible to start a session with it.

The architecture doc specified a `deviceHasSensors: boolean` flag to be stored in `SessionConfigFormContext` (or local state) and set by `SensorSelectScreen` on load, which `isFormValid()` would then consult. This flag was not added to either `SessionConfigFormContext` or `SessionConfigScreen`.

**Fix required**: Add a `deviceHasSensors` flag (local state in `SessionConfigScreen` is sufficient). When `SensorSelectScreen` completes and returns (or via a context field), the parent screen must know whether the device had any sensors. `isFormValid()` must be updated to: require `selectedSensorIds.length > 0` only when `deviceHasSensors === true`. The simplest conformant approach: store `deviceHasSensors` in context (alongside `selectedSensorIds`) and set it in `SensorSelectScreen.handleConfirm()` using `sensors.length > 0`.

**Note**: US-037 AC3 ("If device is not yet selected, a guidance message is shown and the fetch is skipped") is correctly implemented — the `sensorHint` text appears when no device is selected. Only the zero-sensor bypass path is missing.

---

### B-002 — BLOCKING: `SensorSelectScreen` — no retry affordance on fetch error (US-037 AC5 violated)

**Story**: US-037
**File**: `apps/mobile/src/screens/SensorSelectScreen.tsx:127–134`

**Description**: AC5 requires "a clear error message **with retry option**" when the fetch fails. The current error state renders a static error message with no way to retry:

```tsx
if (error) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.emptyContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    </SafeAreaView>
  );
}
```

There is no retry button. The user's only option is to navigate back and re-enter the screen, which triggers a reload via `useFocusEffect`. While `useFocusEffect` does provide implicit retry on re-enter, AC5 explicitly requires an in-screen retry affordance.

**Fix required**: Add a "Try Again" `TouchableOpacity` below the error text that calls the `loadData` function. The `loadData` function is defined inside `useFocusEffect`'s callback, so it must be lifted to a `useCallback` ref or extracted to allow direct invocation.

---

## Suggestions (non-blocking)

### S-001: `SensorSelectScreen` — `localSelectedIds` not reset on focus

**File**: `apps/mobile/src/screens/SensorSelectScreen.tsx:49–51`

`localSelectedIds` is initialized from `selectedSensorIds` only once at component mount. On native-stack reuse (the screen instance is preserved), if the user selects sensors, confirms, then re-enters the screen via the "Add Sensors" chip again, `localSelectedIds` will correctly reflect the context snapshot at mount. However if the context changes between entries (e.g., device change cleared sensor IDs), the stale local set may disagree. Consider resetting `localSelectedIds` inside `useFocusEffect` from the latest `selectedSensorIds` value to keep it synchronized on every entry.

### S-002: `SessionConfigScreen` — inline anonymous `View` in chip add button

**File**: `apps/mobile/src/screens/SessionConfigScreen.tsx:483–487, 550–553`

Both the "Add" topography chip button and the "Add Sensors" chip button contain anonymous `<View style={{ flexDirection: 'row', ... }}>` inline style objects. These create a new object on every render. Prefer extracting these to `StyleSheet` entries (e.g., `chipAddRow`). Minor — only worth addressing if there are other render optimization passes.

### S-003: `FavoritesManageScreen` — style name `itemResearch` is a vestige

**File**: `apps/mobile/src/screens/FavoritesManageScreen.tsx:188`

The style `itemResearch` is used to display the sensors line (`Sensors: ...`). The name is a leftover from when this field showed research info. Renaming to `itemSensors` would better reflect the current semantics. Low impact.

### S-004: Migration v6 — not idempotent (US-036 AC6)

**File**: `apps/mobile/src/data/migrations/v6_add_sensor_columns.ts`

The migration SQL uses `ALTER TABLE ... ADD COLUMN` without `IF NOT EXISTS`. SQLite does not support `IF NOT EXISTS` on `ALTER TABLE ADD COLUMN`, so duplicate execution will raise an error. The `DatabaseManager` guards against re-running applied migrations via the `migrations` version table, making this safe in production. However AC6 states "running it twice does not raise an error." The current guard is at the application level, not the SQL level. This is architecturally correct (the migration framework prevents re-runs), so this AC is effectively satisfied by the framework rather than the SQL itself. No change required — flag for PO awareness only.

---

## Acceptance Criteria Checklist

| Story | AC | Result | Notes |
|-------|-----|--------|-------|
| US-033 | EXPO_PUBLIC_RESEARCH_ID in .env.example | PASS | Line 18, placeholder value present |
| US-033 | UUID validation at startup | PASS | `isValidResearchId()` with regex |
| US-033 | Error screen if missing/invalid | PASS | `envErrorStyles` guard in `App.tsx:105` |
| US-033 | No user interaction for researchId | PASS | Env var only |
| US-033 | Documented in CLAUDE.md/QUICK_START | NOT VERIFIED | Out of review scope (docs files not listed) |
| US-034 | `selectedSensorIds`/`Names` in context | PASS | Lines 29–31, 68–69 |
| US-034 | `INITIAL_FORM_STATE` initializes to `[]` | PASS | Lines 50–51 |
| US-034 | `setSelectedSensorIds/Names` exported | PASS | Lines 38–40 |
| US-034 | `resetForm()` clears sensor arrays | PASS | Lines 74–77 |
| US-034 | Research fields removed from context | PASS | No research state in context |
| US-034 | Strict mode, no implicit any | PASS | All fields typed |
| US-035 | `SessionConfig.clinicalData.sensorIds/Names` optional | PASS | Lines 72–73 |
| US-035 | `startSession()` accepts sensorIds | PASS | Passed via `clinicalData` |
| US-035 | `researchId` from env var in startSession | PASS | `RESEARCH_ID` constant used, line 328 |
| US-035 | Call sites updated | PASS | Single call site in SessionConfigScreen |
| US-036 | Migration adds sensor columns with DEFAULT `[]` | PASS | Correct SQL |
| US-036 | `FavoriteRepository.create()` serializes sensors | PASS | Lines 85–86 |
| US-036 | `mapRow()` deserializes sensors | PASS | Lines 204–205 |
| US-036 | `SessionFavorite` type includes sensor fields | PASS | Lines 103–104 |
| US-036 | Migration idempotent | PARTIAL | See S-004 |
| US-037 | `SensorSelect` added to HomeStack | PASS | Navigator line 117–120 |
| US-037 | Fetches via `researchService.getDeviceSensors()` | PASS | Line 64 |
| US-037 | Guidance when device not selected | PASS | `sensorHint` in SessionConfigScreen |
| US-037 | Empty state when zero sensors | PASS | `emptyContainer` at line 161 |
| US-037 | Error message with retry | **FAIL** | See B-002 |
| US-037 | Searchable list, multi-select, Lucide icons | PASS | CheckSquare/Square from lucide |
| US-037 | Toggle sensor in local state | PASS | `toggleSensor()` |
| US-037 | Confirm saves to context | PASS | `handleConfirm()` |
| US-037 | Back without confirm discards | PASS | Local state not committed |
| US-037 | Strict mode | PASS | All props/state typed |
| US-038 | Research navigation card removed | PASS | Not present |
| US-038 | Research dropdown removed | PASS | Not present |
| US-038 | Research state/hooks removed from screen | PASS | No research state |
| US-038 | Sensors section with chips | PASS | Lines 528–563 |
| US-038 | Add Sensors navigates to SensorSelect | PASS | Line 548 |
| US-038 | Device change clears sensor chips | PASS | `useEffect` on `selectedDeviceId`, lines 166–170 |
| US-038 | Start Session disabled if no sensors (non-empty device) | **FAIL** | See B-001 — always requires sensors |
| US-038 | Start Session NOT blocked if device has zero sensors | **FAIL** | See B-001 — no zero-sensor bypass |
| US-038 | Other sections unchanged | PASS | Volunteer, Clinical, Hardware intact |
| US-039 | `create()` persists sensorIds/Names | PASS | Lines 85–86 |
| US-039 | `applyFavorite()` restores sensor state | PASS | Lines 226–227 |
| US-039 | Pre-v6 favorites apply with empty arrays | PASS | `?? []` guards in applyFavorite |
| US-039 | Favorites with empty sensors can be saved | PASS | sensorIds optional in schema |
| US-039 | Sensor chips appear after applying favorite | PASS | Rendered from context state |

---

## Architecture Compliance

| Check | Result | Notes |
|-------|--------|-------|
| ADR-1: Env var for ResearchId, no user picker | PASS | |
| ADR-2: SensorSelectScreen as separate nav screen | PASS | |
| ADR-3: Local selection committed on Confirm only | PASS | |
| ADR-4: `deviceHasSensors` flag gates validation | **FAIL** | B-001 |
| TopographySelectScreen pattern adherence | PASS | `useFocusEffect` + cancellation token + local state |
| `@/` import aliases | PASS | All imports use alias |
| No `any` types | PASS | |
| Lucide icons (mobile) | PASS | No custom SVG |
| `@iris/domain` types for shared models | PASS | |

---

## Decision

**BLOCKED**. Two blocking issues (B-001, B-002) must be resolved before QA testing.

**Action**: Return US-037 and US-038 to "In Progress". Dev must:
1. Add `deviceHasSensors` tracking and fix `isFormValid()` (B-001).
2. Add a retry button to `SensorSelectScreen` error state (B-002).

After fixes, re-submit for TL re-review. Suggestions S-001 through S-004 may be addressed at dev discretion before or after QA.

---

[GATE:FAIL]

---

## Re-review (Iteration 2)

**Date**: 2026-03-01
**Reviewer**: TL (Tech Lead)
**Scope**: B-001 and B-002 fixes only — full AC table not re-run.

---

### B-001 — `deviceHasSensors` flag — RESOLVED

**`SessionConfigFormContext.tsx`**

`deviceHasSensors: boolean` is correctly threaded throughout the context module:

- Declared in `SessionConfigFormState` interface (line 32)
- Setter `setDeviceHasSensors` declared in `SessionConfigFormActions` (line 42)
- Initialized to `false` in `INITIAL_FORM_STATE` (line 55)
- Backed by `useState<boolean>` (line 73)
- Reset to `false` inside `resetForm()` (line 82)
- Exposed in the `useMemo` value object and its dependency array (lines 108–109, 119)

No issues.

**`SessionConfigScreen.tsx`**

- `deviceHasSensors` and `setDeviceHasSensors` are destructured from `useSessionConfigForm()` (line 64).
- The `useEffect` on `selectedDeviceId` (lines 168–172) calls `setDeviceHasSensors(false)` whenever the device changes, correctly clearing the flag alongside sensor IDs and names.
- `isFormValid()` (lines 301–309) now reads:

```typescript
(selectedSensorIds.length > 0 || !deviceHasSensors)
```

This satisfies both AC7 (sensors required when device has sensors) and AC8 (bypass when device has zero sensors). ADR-4 compliance restored.

**Verdict: RESOLVED.**

---

### B-002 — Retry affordance in `SensorSelectScreen` error state — RESOLVED

**`SensorSelectScreen.tsx`**

- `loadData` is now a `useCallback` with `[route.params.deviceId]` as its dependency (lines 53–86). It can be called directly without lifting state.
- The error branch (lines 128–139) renders a `TouchableOpacity` with `onPress={loadData}` and the label "Try Again", styled via `tryAgainButton` / `tryAgainButtonText` (lines 298–309 in `StyleSheet`). The button is visually distinct (primary background, rounded).
- `handleConfirm()` (lines 109–115) calls `setDeviceHasSensors(sensors.length > 0)` before committing the selection to context, correctly setting the flag based on what the backend actually returned.

US-037 AC5 ("clear error message with retry option") is satisfied. The `loadData` extraction also satisfies the architectural requirement stated in B-002's fix note.

**Verdict: RESOLVED.**

---

### Summary

Both blocking issues are fixed. The implementation is correct and conformant with the architecture specification.

Suggestions S-001 through S-004 from the original review remain open at dev discretion; none are blocking.

---

[GATE:PASS]
