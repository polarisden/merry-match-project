import { computed, ref } from "vue"

export function useRegisterPhotos(totalPhotoSlots = 5) {
  const selectedPhotos = ref([])
  const photoInputRef = ref(null)
  const photoObjectUrlsToRevoke = ref([])

  const photoSlots = computed(() =>
    Array.from({ length: totalPhotoSlots }, (_, index) => {
      const photo = selectedPhotos.value[index]
      return {
        key: photo ? photo.file.name : `slot-${index + 1}`,
        label: photo ? "Change photo" : "Upload photo",
        previewUrl: photo?.previewUrl ?? "",
      }
    }),
  )

  function triggerPhotoPicker() {
    photoInputRef.value?.click()
  }

  function handleSelectedPhotos(event) {
    const input = event.target
    if (!input?.files?.length) return

    const files = Array.from(input.files)
    const remainingSlots = totalPhotoSlots - selectedPhotos.value.length
    const toAdd = files.slice(0, Math.max(0, remainingSlots))

    for (const file of toAdd) {
      const previewUrl = URL.createObjectURL(file)
      photoObjectUrlsToRevoke.value.push(previewUrl)
      selectedPhotos.value.push({ file, previewUrl })
    }

    input.value = ""
  }

  function removePhotoAt(slotIndex) {
    const removed = selectedPhotos.value[slotIndex]
    if (!removed) return

    // Revoke the object URL immediately to avoid memory leaks.
    if (removed.previewUrl) {
      try {
        URL.revokeObjectURL(removed.previewUrl)
      } catch {
        // ignore
      }
      photoObjectUrlsToRevoke.value = photoObjectUrlsToRevoke.value.filter(
        (url) => url !== removed.previewUrl,
      )
    }

    selectedPhotos.value.splice(slotIndex, 1)
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error("Failed to read photo file"))
      reader.readAsDataURL(file)
    })
  }

  function cleanupPhotoUrls() {
    for (const url of photoObjectUrlsToRevoke.value) {
      URL.revokeObjectURL(url)
    }
  }

  return {
    selectedPhotos,
    photoInputRef,
    photoSlots,
    triggerPhotoPicker,
    handleSelectedPhotos,
    removePhotoAt,
    readFileAsDataURL,
    cleanupPhotoUrls,
  }
}
