# Auto-Scroll Implementation for sEMG Chart

## Overview

Successfully implemented automatic horizontal scrolling for real-time sEMG data visualization. The chart now continuously scrolls to show the latest incoming data, providing a seamless viewing experience for continuous streaming.

## Implementation Details

### 1. SEMGChart Component Updates

**File:** `src/components/SEMGChart.tsx`

#### New Features Added:

**Auto-Scroll Prop:**
```typescript
interface SEMGChartProps {
    data: ChartDataPoint[];
    sampleRate: number;
    dataType: 'raw' | 'filtered' | 'rms';
    autoScroll?: boolean; // NEW: Enable auto-scroll (default: true)
}
```

**ScrollView Integration:**
```typescript
<ScrollView
    ref={scrollViewRef}
    horizontal
    showsHorizontalScrollIndicator={true}
    style={styles.scrollView}
    contentContainerStyle={styles.scrollContent}
>
    <LineChart
        width={chartWidth} // Dynamic width based on data length
        // ... other props
    />
</ScrollView>
```

**Auto-Scroll Effect:**
```typescript
useEffect(() => {
    if (autoScroll && data.length > previousDataLength.current && scrollViewRef.current) {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 50);
    }
    previousDataLength.current = data.length;
}, [data.length, autoScroll]);
```

#### Key Changes:

1. **Dynamic Chart Width:**
   - `chartWidth = Math.max(screenWidth - 80, data.length * spacing)`
   - Chart grows horizontally as new data arrives
   - Minimum width: screen width - 80px

2. **Fixed Spacing:**
   - `spacing = 3` pixels per sample
   - Consistent across all sample rates
   - Provides smooth scrolling experience

3. **Continuous Time Labels:**
   - Labels every 2.5 seconds
   - Relative to start time (0s, 2.5s, 5s, 7.5s, ...)
   - Dynamically calculated from data timestamps

4. **Visual Indicators:**
   - Header shows "(auto-scroll)" when enabled
   - Grid info displays sample count: "{data.length} samples displayed"
   - Auto-scroll status: "📊 Auto-scrolling to show latest data"

### 2. useStreamData Hook Updates

**File:** `src/hooks/useStreamData.ts`

#### New Parameter:

```typescript
export function useStreamData(
    streamData: StreamDataPacket[],
    sampleRate: number = 100,
    maxBufferSeconds: number = 60 // NEW: Maximum buffer duration
): ProcessedStreamData
```

#### Key Changes:

1. **Continuous Buffer:**
   - Changed from fixed 10-second window to configurable buffer
   - Default: 60 seconds of data
   - `maxSamples = sampleRate * maxBufferSeconds`

2. **Absolute Time Calculation:**
   ```typescript
   // Before (fixed 10s window):
   const timeInSeconds = index / sampleRate;

   // After (continuous scrolling):
   const baseTimestamp = flatSamples[0].timestamp;
   const absoluteTime = (sample.timestamp - baseTimestamp) / 1000;
   ```

3. **Sliding Window:**
   - Keeps last `maxSamples` in buffer
   - Older data automatically discarded
   - Maintains memory efficiency

### 3. StreamingScreen Integration

**File:** `src/screens/StreamingScreen.tsx`

#### Usage:

```typescript
<SEMGChart
    data={processed.chartData}
    sampleRate={streamConfig.rate}
    dataType={streamConfig.type}
    // autoScroll is true by default
/>
```

To disable auto-scroll (if needed):
```typescript
<SEMGChart
    data={processed.chartData}
    sampleRate={streamConfig.rate}
    dataType={streamConfig.type}
    autoScroll={false}
/>
```

## How It Works

### Data Flow:

```
1. ESP32 Device → Sends sEMG packets via Bluetooth
   ↓
2. BluetoothContext → Stores packets in streamData array
   ↓
3. useStreamData Hook → Processes packets into chart points
   - Flattens packets to individual samples
   - Applies 60-second sliding window
   - Calculates absolute time from start
   ↓
4. SEMGChart Component → Renders scrollable chart
   - Dynamic width based on sample count
   - Auto-scrolls on new data arrival
   - Fixed Y-axis: 0-1000
   ↓
5. User → Sees continuously scrolling real-time graph
```

### Auto-Scroll Logic:

1. **Trigger:** New data arrives (`data.length` increases)
2. **Detection:** `useEffect` compares current length with previous
3. **Action:** `scrollViewRef.current?.scrollToEnd({ animated: true })`
4. **Timing:** 50ms delay ensures layout is complete before scrolling
5. **Result:** Smooth animated scroll to show latest data

## Performance Optimizations

### 1. Memory Management
- **Buffer limit:** 60 seconds maximum (6000 samples at 100Hz)
- **Automatic cleanup:** Older samples automatically discarded
- **Efficient slicing:** `flatSamples.slice(-maxSamples)`

