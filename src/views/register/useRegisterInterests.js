import { ref } from "vue"
import { createInterest, fetchInterestsOptions } from "./registerApi"

export function useRegisterInterests() {
  const interestTags = ref([])
  const selectedInterestTags = ref([])
  const interestOptions = ref([])

  function selectInterestTag(tag) {
    if (selectedInterestTags.value.includes(tag)) return
    if (selectedInterestTags.value.length >= 10) return
    selectedInterestTags.value.push(tag)
  }

  function removeInterestTag(tag) {
    selectedInterestTags.value = selectedInterestTags.value.filter((item) => item !== tag)
  }

  function toggleInterestTag(tag) {
    if (selectedInterestTags.value.includes(tag)) {
      removeInterestTag(tag)
      return
    }
    selectInterestTag(tag)
  }

  async function fetchInterests() {
    try {
      const { interestOptions: options, interestTags: tags } = await fetchInterestsOptions()
      interestOptions.value = options
      interestTags.value = tags
    } catch {
      interestOptions.value = []
      interestTags.value = []
    }
  }

  async function addInterestByName(name) {
    const raw = String(name || "").trim()
    if (!raw) return

    // If it already exists in options, just select it.
    const existing = interestOptions.value.find((x) => String(x?.name || "").toLowerCase() === raw.toLowerCase())
    if (existing?.name) {
      selectInterestTag(existing.name)
      return
    }

    // Create in DB then refresh list and select.
    await createInterest(raw)
    await fetchInterests()
    const created = interestOptions.value.find((x) => String(x?.name || "").toLowerCase() === raw.toLowerCase())
    if (created?.name) selectInterestTag(created.name)
    else selectInterestTag(raw)
  }

  return {
    interestTags,
    selectedInterestTags,
    interestOptions,
    selectInterestTag,
    removeInterestTag,
    toggleInterestTag,
    fetchInterests,
    addInterestByName,
  }
}
