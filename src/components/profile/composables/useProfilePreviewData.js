import { computed, ref, watch } from "vue"
import {
  getMyProfile,
  getUserProfile,
  listMyProfileImages,
  listUserProfileImages,
} from "@/views/profile/profileApi"
import { sortProfileImagesForDisplay } from "@/components/profile/utils/profileImageOrder"

function ageFromIsoDate(iso) {
  if (!iso) return ""
  const s = String(iso).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ""
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  const birth = new Date(y, mo, d)
  if (Number.isNaN(birth.getTime())) return ""
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const md = today.getMonth() - birth.getMonth()
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return String(age)
}

function formatLocation(city, country) {
  const parts = [city, country].map((x) => (x != null ? String(x).trim() : "")).filter(Boolean)
  return parts.length ? parts.join(", ") : "—"
}

/**
 * Shared profile preview state for ProfilePreviewCard and ProfilePreviewPopUp.
 */
export function useProfilePreviewData() {
  const loading = ref(true)
  const loadError = ref("")
  const profile = ref(null)
  const photoUrls = ref([])
  const currentPhotoIndex = ref(0)

  const displayName = computed(() => {
    const n = profile.value?.name
    return n && String(n).trim() ? String(n).trim() : "—"
  })

  const displayAge = computed(() => {
    const dob = profile.value?.dateOfBirth
    const age = ageFromIsoDate(dob)
    return age !== "" ? age : "—"
  })

  const displayLocation = computed(() =>
    formatLocation(profile.value?.locationCity, profile.value?.locationCountry),
  )

  const aboutText = computed(() => {
    const b = profile.value?.bio
    return b && String(b).trim() ? String(b).trim() : "—"
  })

  const hobbyTags = computed(() => {
    const list = profile.value?.interests
    if (!Array.isArray(list)) return []
    return list.map((i) => i?.name).filter(Boolean)
  })

  const fields = computed(() => ({
    identity:
      profile.value?.gender && String(profile.value.gender).trim() ? profile.value.gender : "—",
    preference:
      profile.value?.sexualPreference && String(profile.value.sexualPreference).trim()
        ? profile.value.sexualPreference
        : "—",
    racial:
      profile.value?.racialPreference && String(profile.value.racialPreference).trim()
        ? profile.value.racialPreference
        : "—",
    meeting:
      profile.value?.meetingInterest && String(profile.value.meetingInterest).trim()
        ? profile.value.meetingInterest
        : "—",
  }))

  const photoCount = computed(() => photoUrls.value.length)

  const currentPhotoSrc = computed(() => {
    if (loading.value) return ""
    if (photoUrls.value.length === 0) return ""
    const url = photoUrls.value[currentPhotoIndex.value]
    return url || ""
  })

  const currentPhotoNumber = computed(() => {
    if (photoCount.value === 0) return 0
    return currentPhotoIndex.value + 1
  })

  const photoAltText = computed(() => {
    if (loading.value) return ""
    const name = displayName.value !== "—" ? displayName.value : "Profile"
    if (photoCount.value === 0) return `${name} — no profile photo`
    return `${name} — photo ${currentPhotoNumber.value} of ${photoCount.value}`
  })

  watch(photoCount, (n) => {
    if (n === 0) {
      currentPhotoIndex.value = 0
      return
    }
    if (currentPhotoIndex.value >= n) {
      currentPhotoIndex.value = n - 1
    }
  })

  /**
   * Loads either current user's profile (default) or a target user's profile when `userId` is provided.
   * @param {{ userId?: string, fallbackPhotoUrl?: string }} [opts]
   */
  async function loadPreview(opts = {}) {
    loading.value = true
    loadError.value = ""
    const targetUserId = typeof opts.userId === "string" ? opts.userId.trim() : ""
    const fallbackPhotoUrl = typeof opts.fallbackPhotoUrl === "string" ? opts.fallbackPhotoUrl.trim() : ""
    const token = localStorage.getItem("token") ?? ""
    if (!token) {
      loadError.value = "Please log in to view profiles."
      profile.value = null
      photoUrls.value = []
      loading.value = false
      return
    }
    try {
      const [p, rawImages] = await Promise.all(
        targetUserId
          ? [
              getUserProfile(targetUserId, token),
              listUserProfileImages(targetUserId, token).catch(() => []),
            ]
          : [getMyProfile(token), listMyProfileImages(token).catch(() => [])],
      )
      profile.value = p
      if (targetUserId) {
        const sorted = sortProfileImagesForDisplay(Array.isArray(rawImages) ? rawImages : [])
        const urls = sorted.map((img) => img?.imageUrl).filter(Boolean)
        photoUrls.value = urls.length > 0 ? urls : fallbackPhotoUrl ? [fallbackPhotoUrl] : []
      } else {
        const sorted = sortProfileImagesForDisplay(Array.isArray(rawImages) ? rawImages : [])
        photoUrls.value = sorted.map((img) => img?.imageUrl).filter(Boolean)
      }
      currentPhotoIndex.value = 0
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : "Failed to load profile"
      profile.value = null
      photoUrls.value = []
    } finally {
      loading.value = false
    }
  }

  function showPreviousPhoto() {
    const n = photoUrls.value.length
    if (n <= 1) return
    currentPhotoIndex.value = (currentPhotoIndex.value - 1 + n) % n
  }

  function showNextPhoto() {
    const n = photoUrls.value.length
    if (n <= 1) return
    currentPhotoIndex.value = (currentPhotoIndex.value + 1) % n
  }

  return {
    loading,
    loadError,
    profile,
    loadPreview,
    displayName,
    displayAge,
    displayLocation,
    aboutText,
    hobbyTags,
    fields,
    photoCount,
    currentPhotoSrc,
    currentPhotoNumber,
    photoAltText,
    showPreviousPhoto,
    showNextPhoto,
  }
}
