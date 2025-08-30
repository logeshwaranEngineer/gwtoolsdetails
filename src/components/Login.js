import React, { useState } from "react";
import { validateUser } from "../utils/storage";
import { Eye, EyeOff } from "lucide-react"; // ✅ password visibility icons

export default function Login({ setUser }) {
  const [role, setRole] = useState("Admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (validateUser(role, password)) {
      setUser(role);
    } else {
      setError("❌ Invalid password!");
    }
  };

  return (
    <>
      {/* Inline styles */}
      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1d3557, #457b9d);
          padding: 1rem;
        }
        .login-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          width: 100%;
          max-width: 350px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          text-align: center;
        }
        .login-title {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .login-sub {
          color: gray;
          margin-bottom: 1rem;
        }
        .login-input {
          width: 100%;
          padding: 0.7rem;
          margin: 0.5rem 0;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          font-size: 1rem;
        }
        .password-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }
        .password-wrapper input {
          flex: 1;
        }
        .eye-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #333;
        }
        .login-btn {
          width: 100%;
          padding: 0.8rem;
          margin-top: 1rem;
          background: #457b9d;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }
        .login-btn:hover {
          background: #1d3557;
        }
        .error-text {
          color: red;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">🏗️ GW-Stock Management</h2>
          <p className="login-sub">Secure login for different roles</p>

          {/* Role Selection */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="login-input"
          >
            <option value="boss">👔 Boss</option>
            <option value="admin">🛠 Admin</option>
            <option value="supervisor">👷 Supervisor</option>
          </select>

          {/* Password with eye toggle */}
          <div className="password-wrapper">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button onClick={handleLogin} className="login-btn">
            Login
          </button>
        </div>
      </div>
    </>
  );
}
