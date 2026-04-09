import { computed, nextTick, onUnmounted, ref, watch } from "vue"
import { getMyProfile } from "@/views/profile/profileApi"
import { supabase } from "@/lib/supabase"
import {
  fetchChatMessages,
  fetchChatPeer,
  fetchUnreadSummary,
  markChatRoomRead,
  normalizeMessage,
  sendChatMessage,
  uploadChatImage,
} from "@/views/chat/chatApi"

/** @param {string} token */
function parseJwtUserId(token) {
  try {
    const parts = String(token).split(".")
    if (parts.length < 2) return null
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const pad = b64.length % 4
    if (pad) b64 += "=".repeat(4 - pad)
    const json = atob(b64)
    const payload = JSON.parse(json)
    const sub = payload.sub ?? payload.userId ?? payload.user_id
    return typeof sub === "string" ? sub : sub != null ? String(sub) : null
  } catch {
    return null
  }
}

/**
 * @param {*} m normalized API row
 * @param {string | null} currentUserId
 */
function toViewMessage(m, currentUserId) {
  const isMine = Boolean(currentUserId && m.senderId === currentUserId)
  const isImage = m.messageType === "image"
  return {
    id: m.id,
    side: isMine ? "outgoing" : "incoming",
    type: isImage ? "image" : "text",
    text: m.messageText ?? "",
    imageUrl: m.imageUrl ?? "",
    alt: isImage ? "Chat image" : "",
    isRead: m.isRead,
    createdAt: m.createdAt,
    senderId: m.senderId,
  }
}

function sortByCreatedAt(a, b) {
  const ta = a.createdAt ? Date.parse(a.createdAt) : 0
  const tb = b.createdAt ? Date.parse(b.createdAt) : 0
  if (ta !== tb) return ta - tb
  return String(a.id).localeCompare(String(b.id))
}

/**
 * @param {import('vue-router').RouteLocationNormalizedLoaded} route
 */
