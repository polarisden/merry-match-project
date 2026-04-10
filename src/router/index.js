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
      path: '/matching/messages',
      name: 'matching-messages',
      component: () => import('@/components/ListWithMatchPageMobile.vue'),
    },
    {
      path: '/chat/:contact?',
      name: 'chat-room',
      redirect: (to) => {
        const qRoom = typeof to.query.room === 'string' ? to.query.room.trim() : ''
        const contact = typeof to.params.contact === 'string' ? to.params.contact.trim() : ''
        const uuidRe =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        const room = qRoom || (uuidRe.test(contact) ? contact : '')
        const nextQuery = { ...to.query }
        if (room) nextQuery.room = room
        return { path: '/matching', query: nextQuery }
      },
    },
  ],
})

export default router
