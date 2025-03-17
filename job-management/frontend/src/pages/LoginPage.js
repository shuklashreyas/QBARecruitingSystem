import React, { useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    // Replace the URL with your backend login endpoint
    const response = await fetch("http://127.0.0.1:8000/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ username, password }),
    });
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      // Redirect to job listings (you might use a navigation library or window.location)
      window.location.href = "/jobs";
    } else {
      console.error("Login failed", data);
    }
  };

  return (
    <div className="login-page">
      <h1>QBA Jobs</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        <a href="/register">Create account?</a> |{" "}
        <a href="/forgot-password">Forgot password?</a>
      </p>
    </div>
  );
}

export default LoginPage;
