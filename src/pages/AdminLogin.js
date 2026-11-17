// src/pages/AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ account, isAdmin }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    } else {
      setError("Your wallet is not authorized as admin.");
    }
  };

  return (
    <div className="admin-login card">
      <h2>Admin Login</h2>
      <p>Wallet: {account}</p>
      <div className="form-control">
        <label>Enter Admin Passcode:</label>
        <input
          type="password"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
          placeholder="Enter passcode..."
        />
      </div>
      <button className="btn" onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AdminLogin;
