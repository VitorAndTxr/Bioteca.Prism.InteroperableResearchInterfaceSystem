# Validation: Stream Data Fixes

**Date**: 2026-02-17
**Validator**: PM (Product Manager)
**Architecture Document**: `docs/ARCHITECTURE_STREAM_FIXES.md`
**Validated Against**: `docs/PROJECT_BRIEF_STREAM_FIXES.md`

---

## 1. Success Criteria Coverage

All 11 success criteria from the brief are evaluated against the architecture document.

| SC# | Criterion | Architecture Section | Covered? | Notes |
|-----|----------|---------------------|----------|-------|
| SC1 | ZIP export produces `.zip` with `session.json` + per-recording CSVs | 3.6.2, 3.6.3 | YES | `exportSessionAsZip()` builds JSON metadata + per-recording CSV entries using JSZip, writes via `expo-file-system`, returns URI |
| SC2 | `session.json` contains accurate metadata and CSV filename references | 3.6.2 (`SessionJsonMetadata` interface) | YES | Interface explicitly lists sessionId, volunteerId, volunteerName, bodyStructure, laterality, startedAt, durationSeconds, sampleRate, dataType, exportedAt, and recordings array with filename + originalFilename + sampleRate + sampleCount |
| SC3 | Per-recording CSVs contain actual sEMG signal data | 3.6.3 (HistoryScreen reads from `recording.filePath`) | YES | Architecture specifies sequential `FileSystem.readAsStringAsync(rec.filePath)` for each recording; CSV content comes from disk files written by CaptureScreen, not re-generated |
| SC4 | Blob-uploaded CSV contains correct 215 Hz timestamps | 3.4 (CaptureScreen Change 2) | YES | `createCSVContent` receives `DEVICE_SAMPLE_RATE_HZ` (215) instead of `streamConfig.rate` (100), producing correct ~4.65ms intervals |
| SC5 | Recording entity `sampleRate` always 215 for real-device | 3.4 (Change 2-3) | YES | `sampleRate = selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ` — explicit constant usage |
| SC6 | Chart shows exactly last 4 seconds | 3.5.1 (`CHART_WINDOW_SECONDS = 4`) | YES | `maxSamples = sampleRate * CHART_WINDOW_SECONDS` → 860 samples, then sliced to window |
| SC7 | Chart renders ~160 points (40 Hz x 4s) | 3.5.1 (downsample step) | YES | `downsampleStep = Math.round(sampleRate / CHART_DISPLAY_RATE_HZ)` → every ~5th sample → ~160 points |
| SC8 | Chart refreshes at 1 Hz | 3.5.1 (`UPDATE_INTERVAL_MS = 1000`) | YES | `setInterval(processData, 1000)` with `useRef`-based throttling |
| SC9 | StreamConfigScreen displays 215 Hz as fixed | 3.3 (Changes 1-5) | YES | Rate picker replaced with read-only `<View>` showing `DEVICE_SAMPLE_RATE_HZ Hz`, `handleSave()` always passes 215 |
| SC10 | Simulation mode still works at 50 Hz | 3.2 (Risk R3 mitigation), 3.4 (Change 2), 3.5.1 (backward compat) | YES | Simulation paths explicitly use `SIMULATION_SAMPLE_RATE_HZ` (50); architecture includes detailed analysis of sim-mode independence |
| SC11 | Zero new type errors in modified files | 3.7 (WA7 checklist), Section 9 verification | YES | Explicit checklist: run `npm run type-check:all`, verify no `any` types, check import aliases, verify barrel exports |

**Result**: 11/11 success criteria are addressed. No gaps.

---

## 2. Risk Mitigation Assessment

All 7 risks from the brief are evaluated against the architecture's Section 7.

