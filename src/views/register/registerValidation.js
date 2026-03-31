export function strField(value) {
  if (value === undefined || value === null) return ""
  return typeof value === "string" ? value.trim() : String(value).trim()
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateStepBeforeNext(stepNumber, stepFields, formValues) {
  const fieldsForStep = stepFields[stepNumber] ?? []

  for (const field of fieldsForStep) {
    const rawValue = formValues[field.modelKey]
    const value = typeof rawValue === "string" ? rawValue.trim() : rawValue
    if (!value) {
      return { valid: false, message: `Please enter ${field.label.toLowerCase()}.` }
    }
  }

  if (stepNumber === 1 && formValues.password !== formValues.confirmPassword) {
    return { valid: false, message: "Passwords do not match." }
  }

  if (stepNumber === 1 && strField(formValues.password).length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." }
  }

  if (stepNumber === 1 && !isValidEmail(strField(formValues.email))) {
    return { valid: false, message: "Please enter a valid email address." }
  }

  return { valid: true, message: "" }
}

export function validateSubmitBeforeRegister(formValues, selectedPhotos) {
  if (!strField(formValues.name)) return { valid: false, message: "Please enter your name." }
  if (!strField(formValues.dateOfBirth)) return { valid: false, message: "Please select your date of birth." }
  if (!strField(formValues.username)) return { valid: false, message: "Please enter your username." }
  if (!strField(formValues.email)) return { valid: false, message: "Please enter your email." }
  if (!isValidEmail(strField(formValues.email))) {
    return { valid: false, message: "Please enter a valid email address." }
  }
  if (!strField(formValues.password)) return { valid: false, message: "Please enter your password." }
  if (strField(formValues.password).length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." }
  }
  if (formValues.password !== formValues.confirmPassword) {
    return { valid: false, message: "Passwords do not match." }
  }
  if (!strField(formValues.sexualIdentity)) {
    return { valid: false, message: "Please select your sexual identity." }
  }
  if (!strField(formValues.sexualPreference)) {
    return { valid: false, message: "Please select your sexual preference." }
  }
  if (!strField(formValues.racialPreference)) {
    return { valid: false, message: "Please select your racial preference." }
  }
  if (!strField(formValues.meetingInterest)) {
    return { valid: false, message: "Please select your meeting interest." }
  }
  if (selectedPhotos.length < 2) return { valid: false, message: "Please upload at least 2 photos." }

  return { valid: true, message: "" }
}

export async function validateStep1UniqueFields(formValues, checkDuplicateField) {
  const username = strField(formValues.username)
  const email = strField(formValues.email).toLowerCase()

  const usernameCheck = await checkDuplicateField("username", username)
  if (!usernameCheck.available) {
    return { valid: false, message: usernameCheck.message || "Username is already in use." }
  }

  const emailCheck = await checkDuplicateField("email", email)
  if (!emailCheck.available) {
    return { valid: false, message: emailCheck.message || "Email is already in use." }
  }

  return { valid: true, message: "" }
}
