<template>
  <article
    class="flex flex-col w-[343px] lg:w-[357px] border border-gray-400 bg-linear rounded-[24px] p-[16px] lg:p-[40px] gap-[16px] lg:gap-[24px]"
  >
    <template v-if="loading">
      <div class="w-[60px] h-[60px] rounded-[16px] bg-gray-200 animate-pulse"></div>
      <div class="flex flex-col gap-[8px]">
        <div class="h-[32px] w-[55%] rounded bg-gray-200 animate-pulse"></div>
        <div class="h-[24px] w-[45%] rounded bg-gray-200 animate-pulse"></div>
      </div>
      <ul class="flex flex-col gap-[8px] list-none pb-[24px] border-b border-gray-300">
        <li v-for="n in 2" :key="`skeleton-detail-${n}`" class="flex items-center gap-[10px]">
          <div class="w-[18px] h-[18px] rounded-full bg-gray-200 animate-pulse"></div>
          <div class="h-[18px] w-[70%] rounded bg-gray-200 animate-pulse"></div>
        </li>
      </ul>
      <div class="flex flex-col gap-[8px]">
        <div class="h-[18px] w-[70%] rounded bg-gray-200 animate-pulse"></div>
        <div class="h-[18px] w-[70%] rounded bg-gray-200 animate-pulse"></div>
      </div>
    </template>
    <template v-else-if="error">
      <p class="body2 text-red-500">{{ error }}</p>
    </template>
    <template v-else-if="!merryPlan">
      <p class="body2 text-red-500">Order data not found.</p>
    </template>
    <template v-else>
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
        <h3 class="headline3 text-white">{{ merryPlan.name }}</h3>
        <p class="flex flex-row justify-start items-baseline gap-[6px] text-purple-100">
          <span class="body1">THB</span>
          <span class="body1">{{ formatPrice(merryPlan.priceSatang) }}</span>
          <span class="body2">/Month</span>
        </p>
      </div>

      <ul class="flex flex-col gap-[8px] list-none pb-[24px] border-b border-gray-300">
        <li
          v-for="(detail, detailIndex) in merryPlan.planDetail"
          :key="`${merryPlan.id}-detail-${detailIndex}`"
          class="body2 text-gray-800 flex items-center gap-[10px]"
        >
          <SuccessIcon class="w-[18px] h-[18px] text-purple-300 shrink-0" />
          <span class="text-purple-100">{{ detail }}</span>
        </li>
      </ul>

      <div>
        <p class="flex flex-row justify-between">
          <span class="body2 text-purple-200">Start Membership</span>
          <span class="body2 text-white">{{ merryPlan.startDate }}</span>
        </p>
        <p class="flex flex-row justify-between">
          <span class="body2 text-purple-200">Next billing</span>
          <span class="body2 text-white">{{ merryPlan.nextBillingDate }}</span>
        </p>
      </div>
    </template>
  </article>
</template>

<script setup>
import SuccessIcon from "@/assets/icons/success.svg";

defineProps({
  merryPlan: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const formatPrice = (satang) => Number(satang/100).toFixed(2);
</script>
