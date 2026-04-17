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
 * POST /api/subscriptions/payment-method — แนบบัตรใหม่ (Omise token เท่านั้น)
 * @param {string} omiseToken e.g. tokn_test_…
 * @returns {Promise<{ brand?: string, lastDigits?: string, expirationMonth?: number, expirationYear?: number }>}
 */
export async function updateSubscriptionPaymentMethod(omiseToken) {
  const { data } = await api.post("/api/subscriptions/payment-method", {
    omiseToken,
  });
  return data;
}
