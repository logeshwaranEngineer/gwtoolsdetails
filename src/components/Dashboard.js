// src/components/Dashboard.js
import React, { useState } from "react";
import Issue from "../pages/Issue";
import StockCheck from "../pages/StockCheck";
import AddRemove from "../pages/AddRemove";
import EmployeeManagement from "../pages/EmployeeManagement";
import "../style/Dashboard.css";


export default function Dashboard({ user, setUser }) {
  const [page, setPage] = useState("home");

  const logout = () => {
    setUser(null);
  };

  if (page === "issue") return <Issue goBack={() => setPage("home")} />;
  if (page === "stock") return <StockCheck goBack={() => setPage("home")} />;
  if (page === "addremove") return <AddRemove goBack={() => setPage("home")} />;
  if (page === "employee") return <EmployeeManagement goBack={() => setPage("home")} />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>🏗️ GW-Stock Management</h2>
       <p>
  Welcome, <b>{user ? user.toUpperCase() : "Guest"}</b>
</p>

        <button onClick={logout} className="logout-btn">🚪 Logout</button>
      </div>

      <div className="dashboard-grid">
        <button className="dash-btn" onClick={() => setPage("issue")}>📦 Issue</button>
        <button className="dash-btn" onClick={() => setPage("stock")}>📊 Stock Check</button>
        <button className="dash-btn" onClick={() => setPage("addremove")}>➕➖ Add / Remove</button>
        <button className="dash-btn" onClick={() => setPage("employee")}>👥 Employee Management</button>
      </div>
    </div>
  );
}
