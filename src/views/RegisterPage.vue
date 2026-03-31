<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { Country, State } from "country-state-city"
import { useRouter } from "vue-router"
import BaseButtonPrimary from "@/components/base/BaseButtonPrimary.vue"
import CalendarPicker from "@/components/ui/CalendarPicker.vue"
import BaseButtonGhost from "@/components/base/BaseButtonGhost.vue"

const router = useRouter()
const ellipse2Icon = new URL("../assets/icons/Ellipse2.svg", import.meta.url).href
const ellipse3Icon = new URL("../assets/icons/Ellipse3.svg", import.meta.url).href
const ellipse4Icon = new URL("../assets/icons/Ellipse4.svg", import.meta.url).href

const currentStep = ref(1)

const steps = [
  { title: "Basic Information" },
  { title: "Identities and Interests" },
  { title: "Profile pictures" },
]

const stepFields = {
  1: [
    { label: "Name", modelKey: "name", type: "text", placeholder: "Jon Snow" },
    { label: "Date of birth", modelKey: "dateOfBirth", type: "date", placeholder: "01/01/2008" },
    { label: "Location", modelKey: "location", type: "select", placeholder: "Thailand" },
    { label: "City", modelKey: "city", type: "select", placeholder: "Select city" },
    { label: "Username", modelKey: "username", type: "text", placeholder: "At least 6 character" },
    { label: "Email", modelKey: "email", type: "email", placeholder: "name@website.com" },
    { label: "Password", modelKey: "password", type: "password", placeholder: "At least 8 character" },
    { label: "Confirm password", modelKey: "confirmPassword", type: "password", placeholder: "At least 8 character" },
  ],
  2: [
    { label: "Sexual identities", modelKey: "sexualIdentity", type: "select", placeholder: "Male" },
    { label: "Sexual preferences", modelKey: "sexualPreference", type: "select", placeholder: "Female" },
    { label: "Racial preferences", modelKey: "racialPreference", type: "select", placeholder: "Asian" },
    { label: "Meeting interests", modelKey: "meetingInterest", type: "select", placeholder: "Friends" },
  ],
}

const interestTags = ["esport", "series", "dragon"]

const totalPhotoSlots = 5
const selectedPhotos = ref([])
const photoInputRef = ref(null)
const photoObjectUrlsToRevoke = ref([])
const countries = Country.getAllCountries()
const defaultLocation = "TH"
const defaultBangkok =
  State.getStatesOfCountry(defaultLocation).find((state) =>
    state.name.toLowerCase().includes("bangkok"),
  )?.isoCode ?? ""
const formValues = reactive({
  name: "",
  dateOfBirth: "",
  location: defaultLocation,
  city: defaultBangkok,
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
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
    const photo = selectedPhotos.value[index]

    return {
      key: photo ? photo.file.name : `slot-${index + 1}`,
      label: photo ? "Change photo" : "Upload photo",
      previewUrl: photo?.previewUrl ?? "",
    }
  }),
)

const canGoBack = computed(() => currentStep.value > 1)
const nextLabel = computed(() => (currentStep.value === 3 ? "Confirm" : "Next step"))

const registerLoading = ref(false)
const registerError = ref("")

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

function triggerPhotoPicker() {
  photoInputRef.value?.click()
}

function handleSelectedPhotos(event) {
  const input = event.target
  if (!input?.files?.length) return

  const files = Array.from(input.files)
  const remainingSlots = totalPhotoSlots - selectedPhotos.value.length
  const toAdd = files.slice(0, Math.max(0, remainingSlots))

  for (const file of toAdd) {
    const previewUrl = URL.createObjectURL(file)
    photoObjectUrlsToRevoke.value.push(previewUrl)
    selectedPhotos.value.push({ file, previewUrl })
  }

  // Allow selecting the same file again later
  input.value = ""
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Failed to read photo file"))
    reader.readAsDataURL(file)
  })
}

