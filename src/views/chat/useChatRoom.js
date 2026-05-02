import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from "vue"
import { getMyProfile } from "@/views/profile/profileApi"
import { getChatPollIntervalMs } from "@/lib/chatPollMs"
import { supabase } from "@/lib/supabase"
import {
  fetchChatMessages,
  fetchChatPeer,
  fetchUnreadSummary,
  markChatRoomRead,
  normalizeMessage,
  patchChatRoomLastMessage,
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

/**
 * Cross-browser safe timestamp parser.
 * Supabase returns microsecond precision (6 dp) e.g. "2026-04-23T13:34:41.120901"
 * which is outside the ECMAScript ISO 8601 spec (only 3 dp for milliseconds).
 * We truncate to 3 dp so every browser returns a finite number.
 */
function parseTs(val) {
  if (!val) return 0
  const s = String(val).replace(/(\.\d{3})\d+/, '$1')
  const t = Date.parse(s)
  return Number.isFinite(t) ? t : 0
}

function sortByCreatedAt(a, b) {
  const ta = parseTs(a.createdAt)
  const tb = parseTs(b.createdAt)
  if (ta !== tb) return ta - tb
  return String(a.id).localeCompare(String(b.id))
}

/**
 * @param {import('vue-router').RouteLocationNormalizedLoaded} route
 */
export function useChatRoom(route) {
  const chatRoomId = computed(() => {
    const q = route.query.room
    if (typeof q === "string" && q.trim()) return q.trim()
    return ""
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

  const isEmpty = computed(() => !loading.value && messages.value.length === 0)

  /** @type {ReturnType<typeof setTimeout> | null} */
  let markReadTimer = null

  /** @type {ReturnType<typeof setInterval> | null} */
  let readSyncTimer = null

  function scheduleMarkRead() {
    if (markReadTimer) clearTimeout(markReadTimer)
    markReadTimer = setTimeout(async () => {
      markReadTimer = null
      const t = token.value
      const roomId = chatRoomId.value
      if (!t || !roomId) return
      try {
        await resolveCurrentUserId()
        await markChatRoomRead(roomId, t, { readerId: currentUserId.value })
      } catch {
        /* non-fatal */
      }
    }, 250)
  }

  function stopReadSync() {
    if (readSyncTimer != null) {
      clearInterval(readSyncTimer)
      readSyncTimer = null
    }
  }

  function startReadSyncIfNeeded() {
    if (!token.value || !chatRoomId.value) return
    if (realtimeHealthy) {
      stopReadSync()
      return
    }
    const hasOutgoingUnread = messages.value.some((m) => m?.side === "outgoing" && !m?.isRead)
    if (!hasOutgoingUnread) {
      stopReadSync()
      return
    }
    if (readSyncTimer != null) return

    // Lightweight sync: only while we have outgoing unread messages.
    // Uses existing fetchChatMessages() to update isRead without forcing user refresh.
    readSyncTimer = setInterval(async () => {
      const t = token.value
      const roomId = chatRoomId.value
      if (!t || !roomId || loading.value) return
      try {
        const rows = await fetchChatMessages(roomId, t)
        mergeMessagesFromApi(rows)
      } catch {
        /* ignore */
      }
    }, 12000)
  }

  async function resolveCurrentUserId() {
    const t = token.value
    if (!t) {
      currentUserId.value = null
      return
    }
    // Short-circuit: already resolved, no need to hit the API again.
    if (currentUserId.value) return
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

  /**
   * Merge API rows into existing messages without replacing optimistically-added ones.
   * Used by reconnect recovery to avoid a race condition with in-flight sends.
   */
  function mergeMessagesFromApiSoft(rows) {
    let dirty = false
    for (const m of [...rows].sort(sortByCreatedAt)) {
      const vm = toViewMessage(m, currentUserId.value)
      if (!vm.id) continue
      if (messageIds.value.has(vm.id)) {
        // Patch isRead on existing messages (e.g. read receipts caught up).
        const idx = messages.value.findIndex((msg) => msg.id === vm.id)
        if (idx >= 0 && messages.value[idx].isRead !== vm.isRead) {
          messages.value.splice(idx, 1, { ...messages.value[idx], isRead: vm.isRead })
          dirty = true
        }
      } else {
        // New message missed during reconnect downtime — add it.
        messageIds.value.add(vm.id)
        messages.value.push(vm)
        messages.value.sort(sortByCreatedAt)
        dirty = true
      }
    }
    return dirty
  }

  function upsertIncomingMessage(dto) {
    const vm = toViewMessage(dto, currentUserId.value)
    if (!vm.id || messageIds.value.has(vm.id)) return
    messageIds.value.add(vm.id)
    // Use push() + sort() on the reactive array proxy rather than replacing the whole
    // array reference — these mutations are intercepted by Vue's reactive Proxy and
    // are guaranteed to trigger a template re-render.
    messages.value.push(vm)
    messages.value.sort(sortByCreatedAt)

    // If we're currently viewing this room and a peer message arrives,
    // mark it as read so the sender can see "Read" in realtime.
    if (vm.side === "incoming") {
      scheduleMarkRead()
    }

    // Outgoing messages may need read-sync until receiver reads.
    startReadSyncIfNeeded()
  }

  /** @param {ReturnType<typeof normalizeMessage>} dto */
  function patchExistingMessage(dto) {
    if (!dto?.id) return
    const idx = messages.value.findIndex((m) => m.id === dto.id)
    if (idx < 0) return

    const prev = messages.value[idx]
    const next = {
      ...prev,
      isRead: dto.isRead ?? prev.isRead,
      createdAt: dto.createdAt ?? prev.createdAt,
    }
    if (next.isRead === prev.isRead && next.createdAt === prev.createdAt) return

    messages.value.splice(idx, 1, next)
  }

  let realtimeChannel = null
  let realtimeHealthy = false
  let realtimeStatus = ""
  /** @type {ReturnType<typeof setInterval> | null} */
  let pollTimer = null
  /** @type {ReturnType<typeof setTimeout> | null} */
  let pollStartTimer = null
  /** @type {ReturnType<typeof setInterval> | null} */
  let safetyPollTimer = null

  function stopPolling() {
    if (pollStartTimer != null) {
      clearTimeout(pollStartTimer)
      pollStartTimer = null
    }
    if (pollTimer != null) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function stopSafetyPoll() {
    if (safetyPollTimer != null) {
      clearInterval(safetyPollTimer)
      safetyPollTimer = null
    }
  }

  /**
   * Soft-merge fetch used as a non-destructive backstop. Called in three
   * scenarios (all low-frequency, Realtime remains the primary path):
   *   1. When the tab regains visibility/focus (once per tab switch).
   *   2. On Realtime reconnect after a disconnect.
   *   3. As a very infrequent (60s) safety net while Realtime is healthy, to
   *      catch the rare dropped INSERT event. Runs only when the tab is
   *      visible to avoid wasting API calls on idle tabs.
   */
  async function runSafetyFetch() {
    const t = token.value
    const roomId = chatRoomId.value
    if (!t || !roomId || loading.value) return
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return
    try {
      const rows = await fetchChatMessages(roomId, t)
      mergeMessagesFromApiSoft(rows)
    } catch {
      /* non-fatal */
    }
  }

  function startSafetyPoll() {
    stopSafetyPoll()
    // Very infrequent backstop (1 req/min) only when tab is visible.
    // Realtime INSERT + UPDATE self-heal + visibility refetch cover 99% of cases.
    safetyPollTimer = setInterval(runSafetyFetch, 60000)
  }

  /** @param {{ msOverride?: number }} [opts] */
  function startPolling(opts = {}) {
    stopPolling()
    const baseMs = getChatPollIntervalMs()
    const ms = typeof opts.msOverride === "number" && Number.isFinite(opts.msOverride) ? opts.msOverride : baseMs
    if (ms <= 0) return
    pollTimer = setInterval(async () => {
      const t = token.value
      const roomId = chatRoomId.value
      if (!t || !roomId || loading.value) return
      try {
        const rows = await fetchChatMessages(roomId, t)
        mergeMessagesFromApi(rows)
      } catch {
        /* non-fatal: network or auth */
      }
    }, ms)
  }

  function updatePollingMode() {
    if (!supabase) {
      stopSafetyPoll()
      startPolling()
      return
    }
    // Realtime-first: disable aggressive polling & read-sync when subscribed,
    // but keep a light 10s safety-net poll running to catch missed INSERT events.
    if (realtimeHealthy) {
      stopPolling()
      stopReadSync()
      startSafetyPoll()
      return
    }

    // CLOSED = Supabase is auto-reconnecting (normal lifecycle); do NOT aggressive-poll.
    // Only fall back to 15s polling on hard failures that won't self-recover.
    stopSafetyPoll()
    const hardFailed =
      realtimeStatus === "CHANNEL_ERROR" ||
      realtimeStatus === "TIMED_OUT"
    if (!hardFailed) {
      stopPolling()
      return
    }

    startPolling({ msOverride: 15000 })
  }

  function subscribeRealtime() {
    if (!supabase) return
    const roomId = chatRoomId.value
    if (!roomId) return

    const baseName = `messages:room:${roomId}`

    // Reset to "connecting" state so updatePollingMode doesn't treat this as a failure.
    realtimeStatus = ""
    realtimeHealthy = false
    stopPolling()

    // Guard against rapid re-entry: Supabase caches channels by name.
    // Ensure we always have a handle to remove before (re)subscribing.
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel)
      } catch {
        /* ignore */
      } finally {
        realtimeChannel = null
        realtimeHealthy = false
      }
    }

    // Supabase may keep an internal registry by channel "topic".
    // Remove any existing channels that belong to this room before recreating.
    try {
      const list = typeof supabase.getChannels === "function" ? supabase.getChannels() : []
      for (const ch of list) {
        const topic = String(ch?.topic ?? "")
        if (topic.includes(baseName)) {
          supabase.removeChannel(ch)
        }
      }
    } catch {
      /* ignore */
    }

    // Use a unique name to avoid reusing a previously-subscribed channel instance.
    const channelName = `${baseName}:${Date.now()}`
    const channel = supabase.channel(channelName)
    realtimeChannel = channel

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const row = payload.new
        if (!row) return
        const rowRoomId = row.chat_room_id ?? ""
        if (rowRoomId && rowRoomId !== roomId) return
        const dto = normalizeMessage(row)
        upsertIncomingMessage(dto)
      },
    )

    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages" },
      (payload) => {
        const row = payload.new
        if (!row) return
        const rowRoomId = row.chat_room_id ?? ""
        if (rowRoomId && rowRoomId !== roomId) return
        const dto = normalizeMessage(row)
        // Self-heal: if we don't have this message yet, the INSERT event was
        // dropped — treat this UPDATE payload as an INSERT since
        // REPLICA IDENTITY FULL ensures we receive the complete row.
        if (dto.id && !messageIds.value.has(dto.id)) {
          upsertIncomingMessage(dto)
          return
        }
        patchExistingMessage(dto)
      },
    )

    let prevStatus = ""
    channel.subscribe((status, err) => {
      const wasHealthy = realtimeHealthy
      realtimeStatus = status
      realtimeHealthy = status === "SUBSCRIBED"
      updatePollingMode()

      // On reconnect (CLOSED → SUBSCRIBED): soft-merge to fill messages missed during downtime.
      // Use soft-merge (not replace) to avoid wiping optimistically-added messages mid-send.
      if (realtimeHealthy && !wasHealthy && prevStatus === "CLOSED") {
        const t = token.value
        const rid = chatRoomId.value
        if (t && rid) {
          fetchChatMessages(rid, t)
            .then((rows) => mergeMessagesFromApiSoft(rows))
            .catch(() => { /* non-fatal */ })
        }
      }
      prevStatus = status
    })
  }

  function unsubscribeRealtime() {
    if (!supabase || !realtimeChannel) return
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
    realtimeHealthy = false
    realtimeStatus = ""
    // Do NOT call updatePollingMode() here – the caller is responsible
    // (subscribeRealtime resets status to "" and will update after subscribe).
  }

  /** @param {string} roomId @param {ReturnType<typeof normalizeMessage>} dto */
  async function syncChatRoomLastMessage(roomId, dto) {
    const t = token.value
    if (!t || !roomId || !dto?.id) return
    const sid = dto.senderId || currentUserId.value || ""
    if (!sid) return
    const preview =
      dto.messageType === "image"
        ? dto.messageText && String(dto.messageText).trim()
          ? String(dto.messageText).trim()
          : "Photo"
        : dto.messageText != null
          ? String(dto.messageText)
          : ""
    const at = dto.createdAt && String(dto.createdAt).trim() ? String(dto.createdAt) : new Date().toISOString()
    try {
      await patchChatRoomLastMessage(
        roomId,
        t,
        {
          lastMessageText: preview || null,
          lastMessageType: dto.messageType,
          lastMessageAt: at,
          lastSenderId: String(sid),
        },
      )
    } catch {
      /* Backend may already update chat_rooms in POST /messages */
    }
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
    stopPolling()
    loadError.value = ""
    sendError.value = ""
    loading.value = true
    const t = token.value
    const roomId = chatRoomId.value

    if (!t || !roomId) {
      if (!t) loadError.value = "Please log in to view chat."
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
    updatePollingMode()

    try {
      await markChatRoomRead(roomId, t, { readerId: currentUserId.value })
    } catch {
      /* non-fatal */
    }

    // If we open a room and there are unread incoming messages, mark them read.
    scheduleMarkRead()
    startReadSyncIfNeeded()

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
      await syncChatRoomLastMessage(roomId, dto)
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
      await syncChatRoomLastMessage(roomId, dto)
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

  // When the tab regains focus/visibility, some Realtime events may have been
  // missed while the tab was backgrounded. Fetch immediately to catch up.
  function handleVisibilityChange() {
    if (typeof document === "undefined") return
    if (document.visibilityState === "visible") {
      runSafetyFetch()
    }
  }

  onMounted(() => {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange)
      window.addEventListener("focus", runSafetyFetch)
    }
  })

  onUnmounted(() => {
    stopPolling()
    stopSafetyPoll()
    unsubscribeRealtime()
    if (markReadTimer) {
      clearTimeout(markReadTimer)
      markReadTimer = null
    }
    stopReadSync()
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", runSafetyFetch)
    }
  })

  // Receiver-side safety net: whenever we see any incoming unread messages, mark read.
  watchEffect(() => {
    if (loading.value) return
    const hasIncomingUnread = messages.value.some((m) => m?.side === "incoming" && !m?.isRead)
    if (hasIncomingUnread) scheduleMarkRead()
  })

  // Sender-side: stop read-sync when all outgoing are read.
  watch(
    () => messages.value.map((m) => `${m.id}:${m.side}:${m.isRead}`).join("|"),
    () => startReadSyncIfNeeded(),
  )

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
    loadInitial,
    sendText,
    sendImageFile,
    messageSpacingClass,
  }
}