| Risk | Brief Mitigation | Architecture Mitigation | Adequate? |
|------|------------------|------------------------|-----------|
| R1: jszip bundle size | Tree-shake; evaluate fflate | Pure JS, ~45 KB gzipped, tree-shakeable; notes fflate as smaller but less RN-validated | YES |
| R2: Large CSV OOM | Chunked reading, max size guard | Sequential `for..of` reads (not `Promise.all`); back-of-envelope calc: ~1.3 MB for 5-min at 215 Hz — well within limits | YES |
| R3: Sim mode broken by 215 Hz default | Sim mode retains own 50 Hz rate | Detailed analysis in Section 3.2 — sim mode branches on `selectedDevice`, uses explicit 50 Hz constant; all `useStreamData` call sites updated | YES |
| R4: 1 Hz chart feels laggy | Test UX with clinical team | Notes 1 Hz is the specified requirement; `UPDATE_INTERVAL_MS` is a named constant for easy tuning | YES |
| R5: StreamConfigScreen navigation break | Keep screen, make rate read-only | Screen preserved, only rate picker replaced; navigation flow unchanged; data type selector remains functional | YES |
| R6: ZIP MIME not handled by share targets | Fallback per-file share | Architecture states `expo-sharing` handles `application/zip` natively on both platforms; no fallback needed | YES — brief suggested fallback, architecture argues it's unnecessary. Acceptable given expo-sharing's documented ZIP support. |
| R7: Existing recordings wrong sampleRate | Data migration or accept historical inaccuracy | Architecture retains historical 100 Hz values in SQLite, exports use stored per-recording sampleRate; documents in release notes | YES — pragmatic approach. No silent data corruption. |

**Result**: 7/7 risks have mitigations documented. No unmitigated risks.

---

## 3. Scope Compliance

### In-Scope (Brief Section 2)

| Scope Item | Architecture Coverage | Status |
|-----------|----------------------|--------|
| Bug 1: Export single CSV -> ZIP archive | Sections 3.6.1-3.6.3 (WA6) | IN SCOPE |
| Bug 2: Blob upload CSV empty header / wrong rate | Sections 3.2, 3.4 (WA2, WA4) | IN SCOPE |
| Bug 3: Wrong frequency + chart display | Sections 3.5.1-3.5.3 (WA5) | IN SCOPE |

### Out-of-Scope (Brief Section 3) - Boundary Check

| Out-of-Scope Item | Violated? | Notes |
|-------------------|----------|-------|
| ESP32 firmware changes | NO | Architecture only changes app-side constants |
| Backend UploadController/ClinicalSessionController | NO | No backend changes |
| Desktop application changes | NO | Only mobile app + `@iris/domain` touched |
| Non-sEMG streaming config | NO | All changes target sEMG 215 Hz path |
| StreamingScreen (legacy debug) | NO | Only CaptureScreen + StreamConfigScreen modified |

**Result**: Architecture stays strictly within scope. No scope creep detected.

---

## 4. Backlog Story Coverage

All 11 stories from `agent_docs/backlog/backlog.json` are mapped to architecture sections.

| Story | Title | Architecture Section | Covered? |
|-------|-------|---------------------|----------|
| US-001 | Domain constants (`DEVICE_SAMPLE_RATE_HZ`, etc.) | 3.1 (WA1) | YES |
| US-002 | BluetoothContext default rate fix | 3.2 (WA2) | YES |
| US-003 | StreamConfigScreen rate read-only | 3.3 (WA3) | YES |
| US-004 | CaptureScreen CSV timestamp fix | 3.4 (WA4) | YES |
| US-005 | useStreamData refactor (4s/40Hz/1Hz) | 3.5.1 (WA5) | YES |
| US-006 | SEMGChart fixed viewport | 3.5.2 (WA5) | YES |
| US-007 | CaptureScreen chart wiring | 3.5.3 (WA5) | YES |
| US-008 | jszip dependency | 3.6.1 (WA6) | YES |
| US-009 | exportSessionAsZip() implementation | 3.6.2 (WA6) | YES |
| US-010 | HistoryScreen ZIP export wiring | 3.6.3 (WA6) | YES |
| US-011 | TypeScript strict mode verification | 3.7 (WA7) | YES |

