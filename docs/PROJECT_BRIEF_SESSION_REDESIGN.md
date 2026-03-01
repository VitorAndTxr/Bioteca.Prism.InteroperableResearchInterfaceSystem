# Project Brief — NewSession Screen Redesign

> Phase 1 output — Product Manager leads, all roles assist.

## Business Objectives

| # | Objective | Success Criteria | Priority |
|---|-----------|-----------------|----------|
| 1 | Remove research project selection from session config | ResearchId is resolved from `EXPO_PUBLIC_RESEARCH_ID` env var at build time; no research UI in SessionConfigScreen | Must |
| 2 | Add sensor selection step to session creation | New SensorSelectScreen allows multi-select of sensors from the chosen Bluetooth device; selected sensors are stored in session config | Must |
| 3 | Update data model to carry sensor selections | `SessionConfig`, `SessionConfigFormContext`, and `SessionFavorite` include sensor IDs/names | Must |
| 4 | Maintain favorites parity | Favorites save and restore sensor selections alongside existing fields (body structure, topographies, device) | Must |

## Scope

### In Scope

- Remove the "Research Projects" navigation card from SessionConfigScreen
- Remove the "Link to Research" dropdown selector from SessionConfigScreen
- Remove `researchProjects` fetch, `selectedResearchId`, and `selectedResearchTitle` from SessionConfigScreen local state and SessionConfigFormContext
- Introduce `EXPO_PUBLIC_RESEARCH_ID` environment variable; resolve researchId from it at session start (no user interaction)
- Create a new `SensorSelectScreen` (navigation screen within HomeStack) for multi-selecting sensors from the selected Bluetooth device's backend sensor list
- Add `selectedSensorIds` and `selectedSensorNames` to `SessionConfigFormContext`
- Add `sensorIds` (and display names) to `SessionConfig` domain type
- Update `SessionFavorite` schema and SQLite migration to persist sensor selections
- Update `favoriteRepository.create()` and `applyFavorite()` to include sensors
- Update form validation: sensors required before session start
- Wire sensor data through `startSession()` into the session record

### Out of Scope

- Research management screens (ResearchList, ResearchDetail, etc.) — they remain in the app, just not linked from session config
- Backend changes to the sensor or session endpoints
- Changes to the ActiveSessionScreen, CaptureScreen, or StreamingScreen
- Device firmware changes
- Desktop app changes
- Sensor CRUD (create/edit/delete) — sensors are read-only from the backend
- Changes to the Bluetooth protocol or streaming configuration

## Constraints

| Type | Constraint | Impact |
|------|-----------|--------|
| Technical | Sensors must be fetched from backend via `researchService.getDeviceSensors(researchId, deviceId)` using the env-var researchId and the user-selected deviceId | SensorSelectScreen depends on both env var and device selection being available |
| Technical | SQLite schema change required for favorites (new migration v6 or similar) | Must handle migration from existing v5 schema |
| Technical | TypeScript strict mode — no `any` types | All new types must be fully typed |
| Technical | Lucide icons only for mobile app | SensorSelectScreen must use lucide-react-native |
| UX | Sensor selection is a separate screen (not inline) following the TopographySelectScreen pattern | Consistent navigation pattern with chip display on return |

## Stakeholders

| Stakeholder | Role | Concerns |
|------------|------|----------|
| Researcher (end user) | Uses mobile app to configure and run clinical sessions | Simplified flow (no research picker), clear sensor selection |
| Institution Admin | Deploys the app with a specific EXPO_PUBLIC_RESEARCH_ID | Env var must be documented; build-time binding |
| Device Operator | Pairs Bluetooth device and selects sensors | Sensor list must reflect actual device capabilities from backend |

## Business Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|-----------|
| 1 | Missing EXPO_PUBLIC_RESEARCH_ID env var causes runtime failure | Med | High | Validate env var at app startup; show clear error if missing |
| 2 | Backend returns empty sensor list for a device | Med | Med | Show empty state with guidance; do not block session if sensors are genuinely empty |
| 3 | Existing favorites lose research linkage data silently | Low | Med | Migration preserves existing data; research fields become unused but are not deleted |
| 4 | Users accustomed to research selection are confused by removal | Low | Low | The env-var approach is institution-level; individual users do not need to pick research |

## Technical Risk Assessment

> Added by Tech Lead (`/tl plan`).

