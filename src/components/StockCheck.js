import React, { useState } from "react";
import "./StockCheck.css";

// === Import your images ===
import shoeImg from "../assets/safety_shoe.png";
import helmetImg from "../assets/safety_helmet.png";
import glovesImg from "../assets/safety_gloves.png";
import steelImg from "../assets/steel_rod.svg";

export default function StockCheck({ goBack }) {
  const [stock] = useState({
    "Safety Shoe": {
      img: shoeImg,
      variants: {
        "Size 8": { received: 20, issued: 5, balance: 15 },
        "Size 9": { received: 15, issued: 12, balance: 3 },
      },
    },
    "Safety Helmet": {
      img: helmetImg,
      variants: {
        Yellow: { received: 30, issued: 10, balance: 20 },
        White: { received: 25, issued: 5, balance: 20 },
      },
    },
    Gloves: {
      img: glovesImg,
      variants: {
        Cotton: { received: 50, issued: 40, balance: 10 },
        Leather: { received: 30, issued: 28, balance: 2 },
      },
    },
    "Steel Rod": {
      img: steelImg,
      variants: {
        "10mm": { received: 100, issued: 90, balance: 10 },
        "12mm": { received: 80, issued: 76, balance: 4 },
      },
    },
  });

  // Track which category is selected
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="stock-container">
      <h2>📊 Stock Check</h2>

      {/* Category Buttons */}
      <div className="category-buttons">
        {Object.keys(stock).map((item) => (
          <button
            key={item}
            className={`category-btn ${
              selectedCategory === item ? "active" : ""
            }`}
            onClick={() =>
              setSelectedCategory(selectedCategory === item ? null : item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      {/* Show Table only when a category is selected */}
      {selectedCategory && (
        <div className="stock-table-container">
          <h3>📦 {selectedCategory} Details</h3>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Item</th>
                <th>Variant</th>
                <th>Received</th>
                <th>Issued</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stock[selectedCategory].variants).map(
                ([variant, v]) => (
                  <tr key={selectedCategory + variant}>
                    <td>
                      <img
                        src={stock[selectedCategory].img}
                        alt={selectedCategory}
                        className="stock-img"
                      />
                    </td>
                    <td>{selectedCategory}</td>
                    <td>{variant}</td>
                    <td>{v.received}</td>
                    <td>{v.issued}</td>
                    <td
                      className={`balance-cell ${
                        v.balance <= 5 ? "low-stock" : ""
                      }`}
                    >
                      {v.balance}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      <button className="back-btn" onClick={goBack}>
        ⬅ Go Back
      </button>
    </div>
  );
}
