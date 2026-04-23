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
  <div class="h-dvh flex flex-col overflow-hidden">
    <Navbar v-if="showChrome" class="shrink-0" />
    <main class="flex-1 min-h-0 min-w-0 overflow-hidden">
      <RouterView />
    </main>
    <Footer v-if="showFooter" class="shrink-0" />
  </div>
</template>
