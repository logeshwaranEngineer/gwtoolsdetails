const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to SQLite DB (creates file if not exists)
const db = new sqlite3.Database("./categories.db", (err) => {
  if (err) console.error("❌ DB connection error:", err.message);
  else console.log("✅ Connected to SQLite database");
});

// ✅ Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    quantity INTEGER,
    spec TEXT
  )
`);

// ✅ Get all categories
app.get("/categories", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

// ✅ Add new category
// app.post("/categories", (req, res) => {
//   const { category, name, quantity, spec } = req.body;
//   db.run(
//     "INSERT INTO categories (category, name, quantity, spec) VALUES (?, ?, ?, ?)",
//     [category, name, quantity, spec],
//     function (err) {
//       if (err) res.status(500).json({ error: err.message });
//       else res.json({ id: this.lastID, categodry, name, quantity, spec });
//     }
//   );
// });
app.post("/categories", (req, res) => {
  const { category, name, quantity, spec } = req.body;
  // Prevent saving if name is empty
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

// ✅ Start server
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
