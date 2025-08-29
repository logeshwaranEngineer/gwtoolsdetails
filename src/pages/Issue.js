// src/components/pages/Issue.js
import React, { useState } from "react";
import "../style/Issue.css";

export default function Issue({ goBack }) {
  // Fake stock data (you can later share with StockCheck via context or JSON file)
  const stock = {
    PPE: {
      "FRC Shirt": ["Size M", "Size L"],
      "FRC Pant": ["Size 32", "Size 34"],
      "Safety Shoe": ["Size 8", "Size 9"],
    },
    Steel: {
      "Steel Rod": ["10mm", "12mm"],
    },
    Stationary: {
      Pen: ["Blue", "Black"],
      Notebook: ["Small", "Large"],
    },
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [employee, setEmployee] = useState("");
  const [quantity, setQuantity] = useState("");
  const [issuedList, setIssuedList] = useState([]);

  const handleIssue = () => {
    if (!employee || !selectedCategory || !selectedItem || !selectedVariant || !quantity) {
      alert("⚠ Please fill all fields before issuing!");
      return;
    }

    const newIssue = {
      employee,
      category: selectedCategory,
      item: selectedItem,
      variant: selectedVariant,
      quantity: parseInt(quantity),
      date: new Date().toLocaleString(),
    };

    setIssuedList([...issuedList, newIssue]);

    // Reset form
    setEmployee("");
    setQuantity("");
    setSelectedCategory("");
    setSelectedItem("");
    setSelectedVariant("");
  };

  return (
    <div className="page-container">
      <h2>📦 Issue Items</h2>

      {/* Select Category */}
      <div className="form-group">
        <label>🔹 Select Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedItem("");
            setSelectedVariant("");
          }}
        >
          <option value="">-- Select --</option>
          {Object.keys(stock).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Select Item */}
      {selectedCategory && (
        <div className="form-group">
          <label>🔹 Select Item</label>
          <select
            value={selectedItem}
            onChange={(e) => {
              setSelectedItem(e.target.value);
              setSelectedVariant("");
            }}
          >
            <option value="">-- Select --</option>
            {Object.keys(stock[selectedCategory]).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Select Variant */}
      {selectedItem && (
        <div className="form-group">
          <label>🔹 Select Variant</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            <option value="">-- Select --</option>
            {stock[selectedCategory][selectedItem].map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Employee Name */}
      <div className="form-group">
        <label>👷 Employee Name</label>
        <input
          type="text"
          value={employee}
          placeholder="Enter employee name"
          onChange={(e) => setEmployee(e.target.value)}
        />
      </div>

      {/* Quantity */}
      <div className="form-group">
        <label>🔢 Quantity</label>
        <input
          type="number"
          value={quantity}
          placeholder="Enter quantity"
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <button className="issue-btn" onClick={handleIssue}>
        ✅ Issue Item
      </button>

      {/* Issued List */}
      <h3>📜 Issued Records</h3>
      {issuedList.length === 0 ? (
        <p>No items issued yet.</p>
      ) : (
        <table className="issue-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Category</th>
              <th>Item</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {issuedList.map((issue, index) => (
              <tr key={index}>
                <td>{issue.employee}</td>
                <td>{issue.category}</td>
                <td>{issue.item}</td>
                <td>{issue.variant}</td>
                <td>{issue.quantity}</td>
                <td>{issue.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="back-btn" onClick={goBack}>
        ⬅ Back
      </button>
    </div>
  );
}
