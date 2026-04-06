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
 * GET /api/billing/history
 * 200 = JSON array (ว่าง = []) — เรียงใหม่ → เก่าจาก backend
 * BillingHistoryItemDto: id, billedAt, planName, amountSatang, status ("PAID" | "FAILED")
 */
export async function getBillingHistory() {
  const { data } = await api.get("/api/billing/history");
  console.log("Billing History", data)
  return Array.isArray(data) ? data : [];
}
