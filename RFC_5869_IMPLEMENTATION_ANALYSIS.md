# RFC 5869 HKDF Implementation Analysis

## RFC 5869 Specification Summary

### Extract Phase
```
PRK = HMAC-Hash(salt, IKM)
```
- **salt**: HMAC key (non-secret random value)
- **IKM**: HMAC data (input keying material)
- **PRK**: Pseudorandom key output (HashLen bytes)

### Expand Phase
```
N = ceil(L/HashLen)
T(0) = empty string
T(1) = HMAC-Hash(PRK, T(0) | info | 0x01)
T(2) = HMAC-Hash(PRK, T(1) | info | 0x02)
...
T(N) = HMAC-Hash(PRK, T(N-1) | info | N)
OKM = first L octets of T(1) | T(2) | ... | T(N)
```

## PRISM Implementation Parameters

### Common Parameters
- **Hash Algorithm**: SHA-256
- **IKM (Shared Secret)**: 48 bytes (ECDH P-384 output)
- **Salt**: 48 bytes (32-byte client nonce + 16-byte server nonce)
- **Info**: "IRN-Channel-v1.0" (UTF-8 encoded)
- **Output Length (L)**: 32 bytes (256 bits for AES-256-GCM)

### Expected Sizes
- **PRK** (after Extract): 32 bytes (SHA-256 output)
- **OKM** (after Expand): 32 bytes (requested length)
- **Iterations (N)**: 1 (since 32 ≤ 32)

## Backend Implementation (C#)

### File: `ChannelEncryptionService.cs`

```csharp
// HKDF Constructor
public HKDF(HashAlgorithmName hashAlgorithm, byte[] inputKeyMaterial, byte[]? salt, byte[]? info)
{
    _hashAlgorithm = hashAlgorithm;
    _info = info ?? Array.Empty<byte>();
    _prk = Extract(inputKeyMaterial, salt);  // Extract phase
}

// Extract Phase (RFC 5869 Section 2.2)
private byte[] Extract(byte[] inputKeyMaterial, byte[]? salt)
{
    // If salt is null, use HashLen zeros
    salt ??= new byte[32];  // SHA-256 = 32 bytes

    // PRK = HMAC-Hash(salt, IKM)
    using var hmac = IncrementalHash.CreateHMAC(_hashAlgorithm, salt);  // salt is KEY
    hmac.AppendData(inputKeyMaterial);                                  // IKM is DATA
    return hmac.GetHashAndReset();
}

// Expand Phase (RFC 5869 Section 2.3)
public void DeriveKey(Span<byte> output)
{
    using var hmac = IncrementalHash.CreateHMAC(_hashAlgorithm, _prk);  // PRK is KEY
    var hashLength = 32;  // SHA-256
    var iterations = (output.Length + hashLength - 1) / hashLength;
    var t = Array.Empty<byte>();

    for (byte i = 1; i <= iterations; i++)
    {
        hmac.AppendData(t);             // T(i-1)
        hmac.AppendData(_info);         // info
        hmac.AppendData(new[] { i });   // counter byte

        t = hmac.GetHashAndReset();     // T(i) = HMAC(PRK, T(i-1) | info | i)
        var copyLength = Math.Min(hashLength, output.Length - (i - 1) * hashLength);
        t.AsSpan(0, copyLength).CopyTo(output.Slice((i - 1) * hashLength));
    }
}
```

**✅ RFC Compliance:** Perfect implementation of RFC 5869

## Frontend Implementation (TypeScript)

### File: `CryptoDriver.ts`

```typescript
const INFO_CONTEXT = new TextEncoder().encode('IRN-Channel-v1.0');

async deriveSymmetricKey(params): Promise<CryptoKey> {
    // Step 1: Import peer's public key
    const peerKeyBuffer = base64ToArrayBuffer(params.peerPublicKey);
    const peerPublicKey = await this.subtle.importKey(
        'spki',
        peerKeyBuffer,
        { name: 'ECDH', namedCurve: 'P-384' },
        false,
        []
    );

    // Step 2: Derive ECDH shared secret (IKM)
    const rawBits = await this.subtle.deriveBits(
        { name: 'ECDH', public: peerPublicKey },
        params.privateKey,
        384  // P-384 produces 48 bytes
    );

    // Step 3: Import shared secret as HKDF key material
    const hkdfKey = await this.subtle.importKey(
        'raw',
        rawBits,
        'HKDF',
        false,
        ['deriveKey']
    );

    // Step 4: Combine nonces as salt
    const clientNonceBytes = base64ToArrayBuffer(params.clientNonce);
    const serverNonceBytes = base64ToArrayBuffer(params.serverNonce);
    const salt = new Uint8Array(clientNonceBytes.byteLength + serverNonceBytes.byteLength);
    salt.set(new Uint8Array(clientNonceBytes), 0);
    salt.set(new Uint8Array(serverNonceBytes), clientNonceBytes.byteLength);

    // Step 5: Derive AES-256 key using HKDF (WebCrypto native implementation)
    return this.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: salt,           // BufferSource (Uint8Array)
            info: INFO_CONTEXT    // BufferSource (Uint8Array)
        },
        hkdfKey,
        { name: 'AES-GCM', length: 256 },
        true,  // Extractable
        ['encrypt', 'decrypt']
    );
}
```

