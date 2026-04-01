<template>
  <div class="h-[52px] lg:h-[88px] w-full border-b">nav</div>
  <div class="flex flex-col  lg:flex lg:flex-row bg-white lg:bg-bg-main lg:justify-center">
    <div
      class="bg-white lg:bg-bg-main w-full lg:w-fit flex flex-col lg:items-center mb-[88px] px-[16px] py-[40px] gap-[43px] lg:pl-0 lg:pt-[118px] lg:pb-[160px] lg:gap-[80px]"
    >
      <!-- Section: Membership header -->

      <header class="flex flex-col gap-[8px]">
        <SuccessIcon class="w-[80px] h-[80px] text-purple-200 shrink-0" />
        <p class="tagline text-beige-700 lg:mt-[32px]">PAYMENT SUCCESS</p>
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
      <!-- Section:merry plan card-->
      <main class="flex flex-col gap-[24px] lg:hidden">
        <MerryPlanCardSucess
          :loading="loading"
          :error="error || ''"
          :merry-plan="merryPlan"
        />
      </main>

      <!-- Section: button -->
      <div
        class="flex flex-row gap-[16px] w-full justify-between lg:justify-start"
      >
        <BaseButtonSecondary @click="goHome">Back to home</BaseButtonSecondary>
        <BaseButtonPrimary class="[--btn-px:17.5px]" @click="goMembership">
          Check Membership
        </BaseButtonPrimary>
      </div>
    </div>
    <div class="hidden lg:flex lg:flex-col gap-[24px] mt-[88px] ml-[114px]">
      <MerryPlanCardSucess
        :loading="loading"
        :error="error || ''"
        :merry-plan="merryPlan"
      />
    </div>
  </div>
  <div class="h-[345px] w-full border-t">footer</div>
</template>

<script setup>
/**
 * Loads the paid order via usePlan → getOrder() (real: GET /api/orders/:id).
 * Set VITE_USE_MOCK_API=false when backend is ready; mock persists orders in localStorage until then.
 */
import SuccessIcon from "@/assets/icons/success.svg";
import BaseButtonPrimary from "../components/base/BaseButtonPrimary.vue";
import BaseButtonSecondary from "../components/base/BaseButtonSecondary.vue";
import MerryPlanCardSucess from "../components/merryPlan/MerryPlanCardSuccess.vue";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";
import { usePlan } from "../composables/usePlan";

const route = useRoute();
const router = useRouter();

const desktopHeadingLines = [
  "Welcom Merry Membership!",
  " Thank you for joining us",
];
const mobileHeadingLines = [
  "Welcom Merry",
  "Membership!",
  "Thank you for",
  "joining us",
];

const { loading, error, successPlan: merryPlan, fetchOrderFromRoute } = usePlan();

onMounted(async () => {
  await fetchOrderFromRoute(route);
});

function goHome() {
  router.push("/");
}

function goMembership() {
  router.push("/membership");
}
</script>
