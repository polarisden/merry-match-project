import { apiUrl } from "@/lib/apiBase"
import { supabase } from "@/lib/supabase"
import { assertChatImageFile } from "@/views/chat/chatImageRules"

/**
 * @typedef {{
 *   id: string
 *   chatRoomId: string
 *   senderId: string
 *   messageType: 'text' | 'image'
 *   messageText: string | null
 *   imageUrl: string | null
 *   isRead: boolean
 *   createdAt: string | null
 * }} ChatMessageDto
 */

/**
 * Row from `chat_rooms` (+ optional joined peer fields from API).
 * @typedef {{
 *   id: string
 *   matchId: string
 *   createdAt: string | null
 *   lastMessageText: string | null
 *   lastMessageType: string | null
 *   lastMessageAt: string | null
 *   lastSenderId: string | null
 *   peerName: string
 *   peerImageUrl: string | null
 *   unreadCount: number
 * }} ChatRoomListDto
 */

function authHeaders(token) {
  const t = String(token || "").trim()
  if (!t) return {}
  return { Authorization: t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}` }
}

async function readApiErrorMessage(res) {
  const raw = await res.text().catch(() => "")
  if (!raw) return ""
  try {
    const j = JSON.parse(raw)
    const m = j?.message ?? j?.error_description ?? j?.error
    return typeof m === "string" && m.trim() ? m.trim() : raw
  } catch {
    return raw
  }
}

/**
 * When the Spring API has no chat routes yet (404), use Supabase if env is set.
 * Requires RLS policies that allow select/insert/update on `messages` (and storage for images).
 */
function useSupabaseFallback() {
  return Boolean(supabase)
}

/**
 * @param {string} chatRoomId
 * @returns {Promise<ChatMessageDto[]>}
 */
async function fetchMessagesSupabase(chatRoomId) {
  if (!supabase) throw new Error("Supabase is not configured")
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_room_id", chatRoomId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(normalizeMessage)
}

/**
 * @param {string} chatRoomId
 * @param {{ messageType: 'text' | 'image', messageText?: string | null, imageUrl?: string | null }} payload
 * @param {string} senderId
 * @returns {Promise<ChatMessageDto>}
 */
async function sendMessageSupabase(chatRoomId, payload, senderId) {
  if (!supabase) throw new Error("Supabase is not configured")
  if (!senderId) throw new Error("Missing sender id for Supabase send")

  const row = {
    chat_room_id: chatRoomId,
    sender_id: senderId,
    message_type: payload.messageType,
    message_text: payload.messageText ?? null,
    image_url: payload.imageUrl ?? null,
    is_read: false,
  }

  const { data, error } = await supabase.from("messages").insert(row).select().single()
  if (error) throw new Error(error.message)
  return normalizeMessage(data)
}

/**
 * Mark others' messages in this room as read (best effort for `is_read` on rows).
 * @param {string} chatRoomId
 * @param {string} readerId
 */
async function markRoomReadSupabase(chatRoomId, readerId) {
  if (!supabase) throw new Error("Supabase is not configured")
  if (!readerId) return

  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("chat_room_id", chatRoomId)
    .neq("sender_id", readerId)

  if (error) throw new Error(error.message)
}

function storageBucket() {
  const b = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET
  return typeof b === "string" && b.trim() ? b.trim() : "chat-images"
}

/**
 * @param {string} chatRoomId
 * @param {File} file
 * @returns {Promise<{ imageUrl: string }>}
 */
async function uploadChatImageSupabase(chatRoomId, file) {
  assertChatImageFile(file)
  if (!supabase) throw new Error("Supabase is not configured")
  const bucket = storageBucket()
  const safeName = String(file.name || "image").replace(/[^\w.-]+/g, "_")
  const path = `${chatRoomId}/${Date.now()}-${safeName}`

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })
  if (upErr) throw new Error(upErr.message)

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
  const imageUrl = pub?.publicUrl
  if (!imageUrl) throw new Error("Could not resolve public URL for upload")
  return { imageUrl }
}

/**
 * @param {unknown} row
 * @returns {ChatMessageDto}
 */
/**
 * @param {unknown} row
 * @returns {ChatRoomListDto}
 */
export function normalizeChatRoom(row) {
  if (!row || typeof row !== "object") {
    return {
      id: "",
      matchId: "",
      createdAt: null,
      lastMessageText: null,
      lastMessageType: null,
      lastMessageAt: null,
      lastSenderId: null,
      peerName: "",
      peerImageUrl: null,
      unreadCount: 0,
    }
  }
  const r = /** @type {Record<string, unknown>} */ (row)
  const peerName =
    r.peer_name != null
      ? String(r.peer_name)
      : r.peerName != null
        ? String(r.peerName)
        : r.peer_display_name != null
          ? String(r.peer_display_name)
          : ""
  const peerImg =
    r.peer_image_url != null
      ? String(r.peer_image_url)
      : r.peerImageUrl != null
        ? String(r.peerImageUrl)
        : r.peer_avatar_url != null
          ? String(r.peer_avatar_url)
          : null
  return {
    id: String(r.id ?? ""),
    matchId: String(r.match_id ?? r.matchId ?? ""),
    createdAt: r.created_at != null ? String(r.created_at) : r.createdAt != null ? String(r.createdAt) : null,
    lastMessageText:
      r.last_message_text != null
        ? String(r.last_message_text)
        : r.lastMessageText != null
          ? String(r.lastMessageText)
          : null,
    lastMessageType:
      r.last_message_type != null
        ? String(r.last_message_type)
        : r.lastMessageType != null
          ? String(r.lastMessageType)
          : null,
    lastMessageAt:
      r.last_message_at != null
        ? String(r.last_message_at)
        : r.lastMessageAt != null
          ? String(r.lastMessageAt)
          : null,
    lastSenderId:
      r.last_sender_id != null
        ? String(r.last_sender_id)
        : r.lastSenderId != null
          ? String(r.lastSenderId)
          : null,
    peerName: peerName.trim(),
    peerImageUrl: peerImg && String(peerImg).trim() ? String(peerImg).trim() : null,
    unreadCount: (() => {
      const u = r.unread_count ?? r.unreadCount
      if (u == null) return 0
      const n = typeof u === "number" ? u : Number(u)
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
    })(),
  }
}

/**
 * @param {string} matchId
 * @returns {Promise<ChatRoomListDto[]>}
 */
async function fetchChatRoomsByMatchSupabase(matchId) {
  if (!supabase) throw new Error("Supabase is not configured")
  const mid = String(matchId || "").trim()
  if (!mid) throw new Error("match_id is required")

  const { data, error } = await supabase
    .from("chat_rooms")
    .select("*")
    .eq("match_id", mid)
    .order("last_message_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(normalizeChatRoom)
}

/**
 * @param {string} chatRoomId
 * @param {{ last_message_text?: string | null, last_message_type: string, last_message_at: string, last_sender_id: string }} body
 */
async function patchChatRoomLastMessageSupabase(chatRoomId, body) {
  if (!supabase) throw new Error("Supabase is not configured")
  const { error } = await supabase
    .from("chat_rooms")
    .update({
      last_message_text: body.last_message_text ?? null,
      last_message_type: body.last_message_type,
      last_message_at: body.last_message_at,
      last_sender_id: body.last_sender_id,
    })
    .eq("id", chatRoomId)

  if (error) throw new Error(error.message)
}

export function normalizeMessage(row) {
  if (!row || typeof row !== "object") {
    return {
      id: "",
      chatRoomId: "",
      senderId: "",
      messageType: "text",
      messageText: null,
      imageUrl: null,
      isRead: false,
      createdAt: null,
    }
  }
  const r = /** @type {Record<string, unknown>} */ (row)
  return {
    id: String(r.id ?? ""),
    chatRoomId: String(r.chat_room_id ?? r.chatRoomId ?? ""),
    senderId: String(r.sender_id ?? r.senderId ?? ""),
    messageType: r.message_type === "image" || r.messageType === "image" ? "image" : "text",
    messageText: r.message_text != null ? String(r.message_text) : r.messageText != null ? String(r.messageText) : null,
    imageUrl: r.image_url != null ? String(r.image_url) : r.imageUrl != null ? String(r.imageUrl) : null,
    isRead: Boolean(r.is_read ?? r.isRead),
    createdAt: r.created_at != null ? String(r.created_at) : r.createdAt != null ? String(r.createdAt) : null,
  }
}

/**
 * @param {string} chatRoomId
 * @param {string} token
 * @returns {Promise<ChatMessageDto[]>}
 */
export async function fetchChatMessages(chatRoomId, token) {
  const res = await fetch(apiUrl(`/api/chat/rooms/${encodeURIComponent(chatRoomId)}/messages`), {
    headers: { ...authHeaders(token) },
  })
  if (res.status === 404 && useSupabaseFallback()) {
    return fetchMessagesSupabase(chatRoomId)
  }
  // First-time entry: allow "no room/messages yet" to render empty state (no loud JSON error).
  if (res.status === 404) {
    return []
  }
  if (!res.ok) {
    const msg = await readApiErrorMessage(res)
    throw new Error(msg || `Load messages failed (${res.status})`)
  }
  const body = await res.json()
  const list = Array.isArray(body) ? body : body?.messages ?? body?.data ?? []
  return list.map(normalizeMessage)
}

/**
 * Other participant: display name + first uploaded profile image (`created_at` ASC on backend).
 * @param {string} chatRoomId
 * @param {string} token
 * @returns {Promise<{ name?: string, user_id?: string, userId?: string, image_url?: string | null, imageUrl?: string | null }>}
 */
export async function fetchChatPeer(chatRoomId, token) {
  const res = await fetch(apiUrl(`/api/chat/rooms/${encodeURIComponent(chatRoomId)}/peer`), {
    headers: { ...authHeaders(token) },
  })
  if (!res.ok) {
    const msg = await readApiErrorMessage(res)
    throw new Error(msg || `Load chat peer failed (${res.status})`)
  }
  return await res.json()
}

/**
 * @param {string} chatRoomId
 * @param {{ messageType: 'text' | 'image', messageText?: string | null, imageUrl?: string | null }} payload
 * @param {string} token
 * @param {{ senderId?: string | null }} [meta] required for Supabase fallback on 404
 * @returns {Promise<ChatMessageDto>}
 */
export async function sendChatMessage(chatRoomId, payload, token, meta = {}) {
  const res = await fetch(apiUrl(`/api/chat/rooms/${encodeURIComponent(chatRoomId)}/messages`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({
      message_type: payload.messageType,
      message_text: payload.messageText ?? null,
      image_url: payload.imageUrl ?? null,
    }),
  })
  if (res.status === 404 && useSupabaseFallback()) {
    const sid = meta.senderId != null ? String(meta.senderId) : ""
    return sendMessageSupabase(chatRoomId, payload, sid)
  }
  if (!res.ok) {
    const msg = await readApiErrorMessage(res)
    throw new Error(msg || `Send message failed (${res.status})`)
  }
  const body = await res.json()
  const row = body?.message ?? body?.data ?? body
  return normalizeMessage(row)
}

/**
 * Mark messages in this room as read for the current user.
 * @param {string} chatRoomId
 * @param {string} token
 * @param {{ readerId?: string | null }} [meta]
 */
export async function markChatRoomRead(chatRoomId, token, meta = {}) {
  const res = await fetch(apiUrl(`/api/chat/rooms/${encodeURIComponent(chatRoomId)}/read`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: "{}",
  })
  if (res.status === 404 && useSupabaseFallback()) {
    const rid = meta.readerId != null ? String(meta.readerId) : ""
    await markRoomReadSupabase(chatRoomId, rid)
    return
  }
  if (!res.ok) {
    const msg = await readApiErrorMessage(res)
    throw new Error(msg || `Mark read failed (${res.status})`)
  }
}

/**
 * Placeholder for future chat list / badges (Phase 4).
 * @param {string} token
 * @returns {Promise<{ totalUnread: number }>}
 */
/**
 * Chat rooms for the logged-in user for a given match (backend resolves membership via JWT).
 * Spring contract: `GET /api/chat/matches/{matchId}/rooms` → JSON array or `{ rooms: [...] }`.
 *
 * @param {string} matchId
 * @param {string} token
 * @returns {Promise<ChatRoomListDto[]>}
 */
export async function fetchChatRoomsByMatch(matchId, token) {
  const mid = String(matchId || "").trim()
  if (!mid) return []

  const res = await fetch(apiUrl(`/api/chat/matches/${encodeURIComponent(mid)}/rooms`), {
    headers: { ...authHeaders(token) },
  })
  if (res.status === 404 && useSupabaseFallback()) {
    return fetchChatRoomsByMatchSupabase(mid)
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Load chat rooms failed (${res.status})`)
  }
  const body = await res.json()
  const list = Array.isArray(body) ? body : body?.rooms ?? body?.data ?? []
  return list.map(normalizeChatRoom)
}

