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
  color: var(--btn-color, #C70039);
  background-color: transparent;
  padding: var(--btn-py, 12px) var(--btn-px, 24px);
  transition: all 0.3s ease-out;
  cursor: pointer;
  border: none;
}

.btn-ghost:hover {
  color: var(--btn-color-hover, #FF1659);
}

.btn-ghost:active {
  color: var(--btn-color-active, #95002B);
}

.btn-ghost:disabled {
  color: #C8CCDB;
  cursor: not-allowed;
}
</style>
