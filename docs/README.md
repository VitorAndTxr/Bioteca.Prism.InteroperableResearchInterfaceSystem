# IRIS Documentation

**Interoperable Research Interface System** - React Native application for PRISM sEMG/FES device control and biosignal visualization.

## Documentation Structure

### Setup Guides

Essential setup and configuration instructions for getting started:

- **[Bluetooth Setup](setup/BLUETOOTH_SETUP.md)** - Complete guide to integrating `react-native-bluetooth-classic` with Expo

### Implementation Guides

Detailed implementation documentation for core features:

- **[Implementation Summary](implementation/IMPLEMENTATION_SUMMARY.md)** - Overview of all implemented features and architecture
- **[Streaming Implementation](implementation/STREAMING_IMPLEMENTATION.md)** - Complete guide to real-time sEMG data streaming (codes 11-14)

### Troubleshooting

Common issues and their solutions:

- **[Bluetooth Connection Fix](troubleshooting/BLUETOOTH_CONNECTION_FIX.md)** - Resolving "undefined is not an object" errors in BluetoothContext
- **[Permission Fix Summary](troubleshooting/PERMISSION_FIX_SUMMARY.md)** - Android Bluetooth permission configuration
- **[Windows Long Path Fix](troubleshooting/WINDOWS_LONG_PATH_FIX.md)** - Enabling long path support on Windows for `node_modules`

## Quick Navigation

**For AI Assistants (Claude Code):**
- Primary guidance: [../CLAUDE.md](../CLAUDE.md)
- Device protocol reference: `../../InteroperableResearchsEMGDevice/CLAUDE.md`
- Backend reference: `../../InteroperableResearchNode/CLAUDE.md`

**For Developers:**
- Main README: [../README.md](../README.md)
- Architecture overview: [implementation/IMPLEMENTATION_SUMMARY.md](implementation/IMPLEMENTATION_SUMMARY.md)
- Quick start: [setup/BLUETOOTH_SETUP.md](setup/BLUETOOTH_SETUP.md)

## Key Topics

### Bluetooth Protocol

The application communicates with the ESP32 device using a JSON-based protocol:

```json
{
  "cd": <code>,      // Message code (0-14)
  "mt": "<method>",  // Method: 'r', 'w', 'x', 'a'
  "bd": {...}        // Optional body with data
}
```

See [CLAUDE.md](../CLAUDE.md) for complete protocol specification.

### Real-Time Streaming

Implemented streaming features:
- Configurable sampling rates (10-200 Hz)
- Multiple data types (raw, filtered, RMS)
- Live chart visualization with React Native SVG
- Automatic buffer management (1000 samples max)

See [implementation/STREAMING_IMPLEMENTATION.md](implementation/STREAMING_IMPLEMENTATION.md) for details.

### Architecture

Core components:
- **BluetoothContext** - Global state management and protocol implementation
- **StreamingScreen** - Real-time visualization with live charts
- **StreamConfigScreen** - Streaming parameter configuration
- **useStreamData** - Custom hook for data processing and chart formatting

See [implementation/IMPLEMENTATION_SUMMARY.md](implementation/IMPLEMENTATION_SUMMARY.md) for architecture details.

## Contributing

When adding new documentation:
1. Place in appropriate folder (`setup/`, `implementation/`, `troubleshooting/`)
2. Update this README with links
3. Follow existing markdown format
4. Include code examples where relevant
