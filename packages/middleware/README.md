# IRIS Middleware

Research Node Middleware for secure communication with the PRISM InteroperableResearchNode backend.

## Overview

This package provides a complete client-side implementation for communicating with the PRISM Research Node backend, including:

- **4-Phase Handshake**: Channel establishment, node identification, authentication, and session management
- **End-to-End Encryption**: AES-256-GCM encryption for all communications
- **User Authentication**: Login, logout, and automatic token refresh
- **Secure Storage**: Platform-specific secure storage interfaces
- **Type-Safe API**: Full TypeScript support with strict mode

## Installation

```bash
npm install @iris/middleware
```

## Quick Start

### 1. Set Up Storage

```typescript
// Desktop (Electron)
import { createElectronSecureStorage } from './storage/ElectronSecureStorage';
const storage = createElectronSecureStorage('iris-desktop');

// Mobile (React Native)
import { createReactNativeSecureStorage } from './storage/ReactNativeSecureStorage';
const storage = createReactNativeSecureStorage('iris-mobile');
```

### 2. Configure Middleware

```typescript
import {
  ResearchNodeMiddleware,
  ChannelManager,
  SessionManager,
  WebCryptoDriver,
  FetchHttpClient,
  UserAuthService
} from '@iris/middleware';

// Create dependencies
const httpClient = new FetchHttpClient('http://localhost:5000');
const cryptoDriver = new WebCryptoDriver();
const channelManager = new ChannelManager(httpClient, cryptoDriver);
const sessionManager = new SessionManager(httpClient, cryptoDriver);

// Create middleware
const middleware = new ResearchNodeMiddleware({
  channelManager,
  sessionManager,
  certificate: yourCertificate,
  nodeId: 'your-node-id',
  signChallenge: yourSignFunction,
  onChannelPersist: async (channel) => {
    await storage.setItem('channel', channel);
  },
  onSessionPersist: async (session) => {
    await storage.setItem('session', session);
  }
});

// Create auth service
const authService = new UserAuthService(
  httpClient,
  storage,
  middleware
);
```

### 3. Use Authentication

```typescript
// Initialize (restores saved session)
await authService.initialize();

// Login
const result = await authService.login({
  username: 'researcher@example.com',
  password: 'mypassword'
});

console.log('Token:', result.token);
console.log('Expires:', result.expiresAt);

// Check authentication
if (authService.isAuthenticated()) {
  const user = await authService.getCurrentUser();
  console.log('Logged in as:', user.name);
}

// Logout
await authService.logout();
```

## Core Components

### UserAuthService

Handles user authentication and session management.

**Key Features**:
- Automatic token refresh (5 minutes before expiration)
- Secure token storage
- Session persistence across app restarts

**API**:
```typescript
class UserAuthService {
  async initialize(): Promise<void>
  async login(credentials: LoginCredentials): Promise<AuthToken>
  async refreshToken(): Promise<AuthToken>
  async logout(): Promise<void>
  isAuthenticated(): boolean
  getToken(): string | null
  async getCurrentUser(): Promise<User>
  async ensureValidToken(): Promise<void>
}
```

### ResearchNodeMiddleware

Orchestrates the 4-phase handshake protocol.

**Key Features**:
- Automatic channel establishment
- Automatic session creation
- State machine: idle → channel-ready → session-ready
- Encrypted API calls

**API**:
```typescript
class ResearchNodeMiddleware {
  async hydrate(): Promise<void>
  async ensureChannel(): Promise<ChannelRuntimeState>
  async ensureSession(): Promise<SessionRuntimeState>
  async ensureSessionValid(): Promise<SessionRuntimeState>
  async invoke<TPayload, TResponse>(options: InvokeOptions<TPayload>): Promise<TResponse>
  async revokeSession(): Promise<void>
  async reset(): Promise<void>

  get currentStatus(): MiddlewareStatus
  get channel(): ChannelRuntimeState | null
  get session(): SessionRuntimeState | null
}
```

