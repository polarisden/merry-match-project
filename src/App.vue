<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'

const route = useRoute()
const showChrome = computed(() => !route.matched.some((r) => r.meta?.useOwnChrome))
const showFooter = computed(() => showChrome.value && !route.matched.some((r) => r.meta?.hideFooter))
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <Navbar v-if="showChrome" />
    <main class="flex-1 min-w-0">
      <RouterView />
    </main>
    <Footer v-if="showFooter" />
  </div>
</template>
