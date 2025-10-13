import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useBluetoothContext } from '@/context/BluetoothContext';
import { StreamType } from '@iris/domain';

// Navigation props (will be provided by React Navigation)
interface StreamConfigScreenProps {
    navigation: any;
}

// Sampling rate presets
const SAMPLING_RATES = [10, 30, 50, 100, 200];

// Data type options with descriptions
const DATA_TYPES: { value: StreamType; label: string; description: string }[] = [
    {
        value: 'raw',
        label: 'Raw ADC',
        description: 'Unprocessed 12-bit ADC values (0-4095). Full bandwidth signal.'
    },
    {
        value: 'filtered',
        label: 'Filtered',
        description: 'Butterworth bandpass (10-40 Hz). Removes noise and artifacts.'
    },
    {
        value: 'rms',
        label: 'RMS Envelope',
        description: 'Root Mean Square envelope. Smooth muscle activation indicator.'
    }
];

export function StreamConfigScreen({ navigation }: StreamConfigScreenProps) {
    const { streamConfig, configureStream } = useBluetoothContext();

    // Local state for configuration
    const [selectedRate, setSelectedRate] = useState<number>(streamConfig.rate);
    const [selectedType, setSelectedType] = useState<StreamType>(streamConfig.type);

    // Check if configuration requires high-speed Bluetooth (115200 baud)
    const requiresHighSpeed = selectedRate > 30;

    // Warning message for high sampling rates
    const getWarningMessage = (): string | null => {
        if (selectedRate <= 30) return null;

        if (selectedRate <= 50) {
            return '⚠️ Sampling rates above 30 Hz may require Bluetooth module upgrade to 115200 baud. ' +
                   'With default 9600 baud, data loss may occur.';
        }

        return '⚠️ Sampling rates above 50 Hz REQUIRE Bluetooth module upgrade to 115200 baud. ' +
               'Default 9600 baud WILL cause significant data loss. Ensure your device firmware ' +
               'has been configured for high-speed communication.';
    };

    const handleSave = async () => {
        try {
            // Save configuration to BluetoothContext
            await configureStream(selectedRate, selectedType);

            // Navigate to streaming screen
            navigation.navigate('Streaming');

        } catch (error) {
            console.error('Error saving stream configuration:', error);
            Alert.alert(
                'Configuration Error',
                'Failed to save streaming configuration. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const warningMessage = getWarningMessage();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Configure sEMG Streaming</Text>
                    <Text style={styles.subtitle}>
                        Set up parameters before connecting to device
                    </Text>
                </View>

                {/* Sampling Rate Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sampling Rate</Text>
                    <Text style={styles.sectionDescription}>
                        Higher rates provide more detail but require more bandwidth
                    </Text>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedRate}
                            onValueChange={(value) => setSelectedRate(value)}
                            style={styles.picker}
                        >
                            {SAMPLING_RATES.map(rate => (
                                <Picker.Item
                                    key={rate}
                                    label={`${rate} Hz${rate === 30 ? ' (Recommended)' : ''}`}
                                    value={rate}
                                />
                            ))}
                        </Picker>
                    </View>

                    {/* Baud Rate Warning */}
                    {warningMessage && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>{warningMessage}</Text>
                        </View>
                    )}
                </View>

                {/* Data Type Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Type</Text>
                    <Text style={styles.sectionDescription}>
                        Choose signal processing method
                    </Text>

                    {DATA_TYPES.map(type => (
                        <TouchableOpacity
                            key={type.value}
                            style={[
                                styles.radioOption,
                                selectedType === type.value && styles.radioOptionSelected
                            ]}
                            onPress={() => setSelectedType(type.value)}
                        >
                            <View style={styles.radioButton}>
                                {selectedType === type.value && (
                                    <View style={styles.radioButtonInner} />
                                )}
                            </View>
                            <View style={styles.radioContent}>
                                <Text style={[
                                    styles.radioLabel,
                                    selectedType === type.value && styles.radioLabelSelected
                                ]}>
                                    {type.label}
                                </Text>
                                <Text style={styles.radioDescription}>
                                    {type.description}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Configuration Summary */}
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>Configuration Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Sampling Rate:</Text>
                        <Text style={styles.summaryValue}>{selectedRate} Hz</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Data Type:</Text>
                        <Text style={styles.summaryValue}>
                            {DATA_TYPES.find(t => t.value === selectedType)?.label}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Bluetooth Speed:</Text>
                        <Text style={[
                            styles.summaryValue,
                            requiresHighSpeed && styles.summaryValueWarning
                        ]}>
                            {requiresHighSpeed ? '115200 baud (High-speed)' : '9600 baud (Standard)'}
                        </Text>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save & Continue</Text>
                </TouchableOpacity>

                {/* Info Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        These settings will be sent to the device after connection.
                        You can change them later by returning to this screen.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    warningBox: {
        backgroundColor: '#fff3cd',
        borderLeftWidth: 4,
        borderLeftColor: '#ffca28',
        padding: 12,
        marginTop: 16,
        borderRadius: 4,
    },
    warningText: {
        fontSize: 13,
        color: '#856404',
        lineHeight: 18,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 12,
    },
    radioOptionSelected: {
        borderColor: '#2196F3',
        backgroundColor: '#e3f2fd',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2196F3',
    },
    radioContent: {
        flex: 1,
    },
    radioLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    radioLabelSelected: {
        color: '#2196F3',
    },
    radioDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    summaryBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2196F3',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#666',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    summaryValueWarning: {
        color: '#f57c00',
    },
    saveButton: {
        backgroundColor: '#2196F3',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 20,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    footer: {
        paddingHorizontal: 16,
        marginBottom: 40,
    },
    footerText: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        lineHeight: 18,
    },
});
