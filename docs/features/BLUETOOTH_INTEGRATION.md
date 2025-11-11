# Bluetooth Integration Guide

This document provides comprehensive guidance for integrating with the ESP32 sEMG/FES device via Bluetooth Serial Port Profile (SPP).

**Audience**: Mobile app developers working with device communication
**Platform**: React Native (Android primary)
**Protocol**: JSON-based Bluetooth SPP

---

## Table of Contents

- [Overview](#overview)
- [Protocol Specification](#protocol-specification)
- [BluetoothContext API](#bluetoothcontext-api)
- [Development Patterns](#development-patterns)
- [Communication Flows](#communication-flows)
- [Code Examples](#code-examples)
- [Platform-Specific Notes](#platform-specific-notes)
- [Implementation Details](#implementation-details)

---

## Overview

The IRIS mobile application communicates with the ESP32 sEMG/FES device using a JSON-based protocol over Bluetooth Serial Port Profile (SPP). The protocol defines 14 message codes for device control, FES parameter configuration, session management, and real-time biosignal streaming.

### Key Features

- **14 Message Codes**: Handshake, FES control, session management, streaming
- **Null-Terminated JSON**: All messages end with `\0` character
- **Bidirectional Communication**: App ↔ Device message exchange
- **Real-time Streaming**: Up to 200 Hz sEMG data streaming
- **State Management**: BluetoothContext provides global state

### Architecture

```
┌────────────────────────────────────┐
│     React Native App (IRIS)        │
│  ┌──────────────────────────────┐  │
│  │    BluetoothContext          │  │
│  │  - Connection management     │  │
│  │  - Message encoding/decoding │  │
│  │  - State management          │  │
│  └──────────┬───────────────────┘  │
│             │ JSON messages        │
│  ┌──────────▼───────────────────┐  │
│  │  react-native-bluetooth-     │  │
│  │  classic (SPP)               │  │
│  └──────────┬───────────────────┘  │
└─────────────┼──────────────────────┘
              │ Bluetooth SPP
┌─────────────▼──────────────────────┐
│     ESP32 sEMG/FES Device          │
│  - Biosignal acquisition (sEMG)    │
│  - Therapeutic stimulation (FES)   │
│  - Real-time data streaming        │
└────────────────────────────────────┘
```

---

## Protocol Specification

### Message Structure

All messages follow this JSON structure:

```typescript
{
  cd: number,      // Message code (0-14)
  mt: string,      // Method: 'r', 'w', 'x', 'a'
  bd?: object      // Optional body with parameters
}
```

**Fields**:
- `cd` (code) - Message code from `NeuraXBluetoothProtocolFunctionEnum`
- `mt` (method) - Method from `NeuraXBluetoothProtocolMethodEnum`
- `bd` (body) - Optional parameters for the message

### Protocol Enumerations

**Location**: `apps/mobile/src/context/BluetoothContext.tsx`

#### NeuraXBluetoothProtocolFunctionEnum

```typescript
enum NeuraXBluetoothProtocolFunctionEnum {
    ConnectionHandshake = 0,
    GyroscopeReading = 1,
    StartSession = 2,
    StopSession = 3,
    PauseSession = 4,
    ResumeSession = 5,
    SingleStimuli = 6,
    FesParam = 7,
    Status = 8,
    Trigger = 9,
    EmergencyStop = 10,
    StartStream = 11,
    StopStream = 12,
    StreamData = 13,
    ConfigStream = 14
}
```

#### NeuraXBluetoothProtocolMethodEnum

```typescript
enum NeuraXBluetoothProtocolMethodEnum {
    READ = 'r',      // Request data from device
    WRITE = 'w',     // Send data to device
    EXECUTE = 'x',   // Execute command
    ACK = 'a'        // Acknowledgment from device
}
```

#### NeuraXBluetoothProtocolBodyPropertyEnum

```typescript
enum NeuraXBluetoothProtocolBodyPropertyEnum {
    AMPLITUDE = 'a',           // FES amplitude (0-15V)
    FREQUENCY = 'f',           // FES frequency (1-100 Hz)
    PULSE_WIDTH = 'pw',        // FES pulse width (1-100 ms)
    DIFFICULTY = 'df',         // sEMG difficulty threshold (1-100%)
    PULSE_DURATION = 'pd',     // FES pulse duration (1-60 seconds)
    TIMESTAMP = 't',           // Timestamp (milliseconds)
    VALUES = 'v',              // sEMG sample values array
    RATE = 'rate',             // Streaming rate (10-200 Hz)
    TYPE = 'type'              // Streaming type ('raw', 'filtered', 'rms')
}
```

### Message Encoding

All Bluetooth messages are null-terminated UTF-8 JSON strings:

```typescript
const message = JSON.stringify(payload) + '\0';
await RNBluetoothClassic.writeToDevice(deviceAddress, message);
```

---

## BluetoothContext API

The `BluetoothContext` provides global state and methods for Bluetooth communication.

**Location**: `apps/mobile/src/context/BluetoothContext.tsx`

### Core State

```typescript
interface BluetoothContextState {
    // Connection state
    bluetoothOn: boolean;
    neuraDevices: NeuraDevice[];
    selectedDevice: NeuraDevice | null;

    // FES parameters
    fesParams: FESParams;

    // Session status
    sessionStatus: SessionStatus | null;
    isSessionActive: boolean;

    // Events
    triggerDetected: boolean;      // Auto-clears after 5s
    emergencyStop: boolean;        // Auto-clears after 5s

    // Streaming
    isStreaming: boolean;
    streamConfig: StreamConfig;
    streamData: StreamDataPacket[];
}
```

### Connection Management

#### `connectBluetooth(address: string): Promise<void>`

Establishes Bluetooth connection to device.

**Parameters**:
- `address` - Bluetooth MAC address

**Example**:
```typescript
import { useBluetoothContext } from '@/context/BluetoothContext';

function DeviceList() {
    const { neuraDevices, connectBluetooth } = useBluetoothContext();

    const handleConnect = async (device: NeuraDevice) => {
        try {
            await connectBluetooth(device.address);
            console.log('Connected to device');
        } catch (error) {
            console.error('Connection failed:', error);
        }
    };

    return (
        <View>
            {neuraDevices.map(device => (
                <TouchableOpacity key={device.address} onPress={() => handleConnect(device)}>
                    <Text>{device.name} - {device.address}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}
```

#### `disconnect(address: string): void`

Disconnects from device and cleans up subscriptions.

**Parameters**:
- `address` - Bluetooth MAC address

**Example**:
```typescript
const { selectedDevice, disconnect } = useBluetoothContext();

const handleDisconnect = () => {
    if (selectedDevice) {
        disconnect(selectedDevice.address);
    }
};
```

### FES Control

#### `sendFesParams(difficulty?: number): Promise<void>`

Sends FES parameters to device (message code 7).

**Parameters**:
- `difficulty` (optional) - Override difficulty setting

**Example**:
```typescript
const { fesParams, setFesParams, sendFesParams } = useBluetoothContext();

// Configure parameters
setFesParams({
    amplitude: 7,        // 7V
    frequency: 60,       // 60 Hz
    pulseWidth: 300,     // 300 µs
    difficulty: 5,       // 5% sEMG threshold
    pulseDuration: 2     // 2 seconds
});

// Send to device
await sendFesParams();
```

#### `singleStimulation(difficulty?: number): Promise<void>`

Configures FES parameters and triggers single FES pulse.

**Parameters**:
- `difficulty` (optional) - Override difficulty setting

**Example**:
```typescript
const { singleStimulation } = useBluetoothContext();

// Trigger single FES pulse with current parameters
await singleStimulation();

// Or override difficulty
await singleStimulation(8);
```

### Session Control

#### `startSession(): Promise<void>`

Starts sEMG monitoring + FES session (message code 2).

**Example**:
```typescript
const { sendFesParams, startSession } = useBluetoothContext();

// 1. Configure FES parameters
await sendFesParams();

// 2. Start session
await startSession();
console.log('Session started');
```

#### `stopSession(): Promise<void>`

Ends current session (message code 3).

**Example**:
```typescript
const { stopSession } = useBluetoothContext();

await stopSession();
console.log('Session stopped');
```

#### `pauseSession(): Promise<void>`

Pauses session (can resume) (message code 4).

**Example**:
```typescript
const { pauseSession } = useBluetoothContext();

await pauseSession();
console.log('Session paused');
```

#### `resumeSession(): Promise<void>`

Resumes paused session (message code 5).

**Example**:
```typescript
const { resumeSession } = useBluetoothContext();

await resumeSession();
console.log('Session resumed');
```

### sEMG Streaming

#### `configureStream(rate: number, type: StreamType): Promise<void>`

Configures streaming parameters (message code 14).

**Parameters**:
- `rate` - Sampling rate in Hz (10-200)
- `type` - Data type: `'raw'`, `'filtered'`, or `'rms'`

**Example**:
```typescript
const { configureStream } = useBluetoothContext();

// Configure for 100Hz filtered data
await configureStream(100, 'filtered');
```

#### `startStream(): Promise<void>`

Starts real-time sEMG data streaming (message code 11).

**Example**:
```typescript
const { startStream } = useBluetoothContext();

await startStream();
console.log('Streaming started');
```

#### `stopStream(): Promise<void>`

Stops sEMG data streaming (message code 12).

**Example**:
```typescript
const { stopStream } = useBluetoothContext();

await stopStream();
console.log('Streaming stopped');
```

#### `clearStreamData(): void`

Clears all buffered stream data.

**Example**:
```typescript
const { clearStreamData } = useBluetoothContext();

clearStreamData();
console.log('Stream data cleared');
```

---

## Development Patterns

### Adding New Bluetooth Commands

#### Step 1: Add Enum Value

```typescript
// apps/mobile/src/context/BluetoothContext.tsx

enum NeuraXBluetoothProtocolFunctionEnum {
    // ... existing codes
    NewCommand = 15  // Add new code
}
```

#### Step 2: Create Payload Function

```typescript
async function newCommand() {
    let payload: NeuraXBluetoothProtocolPayload = {
        cd: NeuraXBluetoothProtocolFunctionEnum.NewCommand,
        mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
    };
    await writeToBluetooth(JSON.stringify(payload));
}
```

#### Step 3: Add Response Handler

```typescript
function decodeMessage(message: string) {
    const data = JSON.parse(message);

    switch (data.cd) {
        // ... existing cases

        case NeuraXBluetoothProtocolFunctionEnum.NewCommand:
            if (data.mt === NeuraXBluetoothProtocolMethodEnum.ACK) {
                console.log('New command acknowledged');
            }
            break;
    }
}
```

#### Step 4: Expose Through Context

```typescript
<BluetoothContext.Provider value={{
    // ... existing values
    newCommand
}}>
    {children}
</BluetoothContext.Provider>
```

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

    return <View>{/* Your UI */}</View>;
}
```

---

## Communication Flows

### Connection Flow

```
1. Discovery
   ├─ updatePairedDevices() scans for "NeuroEstimulator" devices
   └─ Returns list of bonded devices

2. Connection
   ├─ connectBluetooth(address) establishes SPP connection
   ├─ Subscribes to data receive events
   └─ Subscribes to disconnect events

3. Keep-Alive
   ├─ verifyCurrentConnection() checks every 10s
   └─ Updates connection status

4. Disconnection
   ├─ disconnect() removes subscriptions
   ├─ Clears selected device
   └─ Shows connection error modal
```

### FES Session Flow

```
1. Configure parameters:
   App → {"cd":7,"mt":"w","bd":{"a":7,"f":60,"pw":300,"df":5,"pd":2}}
   Device → {"cd":7,"mt":"a"}  // ACK

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

**Example implementation**:

```typescript
const {
    fesParams,
    setFesParams,
    sendFesParams,
    startSession,
    stopSession,
    sessionStatus,
    triggerDetected
} = useBluetoothContext();

// Configure FES
setFesParams({
    amplitude: 7,
    frequency: 60,
    pulseWidth: 300,
    difficulty: 5,
    pulseDuration: 2
});

// Send configuration
await sendFesParams();

// Start session
await startSession();

// Monitor session
useEffect(() => {
    if (triggerDetected) {
        console.log('sEMG trigger detected!');
    }
}, [triggerDetected]);

useEffect(() => {
    if (sessionStatus) {
        console.log('Session duration:', sessionStatus.sessionDuration);
        console.log('Complete stimuli:', sessionStatus.completeStimuli);
    }
}, [sessionStatus]);

// Stop session
await stopSession();
```

### sEMG Streaming Flow

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

**Important constraints**:
- Cannot run FES session and streaming simultaneously (shared timer)
- Streaming auto-stops after 10 minutes or on disconnect
- Buffer holds 200 samples; overflow drops oldest data

---

## Code Examples

### Complete Streaming Workflow

```typescript
import { useBluetoothContext, StreamType } from '@/context/BluetoothContext';
import { useEffect } from 'react';

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
        try {
            // Step 1: Configure streaming (optional - device has defaults)
            await configureStream(100, 'filtered');

            // Step 2: Start streaming
            await startStream();
        } catch (error) {
            console.error('Failed to start streaming:', error);
        }
    };

    const handleStop = async () => {
        try {
            await stopStream();
            // Optionally clear data
            clearStreamData();
        } catch (error) {
            console.error('Failed to stop streaming:', error);
        }
    };

    // Monitor stream data
    useEffect(() => {
        if (streamData.length > 0) {
            const latestPacket = streamData[streamData.length - 1];
            console.log('Latest packet:', latestPacket.timestamp, latestPacket.values);
        }
    }, [streamData]);

    // Render real-time data
    return (
        <View>
            <Text>Streaming: {isStreaming ? 'Active' : 'Inactive'}</Text>
            <Text>Config: {streamConfig.rate}Hz, {streamConfig.type}</Text>
            <Text>Packets received: {streamData.length}</Text>

            <Button
                title={isStreaming ? 'Stop Streaming' : 'Start Streaming'}
                onPress={isStreaming ? handleStop : handleConfigureAndStart}
            />

            <ScrollView>
                {streamData.map((packet, idx) => (
                    <Text key={idx}>
                        t={packet.timestamp}ms: {packet.values.join(', ')}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
}
```

### FES Session with Status Monitoring

```typescript
import { useBluetoothContext } from '@/context/BluetoothContext';
import { useState, useEffect } from 'react';

function FESSessionScreen() {
    const {
        fesParams,
        setFesParams,
        sendFesParams,
        startSession,
        stopSession,
        pauseSession,
        resumeSession,
        sessionStatus,
        isSessionActive,
        triggerDetected,
        emergencyStop
    } = useBluetoothContext();

    const [sessionTime, setSessionTime] = useState(0);

    // Update session time
    useEffect(() => {
        if (sessionStatus) {
            setSessionTime(sessionStatus.sessionDuration);
        }
    }, [sessionStatus]);

    // Handle trigger detection
    useEffect(() => {
        if (triggerDetected) {
            console.log('sEMG trigger detected! FES pulse delivered.');
        }
    }, [triggerDetected]);

    // Handle emergency stop
    useEffect(() => {
        if (emergencyStop) {
            console.log('EMERGENCY STOP ACTIVATED!');
            alert('Emergency stop activated!');
        }
    }, [emergencyStop]);

    const handleStartSession = async () => {
        try {
            // 1. Send FES parameters
            await sendFesParams();

            // 2. Start session
            await startSession();
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    };

    return (
        <View>
            <Text>Session Status: {isSessionActive ? 'Active' : 'Inactive'}</Text>
            <Text>Duration: {Math.floor(sessionTime / 1000)}s</Text>

            {sessionStatus && (
                <View>
                    <Text>Complete Stimuli: {sessionStatus.completeStimuli}</Text>
                    <Text>Interrupted Stimuli: {sessionStatus.interruptedStimuli}</Text>
                    <Text>Time Since Last Trigger: {sessionStatus.timeSinceLastTrigger}ms</Text>
                </View>
            )}

            <View>
                <Button
                    title="Start Session"
                    onPress={handleStartSession}
                    disabled={isSessionActive}
                />
                <Button
                    title="Pause Session"
                    onPress={pauseSession}
                    disabled={!isSessionActive}
                />
                <Button
                    title="Resume Session"
                    onPress={resumeSession}
                    disabled={isSessionActive}
                />
                <Button
                    title="Stop Session"
                    onPress={stopSession}
                    disabled={!isSessionActive}
                />
            </View>

            {triggerDetected && (
                <Text style={{ color: 'green', fontWeight: 'bold' }}>
                    ✓ Trigger Detected!
                </Text>
            )}

            {emergencyStop && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>
                    ⚠ EMERGENCY STOP ACTIVATED
                </Text>
            )}
        </View>
    );
}
```

### FES Parameter Configuration

```typescript
import { useBluetoothContext } from '@/context/BluetoothContext';
import { useState } from 'react';

function FESConfigScreen() {
    const { fesParams, setFesParams, sendFesParams } = useBluetoothContext();

    const [localParams, setLocalParams] = useState(fesParams);

    const handleSave = async () => {
        // Update context
        setFesParams(localParams);

        // Send to device
        try {
            await sendFesParams();
            alert('FES parameters sent successfully');
        } catch (error) {
            console.error('Failed to send parameters:', error);
            alert('Failed to send parameters');
        }
    };

    return (
        <View>
            <Text>Amplitude: {localParams.amplitude}V</Text>
            <Slider
                value={localParams.amplitude}
                minimumValue={0}
                maximumValue={15}
                step={1}
                onValueChange={(value) => setLocalParams({ ...localParams, amplitude: value })}
            />

            <Text>Frequency: {localParams.frequency}Hz</Text>
            <Slider
                value={localParams.frequency}
                minimumValue={1}
                maximumValue={100}
                step={1}
                onValueChange={(value) => setLocalParams({ ...localParams, frequency: value })}
            />

            <Text>Pulse Width: {localParams.pulseWidth}µs</Text>
            <Slider
                value={localParams.pulseWidth}
                minimumValue={1}
                maximumValue={100}
                step={1}
                onValueChange={(value) => setLocalParams({ ...localParams, pulseWidth: value })}
            />

            <Text>Difficulty: {localParams.difficulty}%</Text>
            <Slider
                value={localParams.difficulty}
                minimumValue={1}
                maximumValue={100}
                step={1}
                onValueChange={(value) => setLocalParams({ ...localParams, difficulty: value })}
            />

            <Text>Pulse Duration: {localParams.pulseDuration}s</Text>
            <Slider
                value={localParams.pulseDuration}
                minimumValue={1}
                maximumValue={60}
                step={1}
                onValueChange={(value) => setLocalParams({ ...localParams, pulseDuration: value })}
            />

            <Button title="Send to Device" onPress={handleSave} />
        </View>
    );
}
```

---

## Platform-Specific Notes

### Android

- **Bluetooth Permissions**: Requires runtime permissions (automatically handled by `react-native-bluetooth-classic`)
- **Settings Access**: `openBluetoothSettings()` opens Android Bluetooth settings
- **Device Discovery**: Only scans bonded (paired) devices, not nearby unpaired devices
- **Background Operation**: Bluetooth connection maintained in background

**Required Permissions** (`android/app/src/main/AndroidManifest.xml`):

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Web

- **Limited Bluetooth**: Web Bluetooth API has limited SPP support
- **Development**: Useful for UI development without device connection
- **Metro Bundler**: Expo uses Metro for web bundling (configured in `app.json`)
- **Recommendation**: Android is primary platform for device communication

---

## Implementation Details

### Connection State Management

The app uses a dual-state pattern for device management:

**Device List State**:
```typescript
interface NeuraDevice {
    address: string;
    name: string;
    active: boolean;  // Connection status
}

const neuraDevices: NeuraDevice[] = [];
```

**Selected Device State**:
```typescript
const selectedDevice: NeuraDevice | null = null;
```

**Event Subscriptions**:
```typescript
let btDataReceiveSubscription: EventSubscription | null = null;
let btDeviceDisconnectSubscription: EventSubscription | null = null;
```

**Cleanup on Disconnect**:
```typescript
function disconnect(address: string) {
    // Remove subscriptions
    btDataReceiveSubscription?.remove();
    btDeviceDisconnectSubscription?.remove();

    // Clear selected device
    setSelectedDevice(null);

    // Update device list
    setNeuraDevices(devices =>
        devices.map(d => d.address === address ? { ...d, active: false } : d)
    );
}
```

### Automatic Reconnection

The app does **not** automatically reconnect on disconnect. Instead:

1. `onDeviceDisconnected` event sets `showConnectionErrorModal = true`
2. User must manually reconnect via UI
3. `updatePairedDevices()` polls every 5s until at least one device is found

**Rationale**: Manual reconnection gives user control and prevents unexpected behavior.

### Message Timing

**Event Auto-Clear Timers**:
- `triggerDetected`: Auto-clears after 5000ms
- `emergencyStop`: Auto-clears after 5000ms

**Connection Monitoring**:
- `verifyCurrentConnection()`: Runs every 10000ms for active connections
- `serialOutputCheck()`: Runs every 1000ms (currently commented out)

**Implementation**:
```typescript
useEffect(() => {
    if (triggerDetected) {
        const timer = setTimeout(() => {
            setTriggerDetected(false);
        }, 5000);
        return () => clearTimeout(timer);
    }
}, [triggerDetected]);
```

### Null Termination

All messages sent via `writeToBluetooth()` are automatically null-terminated:

```typescript
async function writeToBluetooth(payload: string) {
    if (!selectedDevice) {
        throw new Error('No device selected');
    }

    await RNBluetoothClassic.writeToDevice(
        selectedDevice.address,
        payload + '\0'  // Null termination
    );
}
```

This matches the ESP32 firmware expectation for message delimiters.

---

## See Also

- **Bluetooth Commands Reference**: `docs/api/BLUETOOTH_COMMANDS.md` - Complete message code reference
- **Mobile App Guide**: `docs/development/MOBILE_APP_GUIDE.md` - Mobile development workflow
- **Device Firmware**: `../InteroperableResearchsEMGDevice/CLAUDE.md` - ESP32 firmware documentation
- **Architecture Overview**: `docs/architecture/ARCHITECTURE_OVERVIEW.md` - System design
- **Implementation Summary**: `docs/implementation/IMPLEMENTATION_SUMMARY.md` - Feature status

---

**Last Updated**: 2025-11-10
**Maintained by**: IRIS Development Team
