<template>
  <div class="lg:flex lg:flex-row lg:items-end lg:justify-between lg:gap-8 min-w-0">
    <div class="relative min-w-0 lg:max-w-[min(100%,420px)] lg:shrink">
      <p class="text-[14px] tracking-widest text-beige-700 font-semibold uppercase">
        Register
      </p>

      <h1 class="mt-[8px] mb-[37px] text-purple-500 register-hero-title">
        Join us and start
        <br />
        matching
      </h1>

      <img
        :src="ellipse2Icon"
        alt=""
        aria-hidden="true"
        class="hidden lg:block fixed left-0 top-[86px] w-[81px] h-[100px] pointer-events-none select-none z-10"
      />
      <img
        :src="ellipse3Icon"
        alt=""
        aria-hidden="true"
        class="hidden lg:block fixed left-[80px] top-[210px] w-2 h-2 pointer-events-none select-none z-10"
      />
    </div>

    <div class="mt-5 lg:mt-0 w-full min-w-0 lg:flex-1 lg:max-w-full flex justify-stretch lg:justify-start">
      <div
        class="flex w-[calc(100%+2rem)] -mx-4 min-w-0 items-stretch gap-2 lg:gap-3 lg:w-[calc(100%+5rem)] lg:-mx-10 lg:justify-start lg:flex-nowrap overflow-x-auto lg:overflow-visible pb-0.5 lg:pb-0 px-[10px] [-webkit-overflow-scrolling:touch]"
        role="list"
        aria-label="Registration steps"
      >
        <template
          v-for="(step, index) in steps"
          :key="step.title"
        >
          <div
            v-if="currentStep === index + 1"
            role="listitem"
            class="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-purple-500 bg-white px-3 py-2 lg:h-[80px] lg:flex-1 lg:py-0"
          >
            <div class="shrink-0 w-10 h-10 rounded-lg bg-gray-200 grid place-items-center">
              <span class="register-step-number text-[15px] font-extrabold leading-none text-purple-500 tabular-nums">
                {{ index + 1 }}
              </span>
            </div>
            <div class="min-w-0 flex flex-1 flex-col items-start justify-center gap-1 text-left">
              <p class="register-step-meta text-[12px] font-medium leading-[1.2] text-gray-500">
                Step {{ index + 1 }}/3
              </p>
              <p class="body3 text-purple-500 truncate">
                {{ step.title }}
              </p>
            </div>
          </div>
          <div
            v-else
            role="listitem"
            class="shrink-0 flex h-[52px] w-[52px] items-center justify-center rounded-xl border border-gray-200 bg-white lg:h-[80px] lg:w-[80px]"
          >
            <div class="h-10 w-10 rounded-lg bg-gray-200 grid place-items-center">
              <span class="text-[15px] font-extrabold leading-none text-gray-600 tabular-nums">
                {{ index + 1 }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  steps: { type: Array, required: true },
  currentStep: { type: Number, required: true },
  ellipse2Icon: { type: String, required: true },
  ellipse3Icon: { type: String, required: true },
})
</script>
