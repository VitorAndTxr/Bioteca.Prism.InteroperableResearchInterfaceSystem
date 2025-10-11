# Bluetooth Connection Fix - IRIS App

## Problems Identified & Fixed

### Issue 1: Missing Bluetooth Permissions (✅ Fixed)
The app was unable to connect to the ESP32 device because **critical Bluetooth permissions were missing** from the Android manifest.

### Issue 2: Runtime Permission Request Order (✅ Fixed)
The app was crashing when trying to enable Bluetooth because it didn't request `BLUETOOTH_CONNECT` runtime permission **before** calling `requestBluetoothEnabled()` on Android 12+.

## Solutions Applied

### Solution 1: Added Manifest Permissions

Added the following permissions to `android/app/src/main/AndroidManifest.xml`:

### For Android 11 and below (API ≤ 30):
- `BLUETOOTH` - Basic Bluetooth operations
- `BLUETOOTH_ADMIN` - Bluetooth device discovery and pairing

### For Android 12 and above (API ≥ 31):
- `BLUETOOTH_SCAN` - Scan for Bluetooth devices
- `BLUETOOTH_CONNECT` - Connect to paired devices

### Location Permissions (Required for Bluetooth):
- `ACCESS_FINE_LOCATION` - Required for Bluetooth device discovery
- `ACCESS_COARSE_LOCATION` - Fallback location permission

### Solution 2: Added Runtime Permission Requests

Modified `src/context/BluetoothContext.tsx` to request runtime permissions **before** attempting to enable Bluetooth:

**Changes made:**
1. Added imports: `PermissionsAndroid`, `Platform` from `react-native`
2. Created new function: `requestBluetoothPermissions()`
   - For Android 12+ (API 31+): Requests `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`
   - For Android 11 and below: Requests only `ACCESS_FINE_LOCATION`
3. Updated `initBluetooth()` to call `requestBluetoothPermissions()` first

**Why this was needed:**
On Android 12+, the system requires the `BLUETOOTH_CONNECT` permission to be granted at runtime before any Bluetooth API can be called, including `requestBluetoothEnabled()`. The previous code was trying to enable Bluetooth without first requesting the necessary permission, causing a crash.

## Next Steps to Fix Connection

### 1. Rebuild the Android App

You MUST rebuild the app for the permission changes to take effect:

```bash
# Clean previous build
cd android
./gradlew clean
cd ..

# Rebuild and reinstall
npm run android
```

**Or if using Expo:**

```bash
# Prebuild to regenerate native projects
npm run prebuild

# Run on Android
npm run android
```

### 2. Grant Runtime Permissions

When you first run the app, Android will request permissions. You MUST grant:

- **Location Access** (required for Bluetooth scanning)
- **Bluetooth Permissions** (if prompted)

If you accidentally denied permissions:

1. Long-press the app icon
2. Select "App Info"
3. Go to "Permissions"
4. Enable "Location" and "Nearby devices" (Android 12+)

### 3. Verify ESP32 Device Setup

Ensure your ESP32 device is properly configured:

#### A. Device Name Check
The app looks for devices named **"NeuroEstimulator"**. Verify in the ESP32 firmware:

```cpp
// In your ESP32 code, device name should be:
SerialBT.begin("NeuroEstimulator");
```

#### B. Bluetooth Pairing
Before connecting through the app:

1. **Pair the device** in Android Bluetooth settings:
   - Settings → Bluetooth
   - Scan for devices
   - Pair with "NeuroEstimulator"
   - Enter PIN if required (usually `1234` or `0000`)

2. **Do NOT connect** - just pair. The app will handle connection.

#### C. ESP32 Bluetooth Configuration
Verify your ESP32 is configured for **Classic Bluetooth (SPP)**, not BLE:

```cpp
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

void setup() {
    Serial.begin(115200);
    SerialBT.begin("NeuroEstimulator"); // Classic Bluetooth SPP
    Serial.println("Bluetooth started, waiting for connections...");
}
```

### 4. Test Connection Flow

After rebuilding and granting permissions:

1. **Open the app**
2. **Navigate to**: Home → sEMG Streaming → Stream Configuration
3. **Check device list**: You should see "NeuroEstimulator" appear
4. **Tap Connect**: The app will attempt connection
5. **Watch console logs** for connection status

### 5. Debugging Connection Issues

If connection still fails after applying the fix:

#### Check Android Logs

```bash
# View Android logs while app is running
npx react-native log-android
```

