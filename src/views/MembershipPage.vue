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
        :action-pending="lifecyclePending"
        @cancel-package="handleCancelSubscription"
        @resume-renewal="handleResumeSubscription"
      />

      <p v-else-if="!error" class="body2 text-gray-600">
        You don't have an active membership yet.
      </p>
    </section>
    <PendingPlanChangeBanner
      :merry-package="merryPackage"
      :action-pending="downgradeCancelPending"
      @cancel-pending-plan-change="handleCancelPendingDowngrade"
    />

    <UserPaymentmethod
      :loading="loading"
      :error="error"
      :payment-card="merryPackage?.paymentCard ?? null"
      :can-edit-payment-method="canEditPaymentMethod"
      @handle-edit-payment-method="updatePaymentModalOpen = true"
    />
    <UpdatePaymentMethodModal
      :open="updatePaymentModalOpen"
      @close="updatePaymentModalOpen = false"
      @updated="onPaymentMethodUpdated"
    />
  </div>
  <UserBillingHistory
    :next-billing-date="merryPackage?.nextBillingDate ?? ''"
  />

  <div class="h-[345px] w-full border-t">footer</div>
</template>

<script setup>
import PendingPlanChangeBanner from "../components/membership/PendingPlanChangeBanner.vue";
import UserMerryPackageCard from "../components/membership/UserMerryPackageCard.vue";
import UserMerryPackageCardSkeleton from "../components/membership/UserMerryPackageCardSkeleton.vue";
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { getCurrentMembership } from "../api/membershipApi";
import {
  cancelSubscription,
  resumeSubscription,
} from "../api/subscriptionLifecycleApi";
import { cancelDowngradePlanChange } from "../api/subscriptionPlanChangeApi";
import UserPaymentmethod from "../components/membership/UserPaymentmethod.vue";
import UserBillingHistory from "../components/membership/userBillingHistory.vue";
import UpdatePaymentMethodModal from "../components/modals/UpdatePaymentMethodModal.vue";

const desktopHeadingLines = [
  "Be part of Merry Membership",
  "to make more Merry!",
];
const mobileHeadingLines = ["Manage your", "membership", "and payment method"];

const loading = ref(false);
const error = ref("");
const merryPackage = ref(null);
const lifecyclePending = ref(false);
const downgradeCancelPending = ref(false);
const updatePaymentModalOpen = ref(false);

const canEditPaymentMethod = computed(() => {
  const m = merryPackage.value;
  if (!m) return false;
  const active =
    String(m.subscriptionStatusRaw ?? "").toUpperCase() === "ACTIVE";
  const c = m.paymentCard;
  const hasCard =
    c &&
    typeof c === "object" &&
    (String(c.last4 ?? "").trim() !== "" ||
      String(c.brand ?? "").trim() !== "");
  return active && hasCard;
});

function lifecycleErrorMessage(err) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    const msg =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.error ||
      data?.detail ||
      err.message;
    return typeof msg === "string" ? msg : "Request failed";
  }
  return err instanceof Error ? err.message : "Request failed";
}

async function handleCancelSubscription() {
  lifecyclePending.value = true;
  error.value = "";
  try {
    await cancelSubscription();
    merryPackage.value = await getCurrentMembership();
  } catch (e) {
    error.value = lifecycleErrorMessage(e);
  } finally {
    lifecyclePending.value = false;
  }
}

async function handleResumeSubscription() {
  lifecyclePending.value = true;
  error.value = "";
  try {
    await resumeSubscription();
    merryPackage.value = await getCurrentMembership();
  } catch (e) {
    error.value = lifecycleErrorMessage(e);
  } finally {
    lifecyclePending.value = false;
  }
}

async function handleCancelPendingDowngrade() {
  downgradeCancelPending.value = true;
  error.value = "";
  try {
    await cancelDowngradePlanChange();
    merryPackage.value = await getCurrentMembership();
  } catch (e) {
    error.value = lifecycleErrorMessage(e);
  } finally {
    downgradeCancelPending.value = false;
  }
}

async function onPaymentMethodUpdated() {
  try {
    merryPackage.value = await getCurrentMembership();
  } catch {
    /* snapshot จาก API ล่าสุดยังใช้ได้ */
  }
}

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
