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
| 1 | *Technical risk* | Low/Med/High | Low/Med/High | *Strategy* | S/M/L/XL |

## Specialist Notes

> Added by Dev Specialist (`/dev plan`) and QA Specialist (`/qa plan`).

### Developer Specialist

- *Domain-specific requirements or implementation risks*

### QA Specialist

- *Testability risks or ambiguous acceptance criteria*

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
