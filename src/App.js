import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ====== ASSETS (update paths to your actual files) ======
import frcPantImg from "./assets/frc_pant1.svg";
import frcShirtImg from "./assets/frc_shirt1.svg";
import greyShirtImg from "./assets/grey_shirt.svg"; // sample reuse
import safetyShoeImg from "./assets/shoes.svg";
import safetyGlassImg from "./assets/glass.svg";
import earplugImg from "./assets/earplug1.svg";
import glovesImg from "./assets/glove_holder1.svg";
import helmetImg from "./assets/helmet1.svg";
import holderImg from "./assets/glove_holder1.svg";
import maskImg from "./assets/mask.svg";

// ====== CONSTANTS ======
const STORAGE_KEYS = {
  STOCK: "ppe_stock_v2",
  TX: "ppe_transactions_v2",
};

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

// ====== INITIAL STOCK (HIERARCHICAL: category -> item -> variants) ======
const initialStock = [
  {
    id: 1,
    category: "Shoes",
    name: "Safety Shoe",
    brand: "KINGS",
    variants: [
      { code: "8", label: "Size 8", balance: 7 },
      { code: "9", label: "Size 9", balance: 17 },
    ],
    img: safetyShoeImg,
  },
  {
    id: 2,
    category: "Gloves",
    name: "Hand Gloves",
    brand: "PROSAFE",
    variants: [{ code: "STD", label: "Standard", balance: 482 }],
    img: glovesImg,
  },
  {
    id: 3,
    category: "Eye Protection",
    name: "Safety Glass",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 168 }],
    img: safetyGlassImg,
  },
  {
    id: 4,
    category: "Hearing",
    name: "Ear Plug",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 200 }],
    img: earplugImg,
  },
  {
    id: 5,
    category: "Head Protection",
    name: "Safety Helmet (Yellow)",
    brand: "GENERIC",
    variants: [
      { code: "S", label: "Size S", balance: 6 },
      { code: "M", label: "Size M", balance: 20 },
      { code: "L", label: "Size L", balance: 10 },
    ],
    img: helmetImg,
  },
  {
    id: 6,
    category: "Respiratory",
    name: "Mask (N95)",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 47 }],
    img: maskImg,
  },
  {
    id: 7,
    category: "Clothing",
    name: "FRC Shirt",
    brand: "GENERIC",
    variants: [
      { code: "M", label: "M", balance: 10 },
      { code: "L", label: "L", balance: 9 },
      { code: "XL", label: "XL", balance: 6 },
    ],
    img: frcShirtImg,
  },
  {
    id: 8,
    category: "Clothing",
    name: "FRC Pant",
    brand: "GENERIC",
    variants: [
      { code: "30", label: "30", balance: 8 },
      { code: "32", label: "32", balance: 9 },
      { code: "34", label: "34", balance: 8 },
    ],
    img: frcPantImg,
  },
  {
    id: 9,
    category: "Clothing",
    name: "Grey Shirt",
    brand: "GENERIC",
    variants: [
      { code: "M", label: "M", balance: 14 },
      { code: "L", label: "L", balance: 13 },
      { code: "XL", label: "XL", balance: 13 },
    ],
    img: greyShirtImg,
  },
  {
    id: 10,
    category: "Accessories",
    name: "Glove Holder",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 60 }],
    img: holderImg,
  },
];

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
  { name: "DURAIBHARATHI LOGESHWARAN", shoeSize: "10", shirtSize: "2XL", pantSize: "34", helmetSize: "M", department: "PROCESS" },
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

const todayISO = () => new Date().toISOString().split("T")[0];

// ====== HELPERS ======
const findItemById = (arr, id) => arr.find((x) => x.id === id);

const getFlatRowsForExcel = (tx) =>
  tx.map((t, i) => ({
    "#": i + 1,
    Date: t.date,
    Time: new Date(t.time).toLocaleTimeString(),
    Type: t.type,
    Employee: t.employee,
    Category: t.category,
    Item: t.item,
    Variant: t.variant,
    Brand: t.brand,
    Quantity: t.quantity,
    Latitude: t.location?.lat ?? "",
    Longitude: t.location?.lng ?? "",
    "Proof Image Name": t.proofFileName || "",
  }));