/**
 * All chat rooms for the logged-in user (any match). Spring: `GET /api/chat/rooms`.
 * @param {string} token
 * @returns {Promise<ChatRoomListDto[]>}
 */
export async function fetchChatRoomsForUser(token) {
  const res = await fetch(apiUrl("/api/chat/rooms"), {
    headers: { ...authHeaders(token) },
  })
  if (res.status === 404 && useSupabaseFallback()) {
    return []
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Load chat rooms failed (${res.status})`)
  }
  const body = await res.json()
  const list = Array.isArray(body) ? body : body?.rooms ?? body?.data ?? []
  return list.map(normalizeChatRoom)
}

/**
 * Updates `chat_rooms` last-message snapshot (call after send, or implement only on backend inside POST /messages).
 * Spring contract: `PATCH /api/chat/rooms/{chatRoomId}/last-message` with JSON body (snake_case).
 *
 * @param {string} chatRoomId
 * @param {{
 *   lastMessageText?: string | null
 *   lastMessageType: 'text' | 'image' | string
 *   lastMessageAt: string
 *   lastSenderId: string
 * }} payload
 * @param {string} token
 */
export async function patchChatRoomLastMessage(chatRoomId, token, payload) {
  const body = {
    last_message_text: payload.lastMessageText ?? null,
    last_message_type: payload.lastMessageType,
    last_message_at: payload.lastMessageAt,
    last_sender_id: payload.lastSenderId,
  }

  const res = await fetch(apiUrl(`/api/chat/rooms/${encodeURIComponent(chatRoomId)}/last-message`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  })
  if (res.status === 404 && useSupabaseFallback()) {
    await patchChatRoomLastMessageSupabase(chatRoomId, body)
    return
  }
  if (!res.ok && res.status !== 204) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Update last message failed (${res.status})`)
  }
}

