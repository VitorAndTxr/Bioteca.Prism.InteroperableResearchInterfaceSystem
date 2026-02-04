/**
 * ReactNativeSecureStorage implements SecureStorage using Expo SecureStore
 *
 * This provides platform-specific secure storage:
 * - iOS: Keychain Services
 * - Android: EncryptedSharedPreferences (backed by Android Keystore)
 *
 * Note: SecureStore has a 2048 byte limit per key.
 * For larger data, consider chunking or using a different storage mechanism.
 */

import * as SecureStore from 'expo-secure-store';
import type { SecureStorage } from '@iris/middleware';

export class ReactNativeSecureStorage implements SecureStorage {
    private readonly prefix: string;

    constructor(prefix: string = 'iris') {
        this.prefix = prefix;
    }

    /**
     * Get scoped key with prefix
     */
    private scopedKey(key: string): string {
        // Expo SecureStore only allows alphanumeric characters, ".", "-", and "_".
        // Replace any other characters (e.g. ":") with "_".
        return `${this.prefix}_${key}`.replace(/[^a-zA-Z0-9._-]/g, '_');
    }

    /**
     * Get item from secure storage
     */
    async getItem<T>(key: string): Promise<T | null> {
        const scopedKey = this.scopedKey(key);

        try {
            const value = await SecureStore.getItemAsync(scopedKey);

            if (!value) {
                return null;
            }

            // Parse JSON
            return JSON.parse(value) as T;
        } catch (error) {
            console.error(`[ReactNativeSecureStorage] Failed to get item "${key}":`, error);
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

            // Check size limit (2048 bytes)
            const byteSize = new TextEncoder().encode(jsonString).length;
            if (byteSize > 2048) {
                console.warn(
                    `[ReactNativeSecureStorage] Value for key "${key}" is ${byteSize} bytes, ` +
                    'which exceeds SecureStore limit of 2048 bytes. Consider chunking the data.'
                );
            }

            await SecureStore.setItemAsync(scopedKey, jsonString);
        } catch (error) {
            console.error(`[ReactNativeSecureStorage] Failed to set item "${key}":`, error);
            throw new Error(`Failed to set secure storage item: ${error}`);
        }
    }

    /**
     * Remove item from secure storage
     */
    async removeItem(key: string): Promise<void> {
        const scopedKey = this.scopedKey(key);

        try {
            await SecureStore.deleteItemAsync(scopedKey);
        } catch (error) {
            console.error(`[ReactNativeSecureStorage] Failed to remove item "${key}":`, error);
            throw new Error(`Failed to remove secure storage item: ${error}`);
        }
    }

    /**
     * Clear all items with the current prefix
     * Note: SecureStore doesn't have a "list keys" API, so we'll need to
     * manually track keys or accept that this only works for known keys
     */
    async clear(): Promise<void> {
        console.warn('[ReactNativeSecureStorage] Clear operation is not fully supported by SecureStore. ' +
            'Only explicitly tracked keys can be cleared.');
    }
}

/**
 * Create a new ReactNativeSecureStorage instance
 */
export function createReactNativeSecureStorage(prefix?: string): ReactNativeSecureStorage {
    return new ReactNativeSecureStorage(prefix);
}
