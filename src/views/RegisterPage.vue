<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { Country, State } from "country-state-city"
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
  { title: "Profile pictures" },
]

const stepFields = {
  1: [
    { label: "Name", type: "text", placeholder: "Jon Snow" },
    { label: "Date of birth", type: "date", placeholder: "01/01/2008" },
    { label: "Location", type: "select", placeholder: "Thailand" },
    { label: "City", type: "select", placeholder: "Select city" },
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
const countries = Country.getAllCountries()
const defaultLocation = "TH"
const defaultBangkok =
  State.getStatesOfCountry(defaultLocation).find((state) =>
    state.name.toLowerCase().includes("bangkok"),
  )?.isoCode ?? ""
const formValues = reactive({
  location: defaultLocation,
  city: defaultBangkok,
  sexualIdentity: "",
  sexualPreference: "",
  racialPreference: "Asia",
  meetingInterest: "Dating",
})
const openDropdown = ref(null)
const sexualIdentityOptions = ["Male", "Female", "LGBTQIAN+"]
const sexualPreferenceOptions = ["Male", "Female", "LGBTQIAN+"]
const racialPreferenceOptions = [
  "Africa",
  "Antarctica",
  "Australia/Oceania",
  "Asia",
  "Europe",
  "North America",
  "South America",
]
const meetingInterestOptions = [
  "Activity partner",
  "Casual dating",
  "Chatting",
  "Creative collaboration",
  "Dating",
  "Food buddy",
  "Gaming buddy",
  "Long-term relationship",
  "Networking",
  "New friends",
  "Party / Nightlife",
  "Study partner",
  "Travel buddy",
  "Workout partner",
]

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
const locationOptions = computed(() =>
  countries.map((country) => ({
    value: country.isoCode,
    label: country.name,
  })),
)
const cityOptions = computed(() => {
  if (!formValues.location) return []

  return State.getStatesOfCountry(formValues.location).map((state) => ({
    value: state.isoCode,
    label: state.name,
  }))
})
const selectedLocationLabel = computed(() => {
  return locationOptions.value.find((country) => country.value === formValues.location)?.label ?? ""
})
const selectedCityLabel = computed(() => {
  return cityOptions.value.find((city) => city.value === formValues.city)?.label ?? ""
})
const selectedSexualIdentityLabel = computed(() => formValues.sexualIdentity)
const selectedSexualPreferenceLabel = computed(() => formValues.sexualPreference)
const selectedRacialPreferenceLabel = computed(() => formValues.racialPreference)
const selectedMeetingInterestLabel = computed(() => formValues.meetingInterest)

watch(
  () => formValues.location,
  (newLocation) => {
    const states = newLocation ? State.getStatesOfCountry(newLocation) : []
    formValues.city = states[0]?.isoCode ?? ""
  },
)

function toggleDropdown(name) {
  if (name === "city" && (!formValues.location || !cityOptions.value.length)) return
  openDropdown.value = openDropdown.value === name ? null : name
}

function selectLocation(isoCode) {
  formValues.location = isoCode
  openDropdown.value = null
}

function selectCity(isoCode) {
  formValues.city = isoCode
  openDropdown.value = null
}

function selectSexualIdentity(identity) {
  formValues.sexualIdentity = identity
  openDropdown.value = null
}

function selectSexualPreference(preference) {
  formValues.sexualPreference = preference
  openDropdown.value = null
}

function selectRacialPreference(preference) {
  formValues.racialPreference = preference
  openDropdown.value = null
}

function selectMeetingInterest(interest) {
  formValues.meetingInterest = interest
  openDropdown.value = null
}

function handleDocumentClick(event) {
  const target = event.target
  if (!(target instanceof Element)) return
  if (!target.closest("[data-custom-dropdown]")) {
    openDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick)
})

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
        
        <p class="mt-1 body2 text-gray-700">
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
          <label class="block body2 text-gray-900 mb-1.5">
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
              class="w-full h-11 px-3 pr-10 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white placeholder:text-gray-500 body2 outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
              :placeholder="field.placeholder"
            />

            <div
              v-else-if="field.label === 'Location'"
              class="relative"
              data-custom-dropdown
            >
              <button
                type="button"
                class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 text-gray-700 outline-none flex items-center justify-between"
                @click.stop="toggleDropdown('location')"
              >
                <span class="truncate text-left text-gray-600">{{ selectedLocationLabel || field.placeholder }}</span>
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
                class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 text-gray-700 outline-none flex items-center justify-between disabled:bg-gray-200 disabled:text-gray-400"
                @click.stop="toggleDropdown('city')"
              >
                <span class="truncate text-left text-gray-600">
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
                class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 text-gray-700 outline-none flex items-center justify-between"
                @click.stop="toggleDropdown('sexualIdentity')"
              >
                <span class="truncate text-left text-gray-600">{{ selectedSexualIdentityLabel || field.placeholder }}</span>
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
                class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 text-gray-700 outline-none flex items-center justify-between"
                @click.stop="toggleDropdown('sexualPreference')"
              >
                <span class="truncate text-left text-gray-600">{{ selectedSexualPreferenceLabel || field.placeholder }}</span>
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
                class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 text-gray-700 outline-none flex items-center justify-between"
                @click.stop="toggleDropdown('racialPreference')"
              >
                <span class="truncate text-left text-gray-600">{{ selectedRacialPreferenceLabel || field.placeholder }}</span>
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
                class="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 lg:bg-white body2 text-gray-700 outline-none flex items-center justify-between"
                @click.stop="toggleDropdown('meetingInterest')"
              >
                <span class="truncate text-left text-gray-600">
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

            <select
              v-else
              class="w-full h-11 px-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white body2 text-gray-600 appearance-none outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
            >
              <option
                value=""
                selected
                disabled
              >
                {{ field.placeholder }}
              </option>
            </select>

            <span
              v-if="field.type === 'select' && field.label !== 'Location' && field.label !== 'City' && field.label !== 'Sexual identities' && field.label !== 'Sexual preferences' && field.label !== 'Racial preferences' && field.label !== 'Meeting interests'"
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
          <label class="block body2 text-gray-900 mb-1.5">
            Hobbies / Interests (Maximum 10)
          </label>
          <div class="w-full min-h-11 px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white flex flex-wrap gap-1.5">
            <span
              v-for="tag in interestTags"
              :key="tag"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 body4 text-purple-500 leading-none"
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

    
  </div>
  <div class="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 lg:bg-white">
      <div class="w-full max-w-[390px] lg:max-w-[1440px]  mx-auto px-4 lg:px-50 py-4 flex items-center justify-between">
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
</template>
