// src/utils/recordsStorage.js
// Unified persistence for EmployeeManagement records
// - Uses IndexedDB when configured
// - Falls back to localStorage

import { openDB } from 'idb';
import { STORAGE_CONFIG, isUsingIndexedDB, isUsingLocalStorage } from '../config/storage';

const LS_KEY = STORAGE_CONFIG.localStorage.recordsKey || 'employee_records';

// IndexedDB helpers
async function getEmpDB() {
  const { dbName, version, storeName } = STORAGE_CONFIG.indexedDB;
  return openDB(dbName || 'EmployeeManagementDB', version || 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        // Store a single record list under a fixed key
        db.createObjectStore(storeName);
      }
    },
  });
}

export async function getEmployeeRecords() {
  try {
    if (isUsingIndexedDB()) {
      const db = await getEmpDB();
      const storeName = STORAGE_CONFIG.indexedDB.storeName;
      const data = await db.get(storeName, 'records');

      // Migrate from localStorage if IndexedDB empty but LS has data
      if (!data) {
        const ls = localStorage.getItem(LS_KEY);
        if (ls) {
          const parsed = safeParse(ls, []);
          await db.put(storeName, parsed, 'records');
          return parsed;
        }
      }
      return Array.isArray(data) ? data : [];
    }

    // LocalStorage path
    if (isUsingLocalStorage() || true) {
      const saved = localStorage.getItem(LS_KEY);
      return safeParse(saved, []);
    }
  } catch (e) {
    console.error('getEmployeeRecords failed:', e);
  }
  return [];
}

export async function saveEmployeeRecords(records) {
  try {
    if (!Array.isArray(records)) return;

    if (isUsingIndexedDB()) {
      const db = await getEmpDB();
      const storeName = STORAGE_CONFIG.indexedDB.storeName;
      await db.put(storeName, records, 'records');
    }

    // Always keep a localStorage copy as backup
    localStorage.setItem(LS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('saveEmployeeRecords failed:', e);
  }
}

function safeParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}