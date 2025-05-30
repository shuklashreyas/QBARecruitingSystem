import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../App.css";
import { Link } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  // Local state for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
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

      // Store token in localStorage for later API calls
      localStorage.setItem("token", data.access_token);
      console.log("Token stored:", localStorage.getItem("token"));

      localStorage.setItem("userRole", data.role);
      console.log("User role stored:", localStorage.getItem("userRole"));

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username || username,
          role: data.role,
          // add any other user info you need
        })
      );

      // Navigate to jobs page after successful login
      navigate("/jobs");
    } catch (error) {
      console.error("Error during login:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-page">
      <Link to="https://qbadvisory.us/" style={{ position: "absolute", top: "20px", left: "20px" }}>
  <img
    src="QBA.png"
    alt="QBA Logo"
    style={{ height: "60px", cursor: "pointer" }}
  />
</Link>
      <h1>QBA Career Center</h1>
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
