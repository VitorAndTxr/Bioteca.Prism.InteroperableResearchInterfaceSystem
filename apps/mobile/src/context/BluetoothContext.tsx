import React, { useEffect, useState } from 'react';
import { ReactNode, createContext, useContext } from "react";
import { PermissionsAndroid, Platform, Linking } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice, BluetoothEventSubscription } from 'react-native-bluetooth-classic';
import { toByteArray } from 'react-native-quick-base64';

// Import shared domain types
import {
    BluetoothProtocolFunction,
    BluetoothProtocolMethod,
    BluetoothProtocolBodyProperty,
    BluetoothProtocolBodyField,
    BluetoothProtocolPayload,
    BluetoothProtocolBody,
    FESParametersBody,
    StreamType,
    StreamConfiguration,
    StreamDataPacket,
    FESParameters,
    SessionStatus,
    DEVICE_SAMPLE_RATE_HZ,
    SIMULATION_SAMPLE_RATE_HZ,
    BINARY_PACKET_MAGIC,
} from '@iris/domain';
import { BinaryFrameAccumulator } from '@/utils/binaryDecoder';

const BluetoothContext = createContext({} as BluetoothContextData);

interface BluetoothContextProviderProps {
    children: ReactNode;
}

type ActivableBluetoothDevice = BluetoothDevice & { active: boolean }

