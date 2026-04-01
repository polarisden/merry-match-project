<template>
    <div class="flex flex-col gap-[24px]">
      <h4 class="headline4 text-gray-900">Merry Membership Package</h4>
  <article
    class="flex flex-col min-w-[343px] lg:w-full border border-gray-400 bg-linear rounded-[24px] p-[16px] lg:pt-[32px] lg:px-[32px] lg:pb-[24px] gap-[16px] lg:gap-[24px]"
  >
    <div class="flex flex-col lg:flex-row gap-[16px] lg:justify-between lg:pb-[40px] lg:border-b border-purple-300">
      <div class="lg:flex flex-row gap-[24px] items-center">
        <div class="lg:flex lg:flex-row lg:gap-[16px] lg:items-center">
          <div
            class="flex justify-center items-center bg-gray-100 rounded-[16px] w-[60px] h-[60px]"
          >
            <img
              :src="merryPackage.icon"
              :alt="`${merryPackage.packageName} package icon`"
              class="h-[25.2px] w-[28.8px] object-contain"
            />
          </div>

          <div class="flex flex-col gap-[8px] lg:min-w-[225px]">
            <h3 class="headline3 text-white">{{ merryPackage.packageName }}</h3>
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
          class="flex flex-col gap-[8px] list-none pb-[24px] lg:pb-0 border-b lg:border-0 border-purple-300"
        >
          <li
            v-for="(detail, detailIndex) in merryPackage.packageDetail"
            :key="`${merryPackage.id}-detail-${detailIndex}`"
            class="body2 text-gray-800 flex items-center gap-[10px]"
          >
            <SuccessIcon class="w-[18px] h-[18px] text-purple-300 shrink-0" />
            <span class="text-purple-100">{{ detail }}</span>
          </li>
        </ul>
      </div>
      <div class="hidden lg:block">
        <span class="py-[4px] px-[16px] bg-beige-200 rounded-full text-beige-600 body3">{{merryPackage.status}}</span>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-[8px] lg:justify-between ">
      <div>
        <p class="flex flex-row justify-between">
          <span class="body2 text-purple-200">Start Membership</span>
          <span class="body2 text-white lg:pl-[40px]">{{ merryPackage.startDate }}</span>
        </p>
        <p class="flex flex-row justify-between">
          <span class="body2 text-purple-200">Next billing</span>
          <span class="body2 text-white lg:pl-[40px]">{{
            merryPackage.nextBillingDate
          }}</span>
        </p>
      </div>

      <div
        class="flex flex-row justify-end border-t border-purple-300 lg:border-0 pt-[12px] lg:pt-0"
      >
        <BaseButtonGhost
          class="w-fit [--btn-px:0px] [--btn-py:0px] [--btn-color:#FFFFFF]"
          :disabled="cancelPending"
          @click="openCancelModal = true"
        >
          Cancel Package
        </BaseButtonGhost>
      </div>
    </div>
  </article>
  <ConfirmModal
    :open="openCancelModal"
    title="Cancel Confirmation"
    message="Do you sure to cancel Membership to get more Merry?"
    confirm-text="Yes, I want to cancel"
    cancel-text="No, I still want to be member"
    @close="openCancelModal = false"
    @confirm="handleConfirmCancel"
  />
  </div>
</template>

<script setup>
import { ref } from "vue";
import SuccessIcon from "@/assets/icons/success.svg";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";
import ConfirmModal from "../modals/ConfirmModal.vue";


const emit = defineEmits(["cancelPackage"]);

defineProps({
  merryPackage: {
    type: Object,
    required: true,
  },
  cancelPending: {
    type: Boolean,
    default: false,
  },
});

const formatPrice = (satang) => Number(satang/100).toFixed(2);

const openCancelModal = ref(false);

const handleConfirmCancel = () => {
  openCancelModal.value = false;
  emit("cancelPackage");
};
</script>
