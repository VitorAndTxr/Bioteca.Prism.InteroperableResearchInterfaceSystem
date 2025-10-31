import * as SecureStore from 'expo-secure-store';
import type { SecureStorage } from '@iris/middleware';

interface MobileSecureStorageOptions {
    prefix?: string;
}

export function createMobileSecureStorage(options?: MobileSecureStorageOptions): SecureStorage {
    const prefix = options?.prefix ?? 'iris-mobile';

    const scopedKey = (key: string) => `${prefix}:${key}`;

    return {
        async getItem<T>(key: string): Promise<T | null> {
            const raw = await SecureStore.getItemAsync(scopedKey(key));
            if (!raw) return null;

            try {
                return JSON.parse(raw) as T;
            } catch (error) {
                console.warn('[MobileSecureStorage] Failed to parse stored value', error);
                await SecureStore.deleteItemAsync(scopedKey(key));
                return null;
            }
        },
        async setItem<T>(key: string, value: T): Promise<void> {
            const serialized = JSON.stringify(value);
            await SecureStore.setItemAsync(scopedKey(key), serialized, {
                keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
            });
        },
        async removeItem(key: string): Promise<void> {
            await SecureStore.deleteItemAsync(scopedKey(key));
        }
    };
}
