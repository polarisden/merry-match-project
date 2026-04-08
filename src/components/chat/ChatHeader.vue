<script setup>
import { useRouter } from 'vue-router'
import BackIcon from '@/assets/icons/back.svg'

defineProps({
  contactName: {
    type: String,
    default: 'Daeny',
  },
})

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <header class="shrink-0 border-b border-gray-200 bg-white lg:hidden">
    <div class="flex items-center gap-[15px] px-4 py-3 h-[48px]">
      <button
        type="button"
        class="flex size-6 items-center justify-center text-gray-800"
        aria-label="back"
        @click="goBack"
      >
        <BackIcon class="text-[#727B9B] size-4"/>
      </button>
      <span class="body2-w-500 text-gray-900">{{ contactName }}</span>
    </div>
  </header>
</template>
