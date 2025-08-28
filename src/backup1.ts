import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ✅ PPE images from assets
import frcPantImg from "./assets/frc_pant1.svg";
import frcShirtImg from "./assets/frc_shirt1.svg";
import greyShirtImg from "./assets/frc_shirt1.svg";
import safetyShoeImg from "./assets/shoes.svg";
import safetyGlassImg from "./assets/glass.svg";
import earplugImg from "./assets/earplug1.svg";
import glovesImg from "./assets/glove_holder1.svg";
import helmetImg from "./assets/helmet1.svg";
import holderImg from "./assets/glove_holder1.svg";
import maskImg from "./assets/mask.svg";

// ✅ Allowed employees (only these can take PPE)
const allowedEmployees = [
  "BABU MD SOHAG", "KABIR MD ALAMGIR", "PALANIVEL MANIMARAN",
  "MULLAINATHAN GNANAPRAKASAM", "BARMON ONEMIS", "MIAH MD SUJON",
  "MATUBBAR MD SHAHADAT", "SHAHADOT MOHAMMAD", "KANNAN TAMILKUMARAN",
  "SIVAKUMAR MADHAVAN", "NAEEM MD", "MIAH EDUL", "SHEIKH MD SHAMIM",
  "ISLAM TARIQUL", "HOSSAIN MD RAKIB", "SHAHPARAN", "ARUMUGAM NAGARATH",
  "DURAIBHARATHI LOGESHWARAN", "BORA HARI PRASAD", "SINDHASHA ABULKASIMJUNAITHUL",
  "NEELAKANDAN SURESH", "KAZI SAJIB", "BHUIYAN MD TAMIM", "BEPARI MD RAHMAN",
  "KUPPUSAMY SEMBAN", "MURUGESEN NIVAS", "WIN ZAW OO",
  "GUNASEKARAN PURUSHOTHAMAN", "BHUIYAN NADIM", "KARUPPIAH KANAGARAJ",
  "DHIRAVIDA SELVAM SELVAGANAPATHI", "BALAKRISHNAN CHELLADURAI",
  "RAMAMOORTHY VISHWA", "SEPENA JANARDHANA RAO", "MOLLA MD ASIF",
  "MARUF MD", "KUMAR PRABHAKAR", "PRANTO JUBAYER HOSSEN",
  "CHITRARASAN KALAIYARASAN", "MRIDHA ROBIN", "HASAN ATIK",
  "SIDDIK MD ABU BAKKAR", "RANGANATHAN IYAPPAN", "MIA MD SUJON",
];

// ✅ Initial stock with images
const initialStock = [
  { id: 1, name: "SAFETY SHOE (SIZE: 8)", brand: "KINGS", balance: 7, img: safetyShoeImg },
  { id: 2, name: "SAFETY SHOE (SIZE: 9)", brand: "CHETHAK", balance: 17, img: safetyShoeImg },
  { id: 3, name: "SAFETY GLASS", brand: "GENERIC", balance: 168, img: safetyGlassImg },
  { id: 4, name: "EAR PLUG", brand: "GENERIC", balance: 200, img: earplugImg },
  { id: 5, name: "HAND GLOVES", brand: "PROSAFE", balance: 482, img: glovesImg },
  { id: 6, name: "SAFETY HELMET (YELLOW)", brand: "GENERIC", balance: 36, img: helmetImg },
  { id: 7, name: "MASK (N95)", brand: "GENERIC", balance: 47, img: maskImg },
  { id: 8, name: "FRC PANT", brand: "GENERIC", balance: 25, img: frcPantImg },
  { id: 9, name: "FRC SHIRT", brand: "GENERIC", balance: 25, img: frcShirtImg },
  { id: 10, name: "GREY SHIRT", brand: "GENERIC", balance: 40, img: greyShirtImg },
  { id: 11, name: "GLOVE HOLDER", brand: "GENERIC", balance: 60, img: holderImg },
];

