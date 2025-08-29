// src/components/pages/StockCheck.js
import React, { useState } from "react";
import "../style/StockCheck.css";

// === Import your images ===
import shoeImg from "../assets/safety_shoe.png";
import helmetImg from "../assets/safety_helmet.svg";
import glovesImg from "../assets/safety_gloves.svg";
import steelImg from "../assets/steel_rod.jpg";
import shirtImg from "../assets/frc_shirt1.svg";
import pantImg from "../assets/frc_pant1.svg";

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
    "FRC Shirt": {
      img: shirtImg,
      variants: {
        "Size M": { received: 25, issued: 15, balance: 10 },
        "Size L": { received: 30, issued: 20, balance: 10 },
      },
    },
    "FRC Pant": {
      img: pantImg,
      variants: {
        "Size 32": { received: 40, issued: 25, balance: 15 },
        "Size 34": { received: 35, issued: 30, balance: 5 },
      },
    },
  });

  const [selectedItem, setSelectedItem] = useState("");

  return (
    <div className="stock-container">
      <h2>📊 Stock Check</h2>

      {/* Select Item Dropdown */}
      <div className="form-group">
        <label>🔹 Select Item</label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">-- Select Item --</option>
          {Object.keys(stock).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Show table only if item is selected */}
      {selectedItem && (
        <div className="stock-table-container">
          <h3>📦 {selectedItem} Stock Details</h3>
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
              {Object.entries(stock[selectedItem].variants).map(
                ([variant, v]) => (
                  <tr key={selectedItem + variant}>
                    <td>
                      <img
                        src={stock[selectedItem].img}
                        alt={selectedItem}
                        className="stock-img"
                      />
                    </td>
                    <td>{selectedItem}</td>
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