export function BluetoothContextProvider(props: BluetoothContextProviderProps) {
    const verifyConnectionDelayms = 10000;
    const verifySerialDelayms = 1000;
    const triggerUpTimems = 5000;

    const [bluetoothOn, setBluetoothOn] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    const [permissionPermanentlyDenied, setPermissionPermanentlyDenied] = useState(false);
    const [reload, callReload] = useState(false);

    const [neuraDevices, setNeuraDevices] = useState<ActivableBluetoothDevice[]>([]);
    const [pairedDevices, setPairedDevices] = useState<ActivableBluetoothDevice[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice>();
    const [btDataRecieveSubscription, setBtDataRecieveSubscription] = useState<BluetoothEventSubscription>();
    const [btDeviceDisconnectSubscription, setBtDeviceDisconnectSubscription] = useState<BluetoothEventSubscription>();

    const [fesParams, setFesParams] = useState<FESParametersBody>({
        a: 7,
        f: 60,
        pw: 300,
        df: 5,
        pd: 2
    });

    // Streaming state management
    const [isStreaming, setIsStreaming] = useState(false);
    // Ref mirror of isStreaming — readable inside stale BT listener closures
    const isStreamingRef = React.useRef(false);
    const [streamConfig, setStreamConfig] = useState<StreamConfiguration>({
        rate: DEVICE_SAMPLE_RATE_HZ,
        type: 'filtered'
    });
    const [streamData, setStreamData] = useState<StreamDataPacket[]>([]);
    const [lastStreamTimestamp, setLastStreamTimestamp] = useState<number>(0);

    // Batch buffer for reducing UI updates (5 updates per second)
    const streamBufferRef = React.useRef<StreamDataPacket[]>([]);
    const lastUpdateTimeRef = React.useRef<number>(0);
    const batchIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // Unbounded capture buffer — accumulates ALL packets during streaming for CSV export
    const allStreamPacketsRef = React.useRef<StreamDataPacket[]>([]);

    // Binary frame accumulator — buffers raw bytes across onDataReceived callbacks
    const binaryAccumulatorRef = React.useRef(new BinaryFrameAccumulator());

    // Session state
    const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
    const [isSessionActive, setIsSessionActive] = useState(false);

    const [showConnectionErrorModal, setShowConnectionErrorModal] = useState(false);

    useEffect(() => {
        initBluetooth();
    }, []);

    
    useEffect(() => {
        if (permissionGranted) {
            updatePairedDevices();
        }
    }, [selectedDevice, permissionGranted]);

    // Flush buffer function - updates UI with batched packets
    const flushStreamBuffer = React.useCallback(() => {
        if (streamBufferRef.current.length > 0) {
            const packetsToAdd = [...streamBufferRef.current];
            streamBufferRef.current = [];

            // Accumulate ALL packets in unbounded ref (for CSV export)
            allStreamPacketsRef.current.push(...packetsToAdd);

            setStreamData(prev => {
                const updated = [...prev, ...packetsToAdd];
                // Keep last 500 packets (~2-3 seconds at 215 Hz) for UI performance
                if (updated.length > 500) {
                    return updated.slice(-500);
                }
                return updated;
            });

            // Update last timestamp
            const lastPacket = packetsToAdd[packetsToAdd.length - 1];
            if (lastPacket) {
                setLastStreamTimestamp(lastPacket.timestamp);
            }
        }
    }, []);

    // Start batch interval when streaming starts
    React.useEffect(() => {
        if (isStreaming) {
            // Flush buffer every 500ms (2 times per second for better performance)
            batchIntervalRef.current = setInterval(() => {
                // Use requestAnimationFrame to avoid blocking UI thread
                requestAnimationFrame(() => {
                    flushStreamBuffer();
                });
            }, 500);
        } else {
            // Clear interval and flush remaining data when stopping
            if (batchIntervalRef.current) {
                clearInterval(batchIntervalRef.current);
                batchIntervalRef.current = null;
            }
            flushStreamBuffer(); // Flush any remaining data
        }

        return () => {
            if (batchIntervalRef.current) {
                clearInterval(batchIntervalRef.current);
            }
        };
    }, [isStreaming, flushStreamBuffer]);

    async function initBluetooth() {
        try {
            console.log("Initializing Bluetooth...");

            const granted = await requestBluetoothPermissions();
            setPermissionGranted(granted);

            if (!granted) {
                console.log("Bluetooth permissions not granted");
                setBluetoothOn(false);
                return;
            }

            const BTEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
            console.log("Bluetooth enabled:", BTEnabled);
            setBluetoothOn(BTEnabled);

            if (BTEnabled) {
                updatePairedDevices();
            }
        } catch (error) {
            console.error("Error initializing Bluetooth:", error);
            setBluetoothOn(false);
        }
    }

    async function requestBluetoothPermissions(): Promise<boolean> {
        try {
            console.log("Requesting Bluetooth permissions...");

            if (Platform.OS === 'android') {
                if (Platform.Version >= 31) {
                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ]);

                    const allGranted =
                        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

                    const anyPermanentlyDenied =
                        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

                    if (anyPermanentlyDenied) {
                        setPermissionPermanentlyDenied(true);
                    }

                    return allGranted;
                } else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );

                    if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                        setPermissionPermanentlyDenied(true);
                    }

                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            }

            return true;
        } catch (error) {
            console.error("Error requesting Bluetooth permissions:", error);
            return false;
        }
    }

    async function requestPermissions(): Promise<void> {
        setPermissionPermanentlyDenied(false);
        const granted = await requestBluetoothPermissions();
        setPermissionGranted(granted);

        if (granted) {
            try {
                const BTEnabled = await RNBluetoothClassic.requestBluetoothEnabled();
                setBluetoothOn(BTEnabled);
                if (BTEnabled) {
                    updatePairedDevices();
                }
            } catch (error) {
                console.error("Error enabling Bluetooth after permission grant:", error);
            }
        }
    }

    function openAppSettings(): void {
        Linking.openSettings();
    }

    async function verifyCurrentConnection(address: string) {
        try {
            let response = await RNBluetoothClassic.isDeviceConnected(address);

            if (response) {
                setTimeout(() => {
                    verifyCurrentConnection(address);
                }, verifyConnectionDelayms);
            } else {
                setSelectedDevice(undefined);
            }
        } catch (error) {
            console.error(error, 'BluetoothContext.verifyCurrentConnection.Error');
        }
    }

    async function writeToBluetooth(payload: string) {
        try {
            console.log("writeToBluetoothPayload:", payload);
            await RNBluetoothClassic.writeToDevice(selectedDevice!.address, payload + '\0');
        } catch (error) {
            console.log(error, 'BluetoothContext.writeToBluetooth.Error');
        }
    }

    async function updatePairedDevices() {
        try {
            // Guard: verify BLUETOOTH_CONNECT permission before accessing bonded devices
            if (Platform.OS === 'android' && Platform.Version >= 31) {
                const hasPermission = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
                );
                if (!hasPermission) {
                    console.log('BLUETOOTH_CONNECT permission not granted, skipping updatePairedDevices');
                    setPermissionGranted(false);
                    return;
                }
            }

            let processedNeuraDevices: ActivableBluetoothDevice[] = [];
            let processedAllDevices: ActivableBluetoothDevice[] = [];
            let boundedDevices = await RNBluetoothClassic.getBondedDevices();
            let boundedNeuraDevices = boundedDevices.filter(item => item.name === 'NeuroEstimulator');

            // Process all paired devices
            for (let index = 0; index < boundedDevices.length; index++) {
                const boundedDevice = boundedDevices[index];
                let isConnectedResponse = await boundedDevice.isConnected();

                processedAllDevices.push({
                    active: isConnectedResponse,
                    ...boundedDevice
                } as ActivableBluetoothDevice);
            }

            // Process NeuroEstimulator devices
            for (let index = 0; index < boundedNeuraDevices.length; index++) {
                const boundedNeuraDevice = boundedNeuraDevices[index];
                let isConnectedResponse = await boundedNeuraDevice.isConnected();

                processedNeuraDevices.push({
                    active: isConnectedResponse,
                    ...boundedNeuraDevice
                } as ActivableBluetoothDevice);
            }

            setNeuraDevices(processedNeuraDevices);
            setPairedDevices(processedAllDevices);
            callReload(!reload);

            if (boundedNeuraDevices.length === 0) {
                setTimeout(() => {
                    updatePairedDevices();
                }, 5000);
            }
        } catch (error) {
            console.log(error, 'BluetoothContext.updatePairedDevices.Error');
        }
    }

    async function connectBluetooth(address: string) {
        try {
            let connectedDevice = await RNBluetoothClassic.connectToDevice(address, {
                secureSocket: false,
                connectionType: 'binary'
            });

            if (connectedDevice) {
                const deviceCopy: ActivableBluetoothDevice = { ...connectedDevice } as ActivableBluetoothDevice;

                setSelectedDevice({
                    ...deviceCopy,
                    active: true
                } as ActivableBluetoothDevice);

                const onRecieveListener = connectedDevice.onDataReceived((btEntry) => {
                    // Silent processing - decode without logging for performance
                    decodeMessage(btEntry.data);
                });

                const onDisconnectListener = RNBluetoothClassic.onDeviceDisconnected((deviceDisconectEvent: any) => {
                    const deviceAddress = deviceCopy.address;

                    if (deviceDisconectEvent.address === deviceAddress) {
                        disconnect(deviceAddress);
                        setShowConnectionErrorModal(true);
                    }
                });

                setBtDataRecieveSubscription(onRecieveListener);
                setBtDeviceDisconnectSubscription(onDisconnectListener);

                setTimeout(() => {
                    verifyCurrentConnection(deviceCopy.address);
                }, 1000);
            }
        } catch (error) {
            console.log(error, 'BluetoothContext.BluetoothConnect.Error');
            setShowConnectionErrorModal(true);
        }
    }

    function decodeMessage(message: string) {
        try {
            // Step 1: Sanitize Base64 input (native layer may insert line breaks per RFC 2045,
            // and serial transport may append null terminators)
            const sanitized = message.replace(/[\s\0]/g, '');
            if (sanitized.length === 0) return;

            // Step 2: Decode Base64 to raw bytes (binary connection type delivers all data as Base64)
            const bytes = toByteArray(sanitized);

            if (bytes.length === 0) return;

            // Step 3: Route based on first byte
            if (bytes[0] === BINARY_PACKET_MAGIC) {
                // Binary sEMG packet(s) from firmware v3.1+
                const packets = binaryAccumulatorRef.current.feed(bytes);
                for (const packet of packets) {
                    streamBufferRef.current.push(packet);
                }
                // Implicit stream-start: first binary packet proves the device is streaming.
                // Using the ref avoids repeated setter calls from a stale closure.
                if (!isStreamingRef.current) {
                    isStreamingRef.current = true;
                    setIsStreaming(true);
                }
                return;
            }

            if (bytes[0] === 0x7B) {
                // JSON command/control message (0x7B = '{')
                const text = new TextDecoder().decode(bytes);
                const messageBody = JSON.parse(text) as BluetoothProtocolPayload;

                switch (messageBody.cd) {
                    case BluetoothProtocolFunction.GyroscopeReading:
                        console.log("Gyroscope Reading");
                        console.log(messageBody);
                        if (messageBody.bd && messageBody.bd.a !== undefined) {
                            console.log("Wrist angle:", messageBody.bd.a);
                        }
                        break;

                    case BluetoothProtocolFunction.Status:
                        console.log("Session Status");
                        console.log(messageBody);
                        if (messageBody.bd) {
                            const status: SessionStatus = {
                                parameters: messageBody.bd.parameters as FESParameters,
                                status: {
                                    csa: messageBody.bd.csa || 0,
                                    isa: messageBody.bd.isa || 0,
                                    tlt: messageBody.bd.tlt || 0,
                                    sd: messageBody.bd.sd || 0
                                }
                            };
                            setSessionStatus(status);
                        }
                        break;

                    case BluetoothProtocolFunction.Trigger:
                        console.log("sEMG Trigger Detected");
                        break;

                    case BluetoothProtocolFunction.PauseSession:
                        console.log("Session Paused");
                        break;

                    case BluetoothProtocolFunction.EmergencyStop:
                        console.log("Emergency Stop Activated");
                        setIsSessionActive(false);
                        isStreamingRef.current = false;
                        setIsStreaming(false);
                        break;

                    case BluetoothProtocolFunction.StartStream:
                        console.log("Stream Start Acknowledged");
                        if (messageBody.mt === BluetoothProtocolMethod.ACK) {
                            isStreamingRef.current = true;
                            setIsStreaming(true);
                        }
                        break;

                    case BluetoothProtocolFunction.StopStream:
                        console.log("Stream Stop Acknowledged");
                        if (messageBody.mt === BluetoothProtocolMethod.ACK) {
                            isStreamingRef.current = false;
                            setIsStreaming(false);
                        }
                        break;

                    case BluetoothProtocolFunction.StreamData:
                        // Legacy JSON streaming format (simulation mode / firmware v2.x)
                        if (messageBody.bd && messageBody.bd.t !== undefined && messageBody.bd.v) {
                            const packet: StreamDataPacket = {
                                timestamp: messageBody.bd.t,
                                values: messageBody.bd.v as number[]
                            };
                            streamBufferRef.current.push(packet);
                        }
                        break;

                    case BluetoothProtocolFunction.ConfigStream:
                        console.log("Stream Configuration Acknowledged");
                        if (messageBody.mt === BluetoothProtocolMethod.ACK) {
                            console.log("Stream configuration accepted by device");
                        }
                        break;

                    default:
                        console.log("Unknown message code:", messageBody.cd);
                        break;
                }
                return;
            }

            // Neither 0xAA nor '{' — may be a continuation fragment of a binary packet
            // that was split by the native layer before the magic byte boundary.
            const packets = binaryAccumulatorRef.current.feed(bytes);
            for (const packet of packets) {
                streamBufferRef.current.push(packet);
            }
        } catch (error) {
            console.warn('Error decoding message:', error);
        }
    }

    function openBluetoothSettings() {
        RNBluetoothClassic.openBluetoothSettings();
    }

    async function disconnect(address: string) {
        try {
            let isConnected = await RNBluetoothClassic.isDeviceConnected(address);
            if (isConnected) {
                await RNBluetoothClassic.disconnectFromDevice(address);
            }

            if (btDataRecieveSubscription !== undefined) {
                btDataRecieveSubscription.remove();
                setBtDataRecieveSubscription(undefined);
            }

            if (btDeviceDisconnectSubscription !== undefined) {
                btDeviceDisconnectSubscription.remove();
                setBtDeviceDisconnectSubscription(undefined);
            }

            binaryAccumulatorRef.current.reset();
            setSelectedDevice(undefined);
        } catch (error) {
            console.error(error, 'BluetoothContext.disconnect.Error');
        }
    }

    function onChange(values: number[], property: keyof FESParametersBody): void {
        setFesParams(currentParams => ({
            ...currentParams,
            [property]: values[0]
        }));
    }

    // Streaming functions
    async function configureStream(rate: number, type: StreamType): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.ConfigStream,
                mt: BluetoothProtocolMethod.WRITE,
                bd: {
                    rate: DEVICE_SAMPLE_RATE_HZ,
                    type: type
                }
            };

            setStreamConfig({ rate: DEVICE_SAMPLE_RATE_HZ, type });
            await writeToBluetooth(JSON.stringify(payload));
            console.log(`Stream configured: ${DEVICE_SAMPLE_RATE_HZ}Hz, type: ${type}`);
        } catch (error) {
            console.error("Error configuring stream:", error);
        }
    }

    async function startStream(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.StartStream,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            // Reset ref before sending — guards against rapid start/stop cycles
            // where the previous streaming session's ref could prevent detection of
            // the new session's first binary packet.
            isStreamingRef.current = false;
            setStreamData([]);
            setLastStreamTimestamp(0);
            streamBufferRef.current = [];
            allStreamPacketsRef.current = [];
            binaryAccumulatorRef.current.reset();

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Stream start requested");
        } catch (error) {
            console.error("Error starting stream:", error);
        }
    }

    async function stopStream(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.StopStream,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Stream stop requested");
        } catch (error) {
            console.error("Error stopping stream:", error);
        }
    }

    // Session control functions
    async function startSession(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.StartSession,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            setIsSessionActive(true);
            console.log("Session start requested");
        } catch (error) {
            console.error("Error starting session:", error);
        }
    }

    async function stopSession(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.StopSession,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            setIsSessionActive(false);
            console.log("Session stop requested");
        } catch (error) {
            console.error("Error stopping session:", error);
        }
    }

    async function pauseSession(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.PauseSession,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Session pause requested");
        } catch (error) {
            console.error("Error pausing session:", error);
        }
    }

    async function resumeSession(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.ResumeSession,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Session resume requested");
        } catch (error) {
            console.error("Error resuming session:", error);
        }
    }

    async function sendFesParams(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.FesParam,
                mt: BluetoothProtocolMethod.WRITE,
                bd: {
                    a: fesParams.a,
                    f: fesParams.f,
                    pw: fesParams.pw,
                    df: fesParams.df,
                    pd: fesParams.pd
                }
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("FES parameters sent:", fesParams);
        } catch (error) {
            console.error("Error sending FES parameters:", error);
        }
    }

    async function singleStimulation(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.SingleStimuli,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Single stimulation requested");
        } catch (error) {
            console.error("Error sending single stimulation:", error);
        }
    }

    async function readGyroscope(): Promise<void> {
        try {
            const payload: BluetoothProtocolPayload = {
                cd: BluetoothProtocolFunction.GyroscopeReading,
                mt: BluetoothProtocolMethod.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Gyroscope reading requested");
        } catch (error) {
            console.error("Error reading gyroscope:", error);
        }
    }

    function getAllStreamPackets(): StreamDataPacket[] {
        // Flush any pending packets from the batch buffer before returning
        flushStreamBuffer();
        return [...allStreamPacketsRef.current];
    }

    function clearStreamData(): void {
        setStreamData([]);
        setLastStreamTimestamp(0);
        allStreamPacketsRef.current = [];
    }

    async function exportStreamData(): Promise<void> {
        try {
            const { exportStreamDataSimpleCSV } = await import('@/utils/csvExport');
            await exportStreamDataSimpleCSV(streamData);
            console.log('Stream data exported successfully');
        } catch (error) {
            console.error('Error exporting stream data:', error);
            throw error;
        }
    }

    async function scanForDevices(): Promise<void> {
        try {
            setIsScanning(true);

            // Re-request permissions if not granted (handles cleared app data)
            if (!permissionGranted) {
                const granted = await requestBluetoothPermissions();
                setPermissionGranted(granted);
                if (!granted) {
                    console.log('Bluetooth permissions not granted, cannot scan');
                    return;
                }
            }

            await updatePairedDevices();
            console.log('Device scan completed');
        } catch (error) {
            console.error('Error scanning for devices:', error);
        } finally {
            setIsScanning(false);
        }
    }

    async function connectToDevice(address: string): Promise<void> {
        await connectBluetooth(address);
    }

    async function disconnectDevice(): Promise<void> {
        if (selectedDevice) {
            await disconnect(selectedDevice.address);
        }
    }

    function getSignalStrength(): number | null {
        // Mock signal strength since RSSI is not reliably available via BT Classic
        // In a production app, this could query device RSSI if available
        if (selectedDevice) {
            return 75; // Mock 75% signal strength when connected
        }
        return null;
    }

    return (
        <BluetoothContext.Provider value={{
            bluetoothOn,
            permissionGranted,
            permissionPermanentlyDenied,
            neuraDevices,
            pairedDevices,
            isScanning,
            signalStrength: getSignalStrength(),
            showConnectionErrorModal,
            setShowConnectionErrorModal,
            writeToBluetooth,
            selectedDevice,
            setSelectedDevice,
            fesParams,
            setFesParams,
            onChange,
            isStreaming,
            streamConfig,
            streamData,
            lastStreamTimestamp,
            sessionStatus,
            isSessionActive,
            connectBluetooth,
            initBluetooth,
            openBluetoothSettings,
            openAppSettings,
            requestPermissions,
            disconnect,
            configureStream,
            startStream,
            stopStream,
            getAllStreamPackets,
            clearStreamData,
            exportStreamData,
            startSession,
            stopSession,
            pauseSession,
            resumeSession,
            sendFesParams,
            singleStimulation,
            readGyroscope,
            scanForDevices,
            connectToDevice,
            disconnectDevice
        }}>
            {props.children}
        </BluetoothContext.Provider>
    );
}

