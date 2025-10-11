# Interoperable Research Interface System (IRIS)

A React Native application built with Expo for controlling and visualizing data from the PRISM sEMG/FES (surface electromyography and Functional Electrical Stimulation) device. Part of the **PRISM** (Project Research Interoperability and Standardization Model) federated biomedical research framework.

## Overview

IRIS is a cross-platform mobile application that:
- Connects to ESP32-based sEMG/FES devices via Bluetooth Serial Port Profile (SPP)
- Controls therapeutic electrical stimulation sessions
- Streams and visualizes real-time biosignal data
- Implements a standardized JSON-based communication protocol
- Provides an intuitive interface for researchers and clinicians

**Supported Platforms**: Web (development) and Android (production)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for Android development)
- Physical Android device or emulator with Bluetooth support
- ESP32 sEMG/FES device ("NeuroEstimulator" firmware)

## Project Structure

```
├── src/
│   ├── context/          # React Context providers (BluetoothContext)
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx           # Device connection and session control
│   │   ├── StreamConfigScreen.tsx   # Streaming configuration
│   │   └── StreamingScreen.tsx      # Real-time data visualization
│   ├── hooks/            # Custom React hooks
│   │   └── useStreamData.ts         # Stream data management and chart formatting
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── docs/                 # Documentation
│   ├── setup/            # Setup guides
│   ├── implementation/   # Implementation documentation
│   └── troubleshooting/  # Common issues and fixes
├── App.tsx               # Root component with navigation
├── app.json              # Expo configuration
├── CLAUDE.md             # AI assistant development guide
└── tsconfig.json         # TypeScript configuration
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

**Note for Windows users**: If you encounter long path errors during installation, see [docs/troubleshooting/WINDOWS_LONG_PATH_FIX.md](docs/troubleshooting/WINDOWS_LONG_PATH_FIX.md).

### 2. Start Development Server

```bash
npm start
```

### 3. Run on Android

```bash
npm run android
```

For detailed Bluetooth setup instructions, see [docs/setup/BLUETOOTH_SETUP.md](docs/setup/BLUETOOTH_SETUP.md).

## Available Scripts

### Development
- `npm start` - Start Expo development server (interactive menu)
- `npm run web` - Run on web browser (http://localhost:8081)
- `npm run android` - Run on Android emulator/device
- `npm run dev:web` - Start web development server
- `npm run dev:android` - Start Android development server
- `npm run clean` - Clear cache and restart

### Building
- `npm run build:web` - Build for web production (exports to `dist/`)
- `npm run build:android` - Build Android APK (Expo build service)
- `npm run prebuild` - Generate native Android project files

### Type Checking
- `npm run type-check` - Run TypeScript type checking (no compilation)

## Key Features

### 1. Bluetooth Device Management
- Automatic discovery of paired "NeuroEstimulator" devices
- Connection management with automatic status updates
- Event-driven message handling
- Null-terminated JSON protocol implementation

### 2. FES Session Control
- Configurable stimulation parameters (amplitude, frequency, pulse width)
- Start/stop/pause/resume session controls
- Real-time trigger detection from sEMG signals
- Emergency stop handling
- Session status monitoring

### 3. Real-Time sEMG Streaming
- Configurable sampling rates (10-200 Hz)
- Multiple data types: raw, filtered (10-40 Hz bandpass), RMS
- Live chart visualization with automatic scrolling
- Packet-based streaming with timestamp synchronization
- Automatic buffer management (max 1000 samples)

### 4. Navigation
- Home screen: Device connection and session control
- Config screen: Streaming parameter configuration
- Streaming screen: Real-time data visualization

## Bluetooth Protocol

All communication uses JSON messages over Bluetooth SPP (9600 baud, null-terminated):

```json
{
  "cd": <code>,      // Message code (0-14)
  "mt": "<method>",  // Method: 'r' (read), 'w' (write), 'x' (execute), 'a' (acknowledge)
  "bd": {...}        // Optional body with parameters
}
```

### Key Message Codes

| Code | Function | Description |
|------|----------|-------------|
| 1 | GyroscopeReading | Request wrist angle measurement |
| 2 | StartSession | Begin sEMG monitoring + FES session |
| 3 | StopSession | End current session |
| 7 | FesParam | Configure FES parameters (amplitude, frequency, etc.) |
| 8 | Status | Session status update from device |
| 9 | Trigger | sEMG trigger detected notification |
| 11 | StartStream | Start real-time sEMG data streaming |
| 12 | StopStream | Stop sEMG data streaming |
| 13 | StreamData | Real-time sEMG data packet |
| 14 | ConfigStream | Configure streaming parameters (rate, type) |

For complete protocol specification, see [CLAUDE.md](CLAUDE.md#bluetooth-protocol-implementation).

## Development Workflow

### Connecting to Device

1. Pair ESP32 device ("NeuroEstimulator") via Android Bluetooth settings
2. Launch app and navigate to Home screen
3. Device appears in list automatically
4. Tap to connect - status updates to "Connected"

### Running FES Session

1. Configure FES parameters on Home screen
2. Tap "Start Session"
3. Device monitors sEMG signal and triggers stimulation
4. View real-time status updates
5. Tap "Stop Session" to end

### Streaming sEMG Data

1. Connect to device
2. Navigate to "Stream Config" screen
3. Configure sampling rate (10-200 Hz) and data type (raw/filtered/RMS)
4. Navigate to "Streaming" screen
5. Tap "Start Stream" to begin visualization
6. View live chart with scrolling data
7. Tap "Stop Stream" to end

## Troubleshooting

### Common Issues

1. **"undefined is not an object" in BluetoothContext**
   - See [docs/troubleshooting/BLUETOOTH_CONNECTION_FIX.md](docs/troubleshooting/BLUETOOTH_CONNECTION_FIX.md)

2. **Android Bluetooth permissions denied**
   - See [docs/troubleshooting/PERMISSION_FIX_SUMMARY.md](docs/troubleshooting/PERMISSION_FIX_SUMMARY.md)

3. **npm install fails with long path errors (Windows)**
   - See [docs/troubleshooting/WINDOWS_LONG_PATH_FIX.md](docs/troubleshooting/WINDOWS_LONG_PATH_FIX.md)

4. **Device not appearing in list**
   - Ensure device is paired in Android Bluetooth settings
   - Device must be named "NeuroEstimulator"
   - Check Bluetooth permissions are granted

5. **Connection drops frequently**
   - Verify Bluetooth module baud rate (default 9600)
   - Check for interference from other Bluetooth devices
   - Ensure device is within range (~10 meters)

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive development guide for AI assistants
- **[docs/README.md](docs/README.md)** - Documentation index
- **[docs/setup/](docs/setup/)** - Setup and configuration guides
- **[docs/implementation/](docs/implementation/)** - Implementation documentation
- **[docs/troubleshooting/](docs/troubleshooting/)** - Common issues and solutions

## Architecture

### Core Components

**BluetoothContext** (`src/context/BluetoothContext.tsx`)
- Global state management for Bluetooth connectivity
- Protocol encoding/decoding
- Event subscription management
- Device discovery and connection handling

**useStreamData Hook** (`src/hooks/useStreamData.ts`)
- Stream data buffer management (max 1000 samples)
- Chart data formatting with timestamp-based x-axis
- Automatic buffer cleanup

**Screens**
- `HomeScreen`: Device connection, FES session control
- `StreamConfigScreen`: Streaming parameter configuration
- `StreamingScreen`: Real-time chart visualization with React Native SVG

### Technology Stack

- **Framework**: React Native 0.81.4 + Expo ~54.0.12
- **Language**: TypeScript ~5.9.2 (strict mode)
- **Bluetooth**: react-native-bluetooth-classic
- **Charts**: react-native-svg + custom line chart implementation
- **State Management**: React Context API
- **Navigation**: React Navigation (stack navigator)

## PRISM Ecosystem Integration

IRIS is one component of the PRISM framework:

1. **InteroperableResearchNode** - Backend server for federated research data exchange
2. **InteroperableResearchsEMGDevice** - ESP32 firmware for biosignal acquisition
3. **IRIS (this project)** - Mobile application for device control
4. **neurax_react_native_app** - Alternative mobile implementation

For the complete PRISM architecture, see the root repository's `CLAUDE.md`.

## Contributing

1. Create a feature branch
2. Make changes following existing code patterns
3. Run `npm run type-check` to verify TypeScript
4. Test on physical Android device with Bluetooth
5. Update relevant documentation in `docs/`
6. Submit pull request

## License

MIT

## Contact & Support

For issues related to:
- **Device firmware**: See `../InteroperableResearchsEMGDevice/`
- **Backend/federation**: See `../InteroperableResearchNode/`
- **This application**: Open an issue in this repository
