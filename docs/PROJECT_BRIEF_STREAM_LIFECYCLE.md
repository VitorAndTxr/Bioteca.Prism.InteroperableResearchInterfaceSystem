# Project Brief: sEMG Streaming Lifecycle Fix

**Date**: 2026-02-17
**Component**: InteroperableResearchsEMGDevice (ESP32 Firmware)
**Type**: Bug Fix — Safety-Non-Critical (FES module unaffected)

---

## Problem Statement

The PRISM sEMG device fails to produce signal data on any streaming session after the first one within a single power cycle. The user must physically restart the device between recordings to recover functionality. This occurs in the FreeRTOS streaming and ADC subsystems and stems from three distinct lifecycle management bugs introduced when the streaming path was implemented.

---

## Business Impact

Consecutive sEMG recordings are required for virtually every clinical session workflow — researchers and clinicians routinely run multiple back-to-back acquisitions on the same subject. The current defect forces a device restart between each session, which:

- Breaks the mobile app session flow (the app expects the device to remain connected and ready)
- Adds significant friction in clinical environments where time-per-subject is constrained
- Risks Bluetooth connection loss on restart, requiring re-pairing

---

## Root Cause Summary

Three bugs in the streaming lifecycle compound to produce the failure:

1. **Unsafe FreeRTOS task deletion corrupts the I2C bus.**
   `Adc::stopContinuousMode()` calls `vTaskDelete(adc_task_handle)` to terminate the ADC task. If the task is mid-I2C transaction at the moment of deletion, the ADS1115 sensor may hold SDA low indefinitely, hanging the bus and making the sensor unreachable on the next session start.

2. **Streaming task self-deletion leaves a dangling handle.**
   When the streaming task exits its loop and calls `vTaskDelete(NULL)`, the variable `streaming_task_handle` is never set to `NULL` because execution stops at the delete call. On the next session, the handle still appears valid, preventing correct state detection and task creation.

3. **No idempotency guard in `enableStreaming()`.**
   Without a guard checking whether a streaming task already exists (or has not been properly cleaned up), calling `enableStreaming()` a second time can create a duplicate FreeRTOS task, causing undefined behavior.

**Affected files:**
- `InteroperableResearchsEMGDevice/src/modules/semg/Semg.cpp` / `Semg.h`
- `InteroperableResearchsEMGDevice/src/modules/adc/Adc.cpp` / `Adc.h`

---

## Success Criteria

- A second sEMG streaming session starts and delivers data without device restart.
- The I2C bus remains functional after `stopContinuousMode()` is called.
- `streaming_task_handle` is `NULL` after the streaming task terminates.
- `enableStreaming()` is idempotent: calling it twice does not create duplicate tasks.
- The existing first-session behavior is unchanged.

---

## Risk Assessment

**Scope is narrow and isolated to the streaming path.** The FES stimulation module (`Fes.*`), Bluetooth communication layer, and session command handling are not modified. No changes touch safety-critical stimulation parameters or timing. The risk of regressions outside the streaming subsystem is low, provided the I2C bus recovery logic is tested carefully before and after the fix.

The primary implementation risk is the I2C bus recovery: bus-stuck conditions require a deliberate clock-stretching or reset sequence and must be validated on hardware.
