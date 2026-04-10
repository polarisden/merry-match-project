<script setup>
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import BaseButtonGhost from "@/components/base/BaseButtonGhost.vue"
import ArrowIcon from "@/assets/icons/arrow.svg"
import BaseButtonPrimary from "@/components/base/BaseButtonPrimary.vue"
import BaseButtonSecondary from "@/components/base/BaseButtonSecondary.vue"
import BaseStatusTag from "@/components/base/BaseStatusTag.vue"
import ConfirmModal from "@/components/modals/ConfirmModal.vue"

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id || ""))

// UI-only mock record
const record = computed(() => ({
  id: id.value,
  user: "Jon Snow",
  issue: "I was insulted by Ygritte",
  description: "Hello, there was a problem with user 'Ygritte' who insult me.\nCan you check her out?",
  dateSubmitted: "12/02/2022",
  status: "pending",
}))

const statusOverride = ref(/** @type {string | null} */ (null))
const statusVariant = computed(() => statusOverride.value || record.value.status)

const resolveOpen = ref(false)
const cancelOpen = ref(false)

function goBack() {
  router.push("/admin/complaints")
}

function openResolve() {
  resolveOpen.value = true
}

function openCancel() {
  cancelOpen.value = true
}

function closeModals() {
  resolveOpen.value = false
  cancelOpen.value = false
}

function confirmResolveYes() {
  statusOverride.value = "resolved"
  closeModals()
}

function confirmCancelYes() {
  statusOverride.value = "cancel"
  closeModals()
}
</script>

<template>
  <section class="min-h-dvh bg-gray-100">
    <!-- Top navbar -->
    <div class="bg-white border-b border-gray-100">
      <div class="flex items-center justify-between gap-4 px-15 py-4">
      <div class="flex min-w-0 items-center gap-4">
        <ArrowIcon
          class="h-6 w-6 text-gray-600 hover:cursor-pointer"
          @click="goBack"
        >
        </ArrowIcon>

        <h1 class="truncate headline4 text-gray-900">
          {{ record.issue }}
        </h1>

        <BaseStatusTag :variant="statusVariant">
          {{ statusVariant === "new" ? "New" : statusVariant === "pending" ? "Pending" : statusVariant === "resolved" ? "Resolved" : "Cancel" }}
        </BaseStatusTag>
      </div>

      <div class="flex items-center gap-6">
        <button
          type="button"
          class="body2-w-700 text-red-500 hover:text-red-600 hover:cursor-pointer"
          @click="openCancel"
        >
          Cancel Complaint
        </button>
        <BaseButtonPrimary @click="openResolve">
          Resolve Complaint
        </BaseButtonPrimary>
      </div>
      </div>
    </div>

    <div class="px-15 py-10">
      <div class="rounded-2xl bg-white px-25 pt-10 pb-15 shadow-sm">
      <div class="max-w-[760px]">
        <p class="body1 text-gray-700">
          Complaint by:
          <span class="body2 text-black">{{ record.user }}</span>
        </p>
        <div class="mt-10 border-t border-gray-300" />

        <div class="mt-10 grid gap-10">
          <div>
            <p class="body1 text-gray-700">
              Issue
            </p>
            <p class="mt-1 body2 text-black">
              {{ record.issue }}
            </p>
          </div>

          <div>
            <p class="body1 text-gray-700">
              Description
            </p>
            <p class="mt-1 whitespace-pre-line body2 text-black">
              {{ record.description }}
            </p>
          </div>

          <div>
            <p class="body1 text-gray-700">
              Date Submitted
            </p>
            <p class="mt-1 body2 text-black">
              {{ record.dateSubmitted }}
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- UI-only modals -->
    <ConfirmModal
      :open="resolveOpen"
      title="Resolve Complaint"
      message="This complaint is resolved?"
      confirm-text="No, it's not"
      cancel-text="Yes, it has been resolved"
      @close="confirmResolveYes"
      @confirm="closeModals"
    />

    <ConfirmModal
      :open="cancelOpen"
      title="Cancel Complaint"
      message="Do you sure to cancel this complaint?"
      confirm-text="No, give me more time"
      cancel-text="Yes, cancel this complaint"
      @close="confirmCancelYes"
      @confirm="closeModals"
    />
  </section>
</template>

