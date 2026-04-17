<script setup>
const props = defineProps({
  modelValue: { type: String, default: "" },
  max: { type: Number, default: 150 },
  label: { type: String, default: "About me" },
  placeholder: { type: String, default: "I know nothing..but you" },
  rows: { type: [Number, String], default: 4 },
})

const emit = defineEmits(["update:modelValue"])

function onInput(e) {
  const next = String(e?.target?.value ?? "")
  emit("update:modelValue", next.slice(0, props.max))
}
</script>

<template>
  <div class="lg:col-span-2">
    <label class="mb-1.5 flex items-center justify-between gap-3 body2">
      <span>{{ label }} (Maximum {{ max }} characters)</span>
      <span class="text-gray-500">{{ (modelValue || "").length }}/{{ max }}</span>
    </label>
    <textarea
      :value="modelValue"
      :rows="rows"
      class="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 body2 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200 lg:bg-white"
      :placeholder="placeholder"
      @input="onInput"
    />
  </div>
</template>

