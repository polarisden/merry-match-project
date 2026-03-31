<template>
  <div class="mt-2">
    <p class="mt-1 body2 text-gray-700">
      Upload at least 2 photos
    </p>

    <input
      :ref="setPhotoInputRef"
      id="register-photo-input"
      type="file"
      accept="image/*"
      multiple
      class="sr-only"
      @change="handleSelectedPhotos"
    />

    <div class="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4">
      <button
        v-for="slot in photoSlots"
        :key="slot.key"
        type="button"
        class="h-[120px] lg:h-[156px] rounded-xl bg-gray-200/80 flex flex-col items-center justify-center text-purple-500 relative overflow-hidden"
        @click="triggerPhotoPicker"
      >
        <img
          v-if="slot.previewUrl"
          :src="slot.previewUrl"
          alt=""
          class="absolute inset-0 w-full h-full object-cover"
        />
        <div class="relative z-10">
          <span
            v-if="!slot.previewUrl"
            class="text-[26px] leading-none"
          >
            +
          </span>
          <span class="text-[13px] mt-1">{{ slot.label }}</span>
        </div>
      </button>
    </div>

    <p
      v-if="registerError"
      class="mt-3 text-red-500 text-sm"
    >
      {{ registerError }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  registerError: { type: String, required: true },
  photoSlots: { type: Array, required: true },
  triggerPhotoPicker: { type: Function, required: true },
  handleSelectedPhotos: { type: Function, required: true },
  setPhotoInputRef: { type: Function, required: true },
})
</script>
