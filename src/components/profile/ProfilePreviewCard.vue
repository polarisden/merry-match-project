<template>
  <article class="mx-auto min-h-dvh bg-white font-[Nunito,sans-serif] flex flex-col w-full max-w-[390px]">
    <section class="relative" aria-label="Profile photo">
      <div
        class="w-[375px] h-[315px] relative max-h-88 aspect-3/4 overflow-hidden rounded-b-[24px] bg-gray-200"
      >
        <img
          class="h-full w-full object-cover"
          :src="placeholderPhotoSrc"
          width="400"
          height="520"
          alt="Sample profile photo"
        />
        <button
          type="button"
          class="absolute top-4 left-4 flex size-9 cursor-pointer items-center justify-center  text-white"
          aria-label="Back"
          @click="goToEditProfile"
        >
          <ArrowIcon class="size-4" aria-hidden="true" />
        </button>
      </div>
      <div class="flex items-center justify-between px-0.5">
        <span class="body2 flex h-[48px] w-[72px] items-center justify-center font-semibold">
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

    <div class="h-full px-4 py-6 flex flex-col gap-2">
      <h1 class="m-0 flex flex-wrap items-baseline gap-2">
        <span class="headline2">
          {{ displayName }}
        </span>
        <span class="headline2 text-gray-700">{{ displayAge }}</span>
      </h1>
      <p class="flex items-center gap-1.5 body1 text-gray-700">
        <LocationIcon class="text-6"/>
        <span>{{ displayLocation }}</span>
      </p>

      <dl class="w-[342px] mt-5 grid gap-2.5">
        <div
          class="grid grid-cols-[0.9fr_1fr] items-start text-gray-700"
        >
          <dt class="body2 text-gray-900">Sexual identities</dt>
          <dd class="body2 text-gray-700">{{ fields.identity }}</dd>
        </div>
        <div
          class="grid grid-cols-[0.9fr_1fr] items-start text-gray-700"
        >
          <dt class="body2 text-gray-900">Sexual preferences</dt>
          <dd class="body2 text-gray-700">{{ fields.preference }}</dd>
        </div>
        <div
          class="grid grid-cols-[0.9fr_1fr] items-start text-gray-700"
        >
          <dt class="body2 text-gray-900">Racial preferences</dt>
          <dd class="body2 text-gray-700">{{ fields.racial }}</dd>
        </div>
        <div
          class="grid grid-cols-[0.9fr_1fr] items-start text-gray-700"
        >
          <dt class="body2 text-gray-900">Meeting interests</dt>
          <dd class="body2 text-gray-700">{{ fields.meeting }}</dd>
        </div>
      </dl>

      <section class="mt-5 flex flex-col gap-3">
        <h2 class="headline4">
          About me
        </h2>
        <p class="body2 text-gray-900 ">
          {{ aboutText }}
        </p>
      </section>

      <section class="mt-5 flex flex-col gap-3">
        <h2 class="headline4">
          Hobbies and Interests
        </h2>
        <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
          <li
            v-for="(tag, index) in hobbyTags"
            :key="index"
            class="rounded-xl border border-purple-300 bg-white w-[74px] h-[40px] body2 flex justify-center items-center text-purple-600"
          >
            {{ tag }}
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from "vue-router"
import ArrowIcon from '@/assets/icons/arrow.svg?component'
import LocationIcon from '@/assets/icons/location.svg?component'
import placeholderPhotoSrc from '@/assets/images/profile-pic.png'

const router = useRouter()

/** Placeholder copy for layout; replace with props or store when the backend is wired up. */
const displayName = 'Jon Snow'
const displayAge = '26'
const displayLocation = 'Bangkok, Thailand'
const aboutText = 'I know nothing..but you'
const hobbyTags = ['e-sport', 'dragon', 'series']
const fields = {
  identity: 'Male',
  preference: 'Female',
  racial: 'Asian',
  meeting: 'Friends',
}

function goToEditProfile() {
  router.push({ name: "edit-profile" })
}

</script>
