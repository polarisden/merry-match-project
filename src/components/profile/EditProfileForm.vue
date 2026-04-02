<template>
  <div>
    <form class="space-y-9 lg:mt-10">
      <p
        v-if="formError"
        class="rounded-lg border border-red-200 bg-red-100 px-3 py-2 body2 text-red-700"
        role="alert"
      >
        {{ formError }}
      </p>
      <p
        v-if="formSuccess"
        class="rounded-lg border border-green-200 bg-green-100 px-3 py-2 body2 text-green-700"
        role="status"
      >
        {{ formSuccess }}
      </p>
      <section class="flex flex-col gap-6 lg:pt-6">
        <h2 class="headline4 text-gray-900">Basic Information</h2>
        <div class="mt-3 grid gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-10">
          <div>
            <label class="mb-1.5 block body2">Name</label>
            <input
              type="text"
              v-model="formValues.name"
              class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              placeholder="Jon Snow"
            />
          </div>

          <div>
            <label class="mb-1.5 block body2">Date of birth</label>
            <CalendarPicker v-model="formValues.dateOfBirth" placeholder="01/01/2008" />
          </div>

          <div
            class="relative"
            data-custom-dropdown
          >
            <label class="mb-1.5 block body2">Location</label>
            <button
              type="button"
              class="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 body2 outline-none flex items-center justify-between focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              @click.stop="toggleDropdown('location')"
            >
              <span
                class="truncate text-left"
                :class="selectedLocationLabel ? 'text-black' : 'text-gray-600'"
              >
                {{ selectedLocationLabel || 'Thailand' }}
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
              class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 shadow-sm p-2 max-h-56 overflow-y-auto lg:bg-white"
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
            class="relative"
            data-custom-dropdown
          >
            <label class="mb-1.5 block body2">City</label>
            <button
              type="button"
              :disabled="!formValues.location || !cityOptions.length"
              class="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 body2 outline-none flex items-center justify-between disabled:bg-gray-200 disabled:text-gray-400 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              @click.stop="toggleDropdown('city')"
            >
              <span
                class="truncate text-left"
                :class="selectedCityLabel ? 'text-black' : 'text-gray-600'"
              >
                {{ selectedCityLabel || (formValues.location ? 'Select city' : 'Select country first') }}
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
              class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 shadow-sm p-2 max-h-56 overflow-y-auto lg:bg-white"
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

          <div>
            <label class="mb-1.5 block body2">Username</label>
            <input
              type="text"
              v-model="formValues.username"
              class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              placeholder="At least 6 character"
            />
          </div>

          <div>
            <label class="mb-1.5 block body2">Email</label>
            <input
              type="email"
              v-model="formValues.email"
              class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              readonly
              placeholder="name@website.com"
            />
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-6 lg:pt-10">
        <h2 class="headline4 text-gray-900">Identities and Interests</h2>
        <div class="mt-3 grid gap-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-10">
          <div class="relative" data-custom-dropdown>
            <label class="mb-1.5 block body2">Sexual identities</label>
            <button
              type="button"
              class="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 body2 outline-none flex items-center justify-between focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              @click.stop="toggleDropdown('sexualIdentity')"
            >
              <span class="truncate text-left" :class="selectedSexualIdentityLabel ? 'text-black' : 'text-gray-600'">
                {{ selectedSexualIdentityLabel || "Male" }}
              </span>
              <span class="text-[10px] text-gray-500 transition-transform" :class="{ 'rotate-180': openDropdown === 'sexualIdentity' }">▼</span>
            </button>
            <div
              v-if="openDropdown === 'sexualIdentity'"
              class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 shadow-sm p-2 max-h-56 overflow-y-auto lg:bg-white"
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

          <div class="relative" data-custom-dropdown>
            <label class="mb-1.5 block body2">Sexual preferences</label>
            <button
              type="button"
              class="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 body2 outline-none flex items-center justify-between focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              @click.stop="toggleDropdown('sexualPreference')"
            >
              <span class="truncate text-left" :class="selectedSexualPreferenceLabel ? 'text-black' : 'text-gray-600'">
                {{ selectedSexualPreferenceLabel || "Female" }}
              </span>
              <span class="text-[10px] text-gray-500 transition-transform" :class="{ 'rotate-180': openDropdown === 'sexualPreference' }">▼</span>
            </button>
            <div
              v-if="openDropdown === 'sexualPreference'"
              class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 shadow-sm p-2 max-h-56 overflow-y-auto lg:bg-white"
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

          <div class="relative" data-custom-dropdown>
            <label class="mb-1.5 block body2">Racial preferences</label>
            <button
              type="button"
              class="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 body2 outline-none flex items-center justify-between focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              @click.stop="toggleDropdown('racialPreference')"
            >
              <span class="truncate text-left" :class="selectedRacialPreferenceLabel ? 'text-black' : 'text-gray-600'">
                {{ selectedRacialPreferenceLabel || "Asia" }}
              </span>
              <span class="text-[10px] text-gray-500 transition-transform" :class="{ 'rotate-180': openDropdown === 'racialPreference' }">▼</span>
            </button>
            <div
              v-if="openDropdown === 'racialPreference'"
              class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 shadow-sm p-2 max-h-56 overflow-y-auto lg:bg-white"
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

          <div class="relative" data-custom-dropdown>
            <label class="mb-1.5 block body2">Meeting interests</label>
            <button
              type="button"
              class="h-11 w-full rounded-xl border border-gray-300 bg-gray-100 px-4 body2 outline-none flex items-center justify-between focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
              @click.stop="toggleDropdown('meetingInterest')"
            >
              <span class="truncate text-left" :class="selectedMeetingInterestLabel ? 'text-black' : 'text-gray-600'">
                {{ selectedMeetingInterestLabel || "Friends" }}
              </span>
              <span class="text-[10px] text-gray-500 transition-transform" :class="{ 'rotate-180': openDropdown === 'meetingInterest' }">▼</span>
            </button>
            <div
              v-if="openDropdown === 'meetingInterest'"
              class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 shadow-sm p-2 max-h-56 overflow-y-auto lg:bg-white"
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

          <ProfileInterestsPicker
            :interest-tags="interestTags"
            :selected-interest-tags="selectedInterestTags"
            :max="10"
            @toggle="handleToggleInterestTag"
            @remove="removeInterestTag"
          />
          <BioTextarea v-model="bio" :max="150" />
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
              @error="handleImageLoadError(slot.key)"
            />
            <button
              v-if="slot.image"
              type="button"
              class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-xl text-white hover:cursor-pointer"
              aria-label="Remove photo"
              @click="deleteImageForSlot(slot.key)"
            >
              ×
            </button>
            <button
              v-else
              type="button"
              class="flex h-full w-full flex-col items-center justify-center text-purple-600"
              @click="triggerImagePicker(slot.key)"
            >
              <span class="text-[26px] leading-none">+</span>
              <span class="mt-1 body4 text-purple-600">{{ slot.label }}</span>
            </button>
          </div>
        </div>
      </section>
    </form>

    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleSelectedImage"
    >

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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import CalendarPicker from "@/components/ui/CalendarPicker.vue";
import { useNotices } from "@/components/ui/composables/useNotices";
import BioTextarea from "@/components/ui/BioTextarea.vue";
import ProfileInterestsPicker from "@/components/profile/ProfileInterestsPicker.vue";

