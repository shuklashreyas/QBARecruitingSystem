// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css"; // Make sure to import your CSS

function LoginPage() {
  const navigate = useNavigate();

  // Local state for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    // Example login flow (replace with your actual logic)
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log("Token received:", data.access_token);
      // Ideally, store token in localStorage or a global state
      // localStorage.setItem("token", data.access_token);

      // Navigate to jobs page after login
      navigate("/jobs");
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container">
      <h1>QBA Jobs</h1>
      <h2 className="mb-1">Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <div className="text-center" style={{ marginTop: "1rem" }}>
        <a href="/register">Create account?</a> |{" "}
        <a href="/forgot-password">Forgot password?</a>
      </div>
    </div>
  );
}

export default LoginPage;
