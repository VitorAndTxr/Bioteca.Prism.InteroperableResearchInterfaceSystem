# Validation Report: sEMG Streaming Lifecycle Fix

**Date**: 2026-02-17
**Validators**: PM + TL (combined review)
**Documents Reviewed**:
- `IRIS/docs/PROJECT_BRIEF_STREAM_LIFECYCLE.md`
- `IRIS/docs/ARCHITECTURE_STREAM_LIFECYCLE.md`
- `IRIS/docs/BACKLOG_STREAM_LIFECYCLE.md`
- `InteroperableResearchsEMGDevice/src/modules/semg/Semg.cpp`
- `InteroperableResearchsEMGDevice/src/modules/adc/Adc.cpp`

---

## PM Verdict: [VERDICT:APPROVED]

**Rationale:**

The problem statement accurately describes the observed failure: the device becomes unusable for sEMG after the first streaming session ends, requiring a physical restart. This directly breaks the consecutive-session clinical workflow. The three root causes identified are plausible and supported by the actual source code reviewed.

The success criteria are measurable and specific: second session must produce data, I2C bus must remain functional, handle must be NULL after task exit, and `enableStreaming()` must be idempotent. These are directly testable via serial monitor observation without instrumentation.

The risk assessment is accurate. The FES module (`Fes.*`), Bluetooth command routing, and session state machine are not touched. The scope is genuinely narrow. The only meaningful risk acknowledged — I2C bus recovery on hardware — is correctly flagged as the primary validation concern requiring physical device testing.

---

## TL Verdict: [VERDICT:APPROVED]

**Rationale:**

Source code review confirms all three bugs are real:

**Bug 1 confirmed** (`Adc.cpp:83`): `stopContinuousMode()` calls `vTaskDelete(adc_task_handle)` directly while `adcTaskLoop()` runs `while (true)` with active I2C reads (`ads.getLastConversionResults()` + `delayMicroseconds()`). A force-delete mid-read can leave SDA/SCL in a driven state, hanging the ADS1115 on the next session. The graceful shutdown pattern (cooperative exit via `continuous_active` flag + poll for NULL) is the standard FreeRTOS approach and is correct for this scenario.

**Bug 2 confirmed** (`Semg.cpp:492`): `streamingTask()` ends with `vTaskDelete(NULL)` without first clearing `streaming_task_handle`. The handle remains non-NULL after the task is gone. On a second session, `disableStreaming()` attempts `vTaskDelete(streaming_task_handle)` on a stale handle, which is undefined behavior. Fix (set handle to NULL before self-delete) is minimal and correct.

**Bug 3 confirmed** (`Semg.cpp:303`): `enableStreaming()` has no guard. It unconditionally resets buffers and calls `xTaskCreatePinnedToCore`, which can create a second streaming task if the first was not properly cleaned up. The idempotency guard (teardown first if active or handle is non-NULL) is correct.

**Ordering bug (architecture correctly captures):** The current `disableStreaming()` (lines 336-347) calls `Adc::stopContinuousMode()` before deleting the streaming task, meaning the streaming task may still be polling `Adc::hasNewSample()` while the ADC task is being force-killed. The proposed safe order (wait for streaming task exit, then stop ADC) resolves this race correctly.

**Thread safety claims are valid:** `volatile bool` flags are byte-wide; single-byte reads/writes are atomic on Xtensa LX6. Polling via `vTaskDelay(pdMS_TO_TICKS(1))` is correct — the 1ms yield on a cooperative scheduler allows lower-priority tasks on Core 1 to run and exit their loops. The 50ms/100ms windows are sufficient: an ADC I2C frame at 860 Hz is ~1.16ms, so the task exits well within the window under normal conditions.

**Rollback plan is sensible:** Fixes 2 and 3 are zero-risk standalone changes; retaining them during rollback of Fix 1 is the right recommendation.

---

## Non-Blocking Suggestions

**S1 (backlog inconsistency):** US-2 in the backlog mentions `eTaskGetState()` and a 5-second timeout, but the architecture uses handle-NULL polling with 100ms. The architecture's approach is correct and should be implemented as written. The backlog note about `eTaskGetState()` can be ignored.

**S2 (I2C mutex):** The device `CLAUDE.md` notes that the I2C bus is shared between ADC and gyroscope, protected by `i2cMutex`. The fix should verify that `adcTaskLoop` acquires `i2cMutex` before the `getLastConversionResults()` call and releases it after, so cooperative exit does not hold the mutex while polling `continuous_active`. If the current implementation does not use the mutex inside `adcTaskLoop` (it does not appear to in the reviewed code), this is an existing issue but outside the scope of this fix — log it as a follow-up.

**S3 (timeout path in streaming):** `streamingTask()` calls `Semg::disableStreaming()` from within the task itself on timeout and Bluetooth-disconnect paths (lines 446, 483). After this fix, `disableStreaming()` will poll for `streaming_task_handle == NULL` — which it will never see from within the task itself before the `vTaskDelete(NULL)`. Ensure the timeout/disconnect code paths set the handle to NULL and call `vTaskDelete(NULL)` directly rather than going through `disableStreaming()`, or restructure those paths to `break` out of the loop and let the normal post-loop cleanup handle it.
