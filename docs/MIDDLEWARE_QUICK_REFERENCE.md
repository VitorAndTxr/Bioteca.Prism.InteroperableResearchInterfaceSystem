# Middleware Quick Reference Card

**Keep this handy while developing with IRIS middleware!**

---

## 🚀 One-Time Setup

### 1. Start Backend

```bash
cd InteroperableResearchNode
docker-compose -f docker-compose.persistence.yml up -d
docker-compose -f docker-compose.application.yml up -d
# Backend at: http://localhost:5000
```

### 2. Configure Environment

**Desktop** (`apps/desktop/.env`):
```bash
VITE_API_URL=http://localhost:5000
```

**Mobile** (`apps/mobile/.env`):
```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
```

### 3. Initialize on App Start

```typescript
// App.tsx or main.tsx
import { initializeAndHydrate } from './services/middleware';

useEffect(() => {
  initializeAndHydrate();
}, []);
```

---

## 🔐 Authentication (UserAuthService)

### Login

```typescript
import { authService } from './services/middleware';

const result = await authService.login({
  username: 'researcher@example.com',
  password: 'password'  // Will be Base64 encoded automatically
});

console.log('Token:', result.token);
console.log('Expires:', result.expiresAt);
```

### Check Authentication

```typescript
if (authService.isAuthenticated()) {
  const user = await authService.getCurrentUser();
  console.log('User:', user.name);
}
```

### Get Token Expiration

```typescript
const expiresAt = authService.getTokenExpiration();
const msRemaining = authService.getTimeUntilExpiration();

console.log(`Expires in ${msRemaining / 60000} minutes`);
```

### Logout

```typescript
await authService.logout();
// Token and user data cleared
// App should navigate to login screen
```

### Auto-Refresh

```typescript
// Automatic! Token refreshes 5 minutes before expiration
// No manual action needed

// If you need to ensure token is valid:
await authService.ensureValidToken();
```

---

## 📡 Encrypted API Calls

### GET Request

```typescript
import { middleware } from './services/middleware';

const data = await middleware.invoke<DataType>({
  path: '/api/endpoint',
  method: 'GET'
});
```

### POST Request

```typescript
const created = await middleware.invoke<ResponseType, RequestType>({
  path: '/api/items',
  method: 'POST',
  payload: {
    name: 'Item Name',
    description: 'Description'
  }
});
```

### PUT Request

```typescript
const updated = await middleware.invoke<ResponseType, UpdateType>({
  path: '/api/items/123',
  method: 'PUT',
  payload: { name: 'Updated Name' }
});
```

### DELETE Request

```typescript
await middleware.invoke<void>({
  path: '/api/items/123',
  method: 'DELETE'
});
```

### With Custom Headers

```typescript
const response = await middleware.invoke<Data>({
  path: '/api/endpoint',
  method: 'GET',
  headers: { 'X-Custom': 'value' }
});
```

---

## 🛡️ Error Handling

### Try/Catch Pattern

```typescript
try {
  const data = await middleware.invoke({ path: '/api/data' });
} catch (error) {
  if (error.message.includes('not authenticated')) {
    // Show login screen
    navigation.navigate('Login');
  } else if (error.message.includes('Channel expired')) {
    // Auto-handled, just retry
    retry();
  } else {
    // Show error to user
    Alert.alert('Error', error.message);
  }
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Not authenticated" | Token expired | Re-login |
| "Invalid credentials" | Wrong password | Check credentials |
| "Network error" | Backend offline | Check backend is running |
| "Channel expired" | 30-min timeout | Auto-refreshed, retry |
| "Session expired" | 1-hour timeout | Auto-refreshed, retry |

---

## 📝 AuthContext Integration

### Desktop Example

```typescript
import { useAuthContext } from './context/AuthContext';

