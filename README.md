# IRIS — Interoperable Research Interface System

IRIS is the mobile and desktop application layer of the PRISM federated biomedical research framework. It provides the user interface for managing research sessions, controlling the sEMG/FES device over Bluetooth, visualizing real-time biosignal data, and synchronizing session data to a Research Node backend.

---

## What IRIS Does

Researchers use IRIS to:

- Authenticate against a PRISM Research Node using a secure 4-phase cryptographic handshake.
- Create and manage research projects, volunteers, and clinical sessions.
- Connect to the PRISM sEMG/FES device over Bluetooth and stream biosignal data in real time at 215 Hz.
- Record, annotate, and export session data as ZIP archives containing CSV files.
- Synchronize session data to a Research Node for federated storage and later retrieval.
- Browse the session history, apply saved configuration favorites, and export individual sessions even after the data has been uploaded to the backend.

---

## Applications

### Mobile App (primary)

Built with React Native + Expo 52 for Android. This is the main application for device control and data collection in the field.

### Desktop App

Built with Electron + Vite + React. Provides a data management interface for administrative tasks and component documentation via Storybook.

---

## Project Structure

```
IRIS/
├── apps/
│   ├── mobile/          # React Native + Expo (Android)
│   └── desktop/         # Electron + React (Windows/macOS/Linux)
├── packages/
│   ├── domain/          # Shared TypeScript types and models
│   ├── middleware/       # 4-phase handshake and secure communication
│   └── ui-components/   # Shared UI components (in progress)
└── docs/                # Architecture, API reference, and guides
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- Android device or emulator (for the mobile app)
- Expo CLI (`npm install -g expo-cli`)

### Install Dependencies

```bash
npm install
```

### Run the Mobile App

```bash
npm run mobile            # Start Expo dev server
npm run mobile:android    # Build and run on Android
npm run mobile:web        # Run in web browser
```

### Run the Desktop App

```bash
npm run desktop           # Start Electron in development mode
```

### Type Check All Workspaces

```bash
npm run type-check:all
```

---

## Key Capabilities

### Real-Time sEMG Streaming

The mobile app communicates with the PRISM ESP32 device over Bluetooth SPP using a binary protocol. Signals are captured at 215 Hz, displayed in a 4-second rolling window at 40 Hz, and written to CSV files on the device.

### Session Synchronization

Sessions, recordings, and annotations are automatically synchronized to a PRISM Research Node every 60 seconds. After a recording is uploaded to blob storage, the local CSV file is deleted to reclaim device storage and the remote URL is preserved for later export.

### ZIP Export

Any session in the history — whether synced or not — can be exported as a ZIP archive. For sessions that have been synced, the app fetches recording data from the backend blob storage at export time. For sessions that have not yet been synced, data is read directly from local device storage. Offline export shows an informative message per recording rather than silently failing.

### Saved Configuration Favorites

Session configuration presets (muscle group, topography, device settings) can be saved as favorites and reapplied in one tap when starting a new session.

### Session History

The History screen lists all past sessions with their sync status. Each session can be opened to review its recordings and annotations, or exported as a ZIP.

---

## Architecture

IRIS follows a layered architecture:

```
Presentation  →  Screens (React Native components)
Service       →  SyncService, ResearchService, VolunteerService, SnomedService
Data          →  Repositories (RecordingRepository, SessionRepository, AnnotationRepository, FavoriteRepository)
Persistence   →  SQLite (expo-sqlite, 5 migrations v1–v5)
Middleware    →  @iris/middleware (4-phase handshake, bearer token management)
Domain        →  @iris/domain (shared TypeScript interfaces)
```

State management uses React Context API: AuthContext, BluetoothContext, SessionContext, SyncContext, SessionConfigFormContext.

---

## Data Storage

The mobile app uses a local SQLite database that is automatically migrated on startup. The migration history is:

| Version | Change |
|---------|--------|
| v1 | Initial schema: users, research, volunteers, sessions, recordings, annotations |
| v2 | Add research metadata columns |
| v3 | Relax laterality constraint |
| v4 | Add session favorites table |
| v5 | Add `blob_url` column to recordings; retroactive repair of synced recordings |

---

## Documentation

| Topic | Location |
|-------|----------|
| Architecture overview | `docs/architecture/ARCHITECTURE_OVERVIEW.md` |
| Development guide | `docs/development/DEVELOPMENT_GUIDE.md` |
| Bluetooth protocol | `docs/api/BLUETOOTH_COMMANDS.md` |
| Service API | `docs/api/SERVICES_API.md` |
| Middleware API | `docs/api/MIDDLEWARE_API.md` |
| Troubleshooting | `docs/troubleshooting/COMMON_ISSUES.md` |

---

## PRISM Ecosystem

IRIS is one of four components in the PRISM framework:

| Component | Role |
|-----------|------|
| IRIS (this project) | Mobile + Desktop application layer |
| InteroperableResearchNode | Backend server: federated data storage, 4-phase security protocol |
| InteroperableResearchsEMGDevice | ESP32 firmware: sEMG signal capture and FES stimulation |
| InteroperableResearchInterfaceSystem | Protocol translation middleware |

---

## License

Academic research project — PRISM / Faculdade.
