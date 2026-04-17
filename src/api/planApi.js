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

// --- Backend response shapes (JSDoc) -------------------------------------------

/**
 * @typedef {Object} SubscriptionCheckoutResponse
 * @property {string|null} subscriptionId
 * @property {string} chargeId
 * @property {'paid'|'pending'|string} status
 * @property {string|null} authorizeUri
 * @property {string|null} [omiseCustomerId]
 * @property {string|null} [omiseCardId]
 */

const DEFAULT_PACKAGE_ICON_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/960px-Heart_coraz%C3%B3n.svg.png";

function normalizePlanDetail(plan) {
  if (Array.isArray(plan?.planDetail)) return plan.planDetail;
  if (!Array.isArray(plan?.descriptions)) return [];
  return [...plan.descriptions]
    .sort(
      (a, b) =>
        Number(a?.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        Number(b?.sortOrder ?? Number.MAX_SAFE_INTEGER),
    )
    .map((d) => d?.description)
    .filter(Boolean);
}

export function normalizePlan(plan) {
  if (!plan || typeof plan !== "object") return null;

  const iconUrl = plan.icon_url || plan.iconUrl || DEFAULT_PACKAGE_ICON_URL;
  const sortOrder = plan.sortOrder ?? plan.sort_order ?? null;

  return {
    ...plan,
    icon_url: iconUrl,
    sortOrder,
    planDetail: normalizePlanDetail(plan),
  };
}

export function normalizePlans(plans) {
  if (!Array.isArray(plans)) return [];
  return plans.map(normalizePlan).filter(Boolean);
}

/** ISO date string → DD/MM/YYYY for card display */
function isoToDdMmYyyy(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB");
}

/**
 * Map subscription payload to UI plan card shape.
 * Supports SubscriptionDetailDto (currentPeriodStart, nextBillingDate, plan).
 */
export function subscriptionToSuccessPlan(sub) {
  if (!sub || typeof sub !== "object") return null;
  const raw = sub.plan ?? sub.currentPlan ?? sub.planSnapshot ?? sub;
  const plan = normalizePlan(raw);
  if (!plan) return null;

  const startDate =
    sub.startDate ||
    isoToDdMmYyyy(sub.currentPeriodStart) ||
    plan.startDate ||
    undefined;
  const nextBillingDate =
    isoToDdMmYyyy(sub.nextBillingDate) ||
    isoToDdMmYyyy(sub.currentPeriodEnd) ||
    plan.nextBillingDate ||
    undefined;

  return {
    ...plan,
    planDetail: plan.planDetail ?? [],
    ...(startDate ? { startDate } : {}),
    ...(nextBillingDate ? { nextBillingDate } : {}),
  };
}

// --- Real API -----------------------------------------------------------------

export async function getPlansFromApi() {
  const { data } = await api.get("/api/plans");
  return normalizePlans(data);
}

export async function getPlanByIdFromApi(id) {
  const { data } = await api.get(`/api/plans/${encodeURIComponent(id)}`);
  return normalizePlan(data);
}

/**
 * @param {string} planId UUID
 * @param {string} omiseToken one-time token from Omise.js (e.g. tokn_test_…)
 * @returns {Promise<SubscriptionCheckoutResponse>}
 */
export async function subscriptionCheckoutFromApi(planId, omiseToken) {
  const { data } = await api.post("/api/subscriptions/checkout", {
    planId,
    omiseToken,
  });
  return data;
}

/**
 * GET /api/subscriptions/{id} — JWT required; 404 if not owner.
 * Response (SubscriptionDetailDto): id, status, currentPeriodStart, currentPeriodEnd,
 * nextBillingDate, cancelAt, cancelledAt, autoRenew, createdAt, plan (PlanDto)
 */
export async function getSubscriptionFromApi(subscriptionId) {
  const { data } = await api.get(
    `/api/subscriptions/${encodeURIComponent(subscriptionId)}`,
  );
  return data;
}

export function sortPlansBySortOrder(plans) {
  if (!Array.isArray(plans)) return [];
  return [...plans].sort((a, b) => {
    const orderA = Number(
      a?.sort_order ?? a?.sortOrder ?? Number.MAX_SAFE_INTEGER,
    );
    const orderB = Number(
      b?.sort_order ?? b?.sortOrder ?? Number.MAX_SAFE_INTEGER,
    );
    return orderA - orderB;
  });
}

// --- Public API ---------------------------------------------------------------

export async function getPlans() {
  const plans = await getPlansFromApi();
  return normalizePlans(plans);
}

export async function getPlanById(id) {
  const plan = await getPlanByIdFromApi(id);
  return normalizePlan(plan);
}

/**
 * @param {string} planId
 * @param {{ omiseToken: string }} payload
 * @returns {Promise<SubscriptionCheckoutResponse>}
 */
export async function subscriptionCheckout(planId, payload) {
  const token = payload?.omiseToken;
  if (!token) {
    return Promise.reject(new Error("Missing omiseToken"));
  }
  return subscriptionCheckoutFromApi(planId, token);
}

/**
 * Real API: GET /api/subscriptions/{id} (SubscriptionDetailDto).
 */
export async function getSubscription(subscriptionId) {
  return getSubscriptionFromApi(subscriptionId);
}
