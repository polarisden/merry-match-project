<template>
  <section
    class="flex flex-col border-b border-gray-400 bg-gray-100 pt-[32px] px-[24px] pb-[16px] gap-[16px]"
    aria-busy="true"
    aria-live="polite"
  >
    <header class="flex flex-row gap-[12px] items-center">
      <div class="w-[24px] h-[24px] rounded bg-gray-200 animate-pulse"></div>
      <div class="h-[24px] w-[160px] rounded bg-gray-200 animate-pulse"></div>
    </header>

    <div>
      <div class="flex flex-row justify-between py-[8px]">
        <div class="h-[20px] w-[90px] rounded bg-gray-200 animate-pulse"></div>
        <div class="h-[30px] w-[120px] rounded bg-gray-200 animate-pulse"></div>
      </div>

      <ul class="flex flex-col bg-white py-[10px] px-[8px] gap-[8px] rounded-[8px]">
        <li
          v-for="n in 2"
          :key="`detail-skeleton-${n}`"
          class="flex items-center gap-[8px]"
        >
          <div class="h-[4px] w-[4px] rounded-full bg-gray-300 shrink-0"></div>
          <div class="h-[24px] w-[70%] rounded bg-gray-200 animate-pulse"></div>
        </li>
      </ul>

      <div class="flex flex-row justify-between py-[24px]">
        <div class="h-[20px] w-[120px] rounded bg-gray-200 animate-pulse"></div>
        <div class="h-[24px] w-[90px] rounded bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  </section>
</template>

