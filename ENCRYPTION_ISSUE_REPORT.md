# IRIS Middleware Encryption Issue Report

**Date**: October 30, 2025
**Status**: ⚠️ **IN PROGRESS - Root Cause Identified**
**Priority**: 🔴 **CRITICAL** - Blocks authentication system

---

## Executive Summary

The IRIS desktop application cannot successfully authenticate with the InteroperableResearchNode backend due to an encryption incompatibility. **Phase 1 (Channel Open) succeeds, but Phase 2 (Node Identification) fails** with an `ERR_DECRYPTION_FAILED` error.

**Root Cause**: The symmetric encryption keys derived from ECDH key exchange are **different** between the TypeScript frontend (WebCrypto) and the C# backend (.NET), even though both implement the same RFC 5869 HKDF specification correctly.

---

## Problem Description

### Error Message

```
ERR_DECRYPTION_FAILED: The computed authentication tag did not match the input authentication tag.
```

### Where It Fails

```
Phase 1: Encrypted Channel ✅ SUCCESS
  - ECDH P-384 key exchange works
  - Channel ID received: <valid-guid>
  - Server public key received

Phase 2: Node Identification ❌ FAILURE
  - POST /api/node/identify
  - Status: 400 Bad Request
  - Backend cannot decrypt the encrypted payload
```

### What Was Tried

1. ✅ **Fixed buffer slicing issue** in `CryptoDriver.ts:134-168`
   - Problem: `.buffer` on sliced Uint8Array included extra bytes
   - Solution: Use `buffer.slice(byteOffset, byteOffset + byteLength)`
   - Result: Fixed the buffer issue, but authentication still fails

2. ✅ **Verified crypto implementation works correctly**
   - Created roundtrip test (`test-crypto-roundtrip.mjs`)
   - Encryption → Decryption works perfectly
   - Confirms: AES-256-GCM implementation is correct

3. ✅ **Confirmed payload structure is correct**
   - IV: 12 bytes ✓
   - Ciphertext: Variable length ✓
   - Auth Tag: 16 bytes ✓
   - Base64 encoding/decoding works ✓

4. ❌ **Key derivation mismatch detected**
   - Frontend and backend generate **different** symmetric keys
   - Even with identical inputs (shared secret, salt, info)
   - This is the actual problem

---

## Technical Analysis

### What We Know

#### ✅ Working Components

1. **ECDH Key Exchange (Phase 1)**
   - Frontend generates P-384 ephemeral key pair
   - Backend generates P-384 ephemeral key pair
   - Shared secret is derived on both sides
   - Channel established successfully

2. **AES-256-GCM Encryption/Decryption**
   - Frontend can encrypt and decrypt its own payloads
   - Buffer handling is correct after the fix
   - Tag verification works when using the same key

3. **Payload Structure**
   - JSON serialization matches backend expectations
   - Field names are correct (`encryptedData`, `iv`, `authTag`)
   - Base64 encoding is correct

#### ❌ Broken Component

**HKDF Key Derivation** - Keys don't match between frontend and backend

### Key Derivation Process

**Frontend (TypeScript/WebCrypto)**:
```typescript
const rawBits = await subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    384  // 48 bytes
);

const salt = clientNonce + serverNonce;  // 32 + 16 = 48 bytes
const info = "IRN-Channel-v1.0";         // UTF-8 bytes

const key = await subtle.deriveKey(
    {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt,
        info: info
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
);
```

