import type { EncryptedPayload } from '../types';

export interface EphemeralKeyPair {
    publicKey: string;
    privateKey: CryptoKey;
}

export interface CryptoDriver {
    generateEphemeralKeyPair(): Promise<EphemeralKeyPair>;
    deriveSymmetricKey(params: { privateKey: CryptoKey; peerPublicKey: string; clientNonce: string; serverNonce: string }): Promise<CryptoKey>;
    exportSymmetricKey(key: CryptoKey): Promise<string>;
    importSymmetricKey(key: string): Promise<CryptoKey>;
    encrypt(payload: unknown, symmetricKey: CryptoKey): Promise<EncryptedPayload>;
    decrypt<T>(payload: EncryptedPayload, symmetricKey: CryptoKey): Promise<T>;
}

function bufferToBase64(buffer: ArrayBuffer): string {
    const nodeBuffer = (globalThis as typeof globalThis & { Buffer?: { from: (input: ArrayBuffer | string, encoding?: any) => { toString: (encoding: any) => string } } }).Buffer;
    if (nodeBuffer) {
        return nodeBuffer.from(buffer).toString('base64');
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }

    if (typeof globalThis.btoa === 'function') {
        return globalThis.btoa(binary);
    }

    throw new Error('No base64 encoder available in the current environment. Provide a custom CryptoDriver.');
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const nodeBuffer = (globalThis as typeof globalThis & { Buffer?: { from: (input: string, encoding: any) => Uint8Array } }).Buffer;
    if (nodeBuffer) {
        const buffer = nodeBuffer.from(base64, 'base64');
        return new Uint8Array(buffer).buffer;
    }

    if (typeof globalThis.atob !== 'function') {
        throw new Error('No base64 decoder available in the current environment. Provide a custom CryptoDriver.');
    }

    const binary = globalThis.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}

const INFO_CONTEXT = new TextEncoder().encode('IRN-Channel-v1.0');

export class WebCryptoDriver implements CryptoDriver {
    constructor(private readonly subtle: SubtleCrypto = globalThis.crypto?.subtle as SubtleCrypto) {
        if (!this.subtle) {
            throw new Error('WebCrypto SubtleCrypto API is not available in the current environment.');
        }
    }

    async generateEphemeralKeyPair(): Promise<EphemeralKeyPair> {
        const keyPair = await this.subtle.generateKey(
            {
                name: 'ECDH',
                namedCurve: 'P-384'
            },
            true,
            ['deriveBits', 'deriveKey']
        );

        const publicKeyBuffer = await this.subtle.exportKey('spki', keyPair.publicKey);
        const publicKey = bufferToBase64(publicKeyBuffer);

        return {
            publicKey,
            privateKey: keyPair.privateKey
        };
    }

    async deriveSymmetricKey(params: { privateKey: CryptoKey; peerPublicKey: string; clientNonce: string; serverNonce: string }): Promise<CryptoKey> {
        const peerKeyBuffer = base64ToArrayBuffer(params.peerPublicKey);
        const peerPublicKey = await this.subtle.importKey('spki', peerKeyBuffer, { name: 'ECDH', namedCurve: 'P-384' }, false, []);
        const rawBits = await this.subtle.deriveBits({ name: 'ECDH', public: peerPublicKey }, params.privateKey, 384);

        const hkdfKey = await this.subtle.importKey('raw', rawBits, 'HKDF', false, ['deriveKey']);

        // Combine client and server nonces as salt (matches backend CombineNonces)
        const clientNonceBytes = base64ToArrayBuffer(params.clientNonce);
        const serverNonceBytes = base64ToArrayBuffer(params.serverNonce);
        const salt = new Uint8Array(clientNonceBytes.byteLength + serverNonceBytes.byteLength);
        salt.set(new Uint8Array(clientNonceBytes), 0);
        salt.set(new Uint8Array(serverNonceBytes), clientNonceBytes.byteLength);

        // 🔍 DEBUG: Log all derivation inputs
        console.log('=== HKDF Key Derivation Inputs ===');
        console.log('Shared Secret (Base64):', bufferToBase64(rawBits));
        console.log('Shared Secret (Length):', rawBits.byteLength, 'bytes');
        console.log('Client Nonce (Base64):', params.clientNonce);
        console.log('Server Nonce (Base64):', params.serverNonce);
        console.log('Salt (Base64):', bufferToBase64(salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength)));
        console.log('Salt (Length):', salt.byteLength, 'bytes');
        console.log('Info Context (Base64):', bufferToBase64(INFO_CONTEXT.buffer.slice(INFO_CONTEXT.byteOffset, INFO_CONTEXT.byteOffset + INFO_CONTEXT.byteLength)));
        console.log('Info Context (String):', new TextDecoder().decode(INFO_CONTEXT));
        console.log('Info Context (Length):', INFO_CONTEXT.byteLength, 'bytes');

