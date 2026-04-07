/**
 * Optional API origin for production (e.g. Vercel → separate backend host).
 * Leave unset for local dev: requests stay same-origin and Vite proxy handles `/api`.
 *
 * Set in Vercel: VITE_API_BASE_URL = https://your-backend.example.com (no trailing slash)
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null) return ""
  const s = String(raw).trim()
  if (!s) return ""
  return s.replace(/\/+$/, "")
}

/**
 * @param {string} path absolute path starting with /
 * @returns {string} full URL when VITE_API_BASE_URL is set, otherwise `path`
 */
export function apiUrl(path) {
  const base = getApiBaseUrl()
  const p = path.startsWith("/") ? path : `/${path}`
  if (!base) return p
  return `${base}${p}`
}
