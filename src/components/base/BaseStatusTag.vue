<template>
  <span class="status-tag" :class="variant">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "new",
    validator: (v) => ["new", "pending", "resolved", "cancel"].includes(v),
  },
})
</script>

<style scoped>
.status-tag {
  font-family: "Nunito", sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 150%;
  display: inline-flex;
  align-items: center;
  height: 26px;
  border-radius: 8px;
  padding: 4px 10px;
}

.new {
  width: 46px;
  background-color: #FAF1ED;
  color: #7B4429;
}

.pending {
  width: 65px;
  background-color: #FFF6D4;
  color: #393735;
}

.resolved {
  width: 70px;
  background-color: #E7FFE7;
  color: #197418;
}

.cancel {
  width: 57px;
  background-color: #F1F2F6;
  color: #646D89;
}
</style>
