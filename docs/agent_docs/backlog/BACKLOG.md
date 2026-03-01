<!-- AGENT NOTICE: This file is auto-generated and for HUMAN reading only.
     DO NOT read this file to query backlog data. Use the backlog_manager.py script instead:
     - Overview: python {script} stats {backlog_path}
     - List:     python {script} list {backlog_path} --format summary
     - Detail:   python {script} get {backlog_path} --id US-XXX
     Reading this file wastes context tokens and may contain stale data. -->

# Product Backlog

> Auto-generated from `backlog.json` — 2026-03-01 18:54 UTC

## Summary

| Status | Count |
|--------|-------|
| Ready | 20 |
| In Review | 7 |
| Done | 12 |
| **Total** | **39** |

## User Stories

### Feature Area: WA1: Domain Constants

#### US-001: Add fixed device sample rate constant to @iris/domain

**Priority:** Must | **Status:** Ready

> As a *developer*, I want *a DEVICE_SAMPLE_RATE_HZ constant exported from @iris/domain*, so that *all mobile app modules reference a single authoritative 215 Hz value instead of scattered literals*.

**Acceptance Criteria:**

- **AC1:** Given *the developer imports from @iris/domain*, when *referencing the sample rate constant*, then *DEVICE_SAMPLE_RATE_HZ equals 215 and is typed as a number*
- **AC2:** Given *the developer imports from @iris/domain*, when *referencing the chart display rate*, then *CHART_DISPLAY_RATE_HZ equals 40 and is typed as a number*
- **AC3:** Given *packages/domain/src/index.ts barrel file*, when *the file is inspected*, then *both DEVICE_SAMPLE_RATE_HZ and CHART_DISPLAY_RATE_HZ are re-exported*
- **AC4:** Given *npm run type-check:all is executed*, when *checking packages/domain*, then *zero new TypeScript strict-mode errors are reported*
- **AC5:** Given *the constant names are reviewed*, when *checking naming convention*, then *they follow UPPER_SNAKE_CASE as required by project style*

---

### Feature Area: WA2: BluetoothContext Rate Fix

#### US-002: Fix BluetoothContext default stream rate to 215 Hz for real-device path

**Priority:** Must | **Status:** Ready

> As a *researcher*, I want *the app to use 215 Hz as the default stream sample rate when connected to the real device*, so that *CSV timestamps and recording metadata reflect the actual ESP32 hardware rate, ensuring clinical data accuracy*.

**Acceptance Criteria:**

- **AC1:** Given *the mobile app initialises BluetoothContext*, when *no explicit configureStream call has been made*, then *streamConfig.rate is 215 (DEVICE_SAMPLE_RATE_HZ), not 100*
- **AC2:** Given *the developer reads BluetoothContext source*, when *locating rate references in startStream() and stopStream()*, then *they reference DEVICE_SAMPLE_RATE_HZ constant, not a numeric literal*
- **AC3:** Given *the app is running in simulation mode without a BT device*, when *streaming is started*, then *simulation mode uses its own independent 50 Hz rate unchanged*
- **AC4:** Given *existing consumers of BluetoothContext*, when *the change is applied*, then *all public API methods (connect, disconnect, configureStream, etc.) retain the same signatures*
- **AC5:** Given *npm run type-check:all is executed*, when *checking BluetoothContext.tsx*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-001

---

### Feature Area: WA3: StreamConfigScreen Simplification

#### US-003: Make StreamConfigScreen sampling rate read-only (215 Hz fixed)

**Priority:** Must | **Status:** Ready

> As a *researcher*, I want *the stream configuration screen to show 215 Hz as a non-editable fixed value*, so that *users cannot accidentally override the hardware rate, preventing misconfigured recordings*.

**Acceptance Criteria:**

- **AC1:** Given *a user opens StreamConfigScreen*, when *the screen renders*, then *the sample rate field shows 215 Hz and cannot be edited (picker removed or input is read-only)*
- **AC2:** Given *a user opens StreamConfigScreen*, when *interacting with the data type selector*, then *it remains fully functional and can be changed normally*
- **AC3:** Given *the summary section of StreamConfigScreen*, when *rendered*, then *it displays 215 Hz as the configured rate*
- **AC4:** Given *any user interaction on the rate field*, when *attempted*, then *no change is possible â€” the field is non-interactive*
- **AC5:** Given *npm run type-check:all is executed*, when *checking StreamConfigScreen.tsx*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-001

---

### Feature Area: WA4: CaptureScreen CSV & Recording Fix

#### US-004: Fix CaptureScreen CSV timestamp interpolation to use 215 Hz constant

**Priority:** Must | **Status:** Ready

> As a *researcher*, I want *recording CSV files to use correct 215 Hz inter-sample timestamps*, so that *the time axis in exported CSVs is clinically accurate, and blob-uploaded recordings contain valid signal data*.

**Acceptance Criteria:**

- **AC1:** Given *a recording is captured from the real ESP32 device*, when *createCSVContent() runs*, then *inter-sample timestamps use DEVICE_SAMPLE_RATE_HZ (215 Hz) â€” interval = 1000/215 ms*
- **AC2:** Given *the app is in simulation mode*, when *createCSVContent() runs*, then *inter-sample timestamps use 50 Hz â€” interval = 1000/50 ms*
- **AC3:** Given *a real-device recording entity is created*, when *NewRecordingData.sampleRate is set*, then *it equals DEVICE_SAMPLE_RATE_HZ (215)*
- **AC4:** Given *a simulation-mode recording entity is created*, when *NewRecordingData.sampleRate is set*, then *it equals 50*
- **AC5:** Given *an exported CSV file from a real-device session*, when *opened in a spreadsheet*, then *timestamp column increments by ~4.65 ms per row (1000/215)*
- **AC6:** Given *npm run type-check:all is executed*, when *checking CaptureScreen.tsx*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-001 US-002

---

### Feature Area: WA5: Chart Visualization Fix

#### US-005: Refactor useStreamData hook: 4-second window, 40 Hz downsample, 1 Hz update cadence

**Priority:** Must | **Status:** Ready

> As a *researcher*, I want *the stream data hook to expose only the last 4 seconds of data downsampled to 40 Hz and refreshed at 1 Hz*, so that *the capture chart renders efficiently with predictable 160-point datasets and does not overwhelm the UI thread*.

**Acceptance Criteria:**

