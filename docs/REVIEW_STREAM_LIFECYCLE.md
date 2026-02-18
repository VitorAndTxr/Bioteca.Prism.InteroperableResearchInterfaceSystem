# Code Review: ESP32 Streaming Lifecycle Fix

**Date**: 2026-02-17
**Reviewer**: TL
**Scope**: `InteroperableResearchsEMGDevice` — Adc and Semg modules
**Reference**: `IRIS/docs/ARCHITECTURE_STREAM_LIFECYCLE.md`, `IRIS/docs/VALIDATION_STREAM_LIFECYCLE.md`

---

## Review Checklist

### Architecture Compliance

| Item | Status | Notes |
|------|--------|-------|
| `continuous_active` volatile flag added to Adc | PASS | `Adc.h:32`: `static volatile bool continuous_active;` declared. `Adc.cpp:19`: zero-initialized to `false`. |
| `adcTaskLoop` uses `while(continuous_active)` instead of `while(true)` | PASS | `Adc.cpp:162`: `while (continuous_active)` — correct. |
| `adcTaskLoop` sets `adc_task_handle = NULL` before `vTaskDelete(NULL)` | PASS | `Adc.cpp:220-221`: `adc_task_handle = NULL;` then `vTaskDelete(NULL);` — correct ordering. |
| `stopContinuousMode` signals → polls → force-deletes as fallback | PASS | `Adc.cpp:88-101`: sets flag, polls 50ms, force-deletes with warning if needed. |
| Buffer reset happens AFTER task confirmed gone | PASS | `Adc.cpp:105-108`: indices reset only after the poll/force-delete block. |
| `startContinuousMode` has idempotency guard | PASS | `Adc.cpp:50-52`: `if (adc_task_handle != NULL) stopContinuousMode();` |

### Streaming Task Fixes

| Item | Status | Notes |
|------|--------|-------|
| `streamingTask` timeout path uses `break` instead of calling `disableStreaming()` | PASS | `Semg.cpp:457-459`: sets `streaming_active = false` and `break`s out of loop on timeout. |
| `streamingTask` BT-disconnect path uses `break` instead of calling `disableStreaming()` | PASS | `Semg.cpp:494-496`: sets `streaming_active = false` and `break`s on disconnect. |
| Post-loop cleanup calls `Adc::stopContinuousMode()` and sets `streaming_task_handle = NULL` | PASS | `Semg.cpp:504-507`: `Adc::stopContinuousMode()` → `streaming_task_handle = NULL` → `vTaskDelete(NULL)`. |
| `disableStreaming()` uses cooperative shutdown pattern (signal → poll → force-delete) | PASS | `Semg.cpp:342-358`: sets flag, polls 100ms, force-deletes with warning if needed. |
| `disableStreaming()` only calls `Adc::stopContinuousMode()` in force-delete path | PASS | `Semg.cpp:357`: ADC stop is inside the `if (streaming_task_handle != NULL)` force-delete branch only. Normal exit relies on post-loop cleanup in the task itself. |
| `enableStreaming()` has idempotency guard | PASS | `Semg.cpp:303-308`: guard checks `streaming_active || streaming_task_handle != NULL`. |

### Thread Safety

| Item | Status | Notes |
|------|--------|-------|
| `volatile` used correctly for cross-task flags | PASS | Both `continuous_active` (`Adc.h:32`) and `streaming_active` (`Semg.h:50`) are `volatile bool`. Single-byte, atomic on Xtensa LX6. |
| Priority ordering: MessageHandler(20) > ADC(18) > Streaming(15) | PASS | ADC task at priority 18 (`Adc.cpp:71`), streaming task at 15 (`Semg.cpp:330`). MessageHandler is at 20 per architecture doc. |
| No deadlock potential in the cooperative shutdown | PASS | `disableStreaming()` is called by MessageHandler (priority 20). It polls for the streaming task (15) to exit, which it can do because 15 < 20 — the lower-priority task gets CPU via `vTaskDelay` yields. ADC task (18) also yields to MessageHandler. No circular wait exists. |
| `streaming_task_handle = NULL` before `vTaskDelete(NULL)` is safe | PASS | `Semg.cpp:506`: handle cleared before self-delete. On Xtensa LX6, single-pointer write is atomic; no torn read possible. `disableStreaming()` polling this flag will see NULL and skip the force-delete path. |