**Dependency chain validation**: The architecture's Section 8 (Implementation Order) correctly reflects the dependency graph from the backlog:
- US-001 is the sole prerequisite for US-002/003/004/005
- US-005 -> US-006 -> US-007 (chart pipeline)
- US-008 -> US-009 -> US-010 (ZIP pipeline)
- US-011 depends on all others (verification gate)

**Result**: 11/11 stories covered. Dependencies correctly ordered.

---

## 5. Dependency Assessment

| Dependency | Type | Justified? | Risk Level |
|-----------|------|-----------|------------|
| `jszip` ^3.10.1 | New production dependency | YES — only pure-JS ZIP library with strong RN community validation | Low — ~45 KB gzipped, no native modules, Expo compatible |
| `@types/jszip` | New dev dependency | CONDITIONAL — architecture correctly notes jszip 3.10+ may ship own types | Low — verify before installing |
| `expo-file-system` | Existing | YES — already installed, used for file I/O | None |
| `expo-sharing` | Existing | YES — already installed, used for share sheet | None |

**Result**: One new production dependency (`jszip`) is reasonable and well-justified. The architecture provides a clear rationale for choosing jszip over fflate, including bundle size and Expo compatibility analysis.

---

## 6. Architecture Quality Assessment

### Strengths

The architecture document is thorough and well-structured. It includes current-state and target-state Mermaid sequence diagrams that clearly illustrate both the bugs and their fixes. Each work area maps directly to brief sections with explicit code-level change specifications. The breaking changes are documented in Section 4.2 with clear migration paths. The file change summary (Section 6) with estimated line counts provides implementors with a realistic scope picture. The implementation order in Section 8 with parallelizable tracks enables efficient execution.

### Observations (Non-Blocking)

1. **R2 chunked reading not implemented**: The brief mentions chunked base64 reading for large CSVs, but the architecture opts for full-file reads with a back-of-envelope calculation showing ~1.3 MB per 5-min recording. This is pragmatic and acceptable for the expected recording durations, though recordings significantly longer than 5 minutes could approach memory limits on low-end devices.

2. **R6 no fallback**: The brief suggests offering per-file share if ZIP fails, but the architecture argues no fallback is needed since expo-sharing handles ZIP natively. This is a reasonable simplification that avoids over-engineering.

3. **`Math.min(...values)` on large arrays**: In the `useStreamData` hook (Section 3.5.1), `Math.min(...values)` and `Math.max(...values)` spread 860 elements onto the call stack. This is safe for the 4-second window size (860 elements) but would not scale to larger windows. Since the window is fixed at 4 seconds, this is acceptable.

4. **`@types/jszip` conditional**: The architecture correctly flags that jszip 3.10+ may include its own types. The implementor should verify this during US-008.

---

## 7. Verdict

The architecture document comprehensively addresses all 11 success criteria, all 7 risks, all 11 backlog stories, and stays strictly within the project scope. The single new dependency (jszip) is well-justified with alternatives evaluated. The current-state / target-state diagrams clearly illustrate the bugs and their fixes. Code-level specifications are detailed enough for direct implementation. Breaking changes are documented with migration paths.

No blocking issues were identified. The four non-blocking observations above are informational and do not require architecture revision.

**[VERDICT:APPROVED]**

---

*Validated by PM on 2026-02-17*

---
---

## TL (Tech Lead) Validation

**Reviewer**: TL
**Date**: 2026-02-17
**Documents reviewed**:
- `docs/ARCHITECTURE_STREAM_FIXES.md`
- `docs/PROJECT_BRIEF_STREAM_FIXES.md`
- Source files: `packages/domain/src/models/Stream.ts`, `apps/mobile/src/context/BluetoothContext.tsx`, `apps/mobile/src/hooks/useStreamData.ts`, `apps/mobile/src/components/SEMGChart.tsx`, `apps/mobile/src/screens/CaptureScreen.tsx`, `apps/mobile/src/screens/StreamConfigScreen.tsx`, `apps/mobile/src/screens/HistoryScreen.tsx`, `apps/mobile/src/utils/csvExport.ts`, `packages/domain/src/index.ts`, `apps/mobile/package.json`