- **AC1:** Given *streaming data arrives at 215 Hz*, when *the hook processes packets*, then *an internal buffer holds only the last 4 seconds (~860 raw samples)*
- **AC2:** Given *the hook is queried for chart data*, when *the caller reads the output array*, then *it contains ~160 points (4s Ã— 40 Hz downsampled from 215 Hz buffer)*
- **AC3:** Given *packets arrive continuously*, when *one second elapses*, then *the hook outputs updated chart data exactly once (1 Hz cadence)*
- **AC4:** Given *the downsampling implementation*, when *reviewed*, then *it uses decimation or averaging without introducing visible aliasing artifacts*
- **AC5:** Given *the hook implementation*, when *reviewed*, then *it imports DEVICE_SAMPLE_RATE_HZ and CHART_DISPLAY_RATE_HZ from @iris/domain â€” no magic numbers*
- **AC6:** Given *npm run type-check:all is executed*, when *checking useStreamData.ts*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-001

---

#### US-006: Fix SEMGChart to render fixed 4-second viewport with no horizontal scroll

**Priority:** Must | **Status:** Ready

> As a *researcher*, I want *the real-time chart to display a fixed 4-second window without horizontal scrolling*, so that *the capture screen is less distracting during clinical data collection and avoids unnecessary GPU work*.

**Acceptance Criteria:**

- **AC1:** Given *the SEMGChart component receives chart data*, when *rendering*, then *it renders at most 160 data points (the downsampled output from useStreamData)*
- **AC2:** Given *the SEMGChart component layout*, when *inspected*, then *there is no horizontal ScrollView wrapping the chart element*
- **AC3:** Given *the SEMGChart component*, when *new data arrives*, then *auto-scroll behavior is absent â€” the viewport does not scroll horizontally*
- **AC4:** Given *the device screen size changes*, when *SEMGChart renders*, then *the chart fills the available screen width responsively*
- **AC5:** Given *npm run type-check:all is executed*, when *checking SEMGChart.tsx*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-005

---

#### US-007: Wire CaptureScreen chart parameters to corrected 215 Hz stream and 1 Hz refresh

**Priority:** Must | **Status:** Ready

> As a *researcher*, I want *the CaptureScreen to pass the correct sample rate and chart update throttle to useStreamData and SEMGChart*, so that *the capture screen chart reflects the real 215 Hz signal cadence and updates at the specified 1 Hz display rate*.

**Acceptance Criteria:**

- **AC1:** Given *CaptureScreen calls useStreamData*, when *passing the sample rate parameter*, then *it passes DEVICE_SAMPLE_RATE_HZ (215), not streamConfig.rate*
- **AC2:** Given *chart state update logic in CaptureScreen*, when *packets arrive at 215 Hz*, then *chart state is updated at most once per second (throttled to 1 Hz)*
- **AC3:** Given *a live stream is active*, when *observing the SEMGChart visually*, then *chart shows only the last ~4 seconds of signal data (the sliding window)*
- **AC4:** Given *npm run type-check:all is executed*, when *checking CaptureScreen.tsx chart-related changes*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-004 US-005 US-006

---

### Feature Area: WA6: ZIP Export from History

#### US-008: Add jszip (or equivalent) dependency to mobile app for ZIP export

**Priority:** Must | **Status:** Ready

> As a *developer*, I want *a ZIP archive library available in the mobile app bundle*, so that *the export function can produce ZIP archives compatible with Expo's file system and sharing APIs*.

**Acceptance Criteria:**

- **AC1:** Given *apps/mobile/package.json is inspected*, when *checking production dependencies*, then *jszip (or fflate) is listed as a dependency with a compatible version*
- **AC2:** Given *the chosen library*, when *evaluated against Expo 52 compatibility matrix*, then *it does not require native module linking or eject*
- **AC3:** Given *the chosen library*, when *TypeScript types are checked*, then *@types/jszip or built-in types are available with no type errors*
- **AC4:** Given *npm install is run in apps/mobile*, when *it completes*, then *no peer-dependency conflicts are reported*

---

#### US-009: Implement exportSessionAsZip() in csvExport.ts

**Priority:** Must | **Status:** Ready

> As a *developer*, I want *a new exportSessionAsZip() function that produces a ZIP containing session.json and per-recording CSVs*, so that *history exports are structured, clinically meaningful artifacts that researchers can import into analysis tools*.

**Acceptance Criteria:**

- **AC1:** Given *csvExport.ts is inspected*, when *looking for the export API*, then *exportSessionAsZip(session, recordings) is exported with the correct signature*
- **AC2:** Given *exportSessionAsZip is called with a session and its recordings*, when *the ZIP is opened*, then *it contains a session.json with sessionId, volunteer, bodyStructure, laterality, startTime, duration, sampleRate (215), dataType, and recordings array with filenames*
- **AC3:** Given *exportSessionAsZip is called with two recordings*, when *the ZIP is opened*, then *it contains recording_001.csv and recording_002.csv with actual signal data rows*
- **AC4:** Given *recording CSV files exist on disk at recording.filePath*, when *exportSessionAsZip runs*, then *it reads them via expo-file-system â€” it does NOT regenerate data from memory*
- **AC5:** Given *the ZIP file*, when *presented via expo-sharing*, then *it has MIME type application/zip and a .zip filename extension*
- **AC6:** Given *npm run type-check:all is executed*, when *checking csvExport.ts*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-008

---

#### US-010: Wire HistoryScreen export to new ZIP export function

**Priority:** Must | **Status:** Ready

> As a *researcher*, I want *the history screen export action to produce a structured ZIP file instead of a single flat CSV*, so that *exported session data is immediately usable by researchers without manual reorganisation*.

**Acceptance Criteria:**

- **AC1:** Given *the user taps export on a session in HistoryScreen*, when *handleExportSession runs*, then *it calls exportSessionAsZip() instead of the legacy exportSessionData()*
- **AC2:** Given *handleExportSession is executed*, when *passing data to the zip function*, then *it provides the recording entities whose filePath fields reference the on-disk CSV files*
- **AC3:** Given *the share sheet is presented*, when *the user sees the share prompt*, then *the shared file has MIME type application/zip and a .zip filename*
- **AC4:** Given *csvExport.ts is inspected*, when *reviewing exports*, then *the legacy exportSessionData() function is removed or clearly deprecated if still used for another purpose*
- **AC5:** Given *npm run type-check:all is executed*, when *checking HistoryScreen.tsx*, then *zero new TypeScript strict-mode errors are reported*

