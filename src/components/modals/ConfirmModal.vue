<script setup>
import ExitIcon from '@/assets/icons/exit.svg?component'
import BaseButtonPrimary from '@/components/base/BaseButtonPrimary.vue'
import BaseButtonSecondary from '@/components/base/BaseButtonSecondary.vue'

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Delete Confirmation",
  },
  message: {
    type: String,
    default: "Do you sure to delete account?",
  },
  confirmText: {
    type: String,
    default: "Yes, I want to delete",
  },
  cancelText: {
    type: String,
    default: "No, I don’t",
  },
})

const emit = defineEmits(["close", "confirm"])
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
    @click="emit('close')"
  >
    <div
      class="w-full max-w-[360px] overflow-hidden rounded-2xl bg-white shadow-xl lg:max-w-[528px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      @click.stop
    >
      <div class="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <h2
          id="confirm-modal-title"
          class="body1"
        >
          {{ title }}
        </h2>
        <button
          type="button"
          class="hover:cursor-pointer"
          aria-label="Close confirmation modal"
          @click="emit('close')"
        >
         <ExitIcon class="w-[41px] h-[40px]"/>
        </button>
      </div>

      <div class="px-5 py-5">
        <p class="body2 text-gray-700">{{ message }}</p>

        <div class="mt-6 flex flex-col gap-4 lg:flex-row lg:gap-6">
          <BaseButtonSecondary @click="emit('confirm')">
            {{ confirmText }}
          </BaseButtonSecondary>
          <BaseButtonPrimary @click="emit('close')">
            {{ cancelText }}
          </BaseButtonPrimary>
        </div>
      </div>
    </div>
  </div>
</template>
