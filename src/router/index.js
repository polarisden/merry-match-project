import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import TestPage from '@/views/TestPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import LoginPage from '@/views/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/test', component: TestPage },
    { path: '/Register', component: RegisterPage },
    {
      path: '/profile',
      children: [
        {
          path: 'preview',
          name: 'preview-profile',
          component: () => import('@/views/profile/MyPreviewProfilePage.vue'),
        },
        {
          path: 'edit',
          name: 'edit-profile',
          component: () => import('@/views/profile/EditProfilePage.vue')
        }
      ]
    },
    { path: '/Login', component: LoginPage },
  ],
})

export default router
