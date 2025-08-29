// src/components/pages/EmployeeManagement.js
import React from "react";

export default function EmployeeManagement({ goBack }) {
  return (
    <div className="page-container">
      <h2>👥 Employee Management</h2>
      <p>Here you can manage employee details & PPE sizes.</p>
      <button className="back-btn" onClick={goBack}>⬅ Back</button>
    </div>
  );
}
