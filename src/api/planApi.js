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
 * Mock is ON unless VITE_USE_MOCK_API is exactly the string "false".
 * If unset, mock runs — Omise Dashboard will show nothing (no server-side charge).
 *
 * Real payment: .env.local → VITE_USE_MOCK_API=false
 * Optional: leave VITE_API_BASE_URL empty and use Vite proxy (/api → localhost:8080).
 */
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

// --- Backend response shapes (JSDoc) -------------------------------------------

/**
 * @typedef {Object} OmiseConfigResponse
 * @property {string} publicKey
 */

/**
 * @typedef {Object} SubscriptionCheckoutResponse
 * @property {string|null} subscriptionId
 * @property {string} chargeId
 * @property {'paid'|'pending'|string} status
 * @property {string|null} authorizeUri
 * @property {string|null} [omiseCustomerId]
 * @property {string|null} [omiseCardId]
 */

/**
 * @typedef {Object} OrderPlanSnapshot
 * @property {number|string} id
 * @property {string} [planName]
 * @property {string} [name]
 * @property {number} [priceSatang]
 * @property {string[]} [planDetail]
 * @property {string} [icon_url]
 * @property {string} [startDate]
 * @property {string} [nextBillingDate]
 */

/**
 * @typedef {Object} LegacyOrder
 * @property {string} id
 * @property {number|string} planId
 * @property {string} status
 * @property {string} createdAt
 * @property {OrderPlanSnapshot} plan
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
 * Map subscription / mock payload to UI plan card shape.
 * Supports SubscriptionDetailDto (currentPeriodStart, nextBillingDate, plan) and mock shapes.
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

// --- Mock data & helpers ------------------------------------------------------

const MerryPlans = [
  {
    id: 1,
    name: "plan2",
    priceSatang: 1000,
    swipeLimit: 70,
    canSeeLikers: false,
    sort_order: 2,
    planDetail: ["merryDetail1.1", "merryDetail1.2", "merryDetail1.3"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
  {
    id: 2,
    name: "plan1",
    priceSatang: 2000,
    swipeLimit: 150,
    canSeeLikers: false,
    sort_order: 1,
    planDetail: ["merryDetail2.1", "merryDetail2.2"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
  {
    id: 3,
    name: "plan3",
    priceSatang: 3000,
    swipeLimit: 300,
    canSeeLikers: false,
    sort_order: 3,
    planDetail: ["merryDetail3.1", "merryDetail3.2"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
  {
    id: 4,
    name: "plan4",
    priceSatang: 40000,
    swipeLimit: 600,
    canSeeLikers: false,
    sort_order: 4,
    planDetail: ["merryDetail4.1", "merryDetail4.2"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
];

const ORDER_STORAGE_KEY = "mockOrders";
const orders = new Map();

/** @type {Map<string, object>} */
const mockSubscriptionsById = new Map();
/** @type {Map<string, object>} */
const mockSubscriptionsByChargeId = new Map();

function loadOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    parsed.forEach((order) => {
      if (order?.id) {
        orders.set(String(order.id), order);
      }
    });
  } catch {
    // ignore
  }
}

function persistOrdersToStorage() {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([...orders.values()]));
  } catch {
    // ignore
  }
}

loadOrdersFromStorage();

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDateDDMMYYYY(date) {
  return date.toLocaleDateString("en-GB");
}

function addOneMonthClamped(date) {
  const original = new Date(date);
  const year = original.getFullYear();
  const month = original.getMonth();
  const day = original.getDate();

  const lastDayOfNextMonth = new Date(year, month + 2, 0).getDate();
  const clampedDay = Math.min(day, lastDayOfNextMonth);

  const next = new Date(original);
  next.setDate(1);
  next.setMonth(month + 1);
  next.setDate(clampedDay);
  return next;
}

export async function getPlansMock() {
  await delay(500);
  return MerryPlans;
}

export async function getPlanByIdMock(id) {
  await delay(500);
  const plan = MerryPlans.find((p) => String(p.id) === String(id));
  if (!plan) throw new Error("Plan not found");
  return plan;
}

export async function getOmiseConfigMock() {
  await delay(100);
  return {
    publicKey: import.meta.env.VITE_OMISE_PUBLIC_KEY || "",
  };
}

