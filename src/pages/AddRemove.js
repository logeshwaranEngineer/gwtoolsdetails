import React, { useState, useEffect } from "react";
import "../style/AddRemove.css";
import stockService from "../services/stockService";

export default function AddRemove({ goBack }) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    names: [""], // Array of names, starting with one empty name
    image: null // For image upload
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 items per page
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login state for delete visibility
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load items from localStorage
    const savedItems = localStorage.getItem("addRemoveItems");
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems);
      setItems(parsedItems);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(parsedItems.map(item => item.category))];
      setCategories(uniqueCategories);
    }
  };

  // Save items to localStorage
  const saveItems = (newItems) => {
    localStorage.setItem("addRemoveItems", JSON.stringify(newItems));
    setItems(newItems);
    
    // Update categories
    const uniqueCategories = [...new Set(newItems.map(item => item.category))];
    setCategories(uniqueCategories);
  };

  const handleCategoryChange = (e) => {
    setForm({ ...form, category: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm({ ...form, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Login functionality
  const handleLogin = () => {
    if (loginPassword === "admin123") { // Simple password check
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginPassword("");
      alert("✅ Logged in successfully! Delete options are now visible.");
    } else {
      alert("❌ Incorrect password!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("✅ Logged out successfully!");
  };

  const handleNameChange = (index, value) => {
    const newNames = [...form.names];
    newNames[index] = value;
    setForm({ ...form, names: newNames });
  };

  // Add more name fields (up to 10)
  const addNameField = () => {
    if (form.names.length < 10) {
      setForm({ ...form, names: [...form.names, ""] });
    }
  };

  // Remove name field
  const removeNameField = (index) => {
    if (form.names.length > 1) {
      const newNames = form.names.filter((_, i) => i !== index);
      setForm({ ...form, names: newNames });
    }
  };

  // Open modal for add
  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      category: "",
      names: [""],
      image: null
    });
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      names: item.names || [item.name], // Handle old format
      image: item.image || null
    });
    setShowModal(true);
  };

  // Save item (add or edit)
  const saveItem = () => {
    // No validation as requested
    const validNames = form.names.filter(name => name.trim() !== "");
    
    if (validNames.length === 0) {
      return; // At least one name should be provided
    }

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      category: form.category,
      names: validNames,
      image: form.image,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    let updatedItems;
    if (editingItem) {
      // Edit existing item
      updatedItems = items.map(item => 
        item.id === editingItem.id ? newItem : item
      );
    } else {
      // Add new item
      updatedItems = [...items, newItem];
    }

    saveItems(updatedItems);
    setShowModal(false);
    setForm({ category: "", names: [""], image: null });
  };

  // Delete item
  const deleteItem = (item) => {
    if (window.confirm(`⚠️ Do you want to remove "${item.category}" with ${item.names.length} item(s)?\n\nThis action cannot be undone.`)) {
      const updatedItems = items.filter(i => i.id !== item.id);
      saveItems(updatedItems);
      alert("✅ Item removed successfully!");
    }
  };

  // Helper function to parse date string to Date object and normalize to start of day
  const parseItemDate = (dateString) => {
    // Handle different date formats (MM/DD/YYYY, DD/MM/YYYY, etc.)
    const parts = dateString.split('/');
    let date;
    if (parts.length === 3) {
      // Assuming MM/DD/YYYY format (US format)
      date = new Date(parts[2], parts[0] - 1, parts[1]);
    } else {
      date = new Date(dateString);
    }
    // Set to start of day (00:00:00) for accurate comparison
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Filter items based on search and date
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const itemDate = parseItemDate(item.date);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of start date
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of end date
        matchesDateRange = itemDate >= start && itemDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of start date
        matchesDateRange = itemDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of end date
        matchesDateRange = itemDate <= end;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate]);

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="addremove-container">
      <div className="header">
        <h2>➕ Add Items</h2>
        <div className="header-actions">
          {!isLoggedIn ? (
            <button className="login-btn" onClick={() => setShowLoginModal(true)}>
              🔐 Login for Delete Access
            </button>
          ) : (
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      <p className="note">📌 Manage your items - Add, edit, and organize your inventory with images:</p>

      {/* Category Title Input */}
      {searchTerm && (
        <div className="category-title-display">
          <h3>📂 Showing results for: "{searchTerm}"</h3>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by category or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        {/* Date Range Filter */}
        <div className="date-filter-container">
          <div className="date-range-inputs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
              placeholder="Start date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
              placeholder="End date"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || startDate || endDate) && (
        <div className="active-filters">
          <h4>🔍 Active Filters:</h4>
          <div className="filter-tags">
            {searchTerm && (
              <span className="filter-tag">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")}>✕</button>
              </span>
            )}
            {(startDate || endDate) && (
              <span className="filter-tag">
                Date Range: {startDate ? new Date(startDate).toLocaleDateString() : 'Start'} - {endDate ? new Date(endDate).toLocaleDateString() : 'End'}
                <button onClick={() => { setStartDate(""); setEndDate(""); }}>✕</button>
              </span>
            )}
            <button className="clear-all-filters" onClick={clearDateFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="actions">
        <button className="add-btn" onClick={openAddModal}>➕ Add New Item</button>
      </div>

      {/* Items List */}
      <div className="items-overview">
        <div className="items-header">
          <h3>📊 Items List ({filteredItems.length})</h3>
          {filteredItems.length > itemsPerPage && (
            <div className="pagination-info">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
            </div>
          )}
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items found. Click "Add New Item" to create your first item.</p>
          </div>
        ) : (
          <>
            <div className="items-grid">
              {currentItems.map((item) => (
                <div key={item.id} className="item-card">
                  {/* Item Image */}
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.category} className="card-image" />
                    ) : (
                      <div className="no-image">
                        <span>📷</span>
                        <p>No Image</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="item-header">
                    <h4 className="item-category">📂 {item.category}</h4>
                    <div className="item-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => openEditModal(item)}
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      {isLoggedIn && (
                        <button 
                          className="delete-btn" 
                          onClick={() => deleteItem(item)}
                          title="Delete item (Admin only)"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="item-content">
                    <div className="item-names">
                      <strong>📌 Items ({item.names.length}):</strong>
                      <div className="names-list">
                        {item.names.map((name, idx) => (
                          <span key={idx} className="name-tag">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="item-meta">
                      <span className="item-date">📅 {item.date}</span>
                      <span className="item-time">🕐 {item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ⬅️ Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`page-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next ➡️
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingItem ? "✏️ Edit Item" : "➕ Add New Item"}</h3>

            {/* Image Upload */}
            <div className="form-group">
              <label>📷 Item Image:</label>
              <div className="image-upload-section">
                {form.image && (
                  <div className="image-preview">
                    <img src={form.image} alt="Preview" className="preview-image" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="image-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="image-upload-btn">
                  📷 {form.image ? "Change Image" : "Upload Image"}
                </label>
              </div>
            </div>

            {/* Category Field */}
            <div className="form-group">
              <label>📂 Category:</label>
              {categories.length > 0 ? (
                <select
                  value={form.category}
                  onChange={handleCategoryChange}
                  className="category-select"
                >
                  <option value="">-- Select or type new category --</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : null}
              <input
                type="text"
                placeholder="Enter category name"
                value={form.category}
                onChange={handleCategoryChange}
                className="category-input"
              />
            </div>

            {/* Names Fields */}
            <div className="form-group">
              <label>📌 Item Names (up to 10):</label>
              {form.names.map((name, index) => (
                <div key={index} className="name-field">
                  <input
                    type="text"
                    placeholder={`Item name ${index + 1}`}
                    value={name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className="name-input"
                  />
                  {form.names.length > 1 && (
                    <button
                      type="button"
                      className="remove-name-btn"
                      onClick={() => removeNameField(index)}
                    >
                      ➖
                    </button>
                  )}
                </div>
              ))}
              
              {form.names.length < 10 && (
                <button
                  type="button"
                  className="add-name-btn"
                  onClick={addNameField}
                >
                  ➕ Add More Names ({form.names.length}/10)
                </button>
              )}
            </div>

            <div className="modal-actions">
              <button className="confirm-btn" onClick={saveItem}>
                ✅ {editingItem ? "Update Item" : "Save Item"}
              </button>
              <button className="cancel-btn" onClick={() => {
                setShowModal(false);
                setForm({ category: "", names: [""], image: null });
                setEditingItem(null);
              }}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal login-modal">
            <h3>🔐 Admin Login</h3>
            <p>Enter password to access delete functionality:</p>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Enter admin password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="password-input"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleLogin}>
                ✅ Login
              </button>
              <button className="cancel-btn" onClick={() => {
                setShowLoginModal(false);
                setLoginPassword("");
              }}>❌ Cancel</button>
            </div>
            
            <p className="login-hint">💡 Hint: Default password is "admin123"</p>
          </div>
        </div>
      )}
    </div>
  );
}