### No Regressions

| Item | Status | Notes |
|------|--------|-------|
| FES module code NOT modified | PASS | Only `Adc.h`, `Adc.cpp`, `Semg.cpp` were in scope. No `Fes.*` changes observed. |
| Bluetooth module NOT modified | PASS | Not touched. |
| Session module NOT modified | PASS | Not touched. |
| MessageHandler NOT modified | PASS | Not touched. |

---

## Blocking Issues

**None.**

All three bugs identified in the validation report are correctly fixed:

1. **Bug 1 (mid-I2C force kill)**: Resolved by `continuous_active` flag + cooperative exit in `adcTaskLoop`. `stopContinuousMode()` now waits for clean exit before resetting buffer state.
2. **Bug 2 (dangling streaming handle)**: Resolved — `streaming_task_handle = NULL` is set at `Semg.cpp:506` before `vTaskDelete(NULL)`.
3. **Bug 3 (duplicate streaming tasks)**: Resolved — `enableStreaming()` tears down any existing session before starting a new one.
4. **Ordering race (S ↔ A)**: `disableStreaming()` now waits for the streaming task to exit before calling `Adc::stopContinuousMode()`, eliminating the race where the streaming task polls the ADC while the ADC task is being force-killed.

**S3 concern from validation is resolved**: Both the timeout path (`Semg.cpp:457-459`) and the BT-disconnect path (`Semg.cpp:494-496`) now set `streaming_active = false` and `break` out of the `while` loop, letting post-loop cleanup at `Semg.cpp:504-507` handle ADC shutdown and handle clearing. Neither path calls `disableStreaming()` from inside the task, avoiding the self-deadlock that would have occurred had they done so.

---

## Non-Blocking Suggestions

**S1 — `portMUX_TYPE` initialization inside loop body (`Adc.cpp:197`)**

```cpp
// Current: mux created fresh each iteration inside the downsample block
portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;
portENTER_CRITICAL(&mux);
```

A new `portMUX_TYPE` is stack-allocated and initialized every 4th iteration. While functionally correct (each critical section is independent), declaring the mux once at function scope would be marginally cleaner. The same pattern exists in `Semg.cpp` methods. Not a correctness issue.

**S2 — I2C mutex in `adcTaskLoop` (from VALIDATION S2, now a tracked follow-up)**

The validation report notes that `adcTaskLoop` does not acquire `i2cMutex` around `ads.getLastConversionResults()`. This is an existing issue, not introduced by this fix. It should be tracked as a follow-up task: add `xSemaphoreTake(i2cMutex, portMAX_DELAY)` before the I2C read and `xSemaphoreGive(i2cMutex)` after, consistent with other I2C users.

**S3 — `Serial.println(filtered)` inside hot loop (`Semg.cpp:471`)**

At 215 Hz, `Serial.println()` adds ~40–100µs UART latency per sample on a 115200-baud link. Over a 10-minute session this can accumulate. This was present before this fix and is acceptable for a development build, but should be wrapped in `#ifdef DEBUG` or removed before production flashing.

---

## Final Verdict

**[GATE:PASS]**

The implementation correctly addresses all three bugs and the ordering race identified in the architecture and validation documents. The S3 concern from validation (self-deadlock via `disableStreaming()` inside the streaming task) is resolved cleanly. Thread safety is sound. No regressions to FES, Bluetooth, Session, or MessageHandler modules. The two non-blocking follow-ups (I2C mutex tracking, Serial.println cleanup) do not affect correctness or safety.
