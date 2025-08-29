// src/components/pages/Issue.js
import React, { useState, useEffect } from "react";
import "../style/Issue.css";
import { getEmployees, saveEmployees } from "../utils/storage";

export default function Issue({ goBack }) {
  const [employeeRecords, setEmployeeRecords] = useState([]);
  const [employees, setEmployees] = useState([]); // 👈 central employee list
  const [employee, setEmployee] = useState("");
  const [newEmployee, setNewEmployee] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [issuedList, setIssuedList] = useState([]);
  const [employeeManagementRecords, setEmployeeManagementRecords] = useState([]); // 👈 from Employee Management

  // ✅ Load data from localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem("employeeRecords");
    if (savedRecords) {
      setEmployeeRecords(JSON.parse(savedRecords));
    }

    // ✅ Load employees from storage utility (includes default employees)
    const employeeList = getEmployees();
    setEmployees(employeeList);

    const issued = localStorage.getItem("issuedList");
    if (issued) {
      setIssuedList(JSON.parse(issued));
    }

    // ✅ Load Employee Management records
    const empMgmtRecords = localStorage.getItem("employee_records");
    if (empMgmtRecords) {
      setEmployeeManagementRecords(JSON.parse(empMgmtRecords));
    }
  }, []);

  // ✅ Save issued list to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem("issuedList", JSON.stringify(issuedList));
  }, [issuedList]);

  // ✅ Add New Employee
  const handleAddEmployee = () => {
    if (!newEmployee.trim()) {
      alert("⚠ Please enter a valid name!");
      return;
    }
    if (employees.includes(newEmployee.trim())) {
      alert("⚠ Employee already exists!");
      return;
    }

    const updated = [...employees, newEmployee.trim()];
    setEmployees(updated);
    saveEmployees(updated); // Save to localStorage using utility
    setNewEmployee("");
    alert(`✅ Added ${newEmployee}`);
  };

  // ✅ Handle Item Issue
  const handleIssue = () => {
    if (!employee || !selectedItem || !quantity) {
      alert("⚠ Please fill all fields before issuing!");
      return;
    }

    const selectedRecordIndex = employeeRecords.findIndex(
      (rec) => rec.employee === employee && rec.item === selectedItem
    );

    if (selectedRecordIndex === -1) {
      alert("❌ Item not found for this employee.");
      return;
    }

    const availableQty = employeeRecords[selectedRecordIndex].quantity;
    const issueQty = parseInt(quantity);

    if (issueQty > availableQty) {
      alert(`⚠ Not enough stock! Available: ${availableQty}`);
      return;
    }

    // ✅ Update employee record stock
    const updatedRecords = [...employeeRecords];
    updatedRecords[selectedRecordIndex].quantity -= issueQty;
    setEmployeeRecords(updatedRecords);
    localStorage.setItem("employeeRecords", JSON.stringify(updatedRecords));

    // ✅ Add to issued list
    const newIssue = {
      employee,
      item: selectedItem,
      quantity: issueQty,
      date: new Date().toLocaleString(),
    };

    setIssuedList([...issuedList, newIssue]);

    // reset form
    setEmployee("");
    setSelectedItem("");
    setQuantity("");
  };

  // ✅ Clear issued history
  const clearIssuedHistory = () => {
    if (window.confirm("⚠ Are you sure you want to clear issued history?")) {
      setIssuedList([]);
      localStorage.removeItem("issuedList");
    }
  };

  // ✅ Group Employee Management records by employee
  const getEmployeeItemsList = () => {
    const grouped = {};
    employeeManagementRecords.forEach(record => {
      if (!grouped[record.employee]) {
        grouped[record.employee] = [];
      }
      grouped[record.employee].push(record);
    });
    return grouped;
  };

  return (
    <div className="page-container">
      <h2>📦 Issue Items</h2>

      {/* Employee Name */}
      {/* <div className="form-group">
        <label>👷 Select Employee</label>
        <select value={employee} onChange={(e) => setEmployee(e.target.value)}>
          <option value="">-- Select Employee --</option>
          {employees.map((emp, i) => (
            <option key={i} value={emp}>
              {emp}
            </option>
          ))}
        </select>
      </div> */}

      {/* Add New Employee */}
      {/* <div className="form-group">
        <label>➕ Add Employee</label>
        <input
          type="text"
          value={newEmployee}
          placeholder="Enter new employee name"
          onChange={(e) => setNewEmployee(e.target.value)}
        />
        <button onClick={handleAddEmployee}>Add</button>
      </div> */}

      {/* Item dropdown auto from EmployeeManagement */}
      {/* <div className="form-group">
        <label>📦 Select Item</label>
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">-- Select Item --</option>
          {employeeRecords
            .filter((rec) => rec.employee === employee)
            .map((rec, i) => (
              <option key={i} value={rec.item}>
                {rec.item} (Available: {rec.quantity})
              </option>
            ))}
        </select>
      </div> */}

      {/* Quantity */}
      {/* <div className="form-group">
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
      </button> */}

      {/* Employee Items from Employee Management */}
      <h3>👥 Employee Items List (From Employee Management)</h3>
      {employeeManagementRecords.length === 0 ? (
        <p>No employee records found from Employee Management.</p>
      ) : (
        <div className="employee-items-section">
          {Object.entries(getEmployeeItemsList()).map(([employeeName, records]) => (
            <div key={employeeName} className="employee-card">
              <h4 className="employee-name">👷 {employeeName}</h4>
              <div className="items-list">
                {records.map((record, index) => (
                  <div key={index} className="item-card">
                    <div className="item-info">
                      <span className="item-name">📦 {record.item}</span>
                      <span className="item-quantity">Qty: {record.quantity}</span>
                      <span className="item-date">📅 {record.date}</span>
                    </div>
                    {record.proof && (
                      <div className="item-proof">
                        <img src={record.proof} alt="Proof" className="proof-thumbnail" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issued List */}
      <h3>📜 Issued Records</h3>
      {issuedList.length === 0 ? (
        <p>No items issued yet.</p>
      ) : (
        <>
          <table className="issue-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {issuedList.map((issue, index) => (
                <tr key={index}>
                  <td>{issue.employee}</td>
                  <td>{issue.item}</td>
                  <td>{issue.quantity}</td>
                  <td>{issue.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="reset-btn" onClick={clearIssuedHistory}>
            🗑 Clear Issued History
          </button>
        </>
      )}

      <button className="back-btn" onClick={goBack}>
        ⬅ Back
      </button>
    </div>
  );
}
