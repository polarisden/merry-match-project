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

    <div class="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-1 lg:gap-4">
      <button
        v-for="(slot, index) in photoSlots"
        :key="slot.key"
        type="button"
        class="w-[167px] lg:w-[167px] h-[167px] lg:h-[167px] rounded-xl bg-gray-200/80 flex flex-col items-center justify-center text-purple-500 relative overflow-visible"
        @click="triggerPhotoPicker"
      >
        <div
          v-if="slot.previewUrl"
          class="absolute inset-0 overflow-hidden rounded-xl"
        >
          <img
            :src="slot.previewUrl"
            alt=""
            class="w-full h-full object-cover"
          />
        </div>

        <button
          v-if="slot.previewUrl"
          type="button"
          aria-label="Remove photo"
          class="absolute -top-3 -right-2 z-20 w-6 h-6 rounded-full bg-[#AF2758] flex items-center justify-center text-white"
          @click.stop="removePhotoAt(index)"
        >
          X
        </button>

        <div class="relative z-10">
          <span
            v-if="!slot.previewUrl"
            class="text-[26px] leading-none"
          >
            +
          </span>
          <span
            v-if="!slot.previewUrl"
            class="text-[13px] mt-1"
          >
            {{ slot.label }}
          </span>
        </div>
      </button>
    </div>

    <p
      v-if="registerError"
      class="mt-3 rounded-lg border border-red-200 bg-red-100 px-3 py-2 body2 text-red-700"
      role="alert"
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
  removePhotoAt: { type: Function, required: true },
})
</script>
