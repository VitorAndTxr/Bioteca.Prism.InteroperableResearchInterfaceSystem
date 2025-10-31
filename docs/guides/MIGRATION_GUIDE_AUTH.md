# Migration Guide: Mock Auth → Real Middleware

**Date**: October 28, 2025
**Status**: ✅ Ready for implementation
**Estimated Time**: 2-3 hours per platform

---

## Overview

This guide helps you migrate from the mock authentication service to the real PRISM middleware authentication system. The migration involves:

1. **Understanding** the new architecture
2. **Installing** dependencies
3. **Configuring** environment variables
4. **Integrating** middleware into your app
5. **Testing** with the real backend
6. **Troubleshooting** issues

---

## Before You Start

### Prerequisites

- ✅ **Backend running**: InteroperableResearchNode at `http://localhost:5000`
- ✅ **Test user created**: A user account on the backend
- ✅ **Middleware package**: Already installed (`@iris/middleware`)
- ✅ **Development environment**: Node.js 18+, TypeScript configured

### Verification Checklist

Before starting migration, verify these components exist:

```bash
# Check middleware package
ls packages/middleware/src/auth/
# Should see: UserAuthService.ts, UserAuthService.types.ts

# Check desktop integration
ls apps/desktop/src/services/
# Should see: middleware.ts, auth/RealAuthService.ts

# Check mobile integration
ls apps/mobile/src/services/
# Should see: middleware.ts

# Check storage
ls apps/desktop/src/storage/
# Should see: ElectronSecureStorage.ts, secureStorage.ts

ls apps/mobile/src/storage/
# Should see: ReactNativeSecureStorage.ts, secureStorage.ts
```

**If any files are missing**, refer to `IMPLEMENTATION_VERIFICATION_REPORT.md` for status.

---

## Step 1: Understand the New Architecture

### Key Concepts

**UserAuthService** - Main authentication service
- Handles login/logout
- Auto-refreshes tokens
- Stores credentials securely
- Manages session state

**ResearchNodeMiddleware** - Secure communication layer
- Implements 4-phase handshake
- Encrypts all requests with AES-256-GCM
- Manages channels (ephemeral keys)
- Manages sessions (tokens)

**SecureStorage** - Platform-specific credential storage
- Desktop: Electron safeStorage (DPAPI/Keychain/libsecret)
- Mobile: Expo SecureStore (Keychain/EncryptedPreferences)

### Flow Diagram

```
User Input
    ↓
    ├─→ LoginScreen (your UI)
    ↓
    ├─→ AuthContext (your state)
    ↓
    ├─→ RealAuthService (adapter)
    ↓
    ├─→ UserAuthService (middleware)
    ↓
    ├─→ ResearchNodeMiddleware (encryption/4-phase handshake)
    ↓
    ├─→ InteroperableResearchNode (backend)
```

### Current State (Mock)

```typescript
// ❌ Current: Using mock service
class MockAuthService {
  async login(credentials) {
    // Simulated login - no backend
    return { user: { id: '1', email: 'test@example.com' }, token: 'mock-token' };
  }
}
```

### New State (Real)

```typescript
// ✅ New: Using real backend
class RealAuthService {
  constructor(private userAuthService: UserAuthService) {}

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const authToken = await this.userAuthService.login({
      username: credentials.email,
      password: credentials.password
    });

    const user = await this.userAuthService.getCurrentUser();

    return { user, token: authToken.token, expiresAt: new Date(authToken.expiresAt) };
  }
}
```

---

## Step 2: Configure Environment Variables

### Desktop App (apps/desktop/.env)

Create or update `.env` file in `apps/desktop/`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:5000

# For production with real certificates (TODO)
# VITE_IRN_MIDDLEWARE_SUBJECT_NAME=CN=your-app-name
# VITE_IRN_MIDDLEWARE_CERTIFICATE=<base64-encoded-cert>
# ... other certificate fields
```

**Development Template** (`apps/desktop/.env.example`):

```bash
# Backend Configuration
VITE_API_URL=http://localhost:5000

# Certificate Configuration (TODO: Replace mock certs)
# VITE_IRN_MIDDLEWARE_SUBJECT_NAME=
# VITE_IRN_MIDDLEWARE_CERTIFICATE=
```

### Mobile App (apps/mobile/.env)

Create or update `.env` file in `apps/mobile/`:

```bash
# Backend API URL
EXPO_PUBLIC_API_URL=http://localhost:5000