**Depends on:** US-009

---

### Feature Area: WA7: Type Safety & Cleanup

#### US-011: Verify TypeScript strict mode compliance across all modified files

**Priority:** Must | **Status:** Ready

> As a *developer*, I want *a clean npm run type-check:all output with zero new type errors introduced by this sprint*, so that *the codebase remains type-safe and no silent runtime type bugs are introduced alongside the bug fixes*.

**Acceptance Criteria:**

- **AC1:** Given *npm run type-check:all is run after all changes*, when *checking the 8 modified files*, then *zero new TypeScript errors appear in Stream.ts, BluetoothContext.tsx, StreamConfigScreen.tsx, CaptureScreen.tsx, useStreamData.ts, SEMGChart.tsx, csvExport.ts, HistoryScreen.tsx*
- **AC2:** Given *any modified file is inspected*, when *reviewing type annotations*, then *no any type is introduced â€” all types are explicit*
- **AC3:** Given *csvExport.ts is inspected*, when *looking for legacy code*, then *exportSessionData() is deleted or has a clear deprecation notice if retained for a distinct use case*
- **AC4:** Given *@iris/domain barrel (index.ts)*, when *the exports are reviewed*, then *DEVICE_SAMPLE_RATE_HZ and CHART_DISPLAY_RATE_HZ are correctly exported*
- **AC5:** Given *any import statement in modified files*, when *reviewed*, then *it uses the @/ alias prefix as required by project CLAUDE.md, not relative paths*

**Depends on:** US-001 US-002 US-003 US-004 US-005 US-006 US-007 US-008 US-009 US-010

---

### Feature Area: Binary Protocol Support

#### US-012: Add binary protocol constants to @iris/domain

**Priority:** Must | **Status:** In Review

> As a *developer*, I want *a single source of truth for binary protocol constants (magic byte, message code, header size, samples per packet, total packet size)*, so that *all binary decoder code references named constants instead of magic numbers, and the TypeScript side mirrors StreamingProtocol.h on the ESP32*.

**Acceptance Criteria:**

- **AC1:** Given *the developer imports from @iris/domain*, when *referencing the binary magic byte*, then *BINARY_PACKET_MAGIC equals 0xAA and is typed as a number constant*
- **AC2:** Given *the developer imports from @iris/domain*, when *referencing the binary message code*, then *BINARY_PACKET_CODE equals 0x0D (13) and is typed as a number constant*
- **AC3:** Given *the developer imports from @iris/domain*, when *referencing header and packet sizes*, then *BINARY_PACKET_HEADER_SIZE equals 8, BINARY_PACKET_SAMPLES_PER_PACKET equals 50, and BINARY_PACKET_TOTAL_SIZE equals 108*
- **AC4:** Given *packages/domain/src/models/Stream.ts is inspected*, when *checking for const declarations*, then *all five binary protocol constants are declared and no any types are used*
- **AC5:** Given *packages/domain/src/index.ts is inspected*, when *checking barrel exports*, then *all five binary protocol constants are re-exported*

---

#### US-013: Implement decodeBinaryPacket() utility function

**Priority:** Must | **Status:** In Review

> As a *developer*, I want *a pure function that parses a 108-byte binary sEMG packet from a Uint8Array into a StreamDataPacket*, so that *binary decoding logic is isolated, testable, and not entangled with BluetoothContext state management*.

**Acceptance Criteria:**

- **AC1:** Given *apps/mobile/src/utils/binaryDecoder.ts is created*, when *the file is inspected*, then *it exports a decodeBinaryPacket function with signature: (buffer: Uint8Array, offset: number) => { packet: StreamDataPacket; bytesConsumed: number } | null*
- **AC2:** Given *decodeBinaryPacket is called with a buffer where byte at offset is not 0xAA*, when *the function executes*, then *it returns null*
- **AC3:** Given *decodeBinaryPacket is called with a buffer where byte at offset+1 is not 0x0D*, when *the function executes*, then *it returns null*
- **AC4:** Given *decodeBinaryPacket is called with a valid 108-byte packet*, when *the function executes*, then *it returns a StreamDataPacket with correct timestamp (uint32 LE from bytes 2-5) and 50 int16 LE sample values*
- **AC5:** Given *decodeBinaryPacket returns a result*, when *bytesConsumed is inspected*, then *it equals 108*
- **AC6:** Given *tsc --noEmit is run on the mobile workspace*, when *checking binaryDecoder.ts*, then *zero strict-mode errors and no any types are present*

**Depends on:** US-012

---

#### US-014: Implement BinaryFrameAccumulator class for SPP packet framing

**Priority:** Must | **Status:** In Review

> As a *developer*, I want *a class that accumulates incoming Bluetooth SPP byte chunks and yields complete 108-byte binary packets*, so that *partial packet fragments are held across onDataReceived callbacks until enough bytes arrive to form a complete packet, eliminating data loss from SPP fragmentation*.

**Acceptance Criteria:**

- **AC1:** Given *apps/mobile/src/utils/binaryDecoder.ts is inspected*, when *checking exports*, then *it also exports a BinaryFrameAccumulator class with a feed(chunk: Uint8Array): StreamDataPacket[] method*
- **AC2:** Given *a single complete 108-byte packet is passed to feed()*, when *the method executes*, then *it returns an array with exactly one decoded StreamDataPacket*
- **AC3:** Given *a 50-byte fragment is passed to feed() followed by the remaining 58 bytes*, when *both calls complete*, then *the first call returns an empty array and the second returns one complete StreamDataPacket*
- **AC4:** Given *two consecutive complete packets are passed in a single feed() call*, when *the method executes*, then *it returns an array with exactly two decoded StreamDataPacket objects*
- **AC5:** Given *bytes before the 0xAA magic marker arrive in the buffer*, when *feed() scans for the start marker*, then *those pre-marker bytes are discarded and do not corrupt subsequent packet decoding*
- **AC6:** Given *tsc --noEmit is run*, when *checking BinaryFrameAccumulator*, then *zero strict-mode errors and no any types are present*

**Depends on:** US-013

---

#### US-015: Add binary vs JSON detection in BluetoothContext decodeMessage()

**Priority:** Must | **Status:** In Review