**✅ RFC Compliance:** Uses browser's native HKDF (should be RFC 5869 compliant)

## Potential Differences

### 1. ECDH Shared Secret Format
**Question:** Does `ECDiffieHellman.DeriveKeyMaterial()` (C#) produce the same raw bytes as `SubtleCrypto.deriveBits()` (WebCrypto)?

**Expected:** Both should return the X-coordinate of the shared point (48 bytes for P-384).

**Verification:** Check logs for "Shared Secret (Base64)" - must be identical.

### 2. Salt Construction
**Backend:**
```csharp
private byte[] CombineNonces(string nonce1, string nonce2)
{
    var bytes1 = Convert.FromBase64String(nonce1);  // Client nonce
    var bytes2 = Convert.FromBase64String(nonce2);  // Server nonce
    var combined = new byte[bytes1.Length + bytes2.Length];
    Buffer.BlockCopy(bytes1, 0, combined, 0, bytes1.Length);
    Buffer.BlockCopy(bytes2, 0, combined, bytes1.Length, bytes2.Length);
    return combined;
}
```

**Frontend:**
```typescript
const clientNonceBytes = base64ToArrayBuffer(params.clientNonce);
const serverNonceBytes = base64ToArrayBuffer(params.serverNonce);
const salt = new Uint8Array(clientNonceBytes.byteLength + serverNonceBytes.byteLength);
salt.set(new Uint8Array(clientNonceBytes), 0);
salt.set(new Uint8Array(serverNonceBytes), clientNonceBytes.byteLength);
```

**✅ Expected:** Identical (client || server)

### 3. Info Context Encoding
**Backend:**
```csharp
var info = Encoding.UTF8.GetBytes("IRN-Channel-v1.0");
```

**Frontend:**
```typescript
const INFO_CONTEXT = new TextEncoder().encode('IRN-Channel-v1.0');
```

**✅ Expected:** Identical UTF-8 encoding

## Test Vectors (RFC 5869 Appendix A)

### Test Case 1: SHA-256
```
Hash = SHA-256
IKM  = 0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b (22 octets)
salt = 0x000102030405060708090a0b0c (13 octets)
info = 0xf0f1f2f3f4f5f6f7f8f9 (10 octets)
L    = 42

PRK  = 0x077709362c2e32df0ddc3f0dc47bba6390b6c73bb50f9c3122ec844ad7c2b3e5 (32 octets)
OKM  = 0x3cb25f25faacd57a90434f64d0362f2a
       2d2d0a90cf1a5a4c5db02d56ecc4c5bf
       34007208d5b887185865 (42 octets)
```

## Debugging Checklist

When comparing logs, verify these values are **IDENTICAL**:

1. ✅ **Client Nonce** (Base64)
2. ✅ **Server Nonce** (Base64)
3. ✅ **Combined Salt** (Base64) = clientNonce || serverNonce
4. ✅ **Shared Secret** (Base64, 48 bytes for P-384)
5. ✅ **Info Context** (Base64, should be "SVJOLUNoYW5uZWwtdjEuMA==" for "IRN-Channel-v1.0")
6. ✅ **Derived Key** (Base64, 32 bytes) ⬅️ **MUST BE IDENTICAL**

If all inputs (1-5) are identical but (6) differs, there's a bug in one of the HKDF implementations.

## References

- **RFC 5869:** HMAC-based Extract-and-Expand Key Derivation Function (HKDF)
  - https://datatracker.ietf.org/doc/html/rfc5869
- **WebCrypto API:** HKDF Algorithm
  - https://www.w3.org/TR/WebCryptoAPI/#hkdf
  - https://developer.mozilla.org/en-US/docs/Web/API/HkdfParams
- **.NET ECDiffieHellman:** Key derivation
  - https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.ecdiffiehellman.derivekeymaterial

## Next Steps

1. Run desktop app and trigger login
2. Capture logs from both frontend (browser console) and backend (server logs)
3. Compare all 6 values above
4. If inputs match but output differs → investigate HKDF implementation
5. If shared secret differs → investigate ECDH key exchange
