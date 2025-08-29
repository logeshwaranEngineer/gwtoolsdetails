import React, { useState } from "react";
import "../style/AddRemove.css";

export default function AddRemove({ goBack }) {
  const [categories, setCategories] = useState([
    { category: "Steel", name: "", quantity: 0, spec: "" },
    { category: "Cable", name: "", quantity: 0, spec: "" },
    { category: "PPE", name: "", quantity: 0, spec: "" },
    { category: "Stationary", name: "", quantity: 0, spec: "" },
    { category: "Pipes", name: "", quantity: 0, spec: "" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    category: "",
    name: "",
    quantity: "",
    spec: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addCategory = () => {
    if (!form.category.trim() || !form.name.trim()) return;
    setCategories([...categories, form]);
    setForm({ category: "", name: "", quantity: "", spec: "" });
    setShowModal(false);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  return (
    <div className="addremove-container">
      <div className="header">
        <h2>➕➖ Category Management</h2>
        <button className="back-btn" onClick={goBack}>⬅ Back</button>
      </div>

      <p className="note">📌 Please select a category or add a new item:</p>

      <div className="category-grid">
        {categories.map((cat, index) => (
          <div key={index} className="category-card">
            <div>
              <strong>{cat.category}</strong>
              {cat.name && <p>📌 {cat.name}</p>}
              {cat.quantity && <p>📦 Qty: {cat.quantity}</p>}
              {cat.spec && <p>🔧 {cat.spec}</p>}
            </div>
            <button
              className="remove-btn"
              onClick={() => removeCategory(index)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      <button className="add-btn" onClick={() => setShowModal(true)}>
        ➕ Add New Item
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Item</h3>

            <input
              type="text"
              name="category"
              placeholder="New Category (e.g. Light)"
              value={form.category}
              onChange={handleChange}
            />
            <input
              type="text"
              name="name"
              placeholder="Item Name (e.g. Light with spec)"
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
              placeholder="Specification (e.g. LED, pen)"
              value={form.spec}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button className="confirm-btn" onClick={addCategory}>
                ✅ Save
              </button>
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
