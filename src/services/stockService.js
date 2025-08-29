// src/services/stockService.js
import { initialStock } from "../data/stock";

const STOCK_KEY = "current_stock";

class StockService {
  constructor() {
    this.initializeStock();
  }

  // Initialize stock from localStorage or use default
  initializeStock() {
    const savedStock = localStorage.getItem(STOCK_KEY);
    if (!savedStock) {
      // First time - save initial stock to localStorage
      localStorage.setItem(STOCK_KEY, JSON.stringify(initialStock));
    }
  }

  // Get current stock
  getCurrentStock() {
    const savedStock = localStorage.getItem(STOCK_KEY);
    return savedStock ? JSON.parse(savedStock) : initialStock;
  }

  // Save stock to localStorage
  saveStock(stock) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
  }

  // Find item and variant in stock
  findItemVariant(itemId, variantCode) {
    const stock = this.getCurrentStock();
    const item = stock.find(item => item.id === itemId);
    if (!item) return null;
    
    const variant = item.variants.find(v => v.code === variantCode);
    if (!variant) return null;
    
    return { item, variant, stock };
  }

  // Reduce stock when item is issued
  reduceStock(itemId, variantCode, quantity) {
    const result = this.findItemVariant(itemId, variantCode);
    if (!result) {
      return { success: false, error: "Item or variant not found" };
    }

    const { item, variant, stock } = result;
    
    if (variant.balance < quantity) {
      return { 
        success: false, 
        error: `Insufficient stock. Available: ${variant.balance}, Requested: ${quantity}` 
      };
    }

    // Reduce the balance
    variant.balance -= quantity;
    
    // Save updated stock
    this.saveStock(stock);
    
    return { 
      success: true, 
      message: `Stock reduced: ${item.name} (${variant.label}) - ${quantity} units`,
      newBalance: variant.balance
    };
  }

  // Increase stock when item is returned/added
  increaseStock(itemId, variantCode, quantity) {
    const result = this.findItemVariant(itemId, variantCode);
    if (!result) {
      return { success: false, error: "Item or variant not found" };
    }

    const { item, variant, stock } = result;
    
    // Increase the balance
    variant.balance += quantity;
    
    // Save updated stock
    this.saveStock(stock);
    
    return { 
      success: true, 
      message: `Stock increased: ${item.name} (${variant.label}) + ${quantity} units`,
      newBalance: variant.balance
    };
  }

  // Get stock balance for specific item variant
  getStockBalance(itemId, variantCode) {
    const result = this.findItemVariant(itemId, variantCode);
    return result ? result.variant.balance : 0;
  }

  // Check if sufficient stock is available
  checkStockAvailability(itemId, variantCode, requestedQuantity) {
    const balance = this.getStockBalance(itemId, variantCode);
    return {
      available: balance >= requestedQuantity,
      currentBalance: balance,
      requestedQuantity
    };
  }

  // Reset stock to initial values
  resetStock() {
    localStorage.setItem(STOCK_KEY, JSON.stringify(initialStock));
    return { success: true, message: "Stock reset to initial values" };
  }

  // Get low stock items (balance < threshold)
  getLowStockItems(threshold = 10) {
    const stock = this.getCurrentStock();
    const lowStockItems = [];
    
    stock.forEach(item => {
      item.variants.forEach(variant => {
        if (variant.balance < threshold) {
          lowStockItems.push({
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            variantCode: variant.code,
            variantLabel: variant.label,
            balance: variant.balance
          });
        }
      });
    });
    
    return lowStockItems;
  }

  // Get stock summary
  getStockSummary() {
    const stock = this.getCurrentStock();
    let totalItems = 0;
    let totalVariants = 0;
    let totalQuantity = 0;
    
    stock.forEach(item => {
      totalItems++;
      item.variants.forEach(variant => {
        totalVariants++;
        totalQuantity += variant.balance;
      });
    });
    
    return {
      totalItems,
      totalVariants,
      totalQuantity,
      lowStockCount: this.getLowStockItems().length
    };
  }

  // Parse variant label from item string (for existing records)
  parseItemString(itemString) {
    // Expected format: "Item Name (Variant Label)"
    const match = itemString.match(/^(.+?)\s*\((.+?)\)$/);
    if (match) {
      return {
        itemName: match[1].trim(),
        variantLabel: match[2].trim()
      };
    }
    return null;
  }

  // Find item by name and variant label
  findItemByNameAndVariant(itemName, variantLabel) {
    const stock = this.getCurrentStock();
    
    for (const item of stock) {
      if (item.name === itemName) {
        const variant = item.variants.find(v => v.label === variantLabel);
        if (variant) {
          return {
            itemId: item.id,
            variantCode: variant.code,
            item,
            variant
          };
        }
      }
    }
    return null;
  }

  // Process stock change from item string (for existing records)
  processStockChangeFromString(itemString, quantity, operation = 'reduce') {
    const parsed = this.parseItemString(itemString);
    if (!parsed) {
      return { success: false, error: "Could not parse item string" };
    }

    const found = this.findItemByNameAndVariant(parsed.itemName, parsed.variantLabel);
    if (!found) {
      return { success: false, error: "Item not found in stock" };
    }

    if (operation === 'reduce') {
      return this.reduceStock(found.itemId, found.variantCode, quantity);
    } else {
      return this.increaseStock(found.itemId, found.variantCode, quantity);
    }
  }
}

// Export singleton instance
export const stockService = new StockService();
export default stockService;