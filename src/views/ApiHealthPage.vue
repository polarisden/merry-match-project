<script setup>
import { ref } from 'vue'
import { apiUrl } from '@/lib/apiBase'

const status = ref('idle') // 'idle' | 'loading' | 'success' | 'error'
const responseData = ref(null)
const errorMessage = ref('')
const backendUrl = apiUrl('/api/tests')

async function testConnection() {
  status.value = 'loading'
  responseData.value = null
  errorMessage.value = ''

  try {
    const res = await fetch(backendUrl)
    const data = await res.json()
    responseData.value = { status: res.status, body: data }
    status.value = 'success'
  } catch (err) {
    errorMessage.value = err.message
    status.value = 'error'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div class="bg-white rounded-2xl shadow-md w-full max-w-lg p-8 flex flex-col gap-6">

      <div>
        <h1 class="text-2xl font-bold text-gray-800">API Connection Test</h1>
        <p class="text-sm text-gray-500 mt-1">ทดสอบการเชื่อมต่อ Frontend → Backend</p>
      </div>

      <!-- Endpoint Info -->
      <div class="bg-gray-100 rounded-lg px-4 py-3 text-sm">
        <span class="font-semibold text-gray-600">Endpoint: </span>
        <span class="font-mono text-blue-600 break-all">GET {{ backendUrl }}</span>
      </div>

      <!-- Test Button -->
      <button
        @click="testConnection"
        :disabled="status === 'loading'"
        class="w-full py-3 rounded-xl font-semibold text-white transition-colors"
        :class="status === 'loading'
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-red-400 hover:bg-red-500 active:bg-red-600'"
      >
        {{ status === 'loading' ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ' }}
      </button>

      <!-- Result -->
      <div v-if="status !== 'idle'">

        <!-- Success -->
        <div v-if="status === 'success'" class="border border-green-200 bg-green-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-green-600 text-xl">&#10003;</span>
            <span class="font-semibold text-green-700">เชื่อมต่อสำเร็จ</span>
            <span class="ml-auto text-xs font-mono bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              HTTP {{ responseData.status }}
            </span>
          </div>
          <pre class="text-xs bg-white border border-green-100 rounded-lg p-3 overflow-auto max-h-48 text-gray-700">{{ JSON.stringify(responseData.body, null, 2) }}</pre>
        </div>

        <!-- Error -->
        <div v-if="status === 'error'" class="border border-red-200 bg-red-50 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-red-500 text-xl">&#10007;</span>
            <span class="font-semibold text-red-700">เชื่อมต่อล้มเหลว</span>
          </div>
          <p class="text-sm text-red-600 font-mono break-all">{{ errorMessage }}</p>
        </div>

        <!-- Loading skeleton -->
        <div v-if="status === 'loading'" class="border border-gray-200 rounded-xl p-4 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>

      </div>

    </div>
  </div>
</template>
