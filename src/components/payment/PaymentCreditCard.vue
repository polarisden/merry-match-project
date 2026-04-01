<template>
  <section class="flex flex-col border border-gray-400 lg:w-[548px] lg:rounded-[24px]">
    <div class="flex flex-row h-[78px] p-[24px] bg-gray-100 lg:rounded-t-[24px] justify-between">
      <span class="body1 text-gray-700">Credit Card</span>
      <span class="body1 text-gray-700">logo visa</span>
    </div>
    <div class="flex flex-col py-[24px] px-[16px] gap-[40px]">
      <span class="body1 text-gray-700">Body label + input1</span>
      <span class="body1 text-gray-700">Body label + input2</span>
      <span class="body1 text-gray-700">Body label + input3</span>
    </div>
    <div class="flex flex-row justify-between py-[24px] px-[32px] border-t border-gray-400">
      <BaseButtonGhost
        class="w-fit [--btn-px:0px]"
        :disabled="paying"
        @click="$emit('cancel')"
      >
        Cancel
      </BaseButtonGhost>

      <BaseButtonPrimary
        class="w-fit"
        :disabled="paying"
        @click="$emit('pay')"
      >
        {{
          loading ? "Loading..." : paying ? "Processing..." : "payment confirm"
        }}
      </BaseButtonPrimary>
    </div>
  </section>
</template>

<script setup>
import BaseButtonPrimary from "../base/BaseButtonPrimary.vue";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  paying: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["pay", "cancel"]);
</script>
