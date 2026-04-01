import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import {
  createOrder,
  getOrder,
  getPlanById,
  getPlans,
  sortPlansBySortOrder,
} from "../api/planApi";
import { usePlanStore } from "../stores/planStore";

export function usePlan() {
  const router = useRouter();
  const store = usePlanStore();

  const loading = ref(false);
  const error = ref(null);
  const plans = ref([]);
  const loadedPlan = ref(null);
  const order = ref(null);
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

  function goToPaymentWithPlan(plan) {
    setSelectedPlan(plan);
    router.push(`/merry-plan/payment?planId=${encodeURIComponent(plan.id)}`);
  }

  async function paySelectedPlan() {
    if (!selectedPlan.value?.id) return;

    // SECURITY: NEVER send price/amount from frontend
    try {
      paying.value = true;
      error.value = null;
      const { paymentUrl, orderId } = await createOrder(selectedPlan.value.id);
      // Support backend returning absolute URL, "/path", or "path" (no leading slash).
      const normalizedUrl =
        typeof paymentUrl === "string" && paymentUrl
          ? new URL(
              paymentUrl.startsWith("http") || paymentUrl.startsWith("/")
                ? paymentUrl
                : `/${paymentUrl}`,
              window.location.origin,
            ).toString()
          : "";
      if (!normalizedUrl) throw new Error("Missing paymentUrl");
      window.location.href = normalizedUrl;
    } catch (err) {
      error.value = "Failed to create order";
    } finally {
      paying.value = false;
    }
  }

  /**
   * Payment success: always load paid order from backend via GET /api/orders/:id
   * (mock uses getOrderMock until VITE_USE_MOCK_API=false). Never trust Pinia here.
   */
  async function fetchOrderFromRoute(route) {
    try {
      loading.value = true;
      error.value = null;
      const orderId = route.query.orderId;
      if (!orderId) throw new Error("Missing orderId");
      order.value = await getOrder(orderId);
      store.clearPlan();
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load order";
    } finally {
      loading.value = false;
    }
  }

  const successPlan = computed(() => {
    if (!order.value?.plan) return null;
    const createdAt = order.value.createdAt ? dayjs(order.value.createdAt) : dayjs();
    return {
      ...order.value.plan,
      startDate: order.value.plan.startDate || createdAt.format("DD/MM/YYYY"),
      nextBillingDate:
        order.value.plan.nextBillingDate ||
        createdAt.add(1, "month").format("DD/MM/YYYY"),
    };
  });

  function clearPlan() {
    store.clearPlan();
  }

  return {
    loading,
    error,
    plans,
    order,
    selectedPlan,
    successPlan,
    paying,
    fetchPlans,
    ensureSelectedPlan,
    goToPaymentWithPlan,
    paySelectedPlan,
    fetchOrderFromRoute,
    clearPlan,
  };
}

