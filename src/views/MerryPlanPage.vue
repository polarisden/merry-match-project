<template>
  <div
    class="bg-bg-main w-full flex flex-col mt-[52px] lg:mt-[88px] px-[16px] py-[40px] gap-[43px] lg:px-[160px] lg:pt-[80px] lg:pb-[160px] lg:gap-[80px]"
  >
    <!-- Section: Membership header -->
    <header class="flex flex-col gap-[8px]">
      <p class="tagline text-beige-700">MERRY MEMBERSHIP</p>
      <h2
        v-for="(line, index) in desktopHeadingLines"
        :key="`desktop-${index}`"
        class="headline2 text-purple-500 hidden lg:block"
      >
        {{ line }}
      </h2>
      <h2
        v-for="(line, index) in mobileHeadingLines"
        :key="`mobile-${index}`"
        class="headline3 text-purple-500 block lg:hidden"
      >
        {{ line }}
      </h2>
    </header>
    <!-- Section: All plan — skeleton อยู่ใน MerryPlanCard (loading) เหมือน billing + UserBillingHistorySkeleton -->
    <div
      class="flex w-full min-w-0 flex-col gap-[24px] lg:flex-row lg:flex-wrap lg:content-start"
    >
      <template v-if="loading">
        <MerryPlanCard
          v-for="n in PACKAGE_LOADING_PLACEHOLDERS"
          :key="`plan-loading-${n}`"
          loading
        />
      </template>
      <template v-else>
        <MerryPlanCard
          v-for="merryPlan in merryPlans"
          :key="merryPlan.id"
          :merry-plan="merryPlan"
          :is-current="currentPlanId !== null && String(merryPlan.id) === currentPlanId"
          @select="handleSelectPlan"
        />
      </template>
    </div>
    <p v-if="error" class="body2 text-red-500">{{ error }}</p>
    <!-- Section: Footer-->
     <div>
        Footer
     </div>
  </div>
</template>

<script setup>
import MerryPlanCard from "../components/merryPlan/MerryPlanCard.vue";
import { computed, onMounted, ref } from "vue";
import { usePlan } from "../composables/usePlan";
import { getCurrentMembership } from "../api/membershipApi";

const desktopHeadingLines = [
  "Be part of Merry Membership",
  "to make more Merry!",
];
const mobileHeadingLines = ["Join us and start", "matching"];

const PACKAGE_LOADING_PLACEHOLDERS = Array.from({ length: 4 }, (_, i) => i);

function handleSelectPlan(merryPlan) {
  goToPaymentWithPlan(merryPlan);
}

const { plans: merryPlans, loading, error, fetchPlans, goToPaymentWithPlan } =
  usePlan();

const membership = ref(null);
const membershipError = ref("");
const currentPlanId = computed(() => {
  const m = membership.value;
  const id = m?.planId ?? m?.plan?.id;
  if (id == null || id === "") return null;
  return String(id);
});

onMounted(async () => {
  await Promise.all([ 
    fetchPlans(),
    (async () => {
      try {
        membershipError.value = "";
        membership.value = await getCurrentMembership();
      } catch (e) {
        // Membership may fail (e.g. unauthenticated). Plans still should load.
        membershipError.value = "Failed to load current membership";
        membership.value = null;
      }
    })(),
  ]);
});
</script>
<!-- Section: Payment method -


plan_id = แพ็กเกจที่ใช้อยู่ตอนนี้
pending_plan_id = แพ็กเกจที่ "กำลังจะเปลี่ยน"
🔄 ใช้ตอนไหน?
📌 กรณี: Upgrade แต่ยังไม่จ่ายเงิน
Step-by-step
1. user กด upgrade (Basic → Premium)

2. backend:
   → ยังไม่เปลี่ยน plan_id ❗
   → set pending_plan_id = premium
🧾 ตัวอย่างใน DB
{
  "plan_id": "basic",
  "pending_plan_id": "premium",
  "status": "active"
}

👉 แปลว่า:

ตอนนี้ยังใช้ Basic อยู่
แต่กำลังจะเปลี่ยนเป็น Premium
💳 หลังจากจ่ายเงินสำเร็จ

(ผ่าน webhook จาก Omise)

if payment success:
   plan_id = pending_plan_id
   pending_plan_id = null
🧾 กลายเป็นแบบนี้
{
  "plan_id": "premium",
  "pending_plan_id": null,
  "status": "active"
}
❌ ถ้าจ่ายไม่ผ่าน (สำคัญ)
payment fail:
   pending_plan_id = null
   plan_id = เหมือนเดิม

👉 user ยังใช้ของเดิมต่อ

🔁 รองรับ Retry Payment
pending_plan_id = premium

attempt 1 → fail ❌
attempt 2 → success ✅

→ ค่อย switch plan
🎯 ทำไมต้องมี pending_plan_id?
❌ ถ้าไม่มี (วิธีผิด)
user กด upgrade
→ update plan_id = premium ทันที ❌
→ แล้วค่อยไปจ่ายเงิน

👉 ถ้าจ่ายไม่ผ่าน = user ได้ของฟรี 💀

✅ วิธีถูก
pending_plan_id = premium
→ รอจ่ายเงิน
→ success ค่อยเปลี่ยนจริง

Section: Payment method -->