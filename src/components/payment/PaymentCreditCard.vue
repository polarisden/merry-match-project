<template>
  <section
    class="flex flex-col border border-gray-400 rounded-[24px] bg-white lg:w-[548px] overflow-hidden"
    aria-label="Credit card payment form"
  >
    <header
      class="flex flex-row items-center justify-between h-[78px] px-[24px] bg-gray-100"
    >
      <h2 class="body1 text-gray-900 font-medium">Credit Card</h2>
      <div class="flex flex-row items-center gap-[8px]" aria-hidden="true">
        <span class="inline-flex h-[24px] w-[40px] rounded-[6px] bg-blue-600"></span>
        <span class="inline-flex h-[24px] w-[40px] rounded-[6px] bg-orange-500"></span>
      </div>
    </header>

    <form
      id="omise-card-form"
      ref="formRef"
      class="flex flex-col gap-[24px] px-[24px] pt-[24px] pb-[16px]"
      @submit.prevent="$emit('pay')"
    >
      <div class="flex flex-col gap-[6px]">
        <label for="card-number" class="body2 text-gray-700">
          Card number <span class="text-red-500">*</span>
        </label>
        <input
          id="card-number"
          type="text"
          inputmode="numeric"
          autocomplete="cc-number"
          placeholder="Number of card"
          class="w-full rounded-[12px] border border-gray-300 px-[12px] py-[10px] body2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
          data-name="cardNumber"
        />
      </div>

      <div class="flex flex-col gap-[6px]">
        <label for="card-owner" class="body2 text-gray-700">
          Card owner <span class="text-red-500">*</span>
        </label>
        <input
          id="card-owner"
          type="text"
          autocomplete="cc-name"
          placeholder="Holder of card"
          class="w-full rounded-[12px] border border-gray-300 px-[12px] py-[10px] body2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
          data-name="nameOnCard"
        />
      </div>

      <div class="flex flex-col gap-[12px]">
        <div class="grid grid-cols-2 gap-[12px]">
          <div class="flex flex-col gap-[6px]">
            <label for="expiry-date" class="body2 text-gray-700">
              Expiry date <span class="text-red-500">*</span>
            </label>
            <input
              id="expiry-date"
              type="text"
              inputmode="numeric"
              autocomplete="cc-exp"
              placeholder="MM/YY"
              class="w-full rounded-[12px] border border-gray-300 px-[12px] py-[10px] body2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
              data-name="expiryDate"
            />
          </div>

          <div class="flex flex-col gap-[6px]">
            <label for="cvc" class="body2 text-gray-700">
              CVC/CVV <span class="text-red-500">*</span>
            </label>
            <input
              id="cvc"
              type="password"
              inputmode="numeric"
              autocomplete="cc-csc"
              placeholder="xxx"
              class="w-full rounded-[12px] border border-gray-300 px-[12px] py-[10px] body2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500"
              data-name="securityCode"
            />
          </div>
        </div>
      </div>

      <footer
        class="mt-[8px] flex flex-row items-center justify-between border-t border-gray-200 pt-[16px]"
      >
        <BaseButtonGhost
          type="button"
          class="w-fit [--btn-px:0px]"
          :disabled="paying"
          @click="$emit('cancel')"
        >
          Cancel
        </BaseButtonGhost>

        <BaseButtonPrimary
          type="submit"
          class="w-fit"
          :disabled="paying || loading"
        >
          {{ loading ? "Loading..." : paying ? "Processing..." : "Payment Confirm" }}
        </BaseButtonPrimary>
      </footer>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";
import BaseButtonPrimary from "../base/BaseButtonPrimary.vue";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  paying: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["pay", "cancel"]);

const formRef = ref(null);

/**
 * Parse MM/YY → { month: 1-12, year: 4 digits }
 */
function parseExpiryMMYY(raw) {
  const s = String(raw ?? "").trim();
  const m = s.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const yy = Number(m[2]);
  if (month < 1 || month > 12) return null;
  const year = 2000 + yy;
  return { month, year };
}

/**
 * Values for Omise.createToken({ card }) — never log or persist full card data.
 */
function getCardPayload() {
  const form = formRef.value;
  if (!form) return null;
  const number = form.querySelector('[data-name="cardNumber"]')?.value?.replace(/\s/g, "") ?? "";
  const name = form.querySelector('[data-name="nameOnCard"]')?.value?.trim() ?? "";
  const expiryRaw = form.querySelector('[data-name="expiryDate"]')?.value ?? "";
  const security_code = form.querySelector('[data-name="securityCode"]')?.value?.trim() ?? "";
  const exp = parseExpiryMMYY(expiryRaw);
  if (!exp || !number || !name || !security_code) return null;
  return {
    name,
    number,
    expiration_month: exp.month,
    expiration_year: exp.year,
    security_code,
  };
}

defineExpose({ formRef, getCardPayload });
</script>
