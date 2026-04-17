import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const headers = config.headers ?? {};
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token")?.trim() : "";
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  config.headers = headers;
  return config;
});

/**
 * POST /api/subscriptions/cancel — หยุดต่ออายุ (ใช้สิทธิ์ถึง cancelAt / สิ้นรอบ)
 * 204 No Content
 */
export async function cancelSubscription() {
  await api.post("/api/subscriptions/cancel");
}

/**
 * POST /api/subscriptions/resume — เปิด auto-renew ก่อนสิ้นรอบ
 * 204 No Content
 */
export async function resumeSubscription() {
  await api.post("/api/subscriptions/resume");
}