### ChannelManager

Manages encrypted communication channels.

**Key Features**:
- ECDH P-384 key exchange
- AES-256-GCM symmetric encryption
- 30-minute channel lifetime
- Automatic channel restoration

**API**:
```typescript
class ChannelManager {
  async openChannel(): Promise<{
    runtime: ChannelRuntimeState;
    persisted: PersistedChannelState;
    response: ChannelOpenResponse;
  }>
  async restoreFromPersisted(state: PersistedChannelState): Promise<ChannelRuntimeState>
}
```

### SessionManager

Manages authenticated sessions.

**Key Features**:
- Node identification (Phase 2)
- Challenge-response authentication (Phase 3)
- Session token management (Phase 4)
- Encrypted payloads

**API**:
```typescript
class SessionManager {
  async identifyNode(channel: ChannelRuntimeState, payload: NodeIdentifyPayload): Promise<NodeIdentifyResult>
  async requestChallenge(channel: ChannelRuntimeState, payload: ChallengeRequestPayload): Promise<ChallengeResponseResult>
  async authenticate(channel: ChannelRuntimeState, payload: AuthenticationPayload): Promise<AuthenticationResult>
  async whoAmI(channel: ChannelRuntimeState, session: SessionRuntimeState): Promise<SessionWhoAmIResult>
  async renewSession(channel: ChannelRuntimeState, session: SessionRuntimeState, additionalSeconds: number): Promise<SessionRenewResult>
  async revokeSession(channel: ChannelRuntimeState, session: SessionRuntimeState): Promise<void>
  async submitEncryptedPayload<TPayload, TResponse>(/* ... */): Promise<TResponse>
}
```

## Storage Interface

```typescript
interface SecureStorage {
  getItem<T>(key: string): Promise<T | null>
  setItem<T>(key: string, value: T): Promise<void>
  removeItem(key: string): Promise<void>
}
```

**Implementations**:
- **ElectronSecureStorage**: Uses Electron safeStorage (DPAPI/Keychain/libsecret)
- **ReactNativeSecureStorage**: Uses Expo SecureStore (Keychain/EncryptedSharedPreferences)

## Advanced Usage

### Manual Channel Management

```typescript
// Open new channel
const channel = await middleware.ensureChannel();
console.log('Channel ID:', channel.channelId);
console.log('Expires:', channel.expiresAt);

// Check channel status
if (middleware.currentStatus === 'channel-ready') {
  console.log('Channel is ready');
}
```

### Manual Session Management

```typescript
// Create new session
const session = await middleware.ensureSession();
console.log('Session Token:', session.sessionToken);
console.log('Capabilities:', session.capabilities);

// Refresh session if expiring soon
const validSession = await middleware.ensureSessionValid();

// Revoke session
await middleware.revokeSession();
```

### Custom API Calls

```typescript
// Make encrypted API call
const response = await middleware.invoke({
  path: '/api/custom/endpoint',
  method: 'POST',
  payload: { data: 'value' }
});

console.log('Response:', response);
```

### State Persistence

```typescript
// Save state to storage
await middleware.options.onChannelPersist?.(
  middleware.channel ? channelManager.toPersisted(middleware.channel) : null
);

// Restore state from storage
const storedChannel = await storage.getItem('channel');
if (storedChannel) {
  await middleware.hydrate();
}
```

## Configuration

### Backend URL

```typescript
const httpClient = new FetchHttpClient('http://localhost:5000');
```

### Certificate

```typescript
const certificate: ResearchNodeCertificateConfig = {
  subjectName: 'CN=Your-Node-Name',
  certificate: 'BASE64_CERT',
  certificateWithPrivateKey: 'BASE64_CERT_WITH_KEY',
  password: 'cert-password',
  validFrom: '2025-01-01T00:00:00Z',
  validTo: '2026-01-01T00:00:00Z',
  thumbprint: 'CERT_THUMBPRINT',
  serialNumber: 'CERT_SERIAL'
};
```

