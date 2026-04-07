import { apiUrl } from "@/lib/apiBase"

function parseDuplicateCheckResult(body, field) {
  if (typeof body === "boolean") {
    return { available: body, message: body ? "" : "This value is already in use." }
  }

  if (!body || typeof body !== "object") {
    return { available: true, message: "" }
  }

  if (typeof body.available === "boolean") {
    return { available: body.available, message: body.message ?? "" }
  }
  if (typeof body.exists === "boolean") {
    return { available: !body.exists, message: body.message ?? "" }
  }
  if (typeof body.isDuplicate === "boolean") {
    return { available: !body.isDuplicate, message: body.message ?? "" }
  }
  if (typeof body.duplicate === "boolean") {
    return { available: !body.duplicate, message: body.message ?? "" }
  }
  if (field === "username" && typeof body.usernameAvailable === "boolean") {
    return { available: body.usernameAvailable, message: body.message ?? "" }
  }
  if (field === "email" && typeof body.emailAvailable === "boolean") {
    return { available: body.emailAvailable, message: body.message ?? "" }
  }

  return { available: true, message: "" }
}

function isDuplicateMessage(message) {
  if (!message) return false
  const normalized = String(message).toLowerCase()
  return (
    normalized.includes("already") ||
    normalized.includes("duplicate") ||
    normalized.includes("exists") ||
    normalized.includes("taken") ||
    normalized.includes("in use")
  )
}

export async function checkDuplicateField(field, value) {
  // Backend supports only: GET /api/auth/check-availability?email=... or ?username=...
  const query =
    field === "email"
      ? `email=${encodeURIComponent(value)}`
      : `username=${encodeURIComponent(value)}`
  const requests = [{ url: apiUrl(`/api/auth/check-availability?${query}`), method: "GET" }]

  let sawReachableEndpoint = false

  for (const request of requests) {
    try {
      const res = await fetch(request.url, {
        method: request.method,
        headers: request.method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: request.body,
      })

      if (res.status === 404) continue
      sawReachableEndpoint = true

      if (res.status === 409) {
        const contentType = res.headers.get("content-type") ?? ""
        const body = contentType.includes("application/json") ? await res.json() : await res.text()
        const message = typeof body === "string" ? body : body?.message ?? body?.error ?? ""
        return {
          available: !isDuplicateMessage(message),
          message: message || (field === "email" ? "Email is already in use." : "Username is already in use."),
        }
      }

      const contentType = res.headers.get("content-type") ?? ""
      const body = contentType.includes("application/json") ? await res.json() : await res.text()

      if (!res.ok) {
        return {
          available: false,
          message:
            typeof body === "string"
              ? body
              : body?.message ??
                body?.error ??
                (field === "email" ? "Unable to verify email right now." : "Unable to verify username right now."),
        }
      }

      return parseDuplicateCheckResult(body, field)
    } catch {
      // try next endpoint
    }
  }

  if (!sawReachableEndpoint) {
    return {
      available: false,
      message:
        field === "email"
          ? "Cannot verify email uniqueness right now."
          : "Cannot verify username uniqueness right now.",
    }
  }

  return {
    available: false,
    message:
      field === "email"
        ? "Unable to verify email. Please try again."
        : "Unable to verify username. Please try again.",
  }
}

export async function fetchInterestsOptions() {
  const res = await fetch(apiUrl("/api/interests"))
  if (!res.ok) return { interestOptions: [], interestTags: [] }

  const contentType = res.headers.get("content-type") ?? ""
  const body = contentType.includes("application/json") ? await res.json() : []
  const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : []

  const interestOptions = list
    .map((item) => {
      if (typeof item === "string") return { id: "", name: item }
      return { id: String(item?.id ?? ""), name: String(item?.name ?? "") }
    })
    .filter((item) => item.name.trim().length > 0)

  return {
    interestOptions,
    interestTags: interestOptions.map((item) => item.name),
  }
}

export async function submitMyInterestsRequest(token, selectedInterestTags, interestOptions) {
  if (!token || selectedInterestTags.length === 0) return { ok: true, error: "" }

  const selectedInterestIds = interestOptions
    .filter((item) => selectedInterestTags.includes(item.name) && item.id)
    .map((item) => item.id)

  const payloadCandidates = [
    { interestIds: selectedInterestIds },
    { interest_ids: selectedInterestIds },
    { interests: selectedInterestIds },
    { interests: selectedInterestIds.map((id) => ({ id })) },
    { interests: selectedInterestTags },
    { interest_names: selectedInterestTags },
    selectedInterestIds,
    selectedInterestTags,
  ].filter((payload) => {
    if (Array.isArray(payload)) return payload.length > 0
    if (payload?.interestIds) return payload.interestIds.length > 0
    return true
  })

  let lastError = ""
  for (const payload of payloadCandidates) {
    const res = await fetch(apiUrl("/api/users/me/interests"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (res.ok) return { ok: true, error: "" }

    const contentType = res.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json") ? await res.json() : await res.text()
    lastError =
      typeof body === "string"
        ? body
        : body?.message ?? body?.error ?? `Save interests failed with status ${res.status}`
  }

  return { ok: false, error: lastError || "Save interests failed." }
}
