# Bluetooth Setup & Troubleshooting Guide

## Issue: `Cannot read property 'requestBluetoothEnabled' of null`

### Root Cause
This error occurs because `react-native-bluetooth-classic` is a **native module** that requires native Android code, which isn't available in Expo's managed workflow by default.

### ✅ Solution Applied

We've fixed this issue by:

1. **Generated native Android project** using `expo prebuild`
2. **Added Bluetooth permissions** to `AndroidManifest.xml`
3. **Building with native modules** using `expo run:android`

## Steps Taken

### 1. Prebuild Native Project

```bash
npx expo prebuild --platform android --clean
```

This generates the native `android/` directory with all necessary native dependencies, including the Bluetooth module.

### 2. Added Bluetooth Permissions

Modified `android/app/src/main/AndroidManifest.xml` to include:

```xml
<!-- Bluetooth permissions for react-native-bluetooth-classic -->
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

**Why these permissions?**
- `BLUETOOTH` / `BLUETOOTH_ADMIN` - Basic Bluetooth operations (Android <12)
- `BLUETOOTH_CONNECT` / `BLUETOOTH_SCAN` - Bluetooth operations (Android 12+)
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` - Required for Bluetooth device discovery

### 3. Build with Native Modules

```bash
npx expo run:android
```

This builds the Android app with native code support, properly linking `react-native-bluetooth-classic`.

## Development Workflow Changes

### Before (Managed Expo)
```bash
npm start          # Expo Go app
npm run android    # Expo Go (doesn't support native modules)
```

### After (Development Build)
```bash
npx expo run:android   # First time: builds APK with native modules
npm start              # Subsequent runs: dev server
```

**Important**: After running `expo run:android` once, you can use `npm start` for hot-reloading. The native code is now compiled into the APK.

## Testing the Fix

### 1. Verify Bluetooth Module

Once the app launches, open **React Native Debugger** or check **Logcat**:

```bash
# Check Android logs
adb logcat | grep -i bluetooth
```

You should see:
- ✅ No "Cannot read property 'requestBluetoothEnabled' of null"
- ✅ `initBluetooth()` executes successfully
- ✅ "Bluetooth enabled" or "Bluetooth request" logs

### 2. Test Bluetooth Connection

**Prerequisites**:
1. ESP32 NeuroEstimulator device powered on
2. Bluetooth enabled on Android device
3. Device paired in Android Bluetooth settings

**Test Steps**:
1. Launch app → Navigate to "sEMG Streaming"
2. Configure stream (e.g., 100 Hz, Filtered)
3. Tap "Save & Continue"
4. **Verify**: "NeuroEstimulator" appears in device list
5. Tap device → Should connect successfully
6. Tap "Start Streaming"
7. **Verify**: Chart displays real-time data

### 3. Expected Console Output

```
writeToBluetoothPayload: {"cd":14,"mt":"w","bd":{"rate":100,"type":"filtered"}}
Stream configured: 100Hz, type: filtered
writeToBluetoothPayload: {"cd":11,"mt":"x"}
Stream start requested
Stream Start Acknowledged
Stream Data Received
Timestamp: 12345ms, Samples: 5
```

## Common Issues & Solutions

### Issue 1: Build Fails - "SDK location not found"

**Solution**: Set Android SDK path in `android/local.properties`:

```bash
echo "sdk.dir=/path/to/Android/Sdk" > android/local.properties
```

Or set environment variable:
```bash
export ANDROID_HOME=/path/to/Android/Sdk
```

### Issue 2: "Bluetooth permission denied"

**Cause**: Android 12+ requires runtime permission prompts.

**Solution**: Add runtime permission request in `BluetoothContext.tsx`:

```typescript
import { PermissionsAndroid, Platform } from 'react-native';

async function requestBluetoothPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(granted).every(status => status === 'granted');
    }
    return true;
}

// Call in initBluetooth() before requestBluetoothEnabled()
```

### Issue 3: Device not found in list

**Checklist**:
- ✅ Device is paired in Android Bluetooth settings first
- ✅ Device name is exactly "NeuroEstimulator"
- ✅ Device is powered on and in range
- ✅ Location permissions granted (required for BT scanning)

**Debug**:
```typescript
// In BluetoothContext.tsx updatePairedDevices()
console.log("All bonded devices:", boundedDevices);
console.log("Filtered NeuraDevices:", boundedNeuraDevices);
```

### Issue 4: Connection timeout

**Solutions**:
- Ensure device is not connected to another app
- Restart Bluetooth on phone
- Power cycle ESP32 device
- Check ESP32 serial monitor for errors

### Issue 5: App crashes on startup

**Check**:
1. `react-native-bluetooth-classic` version compatible with RN version
2. AndroidManifest.xml syntax errors
3. Gradle build errors in logs

**Rebuild**:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android --clear
```

## Architecture Notes

### Expo Managed vs Development Build

| Feature | Managed Workflow | Development Build (Current) |
|---------|------------------|------------------------------|
| Native modules | ❌ No | ✅ Yes |
| Expo Go app | ✅ Yes | ❌ No (custom dev client) |
| Custom native code | ❌ No | ✅ Yes |
| Build complexity | Simple | Moderate |
| `react-native-bluetooth-classic` | ❌ Not supported | ✅ Supported |

### Project Structure After Prebuild

```
InteroperableResearchInterfaceSystem/
├── android/                    # ← NEW: Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  # ← Modified for BT permissions
│   │   │   └── java/
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradle/
├── src/
│   ├── context/
│   │   └── BluetoothContext.tsx     # ← Uses RNBluetoothClassic
│   └── screens/
├── app.json                    # Expo configuration
└── package.json
```

## Deployment Notes

### Development Build (APK)

```bash
# Build development APK
npx expo run:android --variant debug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Production Build (EAS)

For production deployment, use EAS Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build production APK/AAB
eas build --platform android --profile production
```

**Important**: EAS Build properly handles native dependencies like `react-native-bluetooth-classic`.

## Verification Checklist

Before testing sEMG streaming:

- [x] `android/` directory exists
- [x] Bluetooth permissions in `AndroidManifest.xml`
- [x] `expo run:android` completes successfully
- [x] App launches without "Cannot read property" error
- [ ] ESP32 device paired in Android settings
- [ ] App shows paired devices in list
- [ ] Connection successful
- [ ] Streaming sends/receives data

## Additional Resources

- [Expo Development Builds Docs](https://docs.expo.dev/develop/development-builds/introduction/)
- [react-native-bluetooth-classic Docs](https://github.com/kenjdavidson/react-native-bluetooth-classic)
- [Android Bluetooth Permissions](https://developer.android.com/guide/topics/connectivity/bluetooth/permissions)

---

**Status**: ✅ Fixed - Native Android project generated with Bluetooth support
**Last Updated**: 2025-10-10
