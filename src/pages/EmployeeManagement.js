// src/components/pages/EmployeeManagement.js
import React, { useState, useEffect } from "react";
import "../style/Employee.css";
import { getEmployees } from "../utils/storage";
import { defaultEmployees } from "../data/employees";
import { initialStock } from "../data/stock";
import Select from "react-select";
import employeeService from "../services/employeeService";
import stockService from "../services/stockService";

// 🔹 Sites List
const sites = [ 
  "IWMF", "CORA", "VSMC SITE", "MSD",
  "IESS SOONLEE", "CYE OFFICE", "MEP WORKSHOP", "MEP OFFICE",
  "CDA PIPING (MEP WORKSHOP)", "SITE LAYDOWN BANYAN", "WAN CHENG(OFFICE COME)"
];

// 🔹 Example Superiors
const superiors = [
  "Mr. Raj",
  "Mr. Kumar",
  "Mr. Tan",
  "Mr. Wong"
];

export default function EmployeeManagement({ goBack }) {
  const [mode, setMode] = useState("employee"); // "employee" | "site"
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);

  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSuperior, setSelectedSuperior] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState("");
  const [proof, setProof] = useState(null);

  const [records, setRecords] = useState([]);
  const [currentStock, setCurrentStock] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState("");

  // === Load employees and stock ===
  useEffect(() => {
    const list = getEmployees();
    if (list && list.length > 0) {
      setEmployees(list);
    } else {
      setEmployees(defaultEmployees);
    }
    
    // Load current stock
    const stock = stockService.getCurrentStock();
    setCurrentStock(stock);
    
    const savedRecords = localStorage.getItem("employee_records");
    if (savedRecords) setRecords(JSON.parse(savedRecords));
  }, []);

  // Save records to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem("employee_records", JSON.stringify(records));
  }, [records]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProof({
        preview: URL.createObjectURL(file),
        file: file,
      });
    }
  };

  const handleAddRecord = () => {
    if (mode === "employee") {
      if (!employee || !selectedItem || !selectedVariant || !quantity || !proof) {
        alert("⚠ Please fill all fields for employee!");
        return;
      }
    } else {
      if (!selectedSite || !selectedSuperior || !selectedItem || !selectedVariant || !quantity || !proof) {
        alert("⚠ Please fill all fields for site issue!");
        return;
      }
    }

    const requestedQuantity = parseInt(quantity);
    
    // Find the variant code from the selected variant label
    const selectedVariantObj = selectedItem.variants.find(v => v.label === selectedVariant);
    if (!selectedVariantObj) {
      alert("⚠ Selected variant not found!");
      return;
    }

    // Check stock availability
    const stockCheck = stockService.checkStockAvailability(
      selectedItem.id, 
      selectedVariantObj.code, 
      requestedQuantity
    );

    if (!stockCheck.available) {
      alert(`⚠ Insufficient stock!\nAvailable: ${stockCheck.currentBalance}\nRequested: ${requestedQuantity}`);
      return;
    }

    // Reduce stock
    const stockResult = stockService.reduceStock(
      selectedItem.id, 
      selectedVariantObj.code, 
      requestedQuantity
    );

    if (!stockResult.success) {
      alert(`⚠ Stock Error: ${stockResult.error}`);
      return;
    }

    const newRecord = {
      type: mode,
      employee: mode === "employee" ? employee.label : null,
      site: mode === "site" ? selectedSite.label : null,
      superior: mode === "site" ? selectedSuperior.label : null,
      item: `${selectedItem.name} (${selectedVariant})`,
      quantity: requestedQuantity,
      proof: proof.preview,
      date: new Date().toLocaleString(),
      // Store item details for future stock operations
      itemId: selectedItem.id,
      variantCode: selectedVariantObj.code,
    };

    setRecords([...records, newRecord]);

    // Update current stock display
    const updatedStock = stockService.getCurrentStock();
    setCurrentStock(updatedStock);

    alert(`✅ Record saved successfully!\n${stockResult.message}\nNew Balance: ${stockResult.newBalance}`);

    // Clear form
    setEmployee(null);
    setSelectedSite(null);
    setSelectedSuperior(null);
    setSelectedItem(null);
    setSelectedVariant("");
    setQuantity("");
    setProof(null);
  };

  // Handle return items (add back to stock)
  const handleReturnItem = (record) => {
    setSelectedRecord(record);
    setReturnQuantity("");
    setShowReturnModal(true);
  };

  // Process return/add stock
  const processReturn = () => {
    if (!selectedRecord || !returnQuantity) {
      alert("⚠ Please enter return quantity!");
      return;
    }

    const returnQty = parseInt(returnQuantity);
    if (returnQty <= 0 || returnQty > selectedRecord.quantity) {
      alert(`⚠ Invalid quantity! Must be between 1 and ${selectedRecord.quantity}`);
      return;
    }

    let stockResult;
    
    // If record has itemId and variantCode (new format)
    if (selectedRecord.itemId && selectedRecord.variantCode) {
      stockResult = stockService.increaseStock(
        selectedRecord.itemId,
        selectedRecord.variantCode,
        returnQty
      );
    } else {
      // For old records, parse the item string
      stockResult = stockService.processStockChangeFromString(
        selectedRecord.item,
        returnQty,
        'increase'
      );
    }

    if (!stockResult.success) {
      alert(`⚠ Stock Error: ${stockResult.error}`);
      return;
    }

    // Update the record quantity
    const updatedRecords = records.map(rec => {
      if (rec === selectedRecord) {
        return {
          ...rec,
          quantity: rec.quantity - returnQty,
          returnHistory: [
            ...(rec.returnHistory || []),
            {
              returnedQuantity: returnQty,
              returnDate: new Date().toLocaleString(),
              remainingQuantity: rec.quantity - returnQty
            }
          ]
        };
      }
      return rec;
    }).filter(rec => rec.quantity > 0); // Remove records with 0 quantity

    setRecords(updatedRecords);

    // Update current stock display
    const updatedStock = stockService.getCurrentStock();
    setCurrentStock(updatedStock);

    alert(`✅ Return processed successfully!\n${stockResult.message}\nNew Balance: ${stockResult.newBalance}`);

    // Close modal
    setShowReturnModal(false);
    setSelectedRecord(null);
    setReturnQuantity("");
  };

  // Add new stock (for restocking)
  const handleAddStock = () => {
    const itemName = prompt("Enter item name:");
    if (!itemName) return;

    const variantLabel = prompt("Enter variant (e.g., Size M, Standard):");
    if (!variantLabel) return;

    const quantity = prompt("Enter quantity to add:");
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      alert("⚠ Please enter a valid quantity!");
      return;
    }

    const stockResult = stockService.processStockChangeFromString(
      `${itemName} (${variantLabel})`,
      parseInt(quantity),
      'increase'
    );

    if (!stockResult.success) {
      alert(`⚠ Stock Error: ${stockResult.error}`);
      return;
    }

    // Update current stock display
    const updatedStock = stockService.getCurrentStock();
    setCurrentStock(updatedStock);

    alert(`✅ Stock added successfully!\n${stockResult.message}\nNew Balance: ${stockResult.newBalance}`);
  };

  return (
    <div className="page-container">
      <h2>👥 Employee / Site Management</h2>

      {/* Toggle Mode */}
      <div className="form-group">
        <label>🔀 Choose Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="employee">Employee Issue</option>
          <option value="site">Site Issue</option>
        </select>
      </div>

      {/* Employee Mode */}
      {mode === "employee" && (
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
      )}

      {/* Site Mode */}
      {mode === "site" && (
        <>
          <div className="form-group">
            <label>🏗️ Site</label>
            <Select
              options={sites.map((s) => ({ value: s, label: s }))}
              value={selectedSite}
              onChange={(opt) => setSelectedSite(opt)}
              placeholder="Select site..."
              isSearchable
            />
          </div>

          <div className="form-group">
            <label>👨‍💼 Superior</label>
            <Select
              options={superiors.map((sup) => ({ value: sup, label: sup }))}
              value={selectedSuperior}
              onChange={(opt) => setSelectedSuperior(opt)}
              placeholder="Select superior..."
              isSearchable
            />
          </div>
        </>
      )}

      {/* Item Taken */}
      <div className="form-group">
        <label>📦 Item Taken</label>
        <Select
          options={currentStock.map((it) => ({
            value: it.id,
            label: `${it.category} → ${it.name}`,
          }))}
          value={
            selectedItem
              ? { value: selectedItem.id, label: `${selectedItem.category} → ${selectedItem.name}` }
              : null
          }
          onChange={(option) => {
            const item = currentStock.find((it) => it.id === option.value);
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
            <img src={proof.preview} alt="Proof" className="proof-img" />
          </div>
        )}
      </div>

      <div className="button-group">
        <button className="issue-btn" onClick={handleAddRecord}>
          ✅ Save Record
        </button>
        <button className="add-stock-btn" onClick={handleAddStock}>
          📦 Add Stock
        </button>
      </div>

      {/* Records */}
      <h3>📜 Issuance Records</h3>
      {records.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        <table className="issue-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Employee / Site</th>
              <th>Superior</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Proof</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, index) => (
              <tr key={index}>
                <td>{rec.type}</td>
                <td>{rec.type === "employee" ? rec.employee : rec.site}</td>
                <td>{rec.type === "site" ? rec.superior : "-"}</td>
                <td>{rec.item}</td>
                <td>{rec.quantity}</td>
                <td>
                  {rec.proof && (
                    <img src={rec.proof} alt="Proof" className="proof-thumbnail" />
                  )}
                </td>
                <td>{rec.date}</td>
                <td>
                  <button 
                    className="return-btn" 
                    onClick={() => handleReturnItem(rec)}
                    title="Return items to stock"
                  >
                    🔄 Return
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🔄 Return Items to Stock</h3>
            <p><strong>Item:</strong> {selectedRecord.item}</p>
            <p><strong>Issued Quantity:</strong> {selectedRecord.quantity}</p>
            <p><strong>To:</strong> {selectedRecord.type === "employee" ? selectedRecord.employee : selectedRecord.site}</p>
            
            <div className="form-group">
              <label>Return Quantity:</label>
              <input
                type="number"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(e.target.value)}
                placeholder={`Max: ${selectedRecord.quantity}`}
                min="1"
                max={selectedRecord.quantity}
              />
            </div>
            
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={processReturn}>
                ✅ Confirm Return
              </button>
              <button className="cancel-btn" onClick={() => setShowReturnModal(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
