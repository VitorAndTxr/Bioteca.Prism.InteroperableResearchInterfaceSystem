# Bluetooth Permission Fix Summary

## What Was Fixed

Your app was experiencing **two critical permission issues** that prevented Bluetooth connectivity:

### 1. Missing Manifest Permissions ✅
**File**: `android/app/src/main/AndroidManifest.xml`

Added required Bluetooth permissions:
- `BLUETOOTH_SCAN` & `BLUETOOTH_CONNECT` (Android 12+)
- `BLUETOOTH` & `BLUETOOTH_ADMIN` (Android 11 and below)
- `ACCESS_FINE_LOCATION` & `ACCESS_COARSE_LOCATION`

### 2. Missing Runtime Permission Requests ✅
**File**: `src/context/BluetoothContext.tsx`

Added:
- Import: `PermissionsAndroid` and `Platform` from `react-native`
- New function: `requestBluetoothPermissions()` - Requests runtime permissions before enabling Bluetooth
- Updated: `initBluetooth()` - Now requests permissions first, then enables Bluetooth

## The Error You Saw

```
Permission Denial: starting Intent { act=android.bluetooth.adapter.action.REQUEST_ENABLE }
requires android.permission.BLUETOOTH_CONNECT
```

**Cause**: On Android 12+, you cannot call `requestBluetoothEnabled()` without first requesting and receiving the `BLUETOOTH_CONNECT` permission at runtime.

## How It Works Now

### Permission Flow (Android 12+)
```
1. App launches
2. requestBluetoothPermissions() called
   ├─ Request BLUETOOTH_SCAN
   ├─ Request BLUETOOTH_CONNECT
   └─ Request ACCESS_FINE_LOCATION
3. User grants permissions via system dialog
4. requestBluetoothEnabled() called (now allowed)
5. User enables Bluetooth if disabled
6. updatePairedDevices() scans for "NeuroEstimulator"
7. Ready to connect!
```

### Permission Flow (Android 11 and below)
```
1. App launches
2. requestBluetoothPermissions() called
   └─ Request ACCESS_FINE_LOCATION only
3. User grants permission
4. requestBluetoothEnabled() called
5. updatePairedDevices() scans for devices
6. Ready to connect!
```

## What You Need to Do

### 1. Rebuild the App (Required)

The app must be rebuilt for these changes to take effect:

```bash
npm run android
```

Or if that doesn't work:

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

### 2. Grant Permissions

When the app launches, **you will see permission dialogs**:

**For Android 12 and above**, you'll see:
1. "Allow [App Name] to find, connect to, and determine the relative position of nearby devices?"
   - **Tap "Allow"** (This grants BLUETOOTH_SCAN and BLUETOOTH_CONNECT)

2. "Allow [App Name] to access this device's location?"
   - **Tap "While using the app"** or **"Allow"**

**For Android 11 and below**, you'll only see:
- Location permission request
   - **Tap "Allow"**

### 3. Enable Bluetooth

After granting permissions, if Bluetooth is disabled:
- A system dialog will ask: "Do you want to enable Bluetooth?"
- **Tap "Allow"**

### 4. Pair Your ESP32 Device

**Before using the app**, pair your device:

1. Go to Android Settings → Bluetooth
2. Make sure your ESP32 is powered on and advertising as "NeuroEstimulator"
3. Tap "NeuroEstimulator" in available devices
4. Pair (enter PIN if asked, usually `1234` or `0000`)
5. **Do NOT connect** - just pair
6. Return to the app

### 5. Connect in App

1. Open the IRIS app
2. Navigate to sEMG Streaming → Stream Configuration
3. You should see "NeuroEstimulator" in the device list
4. Tap the Connect button
5. Watch for console logs: "Dados recebidos:" means success!

## Console Output to Expect

When the app launches successfully, you should see:

```
Initializing Bluetooth...
Requesting Bluetooth permissions...
Requesting Android 12+ permissions  (or "Android 11 and below permissions")
Permissions granted: true
Bluetooth enabled: true
```

When connecting to device:

```
writeToBluetoothPayload: {"cd":...}
Dados recebidos: {"cd":...,"mt":"a"}
```

## If It Still Doesn't Work

### Check Permissions Were Granted

1. Long-press the IRIS app icon
2. Tap "App info"
3. Tap "Permissions"
4. Verify:
   - **Location**: Allowed
   - **Nearby devices** (Android 12+): Allowed

If denied, manually enable them.

### Check Device Pairing

```bash
# Via ADB
adb shell dumpsys bluetooth_manager | grep -i "neuro"
```

Should show "NeuroEstimulator" as a bonded device.

### Check ESP32 Firmware

Ensure your ESP32 code has:

```cpp
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

void setup() {
    SerialBT.begin("NeuroEstimulator"); // Must match exactly
}
```

### View Full Logs

```bash
npx react-native log-android
```

Look for permission-related errors or connection failures.

## Files Modified

1. `android/app/src/main/AndroidManifest.xml` - Added Bluetooth permissions
2. `src/context/BluetoothContext.tsx` - Added runtime permission handling
3. `BLUETOOTH_CONNECTION_FIX.md` - Detailed troubleshooting guide
4. `PERMISSION_FIX_SUMMARY.md` - This file

## What Happens Next

After rebuilding and granting permissions:

✅ App will request Bluetooth permissions on launch
✅ Permissions will be granted by user
✅ Bluetooth will be enabled
✅ Paired devices will be scanned
✅ "NeuroEstimulator" will appear in device list
✅ Connection will succeed
✅ JSON protocol messages will flow
✅ Real-time sEMG streaming will work

---

**Status**: ✅ All fixes applied - Ready to rebuild and test
**Action Required**: Rebuild the app with `npm run android`
