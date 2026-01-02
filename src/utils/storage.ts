/**
 * Storage adapter abstraction for persistence
 */

import type { StorageAdapter } from '../types';
import { getAsyncStorage } from './optionalDependencies';

/**
 * Storage key for persisted data
 */
export const STORAGE_KEY = '@react-native-intro/state';

/**
 * Persisted data schema version
 */
export const STORAGE_VERSION = 1;

/**
 * Persisted data shape
 */
export interface PersistedData {
  version: number;
  dismissedTours: string[];
  lastUpdated: string;
}

/**
 * In-memory fallback storage (no persistence)
 */
class InMemoryStorage implements StorageAdapter {
  private data: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.data.delete(key);
  }
}

/**
 * AsyncStorage adapter (when available)
 */
class AsyncStorageAdapter implements StorageAdapter {
  private storage: ReturnType<typeof getAsyncStorage>;

  constructor() {
    this.storage = getAsyncStorage();
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.storage) return null;
    return this.storage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.storage) return;
    await this.storage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (!this.storage) return;
    await this.storage.removeItem(key);
  }
}

/**
 * Create a storage adapter
 *
 * @param customAdapter - Optional custom storage adapter
 * @returns Storage adapter instance
 */
export function createStorageAdapter(
  customAdapter?: StorageAdapter
): StorageAdapter {
  if (customAdapter) {
    return customAdapter;
  }

  const asyncStorage = getAsyncStorage();
  if (asyncStorage) {
    return new AsyncStorageAdapter();
  }

  return new InMemoryStorage();
}

/**
 * Load persisted data from storage
 *
 * @param adapter - Storage adapter to use
 * @returns Persisted data or null if not found
 */
export async function loadPersistedData(
  adapter: StorageAdapter
): Promise<PersistedData | null> {
  try {
    const raw = await adapter.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as PersistedData;

    // Validate version
    if (data.version !== STORAGE_VERSION) {
      // Future: add migration logic
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

/**
 * Save persisted data to storage
 *
 * @param adapter - Storage adapter to use
 * @param dismissedTours - Set of dismissed tour IDs
 */
export async function savePersistedData(
  adapter: StorageAdapter,
  dismissedTours: Set<string>
): Promise<void> {
  try {
    const data: PersistedData = {
      version: STORAGE_VERSION,
      dismissedTours: Array.from(dismissedTours),
      lastUpdated: new Date().toISOString(),
    };

    await adapter.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail - persistence is optional
    if (__DEV__) {
      console.warn('[react-native-intro] Failed to save persisted data');
    }
  }
}

/**
 * Clear all persisted data
 *
 * @param adapter - Storage adapter to use
 */
export async function clearPersistedData(
  adapter: StorageAdapter
): Promise<void> {
  try {
    await adapter.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