Look for these messages:
- `"BluetoothContext.BluetoothConnect.Error"` - Connection failed
- `"Dados recebidos:"` - Data received successfully (connection working!)
- Permission denied errors

#### Common Issues

**Issue**: "No devices found"
- **Fix**: Ensure ESP32 is paired in Android Bluetooth settings
- **Fix**: Verify device name is exactly "NeuroEstimulator"

**Issue**: "Connection timeout"
- **Fix**: Restart ESP32 device
- **Fix**: Unpair and re-pair in Android settings
- **Fix**: Check ESP32 is not already connected to another device

**Issue**: "Permission denied"
- **Fix**: Grant Location permission in app settings
- **Fix**: Enable Bluetooth in Android settings
- **Fix**: For Android 12+, grant "Nearby devices" permission

**Issue**: "Cannot connect - device already connected"
- **Fix**: In Android Bluetooth settings, disconnect the device
- **Fix**: The app should connect automatically (don't connect manually)

#### Test with Serial Monitor

Connect ESP32 to USB and monitor output:

```bash
# In ESP32 firmware directory
pio device monitor
```

You should see:
- `"Bluetooth started, waiting for connections..."`
- `"Client connected"` when app connects
- JSON messages being received from app

### 6. Protocol Test Messages

Once connected, test with these commands from the app:

```typescript
// Test gyroscope reading
readGyroscope()

// Expected ESP32 response:
// {"cd":1,"mt":"w","bd":{"a":45.2}}

// Configure streaming
configureStream(100, 'filtered')

// Expected ESP32 response:
// {"cd":14,"mt":"a"}

// Start streaming
startStream()

// Expected ESP32 response:
// {"cd":11,"mt":"a"}
// {"cd":13,"mt":"w","bd":{"t":1234,"v":[23.4,25.1,...]}}
// {"cd":13,"mt":"w","bd":{"t":1334,"v":[22.8,24.5,...]}}
// ...
```

## Code Changes Summary

**File Modified**: `android/app/src/main/AndroidManifest.xml`

**Lines Added**: 9-20 (Bluetooth and location permissions)

**Impact**: App can now request and use Bluetooth permissions properly.

## Additional Recommendations

### 1. Add Permission Checking in App

Consider adding runtime permission checks in your app:

```typescript
// In BluetoothContext.tsx initBluetooth()
async function initBluetooth() {
    try {
        // Request Bluetooth to be enabled
        let BTEnabled = await RNBluetoothClassic.requestBluetoothEnabled()
        setBluetoothOn(BTEnabled)

        if (BTEnabled) {
            updatePairedDevices()
        } else {
            console.log("Bluetooth not enabled by user")
        }
    } catch (error) {
        console.error("Bluetooth initialization error:", error)
    }
}
```

### 2. Improve Error Messages

Update `BluetoothContext.tsx:174` to show more specific errors:

```typescript
} catch (error) {
    console.log(error, 'BluetoothContext.BluetoothConnect.Error')

    // Log specific error details
    if (error instanceof Error) {
        console.error("Connection error message:", error.message)
    }

    setShowConnectionErrorModal(true)
}
```

### 3. Connection Retry Logic

Add automatic retry on connection failure:

```typescript
async function connectBluetooth(address: string, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Connection attempt ${attempt}/${retries}`)

            let connectedDevice = await RNBluetoothClassic.connectToDevice(address, {
                secureSocket: false
            })

            if (connectedDevice) {
                // Success - setup listeners
                return
            }
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error)

            if (attempt === retries) {
                setShowConnectionErrorModal(true)
                throw error
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }
}
```

## Expected Behavior After Fix

1. **App Launch**: Bluetooth permissions requested
2. **Grant Permissions**: Location and Bluetooth access allowed
3. **Device Discovery**: "NeuroEstimulator" appears in paired devices list
4. **Connection**: Tap connect → "Connected" status
5. **Data Flow**: JSON messages exchanged between app and ESP32
6. **Streaming**: Real-time sEMG data packets received and displayed

## Support

If issues persist after applying this fix:

1. **Check ESP32 firmware** matches Bluetooth protocol specification
2. **Verify Android version** (12+ requires additional permissions)
3. **Test with different Android device** to isolate hardware issues
4. **Enable verbose logging** in both app and ESP32 firmware

---

**Status**: ✅ Permissions added - Rebuild required
**Last Updated**: 2025-10-10
**Related Files**:
- `android/app/src/main/AndroidManifest.xml`
- `src/context/BluetoothContext.tsx`