/** Ensures JSON.stringify never drops keys due to undefined (backend often treats missing keys as empty). */
function strField(value) {
  if (value === undefined || value === null) return ""
  return typeof value === "string" ? value.trim() : String(value).trim()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseDuplicateCheckResult(body, field) {
  if (typeof body === "boolean") {
    return { available: body, message: body ? "" : "This value is already in use." }
  }

  if (!body || typeof body !== "object") {
    return { available: true, message: "" }
  }

  // Supports common API shapes:
  // { available: boolean }, { exists: boolean }, { isDuplicate: boolean }, { duplicate: boolean }
  if (typeof body.available === "boolean") {
    return { available: body.available, message: body.message ?? "" }
  }
  if (typeof body.exists === "boolean") {
    return { available: !body.exists, message: body.message ?? "" }
  }
  if (typeof body.isDuplicate === "boolean") {
    return { available: !body.isDuplicate, message: body.message ?? "" }
  }
  if (typeof body.duplicate === "boolean") {
    return { available: !body.duplicate, message: body.message ?? "" }
  }
  if (field === "username" && typeof body.usernameAvailable === "boolean") {
    return { available: body.usernameAvailable, message: body.message ?? "" }
  }
  if (field === "email" && typeof body.emailAvailable === "boolean") {
    return { available: body.emailAvailable, message: body.message ?? "" }
  }

  return { available: true, message: "" }
}

function isDuplicateMessage(message) {
  if (!message) return false
  const normalized = String(message).toLowerCase()
  return (
    normalized.includes("already") ||
    normalized.includes("duplicate") ||
    normalized.includes("exists") ||
    normalized.includes("taken") ||
    normalized.includes("in use")
  )
}

async function checkDuplicateField(field, value) {
  const requests =
    field === "email"
      ? [
          { url: `/api/auth/check-availability?email=${encodeURIComponent(value)}`, method: "GET" },
          {
            url: "/api/auth/check-availability",
            method: "POST",
            body: JSON.stringify({ email: value }),
          },
          { url: `/api/auth/check-email?email=${encodeURIComponent(value)}`, method: "GET" },
          { url: `/api/auth/check-duplicate?email=${encodeURIComponent(value)}`, method: "GET" },
          {
            url: "/api/auth/check-duplicate",
            method: "POST",
            body: JSON.stringify({ email: value }),
          },
        ]
      : [
          {
            url: `/api/auth/check-availability?username=${encodeURIComponent(value)}`,
            method: "GET",
          },
          {
            url: "/api/auth/check-availability",
            method: "POST",
            body: JSON.stringify({ username: value }),
          },
          { url: `/api/auth/check-username?username=${encodeURIComponent(value)}`, method: "GET" },
          { url: `/api/auth/check-duplicate?username=${encodeURIComponent(value)}`, method: "GET" },
          {
            url: "/api/auth/check-duplicate",
            method: "POST",
            body: JSON.stringify({ username: value }),
          },
        ]

  let sawReachableEndpoint = false

  for (const request of requests) {
    try {
      const res = await fetch(request.url, {
        method: request.method,
        headers: request.method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: request.body,
      })

      // Try next endpoint if route is not found.
      if (res.status === 404) continue
      sawReachableEndpoint = true

      // Some APIs return 409 on duplicate check, but not all 409 mean duplicate.
      if (res.status === 409) {
        const contentType = res.headers.get("content-type") ?? ""
        const body = contentType.includes("application/json") ? await res.json() : await res.text()
        const message =
          typeof body === "string" ? body : body?.message ?? body?.error ?? ""

        return {
          available: !isDuplicateMessage(message),
          message:
            message ||
            (field === "email" ? "Email is already in use." : "Username is already in use."),
        }
      }

      const contentType = res.headers.get("content-type") ?? ""
      const body = contentType.includes("application/json") ? await res.json() : await res.text()

      if (!res.ok) {
        const fallbackMessage =
          field === "email"
            ? "Unable to verify email right now."
            : "Unable to verify username right now."

        return {
          available: false,
          message:
            typeof body === "string" ? body : body?.message ?? body?.error ?? fallbackMessage,
        }
      }

      return parseDuplicateCheckResult(body, field)
    } catch {
      // Try fallback endpoint
    }
  }

  // If duplicate-check API is not reachable, block Next.
  if (!sawReachableEndpoint) {
    return {
      available: false,
      message:
        field === "email"
          ? "Cannot verify email uniqueness right now."
          : "Cannot verify username uniqueness right now.",
    }
  }

  // Endpoint is reachable but response format is unclear: block and ask user to retry.
  return {
    available: false,
    message:
      field === "email"
        ? "Unable to verify email. Please try again."
        : "Unable to verify username. Please try again.",
  }
}

function validateStepBeforeNext(stepNumber) {
  const fieldsForStep = stepFields[stepNumber] ?? []

  for (const field of fieldsForStep) {
    const rawValue = formValues[field.modelKey]
    const value = typeof rawValue === "string" ? rawValue.trim() : rawValue
    if (!value) {
      registerError.value = `Please enter ${field.label.toLowerCase()}.`
      return false
    }
  }

  if (stepNumber === 1 && formValues.password !== formValues.confirmPassword) {
    registerError.value = "Passwords do not match."
    return false
  }

  if (stepNumber === 1 && strField(formValues.password).length < 8) {
    registerError.value = "Password must be at least 8 characters."
    return false
  }

  if (stepNumber === 1 && !isValidEmail(strField(formValues.email))) {
    registerError.value = "Please enter a valid email address."
    return false
  }

  return true
}

async function validateStep1UniqueFields() {
  const username = strField(formValues.username)
  const email = strField(formValues.email).toLowerCase()

  const usernameCheck = await checkDuplicateField("username", username)
  if (!usernameCheck.available) {
    registerError.value = usernameCheck.message || "Username is already in use."
    return false
  }

  const emailCheck = await checkDuplicateField("email", email)
  if (!emailCheck.available) {
    registerError.value = emailCheck.message || "Email is already in use."
    return false
  }

  return true
}

async function submitRegister() {
  registerError.value = ""

  // Basic front-end validation. Backend will still be the source of truth.
  if (!strField(formValues.name)) return (registerError.value = "Please enter your name.")
  if (!strField(formValues.dateOfBirth)) return (registerError.value = "Please select your date of birth.")
  if (!strField(formValues.username)) return (registerError.value = "Please enter your username.")
  if (!strField(formValues.email)) return (registerError.value = "Please enter your email.")
  if (!isValidEmail(strField(formValues.email))) return (registerError.value = "Please enter a valid email address.")
  if (!strField(formValues.password)) return (registerError.value = "Please enter your password.")
  if (strField(formValues.password).length < 8) return (registerError.value = "Password must be at least 8 characters.")
  if (formValues.password !== formValues.confirmPassword) return (registerError.value = "Passwords do not match.")

  if (!strField(formValues.sexualIdentity)) return (registerError.value = "Please select your sexual identity.")
  if (!strField(formValues.sexualPreference)) return (registerError.value = "Please select your sexual preference.")
  if (!strField(formValues.racialPreference)) return (registerError.value = "Please select your racial preference.")
  if (!strField(formValues.meetingInterest)) return (registerError.value = "Please select your meeting interest.")

  if (selectedPhotos.value.length < 2) return (registerError.value = "Please upload at least 2 photos.")

  try {
    registerLoading.value = true

    // Read photos as data URLs (backend expects photos in register payload)
    const photos = await Promise.all(
      selectedPhotos.value.map((p) => readFileAsDataURL(p.file)),
    )

    const name = strField(formValues.name)
    const dateOfBirth = strField(formValues.dateOfBirth)
    const locationCode = strField(formValues.location)
    const cityCode = strField(formValues.city)
    const locationName = selectedLocationLabel.value || locationCode
    const cityName = selectedCityLabel.value || cityCode
    const username = strField(formValues.username)
    const email = strField(formValues.email).toLowerCase()
    const password = strField(formValues.password)
    const confirmPassword = strField(formValues.confirmPassword)
    const sexualIdentity = strField(formValues.sexualIdentity)
    const sexualPreference = strField(formValues.sexualPreference)
    const racialPreference = strField(formValues.racialPreference)
    const meetingInterest = strField(formValues.meetingInterest)

    const payload = {
      name,
      dateOfBirth,
      // Send full names to backend for these fields
      location: locationName,
      city: cityName,
      username,
      email,
      password,
      confirmPassword,
      sexualIdentity,
      sexualPreference,
      racialPreference,
      meetingInterest,
      photos,
      // Many Java/Spring APIs expect snake_case JSON keys — mirror values so nothing is "missing" by name.
      date_of_birth: dateOfBirth,
      confirm_password: confirmPassword,
      sexual_identity: sexualIdentity,
      sexual_preference: sexualPreference,
      racial_preference: racialPreference,
      meeting_interest: meetingInterest,
      // Backend-specific keys requested by API mapping
      gendar: sexualIdentity,
      // Use full names for country/city
      location_country: locationName,
      location_city: cityName,
      // Keep codes too in case backend still needs them
      location_code: locationCode,
      city_code: cityCode,
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const contentType = res.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json") ? await res.json() : await res.text()

    if (!res.ok) {
      registerError.value =
        typeof body === "string"
          ? body
          : body?.message ?? body?.error ?? `Register failed with status ${res.status}`
      return
    }

    // Success: store token (if backend returns one) and auto-login
    if (typeof body === "object" && body) {
      const token =
        body.token ??
        body.accessToken ??
        body.access_token ??
        body.data?.token ??
        body.data?.accessToken ??
        body.data?.access_token

      if (token && typeof token === "string") {
        localStorage.setItem("token", token)
      }
    }

    // Go to home after successful register (with photos)
    router.push("/")
  } catch (e) {
    registerError.value = e instanceof Error ? e.message : "Register failed"
  } finally {
    registerLoading.value = false
  }
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick)

  // Revoke object URLs created for image previews
  for (const url of photoObjectUrlsToRevoke.value) {
    URL.revokeObjectURL(url)
  }
})

