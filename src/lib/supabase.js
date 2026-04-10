import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Client for Realtime (and optional direct reads) when env is set.
 * Backend may still own REST writes; Realtime fires on DB inserts.
 */
export const supabase = url && anonKey ? createClient(String(url), String(anonKey)) : null

export function isSupabaseConfigured() {
  return Boolean(supabase)
}
