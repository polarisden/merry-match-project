<template>
  <div
    class="flex flex-col lg:flex-row gap-[20px] lg:gap-[22px] lg:justify-center lg:py-[80px] lg:px-0"
  >
    <!--
      Initial plan load:
      - First purchase: summary skeleton + card skeleton (final layout is summary | card).
      - Plan change: summary skeleton + preview skeleton only — type (upgrade/downgrade) is unknown
        until preview API returns; showing a card skeleton here would flash wrongly for downgrade.
    -->
    <template v-if="loading">
      <div
        class="flex flex-col gap-[20px] w-full lg:w-auto lg:min-w-0 lg:max-w-[358px]"
      >
        <PaymentSummarySkeleton />
        <div v-if="isSubscriptionChange" class="lg:hidden w-full">
          <PaymentPlanChangePreviewSkeleton />
        </div>
      </div>
      <PaymentCreditCardSkeleton v-if="!isSubscriptionChange" />
      <section
        v-else
        class="hidden lg:flex lg:w-[350px] shrink-0 flex-col justify-center pt-[40px] gap-[12px]"
        aria-busy="true"
      >
        <PaymentPlanChangePreviewSkeleton />
      </section>
    </template>

    <template v-else-if="merryPlan">
      <div
        class="flex flex-col gap-[20px] w-full lg:w-auto lg:min-w-0 lg:max-w-[358px]"
      >
        <PaymentSummary :merry-plan="merryPlan" />

        <div
          v-if="isSubscriptionChange && subscriptionChangePreviewLoading"
          class="lg:hidden w-full"
          aria-live="polite"
          aria-busy="true"
        >
          <PaymentPlanChangePreviewSkeleton />
        </div>

        <section
          v-if="isSubscriptionChange && planChangePreview"
          class="flex flex-col border border-gray-400 bg-white lg:rounded-[16px] px-[24px] py-[16px] gap-[8px]"
          :class="{ 'lg:hidden': planChangePreview?.changeType === 'DOWNGRADE' }"
          aria-live="polite"
        >
          <template v-if="planChangePreview.changeType === 'UPGRADE'">
            <p class="body2 text-gray-700">Full charge today</p>
            <p class="headline4 text-gray-900">THB {{ chargeTodayThb }}</p>
            <p class="body2 text-gray-600">Your plan switches immediately after payment.</p>
          </template>
          <template v-else-if="planChangePreview.changeType === 'DOWNGRADE'">
            <p class="body2 text-gray-700">
              Plan change at end of billing period
            </p>
            <p class="body2 text-gray-600">
              Your downgrade will be scheduled and applied at period end.
            </p>
          </template>
          <template v-else-if="planChangePreview.changeType === 'SAME'">
            <p class="body2 text-gray-700">
              This is already your current plan.
            </p>
          </template>
          <template
            v-if="
              isSubscriptionChange &&
              planChangePreview &&
              planChangePreview.changeType !== 'SAME'
            "
          >
            <p class="body2 text-gray-600">
              Banked from current plan: {{ bankedDaysFromCurrentLabel }}
            </p>
            <p class="body2 text-gray-600">
              Available on target plan: {{ bankedDaysOnTargetLabel }}
            </p>
          </template>
        </section>

        <div
          v-if="
            isSubscriptionChange &&
            planChangePreview?.changeType === 'DOWNGRADE' &&
            !subscriptionChangePreviewLoading
          "
          class="flex flex-col gap-[12px]  bg-white px-[24px] lg:px-0 py-[24px]"
          :class="{ 'lg:hidden': planChangePreview?.changeType === 'DOWNGRADE' }"
        >
          <div class="flex flex-row justify-between gap-[12px]">
            <BaseButtonGhost
              type="button"
              class="w-fit [--btn-px:0px] ml-[25px] lg:ml-[45px]"
              :disabled="planChangeBusy"
              @click="goHome"
            >
              Cancel
            </BaseButtonGhost>
            <BaseButtonPrimary
              type="button"
              class="w-fit"
              :disabled="planChangeBusy"
              @click="handleDowngrade"
            >
              {{ planChangeBusy ? "Processing..." : "Confirm downgrade" }}
            </BaseButtonPrimary>
          </div>
        </div>

        <div
          v-if="
            isSubscriptionChange &&
            planChangePreview?.changeType === 'SAME' &&
            !subscriptionChangePreviewLoading
          "
          class="flex flex-col"
        >
          <BaseButtonPrimary type="button" class="w-fit" @click="goHome">
            Back to plans
          </BaseButtonPrimary>
        </div>
      </div>

      <section
        v-if="showCreditCardSection"
        class="w-full lg:w-[548px] shrink-0 flex flex-col gap-[8px]"
      >
        <PaymentCreditCard
          ref="creditCardRef"
          :loading="loading"
          :paying="paying || planChangeBusy"
          :submit-label="creditCardSubmitLabel"
          @pay="handlePay"
          @cancel="goHome"
        />
        <p
          v-for="(msg, idx) in inlineErrors"
          :key="`inline-payment-error-${idx}`"
          class="body2 text-red-600 px-[4px]"
          role="alert"
          aria-live="assertive"
        >
          * {{ msg }}
        </p>
      </section>

      <section
        v-if="isSubscriptionChange && subscriptionChangePreviewLoading"
        class="hidden lg:flex lg:w-[350px] shrink-0 flex-col justify-center pt-[40px] gap-[12px]"
        aria-live="polite"
        aria-busy="true"
      >
        <PaymentPlanChangePreviewSkeleton />
      </section>

      <section
        v-if="
          isSubscriptionChange &&
          planChangePreview?.changeType === 'DOWNGRADE' &&
          !subscriptionChangePreviewLoading
        "
        class="hidden lg:flex lg:w-[350px]  shrink-0 flex-col justify-center pt-[40px] gap-[12px]"
      >
        <section
          class="flex flex-col border border-gray-400 bg-white rounded-[16px] px-[24px] py-[16px] gap-[8px]"
          aria-live="polite"
        >
          <p class="body2 text-gray-700">Plan change at end of billing period</p>
          <p class="body2 text-gray-600">
            Your downgrade will be scheduled and applied at period end.
          </p>
          <p class="body2 text-gray-600">
            Banked from current plan: {{ bankedDaysFromCurrentLabel }}
          </p>
          <p class="body2 text-gray-600">
            Available on target plan: {{ bankedDaysOnTargetLabel }}
          </p>
        </section>

        <div class="flex flex-col bg-white px-[24px] py-[24px]">
          <div class="flex flex-row justify-between gap-[12px]">
            <BaseButtonGhost
              type="button"
              class="w-fit [--btn-px:0px]"
              :disabled="planChangeBusy"
              @click="goHome"
            >
              Cancel
            </BaseButtonGhost>
            <BaseButtonPrimary
              type="button"
              class="w-fit"
              :disabled="planChangeBusy"
              @click="handleDowngrade"
            >
              {{ planChangeBusy ? "Processing..." : "Confirm downgrade" }}
            </BaseButtonPrimary>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import PaymentCreditCard from "../components/payment/PaymentCreditCard.vue";
