import { ref } from "vue"
import { fetchInterestsOptions } from "./registerApi"

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

  return {
    interestTags,
    selectedInterestTags,
    interestOptions,
    selectInterestTag,
    removeInterestTag,
    toggleInterestTag,
    fetchInterests,
  }
}