import { useRegisterFormState } from "@/views/register/useRegisterFormState";
import {
  meetingInterestOptions,
  racialPreferenceOptions,
  sexualIdentityOptions,
  sexualPreferenceOptions,
} from "@/views/register/registerConstants";
import { useRegisterInterests } from "@/views/register/useRegisterInterests";
import { deleteMyProfileImage, getMyProfile, listMyProfileImages, updateMyProfile, uploadMyProfileImage } from "@/views/profile/profileApi";
import { useEditProfileImages } from "@/components/profile/composables/useEditProfileImages";
import { useEditProfileSync } from "@/components/profile/composables/useEditProfileSync";

const emit = defineEmits(["delete-account"]);

const {
  formValues,
  openDropdown,
  locationOptions,
  cityOptions,
  selectedLocationLabel,
  selectedCityLabel,
  selectedSexualIdentityLabel,
  selectedSexualPreferenceLabel,
  selectedRacialPreferenceLabel,
  selectedMeetingInterestLabel,
  toggleDropdown,
  selectLocation,
  selectCity,
  selectSexualIdentity,
  selectSexualPreference,
  selectRacialPreference,
  selectMeetingInterest,
  handleDocumentClick,
} = useRegisterFormState();

const {
  interestTags,
  selectedInterestTags,
  interestOptions,
  toggleInterestTag,
  removeInterestTag,
  fetchInterests,
} = useRegisterInterests()

const bio = ref("")
const token = ref(localStorage.getItem("token") ?? "")

const { error: formError, success: formSuccess, loading: formLoading, clear: clearNotices, setError: setFormError, setSuccess: setFormSuccess, setLoading } = useNotices()

const {
  photoSlots,
  imageInputRef,
  uploadedImagesCount,
  triggerImagePicker,
  handleSelectedImage,
  deleteImageForSlot,
  handleImageLoadError,
  setSlotsFromApiImages,
  cleanupObjectUrls,
} = useEditProfileImages({
  tokenRef: token,
  setFormError,
  clearNotices,
  setLoading,
  uploadMyProfileImage,
  deleteMyProfileImage,
})

const { loadProfile, submitUpdate: submitUpdateInternal } = useEditProfileSync({
  tokenRef: token,
  formValues,
  locationOptions,
  cityOptions,
  bioRef: bio,
  selectedInterestTags,
  interestOptions,
  fetchInterests,
  setSlotsFromApiImages,
  setFormError,
  setFormSuccess,
  clearNotices,
  setLoading,
  getMyProfile,
  listMyProfileImages,
  updateMyProfile,
})

function submitUpdate() {
  return submitUpdateInternal({ uploadedImagesCount: uploadedImagesCount.value })
}

function handleToggleInterestTag(tag) {
  if (!selectedInterestTags.value.includes(tag) && selectedInterestTags.value.length >= 10) {
    formError.value = "ครบ 10 อันแล้ว"
    return
  }
  toggleInterestTag(tag)
}

defineExpose({ submitUpdate })

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  loadProfile()
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  cleanupObjectUrls()
});
</script>
