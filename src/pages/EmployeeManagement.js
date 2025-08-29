// src/components/pages/EmployeeManagement.js
import React, { useState, useEffect } from "react";
import "../style/Employee.css";
import { getEmployees } from "../utils/storage";
import { defaultEmployees } from "../data/employees";
import { initialStock } from "../data/stock";
import Select from "react-select"; // 🔥 searchable dropdown
import employeeService from "../services/employeeService";

export default function EmployeeManagement({ goBack }) {
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState("");
  const [proof, setProof] = useState(null);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // === Load employees & records ===
  useEffect(() => {
    const list = getEmployees();
    if (list && list.length > 0) {
      setEmployees(list);
    } else {
      setEmployees(defaultEmployees);
    }

    loadRecords();
  }, []);

  // Load records from database/API
  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await employeeService.getAllRecords();
      if (result.success) {
        setRecords(result.data || []);
      } else {
        setError(result.error || 'Failed to load records');
        // Fallback to localStorage
        const savedRecords = localStorage.getItem("employee_records");
        if (savedRecords) {
          setRecords(JSON.parse(savedRecords));
        }
      }
    } catch (error) {
      console.error('Error loading records:', error);
      setError('Failed to load records');
      // Fallback to localStorage
      const savedRecords = localStorage.getItem("employee_records");
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } finally {
      setLoading(false);
    }
  };

  // === Save records to localStorage whenever updated ===
  useEffect(() => {
    localStorage.setItem("employee_records", JSON.stringify(records));
  }, [records]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL for display and store file
      setProof({
        preview: URL.createObjectURL(file),
        file: file
      });
    }
  };

  const handleAddRecord = async () => {
    if (!employee || !selectedItem || !selectedVariant || !quantity || !proof) {
      alert("⚠ Please fill all fields and upload proof!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Process the file upload
      const processedProof = await employeeService.processFileUpload(proof.file);
      
      const newRecord = {
        employee: employee.label,
        item: `${selectedItem.name} (${selectedVariant})`,
        quantity: parseInt(quantity),
        proof: processedProof || proof.preview, // Use processed file or fallback to preview
        date: new Date().toLocaleString(),
      };

      // Save to database/API
      const result = await employeeService.saveRecord(newRecord);
      
      if (result.success) {
        // Update local state
        const updated = [...records, result.data];
        setRecords(updated);
        
        // Also save to localStorage as backup
        localStorage.setItem("employee_records", JSON.stringify(updated));
        
        alert("✅ Record saved successfully!");
        
        // ✅ Clear form after save
        setEmployee(null);
        setSelectedItem(null);
        setSelectedVariant("");
        setQuantity("");
        setProof(null);
      } else {
        throw new Error(result.error || 'Failed to save record');
      }
    } catch (error) {
      console.error('Error saving record:', error);
      setError('Failed to save record: ' + error.message);
      alert("❌ Failed to save record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "⚠️ Are you sure you want to reset all employee records? This action cannot be undone!"
    );
    
    if (confirmReset) {
      setLoading(true);
      setError(null);
      
      try {
        // Clear from database/API
        const result = await employeeService.clearAllRecords();
        
        if (result.success) {
          // Clear all records from state
          setRecords([]);
          
          // Clear localStorage
          localStorage.removeItem("employee_records");
          
          // Clear current form
          setEmployee(null);
          setSelectedItem(null);
          setSelectedVariant("");
          setQuantity("");
          setProof(null);
          
          alert("✅ All employee records have been reset successfully!");
        } else {
          throw new Error(result.error || 'Failed to reset records');
        }
      } catch (error) {
        console.error('Error resetting records:', error);
        setError('Failed to reset records: ' + error.message);
        alert("❌ Failed to reset records. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="page-container">
      <h2>👥 Employee Management</h2>
      <p>Manage employee details & track PPE/material issuance with proof.</p>
      
      {/* Loading and Error States */}
      {loading && (
        <div className="loading-message">
          <p>⏳ Processing... Please wait.</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">Dismiss</button>
        </div>
      )}

      {/* Employee */}
      <div className="form-group">
        <label>👷 Employee Name</label>
        <Select
          options={employees.map((emp) => ({ value: emp, label: emp }))}
          value={employee}
          onChange={(option) => setEmployee(option)}
          placeholder="Search & select employee..."
          isSearchable
        />
      </div>

      {/* Item Taken */}
      <div className="form-group">
        <label>📦 Item Taken</label>
        <Select
          options={initialStock.map((it) => ({
            value: it.id,
            label: `${it.category} → ${it.name}`,
          }))}
          value={
            selectedItem
              ? { value: selectedItem.id, label: `${selectedItem.category} → ${selectedItem.name}` }
              : null
          }
          onChange={(option) => {
            const item = initialStock.find((it) => it.id === option.value);
            setSelectedItem(item);
            setSelectedVariant("");
          }}
          placeholder="Search & select item..."
          isSearchable
        />
      </div>

      {/* Variant */}
      {selectedItem && (
        <div className="form-group">
          <label>🔢 Variant</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
          >
            <option value="">-- Select Variant --</option>
            {selectedItem.variants.map((v) => (
              <option key={v.code} value={v.label}>
                {v.label} (Balance: {v.balance})
              </option>
            ))}
          </select>
        </div>
      )}

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

      {/* Proof */}
      <div className="form-group">
        <label>📷 Capture / Upload Proof</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {proof && (
          <div className="proof-preview">
            <img src={proof.preview || proof} alt="Proof" className="proof-img" />
          </div>
        )}
      </div>

      <div className="button-group">
        <button 
          className="issue-btn" 
          onClick={handleAddRecord}
          disabled={loading}
        >
          {loading ? "⏳ Saving..." : "✅ Save Record"}
        </button>
        <button 
          className="reset-btn" 
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "⏳ Resetting..." : "🗑️ Reset All Records"}
        </button>
      </div>

      {/* Records */}
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
                  {rec.proof && (
                    <img 
                      src={rec.proof.data || rec.proof.preview || rec.proof} 
                      alt="Proof" 
                      className="proof-thumbnail" 
                    />
                  )}
                </td>
                <td>{rec.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
