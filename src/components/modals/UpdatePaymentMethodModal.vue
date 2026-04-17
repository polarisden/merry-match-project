<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import ExitIcon from "@/assets/icons/exit.svg?component";
import PaymentCreditCard from "@/components/payment/PaymentCreditCard.vue";
import { ensureOmise, createOmiseCardToken } from "@/composables/useOmise";
import { updateSubscriptionPaymentMethod } from "@/api/subscriptionPaymentMethodApi";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "updated"]);

const creditCardRef = ref(null);
const submitting = ref(false);
const apiError = ref("");
const formKey = ref(0);

function paymentMethodErrorMessage(err) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    const msg =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.error ||
      data?.detail ||
      err.message;
    return typeof msg === "string" ? msg : "Update failed";
  }
  return err instanceof Error ? err.message : "Update failed";
}

function applyCardErrorToField(message) {
  const msg = String(message ?? "");
  const lower = msg.toLowerCase();
  if (
    lower.includes("expiration date cannot be in the past") ||
    lower.includes("expiration")
  ) {
    creditCardRef.value?.setExternalFieldError?.("expiryDate", msg);
    return true;
  }
  return false;
}

function onClose() {
  emit("close");
}

function onBackdropClick() {
  if (submitting.value) return;
  onClose();
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      apiError.value = "";
      formKey.value += 1;
    }
  },
);

async function handlePay() {
  apiError.value = "";
  creditCardRef.value?.clearExternalFieldErrors?.();
  const card = creditCardRef.value?.getCardPayload?.();
  if (!card) return;

  submitting.value = true;
  try {
    await ensureOmise();
    const { id: omiseToken } = await createOmiseCardToken(card);
    const dto = await updateSubscriptionPaymentMethod(omiseToken);
    emit("updated", dto);
    emit("close");
  } catch (e) {
    const msg = paymentMethodErrorMessage(e);
    if (!applyCardErrorToField(msg)) {
      apiError.value = msg;
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6"
      role="presentation"
      @click="onBackdropClick"
    >
      <div
        class="flex w-full max-w-[548px] max-h-[min(90vh,920px)] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-payment-method-title"
        @click.stop
      >
        <div
          class="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-2"
        >
          <h2 id="update-payment-method-title" class="body1 text-gray-900">
            Update payment method
          </h2>
          <button
            type="button"
            class="hover:cursor-pointer"
            aria-label="Close"
            :disabled="submitting"
            @click="onClose"
          >
            <ExitIcon class="h-[40px] w-[41px]" />
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3">
          <p class="body2 text-gray-600">
            Only Visa and Mastercard are accepted. Card details are tokenized by
            Omise; we never store your full card number or CVC.
          </p>
          <p
            v-if="apiError"
            class="body2 mt-2 text-red-600"
            role="alert"
            aria-live="assertive"
          >
            {{ apiError }}
          </p>
          <div class="mt-4">
            <PaymentCreditCard
              :key="formKey"
              ref="creditCardRef"
              embedded
              :loading="false"
              :paying="submitting"
              submit-label="Update card"
              @cancel="onClose"
              @pay="handlePay"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
