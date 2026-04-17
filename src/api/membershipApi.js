import axios from "axios";

const api = axios.create({
  // Dev: ใช้ "" ให้ยิง /api/* ไปที่ Vite (5173) แล้ว proxy ไป 8080 — ไม่โดน CORS
  // Production: ตั้ง VITE_API_BASE_URL=https://api.example.com
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

const DEFAULT_PACKAGE_ICON =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Heart_coraz%C3%B3n.svg/960px-Heart_coraz%C3%B3n.svg.png";

/**
 * @typedef {Object} BankedPlanItem
 * @property {string} planId
 * @property {string} planName
 * @property {number} planPriceSatang
 * @property {number} remainingDays
 */

/**
 * @typedef {Object} SubscriptionDetailDto
 * @property {{ id?: string, name: string, priceSatang?: number, descriptions?: Array<{description?: string, sortOrder?: number}> }} plan
 * @property {{ id?: string, name?: string } | null} [pendingPlan]
 * @property {string | null} [scheduledPlanChangeAt]
 * @property {number} [currentPlanBankedDays]
 * @property {BankedPlanItem[]} [bankedPlans]
 */

/** DD/MM/YYYY */
function formatMembershipDate(iso) {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatStatusLabel(status) {
  if (status == null || status === "") return "";
  const s = String(status).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function descriptionsToDetailLines(descriptions) {
  if (!Array.isArray(descriptions)) return [];
  return [...descriptions]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((d) => (typeof d === "string" ? d : d?.description))
    .filter(Boolean);
}

/**
 * คืน null เมื่อยังไม่มี subscription / payload ไม่ครบ
 * SubscriptionDetailDto with membership + day-bank fields
 * คืน object สำหรับ UI: แพ็กเกจ (ชื่อ ราคา รายการ), วันที่, icon, paymentCard (brand, last4, วันหมดอายุ)
 */
export function normalizeMembership(data) {
  if (data == null) return null;
  const planId = data.planId ?? data.plan?.id;
  if (planId == null || planId === "") return null;

  const plan = data.plan;
  if (!plan || typeof plan.name !== "string") return null;

  const rawCard = data.paymentCard;
  const paymentCard =
    rawCard && typeof rawCard === "object"
      ? {
          brand: String(rawCard.brand ?? ""),
          last4: String(rawCard.lastDigits ?? rawCard.last4 ?? ""),
          expMonth: rawCard.expirationMonth ?? rawCard.expMonth ?? "",
          expYear: rawCard.expirationYear ?? rawCard.expYear ?? "",
        }
      : null;

  const cancelAtRaw = data.cancelAt;
  const cancelledAtRaw = data.cancelledAt;
  const pendingPlan =
    data.pendingPlan && typeof data.pendingPlan === "object"
      ? data.pendingPlan
      : null;
  const scheduledRaw = data.scheduledPlanChangeAt;
  const bankedPlans = Array.isArray(data.bankedPlans)
    ? [...data.bankedPlans]
        .map((item) => ({
          planId: String(item?.planId ?? ""),
          planName: String(item?.planName ?? ""),
          planPriceSatang: Number(item?.planPriceSatang ?? 0),
          remainingDays: Number(item?.remainingDays ?? 0),
        }))
        .filter((item) => item.planId !== "")
        .sort((a, b) => b.planPriceSatang - a.planPriceSatang)
    : [];

  return {
    ...data,
    planId: String(planId),
    id: data.id,
    packageName: plan.name,
    price: plan.priceSatang ?? 0,
    packageDetail: descriptionsToDetailLines(plan.descriptions),
    icon: DEFAULT_PACKAGE_ICON,
    subscriptionStatusRaw: String(data.status ?? ""),
    status: formatStatusLabel(data.status),
    startDate: formatMembershipDate(data.currentPeriodStart),
    nextBillingDate: formatMembershipDate(data.nextBillingDate),
    paymentCard,
    pendingPlan,
    scheduledPlanChangeAt: scheduledRaw ?? null,
    scheduledPlanChangeAtDisplay: scheduledRaw
      ? formatMembershipDate(scheduledRaw)
      : "",
    currentPlanBankedDays: Number(data.currentPlanBankedDays ?? 0),
    bankedPlans,
    autoRenew: Boolean(data.autoRenew),
    cancelAt: cancelAtRaw ?? null,
    cancelAtDisplay: cancelAtRaw ? formatMembershipDate(cancelAtRaw) : "",
    cancelledAt: cancelledAtRaw ?? null,
    cancelledAtDisplay: cancelledAtRaw
      ? formatMembershipDate(cancelledAtRaw)
      : "",
  };
}

/**
 * GET /api/membership/current — 404 = ยังไม่มี membership
 */
export async function getCurrentMembership() {
  try {
    const { data } = await api.get("/api/membership/current");
    return normalizeMembership(data);
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}
