import axios from "axios";
import { storage } from "./storage";

const api = axios.create({
  baseURL: "http://localhost/projex/projex_backend/public/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;