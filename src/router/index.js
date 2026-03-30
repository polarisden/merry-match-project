import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import TestPage from '@/views/TestPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import MatchingPage from '@/views/MatchingPage.vue'
import ApiHealthPage from '@/views/ApiHealthPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/test', component: TestPage },
    { path: '/api-health', component: ApiHealthPage },
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
    { path: '/matching', component: MatchingPage },
    {
      path: '/chat/:contact?',
      name: 'chat-room',
      component: () => import('@/views/chat/ChatRoomPage.vue'),
    },
  ],
})

export default router
