import React, { useState } from "react";

const dummyEmployees = [
  { name: "Raj", dept: "Production", ppe: { shirt: "L", pant: "32", shoe: "8" } },
  { name: "Anita", dept: "Maintenance", ppe: { shirt: "M", pant: "30", shoe: "6" } }
];

export default function EmployeeDetails() {
  const [search, setSearch] = useState("");

  const filtered = dummyEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card">
      <h2>👥 Employee PPE Size Details</h2>
      <input
        type="text"
        placeholder="Search employee or department"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Shirt</th>
            <th>Pant</th>
            <th>Shoe</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((emp) => (
            <tr key={emp.name}>
              <td>{emp.name}</td>
              <td>{emp.dept}</td>
              <td>{emp.ppe.shirt}</td>
              <td>{emp.ppe.pant}</td>
              <td>{emp.ppe.shoe}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
