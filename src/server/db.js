// src/db.js
import { openDB } from "idb";

const DB_NAME = "InventoryDB";
const STORE_NAME = "items";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("category", "category");
        store.createIndex("date", "date");
      }
    },
  });
}

export async function getAllItems() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function saveItemToDB(item) {
  const db = await getDB();
  await db.put(STORE_NAME, item);
}

export async function deleteItemFromDB(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