export function useChatRoom(route) {
  const mockRoomId =
    (typeof import.meta.env.VITE_MOCK_CHAT_ROOM_ID === "string" && import.meta.env.VITE_MOCK_CHAT_ROOM_ID.trim()) ||
    "00000000-0000-0000-0000-000000000001"

  const chatRoomId = computed(() => {
    const q = route.query.room
    if (typeof q === "string" && q.trim()) return q.trim()
    return mockRoomId
  })

  const token = ref(typeof localStorage !== "undefined" ? localStorage.getItem("token") ?? "" : "")
  const currentUserId = ref(/** @type {string | null} */ (null))

  const messages = ref(/** @type {ReturnType<typeof toViewMessage>[]} */ ([]))
  const messageIds = ref(/** @type {Set<string>} */ (new Set()))

  const loading = ref(true)
  const sending = ref(false)
  const uploading = ref(false)
  const loadError = ref("")
  const sendError = ref("")
  const unreadTotal = ref(0)
  const peerName = ref("")
  const peerImageUrl = ref(/** @type {string | null} */ (null))

  const listScrollEl = ref(/** @type {HTMLElement | null} */ (null))

  const isEmpty = computed(() => !loading.value && messages.value.length === 0)

  function scrollListToBottom() {
    const el = listScrollEl.value
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  watch(
    () => messages.value.length,
    async () => {
      await nextTick()
      scrollListToBottom()
    },
  )

  async function resolveCurrentUserId() {
    const t = token.value
    if (!t) {
      currentUserId.value = null
      return
    }
    const fromJwt = parseJwtUserId(t)
    if (fromJwt) {
      currentUserId.value = fromJwt
    }
    try {
      const profile = await getMyProfile(t)
      const id = profile?.userId ?? profile?.id ?? profile?.user?.id
      if (id != null) {
        currentUserId.value = String(id)
        return
      }
    } catch {
      /* keep JWT / null */
    }
    if (!currentUserId.value && fromJwt) {
      currentUserId.value = fromJwt
    }
  }

  function mergeMessagesFromApi(rows) {
    const sorted = [...rows].sort(sortByCreatedAt)
    const next = []
    const ids = new Set()
    for (const m of sorted) {
      const vm = toViewMessage(m, currentUserId.value)
      if (!vm.id) continue
      if (ids.has(vm.id)) continue
      ids.add(vm.id)
      next.push(vm)
    }
    messages.value = next
    messageIds.value = ids
  }

  function upsertIncomingMessage(dto) {
    const vm = toViewMessage(dto, currentUserId.value)
    if (!vm.id || messageIds.value.has(vm.id)) return
    messageIds.value.add(vm.id)
    messages.value = [...messages.value, vm].sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0
      if (ta !== tb) return ta - tb
      return String(a.id).localeCompare(String(b.id))
    })
  }

  let realtimeChannel = null

  function subscribeRealtime() {
    if (!supabase) return
    const roomId = chatRoomId.value
    if (!roomId) return

    const channel = supabase
      .channel(`messages:room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${roomId}`,
        },
        (payload) => {
          const row = payload.new
          if (!row) return
          const dto = normalizeMessage(row)
          upsertIncomingMessage(dto)
        },
      )
      .subscribe()

    realtimeChannel = channel
  }

  function unsubscribeRealtime() {
    if (!supabase || !realtimeChannel) return
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }

  async function loadPeerInfo() {
    peerName.value = ""
    peerImageUrl.value = null
    const t = token.value
    const roomId = chatRoomId.value
    if (!t) return
    try {
      const p = await fetchChatPeer(roomId, t)
      const n = p?.name
      peerName.value = typeof n === "string" ? n.trim() : ""
      const url = p?.image_url ?? p?.imageUrl
      peerImageUrl.value = typeof url === "string" && url.trim() ? url.trim() : null
    } catch {
      /* fallback: route placeholder name / default avatar */
    }
  }

  async function loadInitial() {
    loadError.value = ""
    sendError.value = ""
    loading.value = true
    const t = token.value
    const roomId = chatRoomId.value

    if (!t) {
      loadError.value = "Please log in to view chat."
      loading.value = false
      mergeMessagesFromApi([])
      peerName.value = ""
      peerImageUrl.value = null
      return
    }

    try {
      await resolveCurrentUserId()
      const rows = await fetchChatMessages(roomId, t)
      mergeMessagesFromApi(rows)
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : "Failed to load messages"
      mergeMessagesFromApi([])
    } finally {
      loading.value = false
    }

    await loadPeerInfo()

    unsubscribeRealtime()
    subscribeRealtime()

    try {
      await markChatRoomRead(roomId, t, { readerId: currentUserId.value })
    } catch {
      /* non-fatal */
    }

    try {
      const u = await fetchUnreadSummary(t)
      unreadTotal.value = u.totalUnread
    } catch {
      unreadTotal.value = 0
    }
  }

  async function sendText(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    const t = token.value
    const roomId = chatRoomId.value
    if (!t) {
      sendError.value = "Please log in to send messages."
      return
    }
    sending.value = true
    sendError.value = ""
    try {
      await resolveCurrentUserId()
      const dto = await sendChatMessage(
        roomId,
        { messageType: "text", messageText: trimmed, imageUrl: null },
        t,
        { senderId: currentUserId.value },
      )
      upsertIncomingMessage(dto)
    } catch (e) {
      sendError.value = e instanceof Error ? e.message : "Send failed"
    } finally {
      sending.value = false
    }
  }

  async function sendImageFile(file, caption = "") {
    const t = token.value
    const roomId = chatRoomId.value
    if (!t) {
      sendError.value = "Please log in to send images."
      return
    }
    uploading.value = true
    sendError.value = ""
    try {
      await resolveCurrentUserId()
      const { imageUrl } = await uploadChatImage(roomId, file, t)
      const cap = typeof caption === "string" ? caption.trim() : ""
      const dto = await sendChatMessage(
        roomId,
        {
          messageType: "image",
          messageText: cap.length > 0 ? cap : null,
          imageUrl,
        },
        t,
        { senderId: currentUserId.value },
      )
      upsertIncomingMessage(dto)
    } catch (e) {
      sendError.value = e instanceof Error ? e.message : "Image send failed"
    } finally {
      uploading.value = false
    }
  }

  function messageSpacingClass(index) {
    if (index === 0) return ""
    const prev = messages.value[index - 1]
    const curr = messages.value[index]
    return prev?.side !== curr?.side ? "mt-7" : "mt-2"
  }

  onUnmounted(() => {
    unsubscribeRealtime()
  })

  watch(
    chatRoomId,
    () => {
      loadInitial()
    },
    { immediate: true },
  )

  return {
    chatRoomId,
    token,
    currentUserId,
    messages,
    loading,
    sending,
    uploading,
    loadError,
    sendError,
      unreadTotal,
      peerName,
      peerImageUrl,
      isEmpty,
      listScrollEl,
    loadInitial,
    sendText,
    sendImageFile,
    messageSpacingClass,
  }
}
