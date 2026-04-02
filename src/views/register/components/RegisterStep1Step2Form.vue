<template>
  <form class="mt-4 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-6 lg:relative">
    <p
      v-if="registerError"
      class="col-span-2 rounded-lg border border-red-200 bg-red-100 px-3 py-2 body2 text-red-700"
      role="alert"
    >
      {{ registerError }}
    </p>

    <div
      v-for="field in fields"
      :key="`${field.label}-${field.placeholder}`"
    >
      <label class="block body2 text-gray-900 mb-1.5">
        {{ field.label }}
      </label>

      <div class="relative">
        <CalendarPicker
          v-if="field.type === 'date'"
          v-model="formValues[field.modelKey]"
          :placeholder="field.placeholder"
        />

        <input
          v-else-if="field.type !== 'select'"
          :type="field.type === 'password' ? (isPasswordVisible(field.modelKey) ? 'text' : 'password') : field.type"
          v-model="formValues[field.modelKey]"
          class="w-full h-11 px-3 pr-10 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white placeholder:text-gray-500 body2 text-black outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
          :placeholder="field.placeholder"
        />
        <button
          v-if="field.type === 'password'"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-md text-gray-600 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 hover:cursor-pointer"
          :aria-label="isPasswordVisible(field.modelKey) ? 'Hide password' : 'Show password'"
          @click="togglePasswordVisible(field.modelKey)"
        >
          <svg
            v-if="!isPasswordVisible(field.modelKey)"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            class="size-5"
            aria-hidden="true"
          >
            <path
              d="M2.2 12C4.3 7.6 7.9 5 12 5s7.7 2.6 9.8 7c-2.1 4.4-5.7 7-9.8 7s-7.7-2.6-9.8-7Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="M12 16.3A4.3 4.3 0 1 0 12 7.7a4.3 4.3 0 0 0 0 8.6Z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            class="size-5"
            aria-hidden="true"
          >
            <path
              d="M4 4l16 16"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <path
              d="M2.2 12C4.3 7.6 7.9 5 12 5c2.1 0 4.1.7 5.8 2"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="M9.1 9.1A4.3 4.3 0 0 0 12 16.3c.8 0 1.6-.2 2.2-.6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="M6.2 6.2C4.5 7.5 3.1 9.4 2.2 12c2.1 4.4 5.7 7 9.8 7 1.7 0 3.3-.4 4.8-1.2"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <p
          v-if="field.type === 'email' && formValues.email && !isValidEmail(String(formValues.email))"
          class="mt-1 text-red-500 text-sm"
          role="alert"
        >
          Please enter a valid email address.
        </p>

        <div
          v-else-if="field.label === 'Location'"
          class="relative"
          data-custom-dropdown
        >
          <button
            type="button"
            class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 outline-none flex items-center justify-between"
            @click.stop="toggleDropdown('location')"
          >
            <span
              class="truncate text-left"
              :class="selectedLocationLabel ? 'text-black' : 'text-gray-600'"
            >
              {{ selectedLocationLabel || field.placeholder }}
            </span>
            <span
              class="text-[10px] text-gray-500 transition-transform"
              :class="{ 'rotate-180': openDropdown === 'location' }"
            >
              ▼
            </span>
          </button>
          <div
            v-if="openDropdown === 'location'"
            class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto"
          >
            <button
              v-for="country in locationOptions"
              :key="country.value"
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left body2 text-gray-700 hover:bg-gray-200"
              @click="selectLocation(country.value)"
            >
              {{ country.label }}
            </button>
          </div>
        </div>

        <div
          v-else-if="field.label === 'City'"
          class="relative"
          data-custom-dropdown
        >
          <button
            type="button"
            :disabled="!formValues.location || !cityOptions.length"
            class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 outline-none flex items-center justify-between disabled:bg-gray-200 disabled:text-gray-400"
            @click.stop="toggleDropdown('city')"
          >
            <span
              class="truncate text-left"
              :class="selectedCityLabel ? 'text-black' : 'text-gray-600'"
            >
              {{ selectedCityLabel || (formValues.location ? field.placeholder : "Select country first") }}
            </span>
            <span
              class="text-[10px] text-gray-500 transition-transform"
              :class="{ 'rotate-180': openDropdown === 'city' }"
            >
              ▼
            </span>
          </button>
          <div
            v-if="openDropdown === 'city' && cityOptions.length"
            class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto"
          >
            <button
              v-for="city in cityOptions"
              :key="city.value"
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left body2 text-gray-700 hover:bg-gray-200"
              @click="selectCity(city.value)"
            >
              {{ city.label }}
            </button>
          </div>
        </div>

        <div
          v-else-if="field.label === 'Sexual identities'"
          class="relative"
          data-custom-dropdown
        >
          <button
            type="button"
            class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 outline-none flex items-center justify-between"
            @click.stop="toggleDropdown('sexualIdentity')"
          >
            <span
              class="truncate text-left"
              :class="selectedSexualIdentityLabel ? 'text-black' : 'text-gray-600'"
            >
              {{ selectedSexualIdentityLabel || field.placeholder }}
            </span>
            <span
              class="text-[10px] text-gray-500 transition-transform"
              :class="{ 'rotate-180': openDropdown === 'sexualIdentity' }"
            >
              ▼
            </span>
          </button>
          <div
            v-if="openDropdown === 'sexualIdentity'"
            class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto"
          >
            <button
              v-for="identity in sexualIdentityOptions"
              :key="identity"
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left body2 text-gray-700 hover:bg-gray-200"
              @click="selectSexualIdentity(identity)"
            >
              {{ identity }}
            </button>
          </div>
        </div>

        <div
          v-else-if="field.label === 'Sexual preferences'"
          class="relative"
          data-custom-dropdown
        >
          <button
            type="button"
            class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 outline-none flex items-center justify-between"
            @click.stop="toggleDropdown('sexualPreference')"
          >
            <span
              class="truncate text-left"
              :class="selectedSexualPreferenceLabel ? 'text-black' : 'text-gray-600'"
            >
              {{ selectedSexualPreferenceLabel || field.placeholder }}
            </span>
            <span
              class="text-[10px] text-gray-500 transition-transform"
              :class="{ 'rotate-180': openDropdown === 'sexualPreference' }"
            >
              ▼
            </span>
          </button>
          <div
            v-if="openDropdown === 'sexualPreference'"
            class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto"
          >
            <button
              v-for="preference in sexualPreferenceOptions"
              :key="preference"
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left body2 text-gray-700 hover:bg-gray-200"
              @click="selectSexualPreference(preference)"
            >
              {{ preference }}
            </button>
          </div>
        </div>

        <div
          v-else-if="field.label === 'Racial preferences'"
          class="relative"
          data-custom-dropdown
        >
          <button
            type="button"
            class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 outline-none flex items-center justify-between"
            @click.stop="toggleDropdown('racialPreference')"
          >
            <span
              class="truncate text-left"
              :class="selectedRacialPreferenceLabel ? 'text-black' : 'text-gray-600'"
            >
              {{ selectedRacialPreferenceLabel || field.placeholder }}
            </span>
            <span
              class="text-[10px] text-gray-500 transition-transform"
              :class="{ 'rotate-180': openDropdown === 'racialPreference' }"
            >
              ▼
            </span>
          </button>
          <div
            v-if="openDropdown === 'racialPreference'"
            class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto"
          >
            <button
              v-for="race in racialPreferenceOptions"
              :key="race"
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left body2 text-gray-700 hover:bg-gray-200"
              @click="selectRacialPreference(race)"
            >
              {{ race }}
            </button>
          </div>
        </div>

        <div
          v-else-if="field.label === 'Meeting interests'"
          class="relative"
          data-custom-dropdown
        >
          <button
            type="button"
            class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 outline-none flex items-center justify-between"
            @click.stop="toggleDropdown('meetingInterest')"
          >
            <span
              class="truncate text-left"
              :class="selectedMeetingInterestLabel ? 'text-black' : 'text-gray-600'"
            >
              {{ selectedMeetingInterestLabel || field.placeholder }}
            </span>
            <span
              class="text-[10px] text-gray-500 transition-transform"
              :class="{ 'rotate-180': openDropdown === 'meetingInterest' }"
            >
              ▼
            </span>
          </button>
          <div
            v-if="openDropdown === 'meetingInterest'"
            class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto"
          >
            <button
              v-for="interest in meetingInterestOptions"
              :key="interest"
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left body2 text-gray-700 hover:bg-gray-200"
              @click="selectMeetingInterest(interest)"
            >
              {{ interest }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="currentStep === 2"
      class="lg:col-span-2"
    >
      <label class="block body2 text-gray-900 mb-1.5">
        Hobbies / Interests (Maximum 10)
      </label>
      <div class="w-full min-h-11 px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white flex flex-wrap gap-1.5">
        <span
          v-if="selectedInterestTags.length === 0"
          class="body2 text-gray-500 px-1 py-0.5"
        >
          Select interests
        </span>
        <button
          v-for="tag in selectedInterestTags"
          :key="`selected-${tag}`"
          type="button"
          class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 body4 text-purple-500 leading-none"
          @click="removeInterestTag(tag)"
        >
          {{ tag }} <span class="text-purple-300">x</span>
        </button>
      </div>

      <div class="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto flex flex-wrap gap-2">
        <button
          v-for="tag in interestTags"
          :key="tag"
          type="button"
          class="px-3 py-1.5 rounded-md body2 border transition"
          :class="selectedInterestTags.includes(tag)
            ? 'border-purple-300 bg-purple-100 text-purple-500'
            : 'border-gray-300 text-gray-700 hover:bg-gray-200'"
          :disabled="!selectedInterestTags.includes(tag) && selectedInterestTags.length >= 10"
          @click="toggleInterestTag(tag)"
        >
          {{ tag }}
        </button>
      </div>

      <div class="mt-2 text-xs text-gray-500">
        {{ selectedInterestTags.length }}/10 selected
      </div>
    </div>

    <div
      v-if="currentStep === 2"
      class="lg:col-span-2"
    >
      <label class="mb-1.5 flex items-center justify-between gap-3 body2 text-gray-900">
        <span>About me (Maximum 150 characters)</span>
        <span class="text-gray-500">{{ (formValues.bio || '').length }}/150</span>
      </label>
      <textarea
        v-model="formValues.bio"
        rows="4"
        class="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 body2 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 lg:bg-white"
        placeholder="I know nothing..but you"
        @input="handleBioInput"
      />
    </div>

    <img
      :src="ellipse4Icon"
      alt=""
      aria-hidden="true"
      class="hidden lg:block fixed right-0 bottom-[230px] w-[45px] h-[59px] pointer-events-none select-none z-10"
    />
  </form>
</template>

<script setup>
import CalendarPicker from "@/components/ui/CalendarPicker.vue"
import { isValidEmail } from "@/views/register/registerValidation"
import { ref } from "vue"

const props = defineProps({
  fields: { type: Array, required: true },
  formValues: { type: Object, required: true },
  registerError: { type: String, required: true },
  openDropdown: { type: String, default: null },
  locationOptions: { type: Array, required: true },
  cityOptions: { type: Array, required: true },
  selectedLocationLabel: { type: String, default: "" },
  selectedCityLabel: { type: String, default: "" },
  selectedSexualIdentityLabel: { type: String, default: "" },
  selectedSexualPreferenceLabel: { type: String, default: "" },
  selectedRacialPreferenceLabel: { type: String, default: "" },
  selectedMeetingInterestLabel: { type: String, default: "" },
  sexualIdentityOptions: { type: Array, required: true },
  sexualPreferenceOptions: { type: Array, required: true },
  racialPreferenceOptions: { type: Array, required: true },
  meetingInterestOptions: { type: Array, required: true },
  currentStep: { type: Number, required: true },
  interestTags: { type: Array, required: true },
  selectedInterestTags: { type: Array, required: true },
  ellipse4Icon: { type: String, required: true },
  toggleDropdown: { type: Function, required: true },
  selectLocation: { type: Function, required: true },
  selectCity: { type: Function, required: true },
  selectSexualIdentity: { type: Function, required: true },
  selectSexualPreference: { type: Function, required: true },
  selectRacialPreference: { type: Function, required: true },
  selectMeetingInterest: { type: Function, required: true },
  toggleInterestTag: { type: Function, required: true },
  removeInterestTag: { type: Function, required: true },
})

const emit = defineEmits(["update:registerError"])

const passwordVisibleKeys = ref(new Set())

function isPasswordVisible(modelKey) {
  return passwordVisibleKeys.value.has(String(modelKey))
}

function togglePasswordVisible(modelKey) {
  const key = String(modelKey)
  const next = new Set(passwordVisibleKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  passwordVisibleKeys.value = next
}

function handleBioInput() {
  const max = 150
  const v = String(props.formValues.bio || "")
  if (v.length <= max) return
  props.formValues.bio = v.slice(0, max)
  // message will be shown when trying to go next/submit
}
</script>
