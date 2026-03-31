import { strField } from "./registerValidation"

export function extractAuthToken(body) {
  if (!body || typeof body !== "object") return ""
  const token =
    body.token ??
    body.accessToken ??
    body.access_token ??
    body.data?.token ??
    body.data?.accessToken ??
    body.data?.access_token
  return typeof token === "string" ? token : ""
}

export function buildRegisterPayload(formValues, locationName, cityName, photos) {
  const name = strField(formValues.name)
  const dateOfBirth = strField(formValues.dateOfBirth)
  const locationCode = strField(formValues.location)
  const cityCode = strField(formValues.city)
  const username = strField(formValues.username)
  const email = strField(formValues.email).toLowerCase()
  const password = strField(formValues.password)
  const confirmPassword = strField(formValues.confirmPassword)
  const sexualIdentity = strField(formValues.sexualIdentity)
  const sexualPreference = strField(formValues.sexualPreference)
  const racialPreference = strField(formValues.racialPreference)
  const meetingInterest = strField(formValues.meetingInterest)

  return {
    name,
    dateOfBirth,
    location: locationName,
    city: cityName,
    username,
    email,
    password,
    confirmPassword,
    sexualIdentity,
    sexualPreference,
    racialPreference,
    meetingInterest,
    photos,
    date_of_birth: dateOfBirth,
    confirm_password: confirmPassword,
    sexual_identity: sexualIdentity,
    sexual_preference: sexualPreference,
    racial_preference: racialPreference,
    meeting_interest: meetingInterest,
    gendar: sexualIdentity,
    location_country: locationName,
    location_city: cityName,
    location_code: locationCode,
    city_code: cityCode,
  }
}

export async function submitRegisterRequest(payload) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const contentType = res.headers.get("content-type") ?? ""
  const body = contentType.includes("application/json") ? await res.json() : await res.text()
  if (!res.ok) {
    return {
      ok: false,
      body: null,
      error:
        typeof body === "string"
          ? body
          : body?.message ?? body?.error ?? `Register failed with status ${res.status}`,
    }
  }
  return { ok: true, body, error: "" }
}
