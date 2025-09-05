// src/server/empMgmtDb.js
// Dedicated device database for Employee Management
// Stores:
// - records: issued records
// - meta (key-value): sites list, superiors list

import { openDB } from 'idb';

const DB_NAME = 'EmpMgmtDB';
const DB_VERSION = 1;
const STORE_RECORDS = 'records';
const STORE_META = 'meta'; // key-value store, keys: 'sites', 'superiors'

export async function getEmpMgmtDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        const s = db.createObjectStore(STORE_RECORDS, { keyPath: 'id', autoIncrement: true });
        s.createIndex('type', 'type');
        s.createIndex('employee', 'employee');
        s.createIndex('site', 'site');
        s.createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META); // simple key-value
      }
    },
  });
}

// Sites
export async function getSitesFromDB() {
  const db = await getEmpMgmtDB();
  return (await db.get(STORE_META, 'sites')) || [];
}
export async function saveSitesToDB(list) {
  const db = await getEmpMgmtDB();
  await db.put(STORE_META, Array.isArray(list) ? list : [], 'sites');
}

// Superiors
export async function getSuperiorsFromDB() {
  const db = await getEmpMgmtDB();
  return (await db.get(STORE_META, 'superiors')) || [];
}
export async function saveSuperiorsToDB(list) {
  const db = await getEmpMgmtDB();
  await db.put(STORE_META, Array.isArray(list) ? list : [], 'superiors');
}

// Records
export async function getAllEmpRecordsFromDB() {
  const db = await getEmpMgmtDB();
  return (await db.getAll(STORE_RECORDS)) || [];
}
export async function addEmpRecordToDB(record) {
  const db = await getEmpMgmtDB();
  const rec = {
    ...record,
    // ensure ISO date for sorting if not provided
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const id = await db.add(STORE_RECORDS, rec);
  return { ...rec, id };
}
export async function replaceAllEmpRecordsInDB(records) {
  const db = await getEmpMgmtDB();
  const tx = db.transaction(STORE_RECORDS, 'readwrite');
  await tx.store.clear();
  for (const r of records || []) {
    await tx.store.add(r);
  }
  await tx.done;
}

export default {
  getEmpMgmtDB,
  getSitesFromDB,
  saveSitesToDB,
  getSuperiorsFromDB,
  saveSuperiorsToDB,
  getAllEmpRecordsFromDB,
  addEmpRecordToDB,
  replaceAllEmpRecordsInDB,
};