import React, { useState } from "react";
import "./../App.css";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to send reset email.");
    }
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
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="pink-button" type="submit">Send Reset Email</button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
