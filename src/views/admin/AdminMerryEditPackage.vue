<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import ArrowIcon from "@/assets/icons/arrow.svg"
import { getPackages, updatePackage, deletePackage } from '@/api/packages.js'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref(null)

const name = ref('')
const merryLimit = ref(0)
const priceSatang = ref(0)
const canSeeLikers = ref(false)
const sortOrder = ref(0)

const icon = ref(null)
const iconFile = ref(null)
const details = ref([{ id: 1, description: '' }])
const showDeleteModal = ref(false)
const submitted = ref(false)

let nextId = 2

function goBack() {
  router.push("/admin/packages")
}

async function onDeleteConfirm() {
  try {
    const id = String(route.params.id ?? '').trim()
    if (!id) return
    await deletePackage(id)
    goBack()
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    showDeleteModal.value = false
  }
}

function addDetail() {
  details.value.push({ id: nextId++, description: '' })
}

function removeDetail(id) {
  if (details.value.length <= 1) return
  details.value = details.value.filter(d => d.id !== id)
}

function removeIcon() {
  icon.value = null
  iconFile.value = null
}

function onIconUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  iconFile.value = file
  icon.value = URL.createObjectURL(file)
}

async function onSave() {
  submitted.value = true

  const hasEmptyDetail = details.value.some(d => !d.description.trim())
  if (!name.value || !merryLimit.value || hasEmptyDetail) return
  if (!icon.value && !iconFile.value) return

  try {
    const id = String(route.params.id ?? '').trim()
    if (!id) return

    await updatePackage(id, {
      name: name.value,
      merryLimit: Number(merryLimit.value),
      priceSatang: Number(priceSatang.value ?? 0),
      canSeeLikers: Boolean(canSeeLikers.value),
      sortOrder: Number(sortOrder.value ?? 0),
      details: details.value.map((d, index) => ({
        description: d.description,
        sortOrder: index,
      })),
      iconFile: iconFile.value || undefined,
    })
    goBack()
  } catch (e) {
    error.value = e?.message ?? String(e)
  }
}

