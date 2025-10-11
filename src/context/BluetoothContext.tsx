import React, { useEffect, useState } from 'react';
import { ReactNode, createContext, useContext } from "react";
import { PermissionsAndroid, Platform } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice, BluetoothEventSubscription, BluetoothNativeDevice} from 'react-native-bluetooth-classic';

const BluetoothContext = createContext({} as BluetoothContextData);
interface BluetoothContextProviderProps {
    children: ReactNode;
}

type ActivableBluetoothDevice = BluetoothDevice&{active:boolean}



export function BluetoothContextProvider(props: BluetoothContextProviderProps) {
    const verifyConnectionDelayms = 10000
    const verifySerialDelayms = 1000
    const triggerUpTimems = 5000


    const [bluetoothOn, setBluetoothOn] = useState(false)
    const [reload, callReload] = useState(false)

    const [neuraDevices, setNeuraDevices] = useState<ActivableBluetoothDevice[]>([])
    const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice>()
    const [btDataRecieveSubscription, setBtDataRecieveSubscription] = useState<BluetoothEventSubscription>()
    const [btDeviceDisconnectSubscription, setBtDeviceDisconnectSubscription] = useState<BluetoothEventSubscription>()

    const [fesParams, setFesParams] = useState<NeuraXBluetoothProtocolFEsStimuliBody>({
        [NeuraXBluetoothProtocolBodyPropertyEnum.AMPLITUDE]:            7,
        [NeuraXBluetoothProtocolBodyPropertyEnum.FREQUENCY]:            60,
        [NeuraXBluetoothProtocolBodyPropertyEnum.PULSE_WIDTH]:          300,
        [NeuraXBluetoothProtocolBodyPropertyEnum.DIFFICULTY]:           5,
        [NeuraXBluetoothProtocolBodyPropertyEnum.STIMULI_DURATION]:     2
    })

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

    const [showConnectionErrorModal, setShowConnectionErrorModal] = useState(false)

    useEffect(()=>{
        initBluetooth()
    },[])

    useEffect(()=>{
    },[selectedDevice])

    async function initBluetooth() {
        try {
            console.log("Initializing Bluetooth...");

            // Step 1: Request runtime permissions (Android 12+ requires BLUETOOTH_CONNECT)
            const permissionGranted = await requestBluetoothPermissions();

            if (!permissionGranted) {
                console.log("Bluetooth permissions not granted");
                setBluetoothOn(false);
                return;
            }

            // Step 2: Request Bluetooth to be enabled (now that we have permissions)
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

            // On Android 12+ (API 31+), we need BLUETOOTH_CONNECT permission
            if (Platform.OS === 'android') {
                if (Platform.Version >= 31) {
                    // Android 12 and above
                    console.log("Requesting Android 12+ permissions");

                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    ]);

                    const allGranted =
                        granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

                    console.log("Permissions granted:", allGranted);
                    return allGranted;
                } else {
                    // Android 11 and below
                    console.log("Requesting Android 11 and below permissions");

                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                    );

                    const locationGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
                    console.log("Location permission granted:", locationGranted);
                    return locationGranted;
                }
            }

            // iOS or web - no special permissions needed
            return true;
        } catch (error) {
            console.error("Error requesting Bluetooth permissions:", error);
            return false;
        }
    }

    async function verifyCurrentConnection(address:string){
        try {             
            let response = await RNBluetoothClassic.isDeviceConnected(address)
            
            if(response){
                //checkSerialOutput(address)
                setTimeout(()=>{
                    verifyCurrentConnection(address)
                }, verifyConnectionDelayms)
            }
            else{
                setSelectedDevice(undefined)
            }
        } catch (error) {
            console.error(error,'BluetoothContext.verifyCurrentConnection.Error')
            
        }
    }
    async function writeToBluetooth(payload:string) {
        try {
            console.log("writeToBluetoothPayload:",payload);
            
            let response = await RNBluetoothClassic.writeToDevice(selectedDevice!.address, payload+'\0')
        } catch (error) {
            console.log(error,'BluetoothContext.writeToBluetooth.Error')
        }
    }

    async function updatePairedDevices(){
        try {
            let processedNeuraDevices:ActivableBluetoothDevice[] =[] 
            let boundedDevices = await RNBluetoothClassic.getBondedDevices()
            let boundedNeuraDevices = boundedDevices.filter( item => {return item.name === 'NeuroEstimulator'})

            for (let index = 0; index < boundedNeuraDevices.length; index++) {
                const boundedNeuraDevice = boundedNeuraDevices[index];
                let isConnectedResponse = await boundedNeuraDevice.isConnected()
               
                processedNeuraDevices.push({
                    active:isConnectedResponse,
                    ...boundedNeuraDevice
                }as ActivableBluetoothDevice)
                
            }
        
            setNeuraDevices(processedNeuraDevices)
            callReload(!reload)
            
            if(boundedNeuraDevices.length ===0){
                setTimeout(()=>{
                    updatePairedDevices()
                },5000)
            }
            
        } catch (error) {
            console.log(error,'BluetoothContext.updatePairedDevices.Error')
            
        }
    }

    async function connectBluetooth(address:string){
        try {            
            
            let connectedDevice = await RNBluetoothClassic.connectToDevice(address,{
                secureSocket: false
            })
            
            if(connectedDevice)
            {

                const deviceCopy:ActivableBluetoothDevice = {...connectedDevice} as ActivableBluetoothDevice
                

                setSelectedDevice({
                    ...deviceCopy,
                    active:true
                }as ActivableBluetoothDevice)

                const onRecieveListener = connectedDevice.onDataReceived((btEntry) => {
                    console.log('Dados recebidos:', btEntry.data);
                    decodeMessage(btEntry.data)
                    // Faça algo com os dados recebidos, por exemplo, atualize a interface do usuário
                })
                const onDisconnectListener = RNBluetoothClassic.onDeviceDisconnected((deviceDisconectEvent:any)=>{
                    const deviceAddress = deviceCopy.address

                    if(deviceDisconectEvent.address === deviceAddress){
                        disconnect(deviceAddress)
                        setShowConnectionErrorModal(true)           
                    }

                })

                setBtDataRecieveSubscription(onRecieveListener)
                setBtDeviceDisconnectSubscription(onDisconnectListener)

                setTimeout(()=>{
                    verifyCurrentConnection(deviceCopy.address)
                }, 1000)
            }
            
            
        } catch (error) {
            console.log(error,'BluetoothContext.BluetoothConnect.Error') 
            setShowConnectionErrorModal(true)           
        }
    }

    function decodeMessage(message:string){
        try {
            let messageBody = JSON.parse(message) as NeuraXBluetoothProtocolPayload

            switch(messageBody[NeuraXBluetoothProtocolBodyFieldEnum.CODE]){
                case NeuraXBluetoothProtocolFunctionEnum.GyroscopeReading:
                    console.log("Gyroscope Reading");
                    console.log(messageBody);
                    if (messageBody.bd && messageBody.bd.a !== undefined) {
                        // Handle gyroscope angle data
                        console.log("Wrist angle:", messageBody.bd.a);
                    }
                    break;

                case NeuraXBluetoothProtocolFunctionEnum.Status:
                    console.log("Session Status");
                    console.log(messageBody);
                    if (messageBody.bd) {
                        // Update session status state
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

                case NeuraXBluetoothProtocolFunctionEnum.Trigger:
                    console.log("sEMG Trigger Detected");
                    console.log(messageBody);
                    // Trigger event detected - could be used to update UI
                    break;

                case NeuraXBluetoothProtocolFunctionEnum.PauseSession:
                    console.log("Session Paused");
                    console.log(messageBody);
                    break;

                case NeuraXBluetoothProtocolFunctionEnum.EmergencyStop:
                    console.log("Emergency Stop Activated");
                    console.log(messageBody);
                    setIsSessionActive(false);
                    setIsStreaming(false);
                    break;

                case NeuraXBluetoothProtocolFunctionEnum.StartStream:
                    console.log("Stream Start Acknowledged");
                    if (messageBody.mt === NeuraXBluetoothProtocolMethodEnum.ACK) {
                        setIsStreaming(true);
                    }
                    break;

                case NeuraXBluetoothProtocolFunctionEnum.StopStream:
                    console.log("Stream Stop Acknowledged");
                    if (messageBody.mt === NeuraXBluetoothProtocolMethodEnum.ACK) {
                        setIsStreaming(false);
                    }
                    break;

                case NeuraXBluetoothProtocolFunctionEnum.StreamData:
                    console.log("Stream Data Received");
                    if (messageBody.bd && messageBody.bd.t !== undefined && messageBody.bd.v) {
                        const packet: StreamDataPacket = {
                            timestamp: messageBody.bd.t,
                            values: messageBody.bd.v as number[]
                        };

                        // Add new packet to stream data (keep last 1000 packets)
                        setStreamData(prev => {
                            const updated = [...prev, packet];
                            return updated.slice(-1000);
                        });

                        setLastStreamTimestamp(packet.timestamp);
                        console.log(`Timestamp: ${packet.timestamp}ms, Samples: ${packet.values.length}`);
                    }
                    break;

                case NeuraXBluetoothProtocolFunctionEnum.ConfigStream:
                    console.log("Stream Configuration Acknowledged");
                    if (messageBody.mt === NeuraXBluetoothProtocolMethodEnum.ACK) {
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

    function openBluetoothSettings(){
        RNBluetoothClassic.openBluetoothSettings()
    }

    async function disconnect(address:string) {
        try {            
            let isConnected = await RNBluetoothClassic.isDeviceConnected(address)
            if(isConnected)(
                await RNBluetoothClassic.disconnectFromDevice(address)
            )

            if(btDataRecieveSubscription!==undefined){
                btDataRecieveSubscription.remove()
                setBtDataRecieveSubscription(undefined)
            
            }
            if(btDeviceDisconnectSubscription!==undefined){
                btDeviceDisconnectSubscription.remove()
                setBtDeviceDisconnectSubscription(undefined)
            }

            setSelectedDevice(undefined)
            

        } catch (error) {
            console.error(error,'BluetoothContext.disconnect.Error')
        }
        
    }


    function onChange(values:number[], property:NeuraXBluetoothProtocolBodyPropertyEnum):void{
        setFesParams(currentParams =>{
            return {
            ...currentParams,
            [property]:values[0]
            }
        })
    }

    // Streaming functions
    async function configureStream(rate: number, type: StreamType): Promise<void> {
        try {
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.ConfigStream,
                mt: NeuraXBluetoothProtocolMethodEnum.WRITE,
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
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.StartStream,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
            };

            // Clear previous stream data
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
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.StopStream,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
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
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.StartSession,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
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
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.StopSession,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
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
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.PauseSession,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Session pause requested");
        } catch (error) {
            console.error("Error pausing session:", error);
        }
    }

    async function resumeSession(): Promise<void> {
        try {
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.ResumeSession,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Session resume requested");
        } catch (error) {
            console.error("Error resuming session:", error);
        }
    }

    async function sendFesParams(): Promise<void> {
        try {
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.FesParam,
                mt: NeuraXBluetoothProtocolMethodEnum.WRITE,
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
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.SingleStimuli,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Single stimulation requested");
        } catch (error) {
            console.error("Error sending single stimulation:", error);
        }
    }

    async function readGyroscope(): Promise<void> {
        try {
            const payload: NeuraXBluetoothProtocolPayload = {
                cd: NeuraXBluetoothProtocolFunctionEnum.GyroscopeReading,
                mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
            };

            await writeToBluetooth(JSON.stringify(payload));
            console.log("Gyroscope reading requested");
        } catch (error) {
            console.error("Error reading gyroscope:", error);
        }
    }

    // Clear stream data (useful for UI reset)
    function clearStreamData(): void {
        setStreamData([]);
        setLastStreamTimestamp(0);
    }

    return (
        <>
            <BluetoothContext.Provider value={{
                bluetoothOn,
                neuraDevices,

                showConnectionErrorModal,
                setShowConnectionErrorModal,
                writeToBluetooth,

                selectedDevice,
                setSelectedDevice,

                // FES parameters
                fesParams,
                setFesParams,
                onChange,

                // Streaming state
                isStreaming,
                streamConfig,
                streamData,
                lastStreamTimestamp,

                // Session state
                sessionStatus,
                isSessionActive,

                // Connection functions
                connectBluetooth,
                initBluetooth,
                openBluetoothSettings,
                disconnect,

                // Streaming functions
                configureStream,
                startStream,
                stopStream,
                clearStreamData,

                // Session control functions
                startSession,
                stopSession,
                pauseSession,
                resumeSession,

                // Device functions
                sendFesParams,
                singleStimulation,
                readGyroscope
            }}>
                {props.children}
            </BluetoothContext.Provider>
        </>
    );
}

export function useBluetoothContext() {
    return useContext(BluetoothContext);
}

interface BluetoothContextData {
    bluetoothOn: boolean

    neuraDevices: ActivableBluetoothDevice[]

    selectedDevice: BluetoothDevice | undefined
    setSelectedDevice: React.Dispatch<React.SetStateAction<BluetoothDevice | undefined>>

    showConnectionErrorModal: boolean
    setShowConnectionErrorModal: React.Dispatch<React.SetStateAction<boolean>>

    // FES parameters
    fesParams: NeuraXBluetoothProtocolFEsStimuliBody
    setFesParams: React.Dispatch<React.SetStateAction<NeuraXBluetoothProtocolFEsStimuliBody>>
    onChange: (values: number[], property: NeuraXBluetoothProtocolBodyPropertyEnum) => void

    // Streaming state
    isStreaming: boolean
    streamConfig: StreamConfiguration
    streamData: StreamDataPacket[]
    lastStreamTimestamp: number

    // Session state
    sessionStatus: SessionStatus | null
    isSessionActive: boolean

    // Connection functions
    disconnect: (address: string) => void
    openBluetoothSettings: () => void
    initBluetooth: () => void
    connectBluetooth: (address: string) => void
    writeToBluetooth: (payload: string) => void

    // Streaming functions
    configureStream: (rate: number, type: StreamType) => Promise<void>
    startStream: () => Promise<void>
    stopStream: () => Promise<void>
    clearStreamData: () => void

    // Session control functions
    startSession: () => Promise<void>
    stopSession: () => Promise<void>
    pauseSession: () => Promise<void>
    resumeSession: () => Promise<void>

    // Device functions
    sendFesParams: () => Promise<void>
    singleStimulation: () => Promise<void>
    readGyroscope: () => Promise<void>
}

enum NeuraXBluetoothProtocolFunctionEnum{
    ConnectionHandshake,    // 0
    GyroscopeReading,       // 1
    StartSession,           // 2
    StopSession,            // 3
    PauseSession,           // 4
    ResumeSession,          // 5
    SingleStimuli,          // 6
    FesParam,               // 7
    Status,                 // 8
    Trigger,                // 9
    EmergencyStop,          // 10
    StartStream,            // 11 - Start real-time sEMG streaming
    StopStream,             // 12 - Stop sEMG streaming
    StreamData,             // 13 - Real-time data packet from device
    ConfigStream            // 14 - Configure streaming parameters
}

enum NeuraXBluetoothProtocolMethodEnum{
    READ = 'r',
    WRITE = 'w',
    EXECUTE = 'x',
    ACK = 'a'
}

export enum NeuraXBluetoothProtocolBodyPropertyEnum{
    ANGLE = 'a',
    AMPLITUDE = 'a',
    FREQUENCY = 'f',
    PULSE_WIDTH = 'pw',
    DIFFICULTY = 'df',
    STIMULI_DURATION = 'pd',
    COOMPLETE_STIMULI_AMOUNT = 'csa',
    INTERRUPTED_STIMULI_AMOUNT = 'isa',
    TIME_OF_LAST_TRIGGER = 'tlt',
    SESSION_DURATION = 'sd',
    MAXIMUM_SESSION_DURATION = 'm',
}

enum NeuraXBluetoothProtocolBodyFieldEnum{
    CODE = 'cd',
    METHOD = 'mt',
    BODY =  'bd'
}

export type NeuraXBluetoothProtocolPayload = {
    [NeuraXBluetoothProtocolBodyFieldEnum.CODE]:number,
    [NeuraXBluetoothProtocolBodyFieldEnum.METHOD]:string,
    [NeuraXBluetoothProtocolBodyFieldEnum.BODY]?: NeuraXBluetoothProtocolBody
}

export type NeuraXBluetoothProtocolBody = {
    [NeuraXBluetoothProtocolBodyPropertyEnum.AMPLITUDE]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.FREQUENCY]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.PULSE_WIDTH]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.DIFFICULTY]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.STIMULI_DURATION]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.COOMPLETE_STIMULI_AMOUNT]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.INTERRUPTED_STIMULI_AMOUNT]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.TIME_OF_LAST_TRIGGER]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.SESSION_DURATION]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.MAXIMUM_SESSION_DURATION]?: number,
    // Streaming-specific fields
    rate?: number,          // Streaming rate in Hz
    type?: string,          // Streaming type: "raw", "filtered", "rms"
    t?: number,             // Timestamp (milliseconds since boot)
    v?: number[],           // Array of sEMG values
    csa?: number,           // Complete stimuli amount
    isa?: number,           // Interrupted stimuli amount
    tlt?: number,           // Time of last trigger
    sd?: number,            // Session duration
    parameters?: any,       // Nested FES parameters in status messages
}

export type NeuraXBluetoothProtocolFEsStimuliBody = {
    [NeuraXBluetoothProtocolBodyPropertyEnum.AMPLITUDE]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.FREQUENCY]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.PULSE_WIDTH]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.DIFFICULTY]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.STIMULI_DURATION]: number | undefined,
}

// Streaming-specific types
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