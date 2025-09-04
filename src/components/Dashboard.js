// src/components/Dashboard.js
import React, { useState } from "react";
import Issue from "../pages/Issue";
import StockCheck from "../pages/StockCheck";
import AddRemove from "../pages/AddRemove";
import EmployeeManagement from "../pages/EmployeeManagement";
import ChangePassword from "./ChangePassword";
import "../style/Dashboard.css";

export default function Dashboard({ user, setUser }) {
  const [page, setPage] = useState("home");

  const logout = () => {
    if (window.confirm("Do you want to logout?")) {
      setUser(null);
    }
  };

  // 🔙 Back button for top-left
  const BackButton = ({ onClick }) => (
    <button className="back-btn-fixed" onClick={onClick}>⬅ Back</button>
  );

  if (page === "issue")
    return (
      <>
        <BackButton onClick={() => setPage("home")} />
        <Issue goBack={() => setPage("home")} />
      </>
    );

  if (page === "stock")
    return (
      <>
        <BackButton onClick={() => setPage("home")} />
        <StockCheck goBack={() => setPage("home")} />
      </>
    );

  if (page === "addremove")
    return (
      <>
        <BackButton onClick={() => setPage("home")} />
        <AddRemove goBack={() => setPage("home")} user={user} />
      </>
    );

  if (page === "employee")
    return (
      <>
        <BackButton onClick={() => setPage("home")} />
        <EmployeeManagement 
          goBack={() => setPage("home")} 
          user={user}
          onNavigateToAddRemove={(context) => {
            // Store context for AddRemove if needed
            localStorage.setItem("addRemoveContext", context);
            setPage("addremove");
          }}
        />
      </>
    );

  if (page === "changePass")
    return (
      <>
        <BackButton onClick={() => setPage("home")} />
        <div className="dashboard-container" style={{ padding: 16 }}>
          <h3>Admin - Change Password</h3>
          {/* Reuse component */}
          <div style={{ maxWidth: 400 }}>
            <ChangePassword role="admin" onBack={() => setPage("home")} />
          </div>
        </div>
      </>
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <img src="/logo.png" alt="GWEE Logo" className="logo-image" />
        <h2>GWEE-Stock Management</h2>

        <p>Welcome, <b>{user ? user.toUpperCase() : "Guest"}</b></p>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user === "admin" && (
            <button className="logout-btn" onClick={() => setPage("changePass")}>🔑 Change Password</button>
          )}
          <button onClick={logout} className="logout-btn">🚪 Logout</button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* <button className="dash-btn" onClick={() => setPage("issue")}>📦 Issue</button>
        <button className="dash-btn" onClick={() => setPage("stock")}>📊 Stock Check</button> */}
        <button className="dash-btn" onClick={() => setPage("addremove")}>➕➖ Add / Remove</button>
        <button className="dash-btn" onClick={() => setPage("employee")}>👥 Employee Management</button>
      </div>
    </div>
  );
}
