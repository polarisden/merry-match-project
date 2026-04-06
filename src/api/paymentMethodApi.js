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
 * Switch to real backend: set in .env
 *   VITE_USE_MOCK_API=false
 *   VITE_API_BASE_URL=http://localhost:8080
 */
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

// TODO: remove mock, use real API when backend ready
const mockPaymentMethod = {
  brand: "Visa",
  last4: "0000",
  expMonth: "04",
  expYear: "2025",
};

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getPaymentMethodMock() {
  await delay(500);
  return mockPaymentMethod;
}

export async function getPaymentMethodFromApi() {
  // backend should return the user's saved payment method (authenticated)
  const { data } = await api.get("/api/payment-method");
  return data;
}

export async function getPaymentMethod() {
  return USE_MOCK_API ? getPaymentMethodMock() : getPaymentMethodFromApi();
}

export { USE_MOCK_API };

