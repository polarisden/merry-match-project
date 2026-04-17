<template>
  <div v-if="show" class="w-full -mt-[50px] lg:-mt-[65px]">
    <aside
      class="w-full rounded-[16px] px-[16px] py-[12px] body2 text-gray-800"
      role="status"
    >
      <section class="flex flex-row gap-[2px] lg:items-center ">
        <p>*</p>
        <BaseButtonGhost
          type="button"
          class="self-end mr-[10px] w-fit shrink-0 [--btn-px:0px] [--btn-py:0px] [--btn-color:black]"
          :disabled="actionPending"
          @click="openCancelModal = true"
        >
          {{ actionPending ? "Cancelling..." : "Cancel plan change" }}
        </BaseButtonGhost>
      </section>
    </aside>
    <ConfirmModal
      :open="openCancelModal"
      title="Cancel plan change?"
      :message="confirmMessage"
      confirm-text="Yes, cancel the request"
      cancel-text="No, keep the scheduled"
      @close="openCancelModal = false"
      @confirm="handleConfirmCancelScheduled"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";
import ConfirmModal from "../modals/ConfirmModal.vue";

const emit = defineEmits(["cancel-pending-plan-change"]);

const props = defineProps({
  /** จาก normalizeMembership — pendingPlan + scheduledPlanChangeAt */
  merryPackage: {
    type: Object,
    default: null,
  },
  actionPending: {
    type: Boolean,
    default: false,
  },
});

const openCancelModal = ref(false);

const show = computed(() => {
  const m = props.merryPackage;
  if (!m?.pendingPlan || !m?.scheduledPlanChangeAt) return false;
  return true;
});

const pendingPlanName = computed(
  () => props.merryPackage?.pendingPlan?.name ?? "the new plan",
);

const scheduledAtIso = computed(
  () => props.merryPackage?.scheduledPlanChangeAt ?? "",
);

const scheduledLabel = computed(
  () =>
    props.merryPackage?.scheduledPlanChangeAtDisplay ||
    props.merryPackage?.scheduledPlanChangeAt ||
    "",
);

const confirmMessage = computed(
  () =>
    `Cancel the plan change to ${pendingPlanName.value} on ${scheduledLabel.value}? You will remain on your current plan.`,
);

function handleConfirmCancelScheduled() {
  openCancelModal.value = false;
  emit("cancel-pending-plan-change");
}
</script>