---

### 1. Streaming Math Verification

**215 Hz, 4s window = 860 samples**: Correct. `sampleRate * CHART_WINDOW_SECONDS = 215 * 4 = 860`.

**40 Hz downsample = ~160 points**: The architecture claims 160 points. The actual math: `downsampleStep = Math.round(215 / 40) = Math.round(5.375) = 5`. Then `860 / 5 = 172` points at full window capacity. This is slightly higher than 160 but acceptable -- the rounding produces a consistent stride and the chart displays a smooth waveform regardless. The architecture uses "~160" as an approximation, which is fair.

**1 Hz refresh via setInterval(processData, 1000)**: Correct. The `useEffect` sets up a 1-second interval, and `processData` is called immediately on mount to avoid a 1-second blank delay. The `useRef` + `latestDataRef.current` pattern avoids stale closures. This is a standard React pattern for throttled processing.

**VERDICT: PASS**

---

### 2. ZIP Export Approach

**jszip + expo-file-system + expo-sharing**: Technically sound.

`jszip` is a pure-JavaScript library that generates ZIP archives without native modules. It supports `generateAsync({ type: 'base64' })`, which produces a base64 string that `expo-file-system.writeAsStringAsync` can write using `EncodingType.Base64`. This is the standard approach for ZIP generation in Expo/React Native.

`expo-file-system` (already installed, `~18.0.0`) supports reading and writing files including base64 encoding. `expo-sharing` (already installed, `~13.0.0`) supports `application/zip` MIME type natively on both Android and iOS.

Sequential file reading (`for..of` loop, not `Promise.all`) is the correct approach for memory management. At 215 Hz for 5 minutes, each CSV is approximately `215 * 300 * 20 bytes/line = ~1.3 MB` -- well within React Native's memory limits even on low-end devices.

The `session.json` manifest design is clean: normalized filenames (`recording_001.csv`, etc.) with the original filename preserved in metadata. This enables automated parsing of exported archives.

**N1 (Non-blocking)**: The architecture specifies `npm install --save-dev @types/jszip` but also notes that `jszip` 3.10+ ships its own types. Since the target version is `^3.10.1`, the `@types/jszip` package is likely unnecessary and may conflict. The developer should verify whether `node_modules/jszip/index.d.ts` exists after installation and skip `@types/jszip` if so.

**VERDICT: PASS**

---

### 3. BluetoothContext Rate Fix vs. Simulation Mode

I verified every usage of `streamConfig.rate` in `CaptureScreen.tsx`:

- **Line 51**: `useStreamData(streamData, streamConfig.rate, 30)` -- will become `useStreamData(streamData, DEVICE_SAMPLE_RATE_HZ)`. Only used when `selectedDevice` is truthy (real device path). Simulation path uses `useStreamData(simulationData, 50, 30)` on line 63, which becomes `useStreamData(simulationData, SIMULATION_SAMPLE_RATE_HZ)`. **Safe.**

- **Line 152**: `frequency: selectedDevice ? streamConfig.rate : 50` -- will become `selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ`. Explicit branching. **Safe.**

- **Line 204**: `const sampleRate = selectedDevice ? streamConfig.rate : 50` -- will become `selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ`. **Safe.**

- **Line 290**: `sampleRate={selectedDevice ? streamConfig.rate : 50}` -- will become `selectedDevice ? DEVICE_SAMPLE_RATE_HZ : SIMULATION_SAMPLE_RATE_HZ`. **Safe.**

Simulation mode generates data at 10 packets/sec (100ms interval, 5 values per packet = 50 Hz effective) using `setInterval(() => {...}, 100)` at line 142. It does NOT read `streamConfig.rate` for generation; the rate is hardcoded in the interval callback. Changing the default `streamConfig.rate` from 100 to 215 has zero impact on simulation data generation.

The only consumer of the raw `streamConfig` object that doesn't branch on `selectedDevice` is `BluetoothContext.exportStreamData()` (line 650-658), which uses `streamData` (the context state) rather than `streamConfig.rate`. **No issue.**