> As a *developer*, I want *decodeMessage() to inspect the first byte of incoming data and route binary packets to the binary decoder path before attempting JSON.parse()*, so that *binary sEMG packets no longer trigger SyntaxError: JSON Parse error and are correctly handled, while all existing JSON messages continue to work unchanged*.

**Acceptance Criteria:**

- **AC1:** Given *BluetoothContext.tsx instantiates a BinaryFrameAccumulator*, when *the component mounts*, then *the accumulator is stored as a ref so it persists across re-renders*
- **AC2:** Given *decodeMessage() receives data whose first char code is 0xAA*, when *the function executes*, then *the data is converted to Uint8Array via char codes and passed to the accumulator feed() â€” JSON.parse is NOT attempted*
- **AC3:** Given *decodeMessage() receives data whose first char code is not 0xAA*, when *the function executes*, then *the existing JSON.parse() path executes unchanged*
- **AC4:** Given *a live binary streaming session is running*, when *the device transmits binary packets*, then *no SyntaxError: JSON Parse error appears in the console*
- **AC5:** Given *the JSON switch/case for code 13 exists in decodeMessage*, when *binary detection is added*, then *the code-13 JSON case remains intact for backward compatibility with simulation mode*
- **AC6:** Given *tsc --noEmit is run on BluetoothContext.tsx*, when *checking new binary path code*, then *zero new type errors are reported*

**Depends on:** US-014

---

#### US-016: Integrate decoded binary packets into streamBufferRef pipeline

**Priority:** Must | **Status:** In Review

> As a *developer*, I want *decoded StreamDataPacket objects from the binary path to be pushed into streamBufferRef.current, exactly as the JSON streaming path does*, so that *the existing flushStreamBuffer() / chart rendering / allStreamPacketsRef / CSV export pipeline receives real sEMG data from the device without any changes to those downstream components*.

**Acceptance Criteria:**

- **AC1:** Given *the binary decoder path produces StreamDataPacket objects*, when *accumulator.feed() returns decoded packets*, then *each packet is pushed to streamBufferRef.current*
- **AC2:** Given *decoded binary packets are in streamBufferRef*, when *flushStreamBuffer() fires after 500 ms*, then *the packets are moved to streamData state and render in the chart component*
- **AC3:** Given *decoded binary packets are in streamBufferRef*, when *packets are flushed*, then *they are also appended to allStreamPacketsRef.current for CSV export*
- **AC4:** Given *exportStreamData() is called after a binary streaming session*, when *the CSV is generated*, then *it contains rows corresponding to the binary-decoded sEMG samples*
- **AC5:** Given *the downstream pipeline (flushStreamBuffer, chart, exportStreamData) is inspected*, when *verifying changes required*, then *no modifications are needed to those components*

**Depends on:** US-015

---

#### US-017: Add binary packet validation, error logging, and dropped-packet counter

**Priority:** Must | **Status:** In Review

> As a *developer*, I want *invalid binary packets to be logged with a console.warn and counted, rather than silently discarded*, so that *debugging a misbehaving device or encoding issue is straightforward*.

**Acceptance Criteria:**

- **AC1:** Given *decodeBinaryPacket receives a buffer with an invalid magic byte after framing*, when *the function executes*, then *it returns null*
- **AC2:** Given *BluetoothContext processes a dropped binary packet*, when *the drop occurs*, then *binaryPacketsDropped counter (ref) is incremented and console.warn is called with a descriptive reason*
- **AC3:** Given *BluetoothContext successfully decodes a binary packet*, when *the packet is decoded*, then *binaryPacketsReceived counter (ref) is incremented*
- **AC4:** Given *JSON.parse() fails on data that does not start with 0xAA*, when *the error occurs*, then *console.warn is called (existing behavior) and the app does not crash*
- **AC5:** Given *any binary framing or validation error occurs*, when *the error is caught*, then *the app continues running and subsequent Bluetooth data is processed normally*

**Depends on:** US-015

---

#### US-018: Ensure TypeScript strict mode compliance for all binary decoder code

**Priority:** Must | **Status:** In Review

> As a *developer*, I want *all new binary decoding code to have explicit types and pass strict TypeScript compilation with zero errors*, so that *the codebase maintains its strict-mode contract and future contributors cannot introduce runtime type errors in the binary path*.

**Acceptance Criteria:**

- **AC1:** Given *tsc --noEmit is run on apps/mobile after all binary decoder code is added*, when *checking binaryDecoder.ts*, then *zero strict-mode errors are reported and no any types exist*
- **AC2:** Given *tsc --noEmit is run on apps/mobile after BluetoothContext.tsx is modified*, when *checking the new binary path code*, then *zero new type errors are introduced compared to the baseline*
- **AC3:** Given *decodeBinaryPacket is inspected for its return type annotation*, when *checking the function signature*, then *the return type is explicitly declared as { packet: StreamDataPacket; bytesConsumed: number } | null*
- **AC4:** Given *BinaryFrameAccumulator.feed() is inspected*, when *checking parameter and return types*, then *the parameter is typed as Uint8Array and the return is typed as StreamDataPacket[]*
- **AC5:** Given *the string-to-Uint8Array conversion helper in BluetoothContext is inspected*, when *checking for implicit any*, then *all variables and function signatures have explicit types*

**Depends on:** US-013, US-014, US-015

---

### Feature Area: Stream Bug: H1 Investigation

#### US-019: Validate isStreaming flag behavior with binary protocol device

**Priority:** Must | **Status:** Done

> As a *developer*, I want *to confirm whether the isStreaming flag in BluetoothContext transitions to true when connected to a binary-protocol device*, so that *we can confirm or rule out H1 as the root cause of the empty CSV and static chart bug*.

**Acceptance Criteria:**

- Add console.log inside the isStreaming useEffect (BluetoothContext.tsx lines 124-147) that logs the transition when isStreaming changes to true
- Add console.log inside startStream() (line 538) that logs immediately after the BT command is sent
- Add console.log inside the JSON ACK handler for StartStream (lines 433-437) that logs when the ACK is received and parsed
- Run a real device recording session and capture the logs â€” document whether isStreaming transitions to true
- If isStreaming never transitions to true with a binary device, confirm that streamBufferRef accumulates packets (log its length inside decodeMessage after each push)
- Document findings: which log appeared, which did not, and at what timestamps

---

### Feature Area: Stream Bug: H2 Investigation

