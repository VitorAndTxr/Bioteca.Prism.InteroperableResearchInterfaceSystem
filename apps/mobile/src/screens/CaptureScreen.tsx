/**
 * Capture Screen
 *
 * Real-time sEMG data capture with dark theme visualization.
 * Features recording timer, live chart, metrics panel, and save functionality.
 *
 * Key Features:
 * - Dark theme (full-screen, no tab bar)
 * - Red pulsing recording indicator
 * - Real-time waveform chart with ±3000µV range
 * - Three metric cards (RMS, Frequency, Signal Quality)
 * - Stop recording with save modal
 * - Simulation mode when no device connected
 */

import React, { FC, useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import * as FileSystem from 'expo-file-system';
import { useBluetoothContext } from '@/context/BluetoothContext';
import { useSession } from '@/context/SessionContext';
import { SEMGChart } from '@/components/SEMGChart';
import { SavingModal } from '@/components/SavingModal';
import { useStreamData } from '@/hooks/useStreamData';
import { useRecordingTimer } from '@/hooks/useRecordingTimer';
import type { StreamDataPacket, ChartDataPoint, NewRecordingData } from '@iris/domain';
import { DEVICE_SAMPLE_RATE_HZ, SIMULATION_SAMPLE_RATE_HZ } from '@iris/domain';
import { Square, Activity, Zap, Signal } from 'lucide-react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'Capture'>;

const DARK_BG = '#1A1A2E';
const DARK_CARD_BG = '#252538';
const TEAL_LINE = '#49A2A8';
const RED_INDICATOR = '#EF4444';

export const CaptureScreen: FC<Props> = ({ route, navigation }) => {
  const { sessionId } = route.params;
  const { selectedDevice, streamData, streamConfig, startStream, stopStream, isStreaming, startRecording, stopRecording: stopBtRecording, clearStreamData, waitForStreamActive } =
    useBluetoothContext();
  const { addRecording } = useSession();
  const { elapsedSeconds, formattedTime } = useRecordingTimer();
  const processedData = useStreamData(streamData, DEVICE_SAMPLE_RATE_HZ);

  // Saving modal state
  const [savingModalVisible, setSavingModalVisible] = useState(false);
  const [savingStatus, setSavingStatus] = useState<'saving' | 'success' | 'error'>('saving');
  const [savingError, setSavingError] = useState<string | undefined>(undefined);

  // Simulation mode
  const [simulationData, setSimulationData] = useState<StreamDataPacket[]>([]);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process simulation data at top level (cannot call hooks conditionally)
  const simulationProcessedData = useStreamData(simulationData, SIMULATION_SAMPLE_RATE_HZ);

  // Pulsing animation for recording indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulsing animation on mount
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

  // Start streaming on mount
  useEffect(() => {
    const initializeStreaming = async () => {
      if (selectedDevice) {
        // Wipe any leftover data from previous recording session
        clearStreamData();

        console.log('[CaptureScreen] Starting stream...');
        await startStream();

        // Wait for the device to confirm streaming (first binary packet)
        const active = await waitForStreamActive(5000);
        if (!active) {
          console.warn('[CaptureScreen] Stream did not activate within 5s');
        }

        console.log('[CaptureScreen] Stream active, starting recording...');
        await startRecording(sessionId);
      } else {
        console.log('[CaptureScreen] No device connected, entering simulation mode');
        startSimulation();
      }
    };

    initializeStreaming();

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };
  }, []);

  // Simulation mode: generate sinusoidal mock data
  const startSimulation = () => {
    let sampleIndex = 0;
    const baseTimestamp = Date.now();

    simulationIntervalRef.current = setInterval(() => {
      const timestamp = Date.now() - baseTimestamp;
      const values: number[] = [];

      for (let i = 0; i < 5; i++) {
        const t = sampleIndex / 50; // 50Hz base frequency
        const sine = 300 * Math.sin(2 * Math.PI * t);
        const noise = (Math.random() - 0.5) * 50;
        values.push(sine + noise);
        sampleIndex++;
      }

      const packet: StreamDataPacket = {
        timestamp,
        values,
      };

      setSimulationData((prev) => {
        const updated = [...prev, packet];
        if (updated.length > 500) {
          return updated.slice(-500);
        }
        return updated;
      });
    }, 100); // 10 packets per second
  };

  // Calculate metrics from processed data
  const calculateMetrics = useCallback(() => {
    const dataSource = selectedDevice ? processedData : simulationProcessedData;

    if (dataSource.chartData.length === 0) {
      return {
        rms: 0,
        frequency: selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ,
        signalQuality: 1,
      };
    }

    // RMS calculation
    const values = dataSource.chartData.map((point: ChartDataPoint) => point.y);
    const squaredSum = values.reduce((sum: number, val: number) => sum + val * val, 0);
    const rms = Math.sqrt(squaredSum / values.length);

    // Standard deviation for signal quality
    const mean = dataSource.avgValue;
    const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Signal quality: 1-3 dots based on stdDev
    let signalQuality = 1;
    if (stdDev < 100) {
      signalQuality = 3;
    } else if (stdDev < 200) {
      signalQuality = 2;
    }

    return {
      rms: Math.abs(rms),
      frequency: selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ,
      signalQuality,
    };
  }, [processedData, simulationProcessedData, selectedDevice]);

  const metrics = calculateMetrics();

  // Stop recording and save
  const handleStopRecording = useCallback(async () => {
    console.log('[CaptureScreen] Stopping recording...');

    // Stop streaming — send StopStream whenever a device is connected, regardless
    // of the isStreaming flag (which may be false if no JSON ACK was received yet).
    if (selectedDevice) {
      await stopStream();
      // Allow trailing BT packets to arrive and be decoded before final flush.
      // 500ms covers worst-case SPP latency for in-flight binary frames.
      await new Promise(resolve => setTimeout(resolve, 500));
    } else if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    // Show saving modal
    setSavingModalVisible(true);
    setSavingStatus('saving');
    setSavingError(undefined);

    try {
      let filePath: string;
      let totalSamples: number;
      const sampleRate = selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ;

      if (selectedDevice) {
        // Incremental CSV already written to disk by BluetoothContext
        const result = await stopBtRecording();
        filePath = result.filePath;
        totalSamples = result.sampleCount;
      } else {
        // Simulation mode: bulk export (unchanged path)
        const csvContent = createSimulationCSVContent(simulationData, sampleRate);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `recording_${timestamp}.csv`;
        filePath = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(filePath, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        totalSamples = simulationData.reduce((sum, p) => sum + p.values.length, 0);
      }

      const filename = filePath.split('/').pop() || 'recording.csv';

      // Create recording entity
      const recordingData: NewRecordingData = {
        sessionId,
        filename,
        durationSeconds: elapsedSeconds,
        sampleCount: totalSamples,
        dataType: selectedDevice ? streamConfig.type : 'filtered',
        sampleRate,
        filePath,
      };

      await addRecording(recordingData);

      // Clean chart memory now that data is persisted
      clearStreamData();

      // Show success
      setSavingStatus('success');

      // Navigate back after 1 second
      setTimeout(() => {
        setSavingModalVisible(false);
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('[CaptureScreen] Save failed:', error);
      setSavingStatus('error');
      setSavingError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [
    selectedDevice,
    stopStream,
    stopBtRecording,
    clearStreamData,
    simulationData,
    sessionId,
    elapsedSeconds,
    streamConfig.type,
    addRecording,
    navigation,
  ]);

  // Retry save
  const handleRetrySave = useCallback(() => {
    handleStopRecording();
  }, [handleStopRecording]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={DARK_BG} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
            <Text style={styles.recordingLabel}>Recording</Text>
            {!selectedDevice && (
              <View style={styles.simulationBadge}>
                <Text style={styles.simulationText}>Simulation</Text>
              </View>
            )}
          </View>
          <Text style={styles.timer}>{formattedTime}</Text>
        </View>

        {/* Chart Area */}
        <View style={styles.chartArea}>
          <SEMGChart
            data={selectedDevice ? processedData.chartData : simulationProcessedData.chartData}
            sampleRate={selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ}
            dataType={selectedDevice ? streamConfig.type : 'filtered'}
            darkTheme={true}
          />
        </View>

        {/* Metrics Panel */}
        <View style={styles.metricsPanel}>
          <View style={styles.metricsGrid}>
            {/* RMS Card */}
            <View style={styles.metricCard}>
              <Activity size={20} color={TEAL_LINE} />
              <Text style={styles.metricLabel}>RMS</Text>
              <Text style={styles.metricValue}>{metrics.rms.toFixed(0)}</Text>
              <Text style={styles.metricUnit}>µV</Text>
            </View>

            {/* Frequency Card */}
            <View style={styles.metricCard}>
              <Zap size={20} color={TEAL_LINE} />
              <Text style={styles.metricLabel}>Frequency</Text>
              <Text style={styles.metricValue}>{metrics.frequency}</Text>
              <Text style={styles.metricUnit}>Hz</Text>
            </View>

            {/* Signal Quality Card */}
            <View style={styles.metricCard}>
              <Signal size={20} color={TEAL_LINE} />
              <Text style={styles.metricLabel}>Signal Quality</Text>
              <View style={styles.signalQualityDots}>
                {[1, 2, 3].map((dotIndex) => (
                  <View
                    key={dotIndex}
                    style={[
                      styles.qualityDot,
                      dotIndex <= metrics.signalQuality && styles.qualityDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Stop Recording Button */}
          <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Square size={20} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.stopButtonText}>Stop Recording</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Saving Modal */}
      <SavingModal
        visible={savingModalVisible}
        status={savingStatus}
        errorMessage={savingError}
        onRetry={handleRetrySave}
      />
    </>
  );
};

function createSimulationCSVContent(packets: StreamDataPacket[], sampleRate: number): string {
  const intervalMs = 1000 / sampleRate;
  const lines: string[] = ['timestamp,value'];

  for (const packet of packets) {
    for (let i = 0; i < packet.values.length; i++) {
      const sampleTimestamp = packet.timestamp + (i * intervalMs);
      lines.push(`${sampleTimestamp.toFixed(2)},${packet.values[i]}`);
    }
  }

  return lines.join('\n') + '\n';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: DARK_CARD_BG,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: RED_INDICATOR,
  },
  recordingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  simulationBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  simulationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  chartArea: {
    flex: 1,
    padding: 16,
    backgroundColor: DARK_BG,
  },
  metricsPanel: {
    backgroundColor: DARK_CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: DARK_BG,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  signalQualityDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
  qualityDotActive: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: RED_INDICATOR,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: RED_INDICATOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
