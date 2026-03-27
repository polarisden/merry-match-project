<template>
  <div class="action-wrap">
    <button class="action-btn" @click="$emit('click')">
      <ChatIcon class="w-6 h-6"/>
    </button>
    <span class="tooltip">Go to chat</span>
  </div>
</template>

<script setup>
import ChatIcon from '@/assets/icons/chat.svg?component'

defineEmits(['click'])
</script>

<style scoped>
.action-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.action-btn {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background-color: #FFFFFF;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 2px 2px 12px 0px #4032851F;
  justify-content: center;
  transition: all 0.3s ease-out;
}

.tooltip {
  font-family: "Nunito", sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  color: white;
  background-color: #9AA1B9;
  border-radius: 4px;
  padding: 2px 8px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.action-wrap:hover .tooltip {
  opacity: 1;
}
</style>
