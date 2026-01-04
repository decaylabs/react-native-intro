/**
 * Unit tests for storage adapter functionality
 *
 * Tests the storage abstraction layer including:
 * - InMemoryStorage fallback
 * - createStorageAdapter factory
 * - loadPersistedData/savePersistedData
 * - Custom storage adapter support
 */

import {
  createStorageAdapter,
  loadPersistedData,
  savePersistedData,
  clearPersistedData,
  STORAGE_KEY,
  STORAGE_VERSION,
  type PersistedData,
} from '../../src/utils/storage';
import type { StorageAdapter } from '../../src/types';

// Mock the optional dependencies module
jest.mock('../../src/utils/optionalDependencies', () => ({
  getAsyncStorage: jest.fn(() => null),
  hasReanimated: jest.fn(() => false),
}));

describe('Storage Adapter', () => {
  describe('createStorageAdapter', () => {
    it('returns custom adapter when provided', () => {
      const customAdapter: StorageAdapter = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      const adapter = createStorageAdapter(customAdapter);
      expect(adapter).toBe(customAdapter);
    });

    it('returns InMemoryStorage when AsyncStorage is not available', () => {
      const adapter = createStorageAdapter();

      // Verify it's a valid adapter with the right methods
      expect(typeof adapter.getItem).toBe('function');
      expect(typeof adapter.setItem).toBe('function');
      expect(typeof adapter.removeItem).toBe('function');
    });
  });

  describe('InMemoryStorage', () => {
    let adapter: StorageAdapter;

    beforeEach(() => {
      // Get a fresh in-memory adapter
      adapter = createStorageAdapter();
    });

    it('returns null for non-existent keys', async () => {
      const value = await adapter.getItem('non-existent');
      expect(value).toBeNull();
    });

    it('stores and retrieves values', async () => {
      await adapter.setItem('test-key', 'test-value');
      const value = await adapter.getItem('test-key');
      expect(value).toBe('test-value');
    });

    it('overwrites existing values', async () => {
      await adapter.setItem('test-key', 'value-1');
      await adapter.setItem('test-key', 'value-2');
      const value = await adapter.getItem('test-key');
      expect(value).toBe('value-2');
    });

    it('removes values', async () => {
      await adapter.setItem('test-key', 'test-value');
      await adapter.removeItem('test-key');
      const value = await adapter.getItem('test-key');
      expect(value).toBeNull();
    });

    it('handles removing non-existent keys gracefully', async () => {
      await expect(adapter.removeItem('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('loadPersistedData', () => {
    let adapter: StorageAdapter;

    beforeEach(() => {
      adapter = createStorageAdapter();
    });

    it('returns null when no data exists', async () => {
      const data = await loadPersistedData(adapter);
      expect(data).toBeNull();
    });

    it('returns null for invalid JSON', async () => {
      await adapter.setItem(STORAGE_KEY, 'not-valid-json');
      const data = await loadPersistedData(adapter);
      expect(data).toBeNull();
    });

    it('returns null for mismatched version', async () => {
      const oldData: PersistedData = {
        version: STORAGE_VERSION + 1, // Future version
        dismissedTours: ['tour-1'],
        lastUpdated: new Date().toISOString(),
      };
      await adapter.setItem(STORAGE_KEY, JSON.stringify(oldData));

      const data = await loadPersistedData(adapter);
      expect(data).toBeNull();
    });

    it('loads valid persisted data', async () => {
      const savedData: PersistedData = {
        version: STORAGE_VERSION,
        dismissedTours: ['tour-1', 'tour-2'],
        lastUpdated: '2024-01-01T00:00:00.000Z',
      };
      await adapter.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const data = await loadPersistedData(adapter);
      expect(data).toEqual(savedData);
    });

    it('handles storage errors gracefully', async () => {
      const faultyAdapter: StorageAdapter = {
        getItem: jest.fn().mockRejectedValue(new Error('Storage error')),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      const data = await loadPersistedData(faultyAdapter);
      expect(data).toBeNull();
    });
  });

  describe('savePersistedData', () => {
    let adapter: StorageAdapter;

    beforeEach(() => {
      adapter = createStorageAdapter();
    });

    it('saves dismissed tours', async () => {
      const dismissedTours = new Set(['tour-1', 'tour-2']);
      await savePersistedData(adapter, dismissedTours);

      const raw = await adapter.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();

      const data = JSON.parse(raw!) as PersistedData;
      expect(data.version).toBe(STORAGE_VERSION);
      expect(data.dismissedTours).toEqual(['tour-1', 'tour-2']);
      expect(data.lastUpdated).toBeDefined();
    });

    it('saves empty set', async () => {
      const dismissedTours = new Set<string>();
      await savePersistedData(adapter, dismissedTours);

      const raw = await adapter.getItem(STORAGE_KEY);
      const data = JSON.parse(raw!) as PersistedData;
      expect(data.dismissedTours).toEqual([]);
    });

    it('handles storage errors gracefully', async () => {
      const faultyAdapter: StorageAdapter = {
        getItem: jest.fn(),
        setItem: jest.fn().mockRejectedValue(new Error('Storage error')),
        removeItem: jest.fn(),
      };

      const consoleSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      // Should not throw
      await expect(
        savePersistedData(faultyAdapter, new Set(['tour-1']))
      ).resolves.toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('clearPersistedData', () => {
    let adapter: StorageAdapter;

    beforeEach(() => {
      adapter = createStorageAdapter();
    });

    it('clears persisted data', async () => {
      // Save some data first
      await savePersistedData(adapter, new Set(['tour-1']));
      expect(await adapter.getItem(STORAGE_KEY)).not.toBeNull();

      // Clear it
      await clearPersistedData(adapter);
      expect(await adapter.getItem(STORAGE_KEY)).toBeNull();
    });

    it('handles clearing when no data exists', async () => {
      await expect(clearPersistedData(adapter)).resolves.toBeUndefined();
    });

    it('handles storage errors gracefully', async () => {
      const faultyAdapter: StorageAdapter = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn().mockRejectedValue(new Error('Storage error')),
      };

      // Should not throw
      await expect(clearPersistedData(faultyAdapter)).resolves.toBeUndefined();
    });
  });

  describe('Custom StorageAdapter', () => {
    it('works with custom adapter implementation', async () => {
      const storage = new Map<string, string>();

      const customAdapter: StorageAdapter = {
        getItem: async (key) => storage.get(key) ?? null,
        setItem: async (key, value) => {
          storage.set(key, value);
        },
        removeItem: async (key) => {
          storage.delete(key);
        },
      };

      // Save data
      await savePersistedData(customAdapter, new Set(['custom-tour']));

      // Load data
      const data = await loadPersistedData(customAdapter);
      expect(data?.dismissedTours).toContain('custom-tour');

      // Clear data
      await clearPersistedData(customAdapter);
      expect(await loadPersistedData(customAdapter)).toBeNull();
    });

    it('works with synchronous adapter returning promises', async () => {
      const storage: Record<string, string> = {};

      const syncAdapter: StorageAdapter = {
        getItem: (key) => Promise.resolve(storage[key] ?? null),
        setItem: (key, value) => {
          storage[key] = value;
          return Promise.resolve();
        },
        removeItem: (key) => {
          delete storage[key];
          return Promise.resolve();
        },
      };

      await savePersistedData(syncAdapter, new Set(['sync-tour']));
      const data = await loadPersistedData(syncAdapter);
      expect(data?.dismissedTours).toContain('sync-tour');
    });
  });

  describe('Data integrity', () => {
    it('preserves dismissed tours across save/load cycle', async () => {
      const adapter = createStorageAdapter();
      const originalTours = new Set(['tour-a', 'tour-b', 'tour-c']);

      await savePersistedData(adapter, originalTours);
      const loaded = await loadPersistedData(adapter);

      expect(loaded).not.toBeNull();
      expect(new Set(loaded!.dismissedTours)).toEqual(originalTours);
    });

    it('includes timestamp in saved data', async () => {
      const adapter = createStorageAdapter();
      const beforeSave = new Date();

      await savePersistedData(adapter, new Set(['tour-1']));

      const loaded = await loadPersistedData(adapter);
      const afterSave = new Date();

      expect(loaded).not.toBeNull();
      const savedDate = new Date(loaded!.lastUpdated);
      expect(savedDate.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
      expect(savedDate.getTime()).toBeLessThanOrEqual(afterSave.getTime());
    });
  });
});
