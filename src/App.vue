<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/landing/Navbar.vue'
import Footer from '@/components/landing/Footer.vue'

const route = useRoute()
const showChrome = computed(() => !route.matched.some((r) => r.meta?.useOwnChrome))
const showFooter = computed(() => showChrome.value && !route.matched.some((r) => r.meta?.hideFooter))
const fixedLayout = computed(() => route.matched.some((r) => r.meta?.fixedLayout))
</script>

<template>
  <div :class="fixedLayout ? 'h-dvh flex flex-col overflow-hidden' : 'min-h-dvh flex flex-col'">
    <Navbar v-if="showChrome" class="shrink-0" />
    <main :class="fixedLayout ? 'flex-1 min-h-0 min-w-0 overflow-hidden' : 'flex-1 min-w-0'">
      <RouterView />
    </main>
    <Footer v-if="showFooter" class="shrink-0" />
  </div>
</template>
