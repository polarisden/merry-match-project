<script setup>
import locationLogo from '@/assets/icons/location.svg'
import frameLogo from '@/assets/icons/Frame.svg'
import arrowLeftLogo from '@/assets/icons/arrow.svg'
import arrowRightLogo from '@/assets/icons/arrow_right.svg'
import xLogo from '@/assets/icons/x.svg'
import heartLogo from '@/assets/icons/heart.svg'
import filterLogo from '@/assets/icons/filter.svg'
import mathNsearchLogo from '@/assets/icons/vector.svg'
import merryMatchLogo from '@/assets/icons/merry_match.svg'
import ProfilePreviewPopUp from '@/components/modals/ProfilePreviewPopUpForMatchingPage.vue'
import ProfilePreviewCardForMatchingPage from '@/components/profile/ProfilePreviewCardForMatchingPage.vue'
import ChatRoomCard from '@/views/chat/ChatRoomPage.vue'
import ListWithMatchPageMobile from '@/components/ListWithMatchPageMobile.vue'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchChatRoomsByMatch, fetchChatRoomsForUser } from '@/views/chat/chatApi'
import { apiUrl } from '@/lib/apiBase'
import { getChatPollIntervalMs } from '@/lib/chatPollMs'
import { useChatRoomsRealtime } from '@/views/chat/useChatRoomsRealtime'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function toDate(value) {
  if (!value) return null
  const d = new Date(String(value))
  return Number.isFinite(d.getTime()) ? d : null
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatLastMessageAt(value) {
  const d = toDate(value)
  if (!d) return ''
  const now = new Date()
  if (isSameDay(d, now)) {
    return new Intl.DateTimeFormat('en-En', { hour: '2-digit', minute: '2-digit' }).format(d)
  }
  return new Intl.DateTimeFormat('en-En', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(d)
}

/** @type {import('vue').Ref<string | null>} */
const selectedChatRoomId = ref(null)

const matchIdForChat = computed(() => {
  const q = route.query.match_id ?? route.query.matchId
  if (typeof q === 'string' && q.trim()) return q.trim()
  const env = import.meta.env.VITE_MOCK_MATCH_ID
  if (typeof env === 'string' && env.trim()) return env.trim()
  return ''
})

const chatRooms = ref([])
const chatRoomsLoading = ref(false)
const chatRoomsError = ref('')

/**
 * @param {{ silent?: boolean }} [opts] silent = background refresh (no loading spinner, keep list on error)
 */
async function loadChatRooms(opts = {}) {
  const silent = Boolean(opts.silent)
  chatRoomsError.value = ''
  authStore.hydrate()
  const t = authStore.token
  if (!t) {
    chatRooms.value = []
    return
  }
  const mid = matchIdForChat.value
  if (!silent) chatRoomsLoading.value = true
  try {
    chatRooms.value = mid
      ? await fetchChatRoomsByMatch(mid, t)
      : await fetchChatRoomsForUser(t)
    const openId = selectedChatRoomId.value
    if (openId) clearUnreadForRoom(openId)
  } catch (e) {
    if (!silent) {
      chatRooms.value = []
      chatRoomsError.value = e instanceof Error ? e.message : 'Failed to load chats'
    }
  } finally {
    if (!silent) chatRoomsLoading.value = false
  }
}

/** @type {ReturnType<typeof setInterval> | null} */
let chatRoomsPollTimer = null

function stopChatRoomsPoll() {
  if (chatRoomsPollTimer != null) {
    clearInterval(chatRoomsPollTimer)
    chatRoomsPollTimer = null
  }
}

function startChatRoomsPoll() {
  stopChatRoomsPoll()
  const ms = getChatPollIntervalMs()
  if (ms <= 0) return
  chatRoomsPollTimer = setInterval(() => {
    loadChatRooms({ silent: true })
  }, ms)
}

useChatRoomsRealtime({
  matchIdRef: matchIdForChat,
  isEnabled: () => Boolean(authStore.token),
  onRefresh: () => loadChatRooms({ silent: true }),
})

/** ห้องที่เปิดอยู่ถือว่าอ่านแล้ว — ซ่อน badge ทันที (สอดคล้องกับ mark read ใน ChatRoom) */
function clearUnreadForRoom(roomId) {
  const id = String(roomId || '').trim()
  if (!id) return
  chatRooms.value = chatRooms.value.map((r) =>
    r.id === id ? { ...r, unreadCount: 0 } : r,
  )
}

function openChatRoom(roomId) {
  const id = String(roomId || '').trim()
  if (!id) return
  selectedChatRoomId.value = id
  router.replace({ path: route.path, query: { ...route.query, room: id } })
}

async function openChatRoomFromMatch(otherUserId) {
  const token = authStore.token
  if (!token || !currentUserId.value) return
  try {
    const res = await fetch(
      apiUrl(`/api/chatroom-id?swiper_id=${currentUserId.value}&swiped_id=${otherUserId}`),
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) return
    const data = await res.json()
    const roomId = data.chatroom_id
    if (!roomId) return
    openChatRoom(roomId)
  } catch (e) {
    console.error('Failed to get chat room id:', e)
  }
}

watch(
  () => route.query.room,
  (q) => {
    if (typeof q === 'string' && q.trim()) selectedChatRoomId.value = q.trim()
    else selectedChatRoomId.value = null
  },
  { immediate: true },
)

watch(matchIdForChat, () => {
  loadChatRooms()
})

const unreadChatTotal = computed(() =>
  chatRooms.value.reduce((n, r) => n + (Number(r.unreadCount) || 0), 0),
)

watch(selectedChatRoomId, (id, prev) => {
  if (id) clearUnreadForRoom(id)
  if (prev && !id) loadChatRooms()
})

async function ensureSexualPreferenceQuery() {
  if (route.query['sexual-preference']) return
  const token = authStore.token
  if (!token) return
  try {
    const res = await fetch(apiUrl('/api/users/me/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const me = await res.json()
    if (!me.sexualPreference) return
    const mapped = queryToGender(me.sexualPreference)
    if (!mapped) return
    selectedGender.value = mapped
    router.replace({
      path: route.path,
      query: { ...route.query, 'sexual-preference': genderToQuery(mapped) },
    })
  } catch {
    // ignore
  }
}

async function loadSwipeLimit() {
  const token = authStore.token
  if (!token) return
  try {
    const res = await fetch(apiUrl('/api/users/me/subscription'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const sub = await res.json()
    const limit = sub.swipeLimit ?? sub.swipe_limit ?? sub.plan?.swipeLimit ?? sub.plan?.swipe_limit
    if (limit != null) swipeLimit.value = Number(limit)
  } catch {
    // ignore — keep default
  }
}

onMounted(() => {
  ensureSexualPreferenceQuery()
  loadChatRooms()
  startChatRoomsPoll()
  loadProfiles()
  loadMerryMatches()
  loadSwipeLimit()
})

onUnmounted(() => {
  stopChatRoomsPoll()
})

watch(
  () => route.query['sexual-preference'],
  (val) => {
    selectedGender.value = queryToGender(val)
    currentIndex.value = 0
  },
)

const showPreview = ref(false)
const showMobilePreview = ref(false)
const showFilter = ref(false)

const genderOptions = ref({ default: false, female: false, nonbinary: false })
const filterMinAge = ref(18)
const filterMaxAge = ref(50)

const filterMinPercent = computed(() => ((filterMinAge.value - 18) / (100 - 18)) * 100)
const filterMaxPercent = computed(() => ((filterMaxAge.value - 18) / (100 - 18)) * 100)

function onFilterMinInput(e) {
  const val = Number(e.target.value)
  filterMinAge.value = Math.min(val, filterMaxAge.value - 1)
}
function onFilterMaxInput(e) {
  const val = Number(e.target.value)
  filterMaxAge.value = Math.max(val, filterMinAge.value + 1)
}

function clearFilter() {
  genderOptions.value = { default: false, female: false, nonbinary: false }
  filterMinAge.value = 18
  filterMaxAge.value = 50
}

function applyMobileFilter() {
  // map genderOptions → selectedGender (เลือกได้แค่อันเดียว — ถ้าเลือกหลายอัน ให้ nonbinary > female > default)
  if (genderOptions.value.nonbinary) toggleGender('non-binary')
  else if (genderOptions.value.female) toggleGender('female')
  else if (genderOptions.value.default) toggleGender('male')
  else {
    selectedGender.value = ''
    router.replace({ path: route.path, query: { ...route.query, 'sexual-preference': undefined } })
  }

  minAge.value = filterMinAge.value
  maxAge.value = filterMaxAge.value
  currentIndex.value = 0
  syncAgeToQuery()
  showFilter.value = false
}

const minAge = ref(Number(route.query.minAge) || 18)
const maxAge = ref(Number(route.query.maxAge) || 50)

const minPercent = computed(() => ((minAge.value - 18) / (100 - 18)) * 100)
const maxPercent = computed(() => ((maxAge.value - 18) / (100 - 18)) * 100)

function syncAgeToQuery() {
  router.replace({
    path: route.path,
    query: { ...route.query, minAge: minAge.value, maxAge: maxAge.value },
  })
}

function onMinInput(e) {
  const val = Number(e.target.value)
  minAge.value = Math.min(val, maxAge.value - 1)
  currentIndex.value = 0
  syncAgeToQuery()
}
function onMaxInput(e) {
  const val = Number(e.target.value)
  maxAge.value = Math.max(val, minAge.value + 1)
  currentIndex.value = 0
  syncAgeToQuery()
}

// Merry Match list
const merryMatches = ref([])

async function loadMerryMatches() {
  try {
    const token = authStore.token
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    // get current user id
    const meRes = await fetch(apiUrl('/api/users/me/profile'), { headers })
    if (!meRes.ok) return
    const me = await meRes.json()
    const currentUserId = me.id ?? me.userId

    const matchRes = await fetch(apiUrl(`/api/matchList?userId=${currentUserId}`), { headers })
    if (!matchRes.ok) return
    const matches = await matchRes.json()

    const results = await Promise.all(
      matches.map(async (match) => {
        const otherId = match.user1Id === currentUserId ? match.user2Id : match.user1Id
        try {
          const picRes = await fetch(apiUrl(`/api/users/${otherId}/picture`), { headers })
          if (!picRes.ok) return null
          const pic = await picRes.json()
          return { id: match.id, userId: otherId, img: pic.mainPicture }
        } catch {
          return null
        }
      })
    )
    merryMatches.value = results.filter(Boolean)
    console.log("here",merryMatches.value)
  } catch (e) {
    console.error('Failed to load merry matches:', e)
  }
}

function calcAge(dateOfBirth) {
  const today = new Date()
  const dob = new Date(dateOfBirth)
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function getPrimaryImage(profileImages) {
  const primary = profileImages?.find((img) => img.primary)
  return primary?.imageUrl ?? profileImages?.[0]?.imageUrl ?? ''
}

// Card deck
const allProfiles = ref([])  // raw — never filtered
const currentUserId = ref(null)
const merryCount = ref(0)
const swipeLimit = ref(20)

// gender filter — synced with ?gender= query param
// internal values: 'male' | 'female' | 'non-binary'
// URL value for non-binary: 'LGBTQIAN+'
// 'non-binary' filter = show users whose gender is NOT 'LGBTQIAN+'
const GENDER_OPTIONS = ['male', 'female', 'non-binary']

function queryToGender(val) {
  if (val === 'LGBTQIAN' || val === 'LGBTQIAN+') return 'non-binary'
  return GENDER_OPTIONS.includes(val) ? val : ''
}
function genderToQuery(g) {
  if (g === 'non-binary') return 'LGBTQIAN'
  return g || undefined
}

const q = [route.query['sexual-preference']].flat()[0]
const selectedGender = ref(queryToGender(q))

function toggleGender(value) {
  selectedGender.value = selectedGender.value === value ? '' : value
  router.replace({
    path: route.path,
    query: { ...route.query, 'sexual-preference': genderToQuery(selectedGender.value) },
  })
}

const profiles = computed(() => {
  return allProfiles.value.filter((u) => {
    let genderMatch = true
    if (selectedGender.value === 'non-binary') {
      genderMatch = (u.gender ?? '').toUpperCase() === 'LGBTQIAN+'
    } else if (selectedGender.value) {
      genderMatch = u.gender === selectedGender.value
    }
    const ageMatch = u.age == null || (u.age >= minAge.value && u.age <= maxAge.value)
    return genderMatch && ageMatch
  })
})

async function loadProfiles() {
  try {
    const token = authStore.token
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    // get current user id + sexualPreference for default gender filter
    if (token) {
      try {
        const meRes = await fetch(apiUrl('/api/users/me/profile'), { headers })
        if (meRes.ok) {
          const me = await meRes.json()
          currentUserId.value = me.id ?? me.userId ?? null
          merryCount.value = Number(me.merryCount ?? me.merry_count ?? 0)
        }
      } catch {
        // ignore
      }
    }

    // fetch swipe history to exclude already-swiped users
    let swipedIds = new Set()
    if (currentUserId.value) {
      try {
        const swipeRes = await fetch(apiUrl(`/api/swipes/${currentUserId.value}/history`), { headers })
        if (swipeRes.ok) {
          const swipeData = await swipeRes.json()
          swipedIds = new Set(swipeData.list_swiped ?? [])
        }
      } catch {
        // ignore
      }
    }

    const res = await fetch(apiUrl('/api/users'), { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    allProfiles.value = data
      .filter((u) => u.id !== currentUserId.value && !swipedIds.has(u.id))
      .map((u) => ({
        id: u.id,
        name: u.name,
        age: u.age ?? (u.dateOfBirth ? calcAge(u.dateOfBirth) : null),
        location: [u.locationCity, u.locationCountry].filter(Boolean).join(', '),
        img: u.mainImage ?? getPrimaryImage(u.profileImages),
        gender: (u.gender ?? '').toLowerCase(),
      }))
  } catch (e) {
    console.error('Failed to load profiles:', e)
  }
}
const currentIndex = ref(0)

const currentProfile = computed(() => profiles.value[currentIndex.value])
const prevProfile = computed(() => profiles.value[currentIndex.value - 1] ?? null)
const nextProfile = computed(() => profiles.value[currentIndex.value + 1] ?? null)

function goNext() {
  if (currentIndex.value < profiles.value.length - 1) currentIndex.value++
}
function goPrev() {
  if (currentIndex.value > 0) currentIndex.value--
}

const showMatchPopup = ref(false)
const matchedProfile = ref(null)
const showLimitPopup = ref(false)

async function postSwipe(action) {
  const profile = profiles.value[currentIndex.value]
  if (!profile) return

  // profiles is a computed — must splice from the raw allProfiles array
  const rawIndex = allProfiles.value.findIndex((u) => u.id === profile.id)
  if (rawIndex !== -1) allProfiles.value.splice(rawIndex, 1)
  if (currentIndex.value >= profiles.value.length && currentIndex.value > 0) {
    currentIndex.value--
  }

  const token = authStore.token
  if (!token || !currentUserId.value) return
  try {
    await fetch(apiUrl('/api/swipes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        swiper_id: currentUserId.value,
        swiped_id: profile.id,
        action,
      }),
    })

    if (action === 'like') {
      const countRes = await fetch(apiUrl('/api/count/merry'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: currentUserId.value }),
      })
      if (countRes.ok) merryCount.value++
    }

    // ถ้า like ให้เช็คว่าอีกฝ่าย like เราไว้ก่อนหรือเปล่า (= match)
    if (action === 'like') {
      const histRes = await fetch(apiUrl(`/api/swipes/${profile.id}/history`), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (histRes.ok) {
        const hist = await histRes.json()
        const likedUs = new Set(hist.list_swiped_like ?? [])
        if (likedUs.has(currentUserId.value)) {
          matchedProfile.value = profile
          showMatchPopup.value = true
          loadMerryMatches()
          loadChatRooms()
        }
      }
    }
  } catch (e) {
    console.error('Failed to post swipe:', e)
  }
}

function onDislike() {
  postSwipe('pass')
}
const isUnlimited = computed(() => swipeLimit.value === -1)
const swipeLimitDisplay = computed(() => isUnlimited.value ? 'unlimited' : swipeLimit.value)

function onLike() {
  if (!isUnlimited.value && merryCount.value >= swipeLimit.value) {
    showLimitPopup.value = true
    return
  }
  postSwipe('like')
}
</script>

<template>
  <!-- mobile -->
  <div class="bg-bg h-full flex flex-col relative lg:hidden">
    <ChatRoomCard
      v-if="selectedChatRoomId"
      class="h-full"
    />
    <div
      v-else
      class="relative w-[375px]"
    >
      <div v-if="currentProfile" class="relative h-[619px] w-[375px] overflow-hidden rounded-b-[24px]">
        <img :src="currentProfile.img" :alt="currentProfile.name" class="h-full w-full object-cover" />
        <div
          class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_61.94%,#390741_100%)]"
        ></div>

        <div class="h-[152px] absolute z-30 right-0 bottom-0 w-dvw pr-[16px] pl-[16px] pb-[16px] flex flex-col justify-center gap-1">
          <div class="text-white headline3 text-[36px]! flex justify-between items-center">
            <div class="flex gap-4">
              <span>{{ currentProfile.name }}</span>
              <span>{{ currentProfile.age }}</span>
            </div>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-full bg-[#FFFFFF33] shadow-[2px_2px_12px_0px_#4032851F] transition-opacity duration-300 ease-out active:opacity-80 cursor-pointer"
              @click="showMobilePreview = true"
            >
              <frameLogo class="w-4 h-4" />
            </div>
          </div>
          <div class="flex gap-[6px]">
            <locationLogo class="w-5 h-5 text-[#BEBFF1]" />
            <span class="text-gray-400 body-2 font-normal">{{ currentProfile.location || '—' }}</span>
          </div>
        </div>
      </div>

      <div v-else class="flex h-[619px] w-[375px] flex-col items-center justify-center rounded-b-[24px] bg-white/60 text-center px-8">
        <div class="text-5xl mb-4">🔍</div>
        <h2 class="headline4 text-gray-800 mb-2">No more profiles</h2>
        <p class="body4 text-gray-500">Try adjusting your filters to see more people.</p>
      </div>

      <div v-if="currentProfile" class="absolute z-40 bottom-[-40px] left-1/2 -translate-x-1/2 flex gap-6">
        <button
          type="button"
          aria-label="Dislike"
          class="bg-white w-[80px] h-[80px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F]"
          @click="onDislike"
        >
          <xLogo class="size-[50px] text-gray-700 stroke-4" />
        </button>
        <button
          type="button"
          aria-label="Like"
          class="bg-white w-[80px] h-[80px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F]"
          @click="onLike"
        >
          <heartLogo class="size-[50px] text-red-500" />
        </button>
      </div>
    </div>

    <footer v-if="!selectedChatRoomId" class="h-[56px] relative mt-auto flex px-4 justify-between items-center">
      <div class="flex gap-[10px] cursor-pointer" @click="showFilter = true">
        <filterLogo />
        <span class="text-gray-500 body4">Filter</span>
      </div>
      <div class="flex gap-[10px] items-center">
        <span class="text-gray-700 body4">Merry limit today</span>
        <span class="text-red-400 body4">{{ merryCount }}/{{ swipeLimitDisplay }}</span>
      </div>
    </footer>
  </div>

  <!-- desktop -->
  <div class="hidden h-full w-full min-w-0 overflow-hidden lg:flex">
    <!-- left container -->
    <section class="h-full w-[22%] flex flex-col relative">
      <div class="h-[259px] shrink-0 flex items-center justify-center border-b border-b-gray-300 px-4">
        <div class="flex flex-col items-center gap-1 p-6 border border-purple-500 rounded-[16px] bg-gray-100 cursor-pointer" @click="$router.push('/matching')">
          <mathNsearchLogo class="w-[62px] h-[59px]"/>
          <span class="block text-red-600 headline4">Discover New Match</span>
          <span class="w-[calc(94%)] body4 text-gray-700 text-center">Start find and Merry to get know and connect with new friend!</span>
        </div>
      </div>
      <div class="px-4 py-6 flex flex-col gap-4 h-[210px] shrink-0">
        <span class="headline4 text-gray-900">Merry Match!</span>
        <div class="flex gap-[12px] overflow-x-auto overflow-y-hidden pb-2">
          <div
            v-for="match in merryMatches"
            :key="match.id"
            class="relative shrink-0 cursor-pointer"
            @click="openChatRoomFromMatch(match.userId)"
          >
            <img :src="match.img" class="size-[100px] object-cover rounded-[24px]">
            <merryMatchLogo class="text-red-400 absolute right-0 bottom-0 w-[34px] h-5 stroke-4"/>
          </div>
        </div>
      </div>
      <div class="flex flex-1 min-h-0 flex-col px-4 gap-4 pb-4">
        <div class="flex flex-col gap-1 shrink-0">
          <span class="headline4 text-gray-900">Chat with Merry Match</span>
          <p
            v-if="unreadChatTotal > 0"
            class="body4 text-gray-700"
            :aria-label="`${unreadChatTotal} unread messages in Merry Match chats`"
          >
            Unread
            <span class="text-red-500 font-semibold tabular-nums">
              {{ unreadChatTotal > 99 ? "99+" : unreadChatTotal }}
            </span>
            messages
          </p>
        </div>
        <p v-if="chatRoomsError" class="body4 text-red-600" role="alert">
          {{ chatRoomsError }}
        </p>
        <p v-else-if="!authStore.token" class="body4 text-gray-500">
          Log in to see your Merry Match chats.
        </p>
        <p v-else-if="chatRoomsLoading" class="body4 text-gray-500">
          Loading chats…
        </p>
        <p v-else-if="chatRooms.length === 0" class="body4 text-gray-500">
          {{ matchIdForChat ? 'No chat rooms for this match yet.' : 'No chat rooms yet.' }}
        </p>
        <div v-else class="flex flex-col gap-2 overflow-y-auto min-h-0">
          <div
            v-for="room in chatRooms"
            :key="room.id"
            class="min-h-[92px] py-4 px-3 flex gap-3 items-center cursor-pointer rounded-[16px] border border-white shrink-0"
            :class="selectedChatRoomId === room.id ? 'border-purple-500! bg-gray-100' : ''"
            @click="openChatRoom(room.id)"
          >
            <img
              :src="room.peerImageUrl || profile1Img"
              :alt="room.peerName ? `Avatar of ${room.peerName}` : 'Chat peer avatar'"
              class="size-[60px] object-cover rounded-full"
            >
            <div class="flex min-w-0 flex-1 flex-col gap-[2px]">
              <span class="body2 truncate text-gray-900">{{ room.peerName || 'Merry Match' }}</span>
              <span class="body4 truncate text-gray-700">{{ room.lastMessageText || 'Say hi!' }}</span>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span
                v-if="formatLastMessageAt(room.lastMessageAt)"
                class="body5 text-gray-500 tabular-nums"
                :aria-label="`Last message at ${formatLastMessageAt(room.lastMessageAt)}`"
              >
                {{ formatLastMessageAt(room.lastMessageAt) }}
              </span>
              <span
                v-if="(room.unreadCount || 0) > 0"
                class="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 body5 font-medium text-white tabular-nums"
                :aria-label="`${room.unreadCount} unread messages`"
              >
                {{ (room.unreadCount || 0) > 99 ? "99+" : room.unreadCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- middle container -->
    <section v-if="!selectedChatRoomId" class="flex h-full w-[62%] flex-col bg-bg overflow-hidden">
      <div class="flex flex-1 items-center justify-center">
        <div class="flex flex-col items-center">
          <!-- card deck -->
          <div class="relative flex items-center justify-center">
            <!-- prev card (peek left) -->
            <div
              v-if="prevProfile"
              class="absolute right-[calc(100%+60px)] h-[540px] w-[540px] rounded-[32px] overflow-hidden pointer-events-none select-none"
            >
              <img :src="prevProfile.img" class="w-full h-full object-cover" alt="" />
              <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_61.94%,#390741_100%)]"></div>
            </div>

            <!-- main card -->
            <div
              v-if="currentProfile"
              class="relative h-[620px] w-[620px] rounded-[32px] overflow-hidden select-none z-10 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
            >
              <img :src="currentProfile.img" class="w-full h-full object-cover" alt="" />
              <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_55%,#390741_100%)]"></div>

              <!-- info + arrows -->
              <div class="absolute bottom-0 left-0 right-0 px-9 flex flex-col gap-1">
                <div class="text-white flex justify-between items-center h-[152px]">
                  <div class="flex gap-4 items-center headline3">
                    <span>{{ currentProfile.name }}</span>
                    <span>{{ currentProfile.age }}</span>
                    <div
                      class="w-8 h-8 flex justify-center items-center rounded-full bg-[#FFFFFF33] cursor-pointer"
                      @click="showPreview = true"
                    >
                      <frameLogo class="w-4 h-4" />
                    </div>
                  </div>
                  <div class="flex gap-3 items-center">
                    <button
                      v-if="currentIndex > 0"
                      @click="goPrev"
                      class="w-9 h-9 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#FFFFFF55] transition cursor-pointer"
                    >
                      <arrowLeftLogo class="w-4 h-4 text-white" />
                    </button>
                    <button
                      v-if="currentIndex < profiles.length - 1"
                      @click="goNext"
                      class="w-9 h-9 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#FFFFFF55] transition cursor-pointer"
                    >
                      <arrowRightLogo class="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- empty state -->
            <div
              v-else
              class="flex h-[620px] w-[620px] flex-col items-center justify-center rounded-[32px] bg-white/60 backdrop-blur-sm z-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-center px-10"
            >
              <div class="text-6xl mb-5">🔍</div>
              <h2 class="headline3 text-gray-800 mb-2">No more profiles to show</h2>
              <p class="body2 text-gray-500 leading-relaxed">
                You've seen everyone who matches your preferences.<br />
                Try adjusting your discovery settings to expand your search.
              </p>
            </div>

            <!-- next card (peek right) -->
            <div
              v-if="nextProfile"
              class="absolute left-[calc(100%+60px)] h-[540px] w-[540px] rounded-[32px] overflow-hidden pointer-events-none select-none"
            >
              <img :src="nextProfile.img" class="w-full h-full object-cover" alt="" />
              <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_61.94%,#390741_100%)]"></div>
            </div>
          </div>

          <!-- action buttons -->
          <div v-if="currentProfile" class="flex gap-6 mt-[-36px] z-20 relative">
            <button
              @click="onDislike"
              class="bg-white w-[72px] h-[72px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F] hover:scale-105 transition-transform cursor-pointer"
            >
              <xLogo class="size-[44px] text-gray-700 stroke-4" />
            </button>
            <button
              @click="onLike"
              class="bg-white w-[72px] h-[72px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F] hover:scale-105 transition-transform cursor-pointer"
            >
              <heartLogo class="size-[44px] text-red-500" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-center h-[56px] pb-8 shrink-0 items-center px-4">
        <div class="flex gap-[10px] items-center justify-center">
          <span class="body2 mx-auto text-gray-700">Merry limit today</span>
          <span class="body2 text-red-400">{{ merryCount }}/{{ swipeLimitDisplay }}</span>
        </div>
      </div>
    </section>

    <!-- chat room (replaces middle + right when chat selected) -->
    <ChatRoomCard v-if="selectedChatRoomId" class="min-w-0 flex-1" />

    <!-- right container -->
    <section v-if="!selectedChatRoomId" class="w-[16%] h-full overflow-y-auto px-4 pt-6">
      <div class="flex flex-col gap-4">
        <span class="body2 font-bold! text-gray-900">Gender you interest</span>
        <div class="flex flex-col gap-4 items-start mb-15">
          <label class="flex gap-3 justify-center items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="selectedGender === 'male'"
              @change="toggleGender('male')"
              class="size-[18px] shrink-0 cursor-pointer rounded border-2 border-purple-300 accent-purple-500"
            />
            <span class="body2 font-medium! gray-700">Male</span>
          </label>
          <label class="flex gap-3 justify-center items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="selectedGender === 'female'"
              @change="toggleGender('female')"
              class="size-[18px] shrink-0 cursor-pointer rounded border-2 border-purple-300 accent-purple-500"
            />
            <span class="body2 font-medium! gray-700">Female</span>
          </label>
          <label class="flex gap-3 justify-center items-center cursor-pointer">
            <input
              type="checkbox"
              :checked="selectedGender === 'non-binary'"
              @change="toggleGender('non-binary')"
              class="size-[18px] shrink-0 cursor-pointer rounded border-2 border-purple-300 accent-purple-500"
            />
            <span class="body2 font-medium! gray-700">Non-binary people</span>
          </label>
        </div>
        <div class="flex flex-col gap-3">
          <span class="body2 font-bold! text-gray-900">Age Range</span>

          <!-- dual range slider -->
          <div class="relative flex h-5 items-center">
            <div class="absolute h-[4px] w-full rounded-full bg-gray-300"></div>
            <div
              class="absolute h-[4px] rounded-full bg-purple-500"
              :style="{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }"
            ></div>
            <input
              type="range" min="18" max="100" step="1"
              :value="minAge"
              @input="onMinInput"
              class="range-thumb absolute inset-0 h-full w-full"
              :style="{ zIndex: minAge > maxAge - 10 ? 20 : 10 }"
            />
            <input
              type="range" min="18" max="100" step="1"
              :value="maxAge"
              @input="onMaxInput"
              class="range-thumb absolute inset-0 h-full w-full"
              :style="{ zIndex: minAge > maxAge - 10 ? 10 : 20 }"
            />
          </div>

          <!-- value boxes -->
          <div class="flex items-center gap-2">
            <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
              <span class="body2 text-gray-600">{{ minAge }}</span>
            </div>
            <span class="body2 text-gray-700">-</span>
            <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
              <span class="body2 text-gray-600">{{ maxAge }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <!-- filter bottom sheet (mobile) -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showFilter" class="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
        <!-- backdrop -->
        <div class="absolute inset-0 bg-[#00000080]" @click="showFilter = false" />
        <!-- sheet -->
        <div class="relative z-10 bg-white rounded-t-[24px] px-6 pt-6 pb-10 flex flex-col gap-6">
          <!-- header -->
          <div class="flex items-center justify-between">
            <button @click="showFilter = false" class="cursor-pointer">
              <xLogo class="size-6 text-black stroke-2" />
            </button>
            <span class="headline4 text-[#1A1A6E]">Filter</span>
            <button class="body2 font-bold! text-red-500 cursor-pointer" @click="clearFilter">Clear</button>
          </div>

          <!-- gender -->
          <div class="flex flex-col gap-4">
            <span class="body2 font-bold! text-gray-900">Gender you interest</span>
            <label class="flex gap-3 items-center cursor-pointer">
              <input type="checkbox" v-model="genderOptions.default"
                class="size-[18px] shrink-0 rounded border-2 border-purple-300 accent-purple-500" />
              <span class="body2 font-medium!" :class="genderOptions.default ? 'text-gray-900' : 'text-gray-700'">Default</span>
            </label>
            <label class="flex gap-3 items-center cursor-pointer">
              <input type="checkbox" v-model="genderOptions.female"
                class="size-[18px] shrink-0 rounded border-2 border-purple-300 accent-purple-500" />
              <span class="body2 font-medium!" :class="genderOptions.female ? 'text-gray-900' : 'text-gray-700'">Female</span>
            </label>
            <label class="flex gap-3 items-center cursor-pointer">
              <input type="checkbox" v-model="genderOptions.nonbinary"
                class="size-[18px] shrink-0 rounded border-2 border-purple-300 accent-purple-500" />
              <span class="body2 font-medium!" :class="genderOptions.nonbinary ? 'text-gray-900' : 'text-gray-700'">Non-bunary people</span>
            </label>
          </div>

          <!-- age range -->
          <div class="flex flex-col gap-3">
            <span class="body2 font-bold! text-gray-900">Age Range</span>
            <div class="relative flex h-5 items-center">
              <div class="absolute h-[4px] w-full rounded-full bg-gray-300"></div>
              <div
                class="absolute h-[4px] rounded-full bg-purple-500"
                :style="{ left: `${filterMinPercent}%`, width: `${filterMaxPercent - filterMinPercent}%` }"
              ></div>
              <input type="range" min="18" max="100" step="1"
                :value="filterMinAge" @input="onFilterMinInput"
                class="range-thumb absolute inset-0 h-full w-full"
                :style="{ zIndex: filterMinAge > filterMaxAge - 10 ? 20 : 10 }" />
              <input type="range" min="18" max="100" step="1"
                :value="filterMaxAge" @input="onFilterMaxInput"
                class="range-thumb absolute inset-0 h-full w-full"
                :style="{ zIndex: filterMinAge > filterMaxAge - 10 ? 10 : 20 }" />
            </div>
            <div class="flex items-center gap-2">
              <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
                <span class="body2 text-gray-600">{{ filterMinAge }}</span>
              </div>
              <span class="body2 text-gray-700">-</span>
              <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
                <span class="body2 text-gray-600">{{ filterMaxAge }}</span>
              </div>
            </div>
          </div>

          <!-- search button -->
          <button class="w-full h-[56px] rounded-full bg-red-500 text-white body2 font-bold! cursor-pointer hover:bg-red-600 transition-colors"
            @click="applyMobileFilter">
            Search
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- profile preview modal (desktop) -->
  <Teleport to="body">
    <ProfilePreviewPopUp :open="showPreview" :user-id="currentProfile?.id" @close="showPreview = false" />
  </Teleport>

  <!-- match popup -->
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="showMatchPopup"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="showMatchPopup = false"
      >
        <div class="relative flex flex-col items-center gap-6 rounded-[32px] bg-white px-10 py-10 shadow-2xl max-w-[380px] w-full mx-4 text-center">
          <button
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
            @click="showMatchPopup = false"
          >
            <xLogo class="size-4 text-gray-700" />
          </button>
          <img
            v-if="matchedProfile?.img"
            :src="matchedProfile.img"
            class="w-[120px] h-[120px] rounded-full object-cover ring-4 ring-red-400"
            alt=""
          />
          <div class="flex flex-col gap-2">
            <span class="headline3 text-[#1A1A6E]">It's a Match!</span>
            <span class="body2 text-gray-600">
              You and <strong>{{ matchedProfile?.name }}</strong> liked each other
            </span>
          </div>
          <button
            class="w-full h-[52px] rounded-full bg-red-500 text-white body2 font-bold! cursor-pointer hover:bg-red-600 transition-colors"
            @click="showMatchPopup = false"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- merry limit reached popup -->
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="showLimitPopup"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="showLimitPopup = false"
      >
        <div class="relative flex flex-col items-center gap-6 rounded-[32px] bg-white px-10 py-10 shadow-2xl max-w-[380px] w-full mx-4 text-center">
          <button
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition"
            @click="showLimitPopup = false"
          >
            <xLogo class="size-4 text-gray-700" />
          </button>
          <div class="w-[80px] h-[80px] rounded-full bg-red-100 flex items-center justify-center">
            <heartLogo class="size-[44px] text-red-400" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="headline3 text-[#1A1A6E]">Merry Limit Reached!</span>
            <span class="body2 text-gray-600">
              You've used all <strong>{{ swipeLimit }}</strong> Merry for today. Come back tomorrow or upgrade your plan to get more!
            </span>
          </div>
          <button
            class="w-full h-[52px] rounded-full bg-red-100 text-red-600 body2 font-bold! cursor-pointer hover:bg-red-200 transition-colors"
            @click="showLimitPopup = false; $router.push('/packages')"
          >
            Upgrade Plan
          </button>
          <button
            class="w-full h-[52px] rounded-full bg-gray-100 text-gray-700 body2 font-bold! cursor-pointer hover:bg-gray-200 transition-colors"
            @click="showLimitPopup = false"
          >
            OK
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- profile preview modal (mobile) -->
  <Teleport to="body">
    <div
      v-if="showMobilePreview"
      class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto lg:hidden"
      @click.self="showMobilePreview = false"
    >
      <div class="relative w-full max-w-[390px] rounded-[24px] shadow-2xl overflow-hidden my-auto">
        <ProfilePreviewCardForMatchingPage
          :user-id="currentProfile?.id"
          :fallback-photo-url="currentProfile?.img"
          @close="showMobilePreview = false"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s ease;
}
.sheet-enter-from .sheet-leave-to {
  transform: translateY(100%);
}

.range-thumb {
  cursor: pointer;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.range-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background-color: var(--color-purple-500);
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  cursor: pointer;
}

.range-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background-color: var(--color-purple-500);
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  cursor: pointer;
}

.range-thumb::-webkit-slider-runnable-track {
  background: transparent;
}

.range-thumb::-moz-range-track {
  background: transparent;
}
</style>
