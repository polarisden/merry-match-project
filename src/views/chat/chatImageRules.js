/** Align with Supabase bucket: chat-images (10 MB, jpeg/png/webp). */
export const CHAT_IMAGE_MAX_BYTES = 10 * 1024 * 1024

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"])

/**
 * @param {File} file
 * @throws {Error}
 */
export function assertChatImageFile(file) {
  if (!file || typeof file.size !== "number") {
    throw new Error("No image selected")
  }
  if (file.size > CHAT_IMAGE_MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller")
  }
  const mime = typeof file.type === "string" ? file.type.trim().toLowerCase() : ""
  if (mime && !ALLOWED_MIME.has(mime)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed")
  }
  if (!mime) {
    const n = typeof file.name === "string" ? file.name.toLowerCase() : ""
    if (!/\.(jpe?g|png|webp)$/i.test(n)) {
      throw new Error("Only JPEG, PNG, or WebP images are allowed")
    }
  }
}
