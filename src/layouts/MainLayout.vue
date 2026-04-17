<template>
  <Navbar />

  <!-- เนื้อหาของแต่ละหน้า -->
  <div class="flex flex-col min-h-screen">
    <main class="flex-1">
      <slot />
    </main>

    
  </div>
</template>

<script setup>
import Navbar from '../components/landing/Navbar.vue'

</script>