# Expo development
EXPO_DEBUG=false
```

**Development Template** (`apps/mobile/.env.example`):

```bash
# Backend Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000

# App Configuration
EXPO_DEBUG=false
```

### Verify Environment Variables

After setting environment variables:

```bash
# Desktop (make sure .env is not in .gitignore)
cat apps/desktop/.env

# Mobile
cat apps/mobile/.env

# Verify variables are loaded during build
npm run type-check:all  # Should not complain about undefined env vars
```

---

## Step 3: Desktop App Integration

### Step 3.1: Update App Initialization

In `apps/desktop/src/main.tsx`:

```typescript
// BEFORE: No middleware initialization
function App() {
  return <MainApp />;
}

// AFTER: Initialize middleware on app start
import { initializeAndHydrate, cleanupMiddleware } from './services/middleware';

async function App() {
  // Initialize middleware from storage
  await initializeAndHydrate();

  return <MainApp />;
}

// Clean up on app shutdown
ipcMain.handle('app-quit', async () => {
  await cleanupMiddleware();
  app.quit();
});
```

### Step 3.2: Update AuthContext

In `apps/desktop/src/context/AuthContext.tsx`:

**BEFORE** (Mock Service):

```typescript
import { MockAuthService } from '../services/auth/MockAuthService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authService = useRef(new MockAuthService());

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.current.login(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, handleLogin, ... }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**AFTER** (Real Service):

