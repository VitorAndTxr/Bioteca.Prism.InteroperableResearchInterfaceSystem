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

**Interoperable Research Interface System (IRIS)** is a React Native application built with Expo that provides a cross-platform interface for connecting to and controlling the PRISM sEMG/FES device via Bluetooth. The application runs primarily on web and Android platforms with full TypeScript support.

**Role in PRISM Ecosystem**: Represents the **Application** abstraction - general-purpose software that adds context (volunteer info, session metadata), controls device hardware via Bluetooth, visualizes real-time biosignals, and will eventually submit data to Research Nodes for persistence and federation.

## Technology Stack

- **Framework**: React Native 0.81.4 with Expo ~54.0.12
- **Language**: TypeScript ~5.9.2 (strict mode enabled)
- **Platforms**: Web and Android (configured in `app.json`)
- **Key Dependencies**:
  - `react-native-bluetooth-classic` - Bluetooth Serial Port Profile (SPP) communication
  - `expo-status-bar` - Status bar control
- **Bluetooth Protocol**: JSON-based message protocol matching the ESP32 device specification

## Architecture

### Application Structure

```
src/
├── context/          # React Context providers for global state
│   └── BluetoothContext.tsx  # Bluetooth device management and protocol implementation
├── screens/          # Screen components
│   └── HomeScreen.tsx
├── types/            # TypeScript type definitions
│   └── index.ts
└── utils/            # Utility functions
    └── index.ts
```

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

### Setup and Installation

```bash
# Install dependencies
npm install

# Type check without compilation
npm run type-check
```

### Development

```bash
# Start Expo dev server (opens interactive menu)
npm start

# Start with cleared cache
npm run clean

# Web development (http://localhost:8081)
npm run web
npm run dev:web

# Android development (requires Android Studio/emulator)
npm run android
npm run dev:android
```

### Building

```bash
# Build for web (exports to dist/)
npm run build:web

# Generate native Android project files
npm run prebuild

# Build Android APK (legacy Expo build service)
npm run build:android
```

### TypeScript

```bash
# Run type checking (does not emit JavaScript)
npm run type-check
```

## Key Configuration Files

- **`app.json`** - Expo configuration
  - `newArchEnabled: true` - Uses React Native's new architecture
  - `platforms: ["web", "android"]` - Supported platforms
  - Package name: `com.iris.app`

- **`tsconfig.json`** - TypeScript configuration
  - Extends `expo/tsconfig.base`
  - Strict mode enabled
  - Path alias: `@/*` maps to `./src/*`

- **`.env.example`** - Environment variables template (API_URL, API_KEY, APP_ENV)

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

## Integration with PRISM Ecosystem

This application is part of the larger PRISM federated research framework:

- **Device**: Communicates with `InteroperableResearchsEMGDevice` (ESP32 firmware)
- **Backend**: Will eventually send session data to `InteroperableResearchNode` API
- **Protocol Alignment**: Bluetooth message codes match ESP32 firmware specification

For detailed device protocol specification, see `InteroperableResearchsEMGDevice/CLAUDE.md` in the parent repository.