| # | Risk | Likelihood | Impact | Mitigation | Effort |
|---|------|-----------|--------|-----------|--------|
| 1 | Missing or invalid `EXPO_PUBLIC_RESEARCH_ID` at runtime | Med | High | Validate env var at app startup in `App.tsx`. Show error screen with clear instructions if missing or invalid UUID. Require non-empty string in build. | M |
| 2 | Empty sensor list returned by backend for a device | Med | Med | Handle gracefully in `SensorSelectScreen`: show empty state message. Per brief: allow session start without sensors (not a validation blocker). Log warning if unexpected. | S |
| 3 | Type safety across SessionConfig + Favorites + migrations | Low | Med | `SessionConfig.clinicalData` needs optional `sensorIds: string[]` and `sensorNames: string[]`. Update `SessionFavorite` and `CreateFavoritePayload` to include sensor fields. SQLite v6 adds `sensor_ids` and `sensor_names` JSON columns. Strict TS mode enforced. | M |
| 4 | SQLite migration v5→v6 compatibility | Low | Med | New columns default to empty array JSON `"[]"`. Migration must be idempotent and preserve existing rows. Test against real v5 schema before release. Include rollback strategy in deployment docs. | S |
| 5 | Backend `researchService.getDeviceSensors()` API contract mismatch | Med | High | **BLOCKER**: Verify endpoint exists returning `Sensor[]` with correct shape (id, name, maxSamplingRate, unit, accuracy, minRange, maxRange, additionalInfo). If missing, add as pre-work. Update domain types to match. Code inspection shows endpoint implemented (ResearchService.ts:425). | L |
| 6 | Navigation state loss when navigating to `SensorSelectScreen` | Low | Low | Follow TopographySelectScreen pattern: use `route.params` for read-only input, `SessionConfigFormContext` for state persistence across unmount/remount. Context auto-resets on session end (existing logic). Test with native stack reuse. | S |
| 7 | Expo env var binding timing in development | Low | Med | Env vars load at build time via .env file (not runtime injection). Dev servers may require restart after .env changes. Document in QUICK_START.md. CI/CD must bake var at build. Include validation in App.tsx startup. | S |
| 8 | Ambiguous laterality deprecation path | Low | Low | Brief removes laterality from SessionConfigScreen UI but `SessionFavorite` still stores it. **Decision needed**: fully deprecate laterality (v7 migration + field removal) or keep for backward compat. Currently: keep field for compat, mark as deprecated in types. | S |

## Specialist Notes

> Added by Dev Specialist (`/dev plan`) and QA Specialist (`/qa plan`).

### Developer Specialist

- See [IMPLEMENTABILITY NOTES] section below for detailed implementation assessment.

### QA Specialist

- See [TESTABILITY NOTES] section below for detailed testing strategy.

## [IMPLEMENTABILITY NOTES]

> Analysis conducted by Dev Specialist (Claude Code) — March 1, 2026

### Executive Summary

**Implementability Assessment: HIGH CONFIDENCE — 6–8 story points**

This feature is implementable within one iteration. All required APIs, patterns, and infrastructure exist. Key implementation follows the established TopographySelectScreen pattern, reducing risk. Primary effort is context state expansion + sensor screen creation + SQLite migration v6.

---

### Code Structure & Existing Patterns

**Positive Factors:**

1. **TopographySelectScreen Pattern Already Exists** (reference model: `apps/mobile/src/screens/TopographySelectScreen.tsx`)
   - Same navigation pattern (full-screen selector with search/filter)
   - Category dropdown + search bar layout
   - Multi-select capability with chip display on return
   - Can be cloned with minimal modifications for sensors

2. **SessionConfigFormContext Already Lifted** (current file: `apps/mobile/src/context/SessionConfigFormContext.tsx`)
   - Currently manages: volunteer, body structure, topographies, research selection, device
   - Already survives screen unmount/remount during navigation (required for SensorSelectScreen)
   - Auto-reset on session end (useRef + useEffect pattern at lines 81-87) — must be updated for sensors

3. **FavoriteRepository & SQLite Already Support Partial Data**
   - v4 schema (file: `apps/mobile/src/data/migrations/v4_add_session_favorites.ts`) has nullable device_id, laterality, research_id, research_title
   - Patch pattern established: `update()` supports partial fields + JSON serialization
   - Migration pattern established (v4 → v5 → v6 is straightforward)

