<template>
  <button
    :disabled="disabled"
    class="btn-primary"
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
.btn-primary {
  font-family: "Nunito", sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 150%;
  color: white;
  background-color: #C70039;
  border-radius: 99px;
  padding: 12px 24px;
  text-align: center;
  transition: all 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(199, 0, 57, 0.4);
  cursor: pointer;
  border: none;
}

.btn-primary:hover {
  background-color: #FF1659;
}

.btn-primary:active {
  background-color: #95002B;
}

.btn-primary:disabled {
  background-color: #E4E6ED;
  color: #9AA1B9;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
