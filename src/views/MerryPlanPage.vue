<template>
  <div
    class="bg-bg-main w-full flex flex-col px-[16px] py-[40px] gap-[43px] lg:px-[160px] lg:pt-[80px] lg:pb-[160px] lg:gap-[80px]"
  >
    <header class="flex flex-col gap-[8px]">
      <p class="tagline text-beige-700">MERRY MEMBERSHIP</p>
      <h2
        v-for="(line, index) in desktopHeadingLines"
        :key="`desktop-${index}`"
        class="headline2 text-purple-500 hidden lg:block"
      >
        {{ line }}
      </h2>
      <h2
        v-for="(line, index) in mobileHeadingLines"
        :key="`mobile-${index}`"
        class="headline3 text-purple-500 block lg:hidden"
      >
        {{ line }}
      </h2>
    </header>

    <div
      class="flex w-full min-w-0 flex-col gap-[24px] lg:flex-row lg:flex-wrap lg:content-start"
    >
      <template v-if="loading">
        <MerryPlanCard
          v-for="n in PACKAGE_LOADING_PLACEHOLDERS"
          :key="`plan-loading-${n}`"
          loading
        />
      </template>
      <template v-else>
        <MerryPlanCard
          v-for="merryPlan in merryPlans"
          :key="merryPlan.id"
          :merry-plan="merryPlan"
          :is-current="
            currentPlanId !== null && String(merryPlan.id) === currentPlanId
          "
          :pending-plan-id="pendingPlanId"
          :scheduled-plan-change-display="scheduledPlanChangeDisplay"
          @select="handleSelectPlan"
        />
      </template>
    </div>
    <p v-if="error" class="body2 text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
import MerryPlanCard from "../components/merryPlan/MerryPlanCard.vue";
import { computed, onMounted, ref } from "vue";
import { usePlan } from "../composables/usePlan";
import { getCurrentMembership } from "../api/membershipApi";

const desktopHeadingLines = [
  "Be part of Merry Membership",
  "to make more Merry!",
];
const mobileHeadingLines = ["Join us and start", "matching"];

const PACKAGE_LOADING_PLACEHOLDERS = Array.from({ length: 4 }, (_, i) => i);

const { plans: merryPlans, loading, error, fetchPlans, goToPaymentWithPlan } =
  usePlan();

const membership = ref(null);
const currentPlanId = computed(() => {
  const m = membership.value;
  const id = m?.planId ?? m?.plan?.id;
  if (id == null || id === "") return null;
  return String(id);
});

const pendingPlanId = computed(() => {
  const id = membership.value?.pendingPlan?.id;
  if (id == null || id === "") return "";
  return String(id);
});

const scheduledPlanChangeDisplay = computed(
  () => membership.value?.scheduledPlanChangeAtDisplay?.trim() ?? "",
);

function handleSelectPlan(merryPlan) {
  if (!merryPlan) return;
  if (
    pendingPlanId.value !== "" &&
    String(merryPlan.id) === pendingPlanId.value
  ) {
    return;
  }
  if (currentPlanId.value == null) {
    goToPaymentWithPlan(merryPlan);
    return;
  }
  if (String(merryPlan.id) === currentPlanId.value) {
    return;
  }
  goToPaymentWithPlan(merryPlan, { subscriptionChange: true });
}

onMounted(async () => {
  await Promise.all([
    fetchPlans(),
    (async () => {
      try {
        membership.value = await getCurrentMembership();
      } catch {
        membership.value = null;
      }
    })(),
  ]);
});
</script>
