<template>
  <section
    class="flex flex-col overflow-hidden bg-white"
    :class="
      embedded
        ? 'w-full border border-gray-400 rounded-[24px]'
        : 'lg:border lg:border-gray-400 lg:rounded-[24px] lg:w-[548px]'
    "
    aria-label="Credit card payment form"
  >
    <header
      class="flex flex-row items-center justify-between h-[78px] px-[24px] bg-gray-100"
    >
      <h2 class="body1 text-gray-700 font-medium">Credit Card</h2>
      <div class="flex flex-row items-center gap-[8px]" aria-hidden="true">
        <VisaCard class="w-[40px] h-[9.33px] text-red-200 shrink-0" />
        <MasterCard class="w-[48px] h-[28px] text-red-200 shrink-0" />
      </div>
    </header>

    <form
      id="omise-card-form"
      ref="formRef"
      class="flex flex-col gap-[24px] px-[24px] pt-[24px] pb-[16px]"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-[6px]">
        <label for="card-number" class="body2 text-neutral-900">
          Card number <span class="text-red-500">*</span>
        </label>
        <input
          id="card-number"
          type="text"
          inputmode="numeric"
          autocomplete="cc-number"
          placeholder="Number of card"
          class="w-full rounded-[12px] border px-[12px] py-[10px] body2 text-black placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
          :class="fieldErrors.cardNumber ? 'border-red-500' : 'border-gray-400'"
          data-name="cardNumber"
          v-model="cardNumber"
        />
        <p v-if="fieldErrors.cardNumber" class="body2 text-red-600">* {{ fieldErrors.cardNumber }}</p>
      </div>

      <div class="flex flex-col gap-[6px]">
        <label for="card-owner" class="body2 text-neutral-900">
          Card owner <span class="text-red-500">*</span>
        </label>
        <input
          id="card-owner"
          type="text"
          autocomplete="cc-name"
          placeholder="Holder of card"
          class="w-full rounded-[12px] border px-[12px] py-[10px] body2 text-black placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
          :class="fieldErrors.nameOnCard ? 'border-red-500' : 'border-gray-400'"
          data-name="nameOnCard"
          v-model="nameOnCard"
        />
        <p v-if="fieldErrors.nameOnCard" class="body2 text-red-600">* {{ fieldErrors.nameOnCard }}</p>
      </div>

      <div class="flex flex-col gap-[12px]">
        <div class="grid grid-cols-2 gap-[12px]">
          <div class="flex flex-col gap-[6px]">
            <label for="expiry-date" class="body2 text-neutral-900">
              Expiry date <span class="text-red-500">*</span>
            </label>
            <input
              id="expiry-date"
              type="text"
              inputmode="numeric"
              autocomplete="cc-exp"
              placeholder="MM/YY"
              class="w-full rounded-[12px] border px-[12px] py-[10px] body2 text-black placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
              :class="fieldErrors.expiryDate ? 'border-red-500' : 'border-gray-400'"
              data-name="expiryDate"
              v-model="expiryDate"
            />
            <p v-if="fieldErrors.expiryDate" class="body2 text-red-600">* {{ fieldErrors.expiryDate }}</p>
          </div>

          <div class="flex flex-col gap-[6px]">
            <label for="cvc" class="body2 text-neutral-900">
              CVC/CVV <span class="text-red-500">*</span>
            </label>
            <input
              id="cvc"
              type="password"
              inputmode="numeric"
              autocomplete="cc-csc"
              placeholder="xxx"
              class="w-full rounded-[12px] border px-[12px] py-[10px] body2 text-black placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
              :class="fieldErrors.securityCode ? 'border-red-500' : 'border-gray-400'"
              data-name="securityCode"
              v-model="securityCode"
            />
            <p v-if="fieldErrors.securityCode" class="body2 text-red-600">* {{ fieldErrors.securityCode }}</p>
          </div>
        </div>
      </div>

      <div
        class="mt-[8px] -mx-[24px] pt-[24px] px-[24px] pb-[8px] flex flex-row items-center justify-between border-t border-gray-400 "
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
          {{
            loading
              ? "Loading..."
              : paying
                ? "Processing..."
                : submitLabel || "Payment Confirm"
          }}
        </BaseButtonPrimary>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import BaseButtonPrimary from "../base/BaseButtonPrimary.vue";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";
import VisaCard from "@/assets/icons/visa_card.svg";
import MasterCard from "@/assets/icons/master_card.svg";

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  paying: {
    type: Boolean,
    default: false,
  },
  /** ข้อความปุ่มเมื่อไม่ loading/paying (เช่น Confirm upgrade) */
  submitLabel: {
    type: String,
    default: "",
  },
  /** ใช้ใน modal — ขอบและความกว้างเต็มที่ ไม่พึ่ง breakpoint lg */
  embedded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["pay", "cancel"]);