import PaymentSummary from "../components/payment/PaymentSummary.vue";
import PaymentSummarySkeleton from "../components/payment/PaymentSummarySkeleton.vue";
import PaymentCreditCardSkeleton from "../components/payment/PaymentCreditCardSkeleton.vue";
import PaymentPlanChangePreviewSkeleton from "../components/payment/PaymentPlanChangePreviewSkeleton.vue";
import BaseButtonPrimary from "../components/base/BaseButtonPrimary.vue";
import BaseButtonGhost from "../components/base/BaseButtonGhost.vue";
import { useRoute, useRouter } from "vue-router";
import { usePlan } from "../composables/usePlan";
import { ensureOmise, createOmiseCardToken } from "../composables/useOmise";
import {
  previewPlanChange,
  upgradePlanChange,
  downgradePlanChange,
} from "../api/subscriptionPlanChangeApi";
import {
  planChangeErrorMessage,
  pollMembershipUntilPlanMatches,
} from "../composables/useSubscriptionPlanChange";

const route = useRoute();
const router = useRouter();
const creditCardRef = ref(null);
const cardError = ref("");
const planChangeError = ref("");
const subscriptionChangePreviewLoading = ref(false);
const planChangeBusy = ref(false);
const planChangePreview = ref(null);

const {
  loading,
  error,
  selectedPlan: merryPlan,
  paying,
  ensureSelectedPlan,
  paySelectedPlan,
} = usePlan();

const isSubscriptionChange = computed(
  () => route.query.subscriptionChange === "1",
);

const chargeTodayThb = computed(() => {
  const s = planChangePreview.value?.chargeAmountSatang;
  if (s == null) return "—";
  return (Number(s) / 100).toFixed(2);
});

function formatDaysLabel(raw) {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n <= 0) return "0 days";
  return `${Math.floor(n)} days`;
}

