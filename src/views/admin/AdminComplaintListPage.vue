<script setup>
import { computed, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"
import BaseStatusTag from "@/components/base/BaseStatusTag.vue"

const router = useRouter()

const search = ref("")
const status = ref("all") // all | new | pending | resolved | cancel
const openStatusDropdown = ref(false)

const statusOptions = [
  { value: "all", label: "All status" },
  { value: "new", label: "New" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "cancel", label: "Cancel" },
]

const selectedStatusLabel = computed(() => {
  return statusOptions.find((o) => o.value === status.value)?.label ?? "All status"
})

const rows = ref([
  {
    id: "1",
    user: "Jon Snow",
    issue: "I was insulted by Ygritte",
    description: "Hello, there was a problem with user 'Ygritte' who insult me. Can you check her out?",
    dateSubmitted: "12/02/2022",
    status: "new",
  },
  {
    id: "2",
    user: "Jon Snow",
    issue: "I was insulted by Ygritte",
    description: "Hello, there was a problem with user 'Ygritte' who insult me. Can you check her out?",
    dateSubmitted: "12/02/2022",
    status: "new",
  },
  {
    id: "3",
    user: "Jon Snow",
    issue: "I was insulted by Ygritte",
    description: "Hello, there was a problem with user 'Ygritte' who insult me. Can you check her out?",
    dateSubmitted: "12/02/2022",
    status: "pending",
  },
  {
    id: "4",
    user: "Jon Snow",
    issue: "I was insulted by Ygritte",
    description: "Hello, there was a problem with user 'Ygritte' who insult me. Can you check her out?",
    dateSubmitted: "12/02/2022",
    status: "resolved",
  },
  {
    id: "5",
    user: "Jon Snow",
    issue: "I was insulted by Ygritte",
    description: "Hello, there was a problem with user 'Ygritte' who insult me. Can you check her out?",
    dateSubmitted: "12/02/2022",
    status: "cancel",
  },
])

const filtered = computed(() => {
  const s = search.value.trim().toLowerCase()
  return rows.value.filter((r) => {
    const matchesStatus = status.value === "all" ? true : r.status === status.value
    if (!matchesStatus) return false
    if (!s) return true
    return (
      r.user.toLowerCase().includes(s) ||
      r.issue.toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s)
    )
  })
})

function goDetail(id) {
  router.push(`/admin/complaints/${encodeURIComponent(id)}`)
}

function statusLabel(v) {
  if (v === "new") return "New"
  if (v === "pending") return "Pending"
  if (v === "resolved") return "Resolved"
  return "Cancel"
}

function toggleStatusDropdown() {
  openStatusDropdown.value = !openStatusDropdown.value
}

function selectStatus(v) {
  status.value = v
  openStatusDropdown.value = false
}

function handleDocumentClick(e) {
  const t = e?.target
  if (!(t instanceof Element)) return
  if (t.closest("[data-status-dropdown]")) return
  openStatusDropdown.value = false
}

if (typeof document !== "undefined") {
  document.addEventListener("click", handleDocumentClick)
}

onUnmounted(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("click", handleDocumentClick)
  }
})
</script>

<template>
  <section class="min-h-dvh bg-gray-100">
    <!-- Top navbar -->
    <div class="bg-white border-b border-gray-100">
      <div class="flex items-center justify-between gap-4 px-10 py-4 h-20">
      <h1 class="headline4 text-gray-900">
        Complaint list
      </h1>

      <div class="flex justify-between gap-3 w-[536px]">
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="Search..."
            class="h-12 w-[320px] rounded-lg border border-gray-200 bg-white px-9 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
          />
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            ⌕
          </span>
        </div>

        <div
          class="relative w-[200px]"
          data-status-dropdown
        >
          <button
            type="button"
            class="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 body2 outline-none flex items-center justify-between hover:cursor-pointer"
            aria-label="Filter by status"
            @click.stop="toggleStatusDropdown"
          >
            <span class="truncate text-left text-gray-700">
              {{ selectedStatusLabel }}
            </span>
            <span
              class="text-[10px] text-gray-500 transition-transform"
              :class="{ 'rotate-180': openStatusDropdown }"
              aria-hidden="true"
            >
              ▼
            </span>
          </button>

          <div
            v-if="openStatusDropdown"
            class="absolute z-30 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-sm p-2 max-h-56 overflow-y-auto"
            role="listbox"
            aria-label="Status options"
          >
            <button
              v-for="opt in statusOptions"
              :key="opt.value"
              type="button"
              class="w-full rounded-md px-3 py-2.5 text-left body2 text-gray-700 hover:bg-gray-100 hover:cursor-pointer"
              @click="selectStatus(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <div class="px-10 py-10">
      <div class="overflow-hidden rounded-xl bg-white shadow-sm">
        <div class="h-10 align-center grid grid-cols-[140px_220px_1fr_160px_120px] gap-0 bg-gray-400 px-10 py-2 body4 text-gray-800">
          <div>User</div>
          <div>Issue</div>
          <div>Description</div>
          <div class="text-center">Date Submitted</div>
          <div class="text-center">Status</div>
        </div>

        <div class="divide-y divide-gray-100 bg-white">
          <button
            v-for="r in filtered"
            :key="r.id"
            type="button"
            class="grid w-full h-[90px] grid-cols-[140px_220px_1fr_160px_120px] items-center gap-0 px-10 py-3 text-left hover:bg-gray-50 hover:cursor-pointer"
            @click="goDetail(r.id)"
          >
            <div class="truncate body2 text-black">
              {{ r.user }}
            </div>
            <div class="truncate body2 text-black">
              {{ r.issue }}
            </div>
            <div class="truncate body2 text-black">
              {{ r.description }}
            </div>
            <div class="text-center body2 text-black">
              {{ r.dateSubmitted }}
            </div>
            <div class="flex pl-10">
              <BaseStatusTag :variant="r.status">
                {{ statusLabel(r.status) }}
              </BaseStatusTag>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

