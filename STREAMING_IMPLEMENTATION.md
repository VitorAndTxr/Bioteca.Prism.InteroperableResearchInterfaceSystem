# sEMG Streaming Implementation Plan

## Overview

Implementation of Bluetooth-connected sEMG streaming with real-time signal visualization for Android mobile devices. This feature enables researchers to configure streaming parameters, connect to the ESP32 NeuroEstimulator device, and visualize biosignal data in real-time.

## Target Platform

**Primary**: Android mobile phone (React Native + Expo)
**Bluetooth**: Serial Port Profile (SPP) via `react-native-bluetooth-classic`

## Implementation Status

**Protocol Layer**: ✅ Complete (All 15 protocol message codes 0-14 implemented in BluetoothContext)
**UI Layer**: ⏳ In Progress (Screens and visualization components to be built)

## Architecture

### Two-Screen Flow

```
StreamConfigScreen               StreamingScreen
┌──────────────────┐            ┌──────────────────┐
│ Configure Stream │            │ Device Connection│
│ - Rate (10-200Hz)│            │ - Paired devices │
│ - Type (r/f/rms) │──────────▶│ - Connect button │
│ - Warnings       │            │                  │
│ [Save & Continue]│            │ Signal Chart     │
└──────────────────┘            │ - Real-time line │
                                │ - Auto-scroll    │
                                │                  │
                                │ Stream Controls  │
                                │ - Start/Stop     │
                                │ - Statistics     │
                                └──────────────────┘
```

### Screen Responsibilities

**StreamConfigScreen**:
- Pre-connection parameter configuration
- Sampling rate selection (10, 30, 50, 100, 200 Hz)
- Data type selection (raw ADC, filtered, RMS)
- Baud rate compatibility warnings
- Saves configuration to BluetoothContext state

**StreamingScreen**:
- Device discovery and connection
- Applies saved configuration to device
- Real-time chart visualization
- Stream control (start/stop/clear)
- Statistics display (packets, samples, duration)

## Protocol Implementation (Existing)

### 1. State Variables in BluetoothContext

```typescript
// Streaming state management
const [isStreaming, setIsStreaming] = useState(false)
const [streamConfig, setStreamConfig] = useState<StreamConfiguration>({
    rate: 100,
    type: 'filtered'
})
const [streamData, setStreamData] = useState<StreamDataPacket[]>([])
const [lastStreamTimestamp, setLastStreamTimestamp] = useState<number>(0)

// Session state
const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null)
const [isSessionActive, setIsSessionActive] = useState(false)
```

### 2. Available Protocol Functions

All 15 protocol message codes (0-14) are implemented:

| Code | Function | Direction | Description |
|------|----------|-----------|-------------|
| 0 | ConnectionHandshake | Bidirectional | Initial connection verification |
| 1 | GyroscopeReading | App → Device | Request wrist angle measurement |
| 2 | StartSession | App → Device | Begin sEMG monitoring + FES session |
| 3 | StopSession | App → Device | End current session |
| 4 | PauseSession | App → Device | Pause session |
| 5 | ResumeSession | App → Device | Resume paused session |
| 6 | SingleStimuli | App → Device | Trigger single FES pulse |
| 7 | FesParam | App → Device | Configure FES parameters |
| 8 | Status | Device → App | Session status update |
| 9 | Trigger | Device → App | sEMG trigger detected |
| 10 | EmergencyStop | Device → App | Emergency stop activated |
| 11 | StartStream | App → Device | Start real-time sEMG streaming |
| 12 | StopStream | App → Device | Stop sEMG streaming |
| 13 | StreamData | Device → App | Real-time data packet |
| 14 | ConfigStream | App → Device | Configure streaming parameters |

### 3. Available Functions from BluetoothContext

#### Streaming Control
- `configureStream(rate: number, type: StreamType)` - Configure sampling rate and data type
- `startStream()` - Start real-time sEMG streaming
- `stopStream()` - Stop streaming
- `clearStreamData()` - Clear stored stream data

#### Session Control (Enhanced)
- `startSession()` - Start FES session
- `stopSession()` - Stop FES session
- `pauseSession()` - Pause session
- `resumeSession()` - Resume paused session

#### Device Control
- `sendFesParams()` - Send FES parameters to device
- `singleStimulation()` - Trigger single FES pulse
- `readGyroscope()` - Request gyroscope reading

### 4. Enhanced Message Decoder

