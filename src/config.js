// ========================================
// PPE STOCK MANAGEMENT - CONFIGURATION
// ========================================

// Google Drive Upload Configuration
// To enable automatic upload to Google Drive, follow the setup instructions
// in the main application when you click "Upload to Drive"

export const GOOGLE_DRIVE_CONFIG = {
  // Paste your Google Apps Script Web App URL here after setup
  ENDPOINT: "",
  
  // Optional: Customize the folder name pattern for uploaded files
  FOLDER_NAME_PATTERN: "PPE_Reports_{YEAR}_{MONTH}",
  
  // Optional: Enable/disable the upload feature
  ENABLED: true,
  
  // File naming pattern for uploaded Excel files
  FILE_NAME_PATTERN: "PPE_Transactions_{DATE}.xlsx"
};

// Application Settings
export const APP_CONFIG = {
  // Company/Organization name (appears in exports and headers)
  ORGANIZATION_NAME: "PPE Management System",
  
  // Maximum quantity that can be issued at once
  MAX_QUANTITY_PER_ISSUE: 50,
  
  // Enable/disable employee search functionality
  EMPLOYEE_SEARCH_ENABLED: true,
  
  // Minimum characters required for employee search
  MIN_SEARCH_CHARACTERS: 2,
  
  // Auto-clear search after employee selection
  AUTO_CLEAR_SEARCH: true,
  
  // Enable/disable transaction history
  TRANSACTION_HISTORY_ENABLED: true,
  
  // Maximum number of transactions to display (0 = unlimited)
  MAX_TRANSACTIONS_DISPLAY: 100
};

// Storage Configuration
export const STORAGE_CONFIG = {
  // Local storage keys (change these if you need to reset data)
  STOCK_KEY: "ppe_stock_v1",
  TRANSACTIONS_KEY: "ppe_transactions_v1",
  
  // Enable/disable automatic data backup to localStorage
  AUTO_BACKUP: true,
  
  // Backup interval in milliseconds (default: 30 seconds)
  BACKUP_INTERVAL: 30000
};

// Export Settings
export const EXPORT_CONFIG = {
  // Default Excel export settings
  EXCEL: {
    SHEET_NAME: "PPE_Transactions",
    INCLUDE_HEADERS: true,
    COLUMN_WIDTHS: {
      "#": 4,
      "Date": 12,
      "Employee": 26,
      "Item": 28,
      "Brand": 16,
      "Quantity": 10
    }
  },
  
  // Date format for exports
  DATE_FORMAT: "YYYY-MM-DD",
  
  // Include company logo in exports (if available)
  INCLUDE_LOGO: false
};

// UI Configuration
export const UI_CONFIG = {
  // Theme settings
  THEME: "professional", // Options: "professional", "modern", "minimal"
  
  // Enable/disable animations
  ANIMATIONS_ENABLED: true,
  
  // Table pagination (0 = no pagination)
  TABLE_PAGE_SIZE: 0,
  
  // Show/hide stock images
  SHOW_STOCK_IMAGES: true,
  
  // Show/hide transaction images
  SHOW_TRANSACTION_IMAGES: true,
  
  // Compact mode for smaller screens
  COMPACT_MODE: false
};

// Validation Rules
export const VALIDATION_CONFIG = {
  // Employee name validation
  EMPLOYEE: {
    REQUIRED: true,
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    ALLOWED_CHARACTERS: /^[A-Z\s]+$/i
  },
  
  // Quantity validation
  QUANTITY: {
    MIN: 1,
    MAX: 50,
    REQUIRED: true
  },
  
  // Item selection validation
  ITEM: {
    REQUIRED: true
  }
};

// Development/Debug Settings
export const DEBUG_CONFIG = {
  // Enable console logging
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  
  // Show debug information in UI
  SHOW_DEBUG_INFO: false,
  
  // Enable performance monitoring
  PERFORMANCE_MONITORING: false,
  
  // Mock data for testing
  USE_MOCK_DATA: false
};

// Default export for easy importing
const config = {
  GOOGLE_DRIVE: GOOGLE_DRIVE_CONFIG,
  APP: APP_CONFIG,
  STORAGE: STORAGE_CONFIG,
  EXPORT: EXPORT_CONFIG,
  UI: UI_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  DEBUG: DEBUG_CONFIG
};

export default config;