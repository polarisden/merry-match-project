<script setup>
import { computed, ref } from "vue"
import BaseButtonPrimary from "@/components/base/BaseButtonPrimary.vue"
import CalendarPicker from "@/components/ui/CalendarPicker.vue"
import BaseButtonGhost from "@/components/base/BaseButtonGhost.vue"
const ellipse2Icon = new URL("../assets/icons/Ellipse2.svg", import.meta.url).href
const ellipse3Icon = new URL("../assets/icons/Ellipse3.svg", import.meta.url).href
const ellipse4Icon = new URL("../assets/icons/Ellipse4.svg", import.meta.url).href

const currentStep = ref(1)
const dateOfBirth = ref("")

const steps = [
  { title: "Basic Information" },
  { title: "Identities and Interests" },
  { title: "Upload Photos" },
]

const stepFields = {
  1: [
    { label: "Name", type: "text", placeholder: "Jon Snow" },
    { label: "Date of birth", type: "date", placeholder: "01/01/2008" },
    { label: "Location", type: "select", placeholder: "Thailand" },
    { label: "City", type: "select", placeholder: "Bangkok" },
    { label: "Username", type: "text", placeholder: "At least 6 character" },
    { label: "Email", type: "email", placeholder: "name@website.com" },
    { label: "Password", type: "password", placeholder: "At least 8 character" },
    { label: "Confirm password", type: "password", placeholder: "At least 8 character" },
  ],
  2: [
    { label: "Sexual identities", type: "select", placeholder: "Male" },
    { label: "Sexual preferences", type: "select", placeholder: "Female" },
    { label: "Racial preferences", type: "select", placeholder: "Asian" },
    { label: "Meeting interests", type: "select", placeholder: "Friends" },
  ],
}

const interestTags = ["esport", "series", "dragon"]
const uploadedPhotos = [
  { name: "Photo 1" },
  { name: "Photo 2" },
]
const totalPhotoSlots = 5

const activeStep = computed(() => steps[currentStep.value - 1])
const fields = computed(() => stepFields[currentStep.value])
const photoSlots = computed(() =>
  Array.from({ length: totalPhotoSlots }, (_, index) => {
    const isUploaded = index < uploadedPhotos.length

    return {
      key: isUploaded ? uploadedPhotos[index].name : `slot-${index + 1}`,
      label: isUploaded ? "Upload photo" : "Upload photo",
    }
  }),
)

const canGoBack = computed(() => currentStep.value > 1)
const nextLabel = computed(() => (currentStep.value === 3 ? "Confirm" : "Next step"))

function goNext() {
  if (currentStep.value < 3) {
    currentStep.value += 1
  }
}

function goBack() {
  if (currentStep.value > 1) {
    currentStep.value -= 1
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex justify-start lg:justify-center lg:bg-white">
    <div
      class="w-full max-w-[390px] lg:max-w-[930px] mx-auto bg-gray-100 lg:bg-white px-4 pt-5 pb-28 lg:px-10 lg:pt-10 lg:pb-36"
    >
      <div class="lg:flex lg:flex-row lg:items-end lg:justify-between lg:gap-8 min-w-0">
        <div class="relative min-w-0 lg:max-w-[min(100%,420px)] lg:shrink">
          <p class="text-[14px] tracking-widest text-beige-700 font-semibold uppercase">
            Register
          </p>

          <h1
            class="mt-[8px] mb-[37px] text-purple-500 register-hero-title"
          >
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

        <div
          class="mt-5 lg:mt-0 w-full min-w-0 lg:flex-1 lg:max-w-full flex justify-stretch lg:justify-end"
        >
          <div
            class="flex w-full min-w-0 max-w-full items-stretch gap-2 lg:gap-3 lg:justify-end lg:flex-nowrap overflow-x-auto lg:overflow-visible pb-0.5 lg:pb-0 [-webkit-overflow-scrolling:touch]"
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
                class="flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl border border-purple-500 bg-white px-3 py-2 lg:h-[80px] lg:flex-none lg:w-auto lg:py-0"
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

      <h2 class="mt-[37px] lg:mt-[80px] headline4 text-purple-500">
        {{ activeStep.title }}
      </h2>

      <div
        v-if="currentStep === 3"
        class="mt-2"
      >
        <p class="text-[20px] leading-[1.1] text-purple-500 font-extrabold">
          Profile pictures
        </p>
        <p class="mt-1 text-[16px] text-gray-700">
          Upload at least 2 photos
        </p>

        <div class="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4">
          <button
            v-for="slot in photoSlots"
            :key="slot.key"
            type="button"
            class="h-[120px] lg:h-[156px] rounded-xl bg-gray-200/80 flex flex-col items-center justify-center text-purple-500"
          >
            <span class="text-[26px] leading-none">+</span>
            <span class="text-[13px] mt-1">{{ slot.label }}</span>
          </button>
        </div>
      </div>

      <form
        v-else
        class="mt-4 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-6 lg:relative"
      >
        <div
          v-for="field in fields"
          :key="`${field.label}-${field.placeholder}`"
        >
          <label class="block text-[13px] text-gray-900 mb-1.5">
            {{ field.label }}
          </label>

          <div class="relative">
            <CalendarPicker
              v-if="field.type === 'date'"
              v-model="dateOfBirth"
              :placeholder="field.placeholder"
            />

            <input
              v-else-if="field.type !== 'select'"
              :type="field.type"
              class="w-full h-11 px-3 pr-10 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white placeholder:text-gray-500 text-[13px] outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
              :placeholder="field.placeholder"
            />

            <select
              v-else
              class="w-full h-11 px-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white text-[13px] text-gray-600 appearance-none outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
            >
              <option selected>{{ field.placeholder }}</option>
            </select>

            <span
              v-if="field.type === 'select'"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]"
            >
              ▼
            </span>
          </div>
        </div>

        <div
          v-if="currentStep === 2"
          class="lg:col-span-2"
        >
          <label class="block text-[13px] text-gray-900 mb-1.5">
            Hobbies / Interests (Maximum 10)
          </label>
          <div class="w-full min-h-11 px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white flex flex-wrap gap-1.5">
            <span
              v-for="tag in interestTags"
              :key="tag"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 text-[11px] text-purple-500 leading-none"
            >
              {{ tag }} <span class="text-purple-300">x</span>
            </span>
          </div>
        </div>

        <img
          :src="ellipse4Icon"
          alt=""
          aria-hidden="true"
          class="hidden lg:block fixed right-0 bottom-[230px] w-[45px] h-[59px] pointer-events-none select-none z-10"
        />
      </form>
    </div>

    <div class="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 lg:bg-white">
      <div class="w-full max-w-[390px] lg:max-w-[930px] mx-auto px-4 lg:px-10 py-4 flex items-center justify-between">
        <span class="body2 text-gray-700">{{ currentStep }}<span class="text-gray-600">/3</span></span>

        <div class="flex items-center gap-4">
          <BaseButtonGhost
            :disabled="!canGoBack"
            :show-arrow="true"
            @click="goBack"
          >
            Back
          </BaseButtonGhost>

          <BaseButtonPrimary @click="goNext">
            {{ nextLabel }}
          </BaseButtonPrimary>
        </div>
      </div>
    </div>
  </div>
</template>
