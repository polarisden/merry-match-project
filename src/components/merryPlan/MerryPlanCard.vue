<template>
  <article
    class="relative flex flex-col w-full lg:w-[357px] border border-gray-400 bg-bg-main rounded-[24px]  hover:border-purple-500 lg:justify-between p-[16px] lg:p-[40px]"
  >
    <div class="flex flex-col gap-[16px] lg:gap-[24px]">
      <template v-if="loading">
        <MerryPlanCardSkeleton />
      </template>

      <template v-else>
        <div v-if="isCurrent" class="absolute right-[16px] top-[16px]">
          <span
            class="py-[4px] px-[12px] bg-beige-200 rounded-full text-beige-600 body3"
          >
            Current plan
          </span>
        </div>
        <div
          class="flex justify-center items-center bg-gray-100 rounded-[16px] w-[60px] h-[60px]"
        >
          <img
            :src="merryPlan.icon_url"
            :alt="`${merryPlan.name} plan icon`"
            class="h-[25.2px] w-[28.8px] object-contain"
          />
        </div>
        <div class="flex flex-col gap-[8px]">
          <h3 class="headline3 text-purple-800">
            {{ merryPlan.name }}
          </h3>
          <p class="flex flex-row justify-start items-baseline gap-[6px]">
            <span class="body1 text-gray-900">THB</span>
            <span class="body1 text-gray-900">{{
              formatPriceBaht(merryPlan)
            }}</span>
            <span class="body2 text-gray-600">/Month</span>
          </p>
        </div>
        <ul
          class="flex flex-col gap-[8px] list-none pb-[24px]"
        >
          <li
            v-for="(detail, detailIndex) in merryPlan.planDetail ?? []"
            :key="`${merryPlan.id}-detail-${detailIndex}`"
            class="body2 text-gray-800 flex items-start gap-[10px]"
          >
            <SuccessIcon
              class="w-[18px] h-[18px] text-purple-400 shrink-0 mt-[3px]"
            />
            <span class="min-w-0 whitespace-normal wrap-break-word">{{
              detail
            }}</span>
          </li>
        </ul>
      </template>
    </div>
    <div class="flex flex-col w-full pt-[16px] border-t border-gray-300">
    <BaseButtonSecondary :disabled="loading || isCurrent" @click="onSelect">
      {{ isCurrent ? "Current plan" : "Choose Plan" }}
    </BaseButtonSecondary>
  </div>
  </article>
</template>

<script setup>
import BaseButtonSecondary from "../base/BaseButtonSecondary.vue";
import SuccessIcon from "@/assets/icons/success.svg";
import MerryPlanCardSkeleton from "./MerryPlanCardSkeleton.vue";

const emit = defineEmits(["select"]);

const props = defineProps({
  /** โหมดโหลด — แสดง skeleton ภายในการ์ด (แบบ userBillingHistory + UserBillingHistorySkeleton) */
  loading: {
    type: Boolean,
    default: false,
  },
  merryPlan: {
    type: Object,
    default: null,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
});

/**
 * planApi: plans use `priceSatang` (integer satang). Legacy `price` in THB is supported as fallback.
 */
function formatPriceBaht(plan) {
  if (!plan) return "error plan please try again";
  if (plan.priceSatang != null && plan.priceSatang !== "") {
    return (Number(plan.priceSatang) / 100).toFixed(2);
  }
  if (plan.price != null && plan.price !== "") {
    return Number(plan.price).toFixed(2);
  }
  return "error price please try again";
}

function onSelect() {
  if (props.loading || !props.merryPlan) return;
  emit("select", props.merryPlan);
}
</script>
