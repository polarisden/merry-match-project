import axios from "axios";
import { getCurrentMembership } from "../api/membershipApi";

const DEFAULT_INTERVAL_MS = 2500;
const DEFAULT_MAX_ATTEMPTS = 48;

export function planChangeErrorMessage(err) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    const msg =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.error ||
      data?.detail ||
      err.message;
    if (status === 401) return "Please login to continue";
    if (status === 403) return "Access denied";
    if (status === 404) return "Plan or subscription not found";
    if (status === 409) return typeof msg === "string" ? msg : "Conflict";
    if (status === 400) return typeof msg === "string" ? msg : "Invalid request";
    if (status === 422) return typeof msg === "string" ? msg : "Validation failed";
    return typeof msg === "string" ? msg : "Plan change failed";
  }
  return err instanceof Error ? err.message : "Plan change failed";
}

/**
 * Poll GET /api/membership/current until active plan id matches target (after upgrade webhook).
 */
export async function pollMembershipUntilPlanMatches(
  targetPlanId,
  {
    intervalMs = DEFAULT_INTERVAL_MS,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
  } = {},
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const m = await getCurrentMembership();
    const pid = m?.planId ?? m?.plan?.id;
    if (m && String(pid) === String(targetPlanId)) {
      return m;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(
    "Timed out waiting for subscription to update. Please refresh the page.",
  );
}
