<template>
  <div
    class="flex flex-col gap-[16px] lg:gap-[24px]"
    aria-busy="true"
    aria-live="polite"
  >
    <div class="w-[60px] h-[60px] rounded-[16px] bg-gray-200 animate-pulse"></div>
    <div class="flex flex-col gap-[8px]">
      <div class="h-[40px] w-[55%] rounded bg-gray-200 animate-pulse"></div>
      <div class="h-[30px] w-[45%] rounded bg-gray-200 animate-pulse"></div>
    </div>
    <ul class="flex flex-col gap-[8px] list-none pb-[24px] border-b border-gray-300">
      <li v-for="n in 2" :key="`plan-sk-${n}`" class="flex items-center gap-[10px]">
        <div class="w-[18px] h-[18px] rounded-full bg-gray-200 animate-pulse shrink-0"></div>
        <div class="h-[24px] w-[70%] rounded bg-gray-200 animate-pulse"></div>
      </li>
    </ul>
  </div>
</template>
