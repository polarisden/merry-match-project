<template>
  <div
    class="flex flex-col mt-[52px] lg:flex-row gap-[20px] lg:gap-[22px] lg:justify-center lg:pt-[80px]"
  >
    <p v-if="error" class="body2 text-red-500 px-[24px] py-[12px]">
      {{ error }}
    </p>
    <p v-if="cardError" class="body2 text-red-500 px-[24px] py-[12px]">
      {{ cardError }}
    </p>
    <!-- Section: Merry Membership summary -->
    <PaymentSummarySkeleton v-if="loading" />
    <PaymentSummary v-else-if="merryPlan" :merry-plan="merryPlan" />
    <!-- Section: Credit card -->
    <PaymentCreditCard
      ref="creditCardRef"
      :loading="loading"
      :paying="paying"
      @pay="handlePay"
      @cancel="goHome"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PaymentCreditCard from "../components/payment/PaymentCreditCard.vue";
import PaymentSummary from "../components/payment/PaymentSummary.vue";
import PaymentSummarySkeleton from "../components/payment/PaymentSummarySkeleton.vue";
import { useRoute, useRouter } from "vue-router";
import { usePlan } from "../composables/usePlan";
import { ensureOmise, createOmiseCardToken } from "../composables/useOmise";

const route = useRoute();
const router = useRouter();
const creditCardRef = ref(null);
const cardError = ref("");

const {
  loading,
  error,
  selectedPlan: merryPlan,
  paying,
  ensureSelectedPlan,
  paySelectedPlan,
} = usePlan();

onMounted(async () => {
  await ensureSelectedPlan(route);
  try {
    await ensureOmise();
  } catch {
    cardError.value = "Failed to load payment SDK";
  }
});

async function handlePay() {
  cardError.value = "";
  const card = creditCardRef.value?.getCardPayload?.();
  if (!card) {
    cardError.value = "Please fill in all card fields (MM/YY for expiry)";
    return;
  }

  try {
    await ensureOmise();
    const { id: omiseToken } = await createOmiseCardToken(card);
    await paySelectedPlan({ omiseToken });
  } catch (e) {
    cardError.value = e instanceof Error ? e.message : "Payment failed";
  }
}

function goHome() {
  router.push("/merry-plan");
}
</script>
