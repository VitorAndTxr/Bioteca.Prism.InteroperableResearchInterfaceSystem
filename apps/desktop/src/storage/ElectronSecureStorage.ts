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
            if (this.isAvailable && this.safeStorage) {
                // Use Electron safeStorage
                const encryptedString = localStorage.getItem(scopedKey);
                if (!encryptedString) {
                    return null;
                }

                // Decrypt using safeStorage
                const encryptedBuffer = Buffer.from(encryptedString, 'base64');
                const decryptedBuffer = this.safeStorage.decryptString(encryptedBuffer);
                return JSON.parse(decryptedBuffer) as T;
            } else {
                // Fallback to localStorage
                const item = localStorage.getItem(scopedKey);
                if (!item) {
                    return null;
                }
                return JSON.parse(item) as T;
            }
        } catch (error) {
            console.error(`[ElectronSecureStorage] Failed to get item "${key}":`, error);
            return null;
        }
    }

    /**
     * Set item in secure storage
     */
    async setItem<T>(key: string, value: T): Promise<void> {
        const scopedKey = this.scopedKey(key);

        try {
            const jsonString = JSON.stringify(value);

            if (this.isAvailable && this.safeStorage) {
                // Use Electron safeStorage
                const encryptedBuffer = this.safeStorage.encryptString(jsonString);
                const encryptedString = encryptedBuffer.toString('base64');
                localStorage.setItem(scopedKey, encryptedString);
            } else {
                // Fallback to localStorage
                localStorage.setItem(scopedKey, jsonString);
            }
        } catch (error) {
            console.error(`[ElectronSecureStorage] Failed to set item "${key}":`, error);
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
