import axios from "axios";
import { useAuthStore } from "../store/authstore";

/**
 * axios instance กลาง
 * - ตั้ง baseURL จาก .env
 * - แนบ token ทุก request อัตโนมัติ
 * - ถ้า 401 ให้ logout ทิ้ง
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: แนบ token
http.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: จัดการ 401
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
