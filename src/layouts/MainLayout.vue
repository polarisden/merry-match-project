<template>
  <Navbar />

  <!-- เนื้อหาของแต่ละหน้า -->
  <div class="flex flex-col min-h-screen">
    <main class="flex-1">
      <slot />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '../components/landing/Navbar.vue'
import Footer from '../components/landing/Footer.vue'
</script>