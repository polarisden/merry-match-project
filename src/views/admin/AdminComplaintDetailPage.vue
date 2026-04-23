<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { fetchAdminComplaintDetail, updateComplaintStatus } from "@/views/admin/reportApi"
import ArrowIcon from "@/assets/icons/arrow.svg"
import BaseButtonPrimary from "@/components/base/BaseButtonPrimary.vue"
import BaseStatusTag from "@/components/base/BaseStatusTag.vue"
import ConfirmModal from "@/components/modals/ConfirmModal.vue"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const reportId = computed(() => String(route.params.id || ""))

/** @type {import("vue").Ref<import("./reportApi").ReportItem | null>} */
const record = ref(null)
const loading = ref(false)
const errorMsg = ref("")

const statusVariant = computed(() => record.value?.status ?? "new")

const resolveOpen = ref(false)
const cancelOpen = ref(false)
const actionError = ref("")

function formatDate(iso) {
  if (!iso) return "-"
  try {
    return new Date(iso).toLocaleDateString("en-GB")
  } catch {
    return iso
  }
}

function statusText(s) {
  if (s === "new") return "New"
  if (s === "pending") return "Pending"
  if (s === "resolved") return "Resolved"
  return "Cancel"
}

async function load() {
  loading.value = true
  errorMsg.value = ""
  try {
    authStore.hydrate()
    const token = authStore.token
    // Backend auto-transitions new → pending when this is called
    record.value = await fetchAdminComplaintDetail(reportId.value, token)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : "Failed to load complaint"
  } finally {
    loading.value = false
  }
}

onMounted(load)

function goBack() {
  router.push("/admin/complaints")
}

function openResolve() {
  actionError.value = ""
  resolveOpen.value = true
}

function openCancel() {
  actionError.value = ""
  cancelOpen.value = true
}

function closeModals() {
  resolveOpen.value = false
  cancelOpen.value = false
}

async function confirmResolveYes() {
  closeModals()
  await patchStatus("resolved")
}

async function confirmCancelYes() {
  closeModals()
  await patchStatus("cancel")
}

async function patchStatus(newStatus) {
  actionError.value = ""
  try {
    authStore.hydrate()
    const token = authStore.token
    const updated = await updateComplaintStatus(reportId.value, newStatus, token)
    record.value = updated
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : "Update failed"
  }
}
</script>

<template>
  <section class="min-h-dvh bg-gray-100">
    <!-- Top navbar -->
    <div class="bg-white border-b border-gray-100">
      <div class="flex items-center justify-between gap-4 px-15 py-4">
        <div class="flex min-w-0 items-center gap-4">
          <ArrowIcon
            class="h-6 w-6 shrink-0 text-gray-600 hover:cursor-pointer"
            @click="goBack"
          />

          <h1 class="truncate headline4 text-gray-900">
            {{ record?.issue ?? "Complaint Detail" }}
          </h1>

          <BaseStatusTag
            v-if="record"
            :variant="statusVariant"
          >
            {{ statusText(statusVariant) }}
          </BaseStatusTag>
        </div>

        <div class="flex shrink-0 items-center gap-6">
          <button
            type="button"
            class="body2-w-700 text-red-500 hover:text-red-600 hover:cursor-pointer"
            :disabled="!record || statusVariant === 'cancel' || statusVariant === 'resolved'"
            @click="openCancel"
          >
            Cancel Complaint
          </button>
          <BaseButtonPrimary
            :disabled="!record || statusVariant === 'resolved' || statusVariant === 'cancel'"
            @click="openResolve"
          >
            Resolve Complaint
          </BaseButtonPrimary>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="px-15 py-10">
      <!-- Loading -->
      <p
        v-if="loading"
        class="body2 text-gray-500"
        role="status"
      >
        Loading...
      </p>

      <!-- Error -->
      <p
        v-else-if="errorMsg"
        class="body2 text-red-600"
        role="alert"
      >
        {{ errorMsg }}
      </p>

      <!-- Action error -->
      <p
        v-if="actionError"
        class="mb-4 body2 text-red-600"
        role="alert"
      >
        {{ actionError }}
      </p>

      <div
        v-if="record"
        class="rounded-2xl bg-white px-25 pt-10 pb-15 shadow-sm"
      >
        <div class="max-w-[760px]">
          <p class="body1 text-gray-700">
            Complaint by:
            <span class="body2 text-black">{{ record.reporterName }}</span>
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
                {{ formatDate(record.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resolve modal -->
    <ConfirmModal
      :open="resolveOpen"
      title="Resolve Complaint"
      message="This complaint is resolved?"
      confirm-text="Yes, it has been resolved"
      cancel-text="No, it's not"
      @close="closeModals"
      @confirm="confirmResolveYes"
    />

    <!-- Cancel modal -->
    <ConfirmModal
      :open="cancelOpen"
      title="Cancel Complaint"
      message="Do you sure to cancel this complaint?"
      confirm-text="Yes, cancel this complaint"
      cancel-text="No, give me more time"
      @close="closeModals"
      @confirm="confirmCancelYes"
    />
  </section>
</template>
