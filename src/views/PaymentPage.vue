<template>
  <div class="flex flex-col mt-[52px] lg:flex-row gap-[20px] lg:gap-[22px] lg:justify-center lg:pt-[80px]">
    <p v-if="error" class="body2 text-red-500 px-[24px] py-[12px]">{{ error }}</p>
    <!-- Section: Merry Membership summary -->
    <PaymentSummarySkeleton v-if="loading" />
    <PaymentSummary v-else-if="merryPlan" :merry-plan="merryPlan" />
    <!-- Section: Credit card -->
    <PaymentCreditCard
      :loading="loading"
      :paying="paying"
      @pay="handlePay"
      @cancel="goHome"
    />


  </div>
</template>

<script setup>
import PaymentCreditCard from "../components/payment/PaymentCreditCard.vue";
import PaymentSummary from "../components/payment/PaymentSummary.vue";
import PaymentSummarySkeleton from "../components/payment/PaymentSummarySkeleton.vue";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";
import { usePlan } from "../composables/usePlan";

const route = useRoute();
const router = useRouter();
const {
  loading,
  error,
  selectedPlan: merryPlan,
  paying,
  ensureSelectedPlan,
  paySelectedPlan,
} = usePlan();

// get plan information from data base
onMounted(async () => {
  await ensureSelectedPlan(route);
});

// for create order to data base and payment form omise
async function handlePay() {
  await paySelectedPlan();
}

function goHome() {
  router.push("/merry-plan");
}
</script>