4. **ResearchService.getDeviceSensors() Already Implemented**
   - Endpoint exists in ResearchService.ts (line 425)
   - Takes `(researchId, deviceId)` — matches env var + user selection requirement
   - Returns `Sensor[]` domain type with full metadata (id, name, maxSamplingRate, unit, etc.)

5. **Environment Variable Pattern Established**
   - .env.example shows existing EXPO_PUBLIC_* variables
   - Expo supports EXPO_PUBLIC_* at build time (no custom tooling needed)
   - Standard .env → app.config.ts → bundle approach

**Risk Factors:**

1. **Context State Expansion Complexity: LOW-MEDIUM**
   - Must add `selectedSensorIds: string[]` + `selectedSensorNames: string[]` to SessionConfigFormState (line 25-32)
   - Must add corresponding setter actions (line 34-42)
   - Must update `INITIAL_FORM_STATE` (line 46)
   - Must update `resetForm()` callback (line 71) + useEffect dependency array (lines 82-87)
   - Must expand useMemo deps (lines 105-114)
   - **No type conflicts** — strings are primitive, arrays are fully typed
   - **Effort: 1 story point** (mechanical additions, proven pattern via topographies field)

2. **SQLite Migration v6: LOW RISK**
   - Add `sensor_ids TEXT DEFAULT '[]'` and `sensor_names TEXT DEFAULT '[]'` to session_favorites table
   - Match existing topography_codes/topography_names pattern (JSON stringified arrays)
   - FavoriteRepository.create() + update() + mapRow() follow established UPSERT pattern
   - Migration precedent: v4 successfully created session_favorites table
   - **Effort: 1 story point** (2 new columns, standard JSON serialization)

3. **SessionConfigScreen Integration: MEDIUM**
   - Must remove research project card (brief lines 95-96)
   - Must remove research dropdown handling (estimated 15-20 LOC)
   - Must add sensor chip strip + [Add Sensors] button → SensorSelectScreen
   - Must update form validation: sensors required before session start
   - Must integrate researchId from env var (read once at app init, pass to startSession)
   - **Code scope unclear**: SessionConfigScreen is complex (100+ LOC); requires detailed review
   - **Effort: 2–3 story points** (depends on validation logic scope)

4. **SensorSelectScreen Creation: MEDIUM-HIGH**
   - Clone TopographySelectScreen (estimated 200 LOC)
   - Adapt for sensors: no category filter needed, simpler search (sensor name only)
   - Use multi-select checkbox pattern (instead of single-select + Lateralidade rule)
   - Load sensors via `researchService.getDeviceSensors(researchId, deviceId)`
   - Return selected sensor IDs + names to SessionConfigFormContext
   - Must handle:
     - Loading state + error handling (empty sensor list)
     - Device not selected yet → show guidance text
     - Sensor availability check (is this device valid for the research?)
   - **Effort: 2 story points** (TopographySelectScreen provides 70% boilerplate)

5. **Environment Variable Validation: LOW**
   - Read EXPO_PUBLIC_RESEARCH_ID in app entry (e.g., App.tsx or SessionContext)
   - Validate not empty at startup
   - Show error modal if missing + prevent app progress
   - **Effort: 0.5 story point** (simple check + error handling)

---

### Data Flow & Coupling

**SessionConfigFormContext → SensorSelectScreen → startSession()**

1. **Context receives sensor selection**:
   - SensorSelectScreen populates `setSelectedSensorIds()` + `setSelectedSensorNames()`
   - SessionConfigScreen displays chip strip (e.g., "EMG_Left | EMG_Right")
   - User taps [Add Sensors] → SensorSelectScreen
   - User selects sensors → returned chip strip updates

2. **startSession() receives sensors**:
   - SessionContext.startSession() must accept `sensorIds: string[]`
   - Currently takes: volunteer, bodyStructure, topographies, deviceId, researchId
   - **Must add parameter**: sensorIds
   - No backend change needed (out of scope)

3. **SQLite migration preserves backward compatibility**:
   - Existing favorites (v5 schema) migrate → v6 schema with sensor_ids/sensor_names = '[]' (defaults)
   - No data loss
   - Can reapply favorite without sensors (optional field)

---

### TypeScript Type Safety

**Current Approach Validated:**

- @iris/domain exports `Sensor` type (packages/domain/src/models/Sensor.ts): fully typed with id, deviceId, name, etc.
- SessionFavorite must extend CreateFavoritePayload
- All array types: `string[]` (sensor IDs) + `string[]` (sensor names) — no `any`
- Strict mode compliance: ✅ (no type casts needed, domain types sufficient)