// ⏱️ Helpers
const todayISO = () => new Date().toISOString().split("T")[0];
const STORAGE_KEYS = {
  STOCK: "ppe_stock_v1",
  TX: "ppe_transactions_v1",
};

// ✅ Employee Details with PPE Sizes
const employeeDetails = [
  { name: "BABU MD SOHAG", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "KABIR MD ALAMGIR", shoeSize: "9", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "PALANIVEL MANIMARAN", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "MULLAINATHAN GNANAPRAKASAM", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "BARMON ONEMIS", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "S", department: "Safety" },
  { name: "MIAH MD SUJON", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "MATUBBAR MD SHAHADAT", shoeSize: "8", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "SHAHADOT MOHAMMAD", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "KANNAN TAMILKUMARAN", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "SIVAKUMAR MADHAVAN", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "NAEEM MD", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "S", department: "Safety" },
  { name: "MIAH EDUL", shoeSize: "9", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "SHEIKH MD SHAMIM", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "ISLAM TARIQUL", shoeSize: "9", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "HOSSAIN MD RAKIB", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "SHAHPARAN", shoeSize: "9", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "ARUMUGAM NAGARATH", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "DURAIBHARATHI LOGESHWARAN", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "BORA HARI PRASAD", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "S", department: "Safety" },
  { name: "SINDHASHA ABULKASIMJUNAITHUL", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "NEELAKANDAN SURESH", shoeSize: "8", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "KAZI SAJIB", shoeSize: "9", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "BHUIYAN MD TAMIM", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "BEPARI MD RAHMAN", shoeSize: "9", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "KUPPUSAMY SEMBAN", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "MURUGESEN NIVAS", shoeSize: "9", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "WIN ZAW OO", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "S", department: "Safety" },
  { name: "GUNASEKARAN PURUSHOTHAMAN", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "BHUIYAN NADIM", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "KARUPPIAH KANAGARAJ", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "DHIRAVIDA SELVAM SELVAGANAPATHI", shoeSize: "8", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "BALAKRISHNAN CHELLADURAI", shoeSize: "9", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "RAMAMOORTHY VISHWA", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "SEPENA JANARDHANA RAO", shoeSize: "9", shirtSize: "M", pantSize: "30", helmetSize: "S", department: "Safety" },
  { name: "MOLLA MD ASIF", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "MARUF MD", shoeSize: "9", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "KUMAR PRABHAKAR", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "PRANTO JUBAYER HOSSEN", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "CHITRARASAN KALAIYARASAN", shoeSize: "8", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
  { name: "MRIDHA ROBIN", shoeSize: "9", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "HASAN ATIK", shoeSize: "8", shirtSize: "XL", pantSize: "34", helmetSize: "L", department: "Maintenance" },
  { name: "SIDDIK MD ABU BAKKAR", shoeSize: "9", shirtSize: "M", pantSize: "30", helmetSize: "S", department: "Safety" },
  { name: "RANGANATHAN IYAPPAN", shoeSize: "8", shirtSize: "L", pantSize: "32", helmetSize: "M", department: "Production" },
  { name: "MIA MD SUJON", shoeSize: "9", shirtSize: "M", pantSize: "30", helmetSize: "M", department: "Quality" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("stock-management");
  const [stock, setStock] = useState(initialStock);
  const [transactions, setTransactions] = useState([]);
  const [employee, setEmployee] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchEmp, setSearchEmp] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const savedStock = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || "null");
    const savedTx = JSON.parse(localStorage.getItem(STORAGE_KEYS.TX) || "null");
    if (Array.isArray(savedStock)) setStock(savedStock);
    if (Array.isArray(savedTx)) setTransactions(savedTx);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TX, JSON.stringify(transactions));
  }, [transactions]);

  // Employee list filtered for the picker
  const filteredEmployees = useMemo(() => {
    const q = searchEmp.trim().toUpperCase();
    if (!q) return allowedEmployees;
    return allowedEmployees.filter((e) => e.includes(q));
  }, [searchEmp]);

  // Employee details filtered for the employee details tab
  const filteredEmployeeDetails = useMemo(() => {
    const q = searchEmployee.trim().toUpperCase();
    if (!q) return employeeDetails;
    return employeeDetails.filter((e) => 
      e.name.includes(q) || 
      e.department.toUpperCase().includes(q)
    );
  }, [searchEmployee]);

  const resetForm = () => {
    setEmployee("");
    setItemId("");
    setQuantity(1);
    setSearchEmp("");
  };

  const issueItem = () => {
    if (!employee.trim() || !itemId || quantity <= 0) {
      alert("⚠️ Please fill all fields");
      return;
    }

    // ✅ Enforce allowed employees (case-insensitive)
    const empNorm = employee.trim().toUpperCase();
    if (!allowedEmployees.includes(empNorm)) {
      alert("❌ This employee is not allowed to take PPE");
      return;
    }

    const idx = stock.findIndex((s) => s.id === Number(itemId));
    if (idx === -1) {
      alert("⚠️ Invalid item selected");
      return;
    }

    const item = stock[idx];
    if (item.balance < quantity) {
      alert("⚠️ Not enough stock available!");
      return;
    }

    // Update stock
    const newStock = [...stock];
    newStock[idx] = { ...newStock[idx], balance: newStock[idx].balance - quantity };
    setStock(newStock);

    // Add transaction
    const newTx = {
      date: todayISO(),
      employee: empNorm,
      item: item.name,
      brand: item.brand,
      img: item.img,
      quantity,
    };
    setTransactions((prev) => [...prev, newTx]);

    resetForm();
  };

  // Export only today's transactions to Excel
  const exportTodayToExcel = () => {
    const today = todayISO();
    const todayTx = transactions.filter((t) => t.date === today);
    if (todayTx.length === 0) {
      alert("⚠️ No transactions for today!");
      return;
    }

    // Order columns nicely
    const rows = todayTx.map((t, i) => ({
      "#": i + 1,
      Date: t.date,
      Employee: t.employee,
      Item: t.item,
      Brand: t.brand,
      Quantity: t.quantity,
    }));

    const ws = XLSX.utils.json_to_sheet(rows, { origin: 0 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");

    // Set column widths
    ws["!cols"] = [
      { wch: 4 },  // #
      { wch: 12 }, // Date
      { wch: 26 }, // Employee
      { wch: 28 }, // Item
      { wch: 16 }, // Brand
      { wch: 10 }, // Qty
    ];

    const fileName = `Transactions_${today}.xlsx`;
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, fileName);
  };

  // Google Drive Upload Configuration
  // To enable Google Drive upload, follow these steps:
  // 1. Go to https://script.google.com
  // 2. Create a new project and paste the Apps Script code (see instructions below)
  // 3. Deploy as web app and copy the URL here
  const GAS_ENDPOINT = ""; // Paste your Google Apps Script Web App URL here
  
  const uploadTodayToDrive = async () => {
    
    if (!GAS_ENDPOINT) {
      const instructions = `
🔧 GOOGLE DRIVE UPLOAD SETUP INSTRUCTIONS:

1. Go to https://script.google.com
2. Click "New Project"
3. Replace the default code with this Apps Script code:

function doPost(e) {
  try {
    const blob = e.parameter.file;
    const fileName = e.parameter.fileName || 'PPE_Transactions.xlsx';
    const folder = DriveApp.getFolderById('YOUR_FOLDER_ID'); // Replace with your folder ID
    const file = folder.createFile(blob);
    file.setName(fileName);
    return ContentService.createTextOutput(JSON.stringify({success: true, fileId: file.getId()}));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}));
  }
}

4. Save the project with a name like "PPE Upload Handler"
5. Click "Deploy" > "New Deployment"
6. Choose type: "Web app"
7. Execute as: "Me"
8. Who has access: "Anyone" (or your organization)
9. Click "Deploy" and copy the Web App URL
10. Paste the URL in the GAS_ENDPOINT variable in this code
11. Replace 'YOUR_FOLDER_ID' with your Google Drive folder ID

To get your folder ID:
- Open Google Drive
- Create/open the folder where you want files uploaded
- Copy the folder ID from the URL (the long string after /folders/)

Need help? Contact your IT administrator.
      `;
      
      alert(instructions);
      return;
    }

    const today = todayISO();
    const todayTx = transactions.filter((t) => t.date === today);
    if (todayTx.length === 0) {
      alert("⚠️ No transactions for today!");
      return;
    }

    const rows = todayTx.map((t, i) => ({
      "#": i + 1,
      Date: t.date,
      Employee: t.employee,
      Item: t.item,
      Brand: t.brand,
      Quantity: t.quantity,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const form = new FormData();
    form.append("file", blob, `Transactions_${today}.xlsx`);

    try {
      const res = await fetch(GAS_ENDPOINT, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      alert("✅ Uploaded to Google Drive");
    } catch (err) {
      console.error(err);
      alert("❌ Upload error. Check console and endpoint setup.");
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <h1 className="app-title">
          🦺 PPE Stock Management System
        </h1>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "stock-management" ? "active" : ""}`}
            onClick={() => setActiveTab("stock-management")}
          >
            📦 Stock Management
          </button>
          <button
            className={`tab-button ${activeTab === "employee-details" ? "active" : ""}`}
            onClick={() => setActiveTab("employee-details")}
          >
            👥 Employee Details
          </button>
        </div>

        {/* Stock Management Tab */}
        {activeTab === "stock-management" && (
          <>
        {/* Issue Form */}
        <div className="card">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="section-title">
              📝 Issue PPE Equipment
            </h2>
            <div className="text-sm text-gray-500">
              Date: <span className="font-semibold">{todayISO()}</span>
            </div>
          </div>

          <div className="form-grid">
            {/* Employee Picker (search + select) */}
            <div className="form-group span-2">
              <label className="form-label">
                👤 Employee (Authorized Personnel Only)
              </label>
              <div className="employee-search-container">
                <input
                  type="text"
                  placeholder="🔍 Type to search employee name..."
                  value={searchEmp}
                  onChange={(e) => setSearchEmp(e.target.value)}
                  className="form-input search-input"
                />
                <select
                  value={employee}
                  onChange={(e) => {
                    setEmployee(e.target.value);
                    setSearchEmp(""); // Clear search when employee is selected
                  }}
                  className="form-select"
                >
                  <option value="">
                    {filteredEmployees.length === 0 
                      ? "No employees found" 
                      : `Select from ${filteredEmployees.length} authorized employee${filteredEmployees.length !== 1 ? 's' : ''}`
                    }
                  </option>
                  {filteredEmployees.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                {searchEmp && (
                  <div className="search-results-info">
                    Found {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} matching "{searchEmp}"
                  </div>
                )}
              </div>
            </div>

            {/* Item */}
            <div className="form-group">
              <label className="form-label">🛡️ PPE Item</label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="form-select"
              >
                <option value="">Select PPE equipment</option>
                {stock.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.balance} available)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">📊 Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="form-input"
                placeholder="Enter quantity"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={issueItem}
              className="btn btn-primary btn-lg"
            >
              ✅ Issue Equipment
            </button>
            <button
              onClick={resetForm}
              className="btn btn-secondary"
            >
              🔄 Reset Form
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={exportTodayToExcel}
                className="btn btn-success"
              >
                📤 Export Today’s Excel
              </button>
              <button
                onClick={uploadTodayToDrive}
                className="btn btn-info"
                title="Click for setup instructions if not configured"
              >
                ☁️ Upload to Drive {!GAS_ENDPOINT && "(Setup Required)"}
              </button>
            </div>
          </div>
        </div>

        {/* Stock Table */}
        <div className="card">
          <h2 className="section-title">
            📦 Current Stock Inventory
          </h2>
          <div className="table-container overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>PPE Item</th>
                  <th>Brand</th>
                  <th>Stock Balance</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((s) => (
                  <tr key={s.id}>
                    <td className="table-cell-image">
                      <div className="item-image">
                        <img src={s.img} alt={s.name} />
                      </div>
                    </td>
                    <td className="table-cell-text">{s.name}</td>
                    <td className="table-cell-secondary">{s.brand}</td>
                    <td className="table-cell-number">{s.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions */}
        <div className="card">
          <h2 className="section-title">
            📝 Equipment Issue History
          </h2>
          <div className="table-container overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Issue Date</th>
                  <th>Employee Name</th>
                  <th>Image</th>
                  <th>PPE Item</th>
                  <th>Brand</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-400 italic" style={{padding: '2rem'}}>
                      📋 No equipment issued yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, i) => (
                    <tr key={`${t.date}-${i}`}>
                      <td className="table-cell-date">{t.date}</td>
                      <td className="table-cell-text">{t.employee}</td>
                      <td className="table-cell-image">
                        <div className="item-image item-image-sm">
                          <img src={t.img} alt={t.item} />
                        </div>
                      </td>
                      <td className="table-cell-text">{t.item}</td>
                      <td className="table-cell-secondary">{t.brand}</td>
                      <td className="table-cell-number">{t.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* Employee Details Tab */}
        {activeTab === "employee-details" && (
          <div className="card">
            <h2 className="section-title">
              👥 Employee PPE Size Details
            </h2>
            
            {/* Employee Search */}
            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label className="form-label">
                🔍 Search Employee or Department
              </label>
              <input
                type="text"
                placeholder="Type employee name or department..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="form-input"
                style={{maxWidth: '400px'}}
              />
              {searchEmployee && (
                <div className="search-results-info" style={{maxWidth: '400px', marginTop: '0.5rem'}}>
                  Found {filteredEmployeeDetails.length} employee{filteredEmployeeDetails.length !== 1 ? 's' : ''} matching "{searchEmployee}"
                </div>
              )}
            </div>

            {/* Employee Details Table */}
            <div className="table-container overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>👟 Shoe Size</th>
                    <th>👕 Shirt Size</th>
                    <th>👖 Pant Size</th>
                    <th>⛑️ Helmet Size</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployeeDetails.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-400 italic" style={{padding: '2rem'}}>
                        👤 No employees found matching your search
                      </td>
                    </tr>
                  ) : (
                    filteredEmployeeDetails.map((emp, i) => (
                      <tr key={i}>
                        <td className="table-cell-text font-semibold">{emp.name}</td>
                        <td className="table-cell-secondary">
                          <span className={`department-badge department-${emp.department.toLowerCase()}`}>
                            {emp.department}
                          </span>
                        </td>
                        <td className="table-cell-number">{emp.shoeSize}</td>
                        <td className="table-cell-number">{emp.shirtSize}</td>
                        <td className="table-cell-number">{emp.pantSize}</td>
                        <td className="table-cell-number">{emp.helmetSize}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Employee Statistics */}
            <div className="employee-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{employeeDetails.length}</div>
                  <div className="stat-label">Total Employees</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{[...new Set(employeeDetails.map(e => e.department))].length}</div>
                  <div className="stat-label">Departments</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{employeeDetails.filter(e => e.shoeSize === "8").length}</div>
                  <div className="stat-label">Size 8 Shoes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{employeeDetails.filter(e => e.shoeSize === "9").length}</div>
                  <div className="stat-label">Size 9 Shoes</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="app-footer">
          Professional PPE Management System - Use the search functionality to quickly locate authorized personnel for equipment issuance.
        </div>
      </div>
    </div>
  );
}
