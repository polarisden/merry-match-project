<script setup>
import BaseButtonPrimary from '../components/base/BaseButtonPrimary.vue'
import BaseButtonSecondary from '../components/base/BaseButtonSecondary.vue'
import BaseButtonGhost from '../components/base/BaseButtonGhost.vue'
import BaseStatusTag from '../components/base/BaseStatusTag.vue'
import BaseMerryNotMatch from '../components/base/BaseMerryNotMatch.vue'
import BaseMerryMatch from '../components/base/BaseMerryMatch.vue'
import BaseActionChat from '../components/base/BaseActionChat.vue'
import BaseActionProfile from '../components/base/BaseActionProfile.vue'
import BaseActionMerry from '../components/base/BaseActionMerry.vue'
</script>

<template>
  <div class="p-10 flex flex-col gap-8">

    <!-- Buttons -->
    <section class="flex flex-col gap-4">
      <p class="body1">Primary</p>
      <div class="flex gap-4 items-center">
        <BaseButtonPrimary>Merry Match!</BaseButtonPrimary>
        <BaseButtonPrimary disabled>Merry Match!</BaseButtonPrimary>
      </div>

      <p class="body1">Secondary</p>
      <div class="flex gap-4 items-center">
        <BaseButtonSecondary>Merry Match!</BaseButtonSecondary>
        <BaseButtonSecondary disabled>Merry Match!</BaseButtonSecondary>
      </div>

      <p class="body1">Ghost</p>
      <div class="flex gap-4 items-center">
        <BaseButtonGhost>Merry Match!</BaseButtonGhost>
        <BaseButtonGhost showArrow>Merry Match!</BaseButtonGhost>
        <BaseButtonGhost disabled>Merry Match!</BaseButtonGhost>
        <BaseButtonGhost showArrow disabled>Merry Match!</BaseButtonGhost>
      </div>
    </section>

    <!-- Status Tags -->
    <section class="flex flex-col gap-4">
      <p class="body1">Status Tag</p>
      <div class="flex gap-4 items-center">
        <BaseStatusTag variant="new">new</BaseStatusTag>
        <BaseStatusTag variant="pending">pending</BaseStatusTag>
        <BaseStatusTag variant="resolved">resolved</BaseStatusTag>
        <BaseStatusTag variant="cancel">cancel</BaseStatusTag>
      </div>
    </section>

    <!-- Merry Status -->
    <section class="flex flex-col gap-4">
      <p class="body1">Merry Status</p>
      <div class="flex gap-4 items-center">
        <BaseMerryNotMatch />
        <BaseMerryMatch />
      </div>
    </section>

    <!-- Action Buttons -->
    <section class="flex flex-col gap-4">
      <p class="body1">Action Buttons</p>
      <div class="flex gap-6 items-start">
        <BaseActionChat />
        <BaseActionProfile />
        <BaseActionMerry />
      </div>
    </section>

  </div>
</template>
