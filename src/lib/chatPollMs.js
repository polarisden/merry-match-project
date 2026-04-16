/**
 * Shared interval for chat message list + sidebar room list when using Spring REST
 * (no push). Set VITE_CHAT_POLL_MS=0 to disable.
 */
export function getChatPollIntervalMs() {
  const v = import.meta.env.VITE_CHAT_POLL_MS
  if (v === "0" || v === "false") return 0
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : 4000
}
