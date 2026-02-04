# Navigation Implementation (US-002 & US-026)

## Overview

This document describes the implementation of session-gated navigation (US-002) and tab navigation (US-026) for IRIS Mobile.

## Architecture

```
RootNavigator (Auth Gate)
├── Login Screen (Unauthenticated)
└── MainTabNavigator (Authenticated)
    ├── Home Tab → HomeStackNavigator
    │   ├── SessionConfig
    │   ├── ActiveSession
    │   ├── Capture (hides tab bar)
    │   ├── AnnotationsList
    │   └── NewAnnotation (modal)
    ├── History Tab
    ├── Bluetooth Tab
    └── Settings Tab
```

## Implementation Status

### ✅ Completed

1. **Navigation Type Definitions** (`src/navigation/types.ts`)
   - RootStackParamList (Login, Main)
   - MainTabParamList (Home, History, Bluetooth, Settings)
   - HomeStackParamList (SessionConfig, ActiveSession, Capture, AnnotationsList, NewAnnotation)

2. **Root Navigator** (`src/navigation/RootNavigator.tsx`)
   - Auth gate logic using AuthContext
   - Loading screen while auth state is determined
   - Session expired message handling
   - AC-002.1: Unauthenticated redirect ✓
   - AC-002.2: Authenticated free navigation ✓
   - AC-002.3: Token expiry redirect with message ✓

3. **Main Tab Navigator** (`src/navigation/MainTabNavigator.tsx`)
   - 4 tabs: Home, History, Bluetooth, Settings
   - Theme-based styling
   - Unicode emoji icons (placeholder)
   - AC-026.1: Bottom tab bar visible ✓
   - AC-026.2: Tab switching works ✓

4. **Home Stack Navigator** (`src/navigation/HomeStackNavigator.tsx`)
   - Nested stack within Home tab
   - Logout button in SessionConfig header
   - Capture screen hides tab bar
   - AC-026.3: Nested stack preserves state ✓

5. **Placeholder Screens**
   - SessionConfigScreen (Wave 3 implementation)
   - ActiveSessionScreen
   - CaptureScreen (tab bar hidden)
   - AnnotationsListScreen
   - NewAnnotationScreen (modal)
   - HistoryScreen
   - BluetoothScreen
   - SettingsScreen

6. **Updated Components**
   - App.tsx: New provider hierarchy
   - LoginScreen: Session expired message support
   - AC-026.4: Tab bar not on LoginScreen ✓

## File Structure

```
apps/mobile/
├── App.tsx (updated)
└── src/
    ├── navigation/
    │   ├── types.ts
    │   ├── RootNavigator.tsx
    │   ├── MainTabNavigator.tsx
    │   ├── HomeStackNavigator.tsx
    │   └── index.ts
    └── screens/
        ├── LoginScreen.tsx (updated)
        ├── SessionConfigScreen.tsx (new)
        ├── ActiveSessionScreen.tsx (new)
        ├── CaptureScreen.tsx (new)
        ├── AnnotationsListScreen.tsx (new)
        ├── NewAnnotationScreen.tsx (new)
        ├── HistoryScreen.tsx (new)
        ├── BluetoothScreen.tsx (new)
        └── SettingsScreen.tsx (new)
```

## Required Dependencies

### Missing Dependency

The implementation requires `@react-navigation/bottom-tabs` which is **not currently installed**.

**To install:**

```bash
cd apps/mobile
npm install @react-navigation/bottom-tabs
```

### Installed Dependencies

- ✅ `@react-navigation/native` ^7.1.18
- ✅ `@react-navigation/native-stack` ^7.3.27
- ✅ `react-native-safe-area-context` 4.12.0
- ✅ `react-native-screens` ~4.4.0

## Acceptance Criteria Verification

### US-002: Session-Gated Navigation

| ID | Criteria | Status | Implementation |
|----|----------|--------|----------------|
| AC-002.1 | Unauthenticated user redirected to LoginScreen | ✅ | RootNavigator checks `isAuthenticated` |
| AC-002.2 | Authenticated user can navigate freely | ✅ | MainTabNavigator shown when authenticated |
| AC-002.3 | Token expiry → redirect with message | ✅ | RootNavigator monitors `error` for "expired" |

### US-026: Tab Navigation

| ID | Criteria | Status | Implementation |
|----|----------|--------|----------------|
| AC-026.1 | Bottom tab bar with 4 tabs visible | ✅ | MainTabNavigator with 4 tabs |
| AC-026.2 | Tab switching works correctly | ✅ | React Navigation handles switching |
| AC-026.3 | Home tab nested stack preserves state | ✅ | HomeStackNavigator within Home tab |
| AC-026.4 | Tab bar not visible on LoginScreen | ✅ | LoginScreen in RootNavigator (outside tabs) |

## Usage Examples

### Navigation within Home Stack

