<script setup>
import { ref } from "vue"

const props = defineProps({
  interestTags: { type: Array, required: true },
  selectedInterestTags: { type: Array, required: true },
  max: { type: Number, default: 10 },
  addInterestByName: { type: Function, default: null },
})

const emit = defineEmits(["toggle", "remove", "error"])

const newInterestKeyword = ref("")

async function handleAddInterestKeyword() {
  const keyword = String(newInterestKeyword.value || "").trim()
  if (!keyword) return
  if (!props.addInterestByName) return
  const existsInDb = props.interestTags?.some(
    (t) => String(t || "").trim().toLowerCase() === keyword.toLowerCase(),
  )
  if (existsInDb) emit("error", "Interest already exists.")
  await props.addInterestByName(keyword)
  newInterestKeyword.value = ""
}
</script>

<template>
  <div class="lg:col-span-2">
    <label class="mb-1.5 block body2">Hobbies / Interests (Maximum {{ max }})</label>
    <div class="w-full min-h-11 px-2 py-2 border border-gray-300 rounded-lg bg-gray-100 lg:bg-white flex flex-wrap gap-1.5">
      <button
        v-for="tag in selectedInterestTags"
        :key="`selected-${tag}`"
        type="button"
        class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-100 body4 text-purple-500 leading-none"
        @click="emit('remove', tag)"
      >
        {{ tag }} <span class="text-purple-300 hover:cursor-pointer">x</span>
      </button>
      <input
        v-model="newInterestKeyword"
        type="text"
        class="h-8 min-w-[120px] flex-1 bg-transparent px-1 body4 text-black outline-none placeholder:text-gray-500"
        placeholder="Select or type interests (press Enter)"
        :disabled="!addInterestByName"
        @keydown.enter.prevent="handleAddInterestKeyword"
      />
    </div>
    <div class="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 lg:bg-white shadow-sm p-2 max-h-56 overflow-y-auto flex flex-wrap gap-2">
      <button
        v-for="tag in interestTags"
        :key="tag"
        type="button"
        class="px-3 py-1.5 rounded-md body2 border transition hover:cursor-pointer"
        :class="selectedInterestTags.includes(tag)
          ? 'border-purple-300 bg-purple-100 text-purple-500'
          : 'border-gray-300 text-gray-700 hover:bg-gray-200'"
        :disabled="!selectedInterestTags.includes(tag) && selectedInterestTags.length >= max"
        @click="emit('toggle', tag)"
      >
        {{ tag }}
      </button>
    </div>
    <div class="mt-2 text-xs text-gray-500">
      {{ selectedInterestTags.length }}/{{ max }} selected
    </div>
  </div>
</template>

