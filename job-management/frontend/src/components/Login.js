import React, { useContext, useState } from "react";
import api from "../apiService";
import { GlobalContext } from "../context/GlobalState";

const Login = () => {
  const { setAuth } = useContext(GlobalContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/token", new URLSearchParams({ username, password }));
      setAuth({ user: username, token: response.data.access_token });
      localStorage.setItem("access_token", response.data.access_token);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
