// src/services/employeeService.js
import axios from 'axios';
import { STORAGE_CONFIG, isUsingAPI, isUsingIndexedDB, isUsingLocalStorage } from '../config/storage';

// Get configuration from config file
const { api: API_CONFIG, indexedDB: DB_CONFIG, localStorage: LS_CONFIG } = STORAGE_CONFIG;

class EmployeeService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  // Initialize IndexedDB (SQLite-like local database)
  async initDB() {
    if (!isUsingIndexedDB()) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.dbName, DB_CONFIG.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
          const store = db.createObjectStore(DB_CONFIG.storeName, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // Create indexes for better querying
          store.createIndex('employee', 'employee', { unique: false });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('item', 'item', { unique: false });
        }
      };
    });
  }

  // Save employee record
  async saveRecord(record) {
    if (isUsingAPI()) {
      return await this.saveRecordAPI(record);
    } else if (isUsingIndexedDB()) {
      return await this.saveRecordDB(record);
    } else {
      return await this.saveRecordLS(record);
    }
  }

  // Get all employee records
  async getAllRecords() {
    if (isUsingAPI()) {
      return await this.getAllRecordsAPI();
    } else if (isUsingIndexedDB()) {
      return await this.getAllRecordsDB();
    } else {
      return await this.getAllRecordsLS();
    }
  }

  // Delete all records
  async clearAllRecords() {
    if (isUsingAPI()) {
      return await this.clearAllRecordsAPI();
    } else if (isUsingIndexedDB()) {
      return await this.clearAllRecordsDB();
    } else {
      return await this.clearAllRecordsLS();
    }
  }

  // Get records by employee
  async getRecordsByEmployee(employeeName) {
    if (isUsingAPI()) {
      return await this.getRecordsByEmployeeAPI(employeeName);
    } else if (isUsingIndexedDB()) {
      return await this.getRecordsByEmployeeDB(employeeName);
    } else {
      return await this.getRecordsByEmployeeLS(employeeName);
    }
  }

  // === API Methods (using Axios) ===
  async saveRecordAPI(record) {
    try {
      const response = await axios.post(
        `${API_CONFIG.baseUrl}/employee-records`, 
        record,
        { 
          timeout: API_CONFIG.timeout,
          headers: API_CONFIG.headers 
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API Error saving record:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllRecordsAPI() {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseUrl}/employee-records`,
        { 
          timeout: API_CONFIG.timeout,
          headers: API_CONFIG.headers 
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API Error getting records:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAllRecordsAPI() {
    try {
      await axios.delete(
        `${API_CONFIG.baseUrl}/employee-records`,
        { 
          timeout: API_CONFIG.timeout,
          headers: API_CONFIG.headers 
        }
      );
      return { success: true };
    } catch (error) {
      console.error('API Error clearing records:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecordsByEmployeeAPI(employeeName) {
    try {
      const response = await axios.get(
        `${API_CONFIG.baseUrl}/employee-records/employee/${employeeName}`,
        { 
          timeout: API_CONFIG.timeout,
          headers: API_CONFIG.headers 
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API Error getting employee records:', error);
      return { success: false, error: error.message };
    }
  }

  // === IndexedDB Methods (SQLite-like local storage) ===
  async saveRecordDB(record) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([DB_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.storeName);
      
      // Add timestamp and unique ID
      const recordWithMeta = {
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const request = store.add(recordWithMeta);
      
      request.onsuccess = () => {
        resolve({ success: true, data: { ...recordWithMeta, id: request.result } });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  }

  async getAllRecordsDB() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([DB_CONFIG.storeName], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve({ success: true, data: request.result });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  }

  async clearAllRecordsDB() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([DB_CONFIG.storeName], 'readwrite');
      const store = transaction.objectStore(DB_CONFIG.storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve({ success: true });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  }

  async getRecordsByEmployeeDB(employeeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([DB_CONFIG.storeName], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.storeName);
      const index = store.index('employee');
      const request = index.getAll(employeeName);
      
      request.onsuccess = () => {
        resolve({ success: true, data: request.result });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  }

  // Utility method to convert file to base64 for storage
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Method to handle file upload and convert to base64
  async processFileUpload(file) {
    if (!file) return null;
    
    try {
      const base64 = await this.fileToBase64(file);
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return null;
    }
  }

  // === LocalStorage Methods ===
  async saveRecordLS(record) {
    try {
      const key = `${LS_CONFIG.keyPrefix}${LS_CONFIG.recordsKey}`;
      const existingRecords = JSON.parse(localStorage.getItem(key) || '[]');
      
      const recordWithMeta = {
        ...record,
        id: Date.now() + Math.random(), // Simple ID generation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      existingRecords.push(recordWithMeta);
      localStorage.setItem(key, JSON.stringify(existingRecords));
      
      return { success: true, data: recordWithMeta };
    } catch (error) {
      console.error('LocalStorage Error saving record:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllRecordsLS() {
    try {
      const key = `${LS_CONFIG.keyPrefix}${LS_CONFIG.recordsKey}`;
      const records = JSON.parse(localStorage.getItem(key) || '[]');
      return { success: true, data: records };
    } catch (error) {
      console.error('LocalStorage Error getting records:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAllRecordsLS() {
    try {
      const key = `${LS_CONFIG.keyPrefix}${LS_CONFIG.recordsKey}`;
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('LocalStorage Error clearing records:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecordsByEmployeeLS(employeeName) {
    try {
      const key = `${LS_CONFIG.keyPrefix}${LS_CONFIG.recordsKey}`;
      const allRecords = JSON.parse(localStorage.getItem(key) || '[]');
      const employeeRecords = allRecords.filter(record => record.employee === employeeName);
      return { success: true, data: employeeRecords };
    } catch (error) {
      console.error('LocalStorage Error getting employee records:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
export default employeeService;