import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css";
import { Link } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    role: "applicant", // default role
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to register");
      }

      alert("Account created! Please login.");
      navigate("/");
    } catch (err) {
      console.error("Error:", err);
      alert(err.message);
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
      <h1>Create an Account</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="applicant">Applicant</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <button className="pink-button" type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
