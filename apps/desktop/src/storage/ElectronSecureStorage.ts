import type { SecureStorage } from '@iris/middleware';

/**
 * ElectronSecureStorage implements SecureStorage using Electron's safeStorage API.
 *
 * This provides platform-specific encryption:
 * - Windows: DPAPI (Data Protection API)
 * - macOS: Keychain
 * - Linux: libsecret
 *
 * Note: This implementation requires Electron's safeStorage API.
 * If safeStorage is not available (e.g., in development), it falls back to
 * localStorage with a warning.
 */
export class ElectronSecureStorage implements SecureStorage {
    private readonly prefix: string;
    private safeStorage: typeof import('electron').safeStorage | null = null;
    private isAvailable = false;

    constructor(prefix: string = 'iris') {
        this.prefix = prefix;
        this.initializeSafeStorage();
    }

    /**
     * Initialize Electron safeStorage
     */
    private initializeSafeStorage(): void {
        try {
            // Try to import electron safeStorage
            // This will work when running in Electron main process
            const electron = window.require('electron');
            this.safeStorage = electron.safeStorage;
            this.isAvailable = this.safeStorage?.isEncryptionAvailable() ?? false;

            if (!this.isAvailable) {
                console.warn('[ElectronSecureStorage] Encryption not available, falling back to localStorage');
            }
        } catch (error) {
            console.warn('[ElectronSecureStorage] Electron not available, falling back to localStorage', error);
            this.isAvailable = false;
        }
    }

    /**
     * Get scoped key with prefix
     */
    private scopedKey(key: string): string {
        return `${this.prefix}:${key}`;
    }

