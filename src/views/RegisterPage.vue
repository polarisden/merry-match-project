<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import BaseButtonPrimary from "@/components/base/BaseButtonPrimary.vue"
import BaseButtonGhost from "@/components/base/BaseButtonGhost.vue"
import { checkDuplicateField, submitMyInterestsRequest } from "./register/registerApi"
import {
  steps,
  stepFields,
  sexualIdentityOptions,
  sexualPreferenceOptions,
  racialPreferenceOptions,
  meetingInterestOptions,
  totalPhotoSlots,
} from "./register/registerConstants"
import {
  strField,
  validateStepBeforeNext as validateStepBeforeNextRule,
  validateSubmitBeforeRegister,
  validateStep1UniqueFields as validateStep1UniqueFieldsRule,
} from "./register/registerValidation"
import { useRegisterPhotos } from "./register/useRegisterPhotos"
import { useRegisterInterests } from "./register/useRegisterInterests"
import { useRegisterFormState } from "./register/useRegisterFormState"
import { buildRegisterPayload, extractAuthToken, submitRegisterRequest } from "./register/registerSubmit"
import RegisterStepProgressHeader from "./register/components/RegisterStepProgressHeader.vue"
import RegisterStep1Step2Form from "./register/components/RegisterStep1Step2Form.vue"
import RegisterStep3Photos from "./register/components/RegisterStep3Photos.vue"

const router = useRouter()
const ellipse2Icon = new URL("../assets/icons/Ellipse2.svg", import.meta.url).href
const ellipse3Icon = new URL("../assets/icons/Ellipse3.svg", import.meta.url).href
const ellipse4Icon = new URL("../assets/icons/Ellipse4.svg", import.meta.url).href

const currentStep = ref(1)

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
} = useRegisterFormState()

const activeStep = computed(() => steps[currentStep.value - 1])
const fields = computed(() => stepFields[currentStep.value])
const {
  selectedPhotos,
  photoInputRef,
  photoSlots,
  triggerPhotoPicker,
  handleSelectedPhotos,
  removePhotoAt,
  readFileAsDataURL,
  cleanupPhotoUrls,
} = useRegisterPhotos(totalPhotoSlots)

function setPhotoInputRef(el) {
  photoInputRef.value = el
}

const {
  interestTags,
  selectedInterestTags,
  interestOptions,
  toggleInterestTag: toggleInterestTagRaw,
  removeInterestTag,
  fetchInterests,
  addInterestByName,
} = useRegisterInterests()
function toggleInterestTag(tag) {
  if (!selectedInterestTags.value.includes(tag) && selectedInterestTags.value.length >= 10) {
    registerError.value = "ครบ 10 อันแล้ว"
    return
  }
  toggleInterestTagRaw(tag)
}

const canGoBack = computed(() => currentStep.value > 1)
const nextLabel = computed(() => (currentStep.value === 3 ? "Confirm" : "Next step"))

const registerLoading = ref(false)
const registerError = ref("")


async function submitMyInterests(token) {
  const result = await submitMyInterestsRequest(
    token,
    selectedInterestTags.value,
    interestOptions.value,
  )
  if (!result.ok) registerError.value = result.error
  return result.ok
}

function validateStepBeforeNext(stepNumber) {
  const result = validateStepBeforeNextRule(stepNumber, stepFields, formValues, cityOptions.value)
  if (!result.valid) {
    registerError.value = result.message
    return false
  }
  return true
}

async function validateStep1UniqueFields() {
  const result = await validateStep1UniqueFieldsRule(formValues, checkDuplicateField)
  if (!result.valid) {
    registerError.value = result.message
    return false
  }
  return true
}

async function submitRegister() {
  registerError.value = ""

  const submitValidation = validateSubmitBeforeRegister(formValues, selectedPhotos.value)
  if (!submitValidation.valid) return (registerError.value = submitValidation.message)

  try {
    registerLoading.value = true

    // Read photos as data URLs (backend expects photos in register payload)
    const photos = await Promise.all(
      selectedPhotos.value.map((p) => readFileAsDataURL(p.file)),
    )

    const locationCode = strField(formValues.location)
    const cityCode = strField(formValues.city)
    const locationName = selectedLocationLabel.value || locationCode
    const cityName = selectedCityLabel.value || cityCode
    const payload = buildRegisterPayload(formValues, locationName, cityName, photos)
    const registerResult = await submitRegisterRequest(payload)
    if (!registerResult.ok) {
      registerError.value = registerResult.error
      return
    }

    // Success: store token (if backend returns one) and auto-login
    let authToken = extractAuthToken(registerResult.body)
    if (authToken) localStorage.setItem("token", authToken)

    // Save selected interests after register success.
    if (!authToken) authToken = localStorage.getItem("token") ?? ""
    const interestsSaved = await submitMyInterests(authToken)
    if (!interestsSaved) return

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
  fetchInterests()
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick)
  cleanupPhotoUrls()
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
      <RegisterStepProgressHeader
        :steps="steps"
        :current-step="currentStep"
        :ellipse2-icon="ellipse2Icon"
        :ellipse3-icon="ellipse3Icon"
      />

      <h2 class="mt-[37px] lg:mt-[80px] headline4 text-purple-500">
        {{ activeStep.title }}
      </h2>

      <RegisterStep3Photos
        v-if="currentStep === 3"
        :register-error="registerError"
        :photo-slots="photoSlots"
        :trigger-photo-picker="triggerPhotoPicker"
        :handle-selected-photos="handleSelectedPhotos"
        :set-photo-input-ref="setPhotoInputRef"
        :remove-photo-at="removePhotoAt"
      />

      <RegisterStep1Step2Form
        v-else
        :fields="fields"
        :form-values="formValues"
        :register-error="registerError"
        :open-dropdown="openDropdown"
        :location-options="locationOptions"
        :city-options="cityOptions"
        :selected-location-label="selectedLocationLabel"
        :selected-city-label="selectedCityLabel"
        :selected-sexual-identity-label="selectedSexualIdentityLabel"
        :selected-sexual-preference-label="selectedSexualPreferenceLabel"
        :selected-racial-preference-label="selectedRacialPreferenceLabel"
        :selected-meeting-interest-label="selectedMeetingInterestLabel"
        :sexual-identity-options="sexualIdentityOptions"
        :sexual-preference-options="sexualPreferenceOptions"
        :racial-preference-options="racialPreferenceOptions"
        :meeting-interest-options="meetingInterestOptions"
        :current-step="currentStep"
        :interest-tags="interestTags"
        :selected-interest-tags="selectedInterestTags"
        :ellipse4-icon="ellipse4Icon"
        :toggle-dropdown="toggleDropdown"
        :select-location="selectLocation"
        :select-city="selectCity"
        :select-sexual-identity="selectSexualIdentity"
        :select-sexual-preference="selectSexualPreference"
        :select-racial-preference="selectRacialPreference"
        :select-meeting-interest="selectMeetingInterest"
        :toggle-interest-tag="toggleInterestTag"
        :remove-interest-tag="removeInterestTag"
        :add-interest-by-name="addInterestByName"
      />
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
