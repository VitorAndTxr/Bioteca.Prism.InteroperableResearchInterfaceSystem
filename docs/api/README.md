# API Reference Documentation

This section contains technical API documentation including Bluetooth protocol specification, context API reference, and hooks documentation.

## Contents

### Bluetooth Protocol

- **[BLUETOOTH_COMMANDS.md](BLUETOOTH_COMMANDS.md)** - Complete reference for all 15 Bluetooth message codes and protocol specification

- **[BLUETOOTH_PROTOCOL_DETAILS.md](BLUETOOTH_PROTOCOL_DETAILS.md)** - Deep dive into protocol implementation with examples and edge cases

### Context & State Management

- **[CONTEXT_API.md](CONTEXT_API.md)** - BluetoothContext API reference with state properties, hooks, and functions

- **[HOOKS_REFERENCE.md](HOOKS_REFERENCE.md)** - Complete reference for custom React hooks with usage examples

### Type Definitions

- **[TYPE_DEFINITIONS.md](TYPE_DEFINITIONS.md)** - TypeScript interface and type definitions with detailed specifications

---

## Quick Reference

### Bluetooth Protocol Structure

```json
{
  "cd": <number>,     // Message code (0-14)
  "mt": "<string>",   // Method: 'r', 'w', 'x', 'a'
  "bd": <object>      // Optional body with data
}
```

**Message Methods:**
- `r` - READ: Request data without action
- `w` - WRITE: Send data or notify event
- `x` - EXECUTE: Trigger action/command
- `a` - ACKNOWLEDGE: Confirm message receipt

### All 15 Message Codes

| Code | Name | Direction | Purpose |
|------|------|-----------|---------|
| 0 | ConnectionHandshake | ↔ | Initial connection verification |
| 1 | GyroscopeReading | ↔ | IMU 6-axis wrist angle measurement |
| 2 | StartSession | → | Begin sEMG monitoring + FES session |
| 3 | StopSession | → | End active FES session |
| 4 | PauseSession | → | Pause session (can resume) |
| 5 | ResumeSession | → | Resume paused session |
| 6 | SingleStimuli | → | Trigger single FES pulse |
| 7 | FesParam | → | Configure FES parameters |
| 8 | Status | ← | Session status + metrics |
| 9 | Trigger | ← | sEMG trigger detected |
| 10 | EmergencyStop | ← | Emergency stop activated |
| 11 | StartStream | → | Start real-time sEMG streaming |
| 12 | StopStream | → | Stop sEMG data streaming |
| 13 | StreamData | ← | Real-time sEMG data packets |
| 14 | ConfigStream | → | Configure streaming parameters |

See [BLUETOOTH_COMMANDS.md](BLUETOOTH_COMMANDS.md) for complete specifications.

### BluetoothContext API

```typescript
// State properties
bluetoothOn: boolean
neuraDevices: BluetoothDevice[]
selectedDevice: BluetoothDevice | null
fesParams: FESParameters
streamConfig: StreamConfiguration
streamData: StreamDataPacket[]
isStreaming: boolean
isSessionActive: boolean
sessionStatus: SessionStatus | null

// Connection functions
connectBluetooth(address: string): Promise<void>
disconnect(address: string): Promise<void>

// FES Session control
startSession(): Promise<void>
stopSession(): Promise<void>
pauseSession(): Promise<void>
resumeSession(): Promise<void>

// FES Parameter control
sendFesParams(difficulty?: number): Promise<void>
singleStimulation(difficulty?: number): Promise<void>

// Streaming control
configureStream(rate: number, type: StreamType): Promise<void>
startStream(): Promise<void>
stopStream(): Promise<void>
clearStreamData(): void

// Device info
readGyroscope(): Promise<void>
measureWristAmplitude(): Promise<void>
```

See [CONTEXT_API.md](CONTEXT_API.md) for detailed reference.

### Using BluetoothContext in Components

```typescript
import { useBluetoothContext } from '@/context/BluetoothContext';

function MyComponent() {
    const {
        selectedDevice,
        connectBluetooth,
        startStream,
        streamData,
        // ... other properties
    } = useBluetoothContext();

    // Use context properties and functions
}
```

See [HOOKS_REFERENCE.md](HOOKS_REFERENCE.md) for examples.

---

## Common Patterns

### Connecting to a Device

```typescript
const { neuraDevices, connectBluetooth } = useBluetoothContext();

const handleConnect = async (device: BluetoothDevice) => {
    try {
        await connectBluetooth(device.address);
        console.log('Connected to', device.name);
    } catch (error) {
        console.error('Connection failed:', error);
    }
};
```

