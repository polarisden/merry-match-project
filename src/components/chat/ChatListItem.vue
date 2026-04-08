<script setup>
defineProps({
  variant: {
    type: String,
    required: true,
    validator: (v) => v === 'incoming' || v === 'outgoing',
  },
  avatarSrc: {
    type: String,
    default: '',
  },
  avatarAlt: {
    type: String,
    default: 'profile-pic',
  },
})
</script>

<template>
  <div
    v-if="variant === 'incoming'"
    class="flex items-end gap-2"
  >
    <img
      v-if="avatarSrc"
      :src="avatarSrc"
      :alt="avatarAlt"
      class="size-10 shrink-0 rounded-full object-cover"
    >
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <slot />
    </div>
  </div>
  <div
    v-else
    class="flex justify-end"
  >
    <slot />
  </div>
</template>