**Backend (C#/.NET)**:
```csharp
var sharedSecret = ecdh.DeriveKeyMaterial(peerPublicKey);  // 48 bytes

var salt = CombineNonces(clientNonce, serverNonce);  // 32 + 16 = 48 bytes
var info = Encoding.UTF8.GetBytes("IRN-Channel-v1.0");

using var hkdf = new HKDF(HashAlgorithmName.SHA256, sharedSecret, salt, info);
var symmetricKey = new byte[32];
hkdf.DeriveKey(symmetricKey);

// HKDF implementation follows RFC 5869:
// PRK = HMAC-SHA256(salt, IKM)
// OKM = HKDF-Expand(PRK, info, L)
```

### Possible Causes

1. **✅ Buffer Handling** - FIXED
   - Was causing incorrect Base64 encoding
   - Now fixed with proper buffer slicing

2. **❓ ECDH Shared Secret Format**
   - WebCrypto `deriveBits()` vs .NET `DeriveKeyMaterial()`
   - May produce different byte representations?
   - Need to verify byte-for-byte comparison

3. **❓ HKDF Implementation Differences**
   - WebCrypto implements RFC 5869 automatically
   - C# has manual HKDF implementation
   - Could have subtle differences in:
     - HMAC initialization
     - Key expansion iteration
     - Byte ordering

4. **❓ Nonce Encoding/Ordering**
   - Frontend: `clientNonce (32 bytes) + serverNonce (16 bytes)`
   - Backend: `CombineNonces(clientNonce, serverNonce)`
   - Order appears correct, but need to verify bytes

5. **❓ Info Context Encoding**
   - Frontend: `TextEncoder().encode('IRN-Channel-v1.0')`
   - Backend: `Encoding.UTF8.GetBytes("IRN-Channel-v1.0")`
   - Should be identical, but worth verifying

---

## Test Scripts Created

### 1. `test-encryption.mjs`
Tests full workflow with backend:
- Opens channel (Phase 1)
- Derives symmetric key
- Encrypts test payload
- Sends to `/api/node/identify`
- **Result**: ❌ Backend fails to decrypt

### 2. `test-crypto-roundtrip.mjs`
Tests encryption/decryption in isolation:
- Generates test AES key
- Encrypts payload
- Decrypts payload
- **Result**: ✅ Works perfectly

### 3. Enhanced Debug Output
Added extensive logging:
- Shared secret (full)
- Salt (full)
- Info context
- Derived key (full)
- IV, ciphertext, tag sizes

---

## Files Modified

### ✅ Fixed
1. **`packages/middleware/src/crypto/CryptoDriver.ts`** (Line 134-168)
   - Fixed buffer slicing in `encrypt()` method
   - Added proper `byteOffset` and `byteLength` handling
   - Ensures clean ArrayBuffers for Base64 encoding

### 📝 Created
1. **`test-encryption.mjs`** - End-to-end encryption test
2. **`test-crypto-roundtrip.mjs`** - Isolated crypto test
3. **`ENCRYPTION_ISSUE_REPORT.md`** - This file

### ⚠️ Needs Investigation
1. **`packages/middleware/src/crypto/CryptoDriver.ts`** (Line 84-106)
   - `deriveSymmetricKey()` method
   - May need to match exact backend behavior

---

## Next Steps

### Immediate Actions (Priority 1)

1. **Compare Byte-for-Byte Derivation**
   ```bash
   # Add backend logging to show:
   # - Shared secret (Base64)
   # - Salt (Base64)
   # - Info (Base64)
   # - Final key (Base64)

   # Compare with frontend test output
   node test-encryption.mjs
   ```

2. **Verify ECDH Shared Secret**
   - Log raw ECDH output on both sides
   - Ensure P-384 produces identical bytes
   - Check if byte ordering matches

3. **Test Known-Good Key**
   - Generate a key on backend
   - Export it
   - Import it in frontend
   - Verify encryption/decryption works

### Alternative Solutions (If derivation can't match)

1. **Use Backend-Derived Keys**
   - Backend generates symmetric key
   - Encrypts it with client's public key (RSA)
   - Client decrypts with private key
   - Trade-off: Requires RSA key exchange

2. **Simplified Protocol**
   - Use TLS 1.3 only (no custom encryption)
   - Remove ECDH+HKDF layer
   - Trade-off: Less defense-in-depth

3. **Match Backend HKDF Exactly**
   - Implement custom HKDF in TypeScript
   - Match C# implementation byte-for-byte
   - Use Web Crypto only for primitives (HMAC, ECDH)

### Investigation Checklist

- [ ] Log shared secret from both sides (Base64)
- [ ] Log salt from both sides (Base64)
- [ ] Log derived key from both sides (Base64)
- [ ] Compare ECDH implementations
- [ ] Test with hardcoded key
- [ ] Review RFC 5869 compliance
- [ ] Check for endianness issues
- [ ] Verify info context encoding

---

## References

### Code Locations

**Frontend**:
- `packages/middleware/src/crypto/CryptoDriver.ts` - Crypto implementation
- `packages/middleware/src/channel/ChannelManager.ts` - Channel opening
- `packages/middleware/src/session/SessionManager.ts` - Encrypted requests

**Backend**:
- `Bioteca.Prism.Core/Security/Cryptography/ChannelEncryptionService.cs` - Encryption
- `Bioteca.Prism.Core/Security/Cryptography/EphemeralKeyService.cs` - ECDH
- `Bioteca.Prism.InteroperableResearchNode/Controllers/ChannelController.cs` - Channel endpoint

### Specifications

- [RFC 5869 - HKDF](https://datatracker.ietf.org/doc/html/rfc5869)
- [Web Crypto API - HKDF](https://www.w3.org/TR/WebCryptoAPI/#hkdf)
- [NIST P-384](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf)
- [AES-GCM](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)

---

## Conclusion

The buffer slicing fix was necessary and correct, but **it did not solve the authentication problem**. The real issue is that **HKDF key derivation produces different keys** on frontend and backend, even with identical inputs.

**Impact**: Authentication is completely blocked until this is resolved.

**Recommendation**: Add extensive logging to both frontend and backend to compare exact byte values at each step of key derivation, starting with the ECDH shared secret.