        const derivedKey = await this.subtle.deriveKey(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: salt,
                info: INFO_CONTEXT
            },
            hkdfKey,
            {
                name: 'AES-GCM',
                length: 256
            },
            true,  // Must be extractable for persistence
            ['encrypt', 'decrypt']
        );

        // 🔍 DEBUG: Log derived key
        const derivedKeyRaw = await this.subtle.exportKey('raw', derivedKey);
        console.log('Derived Key (Base64):', bufferToBase64(derivedKeyRaw));
        console.log('Derived Key (Length):', derivedKeyRaw.byteLength, 'bytes');
        console.log('===================================\n');

        return derivedKey;
    }

    async exportSymmetricKey(key: CryptoKey): Promise<string> {
        const raw = await this.subtle.exportKey('raw', key);
        return bufferToBase64(raw);
    }

    async importSymmetricKey(key: string): Promise<CryptoKey> {
        const raw = base64ToArrayBuffer(key);
        return this.subtle.importKey(
            'raw',
            raw,
            {
                name: 'AES-GCM',
                length: 256
            },
            true,  // Must be extractable for re-persistence
            ['encrypt', 'decrypt']
        );
    }

    async encrypt(payload: unknown, symmetricKey: CryptoKey): Promise<EncryptedPayload> {
        const cryptoObj = globalThis.crypto;
        if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
            throw new Error('No crypto implementation available for random values.');
        }

        const iv = cryptoObj.getRandomValues(new Uint8Array(12));
        const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));

        const encrypted = await this.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv,
                tagLength: 128
            },
            symmetricKey,
            encodedPayload
        );

        const encryptedBytes = new Uint8Array(encrypted);
        const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - 16);
        const authTag = encryptedBytes.slice(encryptedBytes.length - 16);

        // Convert Uint8Arrays to properly sized ArrayBuffers
        // Using slice(0) ensures we get a clean ArrayBuffer with exact byte length
        const ciphertextBuffer = ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength);
        const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);
        const authTagBuffer = authTag.buffer.slice(authTag.byteOffset, authTag.byteOffset + authTag.byteLength);

        return {
            encryptedData: bufferToBase64(ciphertextBuffer),
            iv: bufferToBase64(ivBuffer),
            authTag: bufferToBase64(authTagBuffer)
        };
    }

    async decrypt<T>(payload: EncryptedPayload, symmetricKey: CryptoKey): Promise<T> {
    const ciphertext = new Uint8Array(base64ToArrayBuffer(payload.encryptedData));
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const tag = new Uint8Array(base64ToArrayBuffer(payload.authTag));
    const combined = new Uint8Array(ciphertext.byteLength + tag.byteLength);

    combined.set(ciphertext, 0);
    combined.set(tag, ciphertext.byteLength);

        const decryptedBuffer = await this.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv,
                tagLength: 128
            },
            symmetricKey,
            combined
        );

        const decoded = new TextDecoder().decode(decryptedBuffer);
        return JSON.parse(decoded) as T;
    }
}