const formRef = ref(null);
const cardNumber = ref("");
const nameOnCard = ref("");
const expiryDate = ref("");
const securityCode = ref("");
const fieldErrors = reactive({
  cardNumber: "",
  nameOnCard: "",
  expiryDate: "",
  securityCode: "",
});

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

function isExpiryInPast(exp) {
  if (!exp) return true;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  if (exp.year < currentYear) return true;
  if (exp.year === currentYear && exp.month < currentMonth) return true;
  return false;
}

/**
 * Omise.js `createToken` has no client parameter to whitelist card brands.
 * Which networks you may charge is determined by your Omise account / Capability API / Dashboard;
 * unsupported brands can fail at charge time (e.g. `brand_not_supported`).
 * We restrict to Visa + Mastercard here before calling Omise.
 */

/**
 * Visa: starts with 4; length 13, 16, or 19 (ISO/IEC 7812 PAN).
 * Mastercard: 51–55 or BIN 2221–2720; length 16.
 * @param {string} digits digits only
 * @returns {'visa'|'mastercard'|null}
 */
function getVisaMastercardBrand(digits) {
  if (!digits || !/^\d+$/.test(digits)) return null;

  if (digits.startsWith("4")) {
    const len = digits.length;
    if (len === 13 || len === 16 || len === 19) return "visa";
    return null;
  }

  if (digits.length !== 16) return null;
  const firstTwo = Number(digits.slice(0, 2));
  const firstFour = Number(digits.slice(0, 4));
  if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";
  if (firstFour >= 2221 && firstFour <= 2720) return "mastercard";
  return null;
}

/** Luhn checksum (ISO/IEC 7812). Does not imply the card is chargeable. */
function isLuhnValid(number) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Values for Omise.createToken({ card }) — never log or persist full card data.
 */
function getCardPayload() {
  const number = cardNumber.value.replace(/\s/g, "");
  const name = nameOnCard.value.trim();
  const expiryRaw = expiryDate.value;
  const security_code = securityCode.value.trim();
  const exp = parseExpiryMMYY(expiryRaw);
  if (!exp || !number || !name || !security_code || !getVisaMastercardBrand(number)) return null;
  return {
    name,
    number,
    expiration_month: exp.month,
    expiration_year: exp.year,
    security_code,
  };
}

function validateForm() {
  fieldErrors.cardNumber = "";
  fieldErrors.nameOnCard = "";
  fieldErrors.expiryDate = "";
  fieldErrors.securityCode = "";

  const number = cardNumber.value.replace(/\s/g, "");
  const name = nameOnCard.value.trim();
  const expiryRaw = expiryDate.value;
  const cvc = securityCode.value.trim();
  const exp = parseExpiryMMYY(expiryRaw);

  if (!number) {
    fieldErrors.cardNumber = "Card number is required";
  } else if (!/^\d+$/.test(number)) {
    fieldErrors.cardNumber = "Card number must contain digits only";
  } else if (!getVisaMastercardBrand(number)) {
    fieldErrors.cardNumber = "Only Visa and Mastercard are accepted";
  } else if (!isLuhnValid(number)) {
    fieldErrors.cardNumber = "Invalid card number";
  }

  if (!name) fieldErrors.nameOnCard = "Card owner is required";
  if (name && name.length < 2) fieldErrors.nameOnCard = "Card owner name is too short";

  if (!expiryRaw) fieldErrors.expiryDate = "Expiry date is required";
  if (expiryRaw && !exp) {
    fieldErrors.expiryDate = "Use MM/YY format";
  } else if (exp && isExpiryInPast(exp)) {
    fieldErrors.expiryDate = "Expiration date cannot be in the past";
  }

  if (!cvc) fieldErrors.securityCode = "CVC/CVV is required";
  if (cvc && !/^\d+$/.test(cvc)) {
    fieldErrors.securityCode = "CVC/CVV must contain digits only";
  } else if (cvc && cvc.length !== 3) {
    fieldErrors.securityCode = "CVC must be 3 digits for Visa and Mastercard";
  }

  return !fieldErrors.cardNumber &&
    !fieldErrors.nameOnCard &&
    !fieldErrors.expiryDate &&
    !fieldErrors.securityCode;
}

function handleSubmit() {
  if (!validateForm()) return;
  emit("pay");
}

function setExternalFieldError(field, message) {
  if (!Object.prototype.hasOwnProperty.call(fieldErrors, field)) return;
  fieldErrors[field] = String(message ?? "").trim();
}

function clearExternalFieldErrors() {
  fieldErrors.cardNumber = "";
  fieldErrors.nameOnCard = "";
  fieldErrors.expiryDate = "";
  fieldErrors.securityCode = "";
}

defineExpose({
  formRef,
  getCardPayload,
  setExternalFieldError,
  clearExternalFieldErrors,
});
</script>
