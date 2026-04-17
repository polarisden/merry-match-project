<template>
  <section
    class="flex flex-col bg-white lg:border lg:border-gray-400 lg:rounded-[24px] lg:w-[548px] overflow-hidden shrink-0 w-full"
    aria-busy="true"
    aria-live="polite"
  >
    <header
      class="flex flex-row items-center justify-between h-[78px] px-[24px] bg-gray-100"
    >
      <div class="h-[22px] w-[104px] rounded bg-gray-200 animate-pulse" />
      <div class="flex flex-row items-center gap-[8px]" aria-hidden="true">
        <span class="inline-flex h-[10px] w-[40px] rounded-[4px] bg-gray-200 animate-pulse" />
        <span class="inline-flex h-[28px] w-[48px] rounded-[6px] bg-gray-200 animate-pulse" />
      </div>
    </header>
    <div class="flex flex-col gap-[24px] px-[24px] pt-[24px] pb-[16px]">
      <div class="flex flex-col gap-[6px]">
        <div class="h-[16px] w-[120px] rounded bg-gray-200 animate-pulse" />
        <div
          class="h-[44px] w-full rounded-[12px] border border-gray-400 bg-gray-50 animate-pulse"
        />
      </div>
      <div class="flex flex-col gap-[6px]">
        <div class="h-[16px] w-[100px] rounded bg-gray-200 animate-pulse" />
        <div
          class="h-[44px] w-full rounded-[12px] border border-gray-400 bg-gray-50 animate-pulse"
        />
      </div>
      <div class="grid grid-cols-2 gap-[12px]">
        <div class="flex flex-col gap-[6px]">
          <div class="h-[16px] w-[88px] rounded bg-gray-200 animate-pulse" />
          <div
            class="h-[44px] w-full rounded-[12px] border border-gray-400 bg-gray-50 animate-pulse"
          />
        </div>
        <div class="flex flex-col gap-[6px]">
          <div class="h-[16px] w-[72px] rounded bg-gray-200 animate-pulse" />
          <div
            class="h-[44px] w-full rounded-[12px] border border-gray-400 bg-gray-50 animate-pulse"
          />
        </div>
      </div>
    </div>
    <footer
      class="mt-[8px] -mx-[24px] px-[24px] flex flex-row items-center justify-between border-t border-gray-400 pt-[24px] pb-[8px]"
    >
      <div class="h-[40px] w-[72px] rounded bg-gray-200 animate-pulse" />
      <div class="h-[40px] min-w-[140px] max-w-[55%] rounded bg-gray-200 animate-pulse" />
    </footer>
  </section>
</template>
