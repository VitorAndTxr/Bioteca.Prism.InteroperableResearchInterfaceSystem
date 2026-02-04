/**
 * UUID Generator
 *
 * Generates RFC 4122 version 4 UUIDs using expo-crypto.
 */

import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID v4.
 *
 * @returns A UUID v4 string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
    return Crypto.randomUUID();
}
