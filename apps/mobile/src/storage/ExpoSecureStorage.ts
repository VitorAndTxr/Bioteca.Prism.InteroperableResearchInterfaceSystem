/**
 * Expo Secure Storage Implementation
 *
 * Provides SecureStorage interface implementation using expo-secure-store.
 * This is a mobile-specific implementation for secure credential storage.
 */

import * as SecureStore from 'expo-secure-store';
import type { SecureStorage } from '@iris/middleware';

export class ExpoSecureStorage implements SecureStorage {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('[ExpoSecureStorage] Failed to get item:', key, error);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await SecureStore.setItemAsync(key, serialized);
    } catch (error) {
      console.error('[ExpoSecureStorage] Failed to set item:', key, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('[ExpoSecureStorage] Failed to remove item:', key, error);
      throw error;
    }
  }
}
