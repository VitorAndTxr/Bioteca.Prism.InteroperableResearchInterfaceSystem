/**
 * Bluetooth Protocol Models
 *
 * Defines the JSON-based Bluetooth protocol for ESP32 sEMG/FES device communication.
 * All messages follow the format: { cd: number, mt: string, bd?: object }
 */

/**
 * Bluetooth Protocol Function Codes
 */
export enum BluetoothProtocolFunction {
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

/**
 * Bluetooth Protocol Methods
 */
export enum BluetoothProtocolMethod {
    READ = 'r',
    WRITE = 'w',
    EXECUTE = 'x',
    ACK = 'a'
}

/**
 * Bluetooth Protocol Body Property Keys
 */
export enum BluetoothProtocolBodyProperty {
    ANGLE = 'a',
    AMPLITUDE = 'a',
    FREQUENCY = 'f',
    PULSE_WIDTH = 'pw',
    DIFFICULTY = 'df',
    STIMULI_DURATION = 'pd',
    COMPLETE_STIMULI_AMOUNT = 'csa',
    INTERRUPTED_STIMULI_AMOUNT = 'isa',
    TIME_OF_LAST_TRIGGER = 'tlt',
    SESSION_DURATION = 'sd',
    MAXIMUM_SESSION_DURATION = 'm',
}

/**
 * Bluetooth Protocol Body Field Names
 */
export enum BluetoothProtocolBodyField {
    CODE = 'cd',
    METHOD = 'mt',
    BODY = 'bd'
}

/**
 * Bluetooth Protocol Payload
 */
export interface BluetoothProtocolPayload {
    cd: number; // Code
    mt: string; // Method
    bd?: BluetoothProtocolBody; // Body (optional)
}

/**
 * Bluetooth Protocol Body (generic)
 */
export interface BluetoothProtocolBody {
    // FES Parameters
    a?: number; // Amplitude in Volts (0-15V)
    f?: number; // Frequency in Hz (1-100 Hz)
    pw?: number; // Pulse width in milliseconds (1-100 ms)
    df?: number; // sEMG difficulty percentage (1-100%)
    pd?: number; // Pulse duration in seconds (1-60s)

    // Session Status
    csa?: number; // Complete stimuli amount
    isa?: number; // Interrupted stimuli amount
    tlt?: number; // Time of last trigger (ms)
    sd?: number; // Session duration (ms)
    m?: number; // Maximum session duration (ms)

    // Streaming-specific fields
    rate?: number; // Streaming rate in Hz (10-200)
    type?: string; // Streaming type: "raw", "filtered", "rms"
    t?: number; // Timestamp (milliseconds since boot)
    v?: number[]; // Array of sEMG values

    // Nested parameters
    parameters?: any; // Nested FES parameters in status messages
}

/**
 * FES Parameters Body (specific structure)
 */
export interface FESParametersBody {
    a: number; // Amplitude (V)
    f: number; // Frequency (Hz)
    pw: number; // Pulse width (ms)
    df: number; // Difficulty (%)
    pd: number; // Pulse duration (s)
}
