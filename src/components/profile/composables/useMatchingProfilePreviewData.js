import { computed, ref, watch } from "vue"
import { getUserProfile } from "@/views/profile/profileApi"
import { apiUrl } from "@/lib/apiBase"

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
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age -= 1
  return String(age)
}

function formatLocation(city, country) {
  const parts = [city, country].map((x) => (x != null ? String(x).trim() : "")).filter(Boolean)
  return parts.length ? parts.join(", ") : "—"
}

export function useMatchingProfilePreviewData() {
  const loading = ref(true)
  const loadError = ref("")
  const profile = ref(null)
  const photoUrls = ref([])
  const currentPhotoIndex = ref(0)
  const imageLoading = ref(false)

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
    return photoUrls.value[currentPhotoIndex.value] || ""
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
    if (currentPhotoIndex.value >= n) currentPhotoIndex.value = n - 1
  })

  // Loads profile via GET /api/users/{userId}/profile only — images come from profileImages field
  async function loadPreview({ userId, fallbackPhotoUrl = "" } = {}) {
    const uid = typeof userId === "string" ? userId.trim() : ""
    if (!uid) {
      loadError.value = "No user id provided."
      loading.value = false
      return
    }
    loading.value = true
    loadError.value = ""
    const token = localStorage.getItem("token") ?? ""
    if (!token) {
      loadError.value = "Please log in to view profiles."
      profile.value = null
      photoUrls.value = []
      loading.value = false
      return
    }
    try {
      const [p, pictureRes, imagesRes] = await Promise.all([
        getUserProfile(uid, token),
        fetch(apiUrl(`/api/users/${encodeURIComponent(uid)}/picture`), {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch(apiUrl(`/api/users/${encodeURIComponent(uid)}/profile-images`), {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ])
      profile.value = p

      const mainPicture = pictureRes?.mainPicture ?? null
      const images = Array.isArray(imagesRes) ? imagesRes : []
      const primaryUrls = images.filter((img) => img?.primary).map((img) => img?.imageUrl).filter(Boolean)
      const secondaryUrls = images.filter((img) => !img?.primary).map((img) => img?.imageUrl).filter(Boolean)

      // รูปหลักจาก /picture อยู่ index 0, primary images ถัดมา, secondary images ตามท้าย
      const allUrls = [...new Set([
        ...(mainPicture ? [mainPicture] : []),
        ...primaryUrls,
        ...secondaryUrls,
      ])]

      photoUrls.value = allUrls.length > 0 ? allUrls : fallbackPhotoUrl ? [fallbackPhotoUrl] : []
      currentPhotoIndex.value = 0
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : "Failed to load profile"
      profile.value = null
      photoUrls.value = []
    } finally {
      loading.value = false
    }
  }

  function onImageLoad() {
    imageLoading.value = false
  }

  function showPreviousPhoto() {
    const n = photoUrls.value.length
    if (n <= 1) return
    imageLoading.value = true
    currentPhotoIndex.value = (currentPhotoIndex.value - 1 + n) % n
  }

  function showNextPhoto() {
    const n = photoUrls.value.length
    if (n <= 1) return
    imageLoading.value = true
    currentPhotoIndex.value = (currentPhotoIndex.value + 1) % n
  }

  return {
    loading,
    loadError,
    imageLoading,
    onImageLoad,
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
