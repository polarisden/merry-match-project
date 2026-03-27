<template>
  <div class="merry-status-match">
    <MerryMatchIcon class="w-5 h-3 text-[#FF1659]" />
    Merry Match!
  </div>
</template>

<script setup>
import MerryMatchIcon from '@/assets/icons/merry_match.svg?component'
</script>

<style scoped>
.merry-status-match {
  font-family: "Nunito", sans-serif;
  font-weight: 800;
  font-size: 16px;
  line-height: 150%;
  color: #C70039;
  border: 1px solid #C70039;
  height: 32px;
  border-radius: 99px;
  padding: 4px 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.icon {
  width: 20.4px;
  height: 12px;
}
</style>