---

### Data Submission & Backend Readiness

**OUT OF SCOPE (confirmed):**

- No backend changes to sensor/session endpoints
- No changes to Bluetooth protocol
- No device firmware changes

**Data Carrier:**

- Session record will include `sensorIds` in the local ClinicalSession entity
- If backend integration exists in future phases, sensorIds can be included in request payload
- Frontend: fully prepared (types exist, context state ready)

---

### Testing Strategy & Confidence

**High-Confidence Test Cases** (existing pattern precedent):

1. ✅ Render SessionConfigScreen without research card → verify card removed
2. ✅ Tap [Add Sensors] → navigate to SensorSelectScreen
3. ✅ Select/deselect sensors → context state updates, chip strip displays
4. ✅ Save favorite with sensors → SQLite v6 persists sensorIds + sensorNames
5. ✅ Apply favorite → sensor selections restored from storage
6. ✅ Reset form on session end → selectedSensorIds cleared

**Ambiguous Acceptance Criteria** (from brief, clarified by QA):

1. **Empty sensor list handling**: "Do not block session if sensors are genuinely empty" clarified in TESTABILITY_NOTES as: allow session to proceed with log warning
2. **Sensor ordering**: Recommend preserving backend order (no sorting) for consistency
3. **Device deselection behavior**: Recommend clearing sensors on device change (safest UX)

---

### Effort Estimate

**Breakdown (with precedent-based confidence)**:

| Component | Story Points | Confidence | Notes |
|-----------|--------------|------------|-------|
| SessionConfigFormContext expansion | 1 | ⭐⭐⭐⭐⭐ | Mechanical additions; precedent = topographies field |
| SQLite Migration v6 | 1 | ⭐⭐⭐⭐⭐ | Copy v4 pattern; 2 new columns |
| SensorSelectScreen (clone + adapt) | 2 | ⭐⭐⭐⭐ | TopographySelectScreen provides 70% template |
| SessionConfigScreen (remove research + add sensors) | 2 | ⭐⭐⭐⭐ | Need detailed code review; estimate from inspection |
| Env var validation (startup) | 0.5 | ⭐⭐⭐⭐⭐ | Simple check + error modal |
| Testing & integration | 1 | ⭐⭐⭐⭐ | Manual testing against device; existing patterns |
| **TOTAL** | **7.5** | - | **Range: 6–9 (1 sprint)** |

---

### Dependency Chain (Recommended Implementation Order)

```
PARALLEL: Env var setup (doc + .env.example)
   ↓
1. SessionConfigFormContext (BLOCKER) — 1 SP
   ↓
2. SQLite v6 migration (can start in parallel) — 1 SP
   ↓
3. SensorSelectScreen (depends on #1) — 2 SP
   ↓
4. SessionConfigScreen updates (depends on #1 + #3) — 2 SP
   ↓
5. Testing & validation — 1 SP
```

**Suggested Schedule:**
- **Day 1 (3–4 hours)**: #1 + #2 (context + migration)
- **Day 2 (3–4 hours)**: #3 + partial #4 (sensor screen + UI updates)
- **Day 3 (2–3 hours)**: Complete #4 + #5 (validation logic + testing)

---

### Implementation Risks

| # | Risk | Probability | Severity | Mitigation | Effort |
|---|------|-------------|----------|-----------|--------|
| 1 | Circular dependency: SessionConfigFormContext ↔ SensorSelectScreen | Low | High | Unidirectional flow: SensorSelectScreen → context via action dispatch only | None |
| 2 | Migration v5 → v6 fails on existing user devices | Low | High | Test migration on real device; include rollback script in deployment docs | S |
| 3 | Empty sensor list crashes SensorSelectScreen | Medium | Medium | Render error state; show guidance text; allow optional sensors (per requirements) | M |
| 4 | Device change leaves stale sensor selections | Medium | Medium | Add device change listener → auto-clear sensors on device swap | M |
| 5 | Env var not read correctly in Expo bundle | Low | High | Add runtime validation check + console.warn if missing; test with multiple bundle builds | S |

**Total Risk Mitigation Effort: 1–2 additional story points**

---

### Code Review Checklist