#### US-020: Validate race condition between stopStream and getAllStreamPackets

**Priority:** Must | **Status:** Done

> As a *developer*, I want *to confirm whether getAllStreamPackets is called before the final flushStreamBuffer completes after stopping the stream*, so that *we can confirm or rule out H2 as a contributing cause of missing CSV data, independently of H1*.

**Acceptance Criteria:**

- Add console.log at the start of handleStopRecording (CaptureScreen.tsx line 186) that logs streamBufferRef.current.length and allStreamPacketsRef.current.length before stopStream() is awaited
- Add console.log at the end of flushStreamBuffer() that logs how many packets were moved to allStreamPacketsRef
- Add console.log at the start of getAllStreamPackets() (BluetoothContext.tsx line 682) that logs allStreamPacketsRef.current.length before and after the internal flushStreamBuffer call
- Run a real device recording session: start recording, record for 10+ seconds, stop recording, and capture the log sequence
- Document the exact order of log lines and timestamps â€” confirm whether getAllStreamPackets sees data that flushStreamBuffer placed during stopStream cleanup
- If a race condition is confirmed, document the precise timing gap between the last flush and getAllStreamPackets execution

---

### Feature Area: Stream Bug: H1 Fix

#### US-021: Fix: start batch flush interval independently of JSON ACK for binary protocol

**Priority:** Must | **Status:** Done

> As a *developer*, I want *the 500ms batch flush interval to start when the first binary packet arrives, not only when a JSON ACK for StartStream is received*, so that *stream data flows to allStreamPacketsRef and streamData state during real device recording sessions, so both chart and CSV export receive data*.

**Acceptance Criteria:**

- The batch flush interval (BluetoothContext.tsx lines 124-147) starts as soon as the first binary stream packet is received, without requiring a JSON ACK
- Alternatively, isStreaming is set to true when the first binary packet (0xAA magic byte) is received and routed to BinaryFrameAccumulator â€” not gated on JSON ACK parsing
- The fix does not break the existing JSON ACK path: if a JSON ACK arrives for StartStream, it still sets isStreaming to true (no regression for JSON protocol devices)
- Simulation mode is unaffected: the simulation data path does not use isStreaming or streamBufferRef
- After the fix, a real device recording session populates streamData with packets during recording
- After the fix, allStreamPacketsRef contains all accumulated packets when getAllStreamPackets is called on stop
- The fix is a minimal code change â€” no refactoring of unrelated logic

**Depends on:** US-019

---

### Feature Area: Stream Bug: H2 Fix

#### US-022: Fix: synchronize stopStream with final buffer flush before CSV export

**Priority:** Must | **Status:** Done

> As a *developer*, I want *all stream data in streamBufferRef to be flushed to allStreamPacketsRef before getAllStreamPackets returns after recording stops*, so that *the CSV export captures every recorded packet, including those that arrived between the last periodic flush and the stop command*.

**Acceptance Criteria:**

- getAllStreamPackets() guarantees that flushStreamBuffer() has completed before returning the packet array
- Any packets still in streamBufferRef at the time stopStream is called are included in the returned packet array
- The fix handles the case where the BT StopStream ACK is async â€” data arriving between stop command send and ACK receipt is not lost
- The fix does not introduce a deadlock or indefinite await
- After the fix, a real device recording session produces a CSV with all samples from start to stop
- Simulation mode CSV export is unaffected

**Depends on:** US-020

---

### Feature Area: Stream Bug: Chart Fix

#### US-023: Fix: improve chart update cadence to reflect real-time data during recording

**Priority:** Should | **Status:** Done

> As a *researcher*, I want *the waveform chart on CaptureScreen to update visibly during a real device recording session*, so that *I can confirm the device is transmitting valid sEMG data in real time and identify signal quality issues during the session*.

**Acceptance Criteria:**

- The SEMGChart updates at least once per second during a real device recording session when stream data is flowing
- The chart displays the most recent 4 seconds of sEMG data at 40 Hz (as per CHART_DISPLAY_RATE_HZ and CHART_WINDOW_SECONDS domain constants)
- If the useStreamData hook 1 Hz cadence is confirmed as the cause of perceived staleness, the cadence is reviewed and updated to a value that feels responsive to the researcher
- Chart updates do not cause visible jank or performance degradation on a mid-range Android device
- Simulation mode chart behavior is unaffected

**Depends on:** US-021

---

### Feature Area: Stream Bug: Instrumentation

#### US-024: Add diagnostic instrumentation at 3 key pipeline points

**Priority:** Should | **Status:** Ready

> As a *developer*, I want *persistent diagnostic logging at BinaryFrameAccumulator output, allStreamPacketsRef before CSV write, and streamBufferRef at flush time*, so that *future debugging of stream pipeline issues requires no code changes â€” the data is already visible in the dev console*.

**Acceptance Criteria:**

- BinaryFrameAccumulator.getStats() is logged at stream stop time: shows received packet count, dropped packet count, and last error if any
- allStreamPacketsRef.current.length is logged immediately before createCSVContent is called in handleStopRecording
- streamBufferRef.current.length is logged at the start and end of every flushStreamBuffer() call
- All diagnostic logs use a consistent prefix (e.g., [StreamPipeline]) to allow easy filtering
- Diagnostic logs are dev-only â€” they do not appear in production builds (use __DEV__ guard or equivalent)
- No business logic is changed â€” purely additive logging

---

### Feature Area: Stream Bug: Testing

#### US-025: Unit tests for createCSVContent, BinaryFrameAccumulator, and flushStreamBuffer

**Priority:** Must | **Status:** Done

> As a *developer*, I want *automated unit tests for the three most critical functions in the stream data pipeline*, so that *regressions in the binary decoder, CSV generation, or flush logic are caught automatically before they reach a real device recording session*.

**Acceptance Criteria:**

- createCSVContent: test with 0 packets (output is header-only), 1 packet, and N packets â€” verify row count and timestamp/value format
- createCSVContent: test with packets containing multiple samples â€” verify each sample produces exactly one CSV row
- BinaryFrameAccumulator: test feed() with a complete valid 108-byte packet â€” verify one packet is emitted with correct sample values
- BinaryFrameAccumulator: test feed() with a partial packet split across two calls â€” verify packet is assembled and emitted on second call
- BinaryFrameAccumulator: test feed() with wrong magic byte â€” verify packet is dropped and getStats().dropped increments
- flushStreamBuffer: test that calling flush with N packets in streamBufferRef moves all N to allStreamPacketsRef and clears streamBufferRef
- flushStreamBuffer: test that calling flush with 0 packets is a no-op (no error, no state change)
- All tests pass with npm test or the project test runner

