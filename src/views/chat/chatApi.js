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

function authHeaders(token) {
  const t = String(token || "").trim()
  if (!t) return {}
  return { Authorization: t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}` }
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
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Load messages failed (${res.status})`)
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
    const text = await res.text().catch(() => "")
    throw new Error(text || `Load chat peer failed (${res.status})`)
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
    const text = await res.text().catch(() => "")
    throw new Error(text || `Send message failed (${res.status})`)
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
    const text = await res.text().catch(() => "")
    throw new Error(text || `Mark read failed (${res.status})`)
  }
}

/**
 * Placeholder for future chat list / badges (Phase 4).
 * @param {string} token
 * @returns {Promise<{ totalUnread: number }>}
 */
export async function fetchUnreadSummary(token) {
  const res = await fetch(apiUrl("/api/chat/unread-summary"), {
    headers: { ...authHeaders(token) },
  })
  if (res.status === 404 && useSupabaseFallback()) {
    return { totalUnread: 0 }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `Unread summary failed (${res.status})`)
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
    const text = await res.text().catch(() => "")
    throw new Error(text || `Upload image failed (${res.status})`)
  }
  const body = await res.json()
  const imageUrl = body?.image_url ?? body?.imageUrl ?? body?.url
  if (!imageUrl || typeof imageUrl !== "string") {
    throw new Error("Upload response missing image URL")
  }
  return { imageUrl }
}
