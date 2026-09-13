import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (hadToken && window.location.pathname !== "/login") {
        window.location.href = "/login?reason=session-expired";
      }
    }

    return Promise.reject(error);
  }
);