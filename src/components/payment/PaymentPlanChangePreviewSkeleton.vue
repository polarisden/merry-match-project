<template>
  <section
    class="flex flex-col w-full border border-gray-400 bg-white px-[24px] py-[16px] gap-[8px] lg:rounded-[16px] min-h-[152px] justify-center"
    :class="cardClass"
    aria-busy="true"
    aria-live="polite"
  >
    <!-- Mirrors upgrade (caption + large price) + optional third line (downgrade note) -->
    <div class="h-[22px] max-w-[85%] rounded bg-gray-200 animate-pulse" />
    <div class="h-[40px] w-[55%] max-w-[220px] rounded bg-gray-200 animate-pulse" />
    <div class="h-[20px] max-w-full rounded bg-gray-100 animate-pulse" />
  </section>
</template>

<script setup>
defineProps({
  /** e.g. lg:rounded-[16px] for column under summary */
  cardClass: {
    type: String,
    default: "",
  },
});
</script>
