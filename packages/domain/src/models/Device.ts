/**
 * Device Models
 *
 * Defines types for sEMG/FES hardware devices and their configuration.
 */

/**
 * Device Information
 */
export interface DeviceInfo {
    name: string;
    address: string; // Bluetooth MAC address
    active: boolean; // Connection status
}

/**
 * Device Configuration
 */
export interface DeviceConfiguration {
    deviceId: string;
    name: string;
    type: DeviceType;
    capabilities: DeviceCapabilities;
    firmware: FirmwareInfo;
}

/**
 * Device Type
 */
export enum DeviceType {
    NEURO_ESTIMULATOR = 'NeuroEstimulator',
    SEMG_SENSOR = 'sEMG_Sensor',
    FES_DEVICE = 'FES_Device'
}

/**
 * Device Capabilities
 */
export interface DeviceCapabilities {
    // FES Capabilities
    fes: {
        maxAmplitude: number; // Maximum amplitude (V)
        maxFrequency: number; // Maximum frequency (Hz)
        maxPulseWidth: number; // Maximum pulse width (ms)
        minAmplitude: number;
        minFrequency: number;
        minPulseWidth: number;
    };

    // sEMG Streaming Capabilities
    streaming: {
        maxRate: number; // Maximum streaming rate (Hz)
        minRate: number; // Minimum streaming rate (Hz)
        supportedTypes: string[]; // ['raw', 'filtered', 'rms']
        bufferSize: number; // Maximum buffer size
    };

    // Sensors
    sensors: {
        hasGyroscope: boolean;
        hasAccelerometer: boolean;
        hasTemperature: boolean;
    };
}

/**
 * Firmware Information
 */
export interface FirmwareInfo {
    version: string;
    buildDate: string;
    features: string[];
}

/**
 * Device Connection Status
 */
export interface DeviceConnectionStatus {
    isConnected: boolean;
    lastSeen?: Date;
    signalStrength?: number; // RSSI
    batteryLevel?: number; // Percentage
}

/**
 * Device Calibration
 */
export interface DeviceCalibration {
    deviceId: string;
    calibrationDate: Date;
    semgBaseline: number;
    semgSensitivity: number;
    fesAmplitudeOffset: number;
    gyroscopeOffset: {
        x: number;
        y: number;
        z: number;
    };
}
