/**
 * Test if our own encryption/decryption works (roundtrip test)
 * This isolates the crypto implementation from the key derivation
 */

import { webcrypto } from 'crypto';
const { subtle } = webcrypto;

function bufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
}

function base64ToArrayBuffer(base64) {
    return Buffer.from(base64, 'base64');
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

    return {
        encryptedData: bufferToBase64(ciphertextBuffer),
        iv: bufferToBase64(ivBuffer),
        authTag: bufferToBase64(authTagBuffer)
    };
}

async function decrypt(payload, symmetricKey) {
    const ciphertext = new Uint8Array(base64ToArrayBuffer(payload.encryptedData));
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const tag = new Uint8Array(base64ToArrayBuffer(payload.authTag));

    // Combine ciphertext + tag for Web Crypto API
    const combined = new Uint8Array(ciphertext.byteLength + tag.byteLength);
    combined.set(ciphertext, 0);
    combined.set(tag, ciphertext.byteLength);

    const decryptedBuffer = await subtle.decrypt(
        {
            name: 'AES-GCM',
            iv,
            tagLength: 128
        },
        symmetricKey,
        combined
    );

    const decoded = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decoded);
}

async function runTest() {
    try {
        console.log('='.repeat(70));
        console.log('Encryption/Decryption Roundtrip Test');
        console.log('='.repeat(70));

        // Create a test key
        const symmetricKey = await subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );

        const exportedKey = await subtle.exportKey('raw', symmetricKey);
        console.log('\nTest symmetric key (Base64):', bufferToBase64(exportedKey));

        // Test payload
        const testPayload = {
            channelId: 'test-channel-123',
            nodeId: 'test-node',
            timestamp: new Date().toISOString(),
            testData: 'Hello, IRIS!'
        };

        console.log('\nOriginal payload:', JSON.stringify(testPayload, null, 2));

        // Encrypt
        console.log('\n[1] Encrypting...');
        const encrypted = await encrypt(testPayload, symmetricKey);
        console.log('    encryptedData length:', encrypted.encryptedData.length);
        console.log('    iv length:', encrypted.iv.length);
        console.log('    authTag length:', encrypted.authTag.length);

        // Verify sizes after decode
        const verifyEncData = base64ToArrayBuffer(encrypted.encryptedData);
        const verifyIv = base64ToArrayBuffer(encrypted.iv);
        const verifyTag = base64ToArrayBuffer(encrypted.authTag);
        console.log('   After base64 decode:');
        console.log('    encryptedData bytes:', verifyEncData.byteLength);
        console.log('    iv bytes:', verifyIv.byteLength);
        console.log('    authTag bytes:', verifyTag.byteLength);

        // Decrypt
        console.log('\n[2] Decrypting...');
        const decrypted = await decrypt(encrypted, symmetricKey);
        console.log('    Decrypted payload:', JSON.stringify(decrypted, null, 2));

        // Verify
        console.log('\n[3] Verifying...');
        const match = JSON.stringify(testPayload) === JSON.stringify(decrypted);

        console.log('\n' + '='.repeat(70));
        if (match) {
            console.log('✅ TEST PASSED: Roundtrip encryption/decryption works correctly');
            console.log('   Problem is NOT in the crypto implementation');
            console.log('   Problem must be in key derivation or serialization');
        } else {
            console.log('❌ TEST FAILED: Data mismatch after roundtrip');
            console.log('   Problem IS in the crypto implementation');
        }
        console.log('='.repeat(70));

        process.exit(match ? 0 : 1);
    } catch (error) {
        console.error('\n❌ TEST ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

runTest();
