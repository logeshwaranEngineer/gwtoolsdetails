// src/components/pages/EmployeeManagement.js
import React, { useState, useEffect, useRef } from "react";
import "../style/Employee.css";
import { getEmployees, saveEmployees } from "../utils/storage";
import { defaultEmployees } from "../data/employees";
import { getAllItems, saveItemToDB } from "../server/db";
import Select from "react-select";
import employeeService from "../services/employeeService";
import stockService from "../services/stockService";
import { isUsingAPI } from "../config/storage";
import {
  getEmployeeRecords,
  saveEmployeeRecords,
} from "../utils/recordsStorage";

// 🔹 Sites List
const sites = [
  "IWMF",
  "CORA",
  "VSMC SITE",
  "MSD",
  "IESS SOONLEE",
  "CYE OFFICE",
  "MEP WORKSHOP",
  "MEP OFFICE",
  "CDA PIPING (MEP WORKSHOP)",
  "SITE LAYDOWN BANYAN",
  "WAN CHENG(OFFICE COME)",
];

// 🔹 Example Superiors
const superiors = ["Mr. Raj", "Mr. Kumar", "Mr. Tan", "Mr. Wong"];

export default function EmployeeManagement({
  goBack,
  onNavigateToAddRemove,
  user,
}) {
  const [activeTab, setActiveTab] = useState("issue"); // "issue" | "issued" | "employee-history" | "site-history"
  const [mode, setMode] = useState("employee"); // "employee" | "site"
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState(null);

  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSuperior, setSelectedSuperior] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState("");
  const [proof, setProof] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("user"); // 'user' (front) | 'environment' (back)
  const [showCameraChoice, setShowCameraChoice] = useState(false);

  const [records, setRecords] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [returnQuantity, setReturnQuantity] = useState("");

  // Filter states for tabs
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [filterItem, setFilterItem] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");

  // === Load employees and items from AddRemove ===
  useEffect(() => {
    (async () => {
      // Load employees list (API preferred)
      if (isUsingAPI()) {
        const resp = await employeeService.getAllEmployeesAPI();
        if (resp?.success && Array.isArray(resp.data)) {
          setEmployees(resp.data.map(e => e.name));
        } else {
          // fallback to local storage defaults if API fails
          const list = getEmployees();
          setEmployees(list && list.length > 0 ? list : defaultEmployees);
        }
      } else {
        const list = getEmployees();
        setEmployees(list && list.length > 0 ? list : defaultEmployees);
      }

      // Load items from AddRemove database
      await loadAvailableItems();

      // Load records from API (DB) if configured, otherwise from local
      if (isUsingAPI()) {
        const resp = await employeeService.getAllRecords();
        if (resp?.success && Array.isArray(resp.data)) {
          setRecords(resp.data);
        }
      } else {
        const saved = await getEmployeeRecords();
        if (saved && Array.isArray(saved)) setRecords(saved);
      }
    })();
  }, []);

  // Load items from AddRemove database
  const loadAvailableItems = async () => {
    try {
      const items = await getAllItems();
      // Transform AddRemove items to include quantity info from dynamic fields
      const transformedItems = items.map((item) => {
        const quantity = getQuantityFromDynamicFields(item.dynamicFields);
        return {
          id: item.id,
          category: item.category,
          names: item.names || [],
          image: item.image,
          dynamicFields: item.dynamicFields || [],
          // Extract quantity from dynamic fields if available
          availableQuantity: quantity,
          hasQuantity: quantity !== null,
          originalItem: item,
        };
      });
      setAvailableItems(transformedItems);
    } catch (error) {
      console.error("Error loading items:", error);
      setAvailableItems([]);
    }
  };

  // Helper function to extract quantity from dynamic fields
  const getQuantityFromDynamicFields = (dynamicFields) => {
    if (!Array.isArray(dynamicFields)) return null;
    const quantityField = dynamicFields.find(
      (field) => field.label && field.label.toLowerCase().includes("quantity")
    );
    return quantityField ? parseInt(quantityField.value) || 0 : null;
  };

  // Persist records whenever updated
  useEffect(() => {
    (async () => {
      if (isUsingAPI()) {
        // Push only the latest record to API to avoid duplicates
        const latest = records[records.length - 1];
        if (latest) {
          await employeeService.saveRecord(latest);
        }
      } else {
        await saveEmployeeRecords(records);
      }
    })();
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
  // Stop current camera stream if any
  const stopCamera = () => {
    try {
      const video = videoRef.current;
      const stream = video && video.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((t) => t.stop());
        if (video) video.srcObject = null;
      }
      setStreaming(false);
    } catch (e) {
      // no-op
    }
  };

  // 📷 Start webcam with desired facing mode
  const startCamera = async (facing = cameraFacing) => {
    try {
      // Stop previous stream before starting a new one
      stopCamera();

      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      // Some desktop browsers ignore facingMode; they may still open default camera
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setCameraFacing(facing);
        setShowCameraChoice(false);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Unable to access the camera. Please allow permissions or try a different device.");
    }
  };

  // 🔄 Switch between front and back cameras
  const toggleCameraFacing = async () => {
    const next = cameraFacing === 'user' ? 'environment' : 'user';
    await startCamera(next);
  };

  // 🎞️ Capture from webcam
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/png");

      setProof({
        preview: dataUrl,
        file: null, // you can convert base64 → File if needed for upload
      });

      // Auto stop camera after capturing
      stopCamera();
    }
  };

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  const handleAddRecord = async () => {
    if (mode === "employee") {
      if (!employee || !selectedItem || !quantity || !proof) {
        alert("⚠ Please fill all fields for employee!");
        return;
      }
    } else {
      if (
        !selectedSite ||
        !selectedSuperior ||
        !selectedItem ||
        !quantity ||
        !proof
      ) {
        alert("⚠ Please fill all fields for site issue!");
        return;
      }
    }

    const requestedQuantity = parseInt(quantity);

    // Check if item has quantity tracking
    if (!selectedItem.hasQuantity) {
      const proceed = window.confirm(
        `⚠ Warning: This item doesn't have quantity tracking!\n\n` +
          `Item: ${selectedItem.category} - ${selectedItem.names.join(
            ", "
          )}\n` +
          `Requested: ${requestedQuantity}\n\n` +
          `The system cannot track inventory for this item. Do you want to proceed anyway?`
      );
      if (!proceed) return;
    } else {
      // Check if requested quantity is available (only if quantity tracking exists)
      if (requestedQuantity > selectedItem.availableQuantity) {
        alert(
          `⚠ Insufficient quantity!\nAvailable: ${selectedItem.availableQuantity}\nRequested: ${requestedQuantity}`
        );
        return;
      }
    }

    try {
      // Reduce quantity in AddRemove item (only if quantity tracking exists)
      if (selectedItem.hasQuantity) {
        const updatedItem = { ...selectedItem.originalItem };
        const quantityFieldIndex = updatedItem.dynamicFields.findIndex(
          (field) =>
            field.label && field.label.toLowerCase().includes("quantity")
        );

        if (quantityFieldIndex !== -1) {
          const currentQty =
            parseInt(updatedItem.dynamicFields[quantityFieldIndex].value) || 0;
          const newQty = currentQty - requestedQuantity;
          updatedItem.dynamicFields[quantityFieldIndex].value =
            newQty.toString();

          // Save updated item back to AddRemove database
          await saveItemToDB(updatedItem);
        }
      }

      const newRecord = {
        type: mode,
        employee: mode === "employee" ? employee.label : null,
        site: mode === "site" ? selectedSite.label : null,
        superior: mode === "site" ? selectedSuperior.label : null,
        item: `${selectedItem.category} - ${selectedItem.names.join(", ")}`,
        quantity: requestedQuantity,
        proof: proof.preview,
        date: new Date().toLocaleString(),
        // Store item details for future operations
        itemId: selectedItem.id,
        originalItem: selectedItem.originalItem,
      };

      // Persist to DB when API mode; else keep local state
      if (isUsingAPI()) {
        const resp = await employeeService.saveRecord(newRecord);
        if (!resp?.success) {
          console.error("Save to API failed:", resp?.error);
          alert("❌ Failed to save to server. Record kept locally.");
        }
      }

      setRecords((prev) => [...prev, newRecord]);

      // Reload available items to reflect updated quantities
      await loadAvailableItems();

      // Show appropriate success message based on quantity tracking
      if (selectedItem.hasQuantity) {
        alert(
          `✅ Record saved successfully!\nQuantity reduced from ${
            selectedItem.availableQuantity
          } to ${selectedItem.availableQuantity - requestedQuantity}`
        );
      } else {
        alert(
          `✅ Record saved successfully!\n⚠ Note: This item doesn't have quantity tracking, so inventory wasn't updated.`
        );
      }

      // Clear form
      setEmployee(null);
      setSelectedSite(null);
      setSelectedSuperior(null);
      setSelectedItem(null);
      setSelectedVariant("");
      setQuantity("");
      setProof(null);
    } catch (error) {
      console.error("Error saving record:", error);
      alert("❌ Error saving record. Please try again.");
    }
  };

  // Handle return items (add back to stock)
  const handleReturnItem = (record) => {
    setSelectedRecord(record);
    setReturnQuantity("");
    setShowReturnModal(true);
  };

  // Process return/add stock
  const processReturn = async () => {
    if (!selectedRecord || !returnQuantity) {
      alert("⚠ Please enter return quantity!");
      return;
    }

    const returnQty = parseInt(returnQuantity);
    if (returnQty <= 0 || returnQty > selectedRecord.quantity) {
      alert(
        `⚠ Invalid quantity! Must be between 1 and ${selectedRecord.quantity}`
      );
      return;
    }

    try {
      // Find the item in AddRemove database and increase quantity (only if it has quantity tracking)
      let quantityUpdated = false;
      if (selectedRecord.itemId && selectedRecord.originalItem) {
        const updatedItem = { ...selectedRecord.originalItem };
        const quantityFieldIndex = updatedItem.dynamicFields.findIndex(
          (field) =>
            field.label && field.label.toLowerCase().includes("quantity")
        );

        if (quantityFieldIndex !== -1) {
          const currentQty =
            parseInt(updatedItem.dynamicFields[quantityFieldIndex].value) || 0;
          const newQty = currentQty + returnQty;
          updatedItem.dynamicFields[quantityFieldIndex].value =
            newQty.toString();

          // Save updated item back to AddRemove database
          await saveItemToDB(updatedItem);
          quantityUpdated = true;
        }
      }

      // Update the record quantity
      const updatedRecords = records
        .map((rec) => {
          if (rec === selectedRecord) {
            return {
              ...rec,
              quantity: rec.quantity - returnQty,
              returnHistory: [
                ...(rec.returnHistory || []),
                {
                  returnedQuantity: returnQty,
                  returnDate: new Date().toLocaleString(),
                  remainingQuantity: rec.quantity - returnQty,
                },
              ],
            };
          }
          return rec;
        })
        .filter((rec) => rec.quantity > 0); // Remove records with 0 quantity

      setRecords(updatedRecords);

      // Reload available items to reflect updated quantities
      await loadAvailableItems();

      // Show appropriate success message based on whether quantity was updated
      if (quantityUpdated) {
        alert(
          `✅ Return processed successfully!\nQuantity ${returnQty} returned to inventory`
        );
      } else {
        alert(
          `✅ Return processed successfully!\n⚠ Note: This item doesn't have quantity tracking, so inventory wasn't updated.`
        );
      }

      // Close modal
      setShowReturnModal(false);
      setSelectedRecord(null);
      setReturnQuantity("");
    } catch (error) {
      console.error("Error processing return:", error);
      alert("❌ Error processing return. Please try again.");
    }
  };

  // Refresh items from AddRemove
  const handleRefreshItems = async () => {
    await loadAvailableItems();
    alert("✅ Items refreshed from inventory!");
  };

  // Helper functions for filtering and data processing
  const getUniqueEmployees = () => {
    const employeeRecords = records.filter((rec) => rec.type === "employee");
    return [...new Set(employeeRecords.map((rec) => rec.employee))].filter(
      Boolean
    );
  };

  const getUniqueSites = () => {
    const siteRecords = records.filter((rec) => rec.type === "site");
    return [...new Set(siteRecords.map((rec) => rec.site))].filter(Boolean);
  };

  const getUniqueItems = () => {
    return [...new Set(records.map((rec) => rec.item))].filter(Boolean);
  };

  const getFilteredRecords = () => {
    let filtered = [...records];

    if (activeTab === "employee-history" && filterEmployee) {
      filtered = filtered.filter(
        (rec) => rec.type === "employee" && rec.employee === filterEmployee
      );
    }

    if (activeTab === "site-history" && filterSite) {
      filtered = filtered.filter(
        (rec) => rec.type === "site" && rec.site === filterSite
      );
    }

    if (filterItem) {
      filtered = filtered.filter((rec) =>
        rec.item.toLowerCase().includes(filterItem.toLowerCase())
      );
    }

    return filtered;
  };

  // Reset filters when switching tabs
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setFilterEmployee("");
    setFilterSite("");
    setFilterItem("");
  };

  return (
    <div className="page-container">
      <h2>👥 Employee / Site Management</h2>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #ddd",
          marginBottom: "20px",
          gap: "0",
        }}
      >
        <button
          onClick={() => handleTabChange("issue")}
          style={{
            padding: "12px 20px",
            border: "none",
            background: activeTab === "issue" ? "#007bff" : "#f8f9fa",
            color: activeTab === "issue" ? "white" : "#333",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            fontSize: "14px",
            fontWeight: activeTab === "issue" ? "bold" : "normal",
            borderBottom:
              activeTab === "issue"
                ? "3px solid #007bff"
                : "3px solid transparent",
          }}
        >
          📝 Issue Items
        </button>
        <button
          onClick={() => handleTabChange("issued")}
          style={{
            padding: "12px 20px",
            border: "none",
            background: activeTab === "issued" ? "#007bff" : "#f8f9fa",
            color: activeTab === "issued" ? "white" : "#333",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            fontSize: "14px",
            fontWeight: activeTab === "issued" ? "bold" : "normal",
            borderBottom:
              activeTab === "issued"
                ? "3px solid #007bff"
                : "3px solid transparent",
          }}
        >
          📋 All Issued Items ({records.length})
        </button>
        <button
          onClick={() => handleTabChange("employee-history")}
          style={{
            padding: "12px 20px",
            border: "none",
            background:
              activeTab === "employee-history" ? "#007bff" : "#f8f9fa",
            color: activeTab === "employee-history" ? "white" : "#333",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            fontSize: "14px",
            fontWeight: activeTab === "employee-history" ? "bold" : "normal",
            borderBottom:
              activeTab === "employee-history"
                ? "3px solid #007bff"
                : "3px solid transparent",
          }}
        >
          👷 Employee History ({getUniqueEmployees().length})
        </button>
        <button
          onClick={() => handleTabChange("site-history")}
          style={{
            padding: "12px 20px",
            border: "none",
            background: activeTab === "site-history" ? "#007bff" : "#f8f9fa",
            color: activeTab === "site-history" ? "white" : "#333",
            cursor: "pointer",
            borderRadius: "8px 8px 0 0",
            fontSize: "14px",
            fontWeight: activeTab === "site-history" ? "bold" : "normal",
            borderBottom:
              activeTab === "site-history"
                ? "3px solid #007bff"
                : "3px solid transparent",
          }}
        >
          🏗️ Site History ({getUniqueSites().length})
        </button>
      </div>

      {/* Info about quantity tracking - only show on issue tab */}
      {activeTab === "issue" && (
        <div
          style={{
            background: "#e8f4fd",
            border: "1px solid #bee5eb",
            borderRadius: "4px",
            padding: "10px",
            marginBottom: "15px",
            fontSize: "14px",
          }}
        >
          <strong>💡 Quantity Tracking Info:</strong>
          <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
            <li>
              Items with quantity tracking will show available stock and update
              inventory automatically
            </li>
            <li>
              Items without quantity tracking will show "No Qty Tracking" - you
              can still issue them but inventory won't be updated
            </li>
            <li>
              To add quantity tracking: Go to AddRemove → Edit item → Add a
              field with "Quantity" in the label
            </li>
          </ul>
        </div>
      )}

      {/* Issue Items Tab */}
      {activeTab === "issue" && (
        <>
          {/* Toggle Mode */}
          <div className="form-group">
            <label>🔀 Choose Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{
                minHeight: "45px",
                fontSize: "16px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
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
                menuPosition="fixed"
                menuPortalTarget={document.body}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    minHeight: "45px",
                    fontSize: "16px",
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: "16px",
                    padding: "10px",
                  }),
                  menuPortal: (provided) => ({
                    ...provided,
                    zIndex: 9999,
                  }),
                }}
              />

              {/* Add / Remove employee controls */}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Add new employee"
                  value={newEmployeeName || ""}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const name = (newEmployeeName || "").trim();
                    if (!name) return alert("Enter a name");
                    if (employees.includes(name))
                      return alert("Employee already exists");

                    if (isUsingAPI()) {
                      const resp = await employeeService.addEmployeeAPI(name);
                      if (!resp?.success) {
                        alert(`Failed to add employee: ${resp?.error || 'Unknown error'}`);
                        return;
                      }
                    } else {
                      const updated = [...employees, name];
                      saveEmployees(updated);
                    }

                    setEmployees(prev => [...prev, name]);
                    setNewEmployeeName("");
                  }}
                  className="issue-btn"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!employee?.label)
                      return alert("Select an employee to remove");
                    const name = employee.label;

                    if (isUsingAPI()) {
                      const resp = await employeeService.deleteEmployeeByNameAPI(name);
                      if (!resp?.success) {
                        alert(`Failed to remove employee: ${resp?.error || 'Unknown error'}`);
                        return;
                      }
                    } else {
                      const updated = employees.filter((e) => e !== name);
                      saveEmployees(updated);
                    }

                    setEmployees((prev) => prev.filter((e) => e !== name));
                    setEmployee(null);
                  }}
                  className="reset-btn"
                >
                  Remove
                </button>
              </div>
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
                  menuPosition="fixed"
                  menuPortalTarget={document.body}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: "45px",
                      fontSize: "16px",
                    }),
                    option: (provided) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "10px",
                    }),
                    menuPortal: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                  }}
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
                  menuPosition="fixed"
                  menuPortalTarget={document.body}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: "45px",
                      fontSize: "16px",
                    }),
                    option: (provided) => ({
                      ...provided,
                      fontSize: "16px",
                      padding: "10px",
                    }),
                    menuPortal: (provided) => ({
                      ...provided,
                      zIndex: 9999,
                    }),
                  }}
                />
              </div>
            </>
          )}

          {/* Item Taken */}
          <div className="form-group">
            <label>📦 Item Taken</label>
            <Select
              options={availableItems.map((item) => ({
                value: item.id,
                label: `${item.category} → ${item.names.join(", ")} ${
                  item.hasQuantity
                    ? `(Qty: ${item.availableQuantity})`
                    : "(No Qty Tracking)"
                }`,
                item: item,
              }))}
              value={
                selectedItem
                  ? {
                      value: selectedItem.id,
                      label: `${
                        selectedItem.category
                      } → ${selectedItem.names.join(", ")} ${
                        selectedItem.hasQuantity
                          ? `(Qty: ${selectedItem.availableQuantity})`
                          : "(No Qty Tracking)"
                      }`,
                      item: selectedItem,
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedItem(option.item);
              }}
              placeholder="Search & select item..."
              isSearchable
              menuPosition="fixed"
              menuPortalTarget={document.body}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: "45px",
                  fontSize: "16px",
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: "16px",
                  padding: "10px",
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />
          </div>

          {/* Show item details */}
          {selectedItem && (
            <div className="form-group">
              <label>📋 Item Details</label>
              <div
                style={{
                  background: "#f5f5f5",

                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                {/* Image preview if available */}
                {(selectedItem.image ||
                  (selectedItem.originalItem &&
                    selectedItem.originalItem.image)) && (
                  <div style={{ marginBottom: "10px" }}>
                    <img
                      src={
                        selectedItem.image ||
                        (selectedItem.originalItem &&
                          selectedItem.originalItem.image)
                      }
                      alt={selectedItem.category}
                      style={{ maxWidth: "20%", borderRadius: "4px" }}
                    />
                  </div>
                )}
                {/* <p><strong>Names:</strong> {selectedItem.names.join(', ')}</p> */}

                {/* <p>
                      <strong>Category:</strong> {selectedItem.category}
                    </p>
                <p>
                  <strong>Available Quantity:</strong>{" "}
                  {selectedItem.hasQuantity ? (
                    selectedItem.availableQuantity
                  ) : (
                    <span style={{ color: "#ff6b35" }}>
                      ⚠ No quantity tracking
                    </span>
                  )}
                </p> */}

                {selectedItem.dynamicFields.length > 0 && (
                  <div>
                    <strong>Specifications:</strong>
                    <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                      {selectedItem.dynamicFields.map((field, index) => (
                        <li key={index}>
                          {field.label}: {field.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
              min="1"
              max={
                selectedItem && selectedItem.hasQuantity
                  ? selectedItem.availableQuantity
                  : ""
              }
              style={{
                minHeight: "45px",
                fontSize: "16px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            {selectedItem && (
              <small style={{ color: "#666", fontSize: "14px" }}>
                {selectedItem.hasQuantity
                  ? `Maximum available: ${selectedItem.availableQuantity}`
                  : "⚠ This item has no quantity tracking - inventory won't be updated"}
              </small>
            )}
          </div>

          {/* Proof */}
          <div className="form-group">
            <label>📷 Capture / Upload Proof</label>

            {/* File Upload */}
            <input type="file" accept="image/*" onChange={handleFileChange} />

            {/* Camera Section */}
            <div style={{ marginTop: "10px" }}>
              {!streaming && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!showCameraChoice && (
                    <button type="button" onClick={() => setShowCameraChoice(true)}>
                      Start Camera
                    </button>
                  )}
                  {showCameraChoice && (
                    <>
                      <button type="button" onClick={() => startCamera('user')}>
                        Front Camera
                      </button>
                      <button type="button" onClick={() => startCamera('environment')}>
                        Back Camera
                      </button>
                      <button type="button" onClick={() => setShowCameraChoice(false)}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
              {streaming && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={capturePhoto}>
                    Capture Photo
                  </button>
                  <button type="button" onClick={toggleCameraFacing}>
                    Switch Camera ({cameraFacing === 'user' ? 'Front' : 'Back'})
                  </button>
                  <button type="button" onClick={stopCamera}>
                    Stop Camera
                  </button>
                </div>
              )}
            </div>

            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: "100%",
                maxWidth: "300px",
                marginTop: "10px",
                borderRadius: "6px",
              }}
            ></video>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

            {/* Preview */}
            {proof && (
              <div className="proof-preview" style={{ marginTop: "10px" }}>
                <img
                  src={proof.preview}
                  alt="Proof"
                  className="proof-img"
                  style={{ maxWidth: "30%", borderRadius: "6px" }}
                />
              </div>
            )}
          </div>

          <div className="button-group">
            <button className="issue-btn" onClick={handleAddRecord}>
              ✅ Save Record
            </button>
            <button className="add-stock-btn" onClick={handleRefreshItems}>
              🔄 Refresh Items
            </button>
            {/* Only show AddRemove button for admin */}
            {/* {onNavigateToAddRemove && user === "admin" && (
          <button className="nav-btn" onClick={() => onNavigateToAddRemove('issue')}>
            📦 Manage Inventory (AddRemove)
          </button>
        )} */}
          </div>

          {/* Show message for supervisor */}
          {user === "supervisor" && (
            <div
              style={{
                background: "#e8f5e8",
                border: "1px solid #4caf50",
                borderRadius: "4px",
                padding: "10px",
                margin: "10px 0",
                color: "#2e7d32",
                textAlign: "center",
              }}
            >
              👷 Supervisor Mode - You can issue products to employees and
              record transactions
            </div>
          )}
        </>
      )}

      {/* All Issued Items Tab */}
      {activeTab === "issued" && (
        <>
          <h3>📋 All Issued Items</h3>

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#e3f2fd",
                border: "1px solid #2196f3",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <h4 style={{ margin: "0 0 5px 0", color: "#1976d2" }}>
                📊 Total Records
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1976d2",
                }}
              >
                {records.length}
              </p>
            </div>
            <div
              style={{
                background: "#e8f5e8",
                border: "1px solid #4caf50",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <h4 style={{ margin: "0 0 5px 0", color: "#388e3c" }}>
                👷 Employees
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#388e3c",
                }}
              >
                {getUniqueEmployees().length}
              </p>
            </div>
            <div
              style={{
                background: "#fff3e0",
                border: "1px solid #ff9800",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <h4 style={{ margin: "0 0 5px 0", color: "#f57c00" }}>
                🏗️ Sites
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#f57c00",
                }}
              >
                {getUniqueSites().length}
              </p>
            </div>
            <div
              style={{
                background: "#fce4ec",
                border: "1px solid #e91e63",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center",
              }}
            >
              <h4 style={{ margin: "0 0 5px 0", color: "#c2185b" }}>
                📦 Unique Items
              </h4>
              <p
                style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#c2185b",
                }}
              >
                {getUniqueItems().length}
              </p>
            </div>
          </div>

          {/* Filter by item */}
          <div className="form-group">
            <label>🔍 Filter by Item</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={filterItem}
                onChange={(e) => setFilterItem(e.target.value)}
                placeholder="Search items..."
                style={{
                  minHeight: "45px",
                  fontSize: "16px",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  flex: "1",
                  boxSizing: "border-box",
                }}
              />
              {filterItem && (
                <button
                  onClick={() => setFilterItem("")}
                  style={{
                    minHeight: "45px",
                    padding: "10px 15px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ❌ Clear
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Employee History Tab */}
      {activeTab === "employee-history" && (
        <>
          <h3>👷 Employee History</h3>

          {/* Employee selector */}
          <div className="form-group">
            <label>👷 Select Employee</label>
            <Select
              options={getUniqueEmployees().map((emp) => ({
                value: emp,
                label: emp,
              }))}
              value={
                filterEmployee
                  ? { value: filterEmployee, label: filterEmployee }
                  : null
              }
              onChange={(option) =>
                setFilterEmployee(option ? option.value : "")
              }
              placeholder="Select employee to view history..."
              isClearable
              isSearchable
              menuPosition="fixed"
              menuPortalTarget={document.body}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: "45px",
                  fontSize: "16px",
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: "16px",
                  padding: "10px",
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />
          </div>

          {filterEmployee && (
            <div
              style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h4>📊 Summary for {filterEmployee}</h4>
              <p>
                <strong>Total Items Issued:</strong>{" "}
                {getFilteredRecords().length}
              </p>
              <p>
                <strong>Total Quantity:</strong>{" "}
                {getFilteredRecords().reduce(
                  (sum, rec) => sum + rec.quantity,
                  0
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* Site History Tab */}
      {activeTab === "site-history" && (
        <>
          <h3>🏗️ Site History</h3>

          {/* Site selector */}
          <div className="form-group">
            <label>🏗️ Select Site</label>
            <Select
              options={getUniqueSites().map((site) => ({
                value: site,
                label: site,
              }))}
              value={
                filterSite ? { value: filterSite, label: filterSite } : null
              }
              onChange={(option) => setFilterSite(option ? option.value : "")}
              placeholder="Select site to view history..."
              isClearable
              isSearchable
              menuPosition="fixed"
              menuPortalTarget={document.body}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: "45px",
                  fontSize: "16px",
                }),
                option: (provided) => ({
                  ...provided,
                  fontSize: "16px",
                  padding: "10px",
                }),
                menuPortal: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
              }}
            />
          </div>

          {filterSite && (
            <div
              style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h4>📊 Summary for {filterSite}</h4>
              <p>
                <strong>Total Items Issued:</strong>{" "}
                {getFilteredRecords().length}
              </p>
              <p>
                <strong>Total Quantity:</strong>{" "}
                {getFilteredRecords().reduce(
                  (sum, rec) => sum + rec.quantity,
                  0
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* Records Table - Show for all tabs except issue */}
      {activeTab !== "issue" && (
        <>
          {(() => {
            const filteredRecords = getFilteredRecords();
            return filteredRecords.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                }}
              >
                <p style={{ fontSize: "18px", color: "#6c757d" }}>
                  {activeTab === "employee-history" && !filterEmployee
                    ? "👷 Select an employee to view their history"
                    : activeTab === "site-history" && !filterSite
                    ? "🏗️ Select a site to view its history"
                    : "📭 No records found"}
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    background: "#e8f5e8",
                    border: "1px solid #4caf50",
                    borderRadius: "4px",
                    padding: "10px",
                    marginBottom: "15px",
                    textAlign: "center",
                  }}
                >
                  <strong>📊 Showing {filteredRecords.length} record(s)</strong>
                  {activeTab === "employee-history" && filterEmployee && (
                    <span>
                      {" "}
                      for employee: <strong>{filterEmployee}</strong>
                    </span>
                  )}
                  {activeTab === "site-history" && filterSite && (
                    <span>
                      {" "}
                      for site: <strong>{filterSite}</strong>
                    </span>
                  )}
                  {filterItem && (
                    <span>
                      {" "}
                      matching: <strong>"{filterItem}"</strong>
                    </span>
                  )}
                </div>

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
                    {filteredRecords.map((rec, index) => (
                      <tr key={index}>
                        <td>
                          <span
                            style={{
                              background:
                                rec.type === "employee" ? "#007bff" : "#28a745",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {rec.type === "employee" ? "👷 EMP" : "🏗️ SITE"}
                          </span>
                        </td>
                        <td style={{ fontWeight: "bold" }}>
                          {rec.type === "employee" ? rec.employee : rec.site}
                        </td>
                        <td>{rec.type === "site" ? rec.superior : "-"}</td>
                        <td>{rec.item}</td>
                        <td
                          style={{
                            fontWeight: "bold",
                            color: "#007bff",
                          }}
                        >
                          {rec.quantity}
                        </td>
                        <td>
                          {rec.proof && (
                            <img
                              src={rec.proof}
                              alt="Proof"
                              className="proof-thumbnail"
                            />
                          )}
                        </td>
                        <td style={{ fontSize: "12px" }}>{rec.date}</td>
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
              </>
            );
          })()}
        </>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🔄 Return Items to Stock</h3>
            <p>
              <strong>Item:</strong> {selectedRecord.item}
            </p>
            <p>
              <strong>Issued Quantity:</strong> {selectedRecord.quantity}
            </p>
            <p>
              <strong>To:</strong>{" "}
              {selectedRecord.type === "employee"
                ? selectedRecord.employee
                : selectedRecord.site}
            </p>

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
              <button
                className="cancel-btn"
                onClick={() => setShowReturnModal(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
