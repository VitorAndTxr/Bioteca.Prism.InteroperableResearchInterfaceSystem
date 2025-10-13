import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ChartDataPoint, StreamType } from '@iris/domain';

interface SEMGChartProps {
    data: ChartDataPoint[];
    sampleRate: number;
    dataType: StreamType;
    autoScroll?: boolean; // Enable auto-scroll for new data
}

/**
 * Optimized sEMG Chart Component using react-native-gifted-charts
 *
 * Features:
 * - Fixed Y-axis: 0 to 1000 (constant scale)
 * - Auto-scroll for continuous real-time data
 * - Grid divisions based on sample rate
 * - High performance for real-time streaming
 */
export function SEMGChart({ data, sampleRate, dataType, autoScroll = true }: SEMGChartProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const previousDataLength = useRef(0);
    const screenWidth = Dimensions.get('window').width;

    // Auto-scroll effect when new data arrives
    useEffect(() => {
        if (autoScroll && data.length > previousDataLength.current && scrollViewRef.current) {
            // Small delay to ensure layout is complete
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 50);
        }
        previousDataLength.current = data.length;
    }, [data.length, autoScroll]);

    // Transform data to gifted-charts format
    const chartData = useMemo(() => {
        if (data.length === 0) {
            // Return empty array with placeholder points at boundaries
            return [
                { value: 0, label: '0' },
                { value: 500, label: '' },
                { value: 0, label: '10' }
            ];
        }

        // Map data points to gifted-charts format
        // For continuous scrolling, we need to show relative time
        const startTime = data[0].x;

        return data.map((point, index) => {
            const relativeTime = point.x - startTime;
            let label = '';

            // Add labels every 2.5 seconds
            const roundedTime = Math.round(relativeTime * 2) / 2; // Round to nearest 0.5s
            if (Math.abs(relativeTime - roundedTime) < 0.1 && roundedTime % 2.5 === 0) {
                label = roundedTime.toFixed(1);
            }

            return {
                value: point.y,
                label: label,
                labelTextStyle: { color: '#666', fontSize: 10 }
            };
        });
    }, [data]);

    // Calculate optimal spacing for continuous scrolling
    const spacing = useMemo(() => {
        if (data.length === 0) return 3;
        // Fixed spacing per sample for consistent scrolling
        // This allows the chart to grow horizontally as data arrives
        return 3; // 3 pixels per sample provides good resolution
    }, []);

    // Calculate total chart width for scrolling
    const chartWidth = useMemo(() => {
        return Math.max(screenWidth - 80, data.length * spacing);
    }, [data.length, spacing, screenWidth]);

    return (
        <View style={styles.container}>
            {/* Chart Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    sEMG Signal - {dataType === 'raw' ? 'Raw ADC' : dataType === 'filtered' ? 'Filtered' : 'RMS Envelope'}
                </Text>
                <Text style={styles.subHeaderText}>
                    {sampleRate} Hz | Continuous streaming {autoScroll ? '(auto-scroll)' : ''}
                </Text>
            </View>

            {/* Chart with Horizontal Scroll */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={true}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <LineChart
                    data={chartData}
                    width={chartWidth}
                    height={250}
                    maxValue={1000}
                    noOfSections={5}
                    spacing={spacing}
                    thickness={2}
                    color="#2196F3"
                    curved
                    rulesType="solid"
                    rulesColor="#e0e0e0"
                    showVerticalLines
                    verticalLinesColor="#f0f0f0"
                    yAxisColor="#999"
                    yAxisThickness={1}
                    yAxisTextStyle={{ color: '#666', fontSize: 11 }}
                    yAxisLabelWidth={40}
                    xAxisColor="#999"
                    xAxisThickness={1}
                    animateOnDataChange
                    animationDuration={200}
                    hideDataPoints={data.length > 500}
                    dataPointsColor="#2196F3"
                    dataPointsRadius={2}
                    areaChart
                    startFillColor="#2196F3"
                    startOpacity={0.1}
                    endFillColor="#2196F3"
                    endOpacity={0.01}
                />
            </ScrollView>

            {/* Axis Labels */}
            <View style={styles.axisLabels}>
                <Text style={styles.xAxisLabel}>Time (seconds)</Text>
                <Text style={styles.yAxisLabel}>Amplitude (0 - 1000 fixed)</Text>
            </View>

            {/* Grid Info */}
            <View style={styles.gridInfo}>
                <Text style={styles.gridInfoText}>
                    Grid: {(1 / sampleRate * 1000).toFixed(1)}ms per sample | {data.length} samples displayed
                </Text>
                {autoScroll && (
                    <Text style={styles.gridInfoText}>
                        📊 Auto-scrolling to show latest data
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        marginBottom: 12,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    subHeaderText: {
        fontSize: 12,
        color: '#666',
    },
    scrollView: {
        maxHeight: 280,
    },
    scrollContent: {
        paddingVertical: 8,
    },
    axisLabels: {
        marginTop: 8,
        alignItems: 'center',
    },
    xAxisLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    yAxisLabel: {
        fontSize: 11,
        color: '#999',
        marginTop: 4,
    },
    gridInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
    },
    gridInfoText: {
        fontSize: 10,
        color: '#999',
        fontStyle: 'italic',
    },
});
