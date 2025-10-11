import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    Alert
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useBluetoothContext } from '@/context/BluetoothContext';
import { useStreamData, getYAxisRange } from '@/hooks/useStreamData';

interface StreamingScreenProps {
    navigation: any;
}

export function StreamingScreen({ navigation }: StreamingScreenProps) {
    const {
        neuraDevices,
        selectedDevice,
        bluetoothOn,
        connectBluetooth,
        disconnect,
        isStreaming,
        streamData,
        streamConfig,
        startStream,
        stopStream,
        clearStreamData,
        configureStream
    } = useBluetoothContext();

    // Process stream data for chart
    const processed = useStreamData(streamData, 500);

    // Auto-send configuration when device connects
    useEffect(() => {
        if (selectedDevice) {
            // Send configuration to device
            configureStream(streamConfig.rate, streamConfig.type);
        }
    }, [selectedDevice]);

    // Handle device connection
    const handleConnect = async (address: string) => {
        try {
            await connectBluetooth(address);
        } catch (error) {
            console.error('Connection error:', error);
            Alert.alert('Connection Failed', 'Could not connect to device. Please try again.');
        }
    };

    // Handle device disconnection
    const handleDisconnect = async () => {
        if (!selectedDevice) return;

        try {
            // Stop streaming if active
            if (isStreaming) {
                await stopStream();
            }
            await disconnect(selectedDevice.address);
        } catch (error) {
            console.error('Disconnection error:', error);
        }
    };

    // Handle start streaming
    const handleStartStreaming = async () => {
        if (!selectedDevice) {
            Alert.alert('No Device', 'Please connect to a device first.');
            return;
        }

        try {
            await startStream();
        } catch (error) {
            console.error('Start streaming error:', error);
            Alert.alert('Streaming Error', 'Failed to start streaming. Please try again.');
        }
    };

    // Handle stop streaming
    const handleStopStreaming = async () => {
        try {
            await stopStream();
        } catch (error) {
            console.error('Stop streaming error:', error);
        }
    };

    // Handle clear data
    const handleClearData = () => {
        Alert.alert(
            'Clear Data',
            'Are you sure you want to clear all recorded data?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => clearStreamData()
                }
            ]
        );
    };

    // Get Y-axis range for chart
    const [yMin, yMax] = getYAxisRange(
        streamConfig.type,
        processed.minValue,
        processed.maxValue
    );

    // Chart configuration
    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '0', // No dots for smooth line
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: '#e0e0e0',
        },
    };

    // Prepare chart data
    const chartData = {
        labels: processed.chartData.length > 0
            ? [
                processed.chartData[0].x.toFixed(1),
                processed.chartData[Math.floor(processed.chartData.length / 2)]?.x.toFixed(1) || '',
                processed.chartData[processed.chartData.length - 1].x.toFixed(1)
            ]
            : ['0', '5', '10'],
        datasets: [
            {
                data: processed.chartData.length > 0
                    ? processed.chartData.map(d => d.y)
                    : [0, 0, 0],
            },
        ],
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>sEMG Streaming</Text>
                <TouchableOpacity
                    style={styles.configButton}
                    onPress={() => navigation.navigate('StreamConfig')}
                >
                    <Text style={styles.configButtonText}>⚙️ Config</Text>
                </TouchableOpacity>
            </View>

            {/* Current Configuration Info */}
            <View style={styles.configInfo}>
                <Text style={styles.configInfoTitle}>Current Configuration</Text>
                <View style={styles.configInfoRow}>
                    <Text style={styles.configInfoLabel}>Rate:</Text>
                    <Text style={styles.configInfoValue}>{streamConfig.rate} Hz</Text>
                </View>
                <View style={styles.configInfoRow}>
                    <Text style={styles.configInfoLabel}>Type:</Text>
                    <Text style={styles.configInfoValue}>
                        {streamConfig.type === 'raw' ? 'Raw ADC' :
                         streamConfig.type === 'filtered' ? 'Filtered' :
                         'RMS Envelope'}
                    </Text>
                </View>
            </View>

            {/* Device Connection Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Device Connection</Text>

                {!bluetoothOn && (
                    <View style={styles.alertBox}>
                        <Text style={styles.alertText}>
                            ⚠️ Bluetooth is off. Please enable Bluetooth in your device settings.
                        </Text>
                    </View>
                )}

                {selectedDevice ? (
                    <View style={styles.connectedDevice}>
                        <View style={styles.deviceInfo}>
                            <Text style={styles.deviceName}>{selectedDevice.name}</Text>
                            <Text style={styles.deviceAddress}>{selectedDevice.address}</Text>
                            <View style={styles.connectedBadge}>
                                <View style={styles.connectedDot} />
                                <Text style={styles.connectedText}>Connected</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.disconnectButton}
                            onPress={handleDisconnect}
                        >
                            <Text style={styles.disconnectButtonText}>Disconnect</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {neuraDevices.length === 0 ? (
                            <View style={styles.noDevicesBox}>
                                <Text style={styles.noDevicesText}>
                                    No paired NeuroEstimulator devices found.
                                    {'\n\n'}
                                    Please pair your device in Bluetooth settings first.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={neuraDevices}
                                keyExtractor={(item) => item.address}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.deviceItem}
                                        onPress={() => handleConnect(item.address)}
                                    >
                                        <View style={styles.deviceItemInfo}>
                                            <Text style={styles.deviceItemName}>{item.name}</Text>
                                            <Text style={styles.deviceItemAddress}>{item.address}</Text>
                                        </View>
                                        <Text style={styles.connectArrow}>›</Text>
                                    </TouchableOpacity>
                                )}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                )}
            </View>

            {/* Signal Chart Section */}
            {selectedDevice && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Signal Visualization</Text>

                    {processed.chartData.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <LineChart
                                data={chartData}
                                width={screenWidth - 60}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                                fromZero={streamConfig.type === 'raw' || streamConfig.type === 'rms'}
                                yAxisSuffix=""
                                yAxisInterval={1}
                            />
                            <View style={styles.chartLabels}>
                                <Text style={styles.chartLabel}>Time (seconds)</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.noDataBox}>
                            <Text style={styles.noDataText}>
                                {isStreaming
                                    ? '⏳ Waiting for data packets...'
                                    : '📊 Start streaming to see signal data'}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Stream Controls */}
            {selectedDevice && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stream Controls</Text>

                    <View style={styles.controlButtons}>
                        {!isStreaming ? (
                            <TouchableOpacity
                                style={[styles.controlButton, styles.startButton]}
                                onPress={handleStartStreaming}
                            >
                                <Text style={styles.controlButtonText}>▶ Start Streaming</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.controlButton, styles.stopButton]}
                                onPress={handleStopStreaming}
                            >
                                <Text style={styles.controlButtonText}>⏸ Stop Streaming</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.controlButton, styles.clearButton]}
                            onPress={handleClearData}
                            disabled={processed.totalSamples === 0}
                        >
                            <Text style={[
                                styles.controlButtonText,
                                processed.totalSamples === 0 && styles.controlButtonTextDisabled
                            ]}>
                                🗑️ Clear Data
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Statistics Section */}
            {selectedDevice && processed.totalSamples > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Statistics</Text>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Packets</Text>
                            <Text style={styles.statValue}>{streamData.length}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Samples</Text>
                            <Text style={styles.statValue}>{processed.totalSamples}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Duration</Text>
                            <Text style={styles.statValue}>{processed.duration.toFixed(1)}s</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Min Value</Text>
                            <Text style={styles.statValue}>{processed.minValue.toFixed(1)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Max Value</Text>
                            <Text style={styles.statValue}>{processed.maxValue.toFixed(1)}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Avg Value</Text>
                            <Text style={styles.statValue}>{processed.avgValue.toFixed(1)}</Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    configButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    configButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    configInfo: {
        backgroundColor: '#e3f2fd',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    configInfoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976D2',
        marginBottom: 8,
    },
    configInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    configInfoLabel: {
        fontSize: 13,
        color: '#666',
    },
    configInfoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    alertBox: {
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ffca28',
    },
    alertText: {
        fontSize: 14,
        color: '#856404',
    },
    connectedDevice: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    deviceAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    connectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    connectedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    connectedText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
    },
    disconnectButton: {
        backgroundColor: '#f44336',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    disconnectButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    noDevicesBox: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        alignItems: 'center',
    },
    noDevicesText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    deviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    deviceItemInfo: {
        flex: 1,
    },
    deviceItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    deviceItemAddress: {
        fontSize: 12,
        color: '#666',
    },
    connectArrow: {
        fontSize: 24,
        color: '#2196F3',
        marginLeft: 12,
    },
    chartContainer: {
        alignItems: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    chartLabels: {
        marginTop: 8,
    },
    chartLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    noDataBox: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    noDataText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    controlButtons: {
        gap: 12,
    },
    controlButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#4CAF50',
    },
    stopButton: {
        backgroundColor: '#ff9800',
    },
    clearButton: {
        backgroundColor: '#f44336',
    },
    controlButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    controlButtonTextDisabled: {
        opacity: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statItem: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2196F3',
    },
});