**Depends on:** US-021 US-022

---

#### US-026: Integration test for full Bluetooth to CSV pipeline

**Priority:** Should | **Status:** Ready

> As a *developer*, I want *an integration test that simulates the full BTâ†’decodeâ†’bufferâ†’flushâ†’CSV pipeline without a real device*, so that *the complete data path from binary Bluetooth packet to CSV content can be verified in CI without requiring physical hardware*.

**Acceptance Criteria:**

- Test simulates receiving N binary BT packets (valid 108-byte frames) via a mocked onDataReceived callback
- Test triggers the batch flush (or calls flushStreamBuffer directly) after packets are fed
- Test calls getAllStreamPackets() and verifies the returned array length matches the number of simulated packets times samples-per-packet (50)
- Test calls createCSVContent with the returned packets and verifies the CSV has the correct number of rows (N * 50 + 1 header)
- Test covers the stop scenario: packets arrive, stopStream is called, getAllStreamPackets is called â€” data is not lost
- Test runs in the mobile app test environment (Jest + React Native Testing Library or equivalent)

**Depends on:** US-025

---

### Feature Area: Incremental CSV Recording

#### US-027: Recording lifecycle API in BluetoothContext

**Priority:** Must | **Status:** Done

> As a *developer integrating CSV recording*, I want *BluetoothContext to expose startRecording(sessionId), stopRecording(), and isRecording so the recording lifecycle can be managed from any screen*, so that *recording state is managed centrally with proper ref-based access from the stale BT listener closure, avoiding race conditions*.

**Acceptance Criteria:**

- **AC1:** Given *startRecording(sessionId) is called*, when *no recording is active*, then *a CSV file is created at DocumentDirectory/{sessionId}.csv with header row timestamp,value, recordingFilePathRef and isRecordingRef are set, sampleCountRef is reset to 0, and the file path is returned*
- **AC2:** Given *stopRecording() is called*, when *a recording is active*, then *isRecordingRef and recordingFilePathRef are cleared, and the function returns { filePath, sampleCount } with the total samples written*
- **AC3:** Given *the BluetoothContext is inspected*, when *a recording is active*, then *isRecording boolean state is true and is accessible via the context interface*
- **AC4:** Given *the BluetoothContextData interface is compiled*, when *TypeScript strict mode is enabled*, then *startRecording, stopRecording, and isRecording entries are present with correct types and no any*
- **AC5:** Given *startRecording() is called*, when *a recording is already active (stale file handle)*, then *the existing recording is closed before a new one is created*
- **AC6:** Given *all three refs are declared*, when *TypeScript compiles the file*, then *each ref is typed as React.MutableRefObject<string|null>, React.MutableRefObject<boolean>, and React.MutableRefObject<number> respectively with no any*

---

#### US-028: Per-packet CSV append at full 215 Hz

**Priority:** Must | **Status:** Done

> As a *researcher conducting a sEMG session*, I want *all 50 samples from each Bluetooth binary packet to be written to disk immediately when the packet arrives*, so that *the CSV file contains the complete 215 Hz dataset regardless of session length or app lifecycle events, with no data held in RAM*.

**Acceptance Criteria:**

- **AC1:** Given *a binary BT packet is decoded and isRecordingRef is true*, when *the decode path executes*, then *all 50 samples are appended to the CSV file at recordingFilePathRef before any downsample step*
- **AC2:** Given *a packet with timestamp T and 50 values is appended*, when *the CSV lines are written*, then *each line is formatted as T+(i*(1000/215)).toFixed(2),value for i in 0..49, producing exactly 50 lines*
- **AC3:** Given *an append completes successfully*, when *sampleCountRef is updated*, then *sampleCountRef is incremented by 50*
- **AC4:** Given *the file system throws an error during append*, when *the error is caught*, then *the error is logged but the BT listener continues without crashing and streaming is not stopped*
- **AC5:** Given *a simulated 10-second recording at 215 Hz completes*, when *the CSV file is opened*, then *it contains exactly 1 header row plus 2150 data rows*
- **AC6:** Given *the CSV output is compared to createCSVContent()*, when *formatting is checked*, then *the incremental output is byte-for-byte identical for the same set of packets*

**Depends on:** US-027

---

#### US-029: Per-packet 50-to-10 downsample before chart pipeline

**Priority:** Must | **Status:** Done

> As a *developer optimizing chart rendering*, I want *each 50-sample binary packet to be downsampled to 10 samples (every 5th sample) before being pushed into streamBufferRef*, so that *the data volume flowing through React state and the chart pipeline is reduced by 80%, lowering memory pressure and render overhead while maintaining adequate chart resolution (~43 Hz effective rate)*.

**Acceptance Criteria:**

- **AC1:** Given *a 50-sample packet is decoded and CSV append completes*, when *the downsample step runs*, then *a new StreamDataPacket is created with 10 values taken at indices 0, 5, 10, 15, 20, 25, 30, 35, 40, 45 of the original array*
- **AC2:** Given *the downsampled packet is created*, when *it is pushed into streamBufferRef*, then *only the 10-sample packet is pushed — the original 50-sample packet is not pushed*
- **AC3:** Given *simulation mode is active (no device)*, when *simulated data flows through the pipeline*, then *the BT decode path is not exercised and simulation behavior is unchanged*
- **AC4:** Given *useStreamData receives the downsampled packets*, when *it renders the 4-second sliding window*, then *the chart displays correctly without any changes to the hook*
- **AC5:** Given *the downsampled packet type is checked*, when *TypeScript strict mode compiles*, then *the packet conforms to StreamDataPacket from @iris/domain with no any types*

**Depends on:** US-028

---

#### US-030: CaptureScreen: use recording lifecycle API instead of bulk CSV

**Priority:** Must | **Status:** Done

> As a *researcher who presses Stop to end a session*, I want *CaptureScreen to call startRecording on session start and stopRecording on session stop, receiving the file path and sample count without any in-memory bulk serialization*, so that *the stop action is fast and deterministic regardless of recording duration, and the recording entity is created with accurate metadata from incremental writes*.