**Before Code Review:**
- [ ] All @iris/domain types used (no implicit `any`)
- [ ] SessionFavorite schema includes sensor_ids + sensor_names columns
- [ ] SensorSelectScreen follows TopographySelectScreen folder/naming structure
- [ ] Env var EXPO_PUBLIC_RESEARCH_ID documented in .env.example
- [ ] Form validation: [Start Session] button requires sensors (unless empty list is explicit UX design)
- [ ] Favorites save/load include sensor selections

**Before Merge:**
- [ ] Manual test: Create session → select sensors → start session
- [ ] Manual test: Save favorite → restore sensors
- [ ] Manual test: Missing env var → shows error modal with guidance
- [ ] Diff SessionConfigScreen vs. prior version (ensure only research removal + sensor addition)
- [ ] No console errors in Expo dev server during sensor selection flow

---

### Post-Implementation Considerations

**Documentation Updates Required:**
1. .env.example: add EXPO_PUBLIC_RESEARCH_ID=<research-uuid>
2. CLAUDE.md: add deployment guide (env var setup per research context)
3. DEVELOPMENT_GUIDE.md: document SessionConfigFormContext pattern (sensor selection)
4. PROJECT_STATUS.md: update phase progress

**Future Enhancements (OUT OF SCOPE — Phase 5+):**
- Sensor caching in middleware layer
- Backend sensor list pagination (if > 100 sensors/device)
- Sensor presets by body structure (e.g., "Upper Limb" → [EMG_L, EMG_R])
- Real-time sensor availability check (device online/offline)

---

## [TESTABILITY NOTES]

Added by QA Specialist following plan-phase analysis.

### Critical Test Paths

#### 1. Environment Variable Binding
- **Risk**: Missing or malformed `EXPO_PUBLIC_RESEARCH_ID` causes runtime failure without clear feedback
- **Test Coverage**:
  - ✅ App startup with valid `EXPO_PUBLIC_RESEARCH_ID` → researchId is captured globally
  - ✅ App startup with missing `EXPO_PUBLIC_RESEARCH_ID` → clear error toast/modal displayed (implementation detail TBD)
  - ✅ App startup with invalid UUID format → validation and error handling
  - **Note**: This is build-time binding; requires separate APK/bundle builds for each research context. Document build instructions.

#### 2. SensorSelectScreen Integration
- **Risk**: Sensors depend on prior selections (device + research ID); missing data causes fetch failures
- **Test Coverage**:
  - ✅ Navigate to SensorSelectScreen without device selected → show error or block navigation
  - ✅ Navigate to SensorSelectScreen with device selected → fetch succeeds and displays sensor list
  - ✅ Sensor list empty (backend returns 0 sensors) → show empty state; do not block session start (per requirements)
  - ✅ Backend fetch timeout/error → clear error message + retry capability
  - ✅ Multi-select: click sensor → chip appears in SessionConfigScreen
  - ✅ Multi-select: click selected sensor again → chip is removed (toggle behavior)
  - ✅ Navigate away without saving → selected sensors are discarded (confirm behavior)
  - ✅ Navigate back to SensorSelectScreen → state is NOT pre-populated from context (stateless pattern)

#### 3. SessionConfigScreen Removal & Migration
- **Risk**: Existing UI references to research selection may break; form validation changes
- **Test Coverage**:
  - ✅ SessionConfigScreen no longer renders research project card
  - ✅ SessionConfigScreen no longer renders "Link to Research" dropdown
  - ✅ SessionConfigFormContext does not include `selectedResearchId`, `selectedResearchTitle`, or `researchProjects`
  - ✅ Form validation: "sensors required" error appears if sensors are empty before start
  - ✅ [Start Session] button is disabled if sensors are not selected

#### 4. Favorites Persistence
- **Risk**: SQLite migration from v5→v6 loses data or crashes; favorites apply with wrong sensor sets
- **Test Coverage**:
  - ✅ Fresh install (no existing data) → create favorite → v6 schema includes sensor fields
  - ✅ Upgrade from v5 → migrate schema → existing favorites are preserved (research fields unused, not deleted)
  - ✅ Apply favorite → sensors are restored alongside body structure, topography, device
  - ✅ Edit favorite → sensors can be added/removed and re-saved
  - ✅ Delete favorite → no cascade delete side effects on other tables
  - **Note**: Test migration by seeding a v5 database and upgrading locally.

