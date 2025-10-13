import React, { useEffect, useState } from 'react';
import { ReactNode, createContext, useContext } from "react";
import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice, BluetoothEventSubscription } from 'react-native-bluetooth-classic';

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
    SessionStatus
} from '@iris/domain';

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
    const [reload, callReload] = useState(false);

    const [neuraDevices, setNeuraDevices] = useState<ActivableBluetoothDevice[]>([]);
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
    const [streamConfig, setStreamConfig] = useState<StreamConfiguration>({
        rate: 100,
        type: 'filtered'
    });
    const [streamData, setStreamData] = useState<StreamDataPacket[]>([]);
    const [lastStreamTimestamp, setLastStreamTimestamp] = useState<number>(0);

    // Session state
    const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
    const [isSessionActive, setIsSessionActive] = useState(false);

    const [showConnectionErrorModal, setShowConnectionErrorModal] = useState(false);

    useEffect(() => {
        initBluetooth();
    }, []);

    async function initBluetooth() {
        try {
            console.log("Initializing Bluetooth...");

            const permissionGranted = await requestBluetoothPermissions();

            if (!permissionGranted) {
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

                    return allGranted;
                } else {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );

                    return granted === PermissionsAndroid.RESULTS.GRANTED;
                }
            }

            return true;
        } catch (error) {
            console.error("Error requesting Bluetooth permissions:", error);
            return false;
        }
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
            let processedNeuraDevices: ActivableBluetoothDevice[] = [];
            let boundedDevices = await RNBluetoothClassic.getBondedDevices();
            let boundedNeuraDevices = boundedDevices.filter(item => item.name === 'NeuroEstimulator');

            for (let index = 0; index < boundedNeuraDevices.length; index++) {
                const boundedNeuraDevice = boundedNeuraDevices[index];
                let isConnectedResponse = await boundedNeuraDevice.isConnected();

                processedNeuraDevices.push({
                    active: isConnectedResponse,
                    ...boundedNeuraDevice
                } as ActivableBluetoothDevice);
            }

            setNeuraDevices(processedNeuraDevices);
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
                secureSocket: false
            });

            if (connectedDevice) {
                const deviceCopy: ActivableBluetoothDevice = { ...connectedDevice } as ActivableBluetoothDevice;

                setSelectedDevice({
                    ...deviceCopy,
                    active: true
                } as ActivableBluetoothDevice);

                const onRecieveListener = connectedDevice.onDataReceived((btEntry) => {
                    console.log('Dados recebidos:', btEntry.data);
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
            let messageBody = JSON.parse(message) as BluetoothProtocolPayload;

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
                    setIsStreaming(false);
                    break;

                case BluetoothProtocolFunction.StartStream:
                    console.log("Stream Start Acknowledged");
                    if (messageBody.mt === BluetoothProtocolMethod.ACK) {
                        setIsStreaming(true);
                    }
                    break;

                case BluetoothProtocolFunction.StopStream:
                    console.log("Stream Stop Acknowledged");
                    if (messageBody.mt === BluetoothProtocolMethod.ACK) {
                        setIsStreaming(false);
                    }
                    break;

                case BluetoothProtocolFunction.StreamData:
                    console.log("Stream Data Received");
                    if (messageBody.bd && messageBody.bd.t !== undefined && messageBody.bd.v) {
                        const packet: StreamDataPacket = {
                            timestamp: messageBody.bd.t,
                            values: messageBody.bd.v as number[]
                        };

                        setStreamData(prev => {
                            const updated = [...prev, packet];
                            return updated.slice(-1000);
                        });

                        setLastStreamTimestamp(packet.timestamp);
                        console.log(`Timestamp: ${packet.timestamp}ms, Samples: ${packet.values.length}`);
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
        } catch (error) {
            console.error("Error decoding message:", error);
            console.error("Raw message:", message);
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
                    rate: rate,
                    type: type
                }
            };

            setStreamConfig({ rate, type });
            await writeToBluetooth(JSON.stringify(payload));
            console.log(`Stream configured: ${rate}Hz, type: ${type}`);
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

            setStreamData([]);
            setLastStreamTimestamp(0);

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

    function clearStreamData(): void {
        setStreamData([]);
        setLastStreamTimestamp(0);
    }

    return (
        <BluetoothContext.Provider value={{
            bluetoothOn,
            neuraDevices,
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
            disconnect,
            configureStream,
            startStream,
            stopStream,
            clearStreamData,
            startSession,
            stopSession,
            pauseSession,
            resumeSession,
            sendFesParams,
            singleStimulation,
            readGyroscope
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
    neuraDevices: ActivableBluetoothDevice[];
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
    initBluetooth: () => void;
    connectBluetooth: (address: string) => void;
    writeToBluetooth: (payload: string) => void;
    configureStream: (rate: number, type: StreamType) => Promise<void>;
    startStream: () => Promise<void>;
    stopStream: () => Promise<void>;
    clearStreamData: () => void;
    startSession: () => Promise<void>;
    stopSession: () => Promise<void>;
    pauseSession: () => Promise<void>;
    resumeSession: () => Promise<void>;
    sendFesParams: () => Promise<void>;
    singleStimulation: () => Promise<void>;
    readGyroscope: () => Promise<void>;
}
