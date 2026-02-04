/**
 * ReactNativeCryptoDriver
 *
 * CryptoDriver implementation for React Native using native OpenSSL
 * via react-native-quick-crypto. Replaces WebCryptoDriver which
 * depends on crypto.subtle (unavailable in React Native).
 *
 * Algorithms:
 * - ECDH P-384 key exchange (crypto.createECDH)
 * - HKDF-SHA256 key derivation (manual via HMAC)
 * - AES-256-GCM encryption/decryption (crypto.createCipheriv/createDecipheriv)
 */

import {
    createECDH,
    createCipheriv,
    createDecipheriv,
    createHmac,
    randomBytes,
} from 'crypto';
import type { CryptoDriver, EphemeralKeyPair } from '@iris/middleware';
import type { EncryptedPayload } from '@iris/middleware';

// ── Internal key handle types ────────────────────────────────────────────────
// These wrap native Buffer key material and get cast to CryptoKey for interface
// compatibility. Only our own driver methods consume them, so this is safe.

interface ECDHPrivateKeyHandle {
    __brand: 'ecdh-private';
    ecdhInstance: ReturnType<typeof createECDH>;
}

interface AESKeyHandle {
    __brand: 'aes-key';
    keyBuffer: Buffer;
}

// ── SPKI ASN.1 constants for P-384 ──────────────────────────────────────────
// Fixed DER header for SPKI encoding of an EC public key on secp384r1 (P-384).
// Structure:
//   SEQUENCE (0x30 0x76) {
//     SEQUENCE (0x30 0x10) {
//       OID 1.2.840.10045.2.1 (ecPublicKey)
//       OID 1.3.132.0.34 (secp384r1)
//     }
//     BIT STRING (0x03 0x62 0x00) {
//       <97 bytes: 04 || x || y>
//     }
//   }
const SPKI_P384_HEADER = Buffer.from([
    0x30, 0x76,                               // SEQUENCE (118 bytes)
    0x30, 0x10,                               // SEQUENCE (16 bytes) — AlgorithmIdentifier
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce,      // OID 1.2.840.10045.2.1 (ecPublicKey)
    0x3d, 0x02, 0x01,
    0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x22, // OID 1.3.132.0.34 (secp384r1)
    0x03, 0x62, 0x00,                          // BIT STRING (98 bytes, 0 unused bits)
]);

const SPKI_P384_HEADER_LENGTH = SPKI_P384_HEADER.length; // 23
const P384_UNCOMPRESSED_KEY_LENGTH = 97; // 04 || x(48) || y(48)

const HKDF_INFO = Buffer.from('IRN-Channel-v1.0', 'utf8');

// ── Helper functions ─────────────────────────────────────────────────────────

function wrapPublicKeyToSPKI(uncompressedKey: Buffer): string {
    const spki = Buffer.concat([SPKI_P384_HEADER, uncompressedKey]);
    return spki.toString('base64');
}

function unwrapPublicKeyFromSPKI(spkiBase64: string): Buffer {
    const spki = Buffer.from(spkiBase64, 'base64');
    if (spki.length !== SPKI_P384_HEADER_LENGTH + P384_UNCOMPRESSED_KEY_LENGTH) {
        throw new Error(
            `Invalid SPKI key length: expected ${SPKI_P384_HEADER_LENGTH + P384_UNCOMPRESSED_KEY_LENGTH}, got ${spki.length}`
        );
    }
    // Create a standalone copy instead of a view (subarray).
    // react-native-quick-crypto's native ECDH.computeSecret may not respect
    // the byteOffset of Buffer views, reading from the wrong offset.
    return Buffer.from(spki.subarray(SPKI_P384_HEADER_LENGTH));
}

/**
 * HKDF-SHA256 key derivation (RFC 5869)
 * For AES-256 (32 bytes), only one HMAC iteration is needed.
 */
function hkdfSha256(ikm: Buffer, salt: Buffer, info: Buffer, length: number): Buffer {
    // Extract: PRK = HMAC-SHA256(salt, IKM)
    const prk = createHmac('sha256', salt).update(ikm).digest();

    // Expand: single iteration for 32 bytes (SHA-256 output = 32 bytes >= 32)
    const iterations = Math.ceil(length / 32);
    const buffers: Buffer[] = [];
    let prev: Buffer<ArrayBufferLike> = Buffer.alloc(0);

    for (let i = 1; i <= iterations; i++) {
        prev = createHmac('sha256', prk)
            .update(prev)
            .update(info)
            .update(Buffer.from([i]))
            .digest();
        buffers.push(prev);
    }

    return Buffer.concat(buffers).subarray(0, length);
}

