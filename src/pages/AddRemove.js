import React, { useState, useEffect, useRef } from "react";
import "../style/AddRemove.css";
import { getAllItems, saveItemToDB, deleteItemFromDB } from "../server/db";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Select from "react-select";

export default function AddRemove({ goBack, user }) {
  const defaultCategoriesList = [
    "FRC ORANGE PANT",
    "FRC ORANGE SHIRTS",
    "NORMAL GREY PANT",
    "NORMAL GREY SHIRT",
    "NORMAL ORANGE PANT",
    "NORMAL ORANGE SHIRT",
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
    "FACE SHIELD",
  ];
  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  // Fetch items
  useEffect(() => {
    async function fetchItems() {
      try {
        const allItems = (await getAllItems()) || [];
        // sort newest first
        allItems.sort((a, b) => new Date(b.date) - new Date(a.date));
        setItems(allItems);

        setCategories(buildCategories(allItems)); // ✅ clean + safe
        
        // Update template to include all unique fields from all items
        updateTemplateWithAllFields(allItems);
      } catch (e) {
        console.error("Failed to load items", e);
        setItems([]);
        setCategories(defaultCategoriesList); // ✅ fallback safely
      }
    }
    fetchItems();
  }, []);

  // === Default Spec Options ===
  const defaultSpecOptions = {
    color: ["Red", "Blue", "Green", "Black", "White", "Yellow"],
    size: ["XS", "S", "M", "L", "XL", "XXL"],
    material: ["Steel", "Aluminium", "Copper", "Brass", "Plastic", "Wood"],
    grade: [
      "Mild Steel (MS)",
      "Stainless Steel (SS)",
      "Cast Iron (CI)",
      "Tool Steel",
      "High Carbon",
    ],
    width: Array.from({ length: 20 }, (_, n) => `${(n + 1) * 2} mm`),
    height: Array.from({ length: 20 }, (_, n) => `${(n + 1) * 2} mm`),
    quantity: Array.from({ length: 100 }, (_, n) => `${n + 1}`),
  };
  const buildCategories = (items) =>
    Array.from(
      new Set([
        ...defaultCategoriesList,
        ...items.map((i) => i.category).filter(Boolean),
      ])
    );

  // Function to update template with all unique fields from all items
  const updateTemplateWithAllFields = (items) => {
    try {
      // Get all unique field labels from all items
      const allFieldLabels = new Set();
      
      items.forEach(item => {
        if (Array.isArray(item.dynamicFields)) {
          item.dynamicFields.forEach(field => {
            if (field.label && field.label.trim()) {
              allFieldLabels.add(field.label.trim());
            }
          });
        }
      });

      // Convert to array and sort for consistent order
      const sortedLabels = Array.from(allFieldLabels).sort();
      
      // Create comprehensive template
      const comprehensiveTemplate = sortedLabels.map(label => ({
        label: label,
        value: ""
      }));

      // Only update if we have fields and the template is different
      if (comprehensiveTemplate.length > 0) {
        const currentTemplate = Array.isArray(templates?.[0]) ? templates[0] : [];
        const currentLabels = currentTemplate.map(t => t.label).sort();
        const newLabels = sortedLabels.sort();
        
        // Check if templates are different
        if (JSON.stringify(currentLabels) !== JSON.stringify(newLabels)) {
          const newTemplates = [comprehensiveTemplate];
          setTemplates(newTemplates);
          localStorage.setItem("templates", JSON.stringify(newTemplates));
          console.log("Template updated with all fields:", sortedLabels);
        }
      }
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  const [specOptions, setSpecOptions] = useState(() => {
    try {
      const stored = localStorage.getItem("specOptions");
      const parsed = stored ? JSON.parse(stored) : null;
      // validate shape minimally
      return parsed && typeof parsed === "object"
        ? { ...defaultSpecOptions, ...parsed }
        : defaultSpecOptions;
    } catch {
      return defaultSpecOptions;
    }
  });

  const saveSpecOption = (key, value) => {
    if (!value.trim()) return;
    setSpecOptions((prev) => {
      const updated = {
        ...prev,
        [key]: [...new Set([...(prev[key] || []), value])],
      };
      localStorage.setItem("specOptions", JSON.stringify(updated));
      return updated;
    });
  };

  // === Saved Labels (persistent) ===
  const [savedLabels, setSavedLabels] = useState(() => {
    try {
      const stored = localStorage.getItem("savedLabels");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const saveLabel = (label) => {
    if (!label.trim()) return;
    setSavedLabels((prev) => {
      const updated = [...new Set([...prev, label])];
      localStorage.setItem("savedLabels", JSON.stringify(updated));
      return updated;
    });
  };

  // === States ===
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState(defaultCategoriesList);
  const [form, setForm] = useState({
    category: "",
    names: [""],
    image: null,
    imageFile: null,
    dynamicFields: [],
  });

  // Use global user role instead of internal login
  const isAdmin = user === "admin";
  const isSupervisor = user === "supervisor";
  
  // Check if navigated from Employee Management
  const [contextMessage, setContextMessage] = useState("");
  useEffect(() => {
    const context = localStorage.getItem("addRemoveContext");
    if (context) {
      if (context === "issue") {
        setContextMessage("📦 Issue Products - Use this page to manage inventory for employee issuance");
      } else if (context === "return") {
        setContextMessage("🔄 Return Products - Use this page to manage inventory for employee returns");
      }
      // Clear context after showing
      localStorage.removeItem("addRemoveContext");
      
      // Clear message after 5 seconds
      setTimeout(() => setContextMessage(""), 5000);
    }
  }, []);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem("templates");
      const parsed = saved ? JSON.parse(saved) : [];
      // We use single active template as first element: an array of {label, value}
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        Array.isArray(parsed[0])
      ) {
        return parsed;
      }
      return [[]];
    } catch {
      return [[]];
    }
  });

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories
      .sort((a, b) => a.localeCompare(b))
      .map((c) => ({
        value: c,
        label: c,
      })),
  ];
  // Custom styles for react-select
  const customStyles = {
    control: (provided) => ({
      ...provided,
      width: "220px", // ✅ fixed width
      minHeight: "38px",
      fontSize: "14px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "220px", // ✅ dropdown same width
    }),
    option: (provided) => ({
      ...provided,
      fontSize: "14px",
      whiteSpace: "nowrap", // ✅ prevent line break
      overflow: "hidden", // ✅ hide overflow
      textOverflow: "ellipsis", // ✅ add "..."
      backgroundColor: "#fff",

      cursor: "pointer",
      zIndex: 999,
    }),
    singleValue: (provided) => ({
      ...provided,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "200px", // ✅ keep inside box
    }),
  };

  // === Enhanced Duplicate Label Check Helpers ===
  const normalizeLabel = (s) => (s || "").trim().toLowerCase();
  
  // Common spelling variations and similar words
  const labelVariations = {
    'quantity': ['qty', 'quanitity', 'quanity', 'quannity', 'quantiy', 'qantity', 'quantitiy'],
    'quality': ['qualiy', 'qualty', 'qualitiy', 'qulaity'],
    'material': ['materail', 'matrial', 'meterial', 'materal'],
    'category': ['catagory', 'categry', 'catgory', 'categorey'],
    'description': ['descriptn', 'descrption', 'discription', 'descripton'],
    'specification': ['spec', 'specificatn', 'specfication', 'specifiction'],
    'dimension': ['dimention', 'dimentions', 'dimesion'],
    'weight': ['wieght', 'weght', 'wight'],
    'height': ['hieght', 'heght', 'hight'],
    'width': ['widht', 'wdth', 'widt'],
    'length': ['lenght', 'lenth', 'legth'],
    'diameter': ['diamter', 'diametr', 'diametre'],
    'thickness': ['thikness', 'thicknes', 'thiknes'],
    'color': ['colour', 'colr', 'clor'],
    'size': ['sze', 'siz', 'sie'],
    'grade': ['grd', 'graed', 'grae'],
    'model': ['modl', 'modle', 'mdl'],
    'brand': ['brnd', 'bran', 'bradn'],
    'type': ['typ', 'tpe', 'tyep'],
    'code': ['cod', 'cde', 'coode'],
    'serial': ['srial', 'seril', 'serail'],
    'number': ['no', 'num', 'numbr', 'numer'],
    'date': ['dt', 'dte', 'dat'],
    'price': ['pric', 'prce', 'prise'],
    'cost': ['cst', 'coost', 'cot'],
    'value': ['val', 'valu', 'vlue']
  };

  // Function to get all variations of a label
  const getLabelVariations = (label) => {
    const normalized = normalizeLabel(label);
    const variations = new Set([normalized]);
    
    // Check if this label matches any known variations
    for (const [standard, variants] of Object.entries(labelVariations)) {
      if (normalized === standard || variants.includes(normalized)) {
        variations.add(standard);
        variants.forEach(v => variations.add(v));
      }
    }
    
    return variations;
  };

  // Enhanced duplicate detection
  const findDuplicateLabels = (list = []) => {
    const labelGroups = new Map(); // Maps normalized label to array of original labels
    const duplicates = new Set();
    
    list.forEach((f) => {
      const originalLabel = (f?.label || "").trim();
      if (!originalLabel) return;
      
      const variations = getLabelVariations(originalLabel);
      let foundGroup = null;
      
      // Check if any variation matches existing groups
      for (const variation of variations) {
        if (labelGroups.has(variation)) {
          foundGroup = variation;
          break;
        }
      }
      
      if (foundGroup) {
        // Add to existing group
        labelGroups.get(foundGroup).push(originalLabel);
        // Mark all labels in this group as duplicates
        labelGroups.get(foundGroup).forEach(label => {
          duplicates.add(normalizeLabel(label));
        });
      } else {
        // Create new group with first variation as key
        const firstVariation = Array.from(variations)[0];
        labelGroups.set(firstVariation, [originalLabel]);
      }
    });
    
    return duplicates;
  };

  // Function to check if a new label would be a duplicate
  const wouldBeDuplicate = (newLabel, existingLabels) => {
    if (!newLabel || !newLabel.trim()) return false;
    
    const newVariations = getLabelVariations(newLabel);
    
    return existingLabels.some(existingLabel => {
      if (!existingLabel || !existingLabel.trim()) return false;
      const existingVariations = getLabelVariations(existingLabel);
      
      // Check if any variation of new label matches any variation of existing label
      for (const newVar of newVariations) {
        for (const existingVar of existingVariations) {
          if (newVar === existingVar) return true;
        }
      }
      return false;
    });
  };
  const activeTemplate = Array.isArray(templates?.[0]) ? templates[0] : [];
  const duplicateTemplateLabels = findDuplicateLabels(activeTemplate);

  // Lock background scroll when any modal is open
  useEffect(() => {
    const anyOpen = showModal || showTemplateModal;
    if (anyOpen) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      const y = top ? -parseInt(top || "0", 10) : 0;
      document.body.style.top = "";
      window.scrollTo(0, y);
    }
  }, [showModal, showTemplateModal]);

  // const addTemplateLabel = () => setTemplateLabels([...templateLabels, ""]);
  // const removeTemplateLabel = (i) => setTemplateLabels(templateLabels.filter((_, idx) => idx !== i));
  // const handleTemplateLabelChange = (i, val) => {
  //   const updated = [...templateLabels];
  //   updated[i] = val;
  //   setTemplateLabels(updated);
  // };

  // Save item
  const saveItem = async () => {
    if (!form.category.trim()) {
      alert("Category required");
      return;
    }
    if (!form.image) {
      alert("Image required");
      return;
    }

    const safeDynamicFields = (
      Array.isArray(form.dynamicFields) ? form.dynamicFields : []
    ).filter((f) => (f.label || "").trim() && (f.value || "").trim());

    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      category: form.category,
      names: (Array.isArray(form.names) ? form.names : []).filter(
        (n) => (n || "").trim() !== ""
      ),
      image: form.image,
      dynamicFields: safeDynamicFields,
      date: new Date().toISOString(),
    };

    await saveItemToDB(newItem);
    const updatedItems = await getAllItems();
    // setItems(updatedItems);
    // Update local state immediately
    setItems((prev) => {
      // Remove old version if editing
      const filtered = prev.filter((i) => i.id !== newItem.id);
      // Add new/edited item at top
      return [newItem, ...filtered];
    });

    setCategories([...new Set(updatedItems.map((i) => i.category))]);

    // Update template to include all fields from all items (including the new one)
    try {
      updateTemplateWithAllFields(updatedItems);
    } catch (error) {
      console.error("Error updating template after save:", error);
    }

    setShowModal(false);
    setForm({
      category: "",
      names: [""],
      image: null,
      imageFile: null,
      dynamicFields: [],
    });
    setEditingItem(null);
  };

  // === Image Selection ===
  const handleImageSelect = () => {
    const choice = window.confirm(
      "Click OK to capture a photo, Cancel to upload from files."
    );
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (choice) input.capture = "environment";
    input.onchange = handleImageChange;
    input.click();
  };

  const handleImageChange = (e) => {
    const files = e && e.target && e.target.files ? e.target.files : null;
    const file = files && files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({
        ...prev,
        image: ev.target?.result || null,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItemFromDB(id);
      const updatedItems = await getAllItems();
      setItems(updatedItems);
      
      // Update template after deletion to reflect remaining fields
      updateTemplateWithAllFields(updatedItems);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item. Check console for details.");
    }
  };

  // Filters
  const filteredItems = items.filter((item) => {
    const category = (item.category || "").toLowerCase();
    const text = searchText.toLowerCase();

    const matchesText =
      searchText === "" ||
      category.includes(text) ||
      (item.names || []).some((n) => (n || "").toLowerCase().includes(text)) ||
      (item.dynamicFields || []).some((f) =>
        `${f.label || ""} ${f.value || ""}`.toLowerCase().includes(text)
      );

    const matchesCategory =
      filterCategory === "" || item.category === filterCategory;

    const itemDate = item.date ? new Date(item.date) : null;
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    const matchesDate =
      !itemDate ||
      ((!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate));

    return matchesText && matchesCategory && matchesDate;
  });

  // === Dynamic Field Handlers ===
  const addDynamicField = () => {
    let newField = { label: "", value: "" };
    const dynamicFields = Array.isArray(form.dynamicFields)
      ? form.dynamicFields
      : [];
    const unusedLabels = savedLabels.filter(
      (l) => !dynamicFields.some((f) => f.label === l)
    );
    if (unusedLabels.length > 0) {
      newField.label = unusedLabels[0];
    }

    setForm({ ...form, dynamicFields: [...dynamicFields, newField] });

    setTimeout(() => {
      const container = document.querySelector(".dynamic-specs-container");
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
  };

  const removeDynamicField = (i) =>
    setForm({
      ...form,
      dynamicFields: form.dynamicFields.filter((_, idx) => idx !== i),
    });

  const handleDynamicFieldChange = (i, key, value) => {
    const base = Array.isArray(form.dynamicFields) ? form.dynamicFields : [];
    
    // If changing label, check for duplicates
    if (key === "label" && value && value.trim()) {
      const existingLabels = base
        .map((f, idx) => idx !== i ? f.label : null) // Exclude current field
        .filter(Boolean);
      
      if (wouldBeDuplicate(value.trim(), existingLabels)) {
        // Find the conflicting label
        const conflictingLabel = existingLabels.find(existing => 
          wouldBeDuplicate(value.trim(), [existing])
        );
        
        alert(`⚠️ Duplicate field detected!\n\n"${value.trim()}" is similar to existing field "${conflictingLabel}".\n\nPlease use a different name or remove the existing field first.`);
        return; // Don't update the field
      }
    }
    
    const updated = base.map((f, idx) =>
      idx === i ? { ...f, [key]: toTitleCase(value) } : f
    );
    setForm({ ...form, dynamicFields: updated });

    // Keep the edited input in view while typing (helps on mobile)
    requestAnimationFrame(() => {
      const fieldEl = document.querySelectorAll(".spec-field")[i];
      if (fieldEl && typeof fieldEl.scrollIntoView === "function") {
        fieldEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });

    if (key === "label" && value) {
      saveLabel(toTitleCase(value));
    }

    if (key === "value" && updated[i] && updated[i].label) {
      saveSpecOption(
        (updated[i].label || "").toLowerCase(),
        toTitleCase(value)
      );
    }
  };

  // === Modal ===
  const openAddModal = () => {
    setEditingItem(null);
    const baseTemplate = Array.isArray(templates?.[0]) ? templates[0] : [];
    const templateFields = baseTemplate.map((f) => ({
      label: f?.label || "",
      value: "",
    }));
    setForm({
      category: "",
      names: [""],
      image: null,
      imageFile: null,
      dynamicFields: templateFields,
    });
    setShowModal(true);
  };
  // const openEditModal = (item) => {
  //   setEditingItem(item);
  //   setForm({
  //     category: item.category || "",
  //     names: Array.isArray(item.names) ? item.names : [""],
  //     image: item.image || null,
  //     imageFile: null,
  //     dynamicFields: Array.isArray(item.dynamicFields) ? item.dynamicFields : [],
  //   });
  //   setShowModal(true);
  // };
  const openEditModal = (item) => {
    setEditingItem(item);
    const baseTemplate = Array.isArray(templates?.[0]) ? templates[0] : [];
    const mergedFields = baseTemplate.map((tplField) => {
      const match = (item.dynamicFields || []).find(
        (f) => f.label === tplField.label
      );
      return {
        label: tplField.label,
        value: match ? match.value : "",
      };
    });
    const extraFields = (item.dynamicFields || []).filter(
      (f) => !baseTemplate.some((tplField) => tplField.label === f.label)
    );

    setForm({
      category: item.category || "",
      names: Array.isArray(item.names) ? item.names : [""],
      image: item.image || null,
      imageFile: null,
      dynamicFields: [...mergedFields, ...extraFields],
    });

    setShowModal(true);
  };

  // Filters helpers
  const resetFilters = () => {
    setSearchText("");
    setFilterCategory("");
    setDateRange({ start: "", end: "" });
  };

  // === Template Modal ===
  const openTemplateModal = () => {
    setShowTemplateModal(true);
  };

  const addTemplateField = () => {
    setTemplates((prev) => {
      const base = Array.isArray(prev[0]) ? prev[0] : [];
      const newTemplate = [...base, { label: "", value: "" }];
      return [newTemplate];
    });
  };
  const handleTemplateFieldChange = (i, field, value) => {
    setTemplates((prev) => {
      const base = Array.isArray(prev[0]) ? prev[0] : [];
      const newTemplate = base.map((f, idx) =>
        idx === i ? { ...f, [field]: toTitleCase(value) } : f
      );
      return [newTemplate];
    });
  };

  const removeTemplateField = (i) => {
    setTemplates((prev) => {
      const base = Array.isArray(prev[0]) ? prev[0] : [];
      const newTemplate = base.filter((_, idx) => idx !== i);
      return [newTemplate];
    });
  };

  // const removeTemplateField = (i) => {
  //   setTemplates((prev) => {
  //     const newTemplate = praev[0].filter((_, idx) => idx !== i);
  //     return [newTemplate];
  //   });
  // };

  const saveTemplate = () => {
    if (duplicateTemplateLabels.size > 0) {
      const dups = [...duplicateTemplateLabels];
      alert(`Duplicate labels are not allowed:\n- ${dups.join("\n- ")}`);
      return;
    }
    try {
      const toSave = Array.isArray(templates) ? templates : [[]];
      localStorage.setItem("templates", JSON.stringify(toSave));
      alert("Template saved");
      setShowTemplateModal(false);
    } catch (e) {
      console.error("Save template failed", e);
      alert("Failed to save template");
    }
  };
  const toTitleCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  // const saveItem = () => {
  //   if (!form.category) return alert("⚠️ Category is required!");
  //   if (!form.image) return alert("⚠️ Image is required!");
  //   const newItem = {
  //     id: editingItem ? editingItem.id : Date.now(),
  //     ...form,
  //     date: new Date().toISOString()
  //   };
  //   setItems((prev) =>
  //     editingItem ? prev.map((i) => (i.id === newItem.id ? newItem : i)) : [...prev, newItem]
  //   );
  //   setShowModal(false);
  // };
  return (
    <div className="addremove-container">
      <div className="header">
        <h2>📦 Manage Inventory - Add & Remove </h2>
        <div>
          {/* Global login controls, nothing local here */}
        </div>
      </div>
      
      {/* Context message from Employee Management */}
      {contextMessage && (
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '4px',
          padding: '12px',
          margin: '10px 0',
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          {contextMessage}
        </div>
      )}
      
      {/* Only admin can add items */}
      {isAdmin && (
        <>
          <button className="add-btn" onClick={openAddModal}>
            ➕ Add Item
          </button>
          <button className="add-btn" onClick={openTemplateModal}>
            ➕ Add saved template
          </button>
          <button 
            className="add-btn" 
            onClick={() => updateTemplateWithAllFields(items)}
            title="Refresh table columns to show all fields from all items"
          >
            🔄 Refresh Columns
          </button>
        </>
      )}
      
      {/* Show message for supervisor */}
      {isSupervisor && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '10px',
          margin: '10px 0',
          color: '#856404',
          textAlign: 'center'
        }}>
          📋 Supervisor View - You can view inventory but cannot add/edit/delete items
        </div>
      )}
      <div className="filters">
        {/* <div className="search-wrapper">
          <input
            type="text"
            placeholder="🔍 Search by text..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <span className="clear-btn" onClick={() => setSearchText("")}>
              ×
            </span>
          )}
        </div> */}

        <Select
          options={categoryOptions}
          value={categoryOptions.find((o) => o.value === filterCategory)}
          onChange={(selected) =>
            setFilterCategory(selected ? selected.value : "")
          }
          placeholder="🔍 Search categories..."
          isClearable
          isSearchable
          styles={{
            ...customStyles,
            menuPortal: (provided) => ({
              ...provided,
              zIndex: 9999,
            }),
          }}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          menuPlacement="auto"
        />

        {/* <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories
            .sort((a, b) => a.localeCompare(b))
            .map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
        </select> */}
        <label>
          Start Date:
          <input
            type="date"
            value={dateRange.start}
            // placeholder=""
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
          />
        </label>
        <button onClick={resetFilters}>Reset Filters</button>
      </div>

      {/* Items List */}
      {/* <div className="items-list">
        {filteredItems.length === 0 && <p>No items found.</p>}
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card compact">
            <div className="card-left">
              {item.image ? (
                <img src={item.image} alt={item.category} className="thumb" />
              ) : (
                <div className="no-thumb">📷</div>
              )}
            </div>
            <div className="card-right">
              <div className="card-header">
                <h4 className="category">{item.category}</h4>
              </div>
              <div className="actions">
                <button className="btn-edit" onClick={() => openEditModal(item)}>Edit</button>
                {isAdmin && (
                  <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                )}
              </div>
              {item.names?.length > 0 && (
                <div className="chips">
                  {item.names.map((n, i) => (
                    <span key={i} className="chip">
                      {n}
                    </span>
                  ))}
                </div>
              )}
              {item.dynamicFields?.length > 0 && (
                <div className="specs">
                  {item.dynamicFields.map((f, i) => (
                    <span key={i} className="spec-chip">
                      {f.label}: {f.value}
                    </span>
                  ))}
                </div>
              )}
              <div className="meta">
                <span>
                  📅{" "}
                  {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                </span>
                <span>
                  ⏰{" "}
                  {item.date
                    ? new Date(item.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingItem ? "Edit Item" : "➕ Add Item"}</h3>

            {/* Image Selection */}
            <div className="form-group">
              <label>Image (Required)*</label>
              {form.image && (
                <img src={form.image} alt="preview" className="preview" />
              )}
              <button type="button" onClick={handleImageSelect}>
                📸 Capture / 📂 Upload
              </button>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category (Required)*</label>
              <input
                list="category-options"
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Enter or select a category"
              />
              {/* <input
                list="category-options"
                type="text"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: toTitleCase(e.target.value) })
                }
                placeholder="Enter or select a category"
              /> */}

              <datalist id="category-options">
                {categories.map((c, i) => (
                  <option key={i} value={c} />
                ))}
              </datalist>
            </div>

            {/* Dynamic Specifications */}
            <div className="form-group">
              <label>
                Custom Specifications (Quantity, Size, Color, Width, Height,
                Material, Grade)
              </label>
              <div
                className="dynamic-specs-container"
                style={{
                  maxHeight: "320px", // taller for editing
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  padding: "8px",
                  borderRadius: "6px",
                  scrollBehavior: "smooth",
                }}
              >
                {form.dynamicFields.map((f, i) => {
                  // Check if this field is a duplicate
                  const otherLabels = form.dynamicFields
                    .map((field, idx) => idx !== i ? field.label : null)
                    .filter(Boolean);
                  const isDuplicate = f.label && wouldBeDuplicate(f.label, otherLabels);
                  
                  return (
                  <div key={i} className="spec-field">
                    <input
                      type="text"
                      placeholder="Enter the Label name"
                      list="label-options"
                      value={f.label}
                      onChange={(e) =>
                        handleDynamicFieldChange(i, "label", e.target.value)
                      }
                      className={isDuplicate ? "input-dup" : ""}
                    />
                    {isDuplicate && <span className="dup-hint">Duplicate!</span>}

                    {/* Smart editable dropdowns */}
                    {[
                      "quantity",
                      "size",
                      "color",
                      "width",
                      "height",
                      "material",
                      "grade",
                    ].includes(f.label.toLowerCase()) ? (
                      <input
                        type="text"
                        list={`${f.label.toLowerCase()}-options`}
                        placeholder={`Enter or choose ${f.label}`}
                        value={f.value}
                        onChange={(e) =>
                          handleDynamicFieldChange(i, "value", e.target.value)
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Value"
                        value={f.value}
                        onChange={(e) =>
                          handleDynamicFieldChange(i, "value", e.target.value)
                        }
                      />
                    )}

                    <button type="button" onClick={() => removeDynamicField(i)}>
                      🗑️
                    </button>
                  </div>
                  );
                })}
              </div>
              {/* <button type="button" onClick={addDynamicField}>➕ Add Specific</button> */}

              {/* Dynamic datalists */}
              <datalist id="color-options">
                {specOptions.color.map((o, i) => (
                  <option key={i} value={o} />
                ))}
              </datalist>
              <datalist id="size-options">
                {specOptions.size.map((o, i) => (
                  <option key={i} value={o} />
                ))}
              </datalist>
              <datalist id="material-options">
                {specOptions.material.map((o, i) => (
                  <option key={i} value={o} />
                ))}
              </datalist>
              <datalist id="grade-options">
                {specOptions.grade.map((o, i) => (
                  <option key={i} value={o} />
                ))}
              </datalist>
              <datalist id="quantity-options">
                {specOptions.quantity.map((o, i) => (
                  <option key={i} value={o} />
                ))}
              </datalist>
              <datalist id="width-options">
                {specOptions.width.map((o, i) => (
                  <option key={i} value={o} />
                ))}
              </datalist>
              <datalist id="height-options">
                {specOptions.height.map((o, i) => (
                  <option key={i} value={o} />
                ))}
              </datalist>
              <datalist id="label-options">
                {[
                  "Quantity",
                  "Size",
                  "Color",
                  "Width",
                  "Height",
                  "Material",
                  "Grade",
                  ...savedLabels,
                ].map((l, i) => (
                  <option key={i} value={l} />
                ))}
              </datalist>
            </div>

            <div className="modal-actions">
              <button
                className={editingItem ? "btn-update" : ""}
                onClick={() => {
                  // Check for duplicates before saving
                  const labels = form.dynamicFields.map(f => f.label).filter(Boolean);
                  const hasDuplicates = labels.some((label, index) => 
                    wouldBeDuplicate(label, labels.filter((_, i) => i !== index))
                  );
                  
                  if (hasDuplicates) {
                    alert("⚠️ Cannot save item with duplicate fields!\n\nPlease remove or rename duplicate fields before saving.");
                    return;
                  }
                  
                  saveItem();
                }}
                disabled={form.dynamicFields.some((f, i) => {
                  const otherLabels = form.dynamicFields
                    .map((field, idx) => idx !== i ? field.label : null)
                    .filter(Boolean);
                  return f.label && wouldBeDuplicate(f.label, otherLabels);
                })}
                style={{
                  opacity: form.dynamicFields.some((f, i) => {
                    const otherLabels = form.dynamicFields
                      .map((field, idx) => idx !== i ? field.label : null)
                      .filter(Boolean);
                    return f.label && wouldBeDuplicate(f.label, otherLabels);
                  }) ? 0.5 : 1
                }}
              >
                {editingItem ? "🔴 Update" : "✅ Save"}
              </button>
              <button onClick={() => setShowModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Template Modal */}
      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>📑 Template Builder</h3>
            <p>Define default custom specification labels</p>

            <DragDropContext
              onDragEnd={(result) => {
                if (!result.destination) return;
                setTemplates((prev) => {
                  const base = Array.isArray(prev[0]) ? [...prev[0]] : [];
                  const [moved] = base.splice(result.source.index, 1);
                  base.splice(result.destination.index, 0, moved);
                  return [base];
                });
              }}
            >
              <Droppable droppableId="templateFields" direction="vertical">
                {(provided) => (
                  <div
                    className="form-group"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {(templates[0] || []).map((f, i) => (
                      <Draggable
                        key={i}
                        draggableId={`field-${(
                          f?.label || ""
                        ).toString()}-${i}`}
                        index={i}
                      >
                        {(provided) => (
                          <div
                            className="spec-field"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <span
                              className="drag-handle"
                              {...provided.dragHandleProps}
                              style={{ cursor: "grab" }}
                            >
                              ≡
                            </span>
                            <input
                              type="text"
                              placeholder="Label"
                              value={f.label || ""}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue && newValue.trim()) {
                                  // Check for duplicates in template
                                  const existingLabels = (templates[0] || [])
                                    .map((field, idx) => idx !== i ? field.label : null)
                                    .filter(Boolean);
                                  
                                  if (wouldBeDuplicate(newValue.trim(), existingLabels)) {
                                    const conflictingLabel = existingLabels.find(existing => 
                                      wouldBeDuplicate(newValue.trim(), [existing])
                                    );
                                    alert(`⚠️ Duplicate template field detected!\n\n"${newValue.trim()}" is similar to existing field "${conflictingLabel}".\n\nPlease use a different name or remove the existing field first.`);
                                    return;
                                  }
                                }
                                
                                setTemplates((prev) => {
                                  const base = [...prev[0]];
                                  base[i] = {
                                    ...base[i],
                                    label: toTitleCase(newValue),
                                  };
                                  return [base];
                                });
                              }}
                              className={
                                duplicateTemplateLabels.has(
                                  normalizeLabel(f.label)
                                )
                                  ? "input-dup"
                                  : ""
                              }
                            />
                            {duplicateTemplateLabels.has(
                              normalizeLabel(f.label)
                            ) && <span className="dup-hint">Duplicate</span>}
                            <button
                              onClick={() =>
                                setTemplates((prev) => {
                                  const base = [...prev[0]];
                                  base.splice(i, 1);
                                  return [base];
                                })
                              }
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <button
              onClick={() =>
                setTemplates((prev) =>
                  [...prev].map((tpl) => [...tpl, { label: "", value: "" }])
                )
              }
            >
              ➕ Add Label
            </button>

            <div className="modal-actions">
              <button
                onClick={saveTemplate}
                disabled={duplicateTemplateLabels.size > 0}
              >
                ✅ Save Template
              </button>
              <button onClick={() => setShowTemplateModal(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Items Table */}
      <div className="items-table-container">
        <table className="items-table">
          {/* define per-column widths via colgroup for stable sticky offsets */}
          <colgroup>
            <col className="col-sn" />
            <col className="col-image" />
            <col className="col-category" />
            <col className="col-names" />
            {(templates[0] || []).map((_, i) => (
              <col className={`col-dyn col-dyn-${i}`} key={i} />
            ))}
            <col className="col-date" />
            <col className="col-time" />
            <col className="col-actions" />
          </colgroup>

          <thead>
            <tr>
              <th className="col-sn">S.No</th>
              <th className="col-image">Image</th>
              <th className="col-category">Category</th>
              {/* <th className="col-names">Names</th> */}
              {(templates[0] || []).map((f, i) => (
                <th key={i} className={`col-dyn col-dyn-${i}`}>
                  {f.label || `Field ${i + 1}`}
                </th>
              ))}
              <th className="col-date">Date</th>
              <th className="col-time">Time</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={(templates[0]?.length || 0) + 7}
                  style={{ textAlign: "center" }}
                >
                  No items found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="col-sn">{index + 1}</td>
                  <td className="col-image">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.category}
                        style={{
                          width: "100px",
                          height: "70px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      "📷"
                    )}
                  </td>
                  <td className="col-category">{item.category}</td>
                  {/* <td className="col-names">
              {item.names?.length > 0 ? item.names.join(", ") : "-"}
            </td> */}
                  {(templates[0] || []).map((tpl, i) => {
                    const value =
                      (item.dynamicFields || []).find(
                        (f) => f.label === tpl.label
                      )?.value || "-";
                    return (
                      <td key={i} className={`col-dyn col-dyn-${i}`}>
                        {value}
                      </td>
                    );
                  })}

                  <td className="col-date">
                    {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="col-time">
                    {item.date
                      ? new Date(item.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="col-actions">
                    {isAdmin && (
                      <button
                        className="btn-edit"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    )}
                    {!isAdmin && !isSupervisor && (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>
                        View Only
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
