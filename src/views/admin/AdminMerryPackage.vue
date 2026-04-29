<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPackages, deletePackage } from '@/api/packages.js'
import deleteIcon from '@/assets/icons/delete.svg'
import editIcon from '@/assets/icons/edit.svg'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const router = useRouter()

const packages = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const showDeleteModal = ref(false)
const deleteTargetId = ref(null)

// ดึงข้อมูลตอน mount
onMounted(async () => {
  loading.value = true
  try {
    packages.value = await getPackages()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const filtered = computed(() =>
  packages.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

function onDelete(id) {
  deleteTargetId.value = id
  showDeleteModal.value = true
}

async function onDeleteConfirm() {
  try {
    await deletePackage(deleteTargetId.value)
    packages.value = packages.value.filter(p => p.id !== deleteTargetId.value)
  } catch (e) {
    error.value = e.message
  } finally {
    showDeleteModal.value = false
    deleteTargetId.value = null
  }
}

function onEdit(id) {
  router.push(`/admin/packages/edit/${id}`)
}

function onAdd() {
  router.push('/admin/packages/add')
}
</script>

<template>
  <section class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 px-10 py-4 h-20">
      <h1 class="headline4 text-gray-900">Merry Package</h1>
      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="flex items-center gap-2 rounded-[8px] border border-gray-300 bg-white px-4 py-2.5">
          <svg class="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input v-model="search" type="text" placeholder="Search..."
            class="w-52 bg-transparent body2 text-gray-600 outline-none placeholder:text-gray-400" />
        </div>
        <!-- Add Button -->
        <button @click="onAdd"
          class="flex items-center gap-2 rounded-full bg-[#C13256] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#a8294a] transition-colors cursor-pointer">
          <span class="text-lg leading-none font-light">+</span>
          Add Package
        </button>
      </div>
    </div>

    <div class="pt-12 px-10">
      <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-[48px_48px_80px_1fr_1fr_1fr_1fr_80px] items-center px-6 py-3 bg-gray-400 body4 text-gray-800 tracking-wide">
          <div></div>
          <div></div>
          <div>Icon</div>
          <div>Package name</div>
          <div>Merry limit</div>
          <div>Created date</div>
          <div>Updated date</div>
          <div></div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="py-16 text-center text-sm text-gray-400">
          Loading...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="py-16 text-center text-sm text-red-400">
          {{ error }}
        </div>

        <!-- Rows -->
        <template v-else>
          <div v-for="(pkg, index) in filtered" :key="pkg.id"
            class="grid grid-cols-[48px_48px_80px_1fr_1fr_1fr_1fr_80px] items-center px-6 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <!-- Drag handle -->
            <div class="flex flex-col gap-[3px] text-gray-400 cursor-grab w-fit">
              <span class="flex gap-[3px]">
                <span class="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
                <span class="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
              </span>
              <span class="flex gap-[3px]">
                <span class="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
                <span class="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
              </span>
              <span class="flex gap-[3px]">
                <span class="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
                <span class="w-[3px] h-[3px] rounded-full bg-gray-400"></span>
              </span>
            </div>

            <div class="body2">{{ index + 1 }}</div>
            <img :src="pkg.icon" :alt="`${pkg.name} icon`" class="w-6 h-6 object-contain" />
            <div class="body2">{{ pkg.name }}</div>
            <div class="body2">{{ pkg.merryLimit }} Merry</div>
            <div class="body4">{{ pkg.createdAt }}</div>
            <div class="body4">{{ pkg.updatedAt }}</div>

            <!-- Actions -->
            <div class="flex items-center gap-1">
              <button @click="onDelete(pkg.id)"
                class="flex h-8 w-8 items-center justify-center rounded-md text-[#C13256] hover:bg-red-50 transition-colors cursor-pointer">
                <component :is="deleteIcon" class="w-5 h-5" />
              </button>
              <button @click="onEdit(pkg.id)"
                class="flex h-8 w-8 items-center justify-center rounded-md text-[#C13256] hover:bg-pink-50 transition-colors cursor-pointer">
                <component :is="editIcon" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="filtered.length === 0" class="py-16 text-center text-sm text-gray-400">
            No packages found.
          </div>
        </template>
      </div>
    </div>

    <ConfirmModal
      :open="showDeleteModal"
      title="Delete Confirmation"
      message="Do you sure to delete this Package?"
      confirmText="Yes, I want to delete"
      cancelText="No, I don't want"
      @close="showDeleteModal = false"
      @confirm="onDeleteConfirm"
    />
  </section>
</template>