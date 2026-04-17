<template>
  <section
    class="flex flex-col border-b border-gray-400 bg-gray-100 pt-[32px] px-[24px] pb-[16px] gap-[16px] lg:border lg:rounded-[24px] lg:w-[358px] lg:h-fit lg:border-gray-400"
    aria-busy="true"
    aria-live="polite"
  >
    <header class="flex flex-row gap-[12px] items-center">
      <div class="w-[24px] h-[24px] rounded bg-gray-200 animate-pulse"></div>
      <div class="h-[24px] w-[160px] rounded bg-gray-200 animate-pulse"></div>
    </header>

    <div>
      <div class="flex flex-row justify-between items-center py-[8px]">
        <div class="h-[20px] w-[36px] rounded bg-gray-200 animate-pulse"></div>
        <div class="h-[22px] min-w-[96px] max-w-[55%] flex-1 ml-[12px] rounded bg-gray-200 animate-pulse"></div>
      </div>

      <ul class="flex flex-col bg-white py-[10px] px-[8px] gap-[6px] rounded-[8px]">
        <li
          v-for="n in 2"
          :key="`detail-skeleton-${n}`"
          class="flex items-center gap-[8px]"
        >
          <div class="h-[4px] w-[4px] rounded-full bg-gray-300 shrink-0"></div>
          <div
            class="h-[22px] rounded bg-gray-200 animate-pulse"
            :class="n === 1 ? 'w-[88%]' : 'w-[72%]'"
          ></div>
        </li>
      </ul>

      <div class="flex flex-row justify-between items-center py-[24px]">
        <div class="h-[20px] w-[128px] rounded bg-gray-200 animate-pulse"></div>
        <div class="h-[22px] w-[96px] rounded bg-gray-200 animate-pulse"></div>
      </div>
    </div>
  </section>
</template>