**VERDICT: PASS**

---

### 4. useStreamData Hook Refactoring Feasibility

Current implementation (`useStreamData.ts`): Single `useMemo` keyed on `[streamData, sampleRate, maxBufferSeconds]`. The proposed refactor replaces this with:

- `useRef(latestDataRef)` to hold latest stream data without triggering re-renders
- `useCallback(processData)` for the data transformation logic
- `useEffect` with `setInterval` at 1000ms for 1 Hz cadence
- `useState(output)` for the chart-ready result

This is a well-established React pattern. Key design decisions verified:

1. **Stale closure avoidance**: `latestDataRef.current = streamData` on every render ensures the interval callback always reads fresh data. This is the canonical `useRef` technique for this scenario.

2. **Cleanup**: The `useEffect` return function clears the interval. The `processData` dependency in the effect is stable because it's wrapped in `useCallback` with `[sampleRate]` deps (sampleRate is constant during a session).

3. **Immediate initial call**: `processData()` called after `setInterval` ensures the chart isn't blank for the first second.

4. **`Math.min(...values)` spread on 860 items**: At full 4s window, 860 elements are spread onto the call stack. This is well within the JS engine's stack argument limit (typically 65K+ on V8/JavaScriptCore). **No issue.**

5. **Signature change from 3 params to 2**: Both call sites in `CaptureScreen.tsx` (lines 51 and 63) are explicitly enumerated in the architecture. I searched the codebase -- no other callers of `useStreamData` exist.

6. **The `getYAxisRange` helper**: Kept unchanged as a static `[-500, 500]` function. Correct -- not affected by these changes.

**VERDICT: PASS**

---

### 5. SEMGChart Changes vs. react-native-gifted-charts API

The chart currently uses `react-native-gifted-charts` (`^1.4.64`), specifically the `LineChart` component. Verified the proposed changes against the library's API:

1. **Remove ScrollView wrapper**: The current implementation wraps `LineChart` in a horizontal `ScrollView` with auto-scroll refs. Removing it and rendering `LineChart` directly inside a `View` is valid -- the component renders its own SVG viewport and doesn't require an external scroll container.

2. **Dynamic spacing**: The architecture proposes `spacing = availableWidth / Math.max(data.length - 1, 1)`. The `spacing` prop in `react-native-gifted-charts` controls the horizontal distance between consecutive data points. Calculating it dynamically to fill the container width is valid and will produce a full-width chart with exactly `data.length` points distributed evenly.

3. **Width prop**: After removing the ScrollView, `width` should be set to `screenWidth - totalPadding` (fixed for the container). The `LineChart` respects the `width` prop for its SVG viewport sizing.

4. **Removal of `autoScroll` prop**: This is a custom prop on the `SEMGChart` wrapper component, not part of the library API. The `scrollViewRef`, `previousDataLength`, `lastScrollTime` refs and the auto-scroll `useEffect` all become dead code once the ScrollView is removed. Clean removal.

5. **Chart sub-header text**: Importing `CHART_WINDOW_SECONDS` and `CHART_DISPLAY_RATE_HZ` from `@iris/domain` for the display text is straightforward.

**VERDICT: PASS**

---

### 6. TypeScript Type Consistency

All type changes verified for consistency:

1. **New constants in `Stream.ts`**: `DEVICE_SAMPLE_RATE_HZ`, `CHART_DISPLAY_RATE_HZ`, `CHART_WINDOW_SECONDS`, `SIMULATION_SAMPLE_RATE_HZ` -- all `number` type inferred from literal assignment. Exported via `export const`. The barrel export in `packages/domain/src/index.ts` (line 11) already re-exports everything from `Stream.ts` via `export * from './models/Stream'`. **Constants will be available from `@iris/domain` without any changes to the barrel file.**

2. **`useStreamData` signature change**: From `(StreamDataPacket[], number, number)` to `(StreamDataPacket[], number)`. Both call sites in `CaptureScreen.tsx` are covered. No other call sites exist in the codebase (verified).

