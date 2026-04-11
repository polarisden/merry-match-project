<script setup>
import { computed, ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import BaseButtonPrimary from "@/components/base/BaseButtonPrimary.vue"
import { submitUserReport } from "@/views/admin/reportApi"

const reportImage = new URL("../assets/icons/image_login.svg", import.meta.url).href

const authStore = useAuthStore()

const issue = ref("")
const description = ref("")
const sending = ref(false)
const errorMsg = ref("")
const successMsg = ref("")

const canSubmit = computed(() => issue.value.trim().length > 0 && description.value.trim().length > 0 && !sending.value)

async function submitReport() {
  errorMsg.value = ""
  successMsg.value = ""

  if (!issue.value.trim()) {
    errorMsg.value = "Please enter an issue."
    return
  }
  if (!description.value.trim()) {
    errorMsg.value = "Please enter a description."
    return
  }

  sending.value = true
  try {
    authStore.hydrate()
    const token = authStore.token
    await submitUserReport(
      { issue: issue.value.trim(), description: description.value.trim() },
      token,
    )
    issue.value = ""
    description.value = ""
    successMsg.value = "Submitted. Thank you for the report."
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : "Submit failed"
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-200 flex justify-start lg:justify-center">
    <div class="w-full max-w-[390px] lg:max-w-[1200px] mx-auto px-4 pt-6 pb-10 lg:px-10 lg:pt-12 lg:pb-16 lg:flex lg:justify-center">
      <div class="lg:grid lg:grid-cols-[420px_1fr] lg:items-center lg:gap-x-[100px]">
        <!-- image mobile -->
        <div class="flex justify-center lg:justify-start lg:hidden">
          <img
            :src="reportImage"
            alt="Report illustration"
            class="w-[177px] h-[266px] lg:w-[450px] lg:h-[677px] rounded-full object-cover"
          />
        </div>
        <div class="mt-7 lg:mt-0 lg:max-w-[520px]">
          <p class="text-[14px] tracking-wide uppercase text-beige-700 tagline">
            complaint
          </p>

          <h1 class="mt-2 text-purple-500 text-[42px] leading-[1.03] headline3 tracking-[-0.02em]">
            If you have any trouble
            <br />
            Don't be afraid to tell us!
          </h1>

          <form
            class="mt-8 space-y-6"
            @submit.prevent="submitReport"
          >
            <div>
              <label
                for="report-issue"
                class="block text-[14px] leading-[1.2] text-gray-900 body4"
              >
                Issue
              </label>
              <input
                id="report-issue"
                v-model="issue"
                type="text"
                placeholder="Place Holder"
                class="mt-2 w-full h-11 rounded-lg border body2 border-gray-200 bg-white px-3 text-[16px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label
                for="report-description"
                class="block text-[14px] leading-[1.2] text-gray-900 body4"
              >
                Description
              </label>
              <textarea
                id="report-description"
                v-model="description"
                rows="6"
                placeholder="Place Holder"
                class="mt-2 w-full min-h-[176px] resize-none rounded-lg border body2 border-gray-200 bg-white px-3 py-3 text-[16px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <p
              v-if="errorMsg"
              class="text-red-600 body4"
              role="alert"
            >
              {{ errorMsg }}
            </p>
            <p
              v-if="successMsg"
              class="text-green-700 body4"
              role="status"
            >
              {{ successMsg }}
            </p>
            <div class="mt-1 hidden lg:block">
              <BaseButtonPrimary
                :disabled="!canSubmit"
                type="submit"
              >
                {{ sending ? "Submitting..." : "Submit" }}
              </BaseButtonPrimary>
            </div>

            <div class="mt-1 lg:hidden">
              <BaseButtonPrimary
                :disabled="!canSubmit"
                type="submit"
                class="w-full"
              >
                {{ sending ? "Submitting..." : "Submit" }}
              </BaseButtonPrimary>
            </div>
          </form>
        </div>
        <!-- image desktop -->
        <div class=" hidden lg:flex lg:justify-start lg:w-[450px]">
          <img
            :src="reportImage"
            alt="Report illustration"
            class="w-[177px] h-[266px] lg:w-[450px] lg:h-[677px] rounded-full object-cover"
          />
        </div>
      </div>
    </div>
  </div>
</template>

