declare const process: {
    env?: Record<string, string | undefined>;
};

// Web Crypto API type stubs for @iris/middleware compatibility.
// React Native doesn't include lib.dom, but the middleware's CryptoDriver
// interface references CryptoKey and SubtleCrypto as types.
// react-native-quick-crypto provides these as runtime values.

interface CryptoKey {
    readonly algorithm: Record<string, unknown>;
    readonly extractable: boolean;
    readonly type: string;
    readonly usages: string[];
}

interface SubtleCrypto {
    generateKey(algorithm: unknown, extractable: boolean, keyUsages: string[]): Promise<CryptoKey | CryptoKeyPair>;
    importKey(format: string, keyData: unknown, algorithm: unknown, extractable: boolean, keyUsages: string[]): Promise<CryptoKey>;
    exportKey(format: string, key: CryptoKey): Promise<ArrayBuffer>;
    deriveBits(algorithm: unknown, baseKey: CryptoKey, length: number): Promise<ArrayBuffer>;
    deriveKey(algorithm: unknown, baseKey: CryptoKey, derivedKeyType: unknown, extractable: boolean, keyUsages: string[]): Promise<CryptoKey>;
    encrypt(algorithm: unknown, key: CryptoKey, data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer>;
    decrypt(algorithm: unknown, key: CryptoKey, data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer>;
}

interface CryptoKeyPair {
    readonly privateKey: CryptoKey;
    readonly publicKey: CryptoKey;
}

interface Window {
    readonly origin: string;
    [key: string]: unknown;
}

declare var window: Window | undefined;
