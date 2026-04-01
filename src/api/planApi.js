import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});

/**
 * Switch to real backend: set in .env
 *   VITE_USE_MOCK_API=false
 *   VITE_API_BASE_URL=https://your-api.example.com
 * While true (default), mock implementations run (localStorage + in-memory orders).
 */
const USE_MOCK_API = true;

// --- Backend response shapes (for TypeScript / JSDoc reference) -------------------
/**
 * @typedef {Object} CreateOrderResponse
 * @property {string} orderId
 * @property {string} paymentUrl   // Omise redirect URL from backend
 */

/**
 * @typedef {Object} OrderPlanSnapshot
 * @property {number|string} id
 * @property {string} planName
 * @property {number} price
 * @property {number} merryLimit
 * @property {string[]} planDetail
 * @property {string} icon
 * @property {string} [startDate]       // DD/MM/YYYY from backend
 * @property {string} [nextBillingDate] // DD/MM/YYYY from backend
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {number|string} planId
 * @property {string} status
 * @property {string} createdAt
 * @property {string} [paidAt]
 * @property {string} [paymentStatus]
 * @property {OrderPlanSnapshot} plan
 */

// TODO: remove mock block below when backend is stable in all environments

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

/**
 * Normalize backend/mock plan into a frontend-friendly shape.
 * Backend (2026): { id(uuid), name, priceSatang, sortOrder, descriptions[] }
 * Mock (legacy): { id, name, priceSatang, sort_order, planDetail, icon_url }
 */
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

// --- Mock data & helpers ------------------------------------------------------

const MerryPlans = [
  {
    id: 1,
    name: "plan2",
    priceSatang: 1000,
    swipeLimit: 70,
    canSeeLikers: false,
    sort_order:2,
    planDetail: ["merryDetail1.1", "merryDetail1.2", "merryDetail1.3"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
  {
    id: 2,
    name: "plan1",
    priceSatang: 2000,
    swipeLimit: 150,
    canSeeLikers: false,
    sort_order:1,
    planDetail: ["merryDetail2.1", "merryDetail2.2"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
  {
    id: 3,
    name: "plan3",
    priceSatang: 3000,
    swipeLimit: 300,
    canSeeLikers: false,
    sort_order:3,
    planDetail: ["merryDetail3.1", "merryDetail3.2"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
  {
    id: 4,
    name: "plan4",
    priceSatang: 40000,
    swipeLimit: 600,
    canSeeLikers: false,
    sort_order:4,
    planDetail: ["merryDetail4.1", "merryDetail4.2"],
    icon_url: DEFAULT_PACKAGE_ICON_URL,
  },
];

const ORDER_STORAGE_KEY = "mockOrders";
const orders = new Map();

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
    // ignore invalid localStorage data in mock mode
  }
}

function persistOrdersToStorage() {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify([...orders.values()]));
  } catch {
    // ignore localStorage write errors in mock mode
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

export async function createOrderMock(planId) {
  await delay(500);
  const plan = MerryPlans.find((p) => String(p.id) === String(planId));

  if (!plan) throw new Error("Plan not found");

  const paidAt = new Date();
  const startDate = formatDateDDMMYYYY(paidAt);
  const nextBillingDate = formatDateDDMMYYYY(addOneMonthClamped(paidAt));
  const user = {
    id: "dsjhio123456 "
  }
  const orderId = String(Date.now());
  const order = {
    id: orderId,
    planId: plan.id,
    paymentStatus: "paid",
    paidAt: paidAt.toISOString(),
    plan: {
      ...plan,
      startDate,
      nextBillingDate,
    },
    status: "paid",
    createdAt: paidAt.toISOString(),
  };

  orders.set(orderId, order);
  persistOrdersToStorage();

  return {
    orderId,
    paymentUrl: `/merry-plan/payment-success?orderId=${encodeURIComponent(orderId)}`,
  };
}

export async function getOrderMock(orderId) {
  await delay(500);
  loadOrdersFromStorage();
  const order = orders.get(String(orderId));
  if (!order) throw new Error("Order not found");
  return order;
}

// --- Real API (same signatures; wire when backend is ready) -------------------

export async function getPlansFromApi() {
  const { data } = await api.get("/api/plans");
  return normalizePlans(data);
}

export async function getPlanByIdFromApi(id) {
  const { data } = await api.get(`/api/plans/${encodeURIComponent(id)}`);
  return normalizePlan(data);
}

/**
 * SECURITY: send only planId — never price/amount from frontend.
 * @param {string|number} planId
 * @returns {Promise<CreateOrderResponse>}
 */
export async function createOrderFromApi(planId) {
  const { data } = await api.post("/api/orders/create", { planId });
  return data;
}

/**
 * Single source of truth for payment success page after redirect.
 * @param {string} orderId
 * @returns {Promise<Order>}
 */
export async function getOrderFromApi(orderId) {
  const { data } = await api.get(`/api/orders/${encodeURIComponent(orderId)}`);
  return data;
}

/**
 * Sort plan list by `sort_order` ascending (see mock MerryPlans).
 * Items without `sort_order` / `sortOrder` sort last.
 * @param {unknown[]} plans
 * @returns {unknown[]}
 */
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

// --- Public API (toggle mock vs real) ----------------------------------------

export async function getPlans() {
  const plans = USE_MOCK_API ? await getPlansMock() : await getPlansFromApi();
  return normalizePlans(plans);
}

export async function getPlanById(id) {
  const plan = USE_MOCK_API ? await getPlanByIdMock(id) : await getPlanByIdFromApi(id);
  return normalizePlan(plan);
}

export async function createOrder(planId) {
  return USE_MOCK_API ? createOrderMock(planId) : createOrderFromApi(planId);
}

export async function getOrder(orderId) {
  return USE_MOCK_API ? getOrderMock(orderId) : getOrderFromApi(orderId);
}

export { USE_MOCK_API };