export async function fetchUnreadSummary(token) {
  const res = await fetch(apiUrl("/api/chat/unread-summary"), {
    headers: { ...authHeaders(token) },
  })
  if (res.status === 404 && useSupabaseFallback()) {
    return { totalUnread: 0 }
  }
  if (!res.ok) {
    const msg = await readApiErrorMessage(res)
    throw new Error(msg || `Unread summary failed (${res.status})`)
  }
  const body = await res.json()
  const n = body?.totalUnread ?? body?.total_unread ?? body?.count ?? 0
  return { totalUnread: typeof n === "number" ? n : Number(n) || 0 }
}

/**
 * Upload an image for chat; returns public URL for `message_type = image`.
 * @param {string} chatRoomId
 * @param {File} file
 * @param {string} token
 * @returns {Promise<{ imageUrl: string }>}
 */
export async function uploadChatImage(chatRoomId, file, token) {
  assertChatImageFile(file)
  const form = new FormData()
  form.append("file", file)

  const res = await fetch(apiUrl(`/api/chat/rooms/${encodeURIComponent(chatRoomId)}/images`), {
    method: "POST",
    headers: { ...authHeaders(token) },
    body: form,
  })
  if (res.status === 404 && useSupabaseFallback()) {
    return uploadChatImageSupabase(chatRoomId, file)
  }
  if (!res.ok) {
    const msg = await readApiErrorMessage(res)
    throw new Error(msg || `Upload image failed (${res.status})`)
  }
  const body = await res.json()
  const imageUrl = body?.image_url ?? body?.imageUrl ?? body?.url
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Upload response missing image URL")
  }
  return { imageUrl }
}
