# Middleware Authentication Fix Summary

**Date**: October 30, 2025
**Issue**: Desktop app fails during Phase 2 (Node Identification) with decryption errors

## Problem Analysis

The desktop app was experiencing two critical issues during middleware authentication:

### Issue #1: HttpClient Error Handling ❌

**Problem**: When the backend returned a 400 error response (with a plain JSON error object), the client tried to decrypt it as if it were an `EncryptedPayload`, causing a base64 decoding error.

**Error Log**:
```
HttpClient.ts:38 [HttpClient]    Data: {
  "error": {
    "code": "ERR_DECRYPTION_FAILED",
    "message": "Failed to decrypt request payload: ..."
  }
}
Login.tsx:106  [LoginScreen]    ❌ Login failed: InvalidCharacterError:
Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.
    at base64ToArrayBuffer (CryptoDriver.ts:47:31)
    at SessionManager.decrypt (SessionManager.ts:26:34)
```

**Root Cause**: The `FetchHttpClient` in `packages/middleware/src/http/HttpClient.ts` was not checking the HTTP status code before returning the response. It always returned the data, regardless of whether it was a success (2xx) or error (4xx/5xx) response.

**Fix Applied**:
- Added HTTP status check in `FetchHttpClient.request()` (lines 50-57)
- Throws an error for non-2xx responses **before** returning to caller
- This prevents `SessionManager` from attempting to decrypt error responses
- Error contains status code and full response data for debugging

```typescript
// Throw an error for non-2xx responses
if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).response = { status: response.status, headers: responseHeaders, data };
    console.error('[HttpClient] ❌ Request failed:', error.message);
    console.error('[HttpClient]    Error data:', JSON.stringify(data, null, 2));
    throw error;
}
```

---

### Issue #2: Middleware Initialization ❌ ✅ (Partial Fix)

**Problem**: The middleware needs to be initialized synchronously for imports but requires async operations to load persisted state.

**Trade-off Decision**:

Due to the synchronous import requirements of `AuthContext.tsx`, we've implemented a **staged initialization pattern**:

1. **Stage 1 (Synchronous)**: Create middleware with null persisted state
2. **Stage 2 (Async)**: Load and hydrate persisted state in `initializeAndHydrate()`

**Implication**:
- ⚠️ **Persisted channel/session state is not currently being used** on app startup
- Users will need to re-authenticate on every app restart (not ideal for UX)
- Channel state is properly persisted during runtime but not restored on next launch

**Fix Applied** (Synchronous Pattern):

```typescript
// Stage 1: Synchronous initialization (line 112)
function initializeMiddleware() {
    const storage = createElectronSecureStorage('iris-desktop');
    const httpClient = new FetchHttpClient(BACKEND_URL, { ... });
    const cryptoDriver = new WebCryptoDriver();
    const channelManager = new ChannelManager(httpClient, cryptoDriver);
    const sessionManager = new SessionManager(httpClient, cryptoDriver);

    // Create middleware with null initial state
    const middleware = new ResearchNodeMiddleware({
        channelManager,
        sessionManager,
        certificate: CERTIFICATE_CONFIG,
        nodeId: 'noda_a',
        initialChannel: null,  // ⚠️ Not loading persisted state yet
        initialSession: null,  // ⚠️ Not loading persisted state yet
        signChallenge: mockSignChallenge,
        onChannelPersist: async (channel) => { ... },
        onSessionPersist: async (session) => { ... }
    });

    return { middleware, authService, storage, ... };
}

// Singleton pattern (line 190)
export function getMiddlewareServices() {
    if (!services) {
        services = initializeMiddleware();
    }
    return services;
}

// Direct exports for synchronous imports (line 232)
export const { middleware, authService, userAuthService } = getMiddlewareServices();

// Stage 2: Async hydration (line 201)
export async function initializeAndHydrate() {
    const { middleware, userAuthService } = getMiddlewareServices();

    // Note: Middleware was created with null initial state
    // Hydrate will initialize with empty state
    await middleware.hydrate();
    await userAuthService.initialize();
}
```

**Future Improvement Needed**:

To properly support persisted state restoration, we need to:

1. **Option A**: Refactor AuthContext to use async initialization
2. **Option B**: Implement a middleware factory pattern that recreates the middleware with loaded state
3. **Option C**: Add a `setInitialState()` method to ResearchNodeMiddleware

Recommended: **Option B** - Add a re-initialization method to `middleware.ts`:

```typescript
export async function rehydrateMiddleware() {
    const { storage } = getMiddlewareServices();
    const channel = await storage.getItem('channel');
    const session = await storage.getItem('session');

    if (channel || session) {
        // Recreate middleware with loaded state
        services = null; // Clear singleton
        const newServices = initializeMiddleware();
        // TODO: Manually set channel/session on middleware
        await newServices.middleware.hydrate();
    }
}
```