### Starting Streaming

```typescript
const {
    configureStream,
    startStream,
    streamData
} = useBluetoothContext();

const handleStartStreaming = async () => {
    await configureStream(100, 'filtered');  // 100Hz, filtered data
    await startStream();
    console.log(`Streaming started, ${streamData.length} packets`);
};
```

### Running a FES Session

```typescript
const {
    fesParams,
    setFesParams,
    startSession,
    stopSession,
    sessionStatus
} = useBluetoothContext();

const handleSession = async () => {
    // Configure FES parameters
    setFesParams({
        a: 7.5,      // 7.5V amplitude
        f: 60,       // 60 Hz frequency
        pw: 300,     // 300ms pulse width
        df: 50,      // 50% difficulty
        pd: 5        // 5 second duration
    });

    // Start session
    await startSession();

    // Monitor status
    if (sessionStatus) {
        console.log(`Complete stimuli: ${sessionStatus.status.csa}`);
    }

    // Stop session
    await stopSession();
};
```

---

## Type Definitions

### FES Parameters

```typescript
interface FESParameters {
    a: number;   // Amplitude (0-15V)
    f: number;   // Frequency (1-100 Hz)
    pw: number;  // Pulse width (1-100 ms)
    df: number;  // Difficulty (1-100%)
    pd: number;  // Duration (1-60 seconds)
}
```

### Stream Configuration

```typescript
interface StreamConfiguration {
    rate: number;       // Sampling rate in Hz (10-200)
    type: StreamType;   // 'raw' | 'filtered' | 'rms'
}

type StreamType = 'raw' | 'filtered' | 'rms';
```

### Stream Data Packet

```typescript
interface StreamDataPacket {
    timestamp: number;  // ms since device boot
    values: number[];   // sEMG samples (5-10 per packet)
}
```

See [TYPE_DEFINITIONS.md](TYPE_DEFINITIONS.md) for all types.

---

## Protocol Examples

### Example 1: Configure FES Parameters

```json
// Request
{
    "cd": 7,
    "mt": "w",
    "bd": {
        "a": 7.5,
        "f": 60,
        "pw": 300,
        "df": 50,
        "pd": 5
    }
}

// Response (acknowledgment)
{
    "cd": 7,
    "mt": "a"
}
```

### Example 2: Start Streaming

```json
// Request
{
    "cd": 11,
    "mt": "x"
}

// Response (acknowledgment)
{
    "cd": 11,
    "mt": "a"
}

// Device sends data packets
{
    "cd": 13,
    "mt": "w",
    "bd": {
        "t": 12345,
        "v": [23.4, 25.1, 22.8, 24.5, 26.2]
    }
}
```

### Example 3: Session Status

```json
// Device sends status update
{
    "cd": 8,
    "mt": "w",
    "bd": {
        "parameters": {
            "a": 7.5,
            "f": 60,
            "pw": 300,
            "df": 50,
            "pd": 5
        },
        "status": {
            "csa": 45,              // Complete stimuli count
            "isa": 3,               // Interrupted stimuli count
            "tlt": 156000,          // Time of last trigger (ms)
            "sd": 300000            // Session duration (ms)
        }
    }
}
```

---

## Error Handling

All Bluetooth operations use try-catch:

```typescript
async function safeBleOperation() {
    try {
        await connectBluetooth(deviceAddress);
    } catch (error) {
        if (error instanceof BluetoothError) {
            console.error('Bluetooth error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}
```

---

## Performance Considerations

### Streaming Bandwidth

- **9600 baud**: Supports up to 30 Hz streaming rate
- **115200 baud**: Supports up to 200 Hz streaming rate
- Each packet: ~100 bytes with 5-10 samples

### State Updates

- Stream data stored in memory (max 1000 packets)
- Session status updated on Code 8 messages
- Trigger events cleared after 5 seconds

### Chart Rendering

- Updates at 10 FPS for smooth visualization
- Sliding window of last 500-1000 samples
- Use `useMemo()` for data transformation

---

## References

- **Device Firmware**: [../../InteroperableResearchsEMGDevice/CLAUDE.md](../../InteroperableResearchsEMGDevice/CLAUDE.md)
- **Architecture**: [../architecture/](../architecture/)
- **Development**: [../development/](../development/)
- **Troubleshooting**: [../troubleshooting/](../troubleshooting/)

---

**API Reference Documentation**
Last Updated: 2025-10-17
