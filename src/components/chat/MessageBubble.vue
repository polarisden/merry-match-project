<script setup>
defineProps({
  variant: {
    type: String,
    required: true,
    validator: (v) => v === 'incoming' || v === 'outgoing',
  },
})
</script>

<template>
  <div
    v-if="variant === 'incoming'"
    class="inline-flex w-fit max-w-[85%] min-h-[48px] rounded-tl-[24px] rounded-tr-[24px] rounded-br-[24px] bg-purple-200 px-6 py-3 body2 leading-snug text-gray-900 wrap-break-word"
  >
    <slot />
  </div>
  <div
    v-else
    class="inline-flex w-fit max-w-[85%] min-h-[48px] rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] bg-purple-600 px-6 py-3 body2 leading-snug text-white wrap-break-word"
  >
    <slot />
  </div>
</template>