onMounted(async () => {
  const id = String(route.params.id ?? '').trim()
  if (!id) {
    error.value = 'Missing package id'
    return
  }

  loading.value = true
  try {
    const list = await getPackages()
    const pkg = list.find(p => String(p.id) === id)
    if (!pkg) {
      error.value = 'Package not found'
      return
    }

    name.value = pkg.name ?? ''
    merryLimit.value = pkg.merryLimit ?? 0
    priceSatang.value = pkg.priceSatang ?? 0
    canSeeLikers.value = Boolean(pkg.canSeeLikers ?? false)
    sortOrder.value = pkg.sortOrder ?? 0
    icon.value = pkg.icon ?? null

    const serverDetails = Array.isArray(pkg.details) ? pkg.details : []
    details.value = (serverDetails.length ? serverDetails : [{ description: '' }]).map((d, idx) => ({
      id: idx + 1,
      description: String(d?.description ?? d?.text ?? ''),
    }))
    nextId = details.value.length + 1
  } catch (e) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="min-h-screen bg-[#F3F4F8] p-8">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <ArrowIcon class="h-6 w-6 shrink-0 text-gray-600 hover:cursor-pointer" @click="goBack" />
        <h1 class="text-lg font-bold text-gray-900">Edit '{{ name }}'</h1>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="goBack"
          class="rounded-full border border-pink-200 bg-pink-50 px-5 py-2 text-sm font-semibold text-pink-400 hover:bg-pink-100 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          @click="onSave"
          class="rounded-full bg-[#C13256] px-5 py-2 text-sm font-semibold text-white hover:bg-[#a8294a] transition cursor-pointer"
        >
          Edit
        </button>
      </div>
    </div>

    <!-- Card -->
    <article class="bg-white pt-10 pb-15 px-15 rounded-2xl border border-gray-200">
      <div v-if="loading" class="py-10 text-center text-sm text-gray-400">Loading...</div>
      <div v-else>
        <div v-if="error" class="mb-6 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {{ error }}
        </div>

      <!-- Row 1: Package name + Merry limit -->
      <div class="mb-6 grid grid-cols-2 gap-6">

        <!-- Package name -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">
            Package name <span class="text-red-400">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            :class="['rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-pink-100 transition',
              submitted && !name ? 'border-red-400' : 'border-gray-200 focus:border-pink-300']"
          />
          <p v-if="submitted && !name" class="text-xs text-red-400 mt-1">Package name is required.</p>
        </div>

        <!-- Merry limit -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">
            Merry limit <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <input
              v-model="merryLimit"
              type="number"
              :class="['w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-pink-100 transition appearance-none',
                submitted && !merryLimit ? 'border-red-400' : 'border-gray-200 focus:border-pink-300']"
            />
          </div>
          <p v-if="submitted && !merryLimit" class="text-xs text-red-400 mt-1">Merry limit is required.</p>
        </div>
      </div>

      <!-- Price + Sort -->
      <div class="mb-6 grid grid-cols-2 gap-6">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Price (satang)</label>
          <input
            v-model="priceSatang"
            type="number"
            class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300 transition"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-gray-700">Sort order</label>
          <input
            v-model="sortOrder"
            type="number"
            class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300 transition"
          />
        </div>
      </div>

      <!-- Permission -->
      <div class="mb-6 flex items-center gap-3">
        <input id="canSeeLikersEdit" v-model="canSeeLikers" type="checkbox" class="h-4 w-4 accent-[#C13256]" />
        <label for="canSeeLikersEdit" class="text-sm font-medium text-gray-700">Can see likers</label>
      </div>

      <!-- Icon -->
      <div class="mb-8 flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">Icon <span class="text-red-400">*</span></label>
        <div class="relative inline-block">
          <!-- Preview mode -->
          <div v-if="icon" class="relative inline-block">
            <div class="flex h-[88px] w-[88px] items-center justify-center rounded-xl bg-[#EEF0FB] overflow-hidden">
              <img :src="icon" alt="Package icon preview" class="h-full w-full object-cover" />
            </div>
            <button
              @click="removeIcon"
              class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#C13256] text-white shadow cursor-pointer hover:bg-[#a8294a] transition"
            >
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Upload box -->
          <label
            v-else
            class="flex h-[100px] w-[100px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-[#F6F7FC] overflow-hidden"
            :class="{ 'ring-2 ring-red-400': submitted && !icon }"
          >
            <svg class="h-6 w-6 text-[#C13256]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="body4 text-[#C13256]">Upload icon</span>
            <input type="file" accept="image/*" class="hidden" @change="onIconUpload" />
          </label>
        </div>
        <p v-if="submitted && !icon" class="text-xs text-red-400 mt-1">Icon is required.</p>
      </div>

      <!-- Divider -->
      <div class="mb-6 border-t border-gray-100"></div>

      <!-- Package Detail -->
      <div class="flex flex-col gap-10">
        <h2 class="body1 text-gray-700">Package Detail</h2>

        <div class="flex flex-col gap-3">
          <div v-for="(detail, index) in details" :key="detail.id" class="flex items-center gap-3">
            <!-- Drag handle -->
            <div class="flex flex-col gap-[3px] cursor-grab shrink-0">
              <span class="flex gap-[3px]">
                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
              </span>
              <span class="flex gap-[3px]">
                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
              </span>
              <span class="flex gap-[3px]">
                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
              </span>
            </div>

            <div class="flex flex-1 flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">
                Detail <span v-if="index === 0" class="text-red-400">*</span>
              </label>
              <input
                v-model="detail.description"
                type="text"
                :class="['rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-pink-100 transition',
                  submitted && !detail.description.trim() ? 'border-red-400' : 'border-gray-200 focus:border-pink-300']"
              />
              <p v-if="submitted && !detail.description.trim()" class="text-xs text-red-400 mt-1">Detail is required.</p>
            </div>

            <button
              v-if="details.length > 1"
              @click="removeDetail(detail.id)"
              class="mt-5 shrink-0 text-sm font-semibold text-[#C13256] hover:text-[#a8294a] transition cursor-pointer"
            >
              Delete
            </button>
            <div v-else class="mt-5 w-[42px] shrink-0"></div>
          </div>
        </div>

        <!-- Add detail -->
        <div>
          <button
            @click="addDetail"
            class="rounded-full bg-pink-50 border border-pink-200 px-5 py-2 text-sm font-semibold text-[#C13256] hover:bg-pink-100 transition cursor-pointer"
          >
            + Add detail
          </button>
        </div>
      </div>
      </div>
    </article>

    <!-- Delete Package -->
    <div class="mt-4.5 flex justify-end">
      <button
        @click="showDeleteModal = true"
        class="text-[16px] font-semibold pr-10 text-gray-700 hover:text-red-500 transition cursor-pointer"
      >
        Delete Package
      </button>
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