Updated `decodeMessage()` to handle all protocol messages:

```typescript
case NeuraXBluetoothProtocolFunctionEnum.StreamData:
    if (messageBody.bd && messageBody.bd.t !== undefined && messageBody.bd.v) {
        const packet: StreamDataPacket = {
            timestamp: messageBody.bd.t,
            values: messageBody.bd.v as number[]
        };

        // Keep last 1000 packets
        setStreamData(prev => {
            const updated = [...prev, packet];
            return updated.slice(-1000);
        });

        setLastStreamTimestamp(packet.timestamp);
    }
    break;
```

### 5. New TypeScript Types

```typescript
export type StreamType = 'raw' | 'filtered' | 'rms';

export interface StreamConfiguration {
    rate: number;       // Sampling rate in Hz (10-200)
    type: StreamType;   // Data type
}

export interface StreamDataPacket {
    timestamp: number;  // Milliseconds since device boot
    values: number[];   // Array of sEMG samples (5-10 per packet)
}

export interface FESParameters {
    a: number;   // Amplitude
    f: number;   // Frequency
    pw: number;  // Pulse width
    df: number;  // Difficulty
    pd: number;  // Pulse duration
}

export interface SessionStatus {
    parameters: FESParameters;
    status: {
        csa: number;  // Complete stimuli amount
        isa: number;  // Interrupted stimuli amount
        tlt: number;  // Time of last trigger (ms)
        sd: number;   // Session duration (ms)
    };
}
```

## Protocol Coverage

| Code | Function | Status | Description |
|------|----------|--------|-------------|
| 0 | ConnectionHandshake | ✅ | Initial connection verification |
| 1 | GyroscopeReading | ✅ | Request wrist angle measurement |
| 2 | StartSession | ✅ | Begin sEMG monitoring + FES session |
| 3 | StopSession | ✅ | End current session |
| 4 | PauseSession | ✅ | Pause session |
| 5 | ResumeSession | ✅ | Resume paused session |
| 6 | SingleStimuli | ✅ | Trigger single FES pulse |
| 7 | FesParam | ✅ | Configure FES parameters |
| 8 | Status | ✅ | Session status update (received) |
| 9 | Trigger | ✅ | sEMG trigger detected (received) |
| 10 | EmergencyStop | ✅ | Emergency stop activated (received) |
| 11 | StartStream | ✅ NEW | Start real-time sEMG streaming |
| 12 | StopStream | ✅ NEW | Stop sEMG streaming |
| 13 | StreamData | ✅ NEW | Real-time data packet |
| 14 | ConfigStream | ✅ NEW | Configure streaming parameters |

## Example Usage

### Basic Streaming

```typescript
const { configureStream, startStream, stopStream, streamData } = useBluetoothContext();

// Configure for 100Hz filtered data
await configureStream(100, 'filtered');

// Start streaming
await startStream();

// Access real-time data
console.log(`Received ${streamData.length} packets`);
streamData.forEach(packet => {
    console.log(`t=${packet.timestamp}: ${packet.values}`);
});

// Stop streaming
await stopStream();
```

### Complete FES Session

```typescript
const { sendFesParams, startSession, stopSession, sessionStatus } = useBluetoothContext();

// Configure FES parameters
await sendFesParams();

// Start session
await startSession();

// Monitor status
if (sessionStatus) {
    console.log(`Complete stimuli: ${sessionStatus.status.csa}`);
    console.log(`Session duration: ${sessionStatus.status.sd}ms`);
}

// Stop session
await stopSession();
```

## Data Flow

### Streaming Flow

```
1. App configures stream (optional):
   → {"cd":14,"mt":"w","bd":{"rate":100,"type":"filtered"}}
   ← {"cd":14,"mt":"a"}

2. App starts streaming:
   → {"cd":11,"mt":"x"}
   ← {"cd":11,"mt":"a"}

3. Device sends data packets:
   ← {"cd":13,"mt":"w","bd":{"t":12345,"v":[23.4,25.1,22.8,...]}}
   ← {"cd":13,"mt":"w","bd":{"t":12445,"v":[24.1,26.3,23.5,...]}}
   (continuous stream...)

4. App stops streaming:
   → {"cd":12,"mt":"x"}
   ← {"cd":12,"mt":"a"}
```

## Key Implementation Details

### Stream Data Management

