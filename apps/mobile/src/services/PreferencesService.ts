/**
 * Preferences Service
 *
 * Manages user preferences and settings using AsyncStorage.
 * Provides type-safe access to user preferences with default values.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class PreferencesService {
  private static KEYS = {
    APPEARANCE: 'pref_appearance',
    EXPORT_FORMAT: 'pref_export_format',
  } as const;

  /**
   * Get a preference value with a default fallback
   */
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('[PreferencesService] Failed to get preference:', key, error);
      return defaultValue;
    }
  }

  /**
   * Set a preference value
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('[PreferencesService] Failed to set preference:', key, error);
      throw error;
    }
  }

  /**
   * Get appearance preference
   */
  async getAppearance(): Promise<'light' | 'dark'> {
    return this.get(PreferencesService.KEYS.APPEARANCE, 'light');
  }

  /**
   * Set appearance preference
   */
  async setAppearance(value: 'light' | 'dark'): Promise<void> {
    return this.set(PreferencesService.KEYS.APPEARANCE, value);
  }

  /**
   * Get export format preference
   */
  async getExportFormat(): Promise<'csv' | 'json'> {
    return this.get(PreferencesService.KEYS.EXPORT_FORMAT, 'csv');
  }

  /**
   * Set export format preference
   */
  async setExportFormat(value: 'csv' | 'json'): Promise<void> {
    return this.set(PreferencesService.KEYS.EXPORT_FORMAT, value);
  }

  /**
   * Clear all preferences
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(PreferencesService.KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('[PreferencesService] Failed to clear preferences:', error);
      throw error;
    }
  }
}

export const preferencesService = new PreferencesService();
