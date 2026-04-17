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
 * @typedef {Object} PlanChangePreviewResponse
 * @property {'SAME'|'UPGRADE'|'DOWNGRADE'} changeType
 * @property {number} [proratedAmountSatang]
 * @property {string} [scheduledEffectiveAt] ISO — สิ้นรอบ (downgrade)
 */

/**
 * POST /api/subscriptions/plan-change/preview
 * @param {string} planId UUID
 * @returns {Promise<PlanChangePreviewResponse>}
 */
export async function previewPlanChange(planId) {
  const { data } = await api.post("/api/subscriptions/plan-change/preview", {
    planId,
  });
  return data;
}

/**
 * POST /api/subscriptions/plan-change/upgrade
 * @param {string} planId
 * @param {string} omiseToken one-time token
 * @returns {Promise<{ status?: string, authorizeUri?: string|null, chargeId?: string|null, subscriptionId?: string|null }>}
 */
export async function upgradePlanChange(planId, omiseToken) {
  const { data } = await api.post("/api/subscriptions/plan-change/upgrade", {
    planId,
    omiseToken,
  });
  return data ?? {};
}

/**
 * POST /api/subscriptions/plan-change/downgrade — 202
 * @param {string} planId
 */
export async function downgradePlanChange(planId) {
  const { data } = await api.post("/api/subscriptions/plan-change/downgrade", {
    planId,
  });
  return data ?? {};
}

/**
 * POST /api/subscriptions/plan-change/downgrade/cancel — 204 No Content
 * Cancels a scheduled downgrade for current user's subscription.
 */
export async function cancelDowngradePlanChange() {
  await api.post("/api/subscriptions/plan-change/downgrade/cancel");
}