### Auto-Refresh Timing

```typescript
const authService = new UserAuthService(
  httpClient,
  storage,
  middleware,
  {
    refreshBeforeExpiration: 5 * 60 * 1000, // 5 minutes (default)
    storagePrefix: 'userauth' // Storage key prefix
  }
);
```

## Error Handling

```typescript
try {
  await authService.login({ username: 'user', password: 'pass' });
} catch (error) {
  if (error.message.includes('Invalid credentials')) {
    console.error('Wrong username or password');
  } else if (error.message.includes('Network')) {
    console.error('Connection failed');
  } else {
    console.error('Login failed:', error);
  }
}
```

## State Machine

```
┌──────┐
│ idle │
└───┬──┘
    │ ensureChannel()
    ▼
┌──────────────┐
│channel-ready │
└───┬──────────┘
    │ ensureSession()
    ▼
┌──────────────┐
│session-ready │ ◄──┐
└───┬──────────┘    │
    │               │ ensureSessionValid()
    │ revokeSession()│ (auto-refresh)
    ▼               │
┌──────┐            │
│ idle │────────────┘
└──────┘
```

## Security

### Encryption

- **Channel**: ECDH P-384 + AES-256-GCM
- **Passwords**: Base64 encoded (transmitted over encrypted channel)
- **Tokens**: Stored in platform-specific secure storage
- **Perfect Forward Secrecy**: Ephemeral keys per channel

### Storage

- **Desktop**: OS-level encryption (DPAPI/Keychain/libsecret)
- **Mobile**: Keychain (iOS) / EncryptedSharedPreferences (Android)
- **Fallback**: Never store sensitive data in localStorage in production

### Best Practices

✅ **DO**:
- Use secure storage implementations
- Check `isAuthenticated()` before sensitive operations
- Handle token expiration gracefully
- Log errors without exposing tokens

❌ **DON'T**:
- Store passwords locally
- Log tokens or passwords
- Use mock certificates in production
- Skip certificate validation

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

**Quick Test**:
```typescript
// Mock storage for testing
const mockStorage: SecureStorage = {
  async getItem(key) { return null; },
  async setItem(key, value) { },
  async removeItem(key) { }
};

// Test authentication flow
const authService = new UserAuthService(
  httpClient,
  mockStorage,
  middleware
);

await authService.login({ username: 'test', password: 'test' });
console.log('Authenticated:', authService.isAuthenticated());
```

## Troubleshooting

### "Not authenticated" errors

Check if token is expired:
```typescript
if (!authService.isAuthenticated()) {
  console.log('Token expired, please login again');
  await authService.login({ username, password });
}
```

### "Channel expired" errors

Middleware automatically reopens channels. If errors persist:
```typescript
await middleware.reset(); // Reset all state
await middleware.ensureChannel(); // Open new channel
```

### Storage errors

Check platform-specific storage availability:
```typescript
// Electron
if (!window.electron?.secureStorage) {
  console.error('Secure storage not available');
}

// React Native
import * as SecureStore from 'expo-secure-store';
const available = await SecureStore.isAvailableAsync();
```

## API Reference

See TypeScript definitions for complete API documentation:
- [UserAuthService.types.ts](./src/auth/UserAuthService.types.ts)
- [types.ts](./src/types.ts)

## Dependencies

- **No runtime dependencies** (peer dependencies only)
- Uses native `fetch` and `crypto.subtle` (WebCrypto)
- Platform-specific storage via separate implementations

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Run type check: `npm run type-check`

## License

MIT

## Related Packages

- `@iris/domain` - Shared types and models
- `@iris/desktop` - Electron desktop application
- `@iris/mobile` - React Native mobile application

## Support

For issues and questions:
- GitHub Issues: [PRISM Repository](https://github.com/your-org/prism)
- Documentation: [PRISM Docs](../../../docs/)

## Version

Current Version: **1.0.0**

Last Updated: October 28, 2025
