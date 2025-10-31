# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PRISM Project - Master Architecture Overview

**PRISM** (Project Research Interoperability and Standardization Model) is a comprehensive federated framework for biomedical research data management, designed to break down data silos and enable secure, standardized collaboration across research institutions.

### Ecosystem Components

The PRISM framework consists of four interconnected components:

1. **InteroperableResearchNode** (Backend): Core backend server implementing federated research data exchange with 4-phase cryptographic handshake protocol, PostgreSQL/Redis persistence, and 28-table clinical data model. See `../InteroperableResearchNode/CLAUDE.md`.

2. **InteroperableResearchsEMGDevice** (Embedded): ESP32-based hardware device for biosignal acquisition and therapeutic stimulation. See `../InteroperableResearchsEMGDevice/CLAUDE.md`.

3. **InteroperableResearchInterfaceSystem** (Interface - **This Project**): React Native application for device control and data collection.

4. **neurax_react_native_app** (Mobile): Alternative mobile implementation (limited development).

### PRISM Model Abstraction

```
┌─────────────────────────────────────────────────────────────┐
│                    Research Institution                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ Application  │────────▶│   Device     │                  │
│  │ (This App)   │  BT     │  (sEMG/FES)  │  ◄── YOU ARE HERE│
│  └──────┬───────┘         └──────────────┘                  │
│         │ HTTPS                                              │
│  ┌──────▼────────────────────────────────────────┐          │
│  │    Interoperable Research Node (IRN)          │          │
│  └───────────────────────────┬───────────────────┘          │
│                              │ Encrypted Channel              │
└──────────────────────────────┼───────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   Federated PRISM Network   │
                └─────────────────────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Application (context) ≠ Device (capture) ≠ Node (storage/federation)
2. **Protocol Standardization**: JSON-based Bluetooth protocol matching ESP32 firmware specification
3. **Real-time Visualization**: React Native for cross-platform biosignal visualization
4. **Future Data Submission**: Will communicate with Research Node for data persistence
5. **User Experience**: Focused on researcher usability and real-time feedback

### Data Flow (Complete Research Session)

```
1. Researcher prepares session → This App (React Native UI)
2. Configure FES parameters → Bluetooth JSON to ESP32 Device
3. Start session → ESP32 begins sEMG monitoring
4. Real-time streaming → ESP32 sends biosignal packets to This App
5. Visualization → React Native charts display sEMG data
6. Data submission → This App sends to Research Node (future implementation)
```

### Navigation for AI Assistants

When working on this codebase:

1. **Interface/Mobile App** → You are here (`InteroperableResearchInterfaceSystem/CLAUDE.md`)
2. **Device Firmware** → See `../InteroperableResearchsEMGDevice/CLAUDE.md` for Bluetooth protocol details
3. **Backend/Node Development** → See `../InteroperableResearchNode/CLAUDE.md`
4. **Master Overview** → See root `../CLAUDE.md` for cross-component context

---

## Project Overview

**Interoperable Research Interface System (IRIS)** is a **monorepo project** containing both **Mobile** (React Native + Expo) and **Desktop** (Electron + Vite + React) applications that provide a comprehensive interface for managing biomedical research data, controlling the PRISM sEMG/FES device via Bluetooth, and interacting with the InteroperableResearchNode backend.

**Role in PRISM Ecosystem**: Represents the **Application** abstraction - general-purpose software that adds context (volunteer info, session metadata, research projects), controls device hardware via Bluetooth, visualizes real-time biosignals, manages user authentication, and submits data to Research Nodes for persistence and federation.

## Technology Stack

### Mobile App (React Native + Expo)
- **Framework**: React Native 0.76.9 with Expo ~52.0.47
- **Language**: TypeScript ~5.9.2 (strict mode enabled)
- **Platforms**: Android (primary), Web
- **Key Dependencies**:
  - `react-native-bluetooth-classic` - Bluetooth SPP communication
  - `react-native-gifted-charts` - Real-time sEMG visualization
  - `expo-file-system` + `expo-sharing` - CSV data export

### Desktop App (Electron + Vite + React)
- **Framework**: Electron 28.3.3 + Vite 6.0.7 + React 18.3.1
- **Language**: TypeScript ~5.9.2 (strict mode enabled)
- **Platforms**: Windows, macOS, Linux
- **Key Dependencies**:
  - `@heroicons/react` v2.2.0 - **All icons use Heroicons library**
  - `react-router-dom` v7.1.3 - Application routing
  - `recharts` v2.15.0 - Data visualization
  - `@storybook/react-vite` - Component documentation (8 stories)

### Shared Packages
- **@iris/domain** - Shared TypeScript types and models (User, Auth, Session, etc.)
- **@iris/middleware** - Authentication and secure communication middleware ✅
  - UserAuthService for login/logout/token refresh
  - Encrypted HTTP client with automatic channel management
  - 4-phase handshake with cryptographic authentication
  - Secure token storage (Electron + React Native)
- **@iris/ui-components** - Shared components (future)

## Monorepo Architecture

### Project Structure (Updated October 2025)

```
IRIS/
├── apps/
│   ├── mobile/              # React Native (Expo) - Device control
│   │   └── src/
│   │       ├── context/     # BluetoothContext (protocol implementation)
│   │       ├── screens/     # HomeScreen, StreamingScreen, StreamConfigScreen
│   │       ├── components/  # SEMGChart (real-time visualization)
│   │       ├── hooks/       # useStreamData
│   │       ├── utils/       # csvExport, formatters
│   │       └── types/       # Mobile-specific types
│   │
│   └── desktop/             # Electron + Vite + React - Data management
│       └── src/
│           ├── design-system/
│           │   └── components/  # 16 reusable UI components ✅
│           │       ├── app-layout/      ├── avatar/
│           │       ├── button/          ├── button-group/
│           │       ├── data-table/      ├── datepicker/
│           │       ├── dropdown/        ├── header/
│           │       ├── input/           ├── modal/
│           │       ├── password/        ├── search-bar/
│           │       ├── sidebar/         ├── toast/
│           │       └── typography/
│           ├── context/         # AuthContext ✅
│           ├── screens/         # Login, Home, UsersAndResearchers ✅
│           ├── services/        # AuthService (real + middleware) ✅
│           ├── storage/         # ElectronSecureStorage ✅
│           ├── config/          # menu.ts ✅
│           ├── stories/         # Storybook examples (8 stories) ✅
│           ├── App.tsx          # Main app component (routing) ✅
│           └── main.tsx         # React entry point ✅
│
├── packages/
│   ├── domain/              # Shared types (User, Auth, Session, etc.) ✅
│   ├── middleware/          # Authentication & secure communication ✅
│   │   ├── src/auth/        # UserAuthService, login/logout/refresh
│   │   ├── src/http/        # EncryptedHttpClient, automatic encryption
│   │   ├── src/crypto/      # CryptoDriver, WebCrypto integration
│   │   ├── src/channel/     # ChannelManager, ECDH key exchange
│   │   ├── src/session/     # SessionManager, token management
│   │   ├── src/storage/     # SecureStorage interface
│   │   ├── src/service/     # ResearchNodeMiddleware, 4-phase handshake
│   │   └── src/context/     # ResearchNodeMiddlewareContext (React)
│   └── ui-components/       # Shared components (future)
│
└── docs/                    # Comprehensive documentation
```

### Key Structural Changes (October 2025)

**Desktop App Reorganization:**
- ✅ **Flattened structure**: Moved from `src/renderer/` to `src/`
- ✅ **Main app**: Now `src/App.tsx` (was `src/renderer/App.tsx`)
- ✅ **Entry point**: `src/main.tsx`
- ✅ **Context providers**: Added `src/context/AuthContext.tsx`
- ✅ **Services layer**: Added `src/services/auth/AuthService.ts`
- ✅ **Configuration**: Added `src/config/menu.ts`
- ✅ **Design system**: 16 components in `src/design-system/components/`
- ✅ **Storybook**: Full setup with 8 component stories
- ✅ **Heroicons**: All SVG icons replaced with @heroicons/react library
- ✅ **Component reuse**: Eliminated duplicate code, following DRY principle

**Mobile App:**
- ✅ **Streaming feature**: Complete real-time sEMG visualization (215Hz)
- ✅ **CSV Export**: Full data export functionality
- ✅ **Bluetooth Protocol**: All 14 message codes implemented

### Bluetooth Protocol Implementation

The application communicates with the ESP32 sEMG/FES device using a JSON-based protocol defined in `BluetoothContext.tsx`. All messages follow this structure:

```typescript
{
  cd: number,      // Message code (0-14)
  mt: string,      // Method: 'r', 'w', 'x', 'a'
  bd?: object      // Optional body with parameters
}
```

**Key Protocol Enumerations**:
- `NeuraXBluetoothProtocolFunctionEnum` - Message codes (GyroscopeReading, StartSession, StopSession, etc.)
- `NeuraXBluetoothProtocolMethodEnum` - Methods (READ, WRITE, EXECUTE, ACK)
- `NeuraXBluetoothProtocolBodyPropertyEnum` - Parameter keys (AMPLITUDE, FREQUENCY, PULSE_WIDTH, etc.)

**Message Encoding**: All Bluetooth messages are null-terminated (`\0`) UTF-8 JSON strings.

### BluetoothContext (Global State)

The `BluetoothContext` manages all Bluetooth connectivity and device communication:

**Core State**:
- `bluetoothOn` - Bluetooth radio status
- `neuraDevices` - List of paired "NeuroEstimulator" devices with connection status
- `selectedDevice` - Currently connected device
- `fesParams` - FES stimulation parameters (amplitude, frequency, pulse width, difficulty, duration)
- `triggerDetected` - sEMG trigger event flag (auto-clears after 5s)
- `emergencyStop` - Emergency stop event flag (auto-clears after 5s)

**Key Functions**:
- `connectBluetooth(address)` - Connect to device and set up event listeners
- `disconnect(address)` - Disconnect and clean up subscriptions
- `sendFesParams(difficulty)` - Send FES configuration (code 7)
- `SingleFesStimulation(difficulty)` - Configure and trigger single FES pulse
- `startSession()` / `stopSession()` - Session control (codes 2, 3)
- `pauseSession()` / `resumeSession()` - Session pause/resume (codes 4, 5)
- `measureWristAmplitude()` - Request gyroscope reading (code 1)
- `decodeMessage(message)` - Parse incoming JSON messages and dispatch to state

**Event Subscriptions**:
- `onDataReceived` - Handles incoming serial data from device
- `onDeviceDisconnected` - Handles unexpected disconnections

## Common Development Commands

### Monorepo Setup

```bash
# Install all dependencies (root + all workspaces)
npm install

