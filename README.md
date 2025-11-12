# Interoperable Research Interface System (IRIS)

**Monorepo project** containing both **Desktop** (Electron + Vite + React) and **Mobile** (React Native + Expo) applications for the PRISM (Project Research Interoperability and Standardization Model) federated biomedical research framework.

## Overview

IRIS provides comprehensive interfaces for:
- **Desktop App**: User authentication, research data management, secure communication with InteroperableResearchNode backend
- **Mobile App**: Device control, real-time biosignal visualization, Bluetooth communication with ESP32 sEMG/FES devices

### Desktop App Features ✅
- ✅ **Secure Authentication**: Login/logout with 4-phase cryptographic handshake
- ✅ **User Management**: View and manage researchers and volunteers
- ✅ **JWT Integration**: Automatic token refresh and secure storage
- ✅ **Design System**: 16 reusable UI components (buttons, inputs, tables, etc.)
- ✅ **Storybook**: Component documentation and testing

### Mobile App Features
- Bluetooth SPP connection to ESP32 sEMG/FES devices
- Real-time biosignal streaming and visualization
- FES session control (start/stop/pause/resume)
- Configurable stimulation parameters
- CSV data export

**Supported Platforms**:
- **Desktop**: Windows, macOS, Linux
- **Mobile**: Android (primary), Web (development)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for Android development)
- Physical Android device or emulator with Bluetooth support
- ESP32 sEMG/FES device ("NeuroEstimulator" firmware)

## Monorepo Structure

```
IRIS/
├── apps/
│   ├── desktop/             # Electron + Vite + React
│   │   ├── src/
│   │   │   ├── design-system/   # 16 reusable UI components
│   │   │   ├── context/         # AuthContext (authentication state)
│   │   │   ├── screens/         # Login, Home, UsersAndResearchers
│   │   │   ├── services/        # AuthService, middleware integration
│   │   │   ├── storage/         # ElectronSecureStorage
│   │   │   └── stories/         # Storybook component documentation
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── mobile/              # React Native + Expo
│       ├── src/
│       │   ├── context/         # BluetoothContext (device communication)
│       │   ├── screens/         # HomeScreen, StreamingScreen, etc.
│       │   ├── hooks/           # useStreamData (chart data management)
│       │   └── types/           # TypeScript definitions
│       ├── app.json
│       └── package.json
│
├── packages/
│   ├── domain/              # Shared TypeScript types
│   ├── middleware/          # Authentication & secure communication
│   │   ├── src/auth/        # UserAuthService (login/logout/refresh)
│   │   ├── src/http/        # EncryptedHttpClient
│   │   ├── src/crypto/      # CryptoDriver (AES-256-GCM)
│   │   ├── src/channel/     # ChannelManager (ECDH key exchange)
│   │   ├── src/session/     # SessionManager (4-phase handshake)
│   │   └── src/service/     # ResearchNodeMiddleware
│   └── ui-components/       # Shared UI components (future)
│
├── docs/                    # Comprehensive documentation
├── CLAUDE.md                # AI assistant development guide
├── AUTHENTICATION_FIXES.md  # Authentication bug fixes (Oct 31, 2025)
├── MIDDLEWARE_INTEGRATION_ANALYSIS.md  # Middleware analysis
└── package.json             # Root workspace configuration
```

## Quick Start

### Monorepo Setup

```bash
# Install all dependencies (root + all workspaces)
npm install
```

**Note for Windows users**: If you encounter long path errors during installation, see [docs/troubleshooting/WINDOWS_LONG_PATH_FIX.md](docs/troubleshooting/WINDOWS_LONG_PATH_FIX.md).

### Desktop App (Electron)

```bash
# Start desktop app in development mode
npm run desktop

# Build desktop app


# Package for distribution
npm run package         # Auto-detect platform
npm run package:win     # Windows (NSIS installer)
npm run package:mac     # macOS (DMG)
npm run package:linux   # Linux (AppImage)

# Storybook (component documentation)
cd apps/desktop && npm run storybook  # http://localhost:6006
```

**Login Credentials** (default InteroperableResearchNode):
- Email: `admin@admin.com`
- Password: `prismadmin`

### Mobile App (Expo)

```bash
# Start Expo dev server
npm run mobile

# Run on Android
npm run mobile:android

# Run on Web (development)
npm run mobile:web
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

## Desktop App: Authentication System

### Overview

The Desktop app implements secure authentication with the InteroperableResearchNode backend using a 4-phase cryptographic handshake protocol.

**Status**: ✅ **Fully Functional** (October 31, 2025)

### Features

- ✅ **User Login/Logout**: Email and password authentication
- ✅ **JWT Token Management**: Automatic token refresh (5 minutes before expiration)
- ✅ **Secure Storage**: Tokens encrypted with Electron safeStorage (DPAPI on Windows, Keychain on macOS)
- ✅ **4-Phase Handshake**: ECDH P-384 key exchange, AES-256-GCM encryption, RSA-2048 signatures
- ✅ **Perfect Forward Secrecy**: Ephemeral keys discarded after session

### Authentication Flow

```
1. User enters credentials → Login Screen
2. Password encoded (Base64) → UserAuthService
3. Encrypted channel established (AES-256-GCM) → Middleware
4. Backend validates credentials → Returns JWT token
5. Token decoded, user info extracted → Auth state stored
6. User redirected to Home Screen ✅
```

### Recent Fixes (October 31, 2025)

Three critical bugs were fixed to enable authentication:

1. **Password Encoding Corruption**: Removed incorrect `atob()` call in Login.tsx
2. **Backend Response Mapping**: Added flexible property mapping for PascalCase/camelCase
3. **JWT User Extraction**: Created `decodeUserFromToken()` method to extract user from JWT claims

**Documentation**: See [AUTHENTICATION_FIXES.md](AUTHENTICATION_FIXES.md) for detailed technical analysis.

### Usage Example

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { login, logout, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login({
      username: 'admin@admin.com',
      password: 'prismadmin'
    });
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

---

## Mobile App: Bluetooth Protocol

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
