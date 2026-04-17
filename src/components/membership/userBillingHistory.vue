<template>
  <article class="flex flex-col pb-[24px] mb-[88px] lg:pt-[60px] lg:px-[160px]">
    <div
      class="flex flex-col py-[8px] px-[16px] lg:px-0 lg:pb-[24px] border-b lg:border-0 border-gray-300 "
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
      <p v-else class="body1 text-gray-700 pt-[8px] lg:hidden">
        Next billing : {{ displayNextBilling }}
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
      <p
        v-else
        class="hidden body1 text-gray-700 lg:flex py-[8px] border-b border-gray-300"
      >
        Next billing : {{ displayNextBilling }}
      </p>
      <div class="lg:mt-[8px] lg:mb-[16px] max-h-[270px] lg:max-h-[380px] overflow-y-auto">
        <UserBillingHistorySkeleton v-if="loading" :row-count="SKELETON_ROW_COUNT" />
        <p
          v-else-if="rows.length === 0"
          class="body2 text-gray-600 p-[16px]"
        >
          No billing history yet.
        </p>
        <table
          v-else
          class="w-full lg:table-fixed lg:border-separate lg:border-spacing-0"
        >
          
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td
                class="body2 text-gray-700 p-[16px] lg:w-[104px] lg:whitespace-nowrap"
                :class="index % 2 === 1 ? 'bg-gray-100 lg:rounded-l-lg' : ''"
              >
                {{ formatBilledAt(row.billedAt) }}
              </td>
              <td
                class="body2 text-gray-700 p-[16px] lg:text-left lg:max-w-[609px]"
                :class="index % 2 === 1 ? 'bg-gray-100' : ''"
              >
                {{ row.planName }}
              </td>
              <td
                class="body2 text-gray-800 p-[16px] text-right"
                :class="index % 2 === 1 ? 'bg-gray-100 lg:rounded-r-lg' : ''"
              >
              THB {{ formatAmountThb(row.amountSatang) }}
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
          :disabled="loadingPDF || loading"
          @click="handleRequestPdf"
        >
          Request PDF
        </BaseButtonGhost>
      </div>
    </div>
    <div class="lg:hidden flex flex-row justify-start py-[4px] px-[16px]">
      <BaseButtonGhost
        class="w-fit [--btn-px:0px] [--btn-py:0px]"
        :disabled="loadingPDF || loading"
        @click="handleRequestPdf"
      >
        Request PDF
      </BaseButtonGhost>
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import BaseButtonGhost from "../base/BaseButtonGhost.vue";
import UserBillingHistorySkeleton from "./UserBillingHistorySkeleton.vue";
import { getBillingHistory } from "../../api/billingHistoryApi";
import { downloadBillingHistoryPdf } from "../../utils/downloadBillingHistoryPdf";

const emit = defineEmits(["requestPdf"]);

const props = defineProps({
  /** จาก membership (normalize) — ข้อความแสดงวันถัดบิล */
  nextBillingDate: {
    type: String,
    default: "",
  },
});

const SKELETON_ROW_COUNT = 5;

const loading = ref(false);
const error = ref("");
const loadingPDF = ref(false);
const rows = ref([]);

const displayNextBilling = computed(() =>
  props.nextBillingDate?.trim() ? props.nextBillingDate : "—",
);

/** DD/MM/YYYY */
function formatBilledAt(iso) {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatAmountThb(amountSatang) {
  return (Number(amountSatang ?? 0) / 100).toFixed(2);
}

onMounted(async () => {
  try {
    loading.value = true;
    error.value = "";
    rows.value = await getBillingHistory();
  } catch (e) {
    error.value = "Failed to load billing history";
    rows.value = [];
  } finally {
    loading.value = false;
  }
});

function handleRequestPdf() {
  try {
    loadingPDF.value = true;
    downloadBillingHistoryPdf({
      nextBillingDate: displayNextBilling.value,
      rows: rows.value,
    });
    emit("requestPdf", { rows: rows.value });
  } catch (e) {
    error.value = "Failed to generate PDF";
  } finally {
    loadingPDF.value = false;
  }
}
</script>
