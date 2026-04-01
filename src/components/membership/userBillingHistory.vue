<template>
  <article class="flex flex-col pb-[24px] mb-[88px] lg:pt-[60px] lg:px-[160px]">
    <div
      class="flex flex-col py-[8px] lg:pb-[24px] border-b lg:border-0 border-gray-300 p-[16px]"
    >
      <div class="flex flex-row items-center gap-[8px]">
        <p class="headline4 text-gray-900">Billing history</p>
      </div>

      <p v-if="error" class="body2 text-red-500">{{ error }}</p>
      <p v-else-if="loading" class="body1 text-gray-700 lg:hidden">
        <span
          class="inline-block h-[22px] w-[220px] rounded bg-gray-200 animate-pulse"
        ></span>
      </p>
      <!--mobile nextbilling -->
      <p v-else class="body1 text-gray-700 pt-[8px] lg:hidden">
        Next billing : {{ billing.nextBillingDate }}
      </p>
    </div>
    <div
      class="bg-white pb-[24px] border-b lg:border border-gray-300 lg:rounded-[32px] lg:pt-[32px] lg:px-[32px]"
    >
      <p
        v-if="loading"
        class="hidden body1 text-gray-700 lg:flex py-[8px] border-b border-gray-300"
      >
        <span
          class="inline-block h-[22px] w-[220px] rounded bg-gray-200 animate-pulse"
        ></span>
      </p>
      <!--desktop nextbilling -->
      <p
        v-else
        class="hidden body1 text-gray-700 lg:flex py-[8px] border-b border-gray-300"
      >
        Next billing : {{ billing.nextBillingDate }}
      </p>
      <div class="lg:mt-[8px] lg:mb-[16px] max-h-[270px] lg:max-h-[380px] overflow-y-auto">
        <UserBillingHistorySkeleton v-if="loading" :row-count="SKELETON_ROW_COUNT" />
        <table
          v-else
          class="w-full lg:table-fixed lg:border-separate lg:border-spacing-0"
        >
          <tbody>
            <tr v-for="(row, index) in billing.rows" :key="row.id">
              <td
                class="body2 text-gray-700 p-[16px] lg:w-[104px] lg:whitespace-nowrap"
                :class="index % 2 === 1 ? 'bg-gray-100 lg:rounded-l-lg' : ''"
              >
                {{ row.date }}
              </td>
              <td
                class="body2 text-gray-700 p-[16px] lg:text-left lg:max-w-[609px]"
                :class="index % 2 === 1 ? 'bg-gray-100' : ''"
              >
                {{ row.packageName }}
              </td>
              <td
                class="body2 text-gray-800 p-[16px] text-right"
                :class="index % 2 === 1 ? 'bg-gray-100 lg:rounded-r-lg' : ''"
              >
                THB {{ formatAmount(row.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="hidden lg:flex flex-row justify-end py-[4px] px-[16px] lg:border-t pt-[16px] lg:border-gray-300"
      >
        <BaseButtonGhost
          class="w-fit [--btn-px:0px] [--btn-py:0px]"
          :disabled="loadingPDF"
          @click="handleRequestPdf"
        >
          Request PDF
        </BaseButtonGhost>
      </div>
    </div>
    <div class="lg:hidden flex flex-row justify-start py-[4px] px-[16px]">
      <BaseButtonGhost
        class="w-fit [--btn-px:0px] [--btn-py:0px]"
        :disabled="loadingPDF"
        @click="handleRequestPdf"
      >
        Request PDF
      </BaseButtonGhost>
    </div>
  </article>
</template>

<script setup>
import { onMounted, ref } from "vue";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";
import UserBillingHistorySkeleton from "./UserBillingHistorySkeleton.vue";
import { getBillingHistory } from "../../api/billingHistoryApi";
import { downloadBillingHistoryPdf } from "../../utils/downloadBillingHistoryPdf";

const emit = defineEmits(["requestPdf"]);

const SKELETON_ROW_COUNT = 5;

const loading = ref(false);
const error = ref("");
const loadingPDF = ref(false);
const billing = ref({
  nextBillingDate: "",
  rows: [],
});

const formatAmount = (amount) => Number(amount).toFixed(2);

onMounted(async () => {
  try {
    loading.value = true;
    error.value = "";
    billing.value = await getBillingHistory();
  } catch (e) {
    error.value = "Failed to load billing history";
  } finally {
    loading.value = false;
  }
});

async function handleRequestPdf() {
  try {
    loadingPDF.value = true;
    const fullBilling = await getBillingHistory();
    downloadBillingHistoryPdf(fullBilling);
    emit("requestPdf", fullBilling);
  } catch (e) {
    error.value = "Failed to load full billing history";
  } finally {
    loadingPDF.value = false;
  }
}
</script>
