// src/pages/SubordinateLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SubordinateLogin = ({ account, userRole }) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (userRole >= 2) {
      navigate("/subordinate/dashboard");
    } else if (userRole === 1) {
      setError("As an admin, please use the Admin login page.");
    } else {
      setError("Your wallet is not authorized in the system.");
    }
  };

  // Get role name based on role ID
  const getRoleName = (role) => {
    switch (role) {
      case 2: return "Operational";
      case 3: return "Tactical";
      default: return "Unknown";
    }
  };

  return (
    <div className="subordinate-login card">
      <h2>Field Operations Login</h2>
      <p>Wallet: {account}</p>
      <p>Role: {getRoleName(userRole)}</p>
      <div className="form-control">
        <label>Enter Field Operations Passcode:</label>
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

export default SubordinateLogin;