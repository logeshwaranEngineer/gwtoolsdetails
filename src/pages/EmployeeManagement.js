// src/components/pages/EmployeeManagement.js
import React, { useState } from "react";
import "../style/Employee.css";

export default function EmployeeManagement({ goBack }) {
  const [employee, setEmployee] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [proof, setProof] = useState(null);
  const [records, setRecords] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProof(URL.createObjectURL(file)); // preview stored
    }
  };

  const handleAddRecord = () => {
    if (!employee || !item || !quantity || !proof) {
      alert("⚠ Please fill all fields and upload proof!");
      return;
    }

    const newRecord = {
      employee,
      item,
      quantity: parseInt(quantity),
      proof,
      date: new Date().toLocaleString(),
    };

    setRecords([...records, newRecord]);

    // reset form
    setEmployee("");
    setItem("");
    setQuantity("");
    setProof(null);
  };

  return (
    <div className="page-container">
      <h2>👥 Employee Management</h2>
      <p>Manage employee details & track PPE/material issuance with proof.</p>

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

      {/* Item Taken */}
      <div className="form-group">
        <label>📦 Item Taken</label>
        <input
          type="text"
          value={item}
          placeholder="Enter item name (e.g. Safety Shoe)"
          onChange={(e) => setItem(e.target.value)}
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

      {/* Upload Proof */}
      <div className="form-group">
        <label>📷 Capture / Upload Proof</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {proof && (
          <div className="proof-preview">
            <img src={proof} alt="Proof" className="proof-img" />
          </div>
        )}
      </div>

      <button className="issue-btn" onClick={handleAddRecord}>
        ✅ Save Record
      </button>

      {/* Records List */}
      <h3>📜 Employee Records</h3>
      {records.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        <table className="issue-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Proof</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, index) => (
              <tr key={index}>
                <td>{rec.employee}</td>
                <td>{rec.item}</td>
                <td>{rec.quantity}</td>
                <td>
                  <img
                    src={rec.proof}
                    alt="Proof"
                    className="proof-thumbnail"
                  />
                </td>
                <td>{rec.date}</td>
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