**Acceptance Criteria:**

- **AC1:** Given *CaptureScreen mounts and a session is initiated*, when *recording begins*, then *startRecording(sessionId) is called and awaited, and the returned file path is stored for later use*
- **AC2:** Given *the user presses Stop*, when *the stop handler executes*, then *stopRecording() is awaited and { filePath, sampleCount } is used to populate the NewRecordingData entity*
- **AC3:** Given *the NewRecordingData entity is created*, when *fields are inspected*, then *filePath and sampleCount come from stopRecording(), sampleRate equals DEVICE_SAMPLE_RATE_HZ (215), and durationSeconds is computed from elapsed wall-clock time*
- **AC4:** Given *CaptureScreen source is reviewed*, when *searching for createCSVContent()*, then *the function is absent — bulk CSV serialization is removed*
- **AC5:** Given *CaptureScreen source is reviewed*, when *searching for getAllStreamPackets()*, then *the call is absent from the stop handler*
- **AC6:** Given *a full session completes (start → stop)*, when *the recordings list is opened*, then *the new recording is visible with correct metadata and no regression in the happy path*

**Depends on:** US-027

---

#### US-031: Cleanup: remove allStreamPacketsRef and deprecated bulk CSV functions

**Priority:** Must | **Status:** Done

> As a *developer maintaining BluetoothContext*, I want *allStreamPacketsRef, getAllStreamPackets(), and the bulk createCSVContent() function to be removed from BluetoothContext after incremental recording is in place*, so that *the codebase is free of the unbounded in-memory packet accumulator that was the sole driver of CSV export, reducing RAM usage during long recordings*.

**Acceptance Criteria:**

- **AC1:** Given *BluetoothContext source is reviewed*, when *searching for allStreamPacketsRef*, then *the ref declaration is absent*
- **AC2:** Given *the BluetoothContextData interface is inspected*, when *searching for getAllStreamPackets*, then *the method is absent from the interface and its implementation*
- **AC3:** Given *the codebase is searched with grep*, when *looking for getAllStreamPackets() or createCSVContent() calls*, then *no remaining callers are found in any file*
- **AC4:** Given *the flushStreamBuffer interval runs*, when *it executes after cleanup*, then *it no longer references allStreamPacketsRef and continues to function correctly*
- **AC5:** Given *the TypeScript compiler runs after removal*, when *all files are compiled*, then *no type errors are produced*

**Depends on:** US-028, US-030

---

#### US-032: Tests: downsample logic, CSV append format, recording lifecycle

**Priority:** Should | **Status:** Done

> As a *developer validating the incremental recording implementation*, I want *unit tests that verify the downsample function, the CSV append format, and the recording lifecycle state transitions*, so that *regressions in the 215 Hz CSV output or the chart downsample ratio are caught automatically before shipping*.

**Acceptance Criteria:**

- **AC1:** Given *the downsample function receives a 50-element array*, when *it runs*, then *it returns exactly 10 elements at indices 0, 5, 10, 15, 20, 25, 30, 35, 40, 45*
- **AC2:** Given *a packet with timestamp T and 50 values is processed*, when *CSV line generation runs*, then *the output contains 50 lines formatted as (T + i*(1000/215)).toFixed(2),value for i in 0..49*
- **AC3:** Given *startRecording() is called*, when *the lifecycle state is inspected*, then *isRecordingRef is true and recordingFilePathRef is non-null*
- **AC4:** Given *stopRecording() is called after N appends of 50 samples each*, when *the result is inspected*, then *both refs are cleared and sampleCount equals N * 50*
- **AC5:** Given *all tests are run with the project test runner*, when *the suite completes*, then *all new tests pass and no existing tests regress*

**Depends on:** US-027, US-028, US-029, US-030, US-031

---

### Feature Area: Session Redesign: Env Var

#### US-033: Add EXPO_PUBLIC_RESEARCH_ID env var and startup validation

**Priority:** Must | **Status:** Ready

> As a *Institution Admin*, I want *the app to read ResearchId from EXPO_PUBLIC_RESEARCH_ID at startup without user interaction*, so that *the research context is baked at build time per institution, removing manual selection from the session flow*.

**Acceptance Criteria:**

- EXPO_PUBLIC_RESEARCH_ID is declared in .env.example with a placeholder UUID
- App reads and validates EXPO_PUBLIC_RESEARCH_ID at startup (non-empty, valid UUID format)
- If env var is missing or invalid, a clear error modal/screen is shown and the user cannot proceed
- No user interaction is required to supply a researchId during session creation
- EXPO_PUBLIC_RESEARCH_ID is documented in CLAUDE.md and QUICK_START.md build instructions

---

### Feature Area: Session Redesign: Context

#### US-034: Expand SessionConfigFormContext with sensor selection state

**Priority:** Must | **Status:** Ready

> As a *Developer*, I want *SessionConfigFormContext to carry selectedSensorIds and selectedSensorNames arrays*, so that *sensor state persists across screen transitions without prop drilling, following the established topographies pattern*.

**Acceptance Criteria:**

- SessionConfigFormContext.state includes selectedSensorIds: string[] and selectedSensorNames: string[]
- INITIAL_FORM_STATE initialises both arrays to []
- setSelectedSensorIds() and setSelectedSensorNames() actions are exported from the context
- resetForm() clears sensor arrays alongside all other fields
- Remove selectedResearchId, selectedResearchTitle, and researchProjects fetch from the context
- TypeScript strict mode: no implicit any; all new fields are fully typed

**Depends on:** US-033

---

### Feature Area: Session Redesign: Domain Types

#### US-035: Add sensor fields to SessionConfig domain type and startSession()

**Priority:** Must | **Status:** Ready

> As a *Developer*, I want *SessionConfig to include sensorIds and sensorNames and startSession() to accept and forward them*, so that *sensor selections are part of the clinical session record from creation onwards, enabling future backend submission*.

**Acceptance Criteria:**

- @iris/domain SessionConfig type includes optional sensorIds: string[] and sensorNames: string[]
- SessionContext.startSession() signature includes sensorIds: string[] parameter
- researchId is sourced from EXPO_PUBLIC_RESEARCH_ID env var inside startSession(), not from a caller-supplied parameter
- All call sites of startSession() are updated to omit the deprecated researchId argument and pass sensorIds instead
- TypeScript strict mode compilation passes with zero errors

**Depends on:** US-034

