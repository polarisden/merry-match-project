import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import TestPage from '@/views/TestPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/test', component: TestPage },
    { path: '/Register', component: RegisterPage },
  ],
})

export default router
