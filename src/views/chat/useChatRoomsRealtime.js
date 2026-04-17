import { onUnmounted, watch } from "vue"
import { supabase } from "@/lib/supabase"

/**
 * Refresh chat room list when Supabase receives INSERT/UPDATE on `chat_rooms`
 * or INSERT on `messages` (RLS limits which rows trigger for the anon user).
 * No-op if VITE_SUPABASE_* is unset.
 *
 * @param {{
 *   matchIdRef: import('vue').Ref<string> | import('vue').ComputedRef<string>
 *   onRefresh: () => void
 *   isEnabled?: () => boolean
 * }} options
 */
export function useChatRoomsRealtime(options) {
  const { matchIdRef, onRefresh, isEnabled } = options

  let channel = null
  let debounceTimer = null

  function scheduleRefresh() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      onRefresh()
    }, 200)
  }

  function unsubscribe() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (supabase && channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  function subscribe() {
    unsubscribe()
    if (!supabase) return
    if (isEnabled && !isEnabled()) return

    const mid = matchIdRef.value != null ? String(matchIdRef.value).trim() : ""

    const ch = supabase.channel(`chat-rooms-sidebar:${mid || "all"}`)

    const insertRoomCfg = {
      event: "INSERT",
      schema: "public",
      table: "chat_rooms",
    }
    const updateRoomCfg = {
      event: "UPDATE",
      schema: "public",
      table: "chat_rooms",
    }
    if (mid) {
      insertRoomCfg.filter = `match_id=eq.${mid}`
      updateRoomCfg.filter = `match_id=eq.${mid}`
    }

    ch.on("postgres_changes", insertRoomCfg, scheduleRefresh)
    ch.on("postgres_changes", updateRoomCfg, scheduleRefresh)
    ch.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      scheduleRefresh,
    )

    ch.subscribe()
    channel = ch
  }

  watch(
    [matchIdRef, () => (isEnabled ? isEnabled() : true)],
    () => {
      if (!supabase) {
        unsubscribe()
        return
      }
      if (isEnabled && !isEnabled()) {
        unsubscribe()
        return
      }
      subscribe()
    },
    { immediate: true },
  )

  onUnmounted(() => {
    unsubscribe()
  })

  return { unsubscribe }
}
