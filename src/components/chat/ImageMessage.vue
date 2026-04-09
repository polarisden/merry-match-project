<script setup>
defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <div class="max-w-[80%] w-[240px] h-[240px] overflow-hidden rounded-2xl p-1">
    <img
      :src="src"
      :alt="alt"
      class="block h-full w-full rounded-xl object-cover"
    >
  </div>
</template>
