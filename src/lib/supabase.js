import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY

/**
 * Client for Realtime (and optional direct reads) when env is set.
 * Backend may still own REST writes; Realtime fires on DB inserts.
 */
export const supabase = url && anonKey ? createClient(String(url), String(anonKey)) : null

export function isSupabaseConfigured() {
  return Boolean(supabase)
}

/**
 * Ensure Realtime uses the same JWT as backend APIs (for RLS).
 * Accepts raw JWT or "Bearer <jwt>".
 * @param {string | null | undefined} authorization
 */
export function setSupabaseRealtimeAuth(authorization) {
  if (!supabase) return
  const raw = typeof authorization === "string" ? authorization.trim() : ""
  const jwt = raw.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : raw
  if (!jwt) return
  try {
    // supabase-js v2
    supabase.realtime.setAuth(jwt)
  } catch {
    /* ignore */
  }
}
