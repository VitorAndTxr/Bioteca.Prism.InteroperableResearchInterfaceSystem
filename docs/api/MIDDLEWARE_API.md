# Middleware API Reference

**Version**: 1.0.0
**Last Updated**: October 28, 2025
**Status**: ✅ Complete

---

## Table of Contents

1. [UserAuthService](#userauthservice)
2. [ResearchNodeMiddleware](#researchnodemiddleware)
3. [ChannelManager](#channelmanager)
4. [SessionManager](#sessionmanager)
5. [SecureStorage](#securestorage)
6. [CryptoDriver](#cryptodriver)
7. [Type Definitions](#type-definitions)
8. [Error Codes](#error-codes)

---

## UserAuthService

Main authentication service for managing user login, logout, token refresh, and session state.

### Import

```typescript
import { UserAuthService } from '@iris/middleware';
```

### Constructor

```typescript
constructor(
  httpClient: HttpClient,
  storage: SecureStorage,
  middleware: ResearchNodeMiddleware,
  options?: UserAuthServiceOptions
)
```

**Parameters**:
- `httpClient` - HTTP client for backend communication
- `storage` - Secure storage for token persistence
- `middleware` - Research node middleware for encrypted communication
- `options` - Optional configuration (see `UserAuthServiceOptions`)

### Methods

#### `login(credentials: LoginCredentials): Promise<AuthToken>`

Authenticates user with the backend and establishes a session.

**Parameters**:
- `credentials.username` (string) - User email address
- `credentials.password` (string) - User password (plain text, will be Base64 encoded)
- `credentials.researchId` (string, optional) - Research project ID

**Returns**: `Promise<AuthToken>`
```typescript
{
  token: string;        // JWT bearer token
  expiresAt: string;    // ISO8601 expiration date
}
```

**Example**:
```typescript
import { authService } from './services/middleware';

try {
  const result = await authService.login({
    username: 'researcher@example.com',
    password: 'mypassword'
  });

  console.log('Login successful');
  console.log('Token expires:', result.expiresAt);

  // Token is automatically stored in secure storage
  // and will be automatically refreshed before expiration
} catch (error) {
  console.error('Login failed:', error);
  // Error types: NetworkError, InvalidCredentials, ChannelError, SessionError
}
```

**Error Handling**:
| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid credentials` | Wrong username/password | Verify credentials and try again |
| `Network error` | Backend unreachable | Check backend is running, verify URL |
| `Channel error` | Failed to establish secure channel | Retry login, check certificate configuration |
| `Session error` | Failed to establish session | Retry login, check middleware status |

---

#### `refreshToken(): Promise<AuthToken>`

Refreshes the current authentication token.

**Returns**: `Promise<AuthToken>` - New token and expiration date

**Example**:
```typescript
try {
  const newToken = await authService.refreshToken();
  console.log('Token refreshed, new expiration:', newToken.expiresAt);
} catch (error) {
  console.error('Token refresh failed:', error);
  // If refresh fails, user will be logged out
}
```

**Notes**:
- Automatically called 5 minutes before token expiration
- Should not be called manually in normal operation
- Failed refresh automatically logs user out
- Only one refresh operation at a time (queued)

---

#### `logout(): Promise<void>`

Logs out the user and revokes the session.

**Example**:
```typescript
try {
  await authService.logout();
  console.log('Logged out successfully');
  // User state and token will be cleared
} catch (error) {
  console.warn('Logout failed (continuing anyway):', error);
  // User state is cleared even if revocation fails
}
```

**Notes**:
- Cancels any pending token refresh
- Attempts to revoke session with backend (best effort)
- Clears all stored auth data regardless of revocation success
- Safe to call even if already logged out

---

#### `isAuthenticated(): boolean`

Checks if user is currently authenticated with a valid token.

**Returns**: `boolean` - True if authenticated and token not expired (with 1-minute buffer)

**Example**:
```typescript
if (authService.isAuthenticated()) {
  const user = await authService.getCurrentUser();
  console.log('User:', user.email);
} else {
  console.log('Not authenticated, show login screen');
}
```

**Notes**:
- Includes 1-minute buffer (returns false if token expires in < 1 minute)
- Fast operation (no network call)
- Safe to call frequently

---

#### `getToken(): string | null`

Gets the current authentication token.

**Returns**: `string | null` - Token string or null if not authenticated

**Example**:
```typescript
const token = authService.getToken();
if (token) {
  // Token is valid, can use for authenticated requests
  const response = await fetch('/api/protected', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}
```

**Notes**:
- Returns null if not authenticated or token expired
- Token is already automatically included in all middleware.invoke() calls
- Manual token access should be rare

---

#### `getCurrentUser(): Promise<User>`

Gets the current authenticated user information.

**Returns**: `Promise<User>` - Current user object

**User Type**:
```typescript
interface User {
  id: string;              // Unique user ID
  username: string;        // Username (email-like)
  email: string;          // Email address
  name?: string;          // Full name
  roles?: string[];       // User roles (viewer, editor, admin, etc.)
}
```

**Example**:
```typescript
try {
  const user = await authService.getCurrentUser();
  console.log('Current user:', user.name);
  console.log('Email:', user.email);
  console.log('Roles:', user.roles);
} catch (error) {
  // User not authenticated
  console.error('Not authenticated:', error);
}
```

**Notes**:
- Requires authentication (throws if not logged in)
- User data loaded during login, cached in memory
- Data is accurate as of last login/token refresh

---

#### `getTokenExpiration(): Date | null`

Gets the token expiration date.

**Returns**: `Date | null` - Expiration datetime or null if not authenticated

**Example**:
```typescript
const expiresAt = authService.getTokenExpiration();
if (expiresAt) {
  const minutesRemaining = (expiresAt.getTime() - Date.now()) / 60000;
  console.log(`Token expires in ${minutesRemaining} minutes`);
}
```

---

#### `getTimeUntilExpiration(): number | null`

Gets milliseconds until token expiration.

**Returns**: `number | null` - Milliseconds until expiration or null

**Example**:
```typescript
const msRemaining = authService.getTimeUntilExpiration();
if (msRemaining === null) {
  console.log('Not authenticated');
} else if (msRemaining < 300000) {  // 5 minutes
  console.log('Token expiring soon, will auto-refresh');
} else {
  console.log(`Token expires in ${Math.ceil(msRemaining / 1000)} seconds`);
}
```

---

#### `ensureValidToken(): Promise<void>`

Ensures token is valid, refreshing if needed.

**Example**:
```typescript
try {
  await authService.ensureValidToken();
  // Token is now valid for at least 5 more minutes
} catch (error) {
  // Token expired, user must re-login
  console.error('Token expired:', error);
  // Navigate to login screen
}
```

**Notes**:
- Checks if token expires within refresh window (5 minutes by default)
- Automatically refreshes if needed
- Useful before making critical API calls

---

#### `initialize(): Promise<void>`

Initializes the service by loading stored auth state.

**Example**:
```typescript
// Called automatically by initializeAndHydrate()
await authService.initialize();

if (authService.isAuthenticated()) {
  console.log('User session restored from storage');
}
```

**Notes**:
- Called automatically on app startup
- Loads persisted token and user data
- Clears expired tokens
- Should not be called manually

---

#### `dispose(): Promise<void>`

Cleans up resources and clears auth state.

**Example**:
```typescript
// Called on app shutdown
await authService.dispose();
```

**Notes**:
- Called automatically by cleanupMiddleware()
- Cancels pending operations
- Clears all stored auth data
- Should only be called at app shutdown

---

### Configuration

#### UserAuthServiceOptions

```typescript
interface UserAuthServiceOptions {
  refreshBeforeExpiration?: number;  // Milliseconds before expiration to refresh
  storagePrefix?: string;             // Prefix for storage keys
}
```

**Default Values**:
```typescript
const DEFAULT_USER_AUTH_OPTIONS = {
  refreshBeforeExpiration: 5 * 60 * 1000,  // 5 minutes
  storagePrefix: 'userauth'
};
```

**Example**:
```typescript
const authService = new UserAuthService(
  httpClient,
  storage,
  middleware,
  {
    refreshBeforeExpiration: 10 * 60 * 1000,  // 10 minutes
    storagePrefix: 'myapp-auth'
  }
);
```

---

## ResearchNodeMiddleware

Core middleware implementing the 4-phase handshake protocol and encrypted communication.

### Import

```typescript
import { ResearchNodeMiddleware } from '@iris/middleware';
```

### Methods

#### `ensureSession(): Promise<void>`

Ensures a valid session exists, performing 4-phase handshake if needed.

**States**:
1. `idle` - Initial state, no channel or session
2. `channel-ready` - Encrypted channel established (Phase 1)
3. `session-ready` - Session authenticated (Phases 2-4)

**Example**:
```typescript
try {
  await middleware.ensureSession();
  // Middleware now has valid channel and session
  // Can safely call invoke()
} catch (error) {
  console.error('Failed to establish session:', error);
}
```

**Notes**:
- Automatically called before UserAuthService.login()
- Reuses existing session/channel if valid
- Handles channel expiration (30 minutes) and session expiration (1 hour)
- Safe to call multiple times

---

#### `invoke<TResponse, TPayload>(request: InvokeRequest<TPayload>): Promise<TResponse>`

Makes an encrypted API call to the backend.

**Parameters**:
```typescript
interface InvokeRequest<TPayload> {
  path: string;          // API endpoint (e.g., '/api/users')
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  payload?: TPayload;    // Request body
  headers?: Record<string, string>;
}
```

**Returns**: `Promise<TResponse>` - Decrypted response

**Example**:
```typescript
// GET request
const users = await middleware.invoke<UserData[]>({
  path: '/api/users',
  method: 'GET'
});

// POST request
const created = await middleware.invoke<CreatedItem, CreateItemPayload>({
  path: '/api/items',
  method: 'POST',
  payload: { name: 'New Item', description: 'Description' }
});

// With custom headers
const response = await middleware.invoke<Data>({
  path: '/api/data',
  method: 'GET',
  headers: { 'X-Custom-Header': 'value' }
});
```

**Automatic Handling**:
- ✅ Ensures valid session before request
- ✅ Automatically encrypts request payload
- ✅ Automatically decrypts response
- ✅ Includes session token in Authorization header
- ✅ Includes request/response tracing headers

**Error Handling**:
```typescript
try {
  const data = await middleware.invoke<Data>({
    path: '/api/endpoint',
    method: 'POST',
    payload: { ... }
  });
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof CryptoError) {
    console.error('Encryption error:', error.message);
  } else if (error instanceof SessionError) {
    console.error('Session error:', error.message);
    // Session will be automatically refreshed on next call
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

#### `revokeSession(): Promise<void>`

Revokes the current session with the backend.

**Example**:
```typescript
try {
  await middleware.revokeSession();
  console.log('Session revoked');
} catch (error) {
  console.warn('Failed to revoke session:', error);
  // Continuing - local state will be cleared anyway
}
```

**Notes**:
- Called by UserAuthService.logout()
- Best-effort operation (doesn't fail if backend unreachable)
- Local state cleared regardless of backend response

---

#### `hydrate(): Promise<void>`

Loads persisted channel and session from storage.

**Example**:
```typescript
// Called automatically by initializeAndHydrate()
await middleware.hydrate();

console.log('Middleware status:', middleware.currentStatus);
// If persisted state exists and is valid: 'session-ready'
// Otherwise: 'idle'
```

**Notes**:
- Called automatically on app startup
- Validates persisted state before loading
- Discards expired states
- Safe to call even if no persisted state exists

---

### Properties

#### `currentStatus: MiddlewareStatus`

Current state of the middleware.

**Type**: `'idle' | 'channel-ready' | 'session-ready'`

**Example**:
```typescript
console.log(middleware.currentStatus);

if (middleware.currentStatus === 'session-ready') {
  // Can safely make API calls
}
```

---

#### `channel: ChannelRuntimeState | null`

Current encrypted channel (if established).

**Properties**:
```typescript
interface ChannelRuntimeState {
  channelId: string;           // Unique channel identifier
  encryptionKey: CryptoKey;    // Symmetric key (AES-256)
  createdAt: Date;             // Channel creation time
  expiresAt: Date;             // Channel expiration (30 minutes)
}
```

---

#### `session: SessionRuntimeState | null`

Current session information (if authenticated).

**Properties**:
```typescript
interface SessionRuntimeState {
  sessionToken: string;        // Bearer token
  expiresAt: Date;            // Session expiration (1 hour)
  capabilities: SessionCapability[];
  nodeId: string;             // Connected node ID
}

type SessionCapability = 'read' | 'write' | 'admin';
```

---

## ChannelManager

Manages encrypted channels with ECDH P-384 key exchange.

### Methods

#### `openChannel(): Promise<ChannelRuntimeState>`

Opens a new encrypted channel using ECDH P-384 key exchange.

**Returns**: `Promise<ChannelRuntimeState>` - Established channel

**Example**:
```typescript
const channel = await channelManager.openChannel();
console.log('Channel opened:', channel.channelId);
console.log('Expires:', channel.expiresAt);
```

**Technical Details**:
- ECDH P-384 ephemeral keys
- AES-256-GCM symmetric encryption
- Perfect forward secrecy (keys discarded after use)
- 30-minute lifetime
- Phase 1 of 4-phase handshake

---

#### `isChannelValid(channel: ChannelRuntimeState): boolean`

Checks if a channel is still valid (not expired).

---

## SessionManager

Manages authenticated sessions with token-based authentication.

### Methods

#### `authenticateSession(channel: ChannelRuntimeState): Promise<SessionRuntimeState>`

Authenticates a channel to create a session (Phases 2-4 of handshake).

**Phases**:
- **Phase 2**: Node identification with X.509 certificates
- **Phase 3**: Mutual authentication with RSA-SHA256 challenge-response
- **Phase 4**: Token issuance and capability assignment

---

#### `isSessionValid(session: SessionRuntimeState): boolean`

Checks if a session is still valid (not expired).

---

## SecureStorage

Interface for platform-specific secure credential storage.

### Interface

```typescript
interface SecureStorage {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

### Implementations

#### ElectronSecureStorage (Desktop)

Platform-specific encryption using OS APIs.

**Windows**: Data Protection API (DPAPI)
**macOS**: Keychain Services
**Linux**: libsecret

```typescript
import { createElectronSecureStorage } from './storage/ElectronSecureStorage';

const storage = createElectronSecureStorage('scope-prefix');
await storage.setItem('key', { data: 'value' });
const data = await storage.getItem('key');
```

#### ReactNativeSecureStorage (Mobile)

Expo SecureStore integration for React Native.

**iOS**: Keychain Services
**Android**: EncryptedSharedPreferences

```typescript
import { createReactNativeSecureStorage } from './storage/ReactNativeSecureStorage';

const storage = createReactNativeSecureStorage('scope-prefix');
await storage.setItem('key', { data: 'value' });
const data = await storage.getItem('key');
```

---

## CryptoDriver

Wrapper around Web Crypto API for encryption/decryption operations.

### Methods

#### `generateEphemeralKeyPair(): Promise<KeyPair>`

Generates ECDH P-384 ephemeral key pair.

---

#### `encrypt<T>(data: T, key: CryptoKey): Promise<EncryptedData>`

Encrypts data with AES-256-GCM.

```typescript
const encrypted = await cryptoDriver.encrypt(
  { sensitive: 'data' },
  encryptionKey
);
// Result: { ciphertext, iv, tag }
```

---

#### `decrypt<T>(encrypted: EncryptedData, key: CryptoKey): Promise<T>`

Decrypts AES-256-GCM encrypted data.

```typescript
const decrypted = await cryptoDriver.decrypt<OriginalData>(
  encrypted,
  encryptionKey
);
```

---

## Type Definitions

### LoginCredentials

```typescript
interface LoginCredentials {
  username: string;           // Email or username
  password: string;           // Plain text password
  researchId?: string;        // Optional research project ID
}
```

### AuthToken

```typescript
interface AuthToken {
  token: string;              // JWT bearer token
  expiresAt: string;          // ISO8601 timestamp
}
```

### LoginResponse

```typescript
interface LoginResponse {
  user: User;
  token: string;
  expiresAt: Date;
}
```

### User

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  roles?: string[];
}
```

### ResearchNodeCertificateConfig

```typescript
interface ResearchNodeCertificateConfig {
  subjectName: string;                  // X.509 subject name (CN=...)
  certificate: string;                  // Base64-encoded certificate
  certificateWithPrivateKey: string;    // Base64-encoded cert + private key
  password: string;                     // Password for private key
  validFrom: string;                    // ISO8601 start date
  validTo: string;                      // ISO8601 end date
  thumbprint: string;                   // SHA-256 fingerprint
  serialNumber: string;                 // Certificate serial number
}
```

---

## Error Codes

### Network Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `NETWORK_ERROR` | Network request failed | Backend unreachable | Check backend is running, verify URL |
| `TIMEOUT` | Request timeout | Backend slow or offline | Increase timeout, check network |
| `CONNECTION_REFUSED` | Connection refused | Backend port wrong | Verify `VITE_API_URL` or `EXPO_PUBLIC_API_URL` |

### Authentication Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `INVALID_CREDENTIALS` | Invalid username or password | Wrong credentials | Verify credentials and try again |
| `NOT_AUTHENTICATED` | User not authenticated | No valid token | Call login() first |
| `TOKEN_EXPIRED` | Token expired | Session lifetime exceeded | Auto-refresh will handle this |
| `SESSION_ERROR` | Failed to establish session | 4-phase handshake failed | Check certificate configuration |

### Encryption Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `CRYPTO_ERROR` | Cryptographic operation failed | WebCrypto API error | Check browser/environment support |
| `DECRYPTION_FAILED` | Failed to decrypt response | Corrupted data or wrong key | Check network, retry request |
| `CHANNEL_ERROR` | Failed to establish channel | ECDH key exchange failed | Retry, check backend |

### Storage Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| `STORAGE_ERROR` | Storage operation failed | Platform-specific error | Check disk space, permissions |
| `STORAGE_UNAVAILABLE` | Secure storage not available | Device doesn't support | Fall back to unsafe storage (dev only) |
| `STORAGE_QUOTA_EXCEEDED` | Storage quota exceeded | Too much data stored | Clear old data, check token size |

---

## Common Usage Patterns

### Pattern 1: Login and Auto-Refresh

```typescript
import { authService, initializeAndHydrate } from '@/services/middleware';

// Initialize on app start
useEffect(() => {
  initializeAndHydrate();
}, []);

// Login with auto-refresh
const handleLogin = async (email: string, password: string) => {
  try {
    await authService.login({ username: email, password });
    // Token will auto-refresh every 55 minutes
    // No manual refresh needed
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Pattern 2: Protected API Call

```typescript
import { middleware } from '@/services/middleware';

// Make encrypted API call
const getUsers = async () => {
  try {
    const users = await middleware.invoke<User[]>({
      path: '/api/users',
      method: 'GET'
    });
    return users;
  } catch (error) {
    console.error('Failed to get users:', error);
  }
};
```

### Pattern 3: Ensure Authenticated

```typescript
import { authService, middleware } from '@/services/middleware';

// Before critical operation
const doSomethingImportant = async () => {
  try {
    // Ensure user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    // Ensure valid token (auto-refresh if needed)
    await authService.ensureValidToken();

    // Ensure valid session
    await middleware.ensureSession();

    // Now safe to proceed
    const result = await middleware.invoke({...});
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    // Show login screen or error message to user
  }
};
```

---

## See Also

- [Migration Guide](../guides/MIGRATION_GUIDE_AUTH.md) - How to integrate middleware
- [IMPLEMENTATION_SUMMARY.md](../../IMPLEMENTATION_SUMMARY.md) - Implementation details
- [IMPLEMENTATION_VERIFICATION_REPORT.md](../../IMPLEMENTATION_VERIFICATION_REPORT.md) - Verification status
- [MIDDLEWARE_QUICK_REFERENCE.md](../MIDDLEWARE_QUICK_REFERENCE.md) - Quick reference card

