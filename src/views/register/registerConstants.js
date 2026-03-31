export const steps = [
  { title: "Basic Information" },
  { title: "Identities and Interests" },
  { title: "Profile pictures" },
]

export const stepFields = {
  1: [
    { label: "Name", modelKey: "name", type: "text", placeholder: "Jon Snow" },
    { label: "Date of birth", modelKey: "dateOfBirth", type: "date", placeholder: "01/01/2008" },
    { label: "Location", modelKey: "location", type: "select", placeholder: "Thailand" },
    { label: "City", modelKey: "city", type: "select", placeholder: "Select city" },
    { label: "Username", modelKey: "username", type: "text", placeholder: "At least 6 character" },
    { label: "Email", modelKey: "email", type: "email", placeholder: "name@website.com" },
    { label: "Password", modelKey: "password", type: "password", placeholder: "At least 8 character" },
    { label: "Confirm password", modelKey: "confirmPassword", type: "password", placeholder: "At least 8 character" },
  ],
  2: [
    { label: "Sexual identities", modelKey: "sexualIdentity", type: "select", placeholder: "Male" },
    { label: "Sexual preferences", modelKey: "sexualPreference", type: "select", placeholder: "Female" },
    { label: "Racial preferences", modelKey: "racialPreference", type: "select", placeholder: "Asian" },
    { label: "Meeting interests", modelKey: "meetingInterest", type: "select", placeholder: "Friends" },
  ],
}

export const sexualIdentityOptions = ["Male", "Female", "LGBTQIAN+"]
export const sexualPreferenceOptions = ["Male", "Female", "LGBTQIAN+"]
export const racialPreferenceOptions = [
  "Africa",
  "Antarctica",
  "Australia/Oceania",
  "Asia",
  "Europe",
  "North America",
  "South America",
]
export const meetingInterestOptions = [
  "Activity partner",
  "Casual dating",
  "Chatting",
  "Creative collaboration",
  "Dating",
  "Food buddy",
  "Gaming buddy",
  "Long-term relationship",
  "Networking",
  "New friends",
  "Party / Nightlife",
  "Study partner",
  "Travel buddy",
  "Workout partner",
]

export const totalPhotoSlots = 5
