/**
 * Crypto polyfill for React Native
 *
 * Installs react-native-quick-crypto as the global crypto provider.
 * This provides native OpenSSL-backed crypto operations via JSI.
 *
 * IMPORTANT: This must be imported BEFORE any middleware imports.
 *
 * Note: The actual ECDH/AES-GCM operations are handled by
 * ReactNativeCryptoDriver (which uses react-native-quick-crypto's
 * Node.js-style API directly). This polyfill ensures that any code
 * accessing global.crypto or global.crypto.getRandomValues works.
 */

// Install getRandomValues polyfill first (needed by middleware internals)
import 'react-native-get-random-values';

// Install react-native-quick-crypto as the crypto module polyfill.
// This provides Buffer, createECDH, createCipheriv, createHmac, etc.
// via native OpenSSL bindings.
import { install } from 'react-native-quick-crypto';
install();