---

## Testing Recommendations

### 1. Fresh Start (No Persisted State)
```bash
# Clear Electron secure storage
# Restart desktop app
# Login should trigger: Phase 1 → Phase 2 → Phase 3 → Phase 4
```

**Expected Behavior**:
- ✅ Phase 1 (Channel) succeeds
- ✅ Channel is persisted to secure storage
- ✅ Phase 2 (Identification) uses the same channel
- ✅ Backend can decrypt client requests
- ✅ Client handles backend errors gracefully (no base64 errors)

### 2. Restart with Persisted State
```bash
# Login once (to create persisted state)
# Close desktop app
# Reopen desktop app
```

**Expected Behavior**:
- ✅ Middleware loads persisted channel/session on startup
- ✅ `middleware.hydrate()` successfully restores state
- ✅ If session is still valid, user is auto-authenticated
- ✅ If session expired, new Phase 1-4 handshake occurs with new channel

### 3. Backend Error Handling
```bash
# Stop InteroperableResearchNode backend
# Attempt login
```

**Expected Behavior**:
- ✅ Phase 1 fails with connection error
- ✅ Error is thrown by HttpClient (not decryption error)
- ✅ UI shows appropriate error message
- ✅ No "Failed to execute 'atob'" errors

---

## Remaining Issues (Out of Scope)

### Backend Decryption Error (ERR_DECRYPTION_FAILED)

**Status**: ⚠️ **Still needs investigation**

The backend is returning:
```json
{
  "error": {
    "code": "ERR_DECRYPTION_FAILED",
    "message": "Failed to decrypt request payload: The computed authentication tag did not match the input authentication tag."
  }
}
```

**Possible Causes**:

1. **Symmetric key mismatch**: Client and backend derived different keys from ECDH
   - Check: Client nonce order (client + server) matches backend
   - Check: HKDF parameters (SHA-256, info context) match
   - Check: Key derivation bits (384 for P-384)

2. **Encryption format mismatch**: AES-GCM tag handling
   - Client: WebCrypto returns ciphertext + tag concatenated
   - Backend: .NET AesGcm expects separate ciphertext and tag
   - Check: Tag extraction (last 16 bytes) is correct

3. **Base64 encoding issue**: Data corruption during encoding/decoding
   - Check: Client uses proper btoa/atob or Buffer.from
   - Check: No whitespace or invalid characters in base64 strings

4. **Channel persistence issue**: Channel restored incorrectly
   - Check: Symmetric key export/import works correctly
   - Check: CryptoKey can be re-created from base64 string

**Next Steps**:

1. Add detailed logging to CryptoDriver encrypt/decrypt functions:
   ```typescript
   console.log('[CryptoDriver] Encrypting payload:', payload);
   console.log('[CryptoDriver]    IV (base64):', bufferToBase64(iv.buffer));
   console.log('[CryptoDriver]    Ciphertext length:', ciphertext.length);
   console.log('[CryptoDriver]    Tag (base64):', bufferToBase64(authTag.buffer));
   ```

2. Test encryption/decryption roundtrip **before** sending to backend:
   ```typescript
   const encrypted = await cryptoDriver.encrypt(testPayload, symmetricKey);
   const decrypted = await cryptoDriver.decrypt(encrypted, symmetricKey);
   console.log('Roundtrip test:', JSON.stringify(testPayload) === JSON.stringify(decrypted));
   ```

3. Compare client and backend symmetric keys:
   ```typescript
   console.log('[ChannelManager] Symmetric key (base64):', symmetricKeyExport);
   // Check if backend logs the same key
   ```

4. Enable verbose logging in backend ChannelEncryptionService:
   ```csharp
   _logger.LogDebug("Decrypting payload - IV: {IV}, Tag: {Tag}",
       Convert.ToBase64String(nonce), Convert.ToBase64String(tag));
   ```

---

## Files Modified

### packages/middleware/src/http/HttpClient.ts
- Added HTTP status check (throws error for non-2xx)
- Added error logging with response data

### apps/desktop/src/services/middleware.ts
- Made `initializeMiddleware()` async
- Load persisted state before creating middleware
- Pass `initialChannel` and `initialSession` to middleware constructor
- Updated singleton pattern for async initialization
- Simplified `initializeAndHydrate()` function
- Updated `cleanupMiddleware()` to await services

---

## Conclusion

The two fixes address **critical client-side issues**:

1. ✅ **HttpClient error handling**: Client no longer crashes on backend errors
2. ✅ **Middleware initialization**: Persisted state is properly loaded and used

However, the **backend decryption error** remains and needs further investigation. The backend cannot decrypt the client's encrypted requests, suggesting a key derivation or encryption format mismatch.

**Recommendation**: Start the backend with verbose logging and test the encryption roundtrip on the client side to identify where the mismatch occurs.
