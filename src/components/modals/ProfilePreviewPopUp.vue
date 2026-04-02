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
      @click.stop
    >
      <button
        type="button"
        class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="Close profile preview"
        @click="emit('close')"
      >
        <ExitIcon class="h-10 w-10" aria-hidden="true" />
      </button>

      <div class="w-[980px] h-[579px] grid grid-cols-[478px_1fr] gap-15">
        <section aria-label="Profile photo">
          <div class="relative overflow-hidden rounded-4xl bg-gray-200">
            <img
              class="h-[478px] w-[478px] object-cover object-center transition duration-300 hover:scale-110"
              :src="placeholderPhotoSrc"
              width="400"
              height="520"
              alt="Sample profile photo"
            />
          </div>

          <div class="flex items-center justify-between">
            <span class="body2 text-gray-700 flex h-[48px] w-[72px] items-center justify-center font-semibold">
              1<span class="text-gray-600"> /2</span>
            </span>
            <div class="flex">
              <button
                type="button"
                class="flex size-12 cursor-pointer items-center justify-center text-gray-600"
                aria-label="Previous photo"
              >
                <ArrowIcon class="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="flex size-12 cursor-pointer items-center justify-center text-gray-600"
                aria-label="Next photo"
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
            <LocationIcon class="text-6" />
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
                :key="index"
                class="body2 flex h-[40px] w-[74px] items-center justify-center rounded-xl border border-purple-300 bg-white text-purple-600"
              >
                {{ tag }}
              </li>
            </ul>
          </section>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import ExitIcon from "@/assets/icons/exit.svg?component"
import ArrowIcon from "@/assets/icons/arrow.svg?component"
import XIcon from "@/assets/icons/x.svg?component"
import HeartIcon from "@/assets/icons/heart.svg?component"
import LocationIcon from "@/assets/icons/location.svg?component"
import placeholderPhotoSrc from "@/assets/images/profile-pic.png"

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["close"])

/** Placeholder copy for layout; replace with props/store when backend is wired up. */
const displayName = "Jon Snow"
const displayAge = "26"
const displayLocation = "Bangkok, Thailand"
const aboutText = "I know nothing..but you"
const hobbyTags = ["e-sport", "dragon", "series"]
const fields = {
  identity: "Male",
  preference: "Female",
  racial: "Asian",
  meeting: "Friends",
}
</script>
