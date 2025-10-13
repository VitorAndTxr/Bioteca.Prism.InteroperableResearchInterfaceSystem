# Migration to react-native-gifted-charts

## Summary

Successfully migrated from `react-native-chart-kit` to `react-native-gifted-charts` for improved performance and better real-time sEMG data visualization.

## Changes Made

### 1. Dependencies Updated

**Removed:**
```json
"react-native-chart-kit": "^6.12.0"
```

**Added:**
```json
"react-native-gifted-charts": "^1.4.64",
"react-native-linear-gradient": "^2.8.3"
```

**Already present (required dependency):**
```json
"react-native-svg": "15.12.1"
```

### 2. New Component Created

**File:** `src/components/SEMGChart.tsx`

A dedicated, optimized chart component for sEMG signal visualization with:

- **Fixed Y-axis:** 0 to 1000 (constant scale)
- **Fixed X-axis:** 0 to 10 seconds
- **Performance optimizations:**
  - Automatic data point hiding for high-density data (>500 samples)
  - Smooth curved interpolation
  - 200ms animation duration for real-time updates
  - Area chart with gradient fill

- **Visual features:**
  - Grid lines (horizontal and vertical)
  - 5 Y-axis sections (0, 200, 400, 600, 800, 1000)
  - X-axis labels at: 0s, 2.5s, 5s, 7.5s, 10s
  - Sample rate indicator
  - Data type indicator (raw/filtered/rms)

- **Props:**
  - `data: ChartDataPoint[]` - Chart data points with x (time) and y (amplitude)
  - `sampleRate: number` - Current sampling rate in Hz
  - `dataType: 'raw' | 'filtered' | 'rms'` - Type of data being displayed

### 3. Updated Files

#### `src/hooks/useStreamData.ts`
- Modified to accept `sampleRate` parameter instead of `maxSamples`
- Fixed 10-second window calculation: `maxSamples = sampleRate * 10`
- Time mapping based on sample index for consistent grid alignment
- Updated `getYAxisRange()` to always return `[0, 1000]`

#### `src/screens/StreamingScreen.tsx`
- Removed `react-native-chart-kit` import
- Added `SEMGChart` component import
- Removed old chart configuration code
- Simplified chart rendering to use new `SEMGChart` component
- Removed unused chart-related styles

### 4. Performance Improvements

**Before (react-native-chart-kit):**
- SVG-based rendering
- Limited customization
- No built-in optimization for dense data
- Fixed 500-sample window regardless of sample rate

**After (react-native-gifted-charts):**
- Optimized for real-time data streaming
- Automatic data point management
- Smooth animations (200ms transitions)
- Dynamic window sizing based on actual sample rate
- Better touch responsiveness

### 5. Grid Configuration

The new chart implements a precise grid system:

**Horizontal (Time) Axis:**
- Fixed 10-second window
- Grid divisions = 10 seconds × sample rate
- Example at 100 Hz: 1000 samples displayed
- X-axis labels: 0, 2.5, 5, 7.5, 10 seconds

**Vertical (Amplitude) Axis:**
- Fixed range: 0 to 1000
- 5 sections: 0, 200, 400, 600, 800, 1000
- Consistent across all data types

**Spacing calculation:**
```typescript
spacing = (screenWidth - 80) / (sampleRate * 10)
```

This ensures the chart always displays exactly 10 seconds of data, with grid divisions matching the sample rate.

## Testing

### Type Checking
```bash
npm run type-check
```
✅ All type checks pass

### Visual Testing
To test the new chart:

1. Start the development server:
```bash
npm run android
```

2. Connect to a NeuroEstimulator device
3. Configure streaming parameters (e.g., 100 Hz, filtered)
4. Start streaming
5. Observe the chart updating in real-time with:
   - Fixed 10-second horizontal window
   - Fixed 0-1000 vertical range
   - Smooth animations
   - Clear grid lines

## Migration Benefits

1. ✅ **Better Performance:** Optimized for real-time streaming
2. ✅ **Fixed Grid System:** Consistent 10s × 1000 scale
3. ✅ **Visual Appeal:** Gradient fills, smooth curves, modern appearance
4. ✅ **Responsive:** Better touch handling and animation
5. ✅ **Maintainable:** Dedicated component with clear props interface
6. ✅ **Type Safe:** Full TypeScript support with no errors

## Potential Future Enhancements

- Add zoom controls (optional, disabled by default to maintain fixed scale)
- Export chart as image for reports
- Multiple signal overlay (compare filtered vs raw)
- Real-time statistics overlay (mean, std deviation)
- Trigger markers on the timeline
- Session event annotations

## Notes

- The chart automatically hides data points when displaying >500 samples to maintain performance
- Animation duration is set to 200ms for smooth real-time updates without lag
- The component is fully responsive and adapts to different screen sizes
- All original functionality is preserved while improving performance and visual quality
