import React, { useEffect, useState } from 'react';
import { ReactNode, createContext, useContext } from "react";
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

    const [showConnectionErrorModal, setShowConnectionErrorModal] = useState(false)

    useEffect(()=>{
        initBluetooth()
    },[])

    useEffect(()=>{
    },[selectedDevice])

    async function initBluetooth() {
        try{
            let BTEnabled = await RNBluetoothClassic.requestBluetoothEnabled()
            setBluetoothOn(BTEnabled)
    
            if(BTEnabled){
                updatePairedDevices()
            }
        }catch(error){
            console.error(error)
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
        let messageBody = JSON.parse(message) as NeuraXBluetoothProtocolPayload
        

        switch(messageBody[NeuraXBluetoothProtocolBodyFieldEnum.CODE]){
            case NeuraXBluetoothProtocolFunctionEnum.GyroscopeReading:
                console.log("Giroscópio");
                console.log(messageBody);

                break;
            case NeuraXBluetoothProtocolFunctionEnum.Status:
                console.log("Status");
                console.log(messageBody);

                break;
            case NeuraXBluetoothProtocolFunctionEnum.Trigger:
                console.log("Trigger");
                console.log(messageBody);

                break;
            case NeuraXBluetoothProtocolFunctionEnum.PauseSession:
                console.log("Pause");
                console.log(messageBody);

                break;
            case NeuraXBluetoothProtocolFunctionEnum.EmergencyStop:
                console.log("EmergencyStop");
                console.log(messageBody);
                break;
            default:
                break;

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

    return (
        <>
            <BluetoothContext.Provider value={{
                bluetoothOn,
                neuraDevices,

                showConnectionErrorModal, setShowConnectionErrorModal,
                writeToBluetooth,

                selectedDevice,
                setSelectedDevice,

                connectBluetooth,
                initBluetooth,
                openBluetoothSettings,
                onChange,
                disconnect
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
    bluetoothOn:boolean

    neuraDevices:ActivableBluetoothDevice[]

    selectedDevice:BluetoothDevice|undefined
    setSelectedDevice:React.Dispatch<React.SetStateAction<BluetoothDevice|undefined>>

    showConnectionErrorModal:boolean
    setShowConnectionErrorModal:React.Dispatch<React.SetStateAction<boolean>>
    disconnect:(address:string) => void
    openBluetoothSettings:() => void
    initBluetooth:() => void
    connectBluetooth:(address:string) => void
    writeToBluetooth:(payload:string) => void

    onChange:(values:number[], property:NeuraXBluetoothProtocolBodyPropertyEnum) => void

}

enum NeuraXBluetoothProtocolFunctionEnum{
    ConnectionHandshake,
    GyroscopeReading,
    StartSession,
    StopSession,
    PauseSession,
    ResumeSession,
    SingleStimuli,
    FesParam,
    Status,
    Trigger,
    EmergencyStop
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
    [NeuraXBluetoothProtocolBodyPropertyEnum.STIMULI_DURATION]?:number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.COOMPLETE_STIMULI_AMOUNT]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.INTERRUPTED_STIMULI_AMOUNT]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.TIME_OF_LAST_TRIGGER]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.SESSION_DURATION]?: number,
    [NeuraXBluetoothProtocolBodyPropertyEnum.MAXIMUM_SESSION_DURATION]?:number,
}

export type NeuraXBluetoothProtocolFEsStimuliBody = {
    [NeuraXBluetoothProtocolBodyPropertyEnum.AMPLITUDE]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.FREQUENCY]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.PULSE_WIDTH]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.DIFFICULTY]: number | undefined,
    [NeuraXBluetoothProtocolBodyPropertyEnum.STIMULI_DURATION] :number | undefined,
}