    /**
     * Get item from secure storage
     */
    async getItem<T>(key: string): Promise<T | null> {
        const scopedKey = this.scopedKey(key);

        try {
            console.log(`[ElectronSecureStorage] getItem called for key: "${key}"`);
            console.log(`[ElectronSecureStorage]    Scoped key: "${scopedKey}"`);
            console.log(`[ElectronSecureStorage]    Encryption available: ${this.isAvailable}`);

            if (this.isAvailable && this.safeStorage) {
                // Use Electron safeStorage
                const encryptedString = localStorage.getItem(scopedKey);
                console.log(`[ElectronSecureStorage]    Encrypted string:`, encryptedString ? `Found (${encryptedString.length} chars)` : 'null');

                if (!encryptedString) {
                    console.log(`[ElectronSecureStorage]    Returning null (no data)`);
                    return null;
                }

                // Decrypt using safeStorage
                console.log(`[ElectronSecureStorage]    Converting to buffer...`);
                const encryptedBuffer = Buffer.from(encryptedString, 'base64');
                console.log(`[ElectronSecureStorage]    Buffer size: ${encryptedBuffer.length} bytes`);

                console.log(`[ElectronSecureStorage]    Decrypting...`);
                const decryptedBuffer = this.safeStorage.decryptString(encryptedBuffer);
                console.log(`[ElectronSecureStorage]    Decrypted result type:`, typeof decryptedBuffer);
                console.log(`[ElectronSecureStorage]    Decrypted length:`, decryptedBuffer.length);

                console.log(`[ElectronSecureStorage]    Parsing JSON...`);
                const parsed = JSON.parse(decryptedBuffer) as T;
                console.log(`[ElectronSecureStorage]    ✅ Successfully parsed, keys:`, Object.keys(parsed || {}));
                return parsed;
            } else {
                // Fallback to localStorage
                console.log(`[ElectronSecureStorage]    Using localStorage fallback`);
                const item = localStorage.getItem(scopedKey);
                console.log(`[ElectronSecureStorage]    Item:`, item ? `Found (${item.length} chars)` : 'null');

                if (!item) {
                    console.log(`[ElectronSecureStorage]    Returning null (no data)`);
                    return null;
                }

                console.log(`[ElectronSecureStorage]    Parsing JSON...`);
                const parsed = JSON.parse(item) as T;
                console.log(`[ElectronSecureStorage]    ✅ Successfully parsed, keys:`, Object.keys(parsed || {}));
                return parsed;
            }
        } catch (error) {
            console.error(`[ElectronSecureStorage] ❌ Failed to get item "${key}":`, error);
            console.error(`[ElectronSecureStorage]    Error type:`, error?.constructor?.name);
            console.error(`[ElectronSecureStorage]    Error message:`, error instanceof Error ? error.message : String(error));
            console.error(`[ElectronSecureStorage]    Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
            return null;
        }
    }

    /**
     * Set item in secure storage
     */
    async setItem<T>(key: string, value: T): Promise<void> {
        const scopedKey = this.scopedKey(key);

        try {
            console.log(`[ElectronSecureStorage] setItem called for key: "${key}"`);
            console.log(`[ElectronSecureStorage]    Scoped key: "${scopedKey}"`);
            console.log(`[ElectronSecureStorage]    Value keys:`, Object.keys(value || {}));
            console.log(`[ElectronSecureStorage]    Encryption available: ${this.isAvailable}`);

            const jsonString = JSON.stringify(value);
            console.log(`[ElectronSecureStorage]    JSON string length: ${jsonString.length} chars`);

            if (this.isAvailable && this.safeStorage) {
                // Use Electron safeStorage
                console.log(`[ElectronSecureStorage]    Encrypting...`);
                const encryptedBuffer = this.safeStorage.encryptString(jsonString);
                console.log(`[ElectronSecureStorage]    Encrypted buffer size: ${encryptedBuffer.length} bytes`);

                const encryptedString = encryptedBuffer.toString('base64');
                console.log(`[ElectronSecureStorage]    Base64 string length: ${encryptedString.length} chars`);

                console.log(`[ElectronSecureStorage]    Saving to localStorage...`);
                localStorage.setItem(scopedKey, encryptedString);
                console.log(`[ElectronSecureStorage]    ✅ Saved successfully`);

                // Verify save
                const verify = localStorage.getItem(scopedKey);
                console.log(`[ElectronSecureStorage]    Verification: ${verify ? 'SUCCESS' : 'FAILED'}`);
            } else {
                // Fallback to localStorage
                console.log(`[ElectronSecureStorage]    Using localStorage fallback`);
                localStorage.setItem(scopedKey, jsonString);
                console.log(`[ElectronSecureStorage]    ✅ Saved successfully (unencrypted)`);

                // Verify save
                const verify = localStorage.getItem(scopedKey);
                console.log(`[ElectronSecureStorage]    Verification: ${verify ? 'SUCCESS' : 'FAILED'}`);
            }
        } catch (error) {
            console.error(`[ElectronSecureStorage] ❌ Failed to set item "${key}":`, error);
            console.error(`[ElectronSecureStorage]    Error type:`, error?.constructor?.name);
            console.error(`[ElectronSecureStorage]    Error message:`, error instanceof Error ? error.message : String(error));
            throw new Error(`Failed to set secure storage item: ${error}`);
        }
    }

    /**
     * Remove item from secure storage
     */
    async removeItem(key: string): Promise<void> {
        const scopedKey = this.scopedKey(key);

        try {
            localStorage.removeItem(scopedKey);
        } catch (error) {
            console.error(`[ElectronSecureStorage] Failed to remove item "${key}":`, error);
            throw new Error(`Failed to remove secure storage item: ${error}`);
        }
    }

    /**
     * Clear all items with the current prefix
     */
    async clear(): Promise<void> {
        try {
            const keysToRemove: string[] = [];
            const prefixWithColon = `${this.prefix}:`;

            // Find all keys with our prefix
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefixWithColon)) {
                    keysToRemove.push(key);
                }
            }

            // Remove all matching keys
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('[ElectronSecureStorage] Failed to clear storage:', error);
            throw new Error(`Failed to clear secure storage: ${error}`);
        }
    }

    /**
     * Check if encryption is available
     */
    isEncryptionAvailable(): boolean {
        return this.isAvailable;
    }
}

/**
 * Create a new ElectronSecureStorage instance
 */
export function createElectronSecureStorage(prefix?: string): ElectronSecureStorage {
    return new ElectronSecureStorage(prefix);
}
