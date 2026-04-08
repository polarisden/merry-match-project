<script setup>
import { ref } from 'vue'
import ImageIcon from '@/assets/icons/image.svg'
import SendIcon from '@/assets/icons/send.svg'
import ImageMessage from './ImageMessage.vue'

const model = defineModel({ type: String, default: '' })

const emit = defineEmits(['send', 'attach'])

const fileRef = ref(null)

function onSend() {
  const t = model.value.trim()
  if (!t) return
  emit('send', t)
  model.value = ''
}

function onAttachClick() {
  fileRef.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) {
    emit('attach', file)
  }
  e.target.value = ''
}
</script>

<template>
  <div class="w-full shrink-0 border-t border-gray-800 bg-bg py-3">
    <div class="flex items-center gap-1 px-3 lg:px-12">
      <input
        ref="fileRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      >
      <button
        type="button"
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-white hover:cursor-pointer"
        aria-label="attach image"
        @click="onAttachClick"
      >
        <ImageIcon class="size-5"/>
      </button>
      <label class="sr-only" for="chat-message-input">ข้อความ</label>
      <input
        id="chat-message-input"
        v-model="model"
        type="text"
        autocomplete="off"
        placeholder="Messege here..."
        class="min-h-11 min-w-0 flex-1 rounded-full px-4 py-2.5 body2 text-white placeholder:text-gray-500 focus:outline-none"
        @keydown.enter.prevent="onSend"
      >
      <button
        type="button"
        class="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-500 hover:cursor-pointer"
        aria-label="send message"
        @click="onSend"
      >
        <SendIcon class="size-6 text-white"/>
      </button>
    </div>
  </div>
</template>
