<template>
  <div class="merry-status-not-match">
    <slot />
    Not Match yet
  </div>
</template>

<script setup></script>

<style scoped>
.merry-status-not-match {
  font-family: "Nunito", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  color: #646D89;
  border: 1px solid #C8CCDB;
  height: 32px;
  border-radius: 99px;
  padding: 4px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