---

### Feature Area: Session Redesign: SQLite Migration

#### US-036: SQLite migration v6: add sensor columns to session_favorites

**Priority:** Must | **Status:** Ready

> As a *Developer*, I want *the session_favorites table to store sensor_ids and sensor_names as JSON text columns*, so that *favorites can persist sensor selections alongside existing fields without data loss on upgrade*.

**Acceptance Criteria:**

- Migration v6 adds sensor_ids TEXT DEFAULT "[]" and sensor_names TEXT DEFAULT "[]" to session_favorites
- Existing v5 rows are preserved after migration (no data loss)
- FavoriteRepository.create() serialises sensorIds and sensorNames as JSON strings
- FavoriteRepository.mapRow() deserialises sensor columns back to string[] on read
- SessionFavorite type and CreateFavoritePayload include optional sensorIds: string[] and sensorNames: string[]
- Migration is idempotent: running it twice does not raise an error

**Depends on:** US-034

---

### Feature Area: Session Redesign: SensorSelectScreen

#### US-037: Create SensorSelectScreen for multi-select sensor selection

**Priority:** Must | **Status:** Ready

> As a *Researcher*, I want *a dedicated screen to multi-select sensors from the paired Bluetooth device*, so that *I can specify which sensors to use in a session without cluttering the main configuration screen*.

**Acceptance Criteria:**

- SensorSelectScreen is added to HomeStack navigator as a new route
- Screen fetches sensor list via researchService.getDeviceSensors(researchId, deviceId) where researchId comes from env var
- If device is not yet selected, a guidance message is shown and the fetch is skipped
- If backend returns zero sensors, an empty-state message is shown; the user can navigate back without selecting
- If fetch fails, a clear error message with retry option is displayed
- Sensors are displayed in a searchable list with multi-select checkboxes (lucide-react-native icons only)
- Selecting/deselecting a sensor toggles it in the local state
- A Confirm/Done action saves selections to SessionConfigFormContext (selectedSensorIds and selectedSensorNames)
- Navigating back without confirming discards the in-progress selection
- TypeScript strict mode: all props and state are fully typed

**Depends on:** US-034

---

### Feature Area: Session Redesign: SessionConfigScreen

#### US-038: Update SessionConfigScreen: remove research fields, add sensor chip strip

**Priority:** Must | **Status:** Ready

> As a *Researcher*, I want *SessionConfigScreen to no longer show research project selection and instead show my selected sensors as chips with an Add button*, so that *the session configuration flow is simpler and research context is handled automatically by the institution-level env var*.

**Acceptance Criteria:**

- The Research Projects navigation card is removed from SessionConfigScreen
- The Link to Research dropdown selector is removed from SessionConfigScreen
- All local state and hooks related to researchProjects, selectedResearchId, and selectedResearchTitle are removed
- A Sensors section is added showing selected sensor names as chips
- An [Add Sensors] button navigates to SensorSelectScreen
- Changing the selected device clears the sensor chip strip (stale sensors are removed)
- The Start Session button is disabled and shows an inline error if no sensors are selected and the backend returned a non-empty sensor list
- If the backend returned zero sensors for the device, the Start Session button is NOT blocked by sensor validation
- Form layout and existing sections (Volunteer, Clinical Data, Hardware) are unchanged

**Depends on:** US-037

---

### Feature Area: Session Redesign: Favorites

#### US-039: Update favorites save and apply to include sensor selections

**Priority:** Must | **Status:** Ready

> As a *Researcher*, I want *saving a favorite to include my current sensor selections and applying a favorite to restore them*, so that *I can reuse complete session configurations including sensors without re-selecting them each time*.

**Acceptance Criteria:**

- favoriteRepository.create() persists sensorIds and sensorNames from the current SessionConfigFormContext state
- applyFavorite() restores selectedSensorIds and selectedSensorNames into SessionConfigFormContext
- Favorites saved before v6 migration (with no sensor data) apply cleanly with empty sensor arrays (no crash)
- Favorites can be saved with an empty sensor list (sensors are optional in the favorite schema)
- Sensor chips appear in SessionConfigScreen after applying a favorite that includes sensors

**Depends on:** US-036 US-038

---

## Story Dependency Map

```mermaid
graph LR
    US002["US-002"] --> US001["US-001"]
    US003["US-003"] --> US001["US-001"]
    US004["US-004"] --> US001 US002["US-001 US-002"]
    US005["US-005"] --> US001["US-001"]
    US006["US-006"] --> US005["US-005"]
    US007["US-007"] --> US004 US005 US006["US-004 US-005 US-006"]
    US009["US-009"] --> US008["US-008"]
    US010["US-010"] --> US009["US-009"]
    US011["US-011"] --> US001 US002 US003 US004 US005 US006 US007 US008 US009 US010["US-001 US-002 US-003 US-004 US-005 US-006 US-007 US-008 US-009 US-010"]
    US013["US-013"] --> US012["US-012"]
    US014["US-014"] --> US013["US-013"]
    US015["US-015"] --> US014["US-014"]
    US016["US-016"] --> US015["US-015"]
    US017["US-017"] --> US015["US-015"]
    US018["US-018"] --> US013["US-013"]
    US018["US-018"] --> US014["US-014"]
    US018["US-018"] --> US015["US-015"]
    US021["US-021"] --> US019["US-019"]
    US022["US-022"] --> US020["US-020"]
    US023["US-023"] --> US021["US-021"]
    US025["US-025"] --> US021 US022["US-021 US-022"]
    US026["US-026"] --> US025["US-025"]
    US028["US-028"] --> US027["US-027"]
    US029["US-029"] --> US028["US-028"]
    US030["US-030"] --> US027["US-027"]
    US031["US-031"] --> US028["US-028"]
    US031["US-031"] --> US030["US-030"]
    US032["US-032"] --> US027["US-027"]
    US032["US-032"] --> US028["US-028"]
    US032["US-032"] --> US029["US-029"]
    US032["US-032"] --> US030["US-030"]
    US032["US-032"] --> US031["US-031"]
    US034["US-034"] --> US033["US-033"]
    US035["US-035"] --> US034["US-034"]
    US036["US-036"] --> US034["US-034"]
    US037["US-037"] --> US034["US-034"]
    US038["US-038"] --> US037["US-037"]
    US039["US-039"] --> US036 US038["US-036 US-038"]
```
