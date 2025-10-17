# Architecture & Design Documentation

This section contains comprehensive documentation on IRIS system design, component architecture, and technical specifications.

## Contents

### Overview

- **[ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)** - High-level system design with component relationships and data flow diagrams

### Core Components

- **[COMPONENT_STRUCTURE.md](COMPONENT_STRUCTURE.md)** - React component hierarchy, file organization, and component responsibilities

- **[STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)** - React Context patterns, BluetoothContext state, and state update flows

- **[BLUETOOTH_PROTOCOL.md](BLUETOOTH_PROTOCOL.md)** - Complete Bluetooth communication protocol specification with all 15 message codes

### Design Patterns

- **[DESIGN_PATTERNS.md](DESIGN_PATTERNS.md)** - Reusable architectural patterns used throughout IRIS

---

## Quick Reference

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│        React Native UI Components                   │
│  (HomeScreen, StreamingScreen, StreamConfigScreen)  │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│      BluetoothContext (Global State)                │
│  - Device management                                │
│  - Protocol implementation                          │
│  - Session state tracking                           │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│   react-native-bluetooth-classic Module             │
│   (SPP communication layer)                         │
└─────────────┬───────────────────────────────────────┘
              │
┌─────────────▼───────────────────────────────────────┐
│        ESP32 NeuroEstimulator Device                │
│  (Bluetooth Serial Port Profile)                    │
└─────────────────────────────────────────────────────┘
```

### Core Concepts

| Concept | Purpose | File |
|---------|---------|------|
| **BluetoothContext** | Global state management and protocol | [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) |
| **Bluetooth Protocol** | Device communication specification | [BLUETOOTH_PROTOCOL.md](BLUETOOTH_PROTOCOL.md) |
| **Component Structure** | React components and hierarchy | [COMPONENT_STRUCTURE.md](COMPONENT_STRUCTURE.md) |
| **Data Flow** | How data moves through the app | [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) |

---

## Key Design Principles

### 1. Separation of Concerns
- **UI Layer**: React components for rendering and user interaction
- **State Layer**: BluetoothContext for global state and business logic
- **Communication Layer**: react-native-bluetooth-classic for device communication
- **Device Layer**: ESP32 firmware implementing protocol

### 2. Reactive State Management
- Single source of truth in BluetoothContext
- Components subscribe to state changes via hooks
- State updates trigger automatic UI re-renders

### 3. Protocol-First Design
- Bluetooth communication based on strict JSON protocol
- All messages follow standard structure (code, method, body)
- Clear request/response patterns with acknowledgments

### 4. Real-Time Data Handling
- Circular buffer for streaming data (max 1000 packets)
- Efficient state updates to prevent jank
- Auto-scrolling charts for continuous visualization

---

## Documentation Index by Topic

### Getting Started
- Start with [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md) for system design
- Then review [COMPONENT_STRUCTURE.md](COMPONENT_STRUCTURE.md) for component organization

### Understanding Protocol
- Read [BLUETOOTH_PROTOCOL.md](BLUETOOTH_PROTOCOL.md) for complete specification
- See [../api/BLUETOOTH_COMMANDS.md](../api/BLUETOOTH_COMMANDS.md) for quick reference

### Implementing Features
- Check [DESIGN_PATTERNS.md](DESIGN_PATTERNS.md) for architectural patterns
- See [../development/CODE_PATTERNS.md](../development/CODE_PATTERNS.md) for code patterns

### State Management
- Study [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for context patterns
- Review [../api/CONTEXT_API.md](../api/CONTEXT_API.md) for API reference

---

## References

- **Main Documentation Hub**: [../README.md](../README.md)
- **Development Guides**: [../development/](../development/)
- **API Reference**: [../api/](../api/)
- **Device Protocol**: [../../InteroperableResearchsEMGDevice/CLAUDE.md](../../InteroperableResearchsEMGDevice/CLAUDE.md)

---

**Architecture Documentation**
Last Updated: 2025-10-17