#### 5. Data Model Consistency
- **Risk**: SessionConfig, SessionConfigFormContext, and SessionFavorite types are out of sync
- **Test Coverage**:
  - ✅ TypeScript strict mode compilation passes (no implicit `any`)
  - ✅ startSession() accepts and forwards sensorIds to backend
  - ✅ SessionFavorite schema change is reflected in favoriteRepository.create() and applyFavorite() logic
  - ✅ Sensor names are displayed consistently in UI (use IDs internally, display names in chips)

### End-to-End Scenario (Happy Path)

```
1. App starts → validates EXPO_PUBLIC_RESEARCH_ID
2. User selects volunteer
3. User selects body structure + topography
4. User selects device via Bluetooth pairing
5. User navigates to SensorSelectScreen
6. Backend returns device sensors → user multi-selects N sensors
7. Sensors appear in SessionConfigScreen as chip strip
8. User clicks [Start Session]
9. Session record includes selected sensor IDs
10. Session proceeds to ActiveSession → CaptureScreen → StreamingScreen
```

### Ambiguous Acceptance Criteria (Resolved)

| Criterion | Clarification |
|-----------|---------------|
| "Sensors required" validation | Block [Start Session] button if sensors are empty; show inline error message |
| Empty sensor list behavior | Do NOT block session if backend returns no sensors for a device; log warning, allow proceed |
| Sensor display | Show sensor names (e.g., "Biceps") in chips, but store/transmit sensor IDs internally |
| Navigation back from SensorSelectScreen | If user navigates back without saving, selected state is lost (no persisted selection across navigation) |
| EXPO_PUBLIC_RESEARCH_ID format | Must be valid UUID v4 format; case-insensitive; validate at startup and show error if invalid |
| Favorites with no sensors | Allow favorites to be created/saved with empty sensor list (edge case; may indicate sensor list is optional) |

### Test Environment Setup

- **Emulator/Device**: Android emulator or physical device with Bluetooth support
- **Backend Mocking**: Use mock `researchService.getDeviceSensors()` returning sample sensor data
- **SQLite Testing**: Use ephemeral database for unit tests; snapshot tests for migrations
- **Environment Config**: Test with multiple `EXPO_PUBLIC_RESEARCH_ID` values (valid UUID, missing, invalid format)

### Known Unknowns (TL/Dev to Clarify)

1. **Sensor list API contract**: Does the backend return sensor IDs, names, and other metadata? Confirm endpoint response shape.
2. **Empty sensor list**: If backend returns 0 sensors, should the session still start or be blocked? (Currently: allow to start per requirements)
3. **Sensor persistence in session record**: Are sensorIds stored as JSON array, comma-separated string, or foreign key array? Confirm schema design.
4. **Multi-select chip removal UX**: When user clicks a selected sensor chip again, is it toggled off or does navigation occur? (Currently: toggle off, but confirm design)
5. **Research context at session start**: Is researchId passed to `startSession()` and forwarded to backend? Confirm data flow.

### Test Automation Scope (Post-QA Plan)

- **Unit Tests**: SessionConfigFormContext reducer, favoriteRepository migration logic
- **Integration Tests**: SensorSelectScreen component with mocked service layer
- **E2E Tests**: Full session creation flow using Playwright or native test framework (TBD)
- **Manual Testing**: Device pairing + sensor list fetch + session start (requires real device or emulator with Bluetooth)

---

## Appendix: Current vs. Target Flow

### Current SessionConfigScreen Flow

```
SessionConfigScreen
├── [Research Projects] nav card → ResearchList
├── [Link to Research] dropdown (optional)
├── [Favorites] chip strip
├── [Volunteer] search + select
├── [Clinical Data] body structure + topography
├── [Hardware] device select
└── [Start Session] button
```

### Target SessionConfigScreen Flow

```
SessionConfigScreen
├── [Favorites] chip strip (now includes sensors)
├── [Volunteer] search + select
├── [Clinical Data] body structure + topography
├── [Hardware] device select
├── [Sensors] chip strip + [Add] → SensorSelectScreen (NEW)
└── [Start Session] button (requires sensors)
```

### New Navigation Route

```
HomeStack
├── SessionConfig (updated)
├── SensorSelect (NEW) ← multi-select sensors from device
├── TopographySelect (unchanged)
├── ActiveSession (unchanged)
├── ...
```

### Environment Variable

```
# .env or app.config.ts
EXPO_PUBLIC_RESEARCH_ID=<uuid>
```

Resolved once at app init. Passed to `startSession()` and `researchService.getDeviceSensors()` without user interaction.
