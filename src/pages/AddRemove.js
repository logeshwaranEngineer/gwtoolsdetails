import React, { useState, useEffect } from "react";
import "../style/AddRemove.css";
import { getAllItems, saveItemToDB, deleteItemFromDB } from "../server/db";

export default function AddRemove({ goBack }) {
  const defaultCategoriesList = [
  "FRC ORANGE PANT",
  "FRC ORANGE SHIRTS",
  "NORMAL GREY PANT",
  "NORMAL GREY SHIRT",
  "NORMAL ORANGE PANT",
  "NORMAL ORANGE SHIRTS",
  "NORMAL NAVY BLUE PANT",
  "SAFETY SHOE",
  "SAFETY GOGGLE",
  "EAR PLUG",
  "NORMAL HAND GLOVES",
  "ELECTRICAL HAND GLOVES",
  "WELDING HAND GLOVES",
  "GRINDING HAND GLOVES",
  "GARDENING GLOVE",
  "YELLOW COLOR HELMET",
  "WHITE COLOR HELMET",
  "HELMET INNER SIDE",
  "HELMET CHIN STRIP",
  "GLOVES HOLDER",
  "N95 MASK",
  "PARTICULATE RESPIRATOR MASK",
  "RESPIRATOR MASK (3M)",
  "GREEN COLOR VEST",
  "PINK COLOR VEST",
  "ORANGE COLOR VEST",
  "TRAFFIC CONTROL VEST",
  "MARKER PEN",
  "FACE SHIELD"
];

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([defaultCategoriesList]);
  const [form, setForm] = useState({
    category: "",
    names: [""],
    image: null,
    imageFile: null,
    dynamicFields: [],
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Fetch items
  useEffect(() => {
    async function fetchItems() {
      const allItems = await getAllItems();
      setItems(allItems);
      // Merge DB categories with default list
    const dbCategories = [...new Set(allItems.map(i => i.category))];
    const mergedCategories = Array.from(new Set([...defaultCategoriesList, ...dbCategories]));
    setCategories(mergedCategories);
    }
    fetchItems();
  }, []);

  // Save item
  const saveItem = async () => {
    if (!form.category.trim()) {
      alert("Category required");
      return;
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      category: form.category,
      names: form.names.filter(n => n.trim() !== ""),
      image: form.image,
      dynamicFields: form.dynamicFields.filter(f => f.label && f.value),
      date: new Date().toISOString(),
    };

    await saveItemToDB(newItem);
    const updatedItems = await getAllItems();
    setItems(updatedItems);
    setCategories([...new Set(updatedItems.map(i => i.category))]);
    setShowModal(false);
    setForm({ category: "", names: [""], image: null, imageFile: null, dynamicFields: [] });
    setEditingItem(null);
  };

  // Image handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, image: ev.target.result, imageFile: file }));
    };
    reader.readAsDataURL(file);
  };
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this item?")) return;

  try {
    await deleteItemFromDB(id); // pass only the ID
    const updatedItems = await getAllItems();
    setItems(updatedItems);
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete item. Check console for details.");
  }
};

  // Filters
  const filteredItems = items.filter(item => {
    const matchesText =
      searchText === "" ||
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.names.some(n => n.toLowerCase().includes(searchText.toLowerCase())) ||
      item.dynamicFields.some(f => `${f.label} ${f.value}`.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory = filterCategory === "" || item.category === filterCategory;

    const itemDate = new Date(item.date);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    const matchesDate =
      (!startDate || itemDate >= startDate) &&
      (!endDate || itemDate <= endDate);

    return matchesText && matchesCategory && matchesDate;
  });

  // Form handlers
  const handleCategoryChange = (e) => setForm({ ...form, category: e.target.value });
  const handleNameChange = (i, value) => {
    const newNames = [...form.names];
    newNames[i] = value;
    setForm({ ...form, names: newNames });
  };
  const addNameField = () => { if (form.names.length < 10) setForm({ ...form, names: [...form.names, ""] }); };
  const removeNameField = (i) => setForm({ ...form, names: form.names.filter((_, idx) => idx !== i) });
  const addDynamicField = () => setForm({ ...form, dynamicFields: [...form.dynamicFields, { label: "", value: "" }] });
  const removeDynamicField = (i) => setForm({ ...form, dynamicFields: form.dynamicFields.filter((_, idx) => idx !== i) });
  const handleDynamicFieldChange = (i, key, value) => {
    const updated = [...form.dynamicFields];
    updated[i][key] = value;
    setForm({ ...form, dynamicFields: updated });
  };

  // Modal
  const openAddModal = () => {
    setEditingItem(null);
    setForm({ category: "", names: [""], image: null, imageFile: null, dynamicFields: [] });
    setShowModal(true);
  };
  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      names: item.names || [""],
      image: item.image || null,
      dynamicFields: item.dynamicFields || []
    });
    setShowModal(true);
  };

  // Admin login
  const handleLogin = () => {
    if (loginPassword === "admin123") {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginPassword("");
    } else alert("❌ Wrong password!");
  };
  const handleLogout = () => setIsLoggedIn(false);
  const resetFilters = () => { setSearchText(""); setFilterCategory(""); setDateRange({ start: "", end: "" }); };

  return (
    <div className="addremove-container">
      <div className="header">
        <h2>📦 Manage Inventory</h2>
        <div>
          {!isLoggedIn ? (
            <button className="login-btn" onClick={() => setShowLoginModal(true)}>🔐 Login</button>
          ) : (
            <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
          )}
        </div>
      </div>

      <button className="add-btn" onClick={openAddModal}>➕ Add Item</button>

      {/* Filters */}
      <div className="filters">
        <input type="text" placeholder="🔍 Search by text..." value={searchText} onChange={e => setSearchText(e.target.value)} />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
        <label>Start Date: <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} /></label>
        <label>End Date: <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} /></label>
        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      {/* Items List */}
      <div className="items-list">
        {filteredItems.length === 0 && <p>No items found.</p>}
        {filteredItems.map(item => (
          <div key={item.id} className="item-card compact">
            <div className="card-left">
              {item.image ? <img src={item.image} alt={item.category} className="thumb" /> : <div className="no-thumb">📷</div>}
            </div>
            <div className="card-right">
              <div className="card-header">
                <h4 className="category">{item.category}</h4>
              </div>
                <div className="actions">
                  <button onClick={() => openEditModal(item)}>Edit</button>
                  {isLoggedIn && <button onClick={() => handleDelete(item)}>Delete</button>}
                </div>
              {item.names?.length > 0 && <div className="chips">{item.names.map((n, i) => <span key={i} className="chip">{n}</span>)}</div>}
              {item.dynamicFields?.length > 0 && <div className="specs">{item.dynamicFields.map((f, i) => <span key={i} className="spec-chip">{f.label}: {f.value}</span>)}</div>}
              <div className="meta">
                <span>📅 {item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingItem ? "Edit Item" : "➕ Add Item"}</h3>

            <div className="form-group">
              <label>Image (Required)*</label>
              {form.image && <img src={form.image} alt="preview" className="preview" />}
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="form-group">
              <label>Category (Required)*</label>
              <input
                list="category-options"
                type="text"
                value={form.category}
                onChange={handleCategoryChange}
                placeholder="Enter or select a category"
              />
              <datalist id="category-options">
                {categories.map((c, i) => <option key={i} value={c} />)}
              </datalist>
            </div>

            {/* <div className="form-group">
              <label>Custom Specifications (Optional)</label>
              {form.dynamicFields.map((f, i) => (
                <div key={i} className="spec-field">
                  <input type="text" placeholder="Label" value={f.label} onChange={e => handleDynamicFieldChange(i, "label", e.target.value)} />
                  <input type="text" placeholder="Value" value={f.value} onChange={e => handleDynamicFieldChange(i, "value", e.target.value)} />
                  <button onClick={() => removeDynamicField(i)}>DELETE🗑️</button>
                </div>
              ))}
              <button onClick={addDynamicField}>➕ Add Spec</button>
            </div> */}
<div className="form-group">
  <label>Custom Specifications (Optional)</label>
  {form.dynamicFields.map((f, i) => (
    <div key={i} className="spec-field">
      <input
        type="text"
        placeholder="Label"
        value={f.label}
        onChange={e => handleDynamicFieldChange(i, "label", e.target.value)}
      />
      <input
        type="text"
        placeholder="Value"
        value={f.value}
        onChange={e => handleDynamicFieldChange(i, "value", e.target.value)}
      />
      <button type="button" onClick={() => removeDynamicField(i)}>
        🗑️
      </button>
    </div>
  ))}
  <button type="button" onClick={addDynamicField}>➕ Add Spec</button>
</div>

            <div className="modal-actions">
              <button onClick={saveItem}>✅ {editingItem ? "Update" : "Save"}</button>
              <button onClick={() => setShowModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>🔐 Admin Login</h3>
            <input type="password" placeholder="Enter password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyPress={e => e.key === "Enter" && handleLogin()} />
            <div className="modal-actions">
              <button onClick={handleLogin}>✅ Login</button>
              <button onClick={() => setShowLoginModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
