<script setup>
import { onUnmounted, ref, watch } from "vue";
import ImageIcon from "@/assets/icons/image.svg";
import SendIcon from "@/assets/icons/send.svg";
import { assertChatImageFile } from "@/views/chat/chatImageRules";

const model = defineModel({ type: String, default: "" });

const emit = defineEmits(["send", "send-image", "image-error"]);

const fileRef = ref(null);
const pendingFile = ref(/** @type {File | null} */ (null));
const previewUrl = ref(/** @type {string | null} */ (null));

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  sending: {
    type: Boolean,
    default: false,
  },
  uploading: {
    type: Boolean,
    default: false,
  },
});

const busy = () => props.disabled || props.sending || props.uploading;

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
}

watch(pendingFile, (f) => {
  if (!f) revokePreview();
});

onUnmounted(() => {
  revokePreview();
});

function canSend() {
  if (busy()) return false;
  if (pendingFile.value) return true;
  return model.value.trim().length > 0;
}

function onSend() {
  if (!canSend()) return;
  if (pendingFile.value) {
    const file = pendingFile.value;
    const caption = model.value.trim();
    pendingFile.value = null;
    model.value = "";
    revokePreview();
    emit("send-image", { file, caption });
    return;
  }
  const t = model.value.trim();
  emit("send", t);
  model.value = "";
}

function onAttachClick() {
  if (busy()) return;
  fileRef.value?.click();
}

function onFileChange(e) {
  if (busy()) return;
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  try {
    assertChatImageFile(file);
  } catch (err) {
    emit("image-error", err instanceof Error ? err.message : "Invalid image");
    return;
  }
  revokePreview();
  pendingFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

function removePendingImage() {
  pendingFile.value = null;
  revokePreview();
}
</script>

<template>
  <div class="w-full shrink-0 border-t border-gray-800 bg-bg py-3">
    <div
      v-if="previewUrl && pendingFile"
      class="mx-3 mb-2 flex items-center gap-3 rounded-xl border border-gray-600 bg-gray-900/80 px-3 py-2 lg:mx-12"
    >
      <img
        :src="previewUrl"
        :alt="pendingFile.name ? `Preview of ${pendingFile.name}` : 'Image preview'"
        class="size-14 shrink-0 rounded-lg object-cover"
      >
      <div class="min-w-0 flex-1">
        <p class="body2 truncate text-gray-200">
          {{ pendingFile.name || "Image" }}
        </p>
        <p class="body5 text-gray-400">
          Tap Send to upload and share in chat.
        </p>
      </div>
      <button
        type="button"
        class="body2 shrink-0 rounded-lg px-2 py-1 text-gray-300 hover:bg-gray-700"
        aria-label="Remove selected image"
        @click="removePendingImage"
      >
        Cancel
      </button>
    </div>
    <div class="flex items-center gap-1 px-3 lg:px-12">
      <input
        ref="fileRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        class="hidden"
        @change="onFileChange"
      >
      <button
        type="button"
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-white hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="attach image"
        :disabled="busy()"
        @click="onAttachClick"
      >
        <ImageIcon class="size-5" />
      </button>
      <label class="sr-only" for="chat-message-input">ข้อความ</label>
      <input
        id="chat-message-input"
        v-model="model"
        type="text"
        autocomplete="off"
        placeholder="Messege here..."
        class="min-h-11 min-w-0 flex-1 rounded-full px-4 py-2.5 body2 text-white placeholder:text-gray-500 focus:outline-none disabled:opacity-50"
        :disabled="busy()"
        @keydown.enter.prevent="onSend"
      >
      <button
        type="button"
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="send message"
        :disabled="!canSend()"
        @click="onSend"
      >
        <SendIcon class="size-6 text-white" />
      </button>
    </div>
  </div>
</template>
