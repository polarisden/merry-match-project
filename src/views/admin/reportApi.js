import { apiUrl } from "@/lib/apiBase"

/**
 * @typedef {{
 *   id: string
 *   reporterName: string
 *   issue: string
 *   description: string
 *   status: 'new' | 'pending' | 'resolved' | 'cancel'
 *   createdAt: string
 * }} ReportItem
 */

function authHeaders(token) {
  const t = String(token || "").trim()
  if (!t) return {}
  return { Authorization: t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}` }
}

async function readErrMsg(res) {
  const raw = await res.text().catch(() => "")
  if (!raw) return `Request failed (${res.status})`
  try {
    const j = JSON.parse(raw)
    const m = j?.message ?? j?.error_description ?? j?.error
    return typeof m === "string" && m.trim() ? m.trim() : raw
  } catch {
    return raw
  }
}

/**
 * User submits a complaint.
 * POST /api/reports
 * @param {{ issue: string, description: string }} payload
 * @param {string} token
 * @returns {Promise<ReportItem>}
 */
export async function submitUserReport(payload, token) {
  const res = await fetch(apiUrl("/api/reports"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const msg = await readErrMsg(res)
    throw new Error(msg || `Submit failed (${res.status})`)
  }
  return res.json()
}

/**
 * Admin: fetch all complaints (newest first).
 * GET /api/admin/complaints
 * @param {string} token
 * @returns {Promise<ReportItem[]>}
 */
export async function fetchAdminComplaints(token) {
  const res = await fetch(apiUrl("/api/admin/complaints"), {
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const msg = await readErrMsg(res)
    throw new Error(msg || `Fetch failed (${res.status})`)
  }
  return res.json()
}

/**
 * Admin: get complaint detail; backend auto-transitions status new→pending.
 * GET /api/admin/complaints/:id
 * @param {string} id
 * @param {string} token
 * @returns {Promise<ReportItem>}
 */
export async function fetchAdminComplaintDetail(id, token) {
  const res = await fetch(apiUrl(`/api/admin/complaints/${encodeURIComponent(id)}`), {
    headers: authHeaders(token),
  })
  if (!res.ok) {
    const msg = await readErrMsg(res)
    throw new Error(msg || `Fetch failed (${res.status})`)
  }
  return res.json()
}

/**
 * Admin: update complaint status.
 * PATCH /api/admin/complaints/:id/status
 * @param {string} id
 * @param {'pending' | 'resolved' | 'cancel'} status
 * @param {string} token
 * @returns {Promise<ReportItem>}
 */
export async function updateComplaintStatus(id, status, token) {
  const res = await fetch(apiUrl(`/api/admin/complaints/${encodeURIComponent(id)}/status`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const msg = await readErrMsg(res)
    throw new Error(msg || `Update failed (${res.status})`)
  }
  return res.json()
}
