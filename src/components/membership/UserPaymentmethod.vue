<template>
  <article class="flex flex-col gap-[24px] -mt-[25px] lg:mt-0">
    <p class="headline4 text-gray-900">Payment method</p>
    <div
      class="flex flex-col p-[16px] lg:px-[32px] lg:pt-[32px] lg:pb-[24px] gap-[16px] border border-gray-400 rounded-[24px] bg-white"
    >
      <div class="flex flex-row gap-[16px] border-b border-gray-300 pb-[24px]">
        <div
          class="min-w-[66px] h-[66px] bg-gray-100 rounded-[16px] flex justify-center items-center"
        >
          <CreditCard class="w-[32px] h-[32px] text-red-200" aria-hidden="true" />
        </div>
        <div>
          <p v-if="error" class="body2 text-red-500">{{ error }}</p>
          <template v-else>
            <template v-if="loading">
              <p class="headline4 text-purple-600">
                <span
                  class="inline-block h-[24px] w-[180px] rounded bg-gray-200 animate-pulse"
                ></span>
              </p>
              <p class="body2 text-gray-700 mt-[4px]">
                <span
                  class="inline-block h-[18px] w-[140px] rounded bg-gray-200 animate-pulse"
                ></span>
              </p>
            </template>
            <template v-else-if="hasCard">
              <p class="headline4 text-purple-600">
                {{ paymentCard.brand }} ending *{{ paymentCard.last4 }}
              </p>
              <p class="body2 text-gray-700 mt-[4px]">
                Expires {{ expMonthDisplay }}/{{ paymentCard.expYear }}
              </p>
            </template>
            <p v-else class="body2 text-gray-600">
              No payment card on file for this membership.
            </p>
          </template>
        </div>
      </div>
      <div class="flex flex-row justify-end">
        <BaseButtonGhost
          class="w-fit"
          :disabled="loading || !canEditPaymentMethod"
          :title="
            canEditPaymentMethod
              ? undefined
              : 'Available when you have an active membership with a card on file'
          "
          type="button"
          @click="$emit('handleEditPaymentMethod')"
        >
          Edit payment method
        </BaseButtonGhost>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import CreditCard from "@/assets/icons/credit_card.svg";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";

const props = defineProps({
  /** จาก normalizeMembership — { brand, last4, expMonth, expYear } */
  paymentCard: {
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
  /** false = ปุ่มแก้ไขถูกปิด (เช่น ไม่มี membership active / ไม่มีบัตรใน snapshot) */
  canEditPaymentMethod: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["handleEditPaymentMethod"]);

const hasCard = computed(() => {
  const c = props.paymentCard;
  return (
    c != null &&
    typeof c === "object" &&
    (c.last4 !== "" || c.brand !== "")
  );
});

const expMonthDisplay = computed(() => {
  const m = props.paymentCard?.expMonth;
  if (m === "" || m == null) return "—";
  return String(m).padStart(2, "0");
});
</script>
