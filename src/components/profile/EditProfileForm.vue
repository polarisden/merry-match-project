<template>
  <div>
    <form class="space-y-9 lg:mt-10">
      <section class="flex flex-col gap-6 lg:pt-6">
        <h2 class="headline4 text-gray-900">Basic Information</h2>
        <div class="mt-3 grid gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-10">
          <div>
            <label class="mb-1.5 block body2">Name</label>
            <input
              type="text"
              class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              placeholder="Jon Snow"
            />
          </div>

          <div>
            <label class="mb-1.5 block body2">Date of birth</label>
            <CalendarPicker v-model="dateOfBirth" placeholder="01/01/2008" />
          </div>

          <div class="relative">
            <label class="mb-1.5 block body2">Location</label>
            <select
              class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-gray-100 px-3 pr-8 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
            >
              <option selected>Thailand</option>
            </select>
            <span class="pointer-events-none absolute right-4 top-[46px] text-[8px] text-gray-500">▼</span>
          </div>

          <div class="relative">
            <label class="mb-1.5 block body2">City</label>
            <select
              class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-gray-100 px-3 pr-8 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
            >
              <option selected>Bangkok</option>
            </select>
            <span class="pointer-events-none absolute right-4 top-[46px] text-[8px] text-gray-500">▼</span>
          </div>

          <div>
            <label class="mb-1.5 block body2">Username</label>
            <input
              type="text"
              class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              placeholder="At least 6 character"
            />
          </div>

          <div>
            <label class="mb-1.5 block body2">Email</label>
            <input
              type="email"
              class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              placeholder="name@website.com"
            />
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-6 lg:pt-10">
        <h2 class="headline4 text-gray-900">Identities and Interests</h2>
        <div class="mt-3 grid gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-10">
          <div
            v-for="field in identityFields"
            :key="field.label"
            class="relative"
          >
            <label class="mb-1.5 block body2">{{ field.label }}</label>
            <select
              class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-gray-100 px-3 pr-8 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
            >
              <option selected>{{ field.placeholder }}</option>
            </select>
            <span class="pointer-events-none absolute right-4 top-[46px] text-[10px] text-gray-500">▼</span>
          </div>

          <div class="lg:col-span-2">
            <label class="mb-1.5 block body2">Hobbies / Interests (Maximum 10)</label>
            <div class="flex min-h-11 w-full flex-wrap gap-1.5 rounded-lg border border-gray-300 bg-gray-100 px-2 py-2 lg:bg-white">
              <span
                v-for="tag in interestTags"
                :key="tag"
                class="inline-flex items-center gap-2 rounded-md bg-purple-100 px-2 py-1 body4 leading-none text-purple-600"
              >
                {{ tag }} <span class="text-purple-600">x</span>
              </span>
            </div>
          </div>

          <div class="lg:col-span-2">
            <label class="mb-1.5 block body2">About me (Maximum 150 characters)</label>
            <textarea
              rows="4"
              class="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              placeholder="I know nothing..but you"
            />
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-1 lg:pt-10">
        <h2 class="headline4 text-purple-500">Profile pictures</h2>
        <p class="mt-1 body2 text-gray-800">Upload at least 2 photos</p>
        <div class="my-6 grid grid-cols-2 gap-2 lg:grid-cols-5 lg:gap-4">
          <div
            v-for="slot in photoSlots"
            :key="slot.key"
            class="relative w-[167px] h-[167px] rounded-xl bg-gray-200"
          >
            <img
              v-if="slot.image"
              :src="slot.image"
              :alt="slot.label"
              class="h-full w-full rounded-xl object-cover"
            />
            <button
              v-if="slot.image"
              type="button"
              class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-xl text-white"
              aria-label="Remove photo"
            >
              ×
            </button>
            <button
              v-else
              type="button"
              class="flex h-full w-full flex-col items-center justify-center text-purple-600"
            >
              <span class="text-[26px] leading-none">+</span>
              <span class="mt-1 body4 text-purple-600">{{ slot.label }}</span>
            </button>
          </div>
        </div>
      </section>
    </form>

    <div class="mt-8 lg:hidden">
      <slot name="mobile-actions" />
    </div>

    <button
      type="button"
      class="mt-12 block w-full text-center body2-w-700  text-gray-700 hover:cursor-pointer lg:mt-10 lg:ml-auto lg:w-auto"
      @click="emit('delete-account')"
    >
      Delete account
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CalendarPicker from "@/components/ui/CalendarPicker.vue";
import profilePicSrc from "@/assets/images/profile-pic.png";

const emit = defineEmits(["delete-account"]);

const dateOfBirth = ref("");

const identityFields = [
  { label: "Sexual identities", placeholder: "Male" },
  { label: "Sexual preferences", placeholder: "Female" },
  { label: "Racial preferences", placeholder: "Asian" },
  { label: "Meeting interests", placeholder: "Friends" },
];

const interestTags = ["e-sport", "series", "dragon"];

const photoSlots = [
  { key: "photo-1", label: "Upload photo", image: profilePicSrc },
  { key: "photo-2", label: "Upload photo", image: profilePicSrc },
  { key: "slot-3", label: "Upload photo", image: null },
  { key: "slot-4", label: "Upload photo", image: null },
  { key: "slot-5", label: "Upload photo", image: null },
];
</script>
