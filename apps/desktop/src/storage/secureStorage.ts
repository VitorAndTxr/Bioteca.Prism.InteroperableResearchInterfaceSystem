import type { SecureStorage } from '@iris/middleware';

type RendererSecureStorageAPI = {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    remove: (key: string) => Promise<void>;
};

const DEFAULT_PREFIX = 'iris-desktop';

function createLocalStorageFallback(prefix: string): SecureStorage {
    const scopedKey = (key: string) => `${prefix}:${key}`;

    return {
        async getItem<T>(key: string): Promise<T | null> {
            const raw = localStorage.getItem(scopedKey(key));
            if (!raw) return null;

            try {
                return JSON.parse(raw) as T;
            } catch (error) {
                console.warn('[LocalStorageFallback] Failed to parse stored value', error);
                localStorage.removeItem(scopedKey(key));
                return null;
            }
        },
        async setItem<T>(key: string, value: T): Promise<void> {
            localStorage.setItem(scopedKey(key), JSON.stringify(value));
        },
        async removeItem(key: string): Promise<void> {
            localStorage.removeItem(scopedKey(key));
        }
    };
}

export function createDesktopSecureStorage(prefix = DEFAULT_PREFIX): SecureStorage {
    const api = window.electron?.secureStorage as RendererSecureStorageAPI | undefined;

    if (!api) {
        console.warn('[SecureStorage] Electron bridge unavailable, falling back to localStorage');
        return createLocalStorageFallback(prefix);
    }

    const scopedKey = (key: string) => `${prefix}:${key}`;

    return {
        async getItem<T>(key: string): Promise<T | null> {
            const raw = await api.get(scopedKey(key));
            if (!raw) return null;

            try {
                return JSON.parse(raw) as T;
            } catch (error) {
                console.warn('[DesktopSecureStorage] Failed to parse stored value', error);
                await api.remove(scopedKey(key));
                return null;
            }
        },
        async setItem<T>(key: string, value: T): Promise<void> {
            const serialized = JSON.stringify(value);
            await api.set(scopedKey(key), serialized);
        },
        async removeItem(key: string): Promise<void> {
            await api.remove(scopedKey(key));
        }
    };
}
