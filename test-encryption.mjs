/**
 * Test script to verify encryption compatibility between TypeScript frontend
 * and C# backend for the IRIS middleware.
 *
 * This script:
 * 1. Opens a channel with the backend (Phase 1)
 * 2. Derives the symmetric key using ECDH + HKDF
 * 3. Encrypts a test payload using AES-256-GCM
 * 4. Sends it to the backend /api/node/identify endpoint
 * 5. Verifies if backend can decrypt it successfully
 */

import { webcrypto } from 'crypto';
const { subtle } = webcrypto;

const BACKEND_URL = 'http://localhost:5000';

// Helper functions
function bufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
}

function base64ToArrayBuffer(base64) {
    return Buffer.from(base64, 'base64');
}

async function generateEphemeralKeyPair() {
    const keyPair = await subtle.generateKey(
        {
            name: 'ECDH',
            namedCurve: 'P-384'
        },
        true,
        ['deriveBits', 'deriveKey']
    );

    const publicKeyBuffer = await subtle.exportKey('spki', keyPair.publicKey);
    const publicKey = bufferToBase64(publicKeyBuffer);

    return {
        publicKey,
        privateKey: keyPair.privateKey
    };
}

async function deriveSymmetricKey(privateKey, peerPublicKey, clientNonce, serverNonce) {
    const peerKeyBuffer = base64ToArrayBuffer(peerPublicKey);
    const peerPublicKeyObj = await subtle.importKey(
        'spki',
        peerKeyBuffer,
        { name: 'ECDH', namedCurve: 'P-384' },
        false,
        []
    );

    const rawBits = await subtle.deriveBits(
        { name: 'ECDH', public: peerPublicKeyObj },
        privateKey,
        384
    );

    console.log('\n[Key Derivation Debug]');
    console.log('  Shared secret length:', rawBits.byteLength, 'bytes');
    console.log('  Shared secret (first 16):', bufferToBase64(rawBits.slice(0, 16)));
    console.log('  Shared secret (FULL):', bufferToBase64(rawBits));

    const hkdfKey = await subtle.importKey('raw', rawBits, 'HKDF', false, ['deriveKey']);

    // Combine nonces (client + server)
    const clientNonceBytes = base64ToArrayBuffer(clientNonce);
    const serverNonceBytes = base64ToArrayBuffer(serverNonce);
    const salt = new Uint8Array(clientNonceBytes.byteLength + serverNonceBytes.byteLength);
    salt.set(new Uint8Array(clientNonceBytes), 0);
    salt.set(new Uint8Array(serverNonceBytes), clientNonceBytes.byteLength);

    console.log('  Client nonce length:', clientNonceBytes.byteLength, 'bytes');
    console.log('  Server nonce length:', serverNonceBytes.byteLength, 'bytes');
    console.log('  Combined salt length:', salt.byteLength, 'bytes');
    console.log('  Client nonce Base64:', clientNonce.substring(0, 20) + '...');
    console.log('  Server nonce Base64:', serverNonce);
    console.log('  Salt (first 16):', bufferToBase64(salt.slice(0, 16)));
    console.log('  Salt (FULL):', bufferToBase64(salt));

    const INFO_CONTEXT = new TextEncoder().encode('IRN-Channel-v1.0');
    console.log('  Info context:', new TextDecoder().decode(INFO_CONTEXT));

    const derivedKey = await subtle.deriveKey(
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
        true,
        ['encrypt', 'decrypt']
    );

    const exportedKeyBytes = await subtle.exportKey('raw', derivedKey);
    console.log('  Final symmetric key (first 16):', bufferToBase64(exportedKeyBytes.slice(0, 16)));
    console.log('  Final symmetric key (full):', bufferToBase64(exportedKeyBytes));

    return derivedKey;
}

async function encrypt(payload, symmetricKey) {
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));

    const encrypted = await subtle.encrypt(
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

    // CRITICAL FIX: Extract properly sized buffers
    const ciphertextBuffer = ciphertext.buffer.slice(
        ciphertext.byteOffset,
        ciphertext.byteOffset + ciphertext.byteLength
    );
    const ivBuffer = iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength);
    const authTagBuffer = authTag.buffer.slice(
        authTag.byteOffset,
        authTag.byteOffset + authTag.byteLength
    );

    console.log('\n[Encryption Debug]');
    console.log('  IV length:', iv.byteLength, 'bytes');
    console.log('  Ciphertext length:', ciphertext.byteLength, 'bytes');
    console.log('  Auth tag length:', authTag.byteLength, 'bytes');
    console.log('  IV Base64:', bufferToBase64(ivBuffer).substring(0, 20) + '...');
    console.log('  Ciphertext Base64:', bufferToBase64(ciphertextBuffer).substring(0, 20) + '...');
    console.log('  Auth Tag Base64:', bufferToBase64(authTagBuffer).substring(0, 20) + '...');

    return {
        encryptedData: bufferToBase64(ciphertextBuffer),
        iv: bufferToBase64(ivBuffer),
        authTag: bufferToBase64(authTagBuffer)
    };
}

