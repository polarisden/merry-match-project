import { apiUrl } from "@/lib/apiBase"

function authHeaders(token) {
  const t = String(token || '').trim()
  if (!t) return {}
  return { Authorization: t.toLowerCase().startsWith('bearer ') ? t : `Bearer ${t}` }
}

export async function getMyProfile(token) {
  const res = await fetch(apiUrl(`/api/users/me/profile`), {
    headers: { ...authHeaders(token) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Load profile failed (${res.status})`)
  }
  return await res.json()
}

export async function getUserProfile(userId, token) {
  const res = await fetch(apiUrl(`/api/users/${encodeURIComponent(userId)}/profile`), {
    headers: { ...authHeaders(token) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Load user profile failed (${res.status})`)
  }
  return await res.json()
}


export async function updateMyProfile(payload, token) {
  const res = await fetch(apiUrl(`/api/users/me/profile`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Update profile failed (${res.status})`)
  }
  return await res.json()
}

export async function uploadMyProfileImage(file, { token, isPrimary = false } = {}) {
  const form = new FormData()
  form.append('file', file)
  form.append('isPrimary', String(Boolean(isPrimary)))

  const res = await fetch(apiUrl('/api/users/me/profile-images'), {
    method: 'POST',
    headers: {
      ...authHeaders(token),
    },
    body: form,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Upload image failed (${res.status})`)
  }

  return await res.json()
}

export async function listMyProfileImages(token) {
  const res = await fetch(apiUrl('/api/users/me/profile-images'), {
    headers: { ...authHeaders(token) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Load profile images failed (${res.status})`)
  }
  const body = await res.json()
  return Array.isArray(body) ? body : []
}

export async function deleteMyProfileImage(imageId, token) {
  const res = await fetch(apiUrl(`/api/users/me/profile-images/${encodeURIComponent(imageId)}`), {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Delete image failed (${res.status})`)
  }
}

export async function deleteMyAccount(token) {
  const res = await fetch(apiUrl(`/api/users/me`), {
    method: 'DELETE',
    headers: { ...authHeaders(token) },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Delete account failed (${res.status})`)
  }
}

