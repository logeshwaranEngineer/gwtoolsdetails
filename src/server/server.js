const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // allow base64 images

// ✅ Connect to SQLite DB (creates file if not exists)
const db = new sqlite3.Database("./categories.db", (err) => {
  if (err) console.error("❌ DB connection error:", err.message);
  else console.log("✅ Connected to SQLite database");
});

// ✅ Create tables if not exists
// Categories
db.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    quantity INTEGER,
    spec TEXT
  )
`);

// Employee Records
db.run(`
  CREATE TABLE IF NOT EXISTS employee_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    employee TEXT,
    site TEXT,
    superior TEXT,
    item TEXT,
    quantity INTEGER,
    proof TEXT,
    date TEXT,
    itemId TEXT,
    originalItem TEXT,
    returnHistory TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )
`);

// Employees (names list)
db.run(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )
`);

// ========= Categories Endpoints =========
// ✅ Get all categories
app.get("/categories", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// ✅ Add new category
app.post("/categories", (req, res) => {
  const { category, name, quantity, spec } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }
  db.run(
    "INSERT INTO categories (category, name, quantity, spec) VALUES (?, ?, ?, ?)",
    [category, name, quantity, spec],
    function (err) {
      if (err) res.status(500).json({ error: err.message });
      else res.json({ id: this.lastID, category, name, quantity, spec });
    }
  );
});

// ✅ Delete category
app.delete("/categories/:id", (req, res) => {
  db.run("DELETE FROM categories WHERE id = ?", [req.params.id], function (err) {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deleted: this.changes });
  });
});

// ========= Employee Records Endpoints =========
// ✅ Get all employee records
app.get('/employee-records', (req, res) => {
  db.all("SELECT * FROM employee_records ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse JSON fields
    const parsed = rows.map(r => ({
      ...r,
      quantity: Number(r.quantity) || 0,
      originalItem: safeParse(r.originalItem, null),
      returnHistory: safeParse(r.returnHistory, []),
    }));
    res.json(parsed);
  });
});

// ✅ Get records by employee
app.get('/employee-records/employee/:name', (req, res) => {
  db.all("SELECT * FROM employee_records WHERE employee = ? ORDER BY id ASC", [req.params.name], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map(r => ({
      ...r,
      quantity: Number(r.quantity) || 0,
      originalItem: safeParse(r.originalItem, null),
      returnHistory: safeParse(r.returnHistory, []),
    }));
    res.json(parsed);
  });
});

// ✅ Create a new employee record
app.post('/employee-records', (req, res) => {
  const rec = req.body || {};
  const now = new Date().toISOString();
  const sql = `INSERT INTO employee_records
    (type, employee, site, superior, item, quantity, proof, date, itemId, originalItem, returnHistory, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    rec.type || null,
    rec.employee || null,
    rec.site || null,
    rec.superior || null,
    rec.item || null,
    Number(rec.quantity) || 0,
    rec.proof || null,
    rec.date || null,
    rec.itemId != null ? String(rec.itemId) : null,
    JSON.stringify(rec.originalItem || null),
    JSON.stringify(rec.returnHistory || []),
    now,
    now
  ];
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, ...rec, createdAt: now, updatedAt: now });
  });
});

// ✅ Clear all employee records (optional admin)
app.delete('/employee-records', (req, res) => {
  db.run("DELETE FROM employee_records", [], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// ========= Employees Endpoints =========
// ✅ Get all employees (names)
app.get('/employees', (req, res) => {
  db.all("SELECT * FROM employees ORDER BY name ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Add new employee
app.post('/employees', (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  db.run(
    "INSERT INTO employees (name) VALUES (?)",
    [name.trim()],
    function (err) {
      if (err) {
        if (String(err.message || '').includes('UNIQUE')) {
          return res.status(409).json({ error: 'Employee already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, name: name.trim() });
    }
  );
});

// ✅ Delete employee by id
app.delete('/employees/:id', (req, res) => {
  db.run("DELETE FROM employees WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// ✅ Delete employee by name
app.delete('/employees/by-name/:name', (req, res) => {
  db.run("DELETE FROM employees WHERE name = ?", [req.params.name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

function safeParse(str, fallback) {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}

// ✅ Start server
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