function LoginScreen() {
  const { handleLogin, isLoading, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleLogin({ email, password });
      // Navigation happens automatically
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={email} onChange={e => setEmail(e.target.value)} />
      <Password value={password} onChange={e => setPassword(e.target.value)} />
      {error && <Toast variant="error">{error}</Toast>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

### Mobile Example

```typescript
import { useAuthContext } from './context/AuthContext';
import { Alert } from 'react-native';

function LoginScreen({ navigation }) {
  const { handleLogin, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await handleLogin({ email, password });
      // Navigation happens automatically
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={isLoading ? 'Logging in...' : 'Login'} onPress={handleSubmit} disabled={isLoading} />
    </View>
  );
}
```

---

## 🔧 Debugging

### Check Middleware Status

```typescript
import { middleware, authService } from './services/middleware';

// Check middleware state
console.log('Status:', middleware.currentStatus);
// 'idle' | 'channel-ready' | 'session-ready'

console.log('Channel:', middleware.channel?.channelId);
console.log('Session:', middleware.session?.sessionToken);

// Check auth state
console.log('Authenticated:', authService.isAuthenticated());
console.log('Token:', authService.getToken());
console.log('User:', authService.getCurrentUser());
console.log('Expires:', authService.getTokenExpiration());
```

### Enable Console Logging

```typescript
// Look for these prefixes in console:
// [UserAuthService] - Auth events
// [Middleware] - Core middleware events
// [Channel] - Encryption channel events
// [Session] - Session events

// All major operations log their status
// Check console for detailed debugging info
```

### Test Backend Connectivity

```bash
# Test backend is running
curl http://localhost:5000/swagger

# Test login endpoint
curl -X POST http://localhost:5000/api/userauth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "'$(echo -n 'password' | base64)'"
  }'
```

---

## 📊 Usage Metrics

### Monitor Token Lifecycle

```typescript
// At login
console.log('Token obtained');

// During session
setInterval(() => {
  const remaining = authService.getTimeUntilExpiration();
  console.log(`Token expires in: ${remaining / 60000} minutes`);
}, 60000);  // Check every minute

// Auto-refresh happens automatically
// [UserAuthService] Token automatically refreshed

// At logout
console.log('Token cleared');
```

### Performance Indicators

```typescript
// Storage read/write (async, fast)
const startTime = Date.now();
const token = await authService.getToken();
console.log(`Storage read: ${Date.now() - startTime}ms`);

// API call (includes encryption/decryption)
const startTime = Date.now();
const response = await middleware.invoke({ path: '/api/test' });
console.log(`API call: ${Date.now() - startTime}ms`);
```

---

## ⚙️ Configuration Reference

### Default Settings

```typescript
// Token refresh timing
refreshBeforeExpiration: 5 * 60 * 1000  // 5 minutes before expiry

// Storage
storagePrefix: 'userauth'               // Prefix for storage keys

// Backend
apiUrl: 'http://localhost:5000'         // From environment variables

// Encryption
algorithm: 'AES-256-GCM'                // Symmetric encryption
keyExchange: 'ECDH P-384'               // Key exchange algorithm

// Sessions
channelLifetime: 30 * 60 * 1000         // 30 minutes
sessionLifetime: 60 * 60 * 1000         // 1 hour
```

### Customize Settings

```typescript
// Desktop: apps/desktop/src/services/middleware.ts
const authService = new UserAuthService(
  httpClient,
  storage,
  middleware,
  {
    refreshBeforeExpiration: 10 * 60 * 1000,  // 10 minutes
    storagePrefix: 'custom-prefix'
  }
);
```

---

## 🧪 Testing Checklist

- [ ] Backend running at `http://localhost:5000`
- [ ] Environment variables configured
- [ ] Middleware initializes on app start
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong credentials fails with error
- [ ] User info displays after login
- [ ] Token stored securely (check storage, not localStorage)
- [ ] API calls work (GET, POST, PUT, DELETE)
- [ ] Token auto-refresh happens (check console)
- [ ] Logout clears user and token
- [ ] App navigation works correctly
- [ ] Error handling displays messages

---

## 📚 Documentation Links

| Topic | File |
|-------|------|
| **Complete Implementation** | `IMPLEMENTATION_SUMMARY.md` |
| **Verification Status** | `IMPLEMENTATION_VERIFICATION_REPORT.md` |
| **Step-by-Step Migration** | `docs/guides/MIGRATION_GUIDE_AUTH.md` |
| **Full API Reference** | `docs/api/MIDDLEWARE_API.md` |
| **Architecture** | `CLAUDE.md` (Middleware section) |

---

## 🆘 Quick Troubleshooting

### "Not authenticated" on startup
**→ User logged out or token expired. This is normal. Show login screen.**

### "Invalid credentials"
**→ Wrong email or password. Ask user to verify and retry.**

### "Network error"
**→ Backend not running. Start: `docker-compose -f docker-compose.*.yml up -d`**

### "Channel expired"
**→ Normal after 30 minutes. Middleware auto-fixes. Just retry the call.**

### "Session expired"
**→ Normal after 1 hour. Middleware auto-refreshes. Just retry the call.**

### "Secure storage bridge is not available"
**→ (Desktop) Preload script not configured. Check `preload.ts` exports storage.**

### "Module not found: expo-secure-store"
**→ (Mobile) Install: `npm install expo-secure-store`**

### "Token won't refresh"
**→ Check console for errors. Verify backend `/api/userauth/refreshtoken` endpoint exists.**

### API calls failing
**→ Check: 1) isAuthenticated() 2) middleware.currentStatus 3) Network tab for requests**

---

## ⏱️ Timing Reference

| Event | Timing |
|-------|--------|
| **Channel lifetime** | 30 minutes |
| **Session lifetime** | 1 hour |
| **Token refresh trigger** | 5 minutes before expiry |
| **Auto-refresh delay** | < 100ms |
| **Storage operations** | 5-50ms |
| **Typical API call** | 100-500ms |
| **Encryption/decryption** | 5-20ms |

---

## 💡 Pro Tips

1. **Always check `isAuthenticated()` before accessing user data**
2. **Use `middleware.invoke()` for all API calls - handles everything automatically**
3. **Let auto-refresh happen - don't manually call `refreshToken()`**
4. **Check console logs (with `[UserAuthService]` prefix) for debugging**
5. **Store long-lived tokens in secure storage, not memory**
6. **Test with real backend - mock responses won't catch all issues**
7. **Handle network errors gracefully - backend might be temporarily down**
8. **Never log tokens or passwords**

---

**Last Updated**: October 28, 2025
**Status**: ✅ Ready to Use