3. **`SEMGChartProps` change**: Removes `autoScroll?: boolean`. The only consumer is `CaptureScreen.tsx` (line 292) which passes `autoScroll={true}`. Removing the prop and usage is clean.

4. **New types in `csvExport.ts`**: `SessionJsonMetadata` is a local interface used only by `exportSessionAsZip`. The existing `SessionMetadata` and `RecordingForExport` interfaces are already defined in `csvExport.ts` (lines 131-153) and match the architecture's usage exactly.

5. **No `any` types introduced**: All function signatures in the architecture have explicit types. No `any` introduced.

6. **Import aliases**: All imports use `@/` prefix or `@iris/domain`. Consistent with project conventions.

**N2 (Non-blocking, pre-existing)**: The `csvExport.ts` file at lines 12-15 redefines `StreamDataPacket` locally, duplicating the type from `@iris/domain`. The architecture doesn't address this because it's pre-existing. The developer may optionally clean this up as part of US-011 (WA7).

**N3 (Non-blocking, pre-existing)**: `StreamConfigScreen.tsx` line 16 uses `navigation: any` in the props interface. This pre-exists the current change and violates the project's TypeScript strict mode rule. Out of scope for a bug fix.

**VERDICT: PASS**

---

### 7. Architectural Red Flags Assessment

**No blocking architectural red flags found.** The design is well-scoped, addresses the three bugs directly, and introduces minimal new complexity.

**Non-blocking observations summary**:

| # | Observation | Severity | Action |
|---|-----------|----------|--------|
| N1 | `@types/jszip` may be unnecessary with jszip 3.10+ bundled types | Low | Developer verifies during US-008 |
| N2 | `csvExport.ts` locally redefines `StreamDataPacket` (pre-existing) | Low | Optional cleanup in US-011 |
| N3 | `StreamConfigScreen` uses `navigation: any` (pre-existing) | Low | Out of scope |
| N4 | Dead `Picker` import after rate picker removal | Low | Developer removes unused import in US-003 |
| N5 | `processData` useCallback dependency on `[sampleRate]` is correct but worth noting | Info | sampleRate is constant per session; effect restart is harmless |

---

### 8. Implementation Order Validation

The dependency graph in Section 8 is correct:

- US-001 (domain constants) has no dependencies and unblocks all other stories.
- Tracks A (001->002->003), B (001->004), C (001->005->006->007), D (008->009->010) are truly parallelizable.
- US-011 (type safety) correctly runs last as a verification gate.

The estimated ~350 lines across 9 files is realistic given the scope. The parallelizable tracks enable efficient execution if multiple developers are available, though sequential execution by a single developer is also straightforward given the small scope.

---

### Summary

| # | Check | Result |
|---|-------|--------|
| 1 | Streaming math (215 Hz, 4s, 860 samples, ~172 pts, 1 Hz) | PASS |
| 2 | ZIP export (jszip + expo-file-system + expo-sharing) | PASS |
| 3 | BluetoothContext rate fix / simulation safety | PASS |
| 4 | useStreamData hook refactoring feasibility | PASS |
| 5 | SEMGChart changes vs. react-native-gifted-charts API | PASS |
| 6 | TypeScript type consistency | PASS |
| 7 | Architectural red flags | PASS (0 blocking, 5 non-blocking) |
| 8 | Implementation order | PASS |

**Non-blocking notes**: N1 (@types/jszip conditional), N2 (pre-existing StreamDataPacket duplication in csvExport), N3 (pre-existing `any` in StreamConfigScreen), N4 (dead Picker import after refactor), N5 (processData deps info).

**[VERDICT:APPROVED]**

The architecture is technically sound, correctly addresses all three bugs, and the implementation specifications are precise enough for a developer to execute without ambiguity. No blocking issues found. All streaming math is correct, the ZIP export approach is proven in the Expo ecosystem, simulation mode is safely isolated from the rate fix, the useStreamData refactor uses standard React patterns, and all TypeScript types are consistent.

---

*Validated by TL on 2026-02-17*