```typescript
import { RealAuthService } from '../services/auth/RealAuthService';
import { authService as middlewareAuthService } from '../services/middleware';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use real auth service backed by middleware
  const authService = useRef(new RealAuthService(middlewareAuthService));

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in from storage
        if (middlewareAuthService.isAuthenticated()) {
          const currentUser = await middlewareAuthService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('[AuthProvider] Failed to initialize:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.current.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.current.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('[AuthProvider] Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      handleLogin,
      handleLogout,
      ...
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Step 3.3: Update LoginScreen

In `apps/desktop/src/screens/LoginScreen.tsx`:

**BEFORE** (Mock Login):

```typescript
export function LoginScreen() {
  const { handleLogin } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleLogin({
        email: 'hardcoded@example.com',  // ❌ Hardcoded
        password: 'hardcoded-password'    // ❌ Hardcoded
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit">Login</Button>
    </form>
  );
}
```

**AFTER** (Real Login):

```typescript
export function LoginScreen() {
  const { handleLogin, error, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    try {
      // Use real credentials from form
      await handleLogin({
        email: email.trim(),
        password: password
      });
      // On success, AuthContext will handle navigation
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        placeholder="researcher@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <Password
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      {displayError && <Toast variant="error">{displayError}</Toast>}
      <Button
        type="submit"
        disabled={isLoading || !email || !password}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

### Step 3.4: Test Desktop Integration

```bash
cd apps/desktop

# Make sure backend is running
# http://localhost:5000 should be accessible

# Start development server
npm run dev

# Try logging in with a test user
# Email: researcher@example.com (or your test user)
# Password: (your test password)

# Check browser console for:
# [UserAuthService] Login successful
# [Middleware] Successfully initialized
```

---

## Step 4: Mobile App Integration

### Step 4.1: Update App Initialization

In `apps/mobile/App.tsx`:

```typescript
// AFTER: Initialize middleware on app start
import { initializeAndHydrate } from './services/middleware';
import { useAuthContext } from './context/AuthContext';

export default function App() {
  useEffect(() => {
    // Initialize middleware and check auth state
    const initializeApp = async () => {
      try {
        await initializeAndHydrate();
        console.log('[App] Middleware initialized successfully');
      } catch (error) {
        console.error('[App] Failed to initialize middleware:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
```

### Step 4.2: Update AuthContext (Mobile)

Similar to desktop, but using React Native components:

```typescript
import { RealAuthService } from './services/auth/RealAuthService';
import { authService as middlewareAuthService } from './services/middleware';
import { Alert } from 'react-native';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authService = useRef(new RealAuthService(middlewareAuthService));

  useEffect(() => {
    const initAuth = async () => {
      if (middlewareAuthService.isAuthenticated()) {
        try {
          const currentUser = await middlewareAuthService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('[AuthProvider] Failed to restore session:', error);
        }
      }
    };

    initAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.current.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      Alert.alert('Login Error', error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.current.logout();
      setUser(null);
    } catch (error) {
      Alert.alert('Logout Error', error instanceof Error ? error.message : 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Step 4.3: Update LoginScreen (Mobile)

```typescript
import { Alert } from 'react-native';
import { useAuthContext } from '../context/AuthContext';

export function LoginScreen({ navigation }) {
  const { handleLogin, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password are required');
      return;
    }

    try {
      await handleLogin({ email: email.trim(), password });
      // Navigation handled by AuthContext provider
    } catch (error) {
      // Error already shown by AuthContext
      console.error('[LoginScreen] Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="researcher@example.com"
        value={email}
        onChangeText={setEmail}
        editable={!isLoading}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isLoading}
      />
      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleSubmit}
        disabled={isLoading || !email || !password}
      />
    </View>
  );
}
```

### Step 4.4: Test Mobile Integration

```bash
cd apps/mobile

# Make sure backend is running
# http://localhost:5000 should be accessible

# Start Expo development server
npm run mobile

# Select Android (or web for testing)

# Try logging in with a test user

# Check Expo console for:
# [UserAuthService] Login successful
# [App] Middleware initialized successfully
```

---

## Step 5: Verify Backend Compatibility

### Check Backend Endpoints

The middleware expects these endpoints to exist on your backend:

```
POST /api/userauth/login
  Body: { username: string, password: string (Base64), token?: string, researchId?: string }
  Response: { token: string, expiresAt: string, user: User }

POST /api/userauth/refreshtoken
  Body: { token: string }
  Response: { token: string, expiresAt: string, user: User }

POST /api/session/revoke
  Body: {}
  Response: { success: boolean }
```

### Verify with Curl

```bash
# 1. Test connection to backend
curl http://localhost:5000/swagger

# 2. Test login endpoint (example)
curl -X POST http://localhost:5000/api/userauth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "researcher@example.com",
    "password": "'$(echo -n 'password' | base64)'",
    "token": "",
    "researchId": null
  }'

# Expected response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "expiresAt": "2025-10-28T23:28:00Z",
#   "user": {
#     "id": "...",
#     "username": "researcher@example.com",
#     "email": "researcher@example.com",
#     "name": "Researcher Name",
#     "roles": ["viewer"]
#   }
# }
```

---

## Step 6: Test the Integration

### Test Checklist

- [ ] Backend is running and accessible
- [ ] Environment variables are configured
- [ ] Middleware is initialized on app start
- [ ] LoginScreen uses real credentials form
- [ ] Login works with real backend
- [ ] Token is stored securely
- [ ] Navigation happens after successful login
- [ ] Token is automatically refreshed before expiration
- [ ] Logout clears user and token
- [ ] Error messages are displayed properly

### Manual Testing Steps

1. **Start backend**:
   ```bash
   cd InteroperableResearchNode
   docker-compose -f docker-compose.persistence.yml up -d
   docker-compose -f docker-compose.application.yml up -d
   ```

2. **Create test user** (if needed):
   - Use backend API or UI to create test account
   - Note username and password

3. **Start app**:
   ```bash
   # Desktop
   cd apps/desktop && npm run dev

   # Or Mobile
   cd apps/mobile && npm run android
   ```

4. **Test login**:
   - Enter test user credentials
   - Verify successful authentication
   - Check browser/console logs

5. **Test token refresh**:
   - Wait 55 minutes OR modify middleware to refresh sooner for testing
   - Token should auto-refresh
   - Check console: `[UserAuthService] Token automatically refreshed`

6. **Test logout**:
   - Click logout button
   - Verify user is cleared
   - Verify redirect to login screen

### Example Test Credentials

```
Email: developer@example.com
Password: SecurePassword123!
```

---

## Common Issues & Solutions

### "Channel expired"

**Cause**: Channel lifetime exceeded (30 minutes)
**Solution**: Middleware automatically opens new channel - no action needed. Check console logs.

**Verification**:
```typescript
// Check middleware status
console.log('[Debug] Status:', middleware.currentStatus);
// Should be: 'session-ready' (channel was refreshed automatically)
```

### "Not authenticated" on app start

**Cause**: Session expired or storage cleared
**Solution**: User must log in again. This is expected behavior.

**Fix**:
```typescript
// In AuthContext, ensure initialization handles missing auth
useEffect(() => {
  const init = async () => {
    if (middlewareAuthService.isAuthenticated()) {
      const user = await middlewareAuthService.getCurrentUser();
      setUser(user);
    }
    // If not authenticated, show login screen
  };
  init();
}, []);
```

### "CORS error" or "Cannot connect to backend"

**Cause**: Backend not running or wrong URL
**Solution**:
1. Verify backend is running: `curl http://localhost:5000/swagger`
2. Check `VITE_API_URL` environment variable
3. Verify firewall allows connection

```bash
# Test backend connectivity
curl -I http://localhost:5000

# Should return 200 OK (or redirect)
```

### "Secure storage bridge is not available" (Desktop)

**Cause**: Electron preload script not configured properly
**Solution**: Ensure `preload.ts` exposes secure storage

```typescript
// apps/desktop/src/preload/preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  storage: electron.safeStorage,
  // ... other APIs
});
```

### "Module not found: expo-secure-store" (Mobile)

**Cause**: Dependency not installed
**Solution**:
```bash
cd apps/mobile
npm install expo-secure-store
```

### Login fails with "Invalid credentials"

**Cause**: Wrong username/password
**Solution**: Verify test user exists on backend

```bash
# Test with curl
curl -X POST http://localhost:5000/api/userauth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "'$(echo -n 'testpassword' | base64)'"
  }'
```

---

## Rollback Plan

If you need to revert to mock authentication:

### Step 1: Restore Mock Service

```typescript
// Temporarily restore mock in AuthContext
import { MockAuthService } from '../services/auth/MockAuthService';

const authService = useRef(new MockAuthService());
// Comment out: const authService = useRef(new RealAuthService(...));
```

### Step 2: Revert Component Changes

Keep the component structure the same, but use mock data:

```typescript
// LoginScreen falls back to mock
const handleSubmit = async () => {
  await handleLogin({
    email: 'test@example.com',
    password: 'test'
  });
};
```

### Step 3: Clear Stored Credentials

```bash
# Desktop: Clear Electron safeStorage
rm -rf ~/.config/iris-app/*

# Mobile: Clear app data
adb shell pm clear com.iris.app
```

---

## Verification Checklist

After completing migration:

- [ ] Environment variables configured (`.env` files)
- [ ] Middleware initialized on app start
- [ ] AuthContext uses RealAuthService
- [ ] LoginScreen uses real credential form (not hardcoded)
- [ ] Login works with backend test user
- [ ] Successful login shows user and navigates
- [ ] Error messages display for failed login
- [ ] Logout clears user and redirects
- [ ] App restores user session after restart (if not expired)
- [ ] Console shows no errors related to auth
- [ ] Token is stored in secure storage (not localStorage)

---

## Performance Considerations

### Token Refresh Timing

- **Refresh**: 5 minutes before expiration
- **Default expiration**: 1 hour
- **Window**: Refresh will happen between 55-60 minutes

**To test faster** (modify middleware.ts):

```typescript
// DEVELOPMENT ONLY
const authService = new UserAuthService(
  httpClient,
  storage,
  middleware,
  {
    refreshBeforeExpiration: 10 * 1000  // 10 seconds instead of 5 minutes
  }
);
```

### Storage Performance

- **Desktop**: Electron safeStorage is synchronous, wrapped in Promise
- **Mobile**: Expo SecureStore is natively async
- All storage operations cached in memory after first access

---

## Next Steps

After successful migration:

1. **Remove mock services** - Delete unused MockAuthService files
2. **Fix type errors** - Address TypeScript compilation errors (see IMPLEMENTATION_VERIFICATION_REPORT.md)
3. **Implement real certificates** - Replace mock certificates with real X.509
4. **Add error handling** - Implement granular error types and user-friendly messages
5. **Test with real backend** - Verify with production-like data
6. **Load testing** - Test with multiple concurrent users
7. **Security audit** - Review token storage and transmission

---

## Support & Troubleshooting

**Documentation**:
- API Reference: `docs/api/MIDDLEWARE_API.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`
- Verification Report: `IMPLEMENTATION_VERIFICATION_REPORT.md`
- Quick Reference: `docs/MIDDLEWARE_QUICK_REFERENCE.md`

**Backend**:
- Start backend: `docker-compose up -d` in InteroperableResearchNode
- Backend docs: `InteroperableResearchNode/CLAUDE.md`
- Swagger: http://localhost:5000/swagger

**Issues**:
- Check console logs: `[UserAuthService]` or `[Middleware]` prefixed messages
- Check network tab: Inspect requests to `/api/userauth/*` endpoints
- Verify environment variables: `console.log(process.env)` (desktop only, removed in mobile build)

---

**Migration completed? Great! You now have real backend authentication with secure token storage, automatic refresh, and encrypted communication with the PRISM backend.**

