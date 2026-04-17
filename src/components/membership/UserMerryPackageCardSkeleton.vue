<template>
  <div class="flex flex-col gap-[24px]" aria-busy="true" aria-live="polite">
    <h4 class="headline4 text-gray-900">Merry Membership Package</h4>

    <article
      class="flex flex-col min-w-[343px] lg:w-full border border-gray-400 bg-linear rounded-[24px] p-[16px] lg:pt-[32px] lg:px-[32px] lg:pb-[24px] gap-[16px] lg:gap-[24px]"
    >
      <div
        class="flex flex-col lg:flex-row gap-[16px] lg:justify-between lg:pb-[40px] lg:border-b border-purple-300"
      >
        <div class="lg:flex flex-row gap-[24px] items-center w-full min-w-0">
          <div class="lg:flex lg:flex-row lg:gap-[16px] lg:items-center w-full min-w-0">
            <div
              class="flex justify-center items-center bg-gray-100 rounded-[16px] w-[60px] h-[60px] shrink-0"
            >
              <div class="h-[25px] w-[29px] rounded bg-gray-200 animate-pulse"></div>
            </div>

            <div class="flex flex-col gap-[8px] lg:min-w-[225px] mt-[16px] lg:mt-0">
              <div class="h-[28px] max-w-[200px] rounded bg-gray-200 animate-pulse"></div>
              <div class="h-[22px] max-w-[120px] rounded bg-gray-200 animate-pulse"></div>
            </div>
          </div>


        </div>

        <div class="hidden lg:flex lg:items-start lg:justify-end shrink-0">
          <span
            class="inline-block h-[28px] w-[72px] rounded-full bg-gray-200 animate-pulse"
          ></span>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-[8px] lg:justify-between">
        <div class="flex flex-col gap-[8px] w-full lg:max-w-[320px]">
          <p class="flex flex-row justify-between gap-[16px]">
            <span class="h-[18px] w-[120px] rounded bg-gray-200 animate-pulse shrink-0"></span>
            <span class="h-[18px] w-[88px] rounded bg-gray-200 animate-pulse"></span>
          </p>
          <p class="flex flex-row justify-between gap-[16px]">
            <span class="h-[18px] w-[88px] rounded bg-gray-200 animate-pulse shrink-0"></span>
            <span class="h-[18px] w-[88px] rounded bg-gray-200 animate-pulse"></span>
          </p>
        </div>

        <div
          class="flex flex-row justify-end border-t border-purple-300 lg:border-0 pt-[12px] lg:pt-0"
        >
          <div class="h-[24px] w-[140px] rounded bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    </article>
  </div>
</template>
