<template>
  <div class="action-wrap">
    <button class="action-btn" :class="{ clicked }" @click="toggle">
      <HeartIcon class="h-6 w-6" :class="clicked ? 'text-white' : 'text-red-500'"/>
    </button>
    <span class="tooltip">Merry</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeartIcon from '@/assets/icons/heart.svg?component'

const emit = defineEmits(['click'])

const clicked = ref(false)

function toggle() {
  clicked.value = !clicked.value
emit('click', clicked.value)
}
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
  box-shadow: 2px 2px 12px 0px #4032851F;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease-out;
}

.action-btn.clicked,
.action-btn.clicked:hover {
  background-color: #C70039;
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
