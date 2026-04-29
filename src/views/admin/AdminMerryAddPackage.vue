<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPackage } from '@/api/packages.js'

const router = useRouter()

const name = ref('')
const merryLimit = ref('')
const priceSatang = ref(0)
const canSeeLikers = ref(false)
const sortOrder = ref(0)
const iconFile = ref(null)
const iconPreview = ref('')
const details = ref([{ id: 1, description: '' }])
const submitted = ref(false)
let nextId = 2

function onIconUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  iconFile.value = file
  iconPreview.value = URL.createObjectURL(file)
}

function removeIcon() {
  iconFile.value = null
  iconPreview.value = ''
}

function addDetail() {
  details.value.push({ id: nextId++, description: '' })
}

function removeDetail(id) {
  if (details.value.length <= 1) return
  details.value = details.value.filter(d => d.id !== id)
}

async function onAdd() {
  submitted.value = true

  const hasEmptyDetail = details.value.some(d => !d.description.trim())
  if (!name.value || !merryLimit.value || !iconFile.value || hasEmptyDetail) return

  await createPackage({
    name: name.value,
    merryLimit: Number(merryLimit.value),
    priceSatang: Number(priceSatang.value ?? 0),
    canSeeLikers: Boolean(canSeeLikers.value),
    sortOrder: Number(sortOrder.value ?? 0),
    details: details.value.map((d, index) => ({
      description: d.description,
      sortOrder: index,
    })),
    iconFile: iconFile.value,
  })
  router.push({ name: 'admin-packages' })
}
</script>

<template>
  <section class="min-h-screen bg-[#F3F4F8] p-8">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="router.push({ name: 'admin-packages' })"
          class="flex items-center justify-center rounded-full p-1 hover:bg-gray-200 transition cursor-pointer"
        >
        </button>
        <h1 class="text-lg font-bold text-gray-900">Add Package</h1>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="router.push({ name: 'admin-packages' })"
          class="rounded-full border border-pink-200 bg-pink-50 px-5 py-2 text-sm font-semibold text-pink-400 hover:bg-pink-100 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          @click="onAdd"
          class="rounded-full bg-[#C13256] px-5 py-2 text-sm font-semibold text-white hover:bg-[#a8294a] transition cursor-pointer"
        >
          Create
        </button>
      </div>
    </div>

    <!-- Card -->
    <article class="bg-white pt-10 pb-15 px-15 rounded-2xl border border-gray-200">
      <!-- Package name + Merry limit -->
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
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
              <button @click="merryLimit++"
                class="text-gray-400 hover:text-gray-600 leading-none cursor-pointer text-[10px]">▲</button>
              <button @click="merryLimit > 0 && merryLimit--"
                class="text-gray-400 hover:text-gray-600 leading-none cursor-pointer text-[10px]">▼</button>
            </div>
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
        <input id="canSeeLikers" v-model="canSeeLikers" type="checkbox" class="h-4 w-4 accent-[#C13256]" />
        <label for="canSeeLikers" class="text-sm font-medium text-gray-700">Can see likers</label>
      </div>

      <!-- Icon upload -->
      <div class="mb-8 flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">
          Icon <span class="text-red-400">*</span>
        </label>
        <div class="relative inline-block">
          <!-- Preview mode -->
          <div v-if="iconPreview" class="relative inline-block">
            <div class="flex h-[88px] w-[88px] items-center justify-center rounded-xl bg-[#EEF0FB] overflow-hidden">
              <img :src="iconPreview" alt="Package icon preview" class="h-full w-full object-cover" />
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
            :class="['flex h-[100px] w-[100px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-[#F6F7FC] overflow-hidden',
              submitted && !iconFile ? 'ring-2 ring-red-400' : '']"
          >
            <svg class="h-6 w-6 text-[#C13256]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="body4 text-[#C13256]">Upload icon</span>
            <input type="file" accept="image/*" class="hidden" @change="onIconUpload" />
          </label>
        </div>
        <p v-if="submitted && !iconFile" class="text-xs text-red-400 mt-1">Icon is required.</p>
      </div>

      <div class="mb-6 border-t border-gray-100"></div>

      <!-- Package Detail -->
      <div class="flex flex-col gap-4">
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

        <button
          @click="addDetail"
          class="w-fit rounded-full bg-pink-50 border px-5 py-2 text-sm font-semibold text-[#C13256] hover:bg-pink-100 transition cursor-pointer"
        >
          + Add detail
        </button>
      </div>
    </article>
  </section>
</template>