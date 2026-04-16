<script setup>
import { watch } from "vue"
import ExitIcon from "@/assets/icons/exit.svg?component"
import ArrowIcon from "@/assets/icons/arrow.svg?component"
import LocationIcon from "@/assets/icons/location.svg?component"
import { useProfilePreviewData } from "@/components/profile/composables/useProfilePreviewData"

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  targetUserId: {
    type: String,
    default: "",
  },
  fallbackPhotoUrl: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["close"])

const {
  loading,
  loadError,
  loadPreview,
  displayName,
  displayAge,
  displayLocation,
  aboutText,
  hobbyTags,
  fields,
  photoCount,
  currentPhotoSrc,
  currentPhotoNumber,
  photoAltText,
  showPreviousPhoto,
  showNextPhoto,
} = useProfilePreviewData()

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) loadPreview()
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 hidden items-center justify-center bg-black/35 px-6 lg:flex"
    @click="emit('close')"
  >
    <div
      class="relative w-full max-w-[1140px] h-[740px] overflow-hidden rounded-2xl bg-white shadow-xl flex justify-center items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-preview-title"
      :aria-busy="loading"
      @click.stop
    >
      <p
        v-if="loadError"
        class="absolute left-4 top-14 z-10 max-w-md rounded-lg border border-red-200 bg-red-100 px-3 py-2 body2 text-red-700"
        role="alert"
      >
        {{ loadError }}
      </p>

      <button
        type="button"
        class="absolute right-4 top-4 z-60 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close profile preview"
        @click="emit('close')"
      >
        <ExitIcon class="h-10 w-10" aria-hidden="true" />
      </button>

      <div class="relative w-[980px] h-[579px]">
        <div
          v-if="loading"
          class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/95"
          role="status"
        >
          <div
            class="h-[478px] w-[478px] rounded-4xl bg-gray-200 animate-pulse"
            aria-hidden="true"
          />
          <p class="body2 text-gray-500">
            Loading profile…
          </p>
        </div>

        <div
          class="grid h-[579px] w-[980px] grid-cols-[478px_1fr] gap-15"
          :class="{ 'invisible pointer-events-none select-none': loading }"
        >
          <section aria-label="Profile photo">
            <div class="relative overflow-hidden rounded-4xl bg-gray-200">
              <img
                v-if="currentPhotoSrc"
                class="h-[478px] w-[478px] object-cover object-center transition duration-300 hover:scale-110"
                :src="currentPhotoSrc"
                width="400"
                height="520"
                :alt="photoAltText"
              />
            </div>

            <div
              v-if="photoCount > 0"
              class="flex items-center justify-between"
            >
              <span class="body2 text-gray-700 flex h-[48px] w-[72px] items-center justify-center font-semibold">
                {{ currentPhotoNumber }}<span class="text-gray-600"> /{{ photoCount }}</span>
              </span>
              <div class="flex">
                <button
                  type="button"
                  class="flex size-12 cursor-pointer items-center justify-center text-gray-600 disabled:opacity-40"
                  aria-label="Previous photo"
                  :disabled="photoCount <= 1"
                  @click="showPreviousPhoto"
                >
                  <ArrowIcon class="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="flex size-12 cursor-pointer items-center justify-center text-gray-600 disabled:opacity-40"
                  aria-label="Next photo"
                  :disabled="photoCount <= 1"
                  @click="showNextPhoto"
                >
                  <ArrowIcon class="size-4 rotate-180" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          <section class="pl-6 pt-6 flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <h1 id="profile-preview-title" class="m-0 flex items-baseline gap-4">
                <span class="headline2">{{ displayName }}</span>
                <span class="headline2 text-gray-700">{{ displayAge }}</span>
              </h1>

              <p class="flex items-center gap-1.5 body1 text-gray-700">
                <LocationIcon class="size-6 text-red-200" />
                <span>{{ displayLocation }}</span>
              </p>
            </div>

            <dl class="mt-5 grid gap-4">
              <div class="grid grid-cols-[0.8fr_1fr] items-start text-gray-700">
                <dt class="body2 text-gray-900">Sexual identities</dt>
                <dd class="body2 text-gray-700">{{ fields.identity }}</dd>
              </div>
              <div class="grid grid-cols-[0.8fr_1fr] items-start text-gray-700">
                <dt class="body2 text-gray-900">Sexual preferences</dt>
                <dd class="body2 text-gray-700">{{ fields.preference }}</dd>
              </div>
              <div class="grid grid-cols-[0.8fr_1fr] items-start text-gray-700">
                <dt class="body2 text-gray-900">Racial preferences</dt>
                <dd class="body2 text-gray-700">{{ fields.racial }}</dd>
              </div>
              <div class="grid grid-cols-[0.8fr_1fr] items-start text-gray-700">
                <dt class="body2 text-gray-900">Meeting interests</dt>
                <dd class="body2 text-gray-700">{{ fields.meeting }}</dd>
              </div>
            </dl>

            <section class="mt-6 flex flex-col gap-4">
              <h2 class="headline4">About me</h2>
              <p class="body2 text-gray-900">{{ aboutText }}</p>
            </section>

            <section class="mt-6 flex flex-col gap-6">
              <h2 class="headline4">Hobbies and Interests</h2>
              <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
                <li
                  v-for="(tag, index) in hobbyTags"
                  :key="`${tag}-${index}`"
                  class="body2 inline-flex min-h-[40px] max-w-full items-center justify-center rounded-xl border border-purple-300 bg-white px-3 py-2 text-purple-600"
                >
                  {{ tag }}
                </li>
              </ul>
            </section>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
