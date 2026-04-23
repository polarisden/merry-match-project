<script setup>
import ArrowIcon from '@/assets/icons/arrow.svg?component'
import LocationIcon from '@/assets/icons/location.svg?component'
import { useMatchingProfilePreviewData } from '@/components/profile/composables/useMatchingProfilePreviewData'
import { watch } from 'vue'

const props = defineProps({
  userId: { type: String, default: '' },
  fallbackPhotoUrl: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const {
  loading,
  loadError,
  imageLoading,
  onImageLoad,
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
} = useMatchingProfilePreviewData()

watch(
  () => [props.userId, props.fallbackPhotoUrl],
  () => {
    loadPreview({ userId: props.userId, fallbackPhotoUrl: props.fallbackPhotoUrl })
  },
  { immediate: true },
)
</script>

<template>
  <article
    class="relative mx-auto bg-white font-[Nunito,sans-serif] flex flex-col w-full max-w-[390px]"
    :aria-busy="loading"
  >
    <p
      v-if="loadError"
      class="mx-4 mt-4 rounded-lg border border-red-200 bg-red-100 px-3 py-2 body2 text-red-700"
      role="alert"
    >
      {{ loadError }}
    </p>

    <div
      v-if="loading"
      class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90"
      role="status"
    >
      <svg class="h-10 w-10 animate-spin text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>

    <div :class="{ 'invisible pointer-events-none select-none': loading }">
      <section class="relative" aria-label="Profile photo">
        <div class="w-[375px] h-[315px] relative max-h-88 aspect-3/4 overflow-hidden rounded-b-[24px] bg-gray-200">
          <!-- spinner รูปถัดไป -->
          <div
            v-if="imageLoading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-gray-100"
          >
            <svg class="h-10 w-10 animate-spin text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
          <img
            v-if="currentPhotoSrc"
            class="h-full w-full object-cover"
            :class="{ 'opacity-0': imageLoading }"
            :src="currentPhotoSrc"
            width="400"
            height="520"
            :alt="photoAltText"
            @load="onImageLoad"
          />
          <button
            type="button"
            class="absolute top-4 left-4 flex size-9 cursor-pointer items-center justify-center text-white shadow-lg bg-black/50 rounded-full backdrop-blur-md"
       
            aria-label="Back"
            @click="emit('close')"
          >
            <ArrowIcon class="size-4" aria-hidden="true" />
          </button>
        </div>

        <div v-if="photoCount > 0" class="flex items-center justify-between px-0.5">
          <span class="body2 flex h-[48px] w-[72px] items-center justify-center font-semibold">
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

      <div class="h-full px-4 pb-6 pt-1 flex flex-col gap-2">
        <h1 class="m-0 flex flex-wrap items-baseline gap-4">
          <span class="headline2">{{ displayName }}</span>
          <span class="headline2 text-gray-700">{{ displayAge }}</span>
        </h1>
        <p class="flex items-center gap-1.5 body1 text-gray-700">
          <LocationIcon class="size-6 text-red-200" />
          <span>{{ displayLocation }}</span>
        </p>

        <dl class="w-[342px] mt-5 grid gap-2.5">
          <div class="grid grid-cols-[0.9fr_1fr] items-start">
            <dt class="body2 text-gray-900">Sexual identities</dt>
            <dd class="body2 text-gray-700">{{ fields.identity }}</dd>
          </div>
          <div class="grid grid-cols-[0.9fr_1fr] items-start">
            <dt class="body2 text-gray-900">Sexual preferences</dt>
            <dd class="body2 text-gray-700">{{ fields.preference }}</dd>
          </div>
          <div class="grid grid-cols-[0.9fr_1fr] items-start">
            <dt class="body2 text-gray-900">Racial preferences</dt>
            <dd class="body2 text-gray-700">{{ fields.racial }}</dd>
          </div>
          <div class="grid grid-cols-[0.9fr_1fr] items-start">
            <dt class="body2 text-gray-900">Meeting interests</dt>
            <dd class="body2 text-gray-700">{{ fields.meeting }}</dd>
          </div>
        </dl>

        <section class="mt-5 flex flex-col gap-3">
          <h2 class="headline4">About me</h2>
          <p class="body2 text-gray-900">{{ aboutText }}</p>
        </section>

        <section class="mt-5 flex flex-col gap-3">
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
      </div>
    </div>
  </article>
</template>