# Type check all workspaces
npm run type-check:all

# Build all workspaces
npm run build:all
```

### Mobile App (apps/mobile)

```bash
# Start Expo dev server (interactive menu)
npm run mobile

# Android development
npm run mobile:android

# Web development
npm run mobile:web

# iOS development (macOS only)
npm run mobile:ios

# Type check mobile app
cd apps/mobile && npm run type-check
```

### Desktop App (apps/desktop)

```bash
# Start desktop app in development mode
npm run desktop           # or npm run desktop:dev

# Build desktop app
npm run desktop:build

# Package desktop app (Electron)
npm run package           # Auto-detect platform
npm run package:win       # Windows (NSIS installer)
npm run package:mac       # macOS (DMG)
npm run package:linux     # Linux (AppImage)

# Storybook (component documentation)
cd apps/desktop && npm run storybook  # http://localhost:6006

# Type check desktop app
cd apps/desktop && npm run type-check
```

### TypeScript Standards

```bash
# Type check specific workspace
cd apps/desktop && npm run type-check
cd apps/mobile && npm run type-check

# Type check all packages
npm run type-check:all
```

## Coding Standards & Best Practices

### Icon Usage (CRITICAL: Updated October 2025)

**ALL icons must use Heroicons library (@heroicons/react). NO custom SVG files.**

```typescript
// ✅ CORRECT: Import from Heroicons
import { UserIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import { UserIcon as UserIconMini } from '@heroicons/react/20/solid';

// Usage
<Button iconLeft={<UserIcon className="w-5 h-5" />}>
    Add User
</Button>

// ❌ INCORRECT: Custom SVG imports
import CustomUserIcon from './assets/user-icon.svg';
```

**Icon Variants:**
- `@heroicons/react/24/outline` - 24x24 with 2px stroke (default)
- `@heroicons/react/24/solid` - 24x24 filled
- `@heroicons/react/20/solid` - 20x20 solid (mini, for tight spaces)

**Standard Sizes:**
```typescript
<UserIcon className="w-4 h-4" />  // 16px (small)
<UserIcon className="w-5 h-5" />  // 20px (default)
<UserIcon className="w-6 h-6" />  // 24px (medium)
<UserIcon className="w-8 h-8" />  // 32px (large)
```

### Component Reuse (CRITICAL)

**ALWAYS check for existing components before creating new ones.**

```bash
# Check desktop components
ls apps/desktop/src/design-system/components/

# Available components:
# Button, Input, Dropdown, Password, SearchBar, ButtonGroup
# DataTable, Avatar, Sidebar, Header, AppLayout
# Modal, Toast, Typography, DatePicker
```

**DO:**
- ✅ Reuse existing components with different props
- ✅ Compose multiple components together
- ✅ Extend components via composition, not duplication

**DON'T:**
- ❌ Create duplicate button implementations
- ❌ Copy-paste component code
- ❌ Create similar components with different names

```typescript
// ✅ GOOD: Reuse existing Button
import { Button } from '../design-system/components/button';

function MyScreen() {
    return <Button variant="primary">Click me</Button>;
}

// ❌ BAD: Creating duplicate
function MyScreen() {
    return <button className="my-custom-button">Click me</button>;
}
```

### TypeScript Strict Mode

**TypeScript strict mode is REQUIRED. No `any` types.**

```typescript
// ✅ GOOD: Explicit types
interface User {
    id: string;
    name: string;
    email: string;
}

function getUserName(user: User): string {
    return user.name;
}

// ❌ BAD: Using any
function getUserName(user: any): any {
    return user.name;
}
```

### File Organization

**Desktop Components:**
```
components/button/
├── Button.tsx           # Component logic
├── Button.types.ts      # TypeScript interfaces
├── Button.css           # Component styles
├── Button.stories.tsx   # Storybook stories
├── Button.test.tsx      # Unit tests (future)
├── README.md            # Component documentation
└── index.ts             # Barrel export
```

**Naming Conventions:**
- Components: `PascalCase.tsx` (Button.tsx)
- Screens: `PascalCase + Screen.tsx` (LoginScreen.tsx)
- Hooks: `camelCase + use prefix` (useStreamData.ts)
- Types: `PascalCase + .types.ts` (Button.types.ts)
- Styles: `Component.css` (Button.css)

### Documentation Requirements

See [docs/development/CODING_STANDARDS.md](docs/development/CODING_STANDARDS.md) for complete coding standards.

---

## Key Configuration Files

### Desktop App

- **`apps/desktop/package.json`** - Desktop app dependencies and scripts
- **`apps/desktop/vite.config.ts`** - Vite configuration
- **`apps/desktop/tsconfig.json`** - TypeScript configuration
- **`apps/desktop/.storybook/`** - Storybook configuration (8 stories)

### Mobile App

- **`apps/mobile/app.json`** - Expo configuration
  - `newArchEnabled: true` - Uses React Native's new architecture
  - `platforms: ["web", "android"]` - Supported platforms
  - Package name: `com.iris.app`

- **`tsconfig.json`** - TypeScript configuration
  - Extends `expo/tsconfig.base`
  - Strict mode enabled
  - Path alias: `@/*` maps to `./src/*`

- **`.env.example`** - Environment variables template (API_URL, API_KEY, APP_ENV)

---

## IRIS Middleware Authentication System

### Overview

The IRIS Middleware provides secure authentication and encrypted communication with the InteroperableResearchNode backend. It implements a 4-phase cryptographic handshake protocol with automatic token refresh and platform-specific secure storage.

**Implementation Status**: ✅ **Complete** (October 28, 2025)
**Files**: `IMPLEMENTATION_VERIFICATION_REPORT.md`, `IMPLEMENTATION_SUMMARY.md`

### Architecture

```
┌─────────────────────────────────────────────┐
│         Application Layer                    │
│  (React Components, Screens, Contexts)       │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│       UserAuthService                       │
│  - login()/logout()/refreshToken()          │
│  - Token storage and auto-refresh           │
│  - Session management                       │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│    ResearchNodeMiddleware                   │
│  - ensureSession() → 4-phase handshake      │
│  - invoke() → Encrypted communication       │
│  - State: idle → channel-ready → session    │
└──────┬───────────┬──────────┬───────────────┘
       │           │          │
    ┌──▼───┐  ┌────▼──┐  ┌───▼──────┐
    │Channel│  │Session│  │CryptoDriver
    │Manager│  │Manager│  │WebCrypto
    └───────┘  └───────┘  └──────────┘
       │           │          │
       └───────────┼──────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    InteroperableResearchNode                │
│    (Backend API - http://localhost:5000)    │
└─────────────────────────────────────────────┘
```

### Key Features

- **Automatic Token Refresh**: Refreshes 5 minutes before expiration
- **Secure Storage**: Platform-specific encryption (Electron DPAPI/Keychain, React Native Keychain/EncryptedPreferences)
- **4-Phase Handshake**: ECDH P-384 key exchange, X.509 certificates, RSA-SHA256 signatures
- **Encrypted Communication**: AES-256-GCM symmetric encryption
- **Perfect Forward Secrecy**: Ephemeral keys discarded after session

### Integration Points

**Desktop App** (`apps/desktop/src/services/middleware.ts`):
- `getMiddlewareServices()` - Get singleton instances
- `initializeAndHydrate()` - Load persisted state on startup
- `cleanupMiddleware()` - Cleanup on shutdown
- `RealAuthService` adapter - Maps domain types to middleware

**Mobile App** (`apps/mobile/src/services/middleware.ts`):
- Same pattern as desktop with Expo SecureStore integration

### Usage Example

```typescript
import { authService, initializeAndHydrate } from '@/services/middleware';

// Initialize on app start
useEffect(() => {
  initializeAndHydrate();
}, []);

// Login
const result = await authService.login({
  username: 'researcher@example.com',
  password: 'password'
});

// Check authentication
if (authService.isAuthenticated()) {
  const user = await authService.getCurrentUser();
}

// Logout
await authService.logout();
```

### Current Limitations

⚠️ **Before Production**:
- Mock certificates (replace with real X.509)
- Mock RSA signatures (implement real signing)
- Not yet integrated into app UI
- TypeScript compilation errors (see IMPLEMENTATION_VERIFICATION_REPORT.md)

### Documentation

- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Verification Report**: `IMPLEMENTATION_VERIFICATION_REPORT.md`
- **API Reference**: `docs/api/MIDDLEWARE_API.md` (see Task 4)
- **Migration Guide**: `docs/guides/MIGRATION_GUIDE_AUTH.md` (see Task 3)

---

## Bluetooth Device Protocol

### Supported Message Codes

| Code | Function | Direction | Description |
|------|----------|-----------|-------------|
| 0 | ConnectionHandshake | Bidirectional | Initial connection verification |
| 1 | GyroscopeReading | App → Device | Request wrist angle measurement |
| 2 | StartSession | App → Device | Begin sEMG monitoring + FES session |
| 3 | StopSession | App → Device | End current session |
| 4 | PauseSession | App → Device | Pause session (can resume) |
| 5 | ResumeSession | App → Device | Resume paused session |
| 6 | SingleStimuli | App → Device | Trigger single FES pulse |
| 7 | FesParam | App → Device | Configure FES parameters |
| 8 | Status | Device → App | Session status update |
| 9 | Trigger | Device → App | sEMG trigger detected |
| 10 | EmergencyStop | Device → App | Emergency stop activated |
| 11 | StartStream | App → Device | Start real-time sEMG data streaming |
| 12 | StopStream | App → Device | Stop sEMG data streaming |
| 13 | StreamData | Device → App | Real-time sEMG data packet |
| 14 | ConfigStream | App → Device | Configure streaming parameters |

### Message Parameters

#### FES Parameters (Code 7)

When sending FES parameters, the body contains:

```typescript
{
  a: number,    // Amplitude (0-15V)
  f: number,    // Frequency (1-100 Hz)
  pw: number,   // Pulse width (1-100 ms)
  df: number,   // sEMG difficulty (1-100%)
  pd: number    // Pulse duration (1-60 seconds)
}
```

#### Session Status (Code 8)

Status updates from device include:

```typescript
{
  parameters: {
    a: number,    // Current amplitude
    f: number,    // Current frequency
    pw: number,   // Current pulse width
    df: number,   // Current difficulty
    pd: number    // Current duration
  },
  status: {
    csa: number,  // Complete stimuli amount
    isa: number,  // Interrupted stimuli amount
    tlt: number,  // Time of last trigger (ms)
    sd: number    // Session duration (ms)
  }
}
```

#### sEMG Streaming Configuration (Code 14)

Configure streaming parameters before starting:

```typescript
{
  rate: number,   // Sampling rate in Hz (10-200)
  type: string    // Data type: "raw", "filtered", or "rms"
}
```

**Available types:**
- `"raw"` - Unprocessed ADC values
- `"filtered"` - Butterworth bandpass filtered (10-40 Hz)
- `"rms"` - Root Mean Square envelope

**Recommended rates:**
- **10-30 Hz**: Optimal for 9600 baud Bluetooth (default module speed)
- **50-100 Hz**: Requires 115200 baud Bluetooth module
- **100-200 Hz**: Maximum rate, requires upgraded hardware

#### sEMG Streaming Data (Code 13)

Real-time data packets sent by device:

```typescript
{
  t: number,       // Timestamp (milliseconds since boot)
  v: number[]      // Array of sEMG values (5-10 samples per packet)
}
```

**Packet structure:**
- **Rate < 100 Hz**: 5 samples per packet
- **Rate ≥ 100 Hz**: 10 samples per packet
- Packets sent at `rate / samples_per_packet` Hz

### Communication Flows

#### Connection Flow

1. **Discovery**: `updatePairedDevices()` scans for bonded devices named "NeuroEstimulator"
2. **Connection**: `connectBluetooth(address)` establishes SPP connection (non-secure socket)
3. **Event Listeners**: Subscribe to data receive and disconnect events
4. **Keep-Alive**: `verifyCurrentConnection()` checks connection every 10 seconds
5. **Disconnection**: `disconnect()` removes subscriptions and clears selected device

#### FES Session Flow

```
1. Configure parameters:
   App → {"cd":7,"mt":"w","bd":{"a":7,"f":60,"pw":300,"df":5,"pd":2}}

2. Start session:
   App → {"cd":2,"mt":"x"}
   Device → {"cd":2,"mt":"a"}  // ACK

3. During session (automatic):
   Device → {"cd":9,"mt":"w"}  // Trigger detected
   Device → {"cd":8,"mt":"w","bd":{...}}  // Status update

4. Stop session:
   App → {"cd":3,"mt":"x"}
   Device → {"cd":3,"mt":"a"}  // ACK
```

#### sEMG Streaming Flow

```
1. Configure streaming (optional):
   App → {"cd":14,"mt":"w","bd":{"rate":100,"type":"filtered"}}
   Device → {"cd":14,"mt":"a"}  // ACK

2. Start streaming:
   App → {"cd":11,"mt":"x"}
   Device → {"cd":11,"mt":"a"}  // ACK

3. Receive data packets (automatic):
   Device → {"cd":13,"mt":"w","bd":{"t":12345,"v":[23.4,25.1,...]}}
   Device → {"cd":13,"mt":"w","bd":{"t":12445,"v":[22.8,24.5,...]}}
   ...

4. Stop streaming:
   App → {"cd":12,"mt":"x"}
   Device → {"cd":12,"mt":"a"}  // ACK
```

**Important constraints:**
- Cannot run FES session and streaming simultaneously (shared timer)
- Streaming auto-stops after 10 minutes or on disconnect
- Buffer holds 200 samples; overflow drops oldest data

## Development Patterns

### Adding New Bluetooth Commands

1. Add new enum value to `NeuraXBluetoothProtocolFunctionEnum`
2. Create payload function in `BluetoothContext`:
```typescript
async function newCommand() {
    let payload: NeuraXBluetoothProtocolPayload = {
        cd: NeuraXBluetoothProtocolFunctionEnum.NewCommand,
        mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
    }
    await writeToBluetooth(JSON.stringify(payload))
}
```
3. Add case to `decodeMessage()` switch statement for handling responses
4. Expose function through context provider

### Using BluetoothContext in Components

```typescript
import { useBluetoothContext } from '@/context/BluetoothContext';

function MyComponent() {
    const {
        selectedDevice,
        connectBluetooth,

        // Session control
        startSession,
        stopSession,
        pauseSession,
        resumeSession,

        // FES control
        fesParams,
        setFesParams,
        sendFesParams,
        singleStimulation,

        // Streaming
        isStreaming,
        streamConfig,
        streamData,
        configureStream,
        startStream,
        stopStream,

        // Session status
        sessionStatus,
        isSessionActive
    } = useBluetoothContext();

    // Example: Configure and start streaming
    const handleStartStreaming = async () => {
        await configureStream(100, 'filtered'); // 100Hz, filtered data
        await startStream();
    };

    // Example: Start FES session
    const handleStartFES = async () => {
        await sendFesParams(); // Send current parameters
        await startSession();  // Start session
    };
}
```

### Complete Streaming Workflow Example

```typescript
import { useBluetoothContext, StreamType } from '@/context/BluetoothContext';

function StreamingScreen() {
    const {
        selectedDevice,
        isStreaming,
        streamData,
        streamConfig,
        configureStream,
        startStream,
        stopStream,
        clearStreamData
    } = useBluetoothContext();

    const handleConfigureAndStart = async () => {
        // Step 1: Configure streaming (optional - device has defaults)
        await configureStream(100, 'filtered');

        // Step 2: Start streaming
        await startStream();
    };

    const handleStop = async () => {
        await stopStream();
        // Optionally clear data
        clearStreamData();
    };

    // Render real-time data
    return (
        <View>
            <Text>Streaming: {isStreaming ? 'Active' : 'Inactive'}</Text>
            <Text>Config: {streamConfig.rate}Hz, {streamConfig.type}</Text>
            <Text>Packets received: {streamData.length}</Text>

            {streamData.map((packet, idx) => (
                <Text key={idx}>
                    t={packet.timestamp}ms: {packet.values.join(', ')}
                </Text>
            ))}
        </View>
    );
}
```

### TypeScript Path Aliases

Import from `src/` using the `@/` alias:

```typescript
import { HomeScreen } from '@/screens/HomeScreen';
import { User } from '@/types';
import { formatDate } from '@/utils';
```

## Platform-Specific Notes

### Android

- **Bluetooth Permissions**: Requires runtime permissions (handled by `react-native-bluetooth-classic`)
- **Settings Access**: `openBluetoothSettings()` opens Android Bluetooth settings
- **Device Discovery**: Only scans bonded (paired) devices, not nearby unpaired devices

### Web

- **Limited Bluetooth**: Web Bluetooth API has limited SPP support; this app is primarily designed for Android
- **Development**: Useful for UI development without device connection
- **Metro Bundler**: Expo uses Metro for web bundling (configured in `app.json`)

## Important Implementation Details

### Connection State Management

The app uses a dual-state pattern for device management:
- `neuraDevices` array tracks all paired devices with `active` flag
- `selectedDevice` holds the currently connected device
- Two event subscriptions (`btDataRecieveSubscription`, `btDeviceDisconnectSubscription`) must be cleaned up on disconnect

### Automatic Reconnection

The app does **not** automatically reconnect on disconnect. Instead:
- `onDeviceDisconnected` event shows `showConnectionErrorModal`
- User must manually reconnect via UI
- `updatePairedDevices()` polls every 5s until at least one device is found

### Message Timing

- **Trigger event**: Auto-clears after 5000ms
- **Emergency stop**: Auto-clears after 5000ms
- **Connection verification**: Runs every 10000ms for active connections
- **Serial output check**: Runs every 1000ms (currently commented out in code)

### Null Termination

All messages sent via `writeToBluetooth()` are automatically null-terminated:
```typescript
await RNBluetoothClassic.writeToDevice(address, payload + '\0')
```

This matches the ESP32 firmware expectation for message delimiters.

## Testing

Currently, there are no automated tests configured. Manual testing workflow:

1. Pair ESP32 device ("NeuroEstimulator") via Android Bluetooth settings
2. Run app: `npm run android`
3. Connect to device from app UI
4. Test FES parameters, session control, and trigger detection
5. Monitor console logs for protocol messages

## Known Limitations

- **Web Bluetooth**: SPP not widely supported; Android is primary platform
- **Device Name Hardcoded**: Only connects to devices named "NeuroEstimulator" (`BluetoothContext.tsx:90`)
- **Error Handling**: Connection errors show modal but don't retry automatically
- **UI Not Implemented**: While all protocol commands are implemented in BluetoothContext, UI components for streaming and advanced features need to be built
- **Data Visualization**: No real-time chart components for visualizing sEMG stream data yet
- **Data Persistence**: Stream data is stored in memory only (max 1000 packets); no local storage or backend submission

## Documentation Structure

**All development documentation is organized in `/docs` directory at the project root.**

### Documentation Organization

```
docs/
├── README.md                          # Main documentation hub
├── DOCUMENTATION_GUIDELINES.md        # Standards for writing documentation
├── architecture/                      # System design and architecture
│   ├── README.md
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── BLUETOOTH_PROTOCOL.md
│   ├── STATE_MANAGEMENT.md
│   └── COMPONENT_STRUCTURE.md
├── setup/                             # Setup and configuration
│   ├── README.md
│   ├── QUICK_START.md
│   ├── BLUETOOTH_SETUP.md
│   └── ENVIRONMENT_SETUP.md
├── development/                       # Development guides
│   ├── README.md
│   ├── DEVELOPMENT_GUIDE.md
│   ├── CODE_PATTERNS.md
│   ├── TYPESCRIPT_PATTERNS.md
│   └── TESTING_GUIDE.md
├── api/                               # API reference
│   ├── README.md
│   ├── BLUETOOTH_COMMANDS.md
│   ├── CONTEXT_API.md
│   └── HOOKS_REFERENCE.md
├── features/                          # Feature documentation
│   ├── README.md
│   ├── STREAMING.md
│   ├── FES_SESSION_CONTROL.md
│   └── DEVICE_CONNECTION.md
├── implementation/                    # Implementation details
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── STREAMING_IMPLEMENTATION.md
├── troubleshooting/                   # Problem-solving guides
│   ├── COMMON_ISSUES.md
│   ├── DEBUGGING_GUIDE.md
│   ├── ANDROID_ISSUES.md
│   └── WINDOWS_LONG_PATH_FIX.md
└── deployment/                        # Build and deployment
    ├── PRODUCTION_BUILD.md
    ├── EAS_BUILD.md
    └── APK_DISTRIBUTION.md
```

### Quick Navigation for Different Roles

**New Developer?**
1. Start: `docs/setup/QUICK_START.md`
2. Learn: `docs/architecture/ARCHITECTURE_OVERVIEW.md`
3. Code: `docs/development/CODE_PATTERNS.md`

**Implementing a Feature?**
1. Design: `docs/architecture/`
2. Implement: `docs/development/DEVELOPMENT_GUIDE.md`
3. Test: `docs/development/TESTING_GUIDE.md`
4. Reference: `docs/api/`

**Having Issues?**
- Troubleshooting: `docs/troubleshooting/COMMON_ISSUES.md`
- Debugging: `docs/troubleshooting/DEBUGGING_GUIDE.md`

**AI Assistant (Claude Code)?**
- Guidelines: `docs/DOCUMENTATION_GUIDELINES.md`
- Architecture: `docs/architecture/`
- API: `docs/api/`
- Current file: `docs/README.md`

### Documentation Standards

All documentation must follow standards defined in `docs/DOCUMENTATION_GUIDELINES.md`:

- **Language**: English only
- **Location**: `/docs` directory (appropriate subdirectory)
- **File Names**: `UPPERCASE_SNAKE_CASE`
- **Format**: Markdown with consistent styling
- **Quality**: Accurate, current, with examples
- **Links**: Relative paths, prefer internal references

### Key Documentation Files

| File | Purpose |
|------|---------|
| `docs/README.md` | Main documentation hub with full navigation |
| `docs/DOCUMENTATION_GUIDELINES.md` | Standards for writing documentation |
| `docs/architecture/ARCHITECTURE_OVERVIEW.md` | System design and components |
| `docs/api/BLUETOOTH_COMMANDS.md` | Complete Bluetooth protocol reference |
| `docs/development/DEVELOPMENT_GUIDE.md` | Main development workflow |
| `docs/implementation/IMPLEMENTATION_SUMMARY.md` | Feature status and progress |

---

## Integration with PRISM Ecosystem

This application is part of the larger PRISM federated research framework:

- **Device**: Communicates with `InteroperableResearchsEMGDevice` (ESP32 firmware)
- **Backend**: Will eventually send session data to `InteroperableResearchNode` API
- **Protocol Alignment**: Bluetooth message codes match ESP32 firmware specification

For detailed device protocol specification, see `InteroperableResearchsEMGDevice/CLAUDE.md` in the parent repository.