async function openChannel() {
    console.log('\n[TEST] Step 1: Opening encrypted channel...');

    const ephemeral = await generateEphemeralKeyPair();
    const clientNonce = bufferToBase64(webcrypto.getRandomValues(new Uint8Array(32)));

    const response = await fetch(`${BACKEND_URL}/api/channel/open`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            protocolVersion: '1.0',
            ephemeralPublicKey: ephemeral.publicKey,
            keyExchangeAlgorithm: 'ECDH-P384',
            supportedCiphers: ['AES-256-GCM'],
            timestamp: new Date().toISOString(),
            nonce: clientNonce
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to open channel: ${response.status} ${response.statusText}`);
    }

    const channelId = response.headers.get('x-channel-id');
    const data = await response.json();

    console.log('✅ Channel opened successfully');
    console.log('  Channel ID:', channelId);
    console.log('  Server public key length:', data.ephemeralPublicKey.length);
    console.log('  Server nonce length:', data.nonce.length);

    const symmetricKey = await deriveSymmetricKey(
        ephemeral.privateKey,
        data.ephemeralPublicKey,
        clientNonce,
        data.nonce
    );

    const exportedKey = await subtle.exportKey('raw', symmetricKey);
    console.log('  Derived key length:', exportedKey.byteLength, 'bytes');
    console.log('  Derived key (first 16 bytes):', bufferToBase64(exportedKey.slice(0, 16)));

    return {
        channelId,
        symmetricKey
    };
}

async function testIdentify(channelId, symmetricKey) {
    console.log('\n[TEST] Step 2: Testing node identification...');

    const testPayload = {
        channelId: channelId,
        nodeId: 'test-encryption-script',
        certificate: 'MIIC0zCCAbugAwIBAgIIEhp057X+zFwwDQYJKoZIhvcNAQELBQAwETEPMA0GA1UEAwwGbm9kYV9hMB4XDTI1MTAyMzIxMzcyMVoXDTI3MTAyMzIxMzcyMVowETEPMA0GA1UEAwwGbm9kYV9hMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh8zFiUpVqcUInFkn0UhU2KOIkQccWgiGl8/kRP7beqChLbakJuLEzScd7jQIgsUh/qBaCXaWIdcgur+nQODaazlCFvnf/9Xky+56TGWjhnGUEZbo/JCRAoKeQU1k1n/n09USgU5IdiCe/59UoSeK+FNVEaUXaEZi/n8ap852cKhfiJbuQQHrevtdWkMqfhUtN0nDfkMQNvuzkeC9SI9HajNUIX+jwpffHi10crxXXOs5pZexhDpr46/MMZ8k+a6YcbQ0Oz+C2Qbv/Djk7Kec9cyoqzoYPw+d9E+T5P3qCa7Y9qeOiQAQMq7h6yvz6b8Dttmu+VYAQADgplXx40L9vQIDAQABoy8wLTAJBgNVHRMEAjAAMAsGA1UdDwQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcDATANBgkqhkiG9w0BAQsFAAOCAQEAQLl1Gg8wx866mlOuZJWW+b9w16+1qBOZdrnLpA8ajrrJV8uJ6bjGud0TSyZhChdrTqes0/HizT9yAa017ouxCsLdOZEGfYq63DmrKfySmxe18RMy1nw6wC/FtRXXt0H4c0Fj2yassCaGCxeHsiPy9/l+kbwxb1c5ZRJXX3YOrmkBnvuiKAbfaFE677HK9EzDsJ/Kb/n/T1YalbhcA+rV3YMI/3LMvWAyxRN2vNIZSUVI3Oojir3BfayfAzkGaSnMsSmZvSd9nrtCx9+S9TXpcDc8JuvS1U8XUHvMNraBB24YDVsXp0VjoNYo8+Mkm+2qPTMQp06hXH7pVJIUncDkug==',
        timestamp: new Date().toISOString()
    };

    console.log('  Payload:', JSON.stringify(testPayload, null, 2));

    const encryptedPayload = await encrypt(testPayload, symmetricKey);

    console.log('\n  Encrypted payload structure:');
    console.log('    encryptedData:', encryptedPayload.encryptedData.substring(0, 40) + '...');
    console.log('    encryptedData length:', encryptedPayload.encryptedData.length);
    console.log('    iv:', encryptedPayload.iv);
    console.log('    iv length:', encryptedPayload.iv.length);
    console.log('    authTag:', encryptedPayload.authTag);
    console.log('    authTag length:', encryptedPayload.authTag.length);

    // Verify base64 decoding works
    const verifyEncData = base64ToArrayBuffer(encryptedPayload.encryptedData);
    const verifyIv = base64ToArrayBuffer(encryptedPayload.iv);
    const verifyTag = base64ToArrayBuffer(encryptedPayload.authTag);
    console.log('\n  Verification (after base64 decode):');
    console.log('    encryptedData bytes:', verifyEncData.byteLength);
    console.log('    iv bytes:', verifyIv.byteLength);
    console.log('    authTag bytes:', verifyTag.byteLength);

    console.log('\n  Sending to backend...');
    const response = await fetch(`${BACKEND_URL}/api/node/identify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Channel-Id': channelId
        },
        body: JSON.stringify(encryptedPayload)
    });

    console.log('  Response status:', response.status, response.statusText);

    const responseData = await response.json();

    if (response.ok) {
        console.log('✅ Backend successfully decrypted the payload!');
        console.log('  Response data:', JSON.stringify(responseData, null, 2));
        return true;
    } else {
        console.log('❌ Backend failed to decrypt the payload');
        console.log('  Error:', JSON.stringify(responseData, null, 2));
        return false;
    }
}

async function runTest() {
    try {
        console.log('='.repeat(70));
        console.log('IRIS Middleware Encryption Compatibility Test');
        console.log('='.repeat(70));
        console.log('Backend URL:', BACKEND_URL);
        console.log('Algorithm: ECDH P-384 + HKDF-SHA256 + AES-256-GCM');

        const { channelId, symmetricKey } = await openChannel();
        const success = await testIdentify(channelId, symmetricKey);

        console.log('\n' + '='.repeat(70));
        if (success) {
            console.log('✅ TEST PASSED: Encryption is compatible with backend');
        } else {
            console.log('❌ TEST FAILED: Encryption incompatibility detected');
        }
        console.log('='.repeat(70));

        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('\n❌ TEST ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

runTest();
