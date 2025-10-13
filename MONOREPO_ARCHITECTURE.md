# IRIS Monorepo Architecture

## Overview

Restructured project into a **monorepo** to support multiple applications (mobile + desktop) sharing common code.

## Architecture

```
IRIS/
├── apps/
│   ├── mobile/                    # React Native mobile app (Expo)
│   │   ├── src/
│   │   │   ├── screens/           # Mobile-specific screens
│   │   │   ├── components/        # Mobile-specific components
│   │   │   └── navigation/        # React Navigation setup
│   │   ├── app.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── desktop/                   # Electron desktop app
│       ├── src/
│       │   ├── main/              # Electron main process
│       │   ├── renderer/          # React renderer process
│       │   └── preload/           # Preload scripts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── domain/                    # Shared domain models
│   │   ├── src/
│   │   │   ├── models/            # TypeScript interfaces/types
│   │   │   │   ├── Bluetooth.ts   # Bluetooth protocol types
│   │   │   │   ├── Stream.ts      # Streaming data types
│   │   │   │   ├── Session.ts     # Session management types
│   │   │   │   └── Device.ts      # Device configuration types
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── middleware/                # Shared business logic
│   │   ├── src/
│   │   │   ├── bluetooth/         # Bluetooth protocol handlers
│   │   │   ├── streaming/         # Data streaming logic
│   │   │   ├── validation/        # Data validation
│   │   │   └── utils/             # Shared utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui-components/             # Shared UI components
│       ├── src/
│       │   ├── charts/            # Chart components
│       │   ├── forms/             # Form components
│       │   └── layout/            # Layout components
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                          # Documentation
├── package.json                   # Root workspace config
├── tsconfig.json                  # Base TypeScript config
└── README.md
```

## Package Structure

### 1. `apps/mobile` - React Native Mobile App

**Purpose:** Device control, real-time sEMG monitoring
**Technology:** React Native + Expo
**Key Features:**
- Bluetooth communication with ESP32 device
- Real-time signal visualization
- FES parameter configuration
- Session management

**Dependencies:**
```json
{
  "@iris/domain": "workspace:*",
  "@iris/middleware": "workspace:*",
  "@iris/ui-components": "workspace:*",
  "react-native": "^0.76.6",
  "expo": "~52.0.0"
}
```

### 2. `apps/desktop` - Electron Desktop App

**Purpose:** Application management, data analysis, research tools
**Technology:** Electron + React
**Key Features:**
- Data visualization and analysis
- Session history and reports
- User/patient management
- Export functionality (CSV, PDF)
- Statistical analysis
- Multi-session comparison

**Dependencies:**
```json
{
  "@iris/domain": "workspace:*",
  "@iris/middleware": "workspace:*",
  "@iris/ui-components": "workspace:*",
  "electron": "^28.0.0",
  "react": "^18.3.1"
}
```

### 3. `packages/domain` - Shared Domain Models

**Purpose:** Type definitions, interfaces, enums
**Technology:** TypeScript (pure)

**Exports:**
```typescript
// Bluetooth Protocol
export interface BluetoothProtocolPayload { ... }
export enum BluetoothProtocolFunction { ... }
export enum BluetoothProtocolMethod { ... }

// Streaming
export interface StreamDataPacket { ... }
export interface StreamConfiguration { ... }
export type StreamType = 'raw' | 'filtered' | 'rms';

// Session
export interface SessionStatus { ... }
export interface FESParameters { ... }

// Device
export interface DeviceInfo { ... }
export interface DeviceCapabilities { ... }
```

### 4. `packages/middleware` - Shared Business Logic

**Purpose:** Protocol handlers, data processing, validation
**Technology:** TypeScript

**Modules:**
- **bluetooth:** Protocol encoding/decoding, message validation
- **streaming:** Data processing, filtering, buffering
- **validation:** Input validation, safety checks
- **utils:** Helper functions, formatters

**Exports:**
```typescript
// Bluetooth Protocol
export class BluetoothProtocolEncoder { ... }
export class BluetoothProtocolDecoder { ... }

// Streaming
export class StreamDataProcessor { ... }
export function processStreamPackets(...): ProcessedData { ... }

// Validation
export function validateFESParameters(...): ValidationResult { ... }
export function validateStreamConfig(...): ValidationResult { ... }
```

### 5. `packages/ui-components` - Shared UI Components

