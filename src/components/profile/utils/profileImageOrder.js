/**
 * Same ordering as Edit Profile photo slots: primary first, then oldest created first.
 * @param {Array<{ isPrimary?: boolean, createdAt?: string, imageUrl?: string }>} images
 * @returns {Array<{ isPrimary?: boolean, createdAt?: string, imageUrl?: string, id?: string }>}
 */
export function sortProfileImagesForDisplay(images) {
  if (!Array.isArray(images) || images.length === 0) return []
  return [...images].sort((a, b) => {
    if (a?.isPrimary && !b?.isPrimary) return -1
    if (!a?.isPrimary && b?.isPrimary) return 1
    const at = a?.createdAt ? Date.parse(a.createdAt) : 0
    const bt = b?.createdAt ? Date.parse(b.createdAt) : 0
    return at - bt
  })
}
