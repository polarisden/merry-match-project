<template>
  <table class="w-full lg:table-fixed" aria-busy="true" aria-live="polite">
    <tbody>
      <tr v-for="n in rowCount" :key="`billing-sk-${n}`">
        <td class="p-[16px] lg:w-[100px]">
          <span class="inline-block h-[18px] w-[90px] rounded bg-gray-200 animate-pulse"></span>
        </td>
        <td class="p-[16px]">
          <span class="inline-block h-[18px] w-[90px] rounded bg-gray-200 animate-pulse"></span>
        </td>
        <td class="p-[16px] text-right">
          <span class="inline-block h-[18px] w-[90px] rounded bg-gray-200 animate-pulse"></span>
        </td>
        <td class="p-[16px]">
          <span class="inline-block h-[18px] w-[64px] rounded bg-gray-200 animate-pulse"></span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  rowCount: {
    type: Number,
    default: 5,
  },
});
</script>
