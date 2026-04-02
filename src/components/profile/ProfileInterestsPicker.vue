<script setup>
defineProps({
  interestTags: { type: Array, required: true },
  selectedInterestTags: { type: Array, required: true },
  max: { type: Number, default: 10 },
})

const emit = defineEmits(["toggle", "remove"])
</script>

<template>
  <div class="lg:col-span-2">
    <label class="mb-1.5 block body2">Hobbies / Interests (Maximum {{ max }})</label>
    <div class="flex min-h-11 w-full flex-wrap gap-1.5 rounded-lg border border-gray-300 bg-gray-100 px-2 py-2 lg:bg-white">
      <span
        v-if="selectedInterestTags.length === 0"
        class="body2 text-gray-500 px-1 py-0.5"
      >
        Select interests
      </span>
      <button
        v-for="tag in selectedInterestTags"
        :key="`selected-${tag}`"
        type="button"
        class="inline-flex items-center gap-2 rounded-md bg-purple-100 px-2 py-1 body4 leading-none text-purple-600"
        @click="emit('remove', tag)"
      >
        {{ tag }} <span class="text-purple-600">x</span>
      </button>
    </div>
    <div class="mt-2 w-full rounded-xl border border-gray-200 bg-gray-100 shadow-sm p-2 max-h-56 overflow-y-auto flex flex-wrap gap-2 lg:bg-white">
      <button
        v-for="tag in interestTags"
        :key="tag"
        type="button"
        class="px-3 py-1.5 rounded-md body2 border transition"
        :class="selectedInterestTags.includes(tag)
          ? 'border-purple-300 bg-purple-100 text-purple-500'
          : 'border-gray-300 text-gray-700 hover:bg-gray-200'"
        :disabled="!selectedInterestTags.includes(tag) && selectedInterestTags.length >= max"
        @click="emit('toggle', tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