const bankedDaysFromCurrentLabel = computed(() =>
  formatDaysLabel(planChangePreview.value?.bankedDaysFromCurrentPlan),
);

const bankedDaysOnTargetLabel = computed(() =>
  formatDaysLabel(planChangePreview.value?.bankedDaysAvailableOnTargetPlan),
);

const showCreditCardSection = computed(() => {
  if (!merryPlan.value) return false;
  if (!isSubscriptionChange.value) return true;
  if (subscriptionChangePreviewLoading.value) return false;
  return planChangePreview.value?.changeType === "UPGRADE";
});

const creditCardSubmitLabel = computed(() =>
  isSubscriptionChange.value ? "Confirm upgrade" : "",
);

//ตอนนี้แหล่ง error มาจาก 3 ตัวใน PaymentPage คือ 
// error (จาก usePlan), 
// cardError (validation/token), 
// planChangeError (upgrade/downgrade API)

const inlineErrors = computed(() =>
  [error.value, planChangeError.value].filter(
    (msg) => typeof msg === "string" && msg.trim() !== "",
  ),
);

function applyCardErrorToField(message) {
  const msg = String(message ?? "");
  const lower = msg.toLowerCase();
  if (
    lower.includes("expiration date cannot be in the past") ||
    lower.includes("expiration")
  ) {
    creditCardRef.value?.setExternalFieldError?.("expiryDate", msg);
    return true;
  }
  return false;
}

function resetSubmitErrors() {
  error.value = null;
  cardError.value = "";
  planChangeError.value = "";
  creditCardRef.value?.clearExternalFieldErrors?.();
}

onMounted(async () => {
  await ensureSelectedPlan(route);
  try {
    await ensureOmise();
  } catch {
    cardError.value = "Failed to load payment SDK";
  }

  if (isSubscriptionChange.value && merryPlan.value?.id) {
    subscriptionChangePreviewLoading.value = true;
    planChangeError.value = "";
    try {
      planChangePreview.value = await previewPlanChange(
        String(merryPlan.value.id),
      );
    } catch (e) {
      planChangeError.value = planChangeErrorMessage(e);
    } finally {
      subscriptionChangePreviewLoading.value = false;
    }
  }
});

async function handlePay() {
  resetSubmitErrors();

  if (
    isSubscriptionChange.value &&
    planChangePreview.value?.changeType === "UPGRADE"
  ) {
    const card = creditCardRef.value?.getCardPayload?.();
    if (!card) {
      return;
    }
    planChangeBusy.value = true;
    try {
      await ensureOmise();
      const { id: omiseToken } = await createOmiseCardToken(card);
      const res = await upgradePlanChange(
        String(merryPlan.value.id),
        omiseToken,
      );
      if (res.authorizeUri) {
        window.location.href = res.authorizeUri;
        return;
      }
      const st = String(res.status ?? "").toLowerCase();
      if (st === "failed" || st === "failure") {
        planChangeError.value = "Payment failed";
        return;
      }
      if (st === "paid" || st === "pending" || st === "") {
        await pollMembershipUntilPlanMatches(String(merryPlan.value.id));
        const q = {
          planId: String(merryPlan.value.id),
        };
        if (res.subscriptionId) q.subscriptionId = String(res.subscriptionId);
        if (res.chargeId) q.chargeId = String(res.chargeId);
        await router.push({
          name: "merry-plan-payment-success",
          query: q,
        });
        return;
      }
      planChangeError.value = `Unexpected status: ${res.status ?? "unknown"}`;
    } catch (e) {
      const msg = planChangeErrorMessage(e);
      if (!applyCardErrorToField(msg)) {
        planChangeError.value = msg;
      }
    } finally {
      planChangeBusy.value = false;
    }
    return;
  }

  const card = creditCardRef.value?.getCardPayload?.();
  if (!card) {
    return;
  }

  try {
    await ensureOmise();
    const { id: omiseToken } = await createOmiseCardToken(card);
    await paySelectedPlan({ omiseToken });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment failed";
    if (!applyCardErrorToField(msg)) {
      cardError.value = msg;
    }
  }
}

async function handleDowngrade() {
  if (!merryPlan.value?.id) return;
  planChangeBusy.value = true;
  planChangeError.value = "";
  try {
    await downgradePlanChange(String(merryPlan.value.id));
    await router.push({ name: "merry-plan" });
  } catch (e) {
    planChangeError.value = planChangeErrorMessage(e);
  } finally {
    planChangeBusy.value = false;
  }
}

function goHome() {
  router.push({ name: "merry-plan" });
}
</script>