- **Buffer Size**: Stores last 1000 packets in memory
- **Automatic Cleanup**: Older packets are dropped when buffer is full
- **Timestamp Tracking**: `lastStreamTimestamp` tracks most recent packet
- **Manual Reset**: `clearStreamData()` allows UI to reset visualization

### Session State Tracking

- **`isSessionActive`**: Automatically set when starting/stopping sessions
- **`sessionStatus`**: Updated when device sends status messages (code 8)
- **Emergency Stop Handling**: Automatically stops both session and streaming

### Error Handling

All Bluetooth operations include try-catch blocks with console logging:

```typescript
try {
    await writeToBluetooth(JSON.stringify(payload));
    console.log("Operation successful");
} catch (error) {
    console.error("Error:", error);
}
```

### Message Decoding Safety

The `decodeMessage()` function includes:
- Top-level try-catch for JSON parsing errors
- Null/undefined checks before accessing nested properties
- Console logging for debugging
- Raw message logging on errors

## Testing Recommendations

### Manual Testing Checklist

1. **Connection**
   - ✅ Pair device via Android Bluetooth settings
   - ✅ Connect from app
   - ✅ Verify connection status

2. **Streaming**
   - ✅ Configure stream (different rates: 10Hz, 50Hz, 100Hz)
   - ✅ Test different types: raw, filtered, rms
   - ✅ Start/stop streaming
   - ✅ Verify data packet reception
   - ✅ Check timestamp continuity

3. **FES Session**
   - ✅ Configure parameters
   - ✅ Start/pause/resume/stop session
   - ✅ Verify status updates
   - ✅ Test trigger detection
   - ✅ Test emergency stop

4. **Edge Cases**
   - ✅ Disconnect during streaming
   - ✅ Start streaming during active session (should fail - mutual exclusion)
   - ✅ Rapid start/stop commands
   - ✅ Invalid message formats

### Console Monitoring

Watch for these log messages:
- `"Stream Data Received"` - Indicates packet reception
- `"Timestamp: Xms, Samples: Y"` - Data packet details
- `"Stream configured: 100Hz, type: filtered"` - Configuration confirmed
- `"Stream Start/Stop Acknowledged"` - Device ACKs

## Component Structure (To Be Built)

```
src/
├── screens/
│   ├── StreamConfigScreen.tsx
│   │   └── Configuration form with validation
│   └── StreamingScreen.tsx
│       ├── DeviceConnectionSection
│       ├── SignalChartSection
│       └── StreamControlSection
├── components/
│   ├── StreamConfigCard.tsx
│   │   ├── RatePicker (Picker component)
│   │   ├── TypeSelector (Radio buttons)
│   │   └── BaudRateWarning (Alert)
│   ├── DeviceListCard.tsx
│   │   └── FlatList of paired devices
│   ├── SignalChart.tsx
│   │   └── LineChart (react-native-chart-kit)
│   └── StreamStatsCard.tsx
│       └── Packets, samples, duration, Hz
├── hooks/
│   └── useStreamData.ts
│       ├── Flatten packets to samples
│       ├── Apply sliding window
│       └── Transform to chart format
└── types/
    └── streaming.ts (Already exist in BluetoothContext)
```

## Technical Specifications

### Data Flow

```
ESP32 Device
    ↓ Bluetooth SPP (JSON packets)
BluetoothContext.streamData[]
    ↓ Packet flattening
Sliding window (last 500-1000 samples)
    ↓ Transform to {x, y}
LineChart component (10 FPS update)
```

### Chart Configuration

**Display Settings**:
- **Time window**: 5-10 seconds of data
- **Update rate**: 100ms intervals (10 FPS)
- **Y-axis**: Auto-scale per data type
  - Raw: 0-4095 (12-bit ADC)
  - Filtered: Dynamic (-500 to +500 typical)
  - RMS: 0-200 typical
