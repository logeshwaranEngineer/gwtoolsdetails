// src/components/pages/StockCheck.js
import React, { useState, useEffect } from "react";
import "../style/StockCheck.css";
import stockService from "../services/stockService";

export default function StockCheck({ goBack }) {
  const [stock, setStock] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [lowStockItems, setLowStockItems] = useState([]);
  const [stockSummary, setStockSummary] = useState(null);

  // Load stock data on component mount
  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = () => {
    // Get current stock from service
    const currentStock = stockService.getCurrentStock();
    setStock(currentStock);

    // Get low stock items
    const lowStock = stockService.getLowStockItems(5); // threshold of 5
    setLowStockItems(lowStock);

    // Get stock summary
    const summary = stockService.getStockSummary();
    setStockSummary(summary);

    // Show low stock alert if any
    if (lowStock.length > 0) {
      const lowStockMessage = lowStock.map(item => 
        `${item.itemName} - ${item.variantLabel} (Balance: ${item.balance})`
      ).join('\n');
      
      // Show alert with delay to ensure UI is loaded
      setTimeout(() => {
        alert(
          `🚨 URGENT: LOW STOCK ALERT! 🚨\n\nThe following items are below minimum level (under 5 units):\n\n${lowStockMessage}\n\n⚠️ ACTION REQUIRED:\n• Inform Admin & Boss immediately\n• Arrange for restocking\n• Monitor usage closely\n\nClick OK to continue...`
        );
      }, 800);
    }
  };

  return (
    <div className="stock-container">
      <h2>📊 Stock Check</h2>

      {/* Stock Summary */}
      {stockSummary && (
        <div className="stock-summary">
          <div className="summary-card">
            <h4>📦 Total Items: {stockSummary.totalItems}</h4>
          </div>
          <div className="summary-card">
            <h4>🔢 Total Variants: {stockSummary.totalVariants}</h4>
          </div>
          <div className="summary-card">
            <h4>📊 Total Quantity: {stockSummary.totalQuantity}</h4>
          </div>
          <div className="summary-card">
            <h4>⚠️ Low Stock Items: {stockSummary.lowStockCount}</h4>
          </div>
        </div>
      )}

      {/* If low stock exists, show warning banner */}
      {lowStockItems.length > 0 && (
        <div className="low-stock-banner">
          <div className="alert-header">
            🚨 URGENT: LOW STOCK ALERT! 🚨
          </div>
          <div className="alert-content">
            <strong>Items below minimum level (under 5 units):</strong>
            <div className="low-items-list">
              {lowStockItems.map((item, i) => (
                <span key={i} className="low-item">
                  📦 {item.itemName} - {item.variantLabel} 
                  <span className="balance-critical">(Only {item.balance} left!)</span>
                </span>
              ))}
            </div>
          </div>
          <div className="alert-action">
            ⚠️ Please inform Admin & Boss immediately for restocking!
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="form-group">
        <button className="refresh-btn" onClick={loadStockData}>
          🔄 Refresh Stock Data
        </button>
      </div>

      {/* Select Item Dropdown */}
      <div className="form-group">
        <label>🔹 Select Item</label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">-- Select Item --</option>
          {stock.map((item) => (
            <option key={item.id} value={item.id}>
              {item.category} → {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Show table only if item is selected */}
      {selectedItem && (
        <div className="stock-table-container">
          {(() => {
            const selectedItemData = stock.find(item => item.id == selectedItem);
            if (!selectedItemData) return null;
            
            return (
              <>
                <h3>📦 {selectedItemData.name} Stock Details</h3>
                <table className="stock-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Category</th>
                      <th>Item</th>
                      <th>Brand</th>
                      <th>Variant</th>
                      <th>Current Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItemData.variants.map((variant) => (
                      <tr key={`${selectedItemData.id}-${variant.code}`}>
                        <td>
                          <img
                            src={selectedItemData.img}
                            alt={selectedItemData.name}
                            className="stock-img"
                          />
                        </td>
                        <td>{selectedItemData.category}</td>
                        <td>{selectedItemData.name}</td>
                        <td>{selectedItemData.brand}</td>
                        <td>{variant.label}</td>
                        <td
                          className={`balance-cell ${
                            variant.balance <= 5 ? "low-stock" : ""
                          }`}
                        >
                          {variant.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            );
          })()}
        </div>
      )}

      {/* All Items Overview */}
      <div className="all-items-section">
        <h3>📋 All Items Overview</h3>
        <table className="stock-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Item</th>
              <th>Variant</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) =>
              item.variants.map((variant) => (
                <tr key={`${item.id}-${variant.code}`}>
                  <td>{item.category}</td>
                  <td>{item.name}</td>
                  <td>{variant.label}</td>
                  <td
                    className={`balance-cell ${
                      variant.balance <= 5 ? "low-stock" : ""
                    }`}
                  >
                    {variant.balance}
                  </td>
                  <td>
                    {variant.balance <= 5 ? (
                      <span className="status-low">⚠️ Low Stock</span>
                    ) : variant.balance <= 10 ? (
                      <span className="status-medium">⚡ Medium</span>
                    ) : (
                      <span className="status-good">✅ Good</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
