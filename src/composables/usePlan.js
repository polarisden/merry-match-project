import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import dayjs from "dayjs";
import {
  getPlanById,
  getPlans,
  getSubscription,
  sortPlansBySortOrder,
  subscriptionCheckout,
  subscriptionToSuccessPlan,
} from "../api/planApi";
import { usePlanStore } from "../stores/planStore";
import { useAuthStore } from "../stores/auth";

function checkoutErrorMessage(err) {
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
    if (status === 404) return "Plan or user not found";
    if (status === 409) return "You already have an active subscription";
    if (status === 400) return typeof msg === "string" ? msg : "Invalid request";
    if (status === 422) return typeof msg === "string" ? msg : "Validation failed";
    return typeof msg === "string" ? msg : "Checkout failed";
  }
  return err instanceof Error ? err.message : "Checkout failed";
}

export function usePlan() {
  const router = useRouter();
  const store = usePlanStore();
  const auth = useAuthStore();

  const loading = ref(false);
  const error = ref(null);
  const plans = ref([]);
  const loadedPlan = ref(null);
  /** Subscription payload from GET /api/subscriptions/:id */
  const subscription = ref(null);
  const paying = ref(false);

  const selectedPlan = computed(() => store.selectedPlan || loadedPlan.value);

  async function fetchPlans() {
    try {
      loading.value = true;
      error.value = null;
      plans.value = sortPlansBySortOrder(await getPlans());
    } catch (err) {
      error.value = "Failed to load plans";
    } finally {
      loading.value = false;
    }
  }

  async function ensureSelectedPlan(route) {
    if (store.selectedPlan) return;

    const planId = route.query.planId;
    if (typeof planId !== "string" || !planId) return;

    try {
      loading.value = true;
      error.value = null;
      loadedPlan.value = await getPlanById(planId);
    } catch (err) {
      error.value = "Failed to load plan";
    } finally {
      loading.value = false;
    }
  }

  function setSelectedPlan(plan) {
    store.setPlan(plan);
  }

  /**
   * @param {object} plan
   * @param {{ subscriptionChange?: boolean }} [options] — true = เปลี่ยนแผน (มี membership) → PaymentPage เรียก preview
   */
  function goToPaymentWithPlan(plan, options = {}) {
    setSelectedPlan(plan);
    const params = new URLSearchParams({
      planId: String(plan.id),
    });
    if (options.subscriptionChange) {
      params.set("subscriptionChange", "1");
    }
    router.push(`/merry-plan/payment?${params.toString()}`);
  }

  /**
   * @param {{ omiseToken: string }} payment Omise one-time token from Omise.js (e.g. tokn_test_…)
   */
  async function paySelectedPlan(payment = {}) {
    if (!selectedPlan.value?.id) return;

    auth.hydrate();
    if (!auth.token) {
      error.value = "Please login to continue";
      return;
    }

    const omiseToken = payment.omiseToken;
    if (!omiseToken) {
      error.value = "Missing payment token";
      return;
    }

    try {
      paying.value = true;
      error.value = null;

      const res = await subscriptionCheckout(String(selectedPlan.value.id), {
        omiseToken,
      });

      if (res.status === "pending" && res.authorizeUri) {
        window.location.href = res.authorizeUri;
        return;
      }

      if (res.status === "pending") {
        error.value =
          "Payment is pending. Please complete any required steps or check back later.";
        return;
      }

      if (res.status === "paid") {
        const q = {
          planId: String(selectedPlan.value.id),
        };
        if (res.subscriptionId) q.subscriptionId = String(res.subscriptionId);
        if (res.chargeId) q.chargeId = String(res.chargeId);
        await router.push({
          name: "merry-plan-payment-success",
          query: q,
        });
        return;
      }

      error.value = `Unexpected status: ${res.status ?? "unknown"}`;
    } catch (err) {
      error.value = checkoutErrorMessage(err);
    } finally {
      paying.value = false;
    }
  }

  /**
   * Success page:
   * - subscriptionId: GET /api/subscriptions/:id
   * - planId only: fallback GET /api/plans/:id เมื่อไม่มี subscriptionId ใน URL
   */
  async function fetchSubscriptionFromRoute(route) {
    try {
      loading.value = true;
      error.value = null;
      subscription.value = null;

      const planId = route.query.planId;
      const subscriptionId = route.query.subscriptionId;
      const chargeId = route.query.chargeId;

      if (typeof subscriptionId === "string" && subscriptionId) {
        subscription.value = await getSubscription(subscriptionId);
        store.clearPlan();
        return;
      }

      if (typeof planId === "string" && planId) {
        const plan = await getPlanById(planId);
        subscription.value = {
          subscriptionId: null,
          chargeId: typeof chargeId === "string" && chargeId ? chargeId : null,
          status: "paid",
          plan,
        };
        store.clearPlan();
        return;
      }

      if (typeof chargeId === "string" && chargeId) {
        subscription.value = {
          subscriptionId: null,
          chargeId,
          status: "pending",
          plan: null,
        };
        store.clearPlan();
        return;
      }

      throw new Error(
        "Missing subscriptionId, planId, or chargeId",
      );
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load subscription";
    } finally {
      loading.value = false;
    }
  }

  const successPlan = computed(() => {
    const fromSub = subscription.value
      ? subscriptionToSuccessPlan(subscription.value)
      : null;
    if (fromSub) {
      const createdAt = subscription.value?.createdAt
        ? dayjs(subscription.value.createdAt)
        : dayjs();
      return {
        ...fromSub,
        startDate: fromSub.startDate || createdAt.format("DD/MM/YYYY"),
        nextBillingDate:
          fromSub.nextBillingDate || createdAt.add(1, "month").format("DD/MM/YYYY"),
      };
    }

    return null;
  });

  function clearPlan() {
    store.clearPlan();
  }

  return {
    loading,
    error,
    plans,
    subscription,
    selectedPlan,
    successPlan,
    paying,
    fetchPlans,
    ensureSelectedPlan,
    goToPaymentWithPlan,
    paySelectedPlan,
    fetchSubscriptionFromRoute,
    clearPlan,
  };
}
