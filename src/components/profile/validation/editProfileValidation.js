export function validateEditProfile({
  token,
  formValues,
  bio,
  selectedInterestTags,
  uploadedImagesCount,
}) {
  if (!token) return "Please login"

  const requiredChecks = [
    { key: "Name", ok: Boolean(formValues.name && String(formValues.name).trim()) },
    { key: "Date of birth", ok: Boolean(formValues.dateOfBirth) },
    { key: "Location", ok: Boolean(formValues.location) },
    { key: "City", ok: Boolean(formValues.city) },
    { key: "Username", ok: Boolean(formValues.username && String(formValues.username).trim()) },
    { key: "Email", ok: Boolean(formValues.email && String(formValues.email).trim()) },
    { key: "Sexual identities", ok: Boolean(formValues.sexualIdentity && String(formValues.sexualIdentity).trim()) },
    { key: "Sexual preferences", ok: Boolean(formValues.sexualPreference && String(formValues.sexualPreference).trim()) },
    { key: "Racial preferences", ok: Boolean(formValues.racialPreference && String(formValues.racialPreference).trim()) },
    { key: "Meeting interests", ok: Boolean(formValues.meetingInterest && String(formValues.meetingInterest).trim()) },
    { key: "Hobbies / Interests", ok: Array.isArray(selectedInterestTags) ? selectedInterestTags.length > 0 : false },
    { key: "About me", ok: Boolean(bio && String(bio).trim()) },
  ]

  const missing = requiredChecks.find((x) => !x.ok)
  if (missing) return `Please fill ${missing.key}`

  if (String(formValues.username || "").trim().length < 6) {
    return "Username must be at least 6 characters"
  }

  if (String(bio || "").length > 150) {
    return "About me must be 150 characters or less"
  }

  if ((uploadedImagesCount ?? 0) < 2) {
    return "Please upload at least 2 profile pictures"
  }

  return ""
}

