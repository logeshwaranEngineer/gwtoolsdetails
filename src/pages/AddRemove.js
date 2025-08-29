import React, { useState, useEffect } from "react";
import "../style/AddRemove.css";

export default function AddRemove({ goBack }) {
  // ✅ Default categories (always available after reset)
  const defaultCategories = [
    { id: 1, category: "Steel", name: "Steel Rod", quantity: 50, spec: "10mm" },
    { id: 2, category: "Cable", name: "Power Cable", quantity: 30, spec: "Copper" },
    { id: 3, category: "PPE", name: "Safety Helmet", quantity: 20, spec: "Yellow" },
  ];

  // ✅ Initialize categories directly from localStorage (no flicker/reset on refresh)
  const [categories, setCategories] = useState(() => {
    const stored = localStorage.getItem("categories");
    return stored ? JSON.parse(stored) : defaultCategories;
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    category: "",
    name: "",
    quantity: "",
    spec: "",
  });

  // ✅ Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add new category
  const addCategory = () => {
    if (
      !form.category.trim() ||
      !form.name.trim() ||
      !form.quantity.trim() ||
      !form.spec.trim()
    ) {
      alert("⚠️ Please enter all details before saving!");
      return;
    }

    const newCategory = {
      id: Date.now(), // unique id
      ...form,
    };

    setCategories([...categories, newCategory]);

    setForm({ category: "", name: "", quantity: "", spec: "" });
    setShowModal(false);
  };

  // ✅ Remove category
  const removeCategory = (id) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  // ✅ Reset categories to default
  const resetCategories = () => {
    if (window.confirm("⚠️ Are you sure you want to reset? All custom data will be lost.")) {
      setCategories(defaultCategories);
      localStorage.setItem("categories", JSON.stringify(defaultCategories));
    }
  };

  return (
    <div className="addremove-container">
      <div className="header">
        <h2>➕➖ Category Management</h2>
      </div>

      <p className="note">📌 Please select a category or add a new item:</p>

      <div className="category-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card">
            <div className="category-details">
              <p><strong>📂 Category:</strong> {cat.category}</p>
              {cat.name && <p><strong>📌 Item:</strong> {cat.name}</p>}
              {cat.quantity && <p><strong>📦 Quantity:</strong> {cat.quantity}</p>}
              {cat.spec && <p><strong>🔧 Specification:</strong> {cat.spec}</p>}
            </div>
            <button className="remove-btn" onClick={() => removeCategory(cat.id)}>❌</button>
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="add-btn" onClick={() => setShowModal(true)}>➕ Add New Item</button>
        <button className="reset-btn" onClick={resetCategories}>🔄 Reset</button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Item</h3>

            <input
              type="text"
              name="category"
              placeholder="Category (e.g. Welding)"
              value={form.category}
              onChange={handleChange}
            />
            <input
              type="text"
              name="name"
              placeholder="Item Name (e.g. Welding Rod)"
              value={form.name}
              onChange={handleChange}
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity (e.g. 10)"
              value={form.quantity}
              onChange={handleChange}
            />
            <input
              type="text"
              name="spec"
              placeholder="Specification (e.g. 3mm, LED, etc.)"
              value={form.spec}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button className="confirm-btn" onClick={addCategory}>✅ Save</button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