**Purpose:** Reusable UI components (platform-agnostic where possible)
**Technology:** React + React Native compatible components

**Components:**
- **charts:** SEMGChart, SessionChart, ComparisonChart
- **forms:** FESParameterForm, StreamConfigForm
- **layout:** Card, Grid, Panel

## Workspace Configuration

### Root `package.json`:

```json
{
  "name": "iris-monorepo",
  "version": "2.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "mobile": "npm run start --workspace=@iris/mobile",
    "mobile:android": "npm run android --workspace=@iris/mobile",
    "desktop": "npm run start --workspace=@iris/desktop",
    "desktop:build": "npm run build --workspace=@iris/desktop",
    "build:all": "npm run build --workspaces",
    "type-check:all": "npm run type-check --workspaces",
    "clean": "rm -rf node_modules apps/*/node_modules packages/*/node_modules"
  },
  "devDependencies": {
    "typescript": "~5.9.2"
  }
}
```

## Migration Plan

### Phase 1: Create Monorepo Structure ✅
1. Create `apps/`, `packages/` directories
2. Setup root `package.json` with workspaces
3. Create shared package scaffolds

### Phase 2: Extract Domain Models
1. Create `packages/domain`
2. Move types from `src/context/BluetoothContext.tsx`
3. Organize into modules (Bluetooth, Stream, Session, Device)

### Phase 3: Extract Middleware
1. Create `packages/middleware`
2. Extract protocol logic from BluetoothContext
3. Extract streaming logic from useStreamData

### Phase 4: Migrate Mobile App
1. Move current app to `apps/mobile`
2. Update imports to use `@iris/domain` and `@iris/middleware`
3. Test mobile app still works

### Phase 5: Initialize Desktop App
1. Setup Electron + React in `apps/desktop`
2. Create main process structure
3. Create renderer process with React
4. Import shared packages

### Phase 6: Extract Shared UI Components
1. Create `packages/ui-components`
2. Move SEMGChart component
3. Make platform-agnostic where possible

## Benefits

### 1. Code Reuse
- **Domain models:** Single source of truth for types
- **Business logic:** Shared protocol handling, validation
- **UI components:** Reusable charts and forms

### 2. Consistency
- **Protocol:** Identical Bluetooth handling across platforms
- **Validation:** Same rules for mobile and desktop
- **Types:** Type safety across entire solution

### 3. Maintainability
- **Single update:** Change protocol once, affects both apps
- **Isolated packages:** Clear separation of concerns
- **Independent versioning:** Each package can evolve independently

### 4. Scalability
- **New apps:** Easy to add web app, CLI tool, etc.
- **Team collaboration:** Teams can work on separate apps
- **Testing:** Test packages independently

## Technology Stack

### Mobile App:
- React Native 0.76.6
- Expo 52.0.0
- React Navigation 7.x
- react-native-bluetooth-classic
- react-native-gifted-charts

### Desktop App:
- Electron 28.x
- React 18.3.1
- Electron Builder (packaging)
- Recharts (charts for desktop)

### Shared Packages:
- TypeScript 5.9.2
- Pure JavaScript/TypeScript (no platform-specific code)

## Development Workflow

### Running Mobile App:
```bash
# From root
npm run mobile

# Or from mobile directory
cd apps/mobile
npm start
```

### Running Desktop App:
```bash
# From root
npm run desktop

# Or from desktop directory
cd apps/desktop
npm start
```

### Building All:
```bash
npm run build:all
```

### Type Checking:
```bash
npm run type-check:all
```

## Import Patterns

### Before (Monolithic):
```typescript
import { useBluetoothContext } from '@/context/BluetoothContext';
import { useStreamData } from '@/hooks/useStreamData';
```

### After (Monorepo):
```typescript
// Domain types
import { StreamDataPacket, FESParameters } from '@iris/domain';

// Business logic
import { BluetoothProtocolEncoder, StreamDataProcessor } from '@iris/middleware';

// UI components
import { SEMGChart } from '@iris/ui-components';

// App-specific
import { useBluetoothConnection } from '../hooks/useBluetoothConnection';
```

## Next Steps

1. ✅ Create monorepo structure
2. ⏳ Extract domain models
3. ⏳ Extract middleware logic
4. ⏳ Migrate mobile app
5. ⏳ Initialize desktop app
6. ⏳ Test both apps with shared packages

## References

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/)
