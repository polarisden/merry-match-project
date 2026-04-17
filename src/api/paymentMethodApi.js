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

export async function getPaymentMethodFromApi() {
  // backend should return the user's saved payment method (authenticated)
  const { data } = await api.get("/api/payment-method");
  return data;
}

export async function getPaymentMethod() {
  return getPaymentMethodFromApi();
}

