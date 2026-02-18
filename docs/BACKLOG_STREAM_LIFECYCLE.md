# Backlog: Streaming Lifecycle Fix

**Phase**: Device Firmware Enhancement
**Date Created**: 2026-02-17
**Priority**: Critical (all stories)
**Component**: sEMG Device Firmware (ESP32, FreeRTOS)

---

## US-1: Graceful ADC Task Shutdown

**User Story**:
As a researcher, I want the sEMG device to properly stop ADC sampling so that consecutive sessions work without restarting the device.

**Acceptance Criteria**:
1. `Adc::stopContinuousMode()` signals the ADC task to exit instead of force-deleting
2. ADC task exits its loop cleanly after completing current I2C read
3. I2C bus remains functional after shutdown

**Files Affected**:
- `Adc.cpp`
- `Adc.h`

**Technical Notes**:
- Current implementation likely uses `vTaskDelete()` which may leave I2C operations incomplete
- Must implement cooperative shutdown using a flag or notification mechanism
- Task should flush any pending I2C operations before exiting

**Definition of Done**:
- ADC task shutdown completes without I2C bus errors
- Multiple start/stop cycles succeed without requiring device restart
- Verified in manual testing with serial monitor

---

## US-2: Streaming Task Handle Cleanup

**User Story**:
As a researcher, I want the streaming task to properly clean up its handle so that new sessions can be started reliably.

**Acceptance Criteria**:
1. `streaming_task_handle` is NULL after task self-exits
2. `disableStreaming()` uses cooperative shutdown (wait for task to exit)
3. Force-delete used only as timeout fallback (e.g., 5-second timeout)

**Files Affected**:
- `Semg.cpp`
- `Semg.h`

**Technical Notes**:
- Prevents "task already exists" errors when starting new sessions
- Use `eTaskGetState()` to detect task completion before re-creating
- Implement timeout-based fallback for hung tasks (defensive programming)

**Definition of Done**:
- `streaming_task_handle` verified NULL after stop sequence
- Consecutive `startStreaming()` → `stopStreaming()` → `startStreaming()` cycles work
- Tested with timeout scenarios (simulate hung task)

---

## US-3: Idempotent Enable Streaming

**User Story**:
As a researcher, I want `enableStreaming()` to handle being called without prior cleanup so that the system is resilient to unexpected state.

**Acceptance Criteria**:
1. `enableStreaming()` calls `disableStreaming()` if a previous session wasn't cleaned up
2. `startContinuousMode()` calls `stopContinuousMode()` if ADC task exists
3. No duplicate FreeRTOS tasks created under any calling sequence

**Files Affected**:
- `Semg.cpp`
- `Adc.cpp`

**Technical Notes**:
- Defensive pattern: always clean up before creating new resources
- Check task handle state before xTaskCreate calls
- Prevents resource leaks and task conflicts from interrupted sessions

**Definition of Done**:
- Test sequence: `enable()` → `enable()` (without disable) → verify no duplicate tasks
- Verify task count remains constant with repeated calls
- No FreeRTOS heap errors in system log

---

## Implementation Roadmap

1. **Phase 1**: Implement cooperative shutdown signals in `Adc` class
2. **Phase 2**: Update `Semg::disableStreaming()` to wait for task completion
3. **Phase 3**: Add idempotency guards to `enableStreaming()` and `startContinuousMode()`
4. **Phase 4**: Integration testing with repeated session start/stop cycles
5. **Phase 5**: Verify with binary protocol test suite

---

## Success Metrics

- ✅ Device supports minimum 50 consecutive session start/stop cycles without restart
- ✅ Zero I2C bus errors in system log after ADC shutdown
- ✅ Serial monitor shows clean task lifecycle (creation → sampling → exit → NULL handle)
- ✅ No FreeRTOS heap fragmentation after 50 cycles (heap usage stable)
