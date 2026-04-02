import { computed, ref } from "vue"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function createDefaultSlots() {
  return [
    { key: "photo-1", label: "Upload photo", image: null, imageId: null, localUrl: null },
    { key: "photo-2", label: "Upload photo", image: null, imageId: null, localUrl: null },
    { key: "slot-3", label: "Upload photo", image: null, imageId: null, localUrl: null },
    { key: "slot-4", label: "Upload photo", image: null, imageId: null, localUrl: null },
    { key: "slot-5", label: "Upload photo", image: null, imageId: null, localUrl: null },
  ]
}

function safeRevokeObjectUrl(url) {
  if (!url) return
  try {
    URL.revokeObjectURL(url)
  } catch {
    // ignore
  }
}

export function useEditProfileImages({
  tokenRef,
  setFormError,
  clearNotices,
  setLoading,
  uploadMyProfileImage,
  deleteMyProfileImage,
}) {
  const photoSlots = ref(createDefaultSlots())
  const imageInputRef = ref(null)
  const pendingSlotKey = ref(null)

  const uploadedImagesCount = computed(() => photoSlots.value.filter((s) => Boolean(s.imageId)).length)

  function triggerImagePicker(slotKey) {
    pendingSlotKey.value = slotKey
    imageInputRef.value?.click()
  }

  function handleImageLoadError(slotKey) {
    const slot = photoSlots.value.find((s) => s.key === slotKey)
    if (!slot) return
    slot.image = null
    slot.imageId = null
    safeRevokeObjectUrl(slot.localUrl)
    slot.localUrl = null
    setFormError("Image URL is not reachable (Supabase)")
  }

  async function handleSelectedImage(e) {
    const file = e.target.files?.[0]
    const slotKey = pendingSlotKey.value
    e.target.value = ""
    if (!file || !slotKey) return

    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("Image must be 5MB or smaller")
      return
    }

    if (!tokenRef.value) {
      setFormError("Please login before uploading photos")
      return
    }

    try {
      setLoading(true)
      clearNotices()

      const isPrimary = slotKey === "photo-1"
      const slot = photoSlots.value.find((s) => s.key === slotKey)
      if (slot) {
        safeRevokeObjectUrl(slot.localUrl)
        slot.localUrl = URL.createObjectURL(file)
        slot.image = slot.localUrl
      }

      const res = await uploadMyProfileImage(file, { token: tokenRef.value, isPrimary })
      if (slot) {
        slot.image = res?.imageUrl ?? slot.image
        slot.imageId = res?.id ?? slot.imageId
        if (slot.localUrl && slot.image !== slot.localUrl) {
          safeRevokeObjectUrl(slot.localUrl)
          slot.localUrl = null
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  async function deleteImageForSlot(slotKey) {
    const slot = photoSlots.value.find((s) => s.key === slotKey)
    if (!slot?.imageId || !tokenRef.value) return
    try {
      setLoading(true)
      clearNotices()
      await deleteMyProfileImage(slot.imageId, tokenRef.value)
      slot.image = null
      slot.imageId = null
      safeRevokeObjectUrl(slot.localUrl)
      slot.localUrl = null
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Delete image failed")
    } finally {
      setLoading(false)
    }
  }

  function setSlotsFromApiImages(images) {
    if (!Array.isArray(images) || images.length === 0) return

    const sorted = [...images].sort((a, b) => {
      if (a?.isPrimary && !b?.isPrimary) return -1
      if (!a?.isPrimary && b?.isPrimary) return 1

      const at = a?.createdAt ? Date.parse(a.createdAt) : 0
      const bt = b?.createdAt ? Date.parse(b.createdAt) : 0
      return at - bt
    })

    const items = sorted
      .map((x) => ({ id: x?.id, url: x?.imageUrl }))
      .filter((x) => Boolean(x.url))

    for (let i = 0; i < photoSlots.value.length; i += 1) {
      photoSlots.value[i].image = items[i]?.url ?? null
      photoSlots.value[i].imageId = items[i]?.id ?? null
      safeRevokeObjectUrl(photoSlots.value[i].localUrl)
      photoSlots.value[i].localUrl = null
    }
  }

  function cleanupObjectUrls() {
    for (const slot of photoSlots.value) {
      safeRevokeObjectUrl(slot.localUrl)
      slot.localUrl = null
    }
  }

  return {
    photoSlots,
    imageInputRef,
    uploadedImagesCount,
    triggerImagePicker,
    handleSelectedImage,
    deleteImageForSlot,
    handleImageLoadError,
    setSlotsFromApiImages,
    cleanupObjectUrls,
  }
}

