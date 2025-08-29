import React, { useState } from "react";
import { changePassword } from "../utils/storage";

export default function ChangePassword({ role, onBack }) {
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleChange = () => {
    if (!newPass.trim()) {
      setMsg("⚠️ Password cannot be empty");
      return;
    }
    changePassword(role, newPass);
    setMsg("✅ Password updated successfully!");
  };

  return (
    <div className="card">
      <h2>🔑 Change Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
        className="search-input"
      />
      <button onClick={handleChange} className="nav-btn active">
        Update Password
      </button>
      <button onClick={onBack} className="nav-btn">
        Back
      </button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
