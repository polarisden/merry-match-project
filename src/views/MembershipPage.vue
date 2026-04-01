<template>
  <div class="h-[52px] w-full border-b">nav</div>
  <div
    class="bg-white w-full flex flex-col px-[16px] py-[40px] gap-[43px] lg:gap-[60px] lg:px-[160px] lg:pt-[80px] lg:pb-0"
  >
    <!-- Section: Membership header -->

    <header class="flex flex-col gap-[8px] lg:pb-[20px]">
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
    <!-- Section: Merry package card (skeleton mirrors card + heading) -->
    <section class="flex flex-col gap-[24px] w-full">
      <p v-if="error" class="body2 text-red-500">{{ error }}</p>
      <UserMerryPackageCardSkeleton v-if="loading" />
      <UserMerryPackageCard
        v-else-if="merryPackage"
        :merry-package="merryPackage"
      />
      <p v-else-if="!error" class="body2 text-gray-600">
        You don't have an active membership yet.
      </p>
    </section>

    <UserPaymentmethod />
  </div>
  <UserBillingHistory />

  <div class="h-[345px] w-full border-t">footer</div>
</template>

<script setup>
import UserMerryPackageCard from "../components/membership/UserMerryPackageCard.vue";
import UserMerryPackageCardSkeleton from "../components/membership/UserMerryPackageCardSkeleton.vue";
import { onMounted, ref } from "vue";
import { getCurrentMembership } from "../api/membershipApi";
import UserPaymentmethod from "../components/membership/UserPaymentmethod.vue";
import UserBillingHistory from "../components/membership/userBillingHistory.vue";

const desktopHeadingLines = [
  "Be part of Merry Membership",
  "to make more Merry!",
];
const mobileHeadingLines = ["Manage your", "membership", "and payment method"];

const loading = ref(false);
const error = ref("");
const merryPackage = ref(null);

onMounted(async () => {
  try {
    loading.value = true;
    error.value = "";
    merryPackage.value = await getCurrentMembership();
  } catch (e) {
    error.value = "Failed to load membership";
    merryPackage.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
