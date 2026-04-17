<template>
  <div class="flex flex-col gap-[24px]">
    <h4 class="headline4 text-gray-900">Merry Membership Package</h4>
    <article
      class="flex flex-col min-w-[343px] lg:w-full border border-gray-400 bg-linear rounded-[24px] p-[16px] lg:pt-[32px] lg:px-[32px] lg:pb-[24px] gap-[16px] lg:gap-[24px]"
    >
      <div
        class="flex flex-col lg:flex-row gap-[16px] lg:justify-between lg:pb-[40px] lg:border-b border-purple-300"
      >
        <div class="lg:flex flex-row gap-[24px] items-center">
          <div class="lg:flex lg:flex-row lg:gap-[16px] lg:items-center">
            <div class="flex flex-col items-end gap-[8px] relative">
              <span
                class="absolute lg:hidden py-[4px] px-[16px] bg-beige-200 rounded-full text-beige-600 body3"
                >{{ displayStatus }}</span
              >
            </div>
            <div
              class="flex justify-center items-center bg-gray-100 rounded-[16px] w-[60px] h-[60px]"
            >
              <img
                :src="merryPackage.icon"
                :alt="`${displayName} package icon`"
                class="h-[25.2px] w-[28.8px] object-contain"
              />
            </div>

            <div class="flex flex-col gap-[8px] lg:min-w-[225px] pt-[16px] lg-pt-0">
              <h3 class="headline3 text-white">{{ displayName }}</h3>
              <p
                class="flex flex-row justify-start items-baseline gap-[6px] text-purple-100"
              >
                <span class="body1">THB</span>
                <span class="body1">{{ formatPrice(merryPackage.price) }}</span>
                <span class="body2">/Month</span>
              </p>
            </div>
          </div>
          <ul
            class="flex flex-col pt-[8px] lg:pt-0 gap-[8px] list-none pb-[24px] lg:pb-0 border-b lg:border-0 border-purple-300"
          >
            <li
              v-for="(detail, detailIndex) in displayDetails"
              :key="`${rowKey}-detail-${detailIndex}`"
              class="body2 text-gray-800 flex items-center gap-[10px]"
            >
              <SuccessIcon class="w-[18px] h-[18px] text-purple-300 shrink-0" />
              <span class="text-purple-100">{{ detail }}</span>
            </li>
          </ul>
        </div>
        <div class="hidden lg:flex lg:flex-col lg:items-end gap-[8px]">
          <span
            class="py-[4px] px-[16px] bg-beige-200 rounded-full text-beige-600 body3"
            >{{ displayStatus }}</span
          >
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-[8px] lg:justify-between">
        <div class="flex flex-col gap-[8px] w-full lg:max-w-[420px]">
          <p class="flex flex-row justify-between gap-[16px]">
            <span class="body2 text-purple-200">Start Membership</span>
            <span class="body2 text-white lg:pl-[40px]">{{
              displayStartDate
            }}</span>
          </p>
          <p class="flex flex-row justify-between gap-[16px]">
            <span class="body2 text-purple-200">{{ scheduleRowLabel }}</span>
            <span
              class="body2 text-white text-end lg:pl-[40px] min-w-0 wrap-break-word"
            >
              {{ scheduleRowValue }}
            </span>
          </p>
        </div>

        <div
          class="flex lg:flex-col flex-row lg:flex-wrap justify-end lg:justify-center gap-[12px] border-t border-purple-300 lg:border-0 pt-[12px] lg:pt-0"
        >
          <BaseButtonGhost
            v-if="showResumeButton"
            class="w-fit [--btn-px:0px] [--btn-py:0px] [--btn-color:#FFFFFF]"
            :disabled="actionPending"
            @click="openResumeModal = true"
          >
            Resume auto renew
          </BaseButtonGhost>
          <BaseButtonGhost
            v-if="showCancelButton"
            class="w-fit [--btn-px:0px] [--btn-py:0px] [--btn-color:#FFFFFF]"
            :disabled="actionPending"
            @click="openCancelModal = true"
          >
            Auto-renew
          </BaseButtonGhost>
        </div>
      </div>
    </article>
    <ConfirmModal
      :open="openCancelModal"
      title="Cancel renewal"
      message="Do you sure to cancel Membership to get more Merry?"
      confirm-text="Yes, I want to cancel"
      cancel-text="No, I still want to be member"
      @close="openCancelModal = false"
      @confirm="handleConfirmCancel"
    />
    <ConfirmModal
      :open="openResumeModal"
      title="Resume membership"
      message="Do you sure to resume Membership to get more Merry?"
      confirm-text="Yes, I want to be Membership"
      cancel-text="No, I want to cancel"
      @close="openResumeModal = false"
      @confirm="handleConfirmResume"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import SuccessIcon from "@/assets/icons/success.svg";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";
import ConfirmModal from "../modals/ConfirmModal.vue";

const emit = defineEmits(["cancelPackage", "resumeRenewal"]);

const props = defineProps({
  merryPackage: {
    type: Object,
    required: true,
  },
  /** ขณะเรียก POST cancel / resume */
  actionPending: {
    type: Boolean,
    default: false,
  },
});

const displayName = computed(() => props.merryPackage.packageName ?? "");

const displayDetails = computed(() => {
  const raw = props.merryPackage.packageDetail;
  return Array.isArray(raw) ? raw : [];
});

const displayStatus = computed(() => props.merryPackage.status ?? "");

const displayStartDate = computed(() => props.merryPackage.startDate ?? "");

const displayNextBilling = computed(
  () => props.merryPackage.nextBillingDate ?? "",
);

const hasPendingPlanChange = computed(() => {
  const m = props.merryPackage;
  return Boolean(
    m?.pendingPlan &&
    (m.scheduledPlanChangeAt || m.scheduledPlanChangeAtDisplay),
  );
});

const pendingPlanLabel = computed(
  () => props.merryPackage?.pendingPlan?.name ?? "",
);

const scheduledChangeDisplay = computed(
  () =>
    props.merryPackage?.scheduledPlanChangeAtDisplay?.trim() ||
    props.merryPackage?.scheduledPlanChangeAt ||
    "",
);

const scheduleRowLabel = computed(() => {
  if (!hasPendingPlanChange.value) return "Next billing";
  const name = pendingPlanLabel.value.trim();
  return name ? `Plan changes to ${name}*` : "Plan changes";
});

const scheduleRowValue = computed(() => {
  if (!hasPendingPlanChange.value) return displayNextBilling.value;
  const when = String(scheduledChangeDisplay.value).trim();
  return when || "—";
});

const rowKey = computed(
  () => props.merryPackage.id ?? props.merryPackage.planId ?? "package",
);

const formatPrice = (satang) => Number(satang / 100).toFixed(2);

const isActiveSubscription = computed(
  () =>
    String(props.merryPackage.subscriptionStatusRaw ?? "").toUpperCase() ===
    "ACTIVE",
);

const showCancelButton = computed(
  () => isActiveSubscription.value && props.merryPackage.autoRenew === true,
);

const showResumeButton = computed(
  () => isActiveSubscription.value && props.merryPackage.autoRenew === false,
);

const accessUntilLabel = computed(
  () => props.merryPackage.cancelAtDisplay || displayNextBilling.value || "—",
);

const openCancelModal = ref(false);
const openResumeModal = ref(false);

function handleConfirmCancel() {
  openCancelModal.value = false;
  emit("cancelPackage");
}

function handleConfirmResume() {
  openResumeModal.value = false;
  emit("resumeRenewal");
}
</script>
