<template>
  <button
    :disabled="disabled"
    class="btn-secondary"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(["click"])
</script>

<style scoped>
.btn-secondary {
  font-family: "Nunito", sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 150%;
  color: #95002B;
  background-color: #FFE1EA;
  border-radius: 99px;
  padding: var(--btn-py, 12px) var(--btn-px, 24px);
  text-align: center;
  transition: all 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(199, 0, 57, 0.2);
  cursor: pointer;
  border: none;
}

.btn-secondary:hover {
  background-color: #FFB1C8;
}

.btn-secondary:active {
  background-color: #FF6390;
}

.btn-secondary:disabled {
  background-color: #E4E6ED;
  color: #9AA1B9;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
