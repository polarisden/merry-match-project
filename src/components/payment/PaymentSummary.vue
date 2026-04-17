<template>
  <section
    class="flex flex-col border-b border-gray-400 bg-gray-100 pt-[32px] px-[24px] pb-[16px] gap-[16px] lg:border lg:rounded-[24px] lg:w-[358px] lg:h-fit"
  >
    <header class="flex flex-row gap-[12px]">
      <PlanIcon class="w-[24px] h-[24px] text-red-200 shrink-0" />
      <span class="body1 text-gray-700">Merry Membership</span>
    </header>

    <div>
      <div class="flex flex-row justify-between py-[8px]">
        <span class="body2 text-gray-700">Plan</span>
        <span class="body1 text-gray-900">{{ merryPlan.name }}</span>
      </div>

      <ul class="flex flex-col bg-white py-[10px] px-[8px] gap-[6px] rounded-[8px]">
        <li
          v-for="(detail, detailIndex) in merryPlan.planDetail"
          :key="`${merryPlan.id}-detail-${detailIndex}`"
          class="body2 text-gray-800 flex items-center gap-[8px]"
        >
          <span class="h-[4px] w-[4px] rounded-full bg-gray-800 shrink-0"></span>
          <span>{{ detail }}</span>
        </li>
      </ul>

      <div class="flex flex-row justify-between py-[24px]">
        <span class="body2 text-gray-700">Price (Monthly)</span>
        <span class="body1 text-gray-900">THB {{ formatPrice(merryPlan.priceSatang) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import PlanIcon from "@/assets/icons/package.svg";

defineProps({
  merryPlan: {
    type: Object,
    required: true,
  },
});

const formatPrice = (satang) => Number(satang/100).toFixed(2);
</script>

