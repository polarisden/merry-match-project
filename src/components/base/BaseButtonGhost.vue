<template>
  <button
    :disabled="disabled"
    class="btn-ghost"
    @click="$emit('click')"
  >
    <span v-if="showArrow">🠔 </span><slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  showArrow: {
    type: Boolean,
    default: false,
  },
})

defineEmits(["click"])
</script>

<style scoped>
.btn-ghost {
  font-family: "Nunito", sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  color: #C70039;
  background-color: transparent;
  padding: 12px 24px;
  transition: all 0.3s ease-out;
  cursor: pointer;
  border: none;
}

.btn-ghost:hover {
  color: #FF1659;
}

.btn-ghost:active {
  color: #95002B;
}

.btn-ghost:disabled {
  color: #C8CCDB;
  cursor: not-allowed;
}
</style>
