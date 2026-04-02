import { validateEditProfile } from "../validation/editProfileValidation"

export function useEditProfileSync({
  tokenRef,
  formValues,
  locationOptions,
  cityOptions,
  bioRef,
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
}) {
  function syncLocationFromBackend(countryValue) {
    if (!countryValue) return
    const byValue = locationOptions.value.find((c) => c.value === countryValue)
    if (byValue) {
      formValues.location = byValue.value
      return
    }
    const byLabel = locationOptions.value.find((c) => c.label === countryValue)
    if (byLabel) {
      formValues.location = byLabel.value
    }
  }

  function syncCityFromBackend(cityValue) {
    if (!cityValue || !formValues.location) return
    const byValue = cityOptions.value.find((c) => c.value === cityValue)
    if (byValue) {
      formValues.city = byValue.value
      return
    }
    const byLabel = cityOptions.value.find((c) => c.label === cityValue)
    if (byLabel) {
      formValues.city = byLabel.value
    }
  }

  async function loadProfile() {
    if (!tokenRef.value) return
    try {
      setLoading(true)
      setFormError("")
      await fetchInterests()

      const profile = await getMyProfile(tokenRef.value)
      const images = tokenRef.value ? await listMyProfileImages(tokenRef.value).catch(() => []) : []

      formValues.name = profile?.name ?? ""
      formValues.username = profile?.username ?? ""
      formValues.email = profile?.email ?? ""
      formValues.dateOfBirth = profile?.dateOfBirth ?? ""
      formValues.sexualIdentity = profile?.gender ?? ""
      formValues.sexualPreference = profile?.sexualPreference ?? ""
      formValues.racialPreference = profile?.racialPreference ?? ""
      formValues.meetingInterest = profile?.meetingInterest ?? ""

      syncLocationFromBackend(profile?.locationCountry)
      syncCityFromBackend(profile?.locationCity)

      bioRef.value = profile?.bio ?? ""

      const interests = Array.isArray(profile?.interests) ? profile.interests : []
      selectedInterestTags.value = interests.map((i) => i?.name).filter(Boolean)

      setSlotsFromApiImages(images)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Load profile failed")
    } finally {
      setLoading(false)
    }
  }

  async function submitUpdate({ uploadedImagesCount }) {
    const validationMessage = validateEditProfile({
      token: tokenRef.value,
      formValues,
      bio: bioRef.value,
      selectedInterestTags: selectedInterestTags.value,
      uploadedImagesCount,
    })
    if (validationMessage) {
      setFormError(validationMessage)
      throw new Error(validationMessage)
    }

    try {
      setLoading(true)
      clearNotices()

      const selectedInterestIds = interestOptions.value
        .filter((item) => selectedInterestTags.value.includes(item.name) && item.id)
        .map((item) => item.id)

      const payload = {
        username: formValues.username,
        name: formValues.name,
        dateOfBirth: formValues.dateOfBirth || null,
        sexualIdentity: formValues.sexualIdentity || null,
        sexualPreference: formValues.sexualPreference || null,
        racialPreference: formValues.racialPreference || null,
        meetingInterest: formValues.meetingInterest || null,
        location: formValues.location || null,
        city: formValues.city || null,
        bio: bioRef.value || null,
        interestIds: selectedInterestIds,
      }

      await updateMyProfile(payload, tokenRef.value)
      setFormSuccess("Update success")
      window.setTimeout(() => {
        setFormSuccess("")
      }, 2500)
      return true
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Update failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loadProfile,
    submitUpdate,
  }
}

