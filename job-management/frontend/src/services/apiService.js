// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
