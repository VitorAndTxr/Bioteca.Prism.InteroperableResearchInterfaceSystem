export interface SecureStorage {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}

export interface SecureStorageOptions {
    keyPrefix?: string;
}

export function withKeyPrefix(storage: SecureStorage, prefix?: string): SecureStorage {
    if (!prefix) {
        return storage;
    }

    const scopedKey = (key: string) => `${prefix}:${key}`;

    return {
        async getItem<T>(key: string): Promise<T | null> {
            return storage.getItem<T>(scopedKey(key));
        },
        async setItem<T>(key: string, value: T): Promise<void> {
            return storage.setItem<T>(scopedKey(key), value);
        },
        async removeItem(key: string): Promise<void> {
            return storage.removeItem(scopedKey(key));
        }
    };
}
