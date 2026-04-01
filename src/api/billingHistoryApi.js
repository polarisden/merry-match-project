import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

/**
 * Switch to real backend: set in .env
 *   VITE_USE_MOCK_API=false
 *   VITE_API_BASE_URL=http://localhost:8080
 */
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

/** Newest first — slice(0, n) = n รายการล่าสุด */
const mockBillingHistoryFull = {
  nextBillingDate: "01/02/2026",
  rows: [
    { id: 1, date: "01/01/2026", planName: "plan1", amount: 10 },
    { id: 2, date: "01/12/2025", planName: "plan1", amount: 1 },
    { id: 3, date: "01/11/2025", planName: "plan1", amount: 1 },
    { id: 4, date: "01/10/2025", planName: "plan1", amount: 1 },
    { id: 5, date: "01/09/2025", planName: "plan1", amount: 1 },
    { id: 6, date: "01/08/2025", planName: "plan1", amount: 1 },
    { id: 7, date: "01/07/2025", planName: "plan1", amount: 1 },
    { id: 8, date: "01/06/2025", planName: "plan1", amount: 1 },
  ],
};

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function applyLimit(data, limit) {
  if (limit == null || limit <= 0) return data;
  return {
    ...data,
    rows: data.rows.slice(0, limit),
  };
}

export async function getBillingHistoryMock(options = {}) {
  await delay(500);
  const { limit } = options;
  return applyLimit(
    { ...mockBillingHistoryFull, rows: [...mockBillingHistoryFull.rows] },
    limit
  );
}

/**
 * GET /api/billing-history
 * Query: limit (optional) — จำนวนแถวล่าสุด; ไม่ส่ง = ทั้งหมด
 * Expected shape: { nextBillingDate: string, rows: Array<{ id, date, planName, amount }> }
 */
export async function getBillingHistoryFromApi(options = {}) {
  const { limit } = options;
  const config = {};
  if (limit != null && limit > 0) {
    config.params = { limit };
  }
  const { data } = await api.get("/api/billing-history", config);
  return data;
}

/**
 * @param {{ limit?: number }} [options] — ส่ง limit เพื่อดึงแค่ N รายการล่าสุด (เช่น 5); ไม่ส่ง = ทั้งหมด
 */
export async function getBillingHistory(options = {}) {
  return USE_MOCK_API
    ? getBillingHistoryMock(options)
    : getBillingHistoryFromApi(options);
}

export { USE_MOCK_API };