- **X-axis**: Time in seconds (relative)
- **Line color**: Medical blue (#2196F3)
- **Grid**: Horizontal lines for amplitude reference

**Performance Optimization**:
- Use `useMemo()` for data transformation
- Sliding window to limit memory usage
- Throttle chart updates to prevent jank
- Maximum 1000 samples in chart buffer

### Streaming Configuration Presets

| Preset | Rate | Type | Use Case | Baud Requirement |
|--------|------|------|----------|------------------|
| Low | 10 Hz | RMS | Low-bandwidth overview | 9600 (default) |
| Standard | 30 Hz | Filtered | Typical clinical use | 9600 (default) |
| High | 100 Hz | Filtered | Research analysis | 115200 |
| Maximum | 200 Hz | Raw | Full-bandwidth capture | 115200 |

## Implementation Tasks

1. ✅ Design screen layout and component structure
2. ⏳ Create StreamConfigScreen for streaming parameter configuration
3. ⏳ Add sampling rate picker UI (10-200 Hz with presets)
4. ⏳ Add data type selector UI (raw/filtered/rms with descriptions)
5. ⏳ Implement configuration validation and warnings (baud rate limits)
6. ⏳ Add save configuration button with BluetoothContext integration
7. ⏳ Create StreamingScreen component with Bluetooth connection UI
8. ⏳ Implement device selection and connection logic
9. ⏳ Install and configure react-native-chart-kit for signal visualization
10. ⏳ Implement real-time line chart component for sEMG data
11. ⏳ Add data windowing logic for chart performance (show last N samples)
12. ⏳ Implement stream control buttons (start/stop/clear)
13. ⏳ Add streaming status indicators and statistics display
14. ⏳ Update navigation to include StreamConfigScreen and StreamingScreen
15. ⏳ Test complete workflow: configure → connect → stream → visualize

## User Workflow

```
1. Researcher opens app
   ↓
2. Navigate to "sEMG Streaming"
   ↓
3. StreamConfigScreen appears
   - Select sampling rate (e.g., 100 Hz)
   - Select data type (e.g., "Filtered")
   - View warning if baud upgrade needed
   - Tap "Save & Continue"
   ↓
4. StreamingScreen appears
   - List shows paired "NeuroEstimulator" devices
   - Tap device → Connects via Bluetooth
   - Configuration sent to device (Code 14)
   ↓
5. Tap "Start Streaming"
   - Device begins sending Code 13 packets
   - Chart updates in real-time
   - Statistics display packets/sec
   ↓
6. Monitor signal for 1-10 minutes
   - Chart auto-scrolls
   - View amplitude fluctuations
   ↓
7. Tap "Stop Streaming"
   - Chart freezes
   - Can tap "Clear" to reset
   - Or tap "Start" to resume
   ↓
8. Disconnect or reconfigure
```

## Dependencies Required

```json
{
  "dependencies": {
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "^15.0.0"
  }
}
```

## Testing Strategy

### Manual Testing Checklist

**Configuration Screen**:
- [ ] Rate picker displays all values (10, 30, 50, 100, 200 Hz)
- [ ] Type selector shows descriptions for each type
- [ ] Warning appears when rate > 30 Hz without baud upgrade
- [ ] Save button stores config in BluetoothContext

**Connection Flow**:
- [ ] Paired devices appear in list
- [ ] "No devices found" message if empty
- [ ] Connect button triggers `connectBluetooth()`
- [ ] Connection status indicator turns green
- [ ] Configuration (Code 14) sent automatically after connect

**Streaming Flow**:
- [ ] "Start Streaming" sends Code 11
- [ ] Chart begins updating with Code 13 data
- [ ] Chart scrolls horizontally (time-series)
- [ ] Y-axis scales appropriately
- [ ] Statistics update (packets, samples)
- [ ] "Stop Streaming" sends Code 12
- [ ] "Clear Data" resets chart

**Performance**:
- [ ] 10 Hz streaming: Smooth, no lag
- [ ] 100 Hz streaming: Chart updates consistently
- [ ] 5 minutes continuous streaming: No memory leak
- [ ] 200 Hz streaming: Max performance test

**Error Handling**:
- [ ] Device disconnect during streaming: Show error modal
- [ ] Bluetooth turned off: Graceful handling
- [ ] Invalid packet received: Logged, not crash

## File Modifications

- **`src/context/BluetoothContext.tsx`**: Complete protocol implementation (all 15 codes)
- **`CLAUDE.md`**: Updated documentation with streaming examples
- **`STREAMING_IMPLEMENTATION.md`**: This summary document

## Compatibility

- ✅ ESP32 firmware protocol (codes 0-14)
- ✅ TypeScript strict mode
- ✅ React Native 0.81.4
- ✅ Expo ~54.0.12
- ✅ All type checks pass

## References

- ESP32 Device Protocol: `../InteroperableResearchsEMGDevice/CLAUDE.md`
- Backend API: `../InteroperableResearchNode/CLAUDE.md`
- PRISM Overview: `../CLAUDE.md`
