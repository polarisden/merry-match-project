import { createRouter, createWebHistory } from 'vue-router'
import TestPage from '@/views/TestPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/test', component: TestPage,
    },
  ],
})

export default router
