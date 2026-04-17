import { apiUrl } from "@/lib/apiBase"

function authHeaders(token) {
  const t = String(token || "").trim()
  if (!t) return {}
  return { Authorization: t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}` }
}

function toFiniteNumber(value, fallback) {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function deepFindNumberByKeys(input, keyNames) {
  const target = new Set(keyNames.map((k) => String(k).toLowerCase()))
  const queue = [input]
  const visited = new Set()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== "object") continue
    if (visited.has(current)) continue
    visited.add(current)

    if (Array.isArray(current)) {
      for (const item of current) queue.push(item)
      continue
    }

    const entries = Object.entries(current)
    for (const [key, value] of entries) {
      const keyLower = key.toLowerCase()
      if (target.has(keyLower)) {
        const parsed = toFiniteNumber(value, NaN)
        if (Number.isFinite(parsed)) return parsed
      }
      if (value && typeof value === "object") queue.push(value)
    }
  }
  return NaN
}

function extractPlanSwipeLimit(body) {
  const direct = [
    body?.swipe_limit,
    body?.swipeLimit,
    body?.plan?.swipe_limit,
    body?.plan?.swipeLimit,
    body?.subscription?.plan?.swipe_limit,
    body?.subscription?.plan?.swipeLimit,
    body?.subscriptions?.plan?.swipe_limit,
    body?.subscriptions?.plan?.swipeLimit,
    body?.data?.plan?.swipe_limit,
    body?.data?.plan?.swipeLimit,
    body?.data?.subscription?.plan?.swipe_limit,
    body?.data?.subscriptions?.plan?.swipe_limit,
  ]

  for (const value of direct) {
    const parsed = toFiniteNumber(value, NaN)
    if (Number.isFinite(parsed)) return parsed
  }

  const deep = deepFindNumberByKeys(body, ["swipe_limit", "swipelimit", "merry_limit", "merrylimit"])
  return Number.isFinite(deep) ? deep : null
}

async function fetchPlanLimitFromBackend(token) {
  const endpoints = [
    "/api/plans/current",
    "/api/subscriptions/current/plan",
    "/api/users/me/subscription",
    "/api/users/me/plan",
    "/api/plans/me",
  ]

  for (const path of endpoints) {
    try {
      const res = await fetch(apiUrl(path), {
        method: "GET",
        headers: {
          ...authHeaders(token),
        },
      })

      if (res.status === 404) continue
      if (!res.ok) continue

      const contentType = res.headers.get("content-type") ?? ""
      const body = contentType.includes("application/json") ? await res.json() : null
      const parsed = extractPlanSwipeLimit(body)
      if (Number.isFinite(parsed)) return parsed
    } catch {
      // try next endpoint
    }
  }

  return null
}

function pickLimitUsed(body) {
  const candidates = [
    body?.subscriptions?.used,
    body?.subscriptions?.merry_count,
    body?.subscriptions?.merry_used,
    body?.subscription_info?.used,
    body?.subscription_info?.merry_count,
    body?.limitUsed,
    body?.limit_used,
    body?.merryLimitUsed,
    body?.merry_limit_used,
    body?.used,
    body?.merry_count,
    body?.subscription?.used,
    body?.subscription?.merry_count,
    body?.data?.subscriptions?.used,
    body?.data?.subscriptions?.merry_count,
    body?.data?.subscription?.used,
    body?.data?.subscription?.merry_count,
    body?.data?.limitUsed,
    body?.data?.limit_used,
    body?.meta?.subscriptions?.used,
    body?.meta?.subscriptions?.merry_count,
    body?.meta?.limitUsed,
    body?.meta?.limit_used,
    body?.subscriptions?.usage?.used,
    body?.subscriptions?.usage?.merry_count,
    body?.subscription?.usage?.used,
    body?.subscription?.usage?.merry_count,
    body?.data?.subscriptions?.usage?.used,
    body?.data?.subscription?.usage?.used,
  ]
  for (const value of candidates) {
    const parsed = toFiniteNumber(value, NaN)
    if (Number.isFinite(parsed)) return parsed
  }
  const deepParsed = deepFindNumberByKeys(body, [
    "used",
    "limitused",
    "limit_used",
    "merry_count",
    "merry_used",
  ])
  if (Number.isFinite(deepParsed)) return deepParsed
  return 0
}

function pickMerryToYou(body) {
  const candidates = [
    body?.merryToYou,
    body?.merry_to_you,
    body?.merryCount,
    body?.merry_count,
    body?.swipesCount,
    body?.swipes_count,
    body?.swipeCount,
    body?.swipe_count,
    body?.summary?.merry_to_you,
    body?.summary?.merry_count,
    body?.summary?.swipe_count,
    body?.meta?.merry_to_you,
    body?.meta?.merry_count,
    body?.data?.merryToYou,
    body?.data?.merry_to_you,
    body?.data?.merry_count,
    body?.data?.swipe_count,
  ]
  for (const value of candidates) {
    const parsed = toFiniteNumber(value, NaN)
    if (Number.isFinite(parsed)) return parsed
  }
  const deepParsed = deepFindNumberByKeys(body, [
    "merry_to_you",
    "merryyou",
    "merry_count",
    "swipe_count",
    "swipes_count",
  ])
  if (Number.isFinite(deepParsed)) return deepParsed
  return 0
}

function pickMerryMatch(body) {
  const candidates = [
    body?.merryMatch,
    body?.merry_match,
    body?.matchCount,
    body?.match_count,
    body?.matchesCount,
    body?.matches_count,
    body?.summary?.merry_match,
    body?.summary?.match_count,
    body?.summary?.matches_count,
    body?.meta?.merry_match,
    body?.meta?.match_count,
    body?.data?.merryMatch,
    body?.data?.merry_match,
    body?.data?.match_count,
    body?.data?.matches_count,
  ]
  for (const value of candidates) {
    const parsed = toFiniteNumber(value, NaN)
    if (Number.isFinite(parsed)) return parsed
  }
  const deepParsed = deepFindNumberByKeys(body, [
    "merry_match",
    "match_count",
    "matches_count",
    "merrymatch",
  ])
  if (Number.isFinite(deepParsed)) return deepParsed
  return 0
}

function extractMatchedIdSet(body) {
  const matchedIds = new Set()
  const pools = [
    body?.matches,
    body?.matchedProfiles,
    body?.matched_profiles,
    body?.data?.matches,
    body?.data?.matchedProfiles,
    body?.data?.matched_profiles,
    body?.summary?.matches,
  ]

  for (const pool of pools) {
    if (!Array.isArray(pool)) continue
    for (const row of pool) {
      if (row == null) continue
      if (typeof row === "string" || typeof row === "number") {
        matchedIds.add(String(row))
        continue
      }
      if (typeof row !== "object") continue
      const id =
        row.profile_id ??
        row.profileId ??
        row.matched_user_id ??
        row.matchedUserId ??
        row.target_profile_id ??
        row.targetProfileId ??
        row.id
      if (id != null) matchedIds.add(String(id))
    }
  }

  return matchedIds
}

function pickLimitMax(body) {
  const candidates = [
    body?.subscriptions?.plan?.swipe_limit,
    body?.subscriptions?.plan?.swipeLimit,
    body?.subscriptions?.plan?.merry_limit,
    body?.subscriptions?.plan?.merryLimit,
    body?.subscriptions?.plan?.daily_limit,
    body?.subscriptions?.plan?.dailyLimit,
    body?.subscription?.plan?.swipe_limit,
    body?.subscription?.plan?.swipeLimit,
    body?.subscription?.plan?.merry_limit,
    body?.subscription?.plan?.merryLimit,
    body?.subscription?.plan?.daily_limit,
    body?.subscription?.plan?.dailyLimit,
    body?.data?.subscriptions?.plan?.swipe_limit,
    body?.data?.subscriptions?.plan?.swipeLimit,
    body?.data?.subscriptions?.plan?.merry_limit,
    body?.data?.subscriptions?.plan?.merryLimit,
    body?.data?.subscription?.plan?.swipe_limit,
    body?.data?.subscription?.plan?.swipeLimit,
    body?.data?.subscription?.plan?.merry_limit,
    body?.data?.subscription?.plan?.merryLimit,
    body?.plan?.swipe_limit,
    body?.plan?.swipeLimit,
    body?.plan?.merry_limit,
    body?.plan?.merryLimit,
    body?.data?.plan?.swipe_limit,
    body?.data?.plan?.swipeLimit,
    body?.data?.plan?.merry_limit,
    body?.data?.plan?.merryLimit,
    body?.subscriptions?.swipe_limit,
    body?.subscriptions?.swipeLimit,
    body?.subscriptions?.merry_limit,
    body?.subscriptions?.daily_limit,
    body?.subscriptions?.max_limit,
    body?.subscription_info?.swipe_limit,
    body?.subscription_info?.swipeLimit,
    body?.subscription_info?.merry_limit,
    body?.subscription_info?.daily_limit,
    body?.swipe_limit,
    body?.swipeLimit,
    body?.limitMax,
    body?.limit_max,
    body?.merryLimitMax,
    body?.merry_limit_max,
    body?.max,
    body?.dailyLimit,
    body?.daily_limit,
    body?.subscription?.swipe_limit,
    body?.subscription?.swipeLimit,
    body?.subscription?.max,
    body?.subscription?.daily_limit,
    body?.subscription?.merry_limit,
    body?.data?.subscriptions?.swipe_limit,
    body?.data?.subscriptions?.swipeLimit,
    body?.data?.subscriptions?.merry_limit,
    body?.data?.subscriptions?.daily_limit,
    body?.data?.subscriptions?.max_limit,
    body?.data?.subscription?.swipe_limit,
    body?.data?.subscription?.swipeLimit,
    body?.data?.subscription?.merry_limit,
    body?.data?.subscription?.daily_limit,
    body?.data?.swipe_limit,
    body?.data?.swipeLimit,
    body?.data?.limitMax,
    body?.data?.limit_max,
    body?.meta?.subscriptions?.swipe_limit,
    body?.meta?.subscriptions?.swipeLimit,
    body?.meta?.subscriptions?.merry_limit,
    body?.meta?.subscriptions?.daily_limit,
    body?.meta?.limitMax,
    body?.meta?.limit_max,
  ]
  for (const value of candidates) {
    const parsed = toFiniteNumber(value, NaN)
    if (Number.isFinite(parsed)) return parsed
  }
  const deepParsed = deepFindNumberByKeys(body, [
    "swipe_limit",
    "swipelimit",
    "merry_limit",
    "merrylimit",
    "daily_limit",
    "dailylimit",
    "limit_max",
    "limitmax",
    "max_limit",
  ])
  if (Number.isFinite(deepParsed)) return deepParsed
  return null
}

function normalizeProfileRow(row, index, matchedIds = null) {
  if (!row || typeof row !== "object") {
    return {
      id: `profile-${index}`,
      img: "",
      name: "Unknown",
      age: 0,
      location: "Unknown location",
      matched: false,
      sexualIdentity: "Indefinite",
      sexualPreference: "Indefinite",
      racialPreference: "Indefinite",
      meetingInterest: "Indefinite",
    }
  }

  const r = /** @type {Record<string, unknown>} */ (row)
  const id = r.id != null ? String(r.id) : `profile-${index}`
  const img = r.img ?? r.avatar_url ?? r.image_url ?? r.imageUrl ?? ""
  const matchStatusRaw = r.matchStatus ?? r.match_status
  const matchStatus = typeof matchStatusRaw === "string" ? matchStatusRaw.trim().toLowerCase() : ""
  const ageRaw = r.age ?? r.user_age
  const age = typeof ageRaw === "number" ? ageRaw : Number(ageRaw)
  const isMatchedStatus = matchStatus === "active" || matchStatus === "matched"

  return {
    id,
    img: typeof img === "string" ? img : "",
    name: String(r.name ?? r.display_name ?? r.username ?? "Unknown"),
    age: Number.isFinite(age) ? age : 0,
    location: String(r.location ?? r.city ?? r.address ?? "Unknown location"),
    matchStatus,
    merryToday: Boolean(r.merryToday ?? r.merry_today),
    matched:
      matchStatus
        ? isMatchedStatus
        : matchedIds && matchedIds.size > 0
        ? matchedIds.has(id)
        : Boolean(r.matched ?? r.isMatched ?? r.is_match),
    sexualIdentity: String(r.sexualIdentity ?? r.sexual_identity ?? r.gender_identity ?? "Indefinite"),
    sexualPreference: String(r.sexualPreference ?? r.sexual_preference ?? r.preference ?? "Indefinite"),
    racialPreference: String(r.racialPreference ?? r.racial_preference ?? "Indefinite"),
    meetingInterest: String(r.meetingInterest ?? r.meeting_interest ?? "Indefinite"),
  }
}

export async function fetchMerryListRequest(token) {
  try {
    const res = await fetch(apiUrl("/api/merry-list?page=1&limit=20"), {
      method: "GET",
      headers: {
        ...authHeaders(token),
      },
    })

    const contentType = res.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json") ? await res.json() : await res.text()

    if (!res.ok) {
      return {
        ok: false,
        items: [],
        merryToYou: 0,
        merryMatch: 0,
        limitUsed: 0,
        limitMax: null,
        error:
          typeof body === "string"
            ? body
            : body?.message ?? body?.error ?? `Load merry list failed (${res.status})`,
      }
    }

    const rawList = Array.isArray(body)
      ? body
      : Array.isArray(body?.items)
        ? body.items
        : Array.isArray(body?.profiles)
          ? body.profiles
          : Array.isArray(body?.data)
            ? body.data
            : []
    const matchedIds = extractMatchedIdSet(body)

    const limitFromMerryList = pickLimitMax(body)
    const limitFromPlanApi = await fetchPlanLimitFromBackend(token)

    return {
      ok: true,
      items: rawList.map((row, index) => normalizeProfileRow(row, index, matchedIds)),
      merryToYou: pickMerryToYou(body),
      merryMatch: pickMerryMatch(body),
      limitUsed: pickLimitUsed(body),
      limitMax: limitFromPlanApi ?? limitFromMerryList,
      error: "",
    }
  } catch (error) {
    return {
      ok: false,
      items: [],
      merryToYou: 0,
      merryMatch: 0,
      limitUsed: 0,
      limitMax: null,
      error: error instanceof Error ? error.message : "Network error while loading merry list",
    }
  }
}

export async function removeMerryProfileRequest(token, profileId) {
  const id = String(profileId || "").trim()
  if (!id) {
    return { ok: false, error: "Missing profile id" }
  }

  try {
    const res = await fetch(apiUrl(`/api/merry-list/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: {
        ...authHeaders(token),
      },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return {
        ok: false,
        error: text || `Remove merry profile failed (${res.status})`,
      }
    }

    return { ok: true, error: "" }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error while removing merry profile",
    }
  }
}
