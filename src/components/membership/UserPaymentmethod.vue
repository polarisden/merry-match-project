<template>
  <article class="flex flex-col gap-[24px]">
    <p class="headline4 text-gray-900">Payment method</p>
    <div
      class="flex flex-col px-[32px] pt-[32px] pb-[24px]  gap-[16px] border border-gray-400 rounded-[24px] bg-white"
    >
      <div class="flex flex-row gap-[16px] border-b border-gray-300 pb-[24px]">
        <div
          class="w-[66px] h-[66px] bg-gray-100 rounded-[16px] flex justify-center items-center"
        >
          <CreditCard class="w-[32px] h-[32px] text-red-200" />
        </div>
        <div>
          <p v-if="error" class="body2 text-red-500">{{ error }}</p>
          <template v-else>
            <p v-if="loading" class="headline4 text-purple-600">
              <span class="inline-block h-[24px] w-[180px] rounded bg-gray-200 animate-pulse"></span>
            </p>
            <p v-else class="headline4 text-purple-600">
              {{ paymentMethod.brand }} ending *{{ paymentMethod.last4 }}
            </p>

            <p v-if="loading" class="body2 text-gray-700 mt-[4px]">
              <span class="inline-block h-[18px] w-[140px] rounded bg-gray-200 animate-pulse"></span>
            </p>
            <p v-else class="body2 text-gray-700">
              Expire {{ paymentMethod.expMonth }}/{{ paymentMethod.expYear }}
            </p>
          </template>
        </div>
      </div>
      <div class="flex flex-row justify-end">
        <BaseButtonGhost
          class="w-fit"
          :disabled="loading"
          @click="$emit('handleEditPaymentMethod')"
        >
          Edit Payment Method
        </BaseButtonGhost>
      </div>
    </div>
  </article>
</template>

<script setup>
import CreditCard from "@/assets/icons/credit_card.svg";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";
import { onMounted, ref } from "vue";
import { getPaymentMethod } from "../../api/paymentMethodApi";

const loading = ref(false);
const error = ref("");
const paymentMethod = ref({
  brand: "",
  last4: "",
  expMonth: "",
  expYear: "",
});

onMounted(async () => {
  try {
    loading.value = true;
    error.value = "";
    paymentMethod.value = await getPaymentMethod();
  } catch (e) {
    error.value = "Failed to load payment method";
  } finally {
    loading.value = false;
  }
});
</script>
