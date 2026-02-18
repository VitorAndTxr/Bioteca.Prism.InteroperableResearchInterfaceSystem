import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ChartDataPoint, StreamType, CHART_WINDOW_SECONDS, CHART_DISPLAY_RATE_HZ } from '@iris/domain';

interface SEMGChartProps {
    data: ChartDataPoint[];
    sampleRate: number;
    dataType: StreamType;
    darkTheme?: boolean;
}

/**
 * Optimized sEMG Chart Component using react-native-gifted-charts.
 *
 * Features:
 * - Fixed Y-axis: -3000 to +3000 (zero-centered, constant scale)
 * - Fixed 4-second viewport (no horizontal scrolling)
 * - 160 data points displayed (4s at 40 Hz display rate)
 * - Updates at 1 Hz cadence (driven by useStreamData)
 * - High performance for real-time streaming
 */
export const SEMGChart = React.memo(function SEMGChart({ data, sampleRate, dataType, darkTheme = false }: SEMGChartProps) {
    const screenWidth = Dimensions.get('window').width;
    const availableWidth = screenWidth - 80; // account for y-axis labels and padding

    // Transform data to gifted-charts format
    const chartData = useMemo(() => {
        if (data.length === 0) {
            return [
                { value: 0, label: '0' },
                { value: 3000, label: '' },
                { value: 0, label: '4' }
            ];
        }

        const startTime = data[0].x;

        return data.map((point) => {
            const relativeTime = point.x - startTime;
            let label = '';

            // Add labels at 1-second intervals
            const rounded = Math.round(relativeTime);
            if (Math.abs(relativeTime - rounded) < 0.05) {
                label = rounded.toFixed(0);
            }

            return {
                value: point.y,
                label,
                labelTextStyle: { color: '#666', fontSize: 10 }
            };
        });
    }, [data]);

    // Dynamic spacing so all data points fill the full available width
    const spacing = useMemo(() => {
        return availableWidth / Math.max(data.length - 1, 1);
    }, [data.length, availableWidth]);

    const containerStyle = darkTheme ? [styles.container, styles.containerDark] : styles.container;
    const headerTextStyle = darkTheme ? [styles.headerText, styles.textDark] : styles.headerText;
    const subHeaderTextStyle = darkTheme ? [styles.subHeaderText, styles.textMutedDark] : styles.subHeaderText;

    return (
        <View style={containerStyle}>
            {/* Chart Header */}
            <View style={styles.header}>
                <Text style={headerTextStyle}>
                    sEMG Signal - {dataType === 'raw' ? 'Raw ADC' : dataType === 'filtered' ? 'Filtered' : 'RMS Envelope'}
                </Text>
                <Text style={subHeaderTextStyle}>
                    {sampleRate} Hz | Last {CHART_WINDOW_SECONDS}s window | {CHART_DISPLAY_RATE_HZ} Hz display
                </Text>
            </View>

            {/* Fixed viewport chart — no horizontal scroll */}
            <View style={styles.chartContainer}>
                <LineChart
                    data={chartData}
                    width={availableWidth}
                    height={125}
                    maxValue={3000}
                    mostNegativeValue={-3000}
                    noOfSections={6}
                    spacing={spacing}
                    thickness={darkTheme ? 2 : 1}
                    color={darkTheme ? "#49A2A8" : "#2196F3"}
                    curved={false}
                    rulesType="solid"
                    rulesColor={darkTheme ? "#374151" : "#e0e0e0"}
                    showVerticalLines={false}
                    verticalLinesColor={darkTheme ? "#4B5563" : "#f0f0f0"}
                    yAxisColor={darkTheme ? "#6B7280" : "#999"}
                    yAxisThickness={1}
                    yAxisTextStyle={{ color: darkTheme ? '#9CA3AF' : '#666', fontSize: 11 }}
                    yAxisLabelWidth={40}
                    xAxisColor={darkTheme ? "#49A2A8" : "#FF0000"}
                    xAxisThickness={darkTheme ? 1 : 2}
                    animateOnDataChange={false}
                    hideDataPoints={true}
                    areaChart={false}
                    isAnimated={false}
                    startOpacity={1}
                    endOpacity={1}
                />
            </View>

            {/* Axis Labels */}
            <View style={styles.axisLabels}>
                <Text style={darkTheme ? [styles.xAxisLabel, styles.textMutedDark] : styles.xAxisLabel}>Time (seconds)</Text>
                <Text style={darkTheme ? [styles.yAxisLabel, styles.textMutedDark] : styles.yAxisLabel}>Amplitude (-3000 to +3000, zero-centered)</Text>
            </View>

            {/* Grid Info */}
            <View style={styles.gridInfo}>
                <Text style={darkTheme ? [styles.gridInfoText, styles.textMutedDark] : styles.gridInfoText}>
                    {(1 / sampleRate * 1000).toFixed(1)}ms per sample | {data.length} points displayed
                </Text>
            </View>
        </View>
    );
});

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
    containerDark: {
        backgroundColor: '#252538',
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
    chartContainer: {
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
    textDark: {
        color: '#FFFFFF',
    },
    textMutedDark: {
        color: '#9CA3AF',
    },
});
