# Windows Long Path Fix for Android Build

## Problem

The Android build fails with:
```
ninja: error: Stat(...): Filename longer than 260 characters
```

This occurs because Windows enforces a legacy 260-character path limit, and the React Native native module build paths exceed this limit.

## Solution

### Step 1: Enable Long Paths in Windows (Required)

**Option A: Via Group Policy Editor (Windows Pro/Enterprise)**

1. Press `Win + R`, type `gpedit.msc`, press Enter
2. Navigate to: `Computer Configuration > Administrative Templates > System > Filesystem`
3. Double-click **"Enable Win32 long paths"**
4. Select **"Enabled"**
5. Click **OK**
6. Restart your computer

**Option B: Via Registry Editor (All Windows versions)**

1. Press `Win + R`, type `regedit`, press Enter
2. Navigate to: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`
3. Find or create a DWORD value named `LongPathsEnabled`
4. Set its value to `1`
5. Click **OK**
6. Restart your computer

**Option C: Via PowerShell (Administrator)**

```powershell
# Run PowerShell as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Then restart your computer.

### Step 2: Enable Git Long Paths (If using Git)

```bash
git config --system core.longpaths true
```

### Step 3: Verify the Changes

After restarting, verify long paths are enabled:

```powershell
# Should return 1
(Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem").LongPathsEnabled
```

### Step 4: Clean and Rebuild

```bash
# Clean all build artifacts
cd android
./gradlew.bat clean
cd ..

# Clear npm cache
npm cache clean --force

# Clean Expo cache
npm run clean

# Rebuild
npm run android
```

## Alternative Workaround (If you cannot enable long paths)

If you cannot modify system settings, you can move your project to a shorter path:

1. Move the project folder closer to the drive root:
   ```
   # Instead of:
   D:\Repos\Faculdade\PRISM\InteroperableResearchInterfaceSystem\

   # Use:
   D:\IRIS\
   ```

2. Update your working directory and rebuild

## Configuration Already Applied

The following fixes have already been added to the project:

**android/gradle.properties:**
```properties
# Fix Windows long path issues (260 character limit)
android.enableLongPaths=true
android.cmake.buildStagingDirectory=.cxbld
```

**android/app/build.gradle:**
```gradle
externalNativeBuild {
    cmake {
        arguments "-DANDROID_STL=c++_shared",
                  "-DCMAKE_OBJECT_PATH_MAX=240",
                  "-DCMAKE_VERBOSE_MAKEFILE=ON"
    }
}
```

These configurations will take effect **only after** you enable long paths at the Windows system level.

## Verification

After applying the fix and restarting:

1. Long paths should be enabled in Windows
2. Build should complete without "Filename longer than 260 characters" errors
3. APK should be generated successfully

## References

- [Microsoft Docs: Maximum Path Length Limitation](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation)
- [React Native Windows Long Path Issues](https://github.com/facebook/react-native/issues/29290)
- [Gradle CMake Long Path Fix](https://github.com/gradle/gradle/issues/17274)
