// src/components/Login.js
import React, { useState } from "react";
import api from "../services/apiService";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send form data as URL-encoded data
      const response = await api.post(
        "/auth/token",
        `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem("token", access_token); // Save token for subsequent requests
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {token && <p>Logged in! Your token is stored in local storage.</p>}
    </div>
  );
}

export default Login;