### 2. Rendering Performance
- **Data point hiding:** Points hidden when `data.length > 500`
- **Fixed spacing:** Constant 3px/sample (no recalculation)
- **Memoization:** `useMemo` for chartData and chartWidth
- **Smooth animations:** 200ms animation duration

### 3. Scroll Performance
- **Animated scrolling:** Native ScrollView with `animated: true`
- **Debounced:** Only scrolls when data length actually increases
- **Ref-based:** Direct DOM manipulation via `useRef`

## Configuration Options

### Sample Rate Examples:

**50 Hz:**
- 3000 samples in 60-second buffer
- Chart width: 3000 × 3px = 9000px
- Update frequency: 20ms per sample

**100 Hz (default):**
- 6000 samples in 60-second buffer
- Chart width: 6000 × 3px = 18000px
- Update frequency: 10ms per sample

**200 Hz:**
- 12000 samples in 60-second buffer
- Chart width: 12000 × 3px = 36000px
- Update frequency: 5ms per sample

### Adjusting Buffer Size:

To change the buffer duration, modify the hook call:

```typescript
// 30-second buffer
const processed = useStreamData(streamData, streamConfig.rate, 30);

// 120-second buffer (2 minutes)
const processed = useStreamData(streamData, streamConfig.rate, 120);
```

## Visual Features

### Chart Appearance:
- **Y-axis:** Fixed 0-1000 scale (5 divisions: 0, 200, 400, 600, 800, 1000)
- **X-axis:** Continuous time with labels every 2.5 seconds
- **Grid lines:** Horizontal and vertical for easy reading
- **Curve smoothing:** Bezier interpolation for smoother appearance
- **Area fill:** Gradient under curve (10% opacity start, 1% end)
- **Colors:** Blue (#2196F3) for signal, gray (#e0e0e0) for grid

### Scroll Indicator:
- **Horizontal scroll bar:** Always visible when chart exceeds screen width
- **Auto-scroll badge:** "(auto-scroll)" in header when enabled
- **Sample counter:** Live count of displayed samples

## Testing

### Type Checking:
```bash
npm run type-check
```
✅ **Status:** All type checks pass (no errors)

### Manual Testing Checklist:

1. **Connection:**
   - [ ] Connect to NeuroEstimulator device
   - [ ] Navigate to Streaming screen

2. **Configuration:**
   - [ ] Set sample rate (e.g., 100 Hz)
   - [ ] Select data type (raw/filtered/rms)

3. **Streaming:**
   - [ ] Start streaming
   - [ ] Verify chart displays data

4. **Auto-Scroll:**
   - [ ] Observe chart automatically scrolling right
   - [ ] Verify smooth animation
   - [ ] Check latest data is visible

5. **Manual Scroll:**
   - [ ] Scroll left to view older data
   - [ ] Auto-scroll should resume on new data arrival

6. **Performance:**
   - [ ] No lag or stuttering during streaming
   - [ ] Memory usage remains stable
   - [ ] Chart renders smoothly at high sample rates

## Troubleshooting

### Issue: Chart not scrolling

**Solution:**
- Verify `autoScroll` prop is `true` (default)
- Check that `scrollViewRef` is properly initialized
- Ensure new data is actually arriving (check console logs)

### Issue: Slow/laggy scrolling

**Solution:**
- Reduce buffer size (e.g., from 60s to 30s)
- Lower sample rate if possible
- Ensure `hideDataPoints={true}` for high-density data

### Issue: Memory usage increasing

**Solution:**
- Check `maxBufferSeconds` is not too large
- Verify old packets are being cleared in `BluetoothContext`
- Monitor `streamData` array length (should not exceed 1000 packets)

## Future Enhancements

### Potential Features:

1. **Manual Scroll Mode:**
   - Toggle button to enable/disable auto-scroll
   - Auto-scroll pauses when user manually scrolls back

2. **Zoom Controls:**
   - Pinch-to-zoom for detailed signal analysis
   - Maintain auto-scroll during zoom

3. **Time Markers:**
   - Vertical lines for trigger events
   - Annotations for session events

4. **Export Functionality:**
   - Save visible window as image
   - Export data to CSV

5. **Multiple Signals:**
   - Overlay raw + filtered signals
   - Compare current vs. previous session

## Summary

The auto-scroll implementation provides:

✅ **Real-time visualization:** Latest data always visible
✅ **Smooth scrolling:** Animated transitions for better UX
✅ **Performance:** Efficient buffer management (60s max)
✅ **Flexibility:** Configurable buffer size and auto-scroll toggle
✅ **Fixed scale:** Y-axis always 0-1000 for consistency
✅ **Type-safe:** Full TypeScript support with no errors

The chart now behaves like a continuous strip-chart recorder, ideal for monitoring sEMG signals in real-time during rehabilitation sessions.