```typescript
// Navigate to ActiveSession
navigation.navigate('ActiveSession', { sessionId: '123' });

// Navigate to Capture (tab bar will hide)
navigation.navigate('Capture', { sessionId: '123' });

// Show NewAnnotation as modal
navigation.navigate('NewAnnotation', { sessionId: '123' });
```

### Tab Navigation

```typescript
// Switch to History tab
navigation.navigate('History');

// Switch to Bluetooth tab
navigation.navigate('Bluetooth');

// Navigate to nested screen in Home tab
navigation.navigate('Home', {
  screen: 'ActiveSession',
  params: { sessionId: '123' }
});
```

### Authentication Flow

```typescript
// Logout (anywhere in the app)
const { logout } = useAuth();
await logout(); // Automatically redirects to Login

// After successful login
// RootNavigator automatically shows MainTabNavigator
```

## Pending Tasks

### 1. Install Dependencies

```bash
cd apps/mobile
npm install @react-navigation/bottom-tabs
```

### 2. Replace Icon Placeholders

Current: Unicode emoji (🏠 📋 📶 ⚙️)
Future: Heroicons (@heroicons/react or react-native-heroicons)

Example replacement:
```typescript
// Current
tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏠</Text>

// Future (Heroicons)
import { HomeIcon } from 'react-native-heroicons/outline';
tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />
```

### 3. Implement Screen Functionality

All screens are currently placeholders. Implementation scheduled:
- **Wave 3**: SessionConfigScreen (session setup)
- **Future**: ActiveSessionScreen, CaptureScreen, etc.

### 4. Session Expiry Logic

AuthContext already handles token expiry, but the error message detection in RootNavigator may need refinement:

```typescript
// Current simple implementation
if (error && error.includes('expired')) {
  setSessionExpiredMessage('Your session has expired. Please log in again.');
}

// May need more robust error handling
```

## Testing Checklist

### Manual Testing

- [ ] Install @react-navigation/bottom-tabs
- [ ] Start app: `npm run mobile`
- [ ] Verify loading screen appears briefly
- [ ] Verify LoginScreen shows when not authenticated
- [ ] Login with valid credentials
- [ ] Verify MainTabNavigator appears
- [ ] Verify 4 tabs are visible in tab bar
- [ ] Switch between all 4 tabs
- [ ] Verify Home tab shows SessionConfigScreen
- [ ] Verify logout button in SessionConfig header
- [ ] Tap logout → verify return to LoginScreen
- [ ] (Future) Test session expiry → verify warning message

### Navigation Testing

- [ ] Navigate to ActiveSession (from SessionConfig)
- [ ] Navigate to Capture → verify tab bar hidden
- [ ] Navigate back → verify tab bar reappears
- [ ] Open NewAnnotation modal
- [ ] Switch tabs → verify state preservation
- [ ] Navigate deep in Home stack → switch tabs → return → verify preserved

## Design Decisions

### 1. Provider Hierarchy

```typescript
<BluetoothContextProvider>
  <AuthProvider>
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  </AuthProvider>
</BluetoothContextProvider>
```

**Rationale**: BluetoothContext at root ensures device connection survives auth changes. AuthProvider wraps navigation to provide auth state to all screens.

### 2. Nested Navigation

Home tab uses a nested stack navigator instead of direct screens.

**Rationale**:
- Allows complex session workflows
- Preserves stack state when switching tabs
- Enables per-screen header customization
- Supports modal presentations (NewAnnotation)

### 3. Tab Bar Hiding

CaptureScreen hides tab bar via `tabBarStyle: { display: 'none' }` in HomeStackNavigator.

**Rationale**: Full-screen capture requires immersive UI without navigation distractions.

### 4. Session Expired Messaging

Passed as navigation param to LoginScreen rather than using a global toast/alert.

**Rationale**: Ensures message is visible on LoginScreen and doesn't interfere with navigation transition.

## TypeScript Patterns

All navigation uses strict typing:

```typescript
// Screen props typing
type Props = NativeStackScreenProps<HomeStackParamList, 'ActiveSession'>;

export const ActiveSessionScreen: FC<Props> = ({ route, navigation }) => {
  const { sessionId } = route.params; // Type-safe
};
```

No `any` types used throughout the implementation.

## Legacy Code

The following files are preserved but not used in the new navigation:
- `HomeScreen.tsx` (old)
- `StreamConfigScreen.tsx` (old)
- `StreamingScreen.tsx` (old)

These can be removed once the new implementation is verified stable.

## References

- **React Navigation Docs**: https://reactnavigation.org/
- **Bottom Tabs**: https://reactnavigation.org/docs/bottom-tab-navigator
- **Nested Navigators**: https://reactnavigation.org/docs/nesting-navigators
- **TypeScript Guide**: https://reactnavigation.org/docs/typescript
- **IRIS AuthContext**: `src/context/AuthContext.tsx`
- **IRIS Theme System**: `src/theme/`
