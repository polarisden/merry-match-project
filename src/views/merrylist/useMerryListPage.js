import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import faceImg from '@/assets/images/face.png'
import { fetchMerryListRequest, removeMerryProfileRequest } from '@/views/merrylist/merryListApi'
import { openOrCreateChatRoomWithPeer } from '@/views/chat/chatApi'

const MATCHED_STATUSES = new Set(['active', 'matched'])

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function getAuthToken() {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem('token') ?? ''
}

function isMatchedStatus(status) {
  return MATCHED_STATUSES.has(String(status ?? '').trim().toLowerCase())
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

function mapApiProfile(row, index) {
  const imageUrl = row.img ?? null
  const matchStatus = String(row.matchStatus ?? row.match_status ?? '').trim().toLowerCase()
  const matched = matchStatus ? isMatchedStatus(matchStatus) : Boolean(row.matched)
  return {
    id: String(row.id ?? `profile-${index}`),
    img: typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : faceImg,
    name: String(row.name ?? 'Unknown'),
    age: toNumber(row.age, 0),
    location: String(row.location ?? 'Unknown location'),
    matchStatus,
    merryToday: Boolean(row.merryToday ?? row.merry_today),
    matched,
    canMessage: matched,
    sexualIdentity: String(row.sexualIdentity ?? 'Indefinite'),
    sexualPreference: String(row.sexualPreference ?? 'Indefinite'),
    racialPreference: String(row.racialPreference ?? 'Indefinite'),
    meetingInterest: String(row.meetingInterest ?? 'Indefinite'),
  }
}

export function useMerryListPage() {
  const merryToYou = ref(0)
  const merryMatch = ref(0)
  const limitUsed = ref(0)
  const limitMax = ref(null)

  const profiles = ref([])
  const isLoadingProfiles = ref(false)
  const loadProfilesError = ref('')
  const isPreviewOpen = ref(false)
  const selectedProfile = ref(null)
  const isDeleteConfirmOpen = ref(false)
  const pendingDeleteProfile = ref(null)

  const nowMs = ref(Date.now())
  const router = useRouter()
  let resetTimerId = null

  const detailRows = (p) => [
    { label: 'Sexual identities', value: p.sexualIdentity },
    { label: 'Sexual preferences', value: p.sexualPreference },
    { label: 'Racial preferences', value: p.racialPreference },
    { label: 'Meeting interests', value: p.meetingInterest },
  ]

  const resetCountdownText = computed(() => {
    const now = new Date(nowMs.value)
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0)
    const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime())
    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `Reset in ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`
  })

  async function loadProfilesFromApi() {
    isLoadingProfiles.value = true
    loadProfilesError.value = ''

    try {
      const token = getAuthToken()
      const result = await fetchMerryListRequest(token)
      if (!result.ok) throw new Error(result.error || 'Failed to load merry list')
      merryToYou.value = toNumber(result.merryToYou, 0)
      merryMatch.value = toNumber(result.merryMatch, 0)
      limitUsed.value = toNumber(result.limitUsed, 0)
      limitMax.value = toNumber(result.limitMax, NaN)
      if (!Array.isArray(result.items) || result.items.length === 0) return
      profiles.value = result.items.map((row, index) => mapApiProfile(row, index))
    } catch (error) {
      loadProfilesError.value = error instanceof Error ? error.message : 'Failed to load merry list'
    } finally {
      isLoadingProfiles.value = false
    }
  }

  function openProfilePreview(profile) {
    selectedProfile.value = profile
    isPreviewOpen.value = true
  }

  function closeProfilePreview() {
    isPreviewOpen.value = false
    selectedProfile.value = null
  }

  function askRemoveProfile(profile) {
    pendingDeleteProfile.value = profile
    isDeleteConfirmOpen.value = true
  }

  function cancelRemoveProfile() {
    isDeleteConfirmOpen.value = false
    pendingDeleteProfile.value = null
  }

  async function confirmRemoveProfile() {
    const profile = pendingDeleteProfile.value
    const id = String(profile?.id ?? '').trim()
    if (!id) {
      cancelRemoveProfile()
      return
    }

    const token = getAuthToken()
    if (!token) {
      loadProfilesError.value = 'Please log in to remove this profile.'
      cancelRemoveProfile()
      return
    }

    const result = await removeMerryProfileRequest(token, id)
    if (!result.ok) {
      loadProfilesError.value = result.error || 'Failed to remove this profile.'
      cancelRemoveProfile()
      return
    }

    profiles.value = profiles.value.filter((p) => String(p?.id ?? '') !== id)
    merryToYou.value = Math.max(0, toNumber(merryToYou.value, 0) - 1)
    cancelRemoveProfile()
  }

  async function goToChatRoom(profile) {
    const peerUserId = String(profile?.id ?? '').trim()
    if (!peerUserId) return

    const token = getAuthToken()
    if (!token) {
      loadProfilesError.value = 'Please log in to start chatting.'
      return
    }

    try {
      const room = await openOrCreateChatRoomWithPeer(peerUserId, token)
      if (!room?.id) throw new Error('Chat room not available')
      router.push({ path: '/matching', query: { room: room.id } })
    } catch (error) {
      loadProfilesError.value = error instanceof Error ? error.message : 'Failed to open chat room'
    }
  }

  onMounted(() => {
    loadProfilesFromApi()
    resetTimerId = setInterval(() => {
      nowMs.value = Date.now()
    }, 1000)
  })

  onBeforeUnmount(() => {
    if (resetTimerId !== null) {
      clearInterval(resetTimerId)
      resetTimerId = null
    }
  })

  return {
    merryToYou,
    merryMatch,
    limitUsed,
    limitMax,
    profiles,
    isLoadingProfiles,
    loadProfilesError,
    isPreviewOpen,
    selectedProfile,
    isDeleteConfirmOpen,
    resetCountdownText,
    detailRows,
    openProfilePreview,
    closeProfilePreview,
    askRemoveProfile,
    cancelRemoveProfile,
    confirmRemoveProfile,
    goToChatRoom,
  }
}
