import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyProfile } from '@/views/profile/profileApi'
import HomePage from '@/views/HomePage.vue'
import TestPage from '@/views/TestPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import MembershipPage from '../views/MembershipPage.vue'
import MatchingPage from '@/views/MatchingPage.vue'
import ApiHealthPage from '@/views/ApiHealthPage.vue'
import ReportPage from '@/views/ReportPage.vue'
import AdminSideBar from '@/views/admin/AdminSideBar.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage, meta: { useOwnChrome: true } },
    { path: '/test', component: TestPage },
    { path: '/api-health', component: ApiHealthPage },
    { path: '/Register', component: RegisterPage, meta: { hideFooter: true } },
    {
      path: '/profile',
      children: [
        {
          path: 'preview',
          name: 'preview-profile',
          component: () => import('@/views/profile/MyPreviewProfilePage.vue'), meta: { hideFooter: true }
        },
        {
          path: 'edit',
          name: 'edit-profile',
          component: () => import('@/views/profile/EditProfilePage.vue')
        } 
      ]
    },
    { path: '/Login', component: LoginPage , meta: { hideFooter: true } },
    { path: '/report', component: ReportPage },
    {
      path: '/admin',
      meta: { requiresAdmin: true, useOwnChrome: true }, //เฉพาะ admin ที่เข้า path นี้ได้
      component: AdminSideBar,
      children: [
        {
          path: '',
          redirect: '/admin/packages',
        },
        {
          path: 'packages',
          name: 'admin-packages',
          component: () => import('@/views/admin/AdminMerryPackage.vue'),
        },
        {
          path: 'complaints',
          name: 'admin-complaints',
          component: () => import('@/views/admin/AdminComplaintListPage.vue'),
        },
        {
          path: 'complaints/:id',
          name: 'admin-complaints-detail',
          component: () => import('@/views/admin/AdminComplaintDetailPage.vue'),
        },
      ],
    },
    { path: '/matching', component: MatchingPage, meta: { hideFooter: true }  },
    {
      path: '/merry-list',
      name: 'merry-list',
      component: () => import('@/views/MerryList.vue'),
    },
    {
      path: '/matching/messages',
      name: 'matching-messages',
      component: () => import('@/components/ListWithMatchPageMobile.vue'),
      meta: { hideFooter: true },
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
    {
      path: '/merry-plan',
      children: [
        {
          path: '',
          name: 'merry-plan',
          component: () => import('@/views/MerryPlanPage.vue'),
        },
        {
          path: 'payment',
          name: 'merry-plan-payment',
          component: () => import('@/views/PaymentPage.vue'),
        },
        {
          path: 'payment-success',
          name: 'merry-plan-payment-success',
          component: () => import('@/views/PaymentSuccessPage.vue'),
        },
      ],
    },

    { path: '/membership', component: MembershipPage },
  ],
})

router.beforeEach(async (to) => {
  if (!to.matched.some((r) => r.meta?.requiresAdmin)) return true

  const authStore = useAuthStore()
  authStore.hydrate()

  if (!authStore.token) {
    return { path: '/Login', query: { redirect: to.fullPath } }
  }

  try {
    const profile = await getMyProfile(authStore.token)
    const role = String(profile?.role ?? '').trim().toLowerCase()
    if (role !== 'admin') {
      return { path: '/' }
    }
  } catch {
    return { path: '/Login', query: { redirect: to.fullPath } }
  }

  return true
})

export default router
