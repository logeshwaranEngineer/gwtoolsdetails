import React, { useState } from "react";

export default function Transactions() {
  const [transactions] = useState([
    { id: 1, emp: "Raj", item: "Safety Shoe", variant: "8", qty: 1, type: "Issue" }
  ]);

  return (
    <div className="card">
      <h2>📑 Transactions</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Item</th>
            <th>Variant</th>
            <th>Qty</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.emp}</td>
              <td>{t.item}</td>
              <td>{t.variant}</td>
              <td>{t.qty}</td>
              <td>{t.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