export function useBluetoothContext() {
    return useContext(BluetoothContext);
}

interface BluetoothContextData {
    bluetoothOn: boolean;
    permissionGranted: boolean | null;
    permissionPermanentlyDenied: boolean;
    neuraDevices: ActivableBluetoothDevice[];
    pairedDevices: ActivableBluetoothDevice[];
    isScanning: boolean;
    signalStrength: number | null;
    selectedDevice: BluetoothDevice | undefined;
    setSelectedDevice: React.Dispatch<React.SetStateAction<BluetoothDevice | undefined>>;
    showConnectionErrorModal: boolean;
    setShowConnectionErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
    fesParams: FESParametersBody;
    setFesParams: React.Dispatch<React.SetStateAction<FESParametersBody>>;
    onChange: (values: number[], property: keyof FESParametersBody) => void;
    isStreaming: boolean;
    streamConfig: StreamConfiguration;
    streamData: StreamDataPacket[];
    lastStreamTimestamp: number;
    sessionStatus: SessionStatus | null;
    isSessionActive: boolean;
    disconnect: (address: string) => void;
    openBluetoothSettings: () => void;
    openAppSettings: () => void;
    requestPermissions: () => Promise<void>;
    initBluetooth: () => void;
    connectBluetooth: (address: string) => void;
    writeToBluetooth: (payload: string) => void;
    configureStream: (rate: number, type: StreamType) => Promise<void>;
    startStream: () => Promise<void>;
    stopStream: () => Promise<void>;
    getAllStreamPackets: () => StreamDataPacket[];
    clearStreamData: () => void;
    exportStreamData: () => Promise<void>;
    startSession: () => Promise<void>;
    stopSession: () => Promise<void>;
    pauseSession: () => Promise<void>;
    resumeSession: () => Promise<void>;
    sendFesParams: () => Promise<void>;
    singleStimulation: () => Promise<void>;
    readGyroscope: () => Promise<void>;
    scanForDevices: () => Promise<void>;
    connectToDevice: (address: string) => Promise<void>;
    disconnectDevice: () => Promise<void>;
}