// ── CryptoDriver implementation ─────────────────────────────────────────────

export class ReactNativeCryptoDriver implements CryptoDriver {

    async generateEphemeralKeyPair(): Promise<EphemeralKeyPair> {
        const ecdh = createECDH('secp384r1');
        ecdh.generateKeys();

        const publicKeyUncompressed = ecdh.getPublicKey() as Buffer;

        const publicKeyBase64 = wrapPublicKeyToSPKI(publicKeyUncompressed);

        const handle: ECDHPrivateKeyHandle = {
            __brand: 'ecdh-private',
            ecdhInstance: ecdh,
        };

        return {
            publicKey: publicKeyBase64,
            privateKey: handle as unknown as CryptoKey,
        };
    }

    async deriveSymmetricKey(params: {
        privateKey: CryptoKey;
        peerPublicKey: string;
        clientNonce: string;
        serverNonce: string;
    }): Promise<CryptoKey> {
        const handle = params.privateKey as unknown as ECDHPrivateKeyHandle;
        if (handle.__brand !== 'ecdh-private') {
            throw new Error('Invalid private key handle');
        }

        // Reuse the original ECDH instance (avoids setPrivateKey issues
        // in react-native-quick-crypto where the native EC_KEY state
        // may not fully initialize from raw private key bytes alone)
        const ecdh = handle.ecdhInstance;

        // Extract raw public key from peer's SPKI-encoded key
        const peerRawKey = unwrapPublicKeyFromSPKI(params.peerPublicKey);

        // Compute shared secret via ECDH
        const sharedSecret = ecdh.computeSecret(peerRawKey) as Buffer;

        // Combine nonces as salt (matches backend CombineNonces)
        const clientNonce = Buffer.from(params.clientNonce, 'base64');
        const serverNonce = Buffer.from(params.serverNonce, 'base64');
        const salt = Buffer.concat([clientNonce, serverNonce]);

        // Derive AES-256 key via HKDF-SHA256
        const derivedKey = hkdfSha256(sharedSecret, salt, HKDF_INFO, 32);

        console.log('=== HKDF Key Derivation Inputs ===');
        console.log('Shared Secret (Length):', sharedSecret.length, 'bytes');
        console.log('Salt (Length):', salt.length, 'bytes');
        console.log('Info Context (String): IRN-Channel-v1.0');
        console.log('Derived Key (Length):', derivedKey.length, 'bytes');
        console.log('===================================');

        const aesHandle: AESKeyHandle = {
            __brand: 'aes-key',
            keyBuffer: derivedKey,
        };

        return aesHandle as unknown as CryptoKey;
    }

    async exportSymmetricKey(key: CryptoKey): Promise<string> {
        const handle = key as unknown as AESKeyHandle;
        if (handle.__brand !== 'aes-key') {
            throw new Error('Invalid AES key handle');
        }
        return handle.keyBuffer.toString('base64');
    }

    async importSymmetricKey(key: string): Promise<CryptoKey> {
        const keyBuffer = Buffer.from(key, 'base64');
        if (keyBuffer.length !== 32) {
            throw new Error(`Invalid AES-256 key length: expected 32, got ${keyBuffer.length}`);
        }
        const handle: AESKeyHandle = {
            __brand: 'aes-key',
            keyBuffer,
        };
        return handle as unknown as CryptoKey;
    }

    async encrypt(payload: unknown, symmetricKey: CryptoKey): Promise<EncryptedPayload> {
        const handle = symmetricKey as unknown as AESKeyHandle;
        if (handle.__brand !== 'aes-key') {
            throw new Error('Invalid AES key handle');
        }

        const iv = randomBytes(12);
        const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');

        const cipher = createCipheriv('aes-256-gcm', handle.keyBuffer, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const authTag = cipher.getAuthTag();

        return {
            encryptedData: encrypted.toString('base64'),
            iv: iv.toString('base64'),
            authTag: authTag.toString('base64'),
        };
    }

    async decrypt<T>(payload: EncryptedPayload, symmetricKey: CryptoKey): Promise<T> {
        const handle = symmetricKey as unknown as AESKeyHandle;
        if (handle.__brand !== 'aes-key') {
            throw new Error('Invalid AES key handle');
        }

        const ciphertext = Buffer.from(payload.encryptedData, 'base64');
        const iv = Buffer.from(payload.iv, 'base64');
        const authTag = Buffer.from(payload.authTag, 'base64');

        const decipher = createDecipheriv('aes-256-gcm', handle.keyBuffer, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

        return JSON.parse(decrypted.toString('utf8')) as T;
    }
}