// ====== PROOF CAPTURE (image + time + location) ======
async function captureProof() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // prefer back camera on mobile

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return reject(new Error("No image selected"));

      // Try geolocation (requires https or localhost)
      const onResolve = (position) => {
        resolve({
          file,
          timestamp: new Date().toISOString(),
          location: position
            ? { lat: position.coords.latitude, lng: position.coords.longitude }
            : null,
        });
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => onResolve(pos),
          () => onResolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        onResolve(null);
      }
    };

    input.click();
  });
}

// ====== MAIN APP ======
export default function App() {
  const [activeTab, setActiveTab] = useState("stock"); // stock | transactions
  const [stock, setStock] = useState(initialStock);
  const [transactions, setTransactions] = useState([]);

  // Selection state for hierarchical picker
  const [employee, setEmployee] = useState("");
  const [searchEmp, setSearchEmp] = useState("");
  const [txType, setTxType] = useState("OUT"); // OUT issue, IN return
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [searchEmployee, setSearchEmployee] = useState("");
  // UI state for approve/proof modal
  const [showApprove, setShowApprove] = useState(false);
  const [pendingProof, setPendingProof] = useState(null); // {file, timestamp, location}

  // Load/persist localStorage
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || "null");
      const t = JSON.parse(localStorage.getItem(STORAGE_KEYS.TX) || "null");
      if (Array.isArray(s)) setStock(s);
      if (Array.isArray(t)) setTransactions(t);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TX, JSON.stringify(transactions));
  }, [transactions]);

  // Filtered employees for search
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

  // Derived lists
  const categories = useMemo(
    () => [...new Set(stock.map((s) => s.category))],
    [stock]
  );
  const itemsInCategory = useMemo(
    () => stock.filter((s) => (selectedCategory ? s.category === selectedCategory : true)),
    [stock, selectedCategory]
  );
  const currentItem = useMemo(
    () => (selectedItemId ? findItemById(stock, selectedItemId) : null),
    [stock, selectedItemId]
  );

  // ====== Actions ======
  const resetForm = () => {
    setEmployee("");
    setSearchEmp("");
    setTxType("OUT");
    setSelectedCategory("");
    setSelectedItemId(null);
    setSelectedVariant("");
    setQuantity(1);
    setPendingProof(null);
    setShowApprove(false);
  };

  const openApprove = () => {
    if (!employee || !allowedEmployees.includes(employee)) {
      alert("Select an authorized employee.");
      return;
    }
    if (!selectedItemId || !selectedVariant) {
      alert("Select item and size/variant.");
      return;
    }
    if (quantity <= 0) {
      alert("Quantity must be at least 1.");
      return;
    }

    // Validate stock for OUT
    const item = findItemById(stock, selectedItemId);
    const variant = item?.variants.find((v) => v.code === selectedVariant);
    if (!item || !variant) {
      alert("Invalid item/variant selection.");
      return;
    }

    if (txType === "OUT" && variant.balance < quantity) {
      alert("Not enough stock available.");
      return;
    }

    setShowApprove(true);
  };

  const captureProofNow = async () => {
    try {
      const proof = await captureProof();
      setPendingProof(proof);
    } catch (e) {
      alert("Proof not captured.");
    }
  };

  const submitTransaction = () => {
    if (!pendingProof) {
      alert("Please capture proof (image + time/location).");
      return;
    }

    const item = findItemById(stock, selectedItemId);
    const variantIdx = item.variants.findIndex((v) => v.code === selectedVariant);

    // Update stock
    const updatedStock = stock.map((s) => {
      if (s.id !== item.id) return s;
      const newVariants = [...s.variants];
      const delta = txType === "IN" ? quantity : -quantity;
      newVariants[variantIdx] = {
        ...newVariants[variantIdx],
        balance: Math.max(0, newVariants[variantIdx].balance + delta),
      };
      return { ...s, variants: newVariants };
    });

    // Build transaction row
    const proofURL = URL.createObjectURL(pendingProof.file);
    const tx = {
      time: pendingProof.timestamp,
      date: todayISO(),
      type: txType,
      employee,
      category: item.category,
      item: item.name,
      brand: item.brand,
      variant: item.variants[variantIdx].code,
      quantity,
      location: pendingProof.location,
      proofObjectURL: proofURL, // local preview
      proofFileName: `${item.name}_${item.variants[variantIdx].code}_${Date.now()}.jpg`,
      itemImg: item.img,
    };

    setStock(updatedStock);
    setTransactions((prev) => [...prev, tx]);

    // Close modal & reset proof (keep form so they can do more)
    setShowApprove(false);
    setPendingProof(null);
  };

  // ====== EXPORTS / DRIVE UPLOAD ======
  const exportTodayToExcel = () => {
    const today = todayISO();
    const todayTx = transactions.filter((t) => t.date === today);
    if (todayTx.length === 0) {
      alert("No transactions for today.");
      return;
    }

    const rows = getFlatRowsForExcel(todayTx);
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 4 }, { wch: 12 }, { wch: 10 }, { wch: 26 }, { wch: 16 }, { wch: 26 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 11 }, { wch: 22 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const fileName = `Transactions_${today}.xlsx`;
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
  };

  // Optional: Drive uploader (Apps Script)
  const GAS_ENDPOINT = ""; // paste your deployed Apps Script Web App URL

  const uploadTodayToDrive = async () => {
    if (!GAS_ENDPOINT) {
      alert(`⚙️ Setup required.\n1) Create a Google Apps Script Web App that accepts multipart/form-data with fields:\n   - file: Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)\n   - images[]: one or more proof images\n2) Save files to a Drive folder.\n3) Deploy as Web App (Anyone with the link) and paste URL into GAS_ENDPOINT.`);
      return;
    }

    const today = todayISO();
    const todayTx = transactions.filter((t) => t.date === today);
    if (todayTx.length === 0) {
      alert("No transactions for today.");
      return;
    }

    // Build Excel in-memory
    const rows = getFlatRowsForExcel(todayTx);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const excelBlob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const form = new FormData();
    form.append("file", excelBlob, `Transactions_${today}.xlsx`);

    // Attach all proof images from today
    for (const t of todayTx) {
      const res = await fetch(t.proofObjectURL);
      const blob = await res.blob();
      form.append("images[]", blob, t.proofFileName || `proof_${Date.now()}.jpg`);
    }

    try {
      const resp = await fetch(GAS_ENDPOINT, { method: "POST", body: form });
      if (!resp.ok) throw new Error("Upload failed: " + resp.status);
      const data = await resp.json().catch(() => ({}));
      alert("✅ Uploaded to Google Drive" + (data?.folderUrl ? `\nFolder: ${data.folderUrl}` : ""));
    } catch (e) {
      console.error(e);
      alert("❌ Upload error. Check console & Apps Script.");
    }
  };

  // ====== RENDER ======
  return (
    <div style={styles.appBg}>
      <div style={styles.container}>
        <h1 style={styles.title}>🦺 PPE Stock Management</h1>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tabBtn, ...(activeTab === "stock" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("stock")}
          >📦 Stock & Issue/Return</button>
          <button
            style={{ ...styles.tabBtn, ...(activeTab === "transactions" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("transactions")}
          >📝 Transactions</button>
             <button
            style={{ ...styles.tabBtn, ...(activeTab === "employee-details" ? styles.tabActive : {}) }}
            onClick={() => setActiveTab("employee-details")}
          >👥 Employee Details
          </button>
        </div>

        {activeTab === "stock" && (
          <>
            {/* Issue/Return Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.sectionTitle}>Issue / Return</div>
                <div>Date: <strong>{todayISO()}</strong></div>
              </div>

              {/* Employee + Type */}
              <div style={styles.formGrid}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={styles.label}>Employee (authorized)</label>
                  <input
                    style={styles.input}
                    placeholder="Search employee..."
                    value={searchEmp}
                    onChange={(e) => setSearchEmp(e.target.value)}
                  />
                  <select
                    style={{ ...styles.select, marginTop: 8 }}
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                  >
                    <option value="">
                      {filteredEmployees.length === 0
                        ? "No employees found"
                        : `Select from ${filteredEmployees.length} employee${filteredEmployees.length !== 1 ? "s" : ""}`}
                    </option>
                    {filteredEmployees.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setTxType("OUT")}
                      style={{ ...styles.pill, ...(txType === "OUT" ? styles.pillActive : {}) }}
                    >OUT (Issue)</button>
                    <button
                      onClick={() => setTxType("IN")}
                      style={{ ...styles.pill, ...(txType === "IN" ? styles.pillActive : {}) }}
                    >IN (Add)</button>
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Quantity</label>
                  <input
                    type="number"
                    min={1}
                    style={styles.input}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
              </div>

              {/* Hierarchical Picker */}
              <div style={{ marginTop: 16 }}>
                <label style={styles.label}>Select Category</label>
                <div style={styles.chips}>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCategory(c === selectedCategory ? "" : c);
                        setSelectedItemId(null);
                        setSelectedVariant("");
                      }}
                      style={{ ...styles.chip, ...(selectedCategory === c ? styles.chipActive : {}) }}
                    >{c}</button>
                  ))}
                </div>

                {/* Items in selected category */}
                {selectedCategory && (
                  <>
                    <div style={{ ...styles.subTitle, marginTop: 12 }}>Items in {selectedCategory}</div>
                    <div style={styles.itemsGrid}>
                      {itemsInCategory.map((it) => (
                        <div
                          key={it.id}
                          style={{ ...styles.itemCard, ...(selectedItemId === it.id ? styles.itemCardActive : {}) }}
                          onClick={() => {
                            setSelectedItemId(it.id);
                            setSelectedVariant("");
                          }}
                        >
                          <div style={styles.itemImageWrap}><img src={it.img} alt={it.name} style={styles.itemImage} /></div>
                          <div style={styles.itemName}>{it.name}</div>
                          <div style={styles.itemBrand}>{it.brand}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Variant (size) picker */}
                {currentItem && (
                  <>
                    <div style={{ ...styles.subTitle, marginTop: 16 }}>Select Size / Variant</div>
                    <div style={styles.chips}>
                      {currentItem.variants.map((v) => (
                        <button
                          key={v.code}
                          onClick={() => setSelectedVariant(v.code)}
                          title={`In stock: ${v.balance}`}
                          style={{ ...styles.chip, ...(selectedVariant === v.code ? styles.chipActive : {}) }}
                        >{v.label} • {v.balance}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button style={styles.primaryBtn} onClick={openApprove}>Approve</button>
                <button style={styles.secondaryBtn} onClick={resetForm}>Reset</button>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button style={styles.successBtn} onClick={exportTodayToExcel}>Export Today (Excel)</button>
                  <button style={styles.infoBtn} onClick={uploadTodayToDrive}>Upload to Drive</button>
                </div>
              </div>
            </div>

            {/* Stock Table */}
            <div style={styles.card}>
              <div style={styles.sectionTitle}>Current Stock</div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Category</th>
                      <th>Item</th>
                      <th>Brand</th>
                      <th>Variant</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.flatMap((s) =>
                      s.variants.map((v) => (
                        <tr key={`${s.id}-${v.code}`}>
                          <td><img src={s.img} alt={s.name} style={{ width: 36, height: 36 }} /></td>
                          <td>{s.category}</td>
                          <td>{s.name}</td>
                          <td>{s.brand}</td>
                          <td>{v.label}</td>
                          <td style={{ fontWeight: 700 }}>{v.balance}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "transactions" && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Issued / Returned History</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Employee</th>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Variant</th>
                    <th>Qty</th>
                    <th>Location</th>
                    <th>Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 24, color: "#6b7280" }}>No transactions yet</td></tr>
                  ) : (
                    transactions.map((t, i) => (
                      <tr key={i}>
                        <td>{new Date(t.time).toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: t.type === "OUT" ? "#b91c1c" : "#065f46" }}>{t.type}</td>
                        <td>{t.employee}</td>
                        <td>{t.category}</td>
                        <td>{t.item}</td>
                        <td>{t.variant}</td>
                        <td style={{ fontWeight: 700 }}>{t.quantity}</td>
                        <td>
                          {t.location ? (
                            <span>{t.location.lat.toFixed(5)}, {t.location.lng.toFixed(5)}</span>
                          ) : (
                            <span style={{ color: "#6b7280" }}>N/A</span>
                          )}
                        </td>
                        <td>
                          {t.proofObjectURL ? (
                            <a href={t.proofObjectURL} target="_blank" rel="noreferrer">View</a>
                          ) : (
                            <span style={{ color: "#6b7280" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
       {/* Employee Details Tab */}
{activeTab === "employee-details" && (
  <div style={styles.card}>
    <h2 style={styles.sectionTitle}>👥 Employee PPE Size Details</h2>

    {/* Employee Search */}
    <div style={{ marginBottom: 24 }}>
      <label style={styles.label}>🔍 Search Employee or Department</label>
      <input
        type="text"
        placeholder="Type employee name or department..."
        value={searchEmployee}
        onChange={(e) => setSearchEmployee(e.target.value)}
        style={{ ...styles.input, maxWidth: 400 }}
      />
      {searchEmployee && (
        <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6, maxWidth: 400 }}>
          Found {filteredEmployeeDetails.length} employee
          {filteredEmployeeDetails.length !== 1 ? "s" : ""} matching "
          {searchEmployee}"
        </div>
      )}
    </div>

    {/* Employee Details Table */}
    <div style={styles.tableWrap}>
      <table style={styles.table}>
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
              <td colSpan="6" style={{ textAlign: "center", color: "#6b7280", fontStyle: "italic", padding: "2rem" }}>
                👤 No employees found matching your search
              </td>
            </tr>
          ) : (
            filteredEmployeeDetails.map((emp, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{emp.name}</td>
                <td>
                  <span
                    style={{
                      ...styles.pill,
                      background: "#f3f4f6",
                      borderColor: "#e5e7eb",
                      fontSize: 12,
                    }}
                  >
                    {emp.department}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>{emp.shoeSize}</td>
                <td style={{ textAlign: "center" }}>{emp.shirtSize}</td>
                <td style={{ textAlign: "center" }}>{emp.pantSize}</td>
                <td style={{ textAlign: "center" }}>{emp.helmetSize}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Employee Statistics */}
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
        <div style={styles.itemCard}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{employeeDetails.length}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Total Employees</div>
        </div>
        <div style={styles.itemCard}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {[...new Set(employeeDetails.map((e) => e.department))].length}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Departments</div>
        </div>
        <div style={styles.itemCard}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {employeeDetails.filter((e) => e.shoeSize === "8").length}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Size 8 Shoes</div>
        </div>
        <div style={styles.itemCard}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {employeeDetails.filter((e) => e.shoeSize === "9").length}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Size 9 Shoes</div>
        </div>
      </div>
    </div>
  </div>
)}

      </div>

      {/* Approve / Proof Modal */}
      {showApprove && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={styles.subTitle}>Approval & Proof</div>
              <button onClick={() => setShowApprove(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={{ marginTop: 12, color: "#374151" }}>
              <div><strong>Employee:</strong> {employee}</div>
              <div><strong>Type:</strong> {txType}</div>
              <div><strong>Item:</strong> {currentItem?.name} ({selectedVariant}) × {quantity}</div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={captureProofNow} style={styles.primaryBtn}>📸 Capture / Upload Proof</button>
              {pendingProof && (
                <div style={{ marginTop: 12, fontSize: 14, color: "#065f46" }}>
                  ✅ Proof ready — {new Date(pendingProof.timestamp).toLocaleString()} {pendingProof.location ? `• ${pendingProof.location.lat.toFixed(5)}, ${pendingProof.location.lng.toFixed(5)}` : "• Location N/A"}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={styles.successBtn} onClick={submitTransaction}>Submit</button>
              <button style={styles.secondaryBtn} onClick={() => setShowApprove(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
        <div className="app-footer">
          Professional PPE Management System - Use the search functionality to quickly locate authorized personnel for equipment issuance.
        </div>
    </div>
    
  );
}

  // ====== STYLES (Spreadsheet-like tables + clean UI) ======
  const styles = {
    appBg: {
      minHeight: "100vh",
      background: "linear-gradient(135deg,#2563eb,#7c3aed,#ec4899)",
      padding: 24,
    },
    container: {
      maxWidth: 1100,
      margin: "0 auto",
      color: "#111827",
    },
    title: {
      color: "#fff",
      textAlign: "center",
      fontSize: 34,
      fontWeight: 800,
      textShadow: "0 2px 10px rgba(0,0,0,.25)",
      marginBottom: 16,
    },
    tabs: { display: "flex", gap: 8, marginBottom: 16 },
    tabBtn: {
      background: "rgba(255,255,255,.85)",
      border: "1px solid rgba(255,255,255,.6)",
      borderRadius: 12,
      padding: "10px 14px",
      fontWeight: 600,
      cursor: "pointer",
    },
    tabActive: { boxShadow: "0 0 0 2px #111827 inset", background: "#fff" },
    card: {
      background: "rgba(255,255,255,.95)",
      border: "1px solid rgba(255,255,255,.6)",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      boxShadow: "0 10px 30px rgba(0,0,0,.08)",
    },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    sectionTitle: { fontSize: 18, fontWeight: 800, background: "linear-gradient(90deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", color: "transparent" },
    subTitle: { fontSize: 16, fontWeight: 700 },
    formGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 },
    label: { display: "block", fontSize: 13, color: "#4b5563", marginBottom: 6 },
    input: { width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px", fontSize: 14 },
    select: { width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px", fontSize: 14 },
    pill: { border: "1px solid #d1d5db", borderRadius: 999, padding: "8px 12px", background: "#fff", cursor: "pointer", fontWeight: 700 },
    pillActive: { background: "#111827", color: "#fff", borderColor: "#111827" },
    chips: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 },
    chip: { border: "1px solid #e5e7eb", borderRadius: 999, background: "#fff", padding: "8px 12px", cursor: "pointer" },
    chipActive: { background: "#111827", color: "#fff", borderColor: "#111827" },
    itemsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginTop: 8 },
    itemCard: { border: "1px solid #e5e7eb", borderRadius: 14, padding: 10, background: "#fff", cursor: "pointer" },
    itemCardActive: { outline: "2px solid #111827" },
    itemImageWrap: { width: "100%", height: 80, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid #e5e7eb" },
    itemImage: { width: 64, height: 64, objectFit: "contain" },
    itemName: { fontWeight: 700, marginTop: 8 },
    itemBrand: { color: "#6b7280", fontSize: 12 },
    primaryBtn: { background: "linear-gradient(90deg,#2563eb,#7c3aed)", color: "#fff", border: 0, padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 700 },
    secondaryBtn: { background: "#fff", border: "1px solid #d1d5db", padding: "10px 14px", borderRadius: 12, cursor: "pointer" },
    successBtn: { background: "#16a34a", color: "#fff", border: 0, padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 700 },
    infoBtn: { background: "#0369a1", color: "#fff", border: 0, padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontWeight: 700 },
    tableWrap: { overflowX: "auto", marginTop: 8 },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 14,
    },
    modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
    modal: { background: "#fff", borderRadius: 16, padding: 16, width: 520, maxWidth: "95vw" },
    closeBtn: { border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" },



};

// Add basic spreadsheet-like borders & striping to table via inline <style>
const sheetCSS = `
  table thead th { background: linear-gradient(90deg,#2563eb,#7c3aed); color: #fff; font-weight: 700; border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
  table tbody td { border: 1px solid #e5e7eb; padding: 10px; }
  table tbody tr:nth-child(odd) { background: #f9fafb; }
  table tbody tr:nth-child(even) { background: #ffffff; }
  table tbody tr:hover { background: #e0f2fe; }
`;

// Inject the CSS string once
const styleEl = document.createElement('style');
styleEl.innerHTML = sheetCSS;
document.head.appendChild(styleEl);

/*
======================== App.css (optional, if you prefer a file) ========================
body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; }
.table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table thead th { background: linear-gradient(90deg,#2563eb,#7c3aed); color: #fff; font-weight: 700; border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
.table tbody td { border: 1px solid #e5e7eb; padding: 10px; }
.table tbody tr:nth-child(odd) { background: #f9fafb; }
.table tbody tr:nth-child(even) { background: #ffffff; }
.table tbody tr:hover { background: #e0f2fe; }
input, select { border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 10px; font-size: 14px; width: 100%; }
input:focus, select:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,.3); }
==========================================================================================
*/
