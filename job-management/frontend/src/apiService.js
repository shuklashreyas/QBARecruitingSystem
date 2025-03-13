// frontend/src/apiService.js
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

// Create an Axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to attach token (if stored in localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Example function to fetch jobs with optional query params:
 * title, company, limit, offset
 */
export const fetchJobs = async ({ title, company, limit = 5, offset = 0 } = {}) => {
  const params = {};
  if (title) params.title = title;
  if (company) params.company = company;
  params.limit = limit;
  params.offset = offset;

  const response = await api.get("/jobs", { params });
  return response.data;
};

/**
 * Example function to create a new job (recruiter-only)
 */
export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

/**
 * Login function (calls /auth/token with username/password)
 */
export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await api.post("/auth/token", formData);
  return response.data; // Should return { access_token, token_type }
};

export default api; // if you want to import the axios instance