async function goNext() {
  if (registerLoading.value) return
  registerError.value = ""

  if (currentStep.value < 3) {
    const canProceed = validateStepBeforeNext(currentStep.value)
    if (!canProceed) return

    if (currentStep.value === 1) {
      registerLoading.value = true
      try {
        const isUnique = await validateStep1UniqueFields()
        if (!isUnique) return
      } finally {
        registerLoading.value = false
      }
    }

    currentStep.value += 1
    return
  }

  // Step 3: submit
  submitRegister()
}

function goBack() {
  if (registerLoading.value) return
  if (currentStep.value > 1) currentStep.value -= 1
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

        <input
          ref="photoInputRef"
          id="register-photo-input"
          type="file"
          accept="image/*"
          multiple
          class="sr-only"
          @change="handleSelectedPhotos"
        />

        <div class="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4">
          <button
            v-for="slot in photoSlots"
            :key="slot.key"
            type="button"
            class="h-[120px] lg:h-[156px] rounded-xl bg-gray-200/80 flex flex-col items-center justify-center text-purple-500 relative overflow-hidden"
            @click="triggerPhotoPicker"
          >
            <img
              v-if="slot.previewUrl"
              :src="slot.previewUrl"
              alt=""
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="relative z-10">
              <span
                v-if="!slot.previewUrl"
                class="text-[26px] leading-none"
              >
                +
              </span>
              <span class="text-[13px] mt-1">{{ slot.label }}</span>
            </div>
          </button>
        </div>

        <p
          v-if="registerError"
          class="mt-3 text-red-500 text-sm"
        >
          {{ registerError }}
        </p>
      </div>

      <form
        v-else
        class="mt-4 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-6 lg:relative"
      >
        <p
          v-if="registerError"
          class="col-span-2 mt-1 text-red-500 text-sm"
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
              :type="field.type"
              v-model="formValues[field.modelKey]"
              class="w-full h-11 px-3 pr-10 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white placeholder:text-gray-500 body2 text-black outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
              :placeholder="field.placeholder"
            />

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

            <select
              v-else
              class="w-full h-11 px-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white body2 text-gray-600 appearance-none outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
              v-model="formValues[field.modelKey]"
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

          <BaseButtonPrimary
            :disabled="registerLoading"
            @click="goNext"
          >
            {{ registerLoading ? "Loading..." : nextLabel }}
          </BaseButtonPrimary>
        </div>
      </div>
    </div>
</template>
