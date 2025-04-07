import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../App.css";

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") || "");
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:8000/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, new_password: newPassword }),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="container">
      <Link to="/login" style={{ position: "absolute", top: "20px", left: "20px" }}>
  <img
    src="QBA.png"
    alt="QBA Logo"
    style={{ height: "60px", cursor: "pointer" }}
  />
</Link>
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <input type="email" value={email} readOnly />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