/**
 * @param {string|number} planId
 * @param {{ omiseToken?: string }} payload
 * @returns {Promise<SubscriptionCheckoutResponse>}
 */
export async function subscriptionCheckoutMock(planId, payload = {}) {
  await delay(500);
  const plan = MerryPlans.find((p) => String(p.id) === String(planId));

  if (!plan) throw new Error("Plan not found");

  const paidAt = new Date();
  const startDate = formatDateDDMMYYYY(paidAt);
  const nextBillingDate = formatDateDDMMYYYY(addOneMonthClamped(paidAt));

  const subscriptionId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `sub_mock_${Date.now()}`;
  const chargeId = `chrg_test_${Date.now()}`;

  const planSnapshot = {
    ...plan,
    startDate,
    nextBillingDate,
  };

  const record = {
    id: subscriptionId,
    chargeId,
    status: "paid",
    plan: planSnapshot,
  };

  mockSubscriptionsById.set(subscriptionId, record);
  mockSubscriptionsByChargeId.set(chargeId, record);

  const orderId = String(Date.now());
  const order = {
    id: orderId,
    planId: plan.id,
    paymentStatus: "paid",
    paidAt: paidAt.toISOString(),
    plan: planSnapshot,
    status: "paid",
    createdAt: paidAt.toISOString(),
  };

  orders.set(orderId, order);
  persistOrdersToStorage();

  return {
    subscriptionId,
    chargeId,
    status: "paid",
    authorizeUri: null,
    omiseCustomerId: null,
    omiseCardId: null,
  };
}

export async function getOrderMock(orderId) {
  await delay(500);
  loadOrdersFromStorage();
  const order = orders.get(String(orderId));
  if (!order) throw new Error("Order not found");
  return order;
}

export async function getSubscriptionMock(subscriptionId) {
  await delay(300);
  const sub = mockSubscriptionsById.get(String(subscriptionId));
  if (!sub) throw new Error("Subscription not found");
  return sub;
}

export async function getSubscriptionByChargeMock(chargeId) {
  await delay(300);
  const sub = mockSubscriptionsByChargeId.get(String(chargeId));
  if (!sub) throw new Error("Subscription not found for charge");
  return sub;
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
 * Optional: public key from backend when VITE_OMISE_PUBLIC_KEY is empty.
 * @returns {Promise<OmiseConfigResponse>}
 */
export async function getOmiseConfigFromApi() {
  const { data } = await api.get("/api/payments/omise-config");
  return data ?? { publicKey: "" };
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
  const plans = USE_MOCK_API ? await getPlansMock() : await getPlansFromApi();
  return normalizePlans(plans);
}

export async function getPlanById(id) {
  const plan = USE_MOCK_API ? await getPlanByIdMock(id) : await getPlanByIdFromApi(id);
  return normalizePlan(plan);
}

export async function getOmiseConfig() {
  return USE_MOCK_API ? getOmiseConfigMock() : getOmiseConfigFromApi();
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
  if (import.meta.env.DEV && USE_MOCK_API) {
    console.warn(
      "[planApi] Mock checkout: no call to Spring/Omise. Set VITE_USE_MOCK_API=false in .env.local to see charges in Omise Dashboard.",
    );
  }
  return USE_MOCK_API
    ? subscriptionCheckoutMock(planId, payload)
    : subscriptionCheckoutFromApi(planId, token);
}

/**
 * Mock: in-memory snapshot หลัง mock checkout.
 * Real API: GET /api/subscriptions/{id} (SubscriptionDetailDto).
 */
export async function getSubscription(subscriptionId) {
  return USE_MOCK_API
    ? getSubscriptionMock(subscriptionId)
    : getSubscriptionFromApi(subscriptionId);
}

/**
 * Mock-only: lookup by charge id หลัง mock checkout
 */
export async function getSubscriptionByCharge(chargeId) {
  if (!USE_MOCK_API) {
    return Promise.reject(
      new Error("getSubscriptionByCharge is mock-only; real API uses planId + getPlanById"),
    );
  }
  return getSubscriptionByChargeMock(chargeId);
}

/** Legacy mock only: GET by old `orderId` query on success page */
export async function getOrder(orderId) {
  if (!USE_MOCK_API) {
    return Promise.reject(new Error("Order lookup is not available; use subscriptionId or chargeId"));
  }
  return getOrderMock(orderId);
}

export { USE_MOCK_API };
