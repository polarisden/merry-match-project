import { computed, reactive, ref, watch } from "vue"
import { Country, State } from "country-state-city"

export function useRegisterFormState() {
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
    bio: "",
  })

  const openDropdown = ref(null)

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

  return {
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
  }
}
