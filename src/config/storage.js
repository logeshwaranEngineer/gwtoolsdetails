// src/config/storage.js

// Storage Configuration
export const STORAGE_CONFIG = {
  // Set to 'api' to use Axios API calls, 'indexeddb' for local database, 'localstorage' for simple storage
  method: 'indexeddb', // Options: 'api', 'indexeddb', 'localstorage'
  
  // API Configuration (when method is 'api')
  api: {
    baseUrl: 'http://localhost:3001/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  },
  
  // IndexedDB Configuration (when method is 'indexeddb')
  indexedDB: {
    dbName: 'EmployeeManagementDB',
    version: 1,
    storeName: 'employee_records'
  },
  
  // LocalStorage Configuration (when method is 'localstorage')
  localStorage: {
    keyPrefix: 'emp_mgmt_',
    recordsKey: 'employee_records'
  }
};

// Helper function to get current storage method
export const getStorageMethod = () => STORAGE_CONFIG.method;

// Helper function to check if using API
export const isUsingAPI = () => STORAGE_CONFIG.method === 'api';

// Helper function to check if using IndexedDB
export const isUsingIndexedDB = () => STORAGE_CONFIG.method === 'indexeddb';

// Helper function to check if using LocalStorage
export const isUsingLocalStorage = () => STORAGE_CONFIG.method === 'localstorage';