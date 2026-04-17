import { defineStore } from "pinia";

export const usePlanStore = defineStore("plan", {
  state: () => ({
    selectedPlan: null,
  }),
  actions: {
    setPlan(plan) {
      this.selectedPlan = plan;
    },
    clearPlan() {
      this.selectedPlan = null;
    },
  },
});

