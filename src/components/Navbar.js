import React from "react";

export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "stock", label: "📦 Stock & Issue/Return" },
    { id: "transactions", label: "📑 Transactions" },
    { id: "employees", label: "👥 Employee PPE Details" }
  ];

  return (
    <nav className="navbar">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`nav-btn ${activeTab === t.id ? "active" : ""}`}
          onClick={() => setActiveTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
