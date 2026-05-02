<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-gray-200">

    <div class="flex items-center justify-between px-[14px] lg:px-[160px] h-[52px] lg:h-[88px]">
      <RouterLink to="/"><Logo class="w-[112px] h-[38px] lg:w-[167px] lg:h-[56px]" /></RouterLink>

      <!-- ================= MOBILE ================= -->
      <div class="flex items-center gap-3 md:hidden">

        <!-- Chat -->
        <div v-if="auth.isAuthenticated"
          class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center relative cursor-pointer" @click="$router.push('/matching/messages')">
          <ChatIcon />
          <span v-if="unread > 0" class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
        </div>

        <!-- Bell -->
        <div v-if="auth.isAuthenticated"
          class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center relative">
          <BellIcon />
          <span v-if="unread > 0" class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
        </div>

        <!-- Hamburger -->
        <button @click="toggleMenu">
          <HamburgerIcon class="hover:cursor-pointer"/>
        </button>
      </div>

      <!-- ================= MOBILE DROPDOWN ================= -->
      <div v-if="open"
        class="md:hidden fixed left-0 right-0 top-[52px] bottom-0 bg-white px-5 py-5 shadow-lg border-t overflow-y-auto z-40">
        <!-- ❌ ยังไม่ login -->
        <template v-if="!auth.isAuthenticated">
          <a href="#why" class="block py-2 text-gray-700">Why Merry Match?</a>
          <a href="#how" class="block py-2 text-gray-700">How to Merry</a>

          <RouterLink to="/Login" @click="closeMenu">
            <button class="mt-4 w-full bg-red-500 text-white py-2 rounded-full hover:cursor-pointer">
              Login
            </button>
          </RouterLink>
        </template>

        <!-- ✅ login แล้ว -->
        <template v-else>
          <div class="mb-5">
            <RouterLink to="/merry-plan">
              <button
                class="w-full body4 py-3 rounded-full text-white font-semibold text-sm bg-gradient-to-r from-[#742138] to-[#A878BF] shadow">
                ✨ More limit Merry!
              </button>
            </RouterLink>
          </div>

          <!-- Menu (Mobile Dropdown) -->
          <div class="text-gray-700 body4 space-y-2">

            <RouterLink to="/profile/edit" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg hover:cursor-pointer">
              <Profile class="w-4 h-4" />
              <span>Profile</span>
            </RouterLink>

            <RouterLink to="/merry-list" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg hover:cursor-pointer">
              <Heart class="text-pink-100 w-4 h-4" />
              <span>Merry list</span>
            </RouterLink>

            <RouterLink to="/membership" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg hover:cursor-pointer">
              <Package class="text-pink-100 w-4 h-4" />
              <span>Merry Membership</span>
            </RouterLink>

            <RouterLink to="/report" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg hover:cursor-pointer">
              <Compliant class="w-4 h-4" />
              <span>Compliant</span>
            </RouterLink>

            <RouterLink v-if="isAdmin" to="/admin" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg hover:cursor-pointer">
              <AdminPanel class="w-4 h-4" />
              <span>Admin Panel</span>
            </RouterLink>

          </div>

          <div class="border-t my-2"></div>

          <div @click="handleLogout" class="flex items-center px-3 py-3 gap-3 cursor-pointer">
            <Logout class=" w-4 h-4" />
            <span class="text-gray-700 body4">Log out</span>
          </div>
        </template>
      </div>

      <!-- ================= DESKTOP ================= -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium">

        <!-- ❌ ยังไม่ login -->
        <template v-if="!auth.isAuthenticated">
          <a href="#why" class="font-[Nunito] font-bold text-[16px] text-red-700 hover:text-pink-500">
            Why Merry Match?
          </a>
          <a href="#how" class="font-[Nunito] font-bold text-[16px] text-red-700 hover:text-pink-500">
            How to Merry
          </a>

          <RouterLink to="/Login">
            <button
              class="font-[Nunito] font-bold text-[16px] bg-red-500 hover:bg-red-700 text-white px-5 py-2 rounded-full hover:cursor-pointer">
              Login
            </button>
          </RouterLink>
        </template>

        <!-- ✅ login แล้ว -->
        <template v-else>
          <RouterLink to="/matching" class="font-[Nunito] font-bold text-[16px] text-red-700 hover:text-pink-500">
            Start Matching!
          </RouterLink>

          <RouterLink to="/merry-plan" class="font-[Nunito] font-bold text-[16px] text-red-700 hover:text-pink-500">
            Merry Membership
          </RouterLink>

          <div class="flex items-center gap-4">

            <!-- Bell -->
            <div class="relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <BellIcon />
              <span v-if="unread > 0" class="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
            </div>

            <!-- Profile -->
            <div class="relative">
              <div
                ref="profileBtnEl"
                @click="toggleProfile"
                class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer"
              >
                <img :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
              </div>

              <!-- Dropdown -->
              <div
                v-if="profileOpen"
                ref="profileDropdownEl"
                class="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-lg border p-4 z-50"
              >
                <!-- Gradient Button -->
                <div class="mb-4">
                  <RouterLink to="/merry-plan">
                    <button
                      class="w-full body4 py-3 rounded-full text-white font-semibold text-sm bg-gradient-to-r from-[#742138] to-[#A878BF] shadow cursor-pointer hover:scale-105">
                      ✨ More limit Merry!
                    </button>
                  </RouterLink>
                </div>

                <!-- Menu -->
                <div class="body4 text-gray-700 space-y-1">
                  <RouterLink to="/profile/edit" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Profile class="w-4 h-4" />
                    <span>Profile</span>
                  </RouterLink>

                  <RouterLink to="/merry-list" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Heart class="text-pink-100 w-4 h-4" />
                    <span>Merry list</span>
                  </RouterLink>

                  <RouterLink to="/membership" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Package class="text-pink-100 w-4 h-4" />
                    <span>Merry Membership</span>
                  </RouterLink>

                  <RouterLink to="/report" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Compliant class="w-4 h-4" />
                    <span>Compliant</span>
                  </RouterLink>

                  <RouterLink v-if="isAdmin" to="/admin" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <AdminPanel class="w-4 h-4" />
                    <span>Admin Panel</span>
                  </RouterLink>
                </div>

                <div class="border-t my-3"></div>

                <!-- Logout -->
                <div @click="handleLogout"
                  class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <Logout class="w-4 h-4" />
                  <span class="text-gray-700 body4">Log out</span>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>
    </div>
  </nav>
</template>

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyProfile } from '@/views/profile/profileApi'
import Logo from '@/assets/icons/logo.svg'
import ChatIcon from '@/assets/icons/chatnavbar.svg'
import BellIcon from '@/assets/icons/bellnavbar.svg'
import HamburgerIcon from '@/assets/icons/hamburger.svg'
import Logout from '@/assets/icons/logout.svg'
import Compliant from '@/assets/icons/complaint.svg'
import Heart from '@/assets/icons/heart.svg'
import Profile from '@/assets/icons/profile.svg'
import Package from '@/assets/icons/package.svg'
import AdminPanel from '@/assets/icons/admin-panel.svg'

const auth = useAuthStore()
const router = useRouter()

const open = ref(false)
const profileOpen = ref(false)
const unread = ref(0)

const profileImage = ref('')
const isAdmin = ref(false)
const profileBtnEl = ref(/** @type {HTMLElement | null} */ (null))
const profileDropdownEl = ref(/** @type {HTMLElement | null} */ (null))

const toggleMenu = () => {
  open.value = !open.value
}

const toggleProfile = () => {
  profileOpen.value = !profileOpen.value
}

const closeMenu = () => {
  open.value = false
}

function closeProfileDropdown() {
  profileOpen.value = false
}

const handleLogout = () => {
  auth.clearToken()
  profileOpen.value = false
  open.value = false
  router.replace('/Login')
}

const fetchProfileImage = async () => {
  try {
    auth.hydrate()
    const token = auth.token
    if (!token) return

    const me = await getMyProfile(token)
    const imageUrl = me.mainImage
      ?? me.images?.find(img => img.primary)?.imageUrl
      ?? me.images?.[0]?.imageUrl
      ?? null

    profileImage.value = imageUrl ?? 'https://i.pravatar.cc/100'
    isAdmin.value = String(me.role ?? '').trim().toLowerCase() === 'admin'

  } catch (err) {
    console.error('โหลดรูปพัง:', err)
  }
}

onMounted(async () => {
  await auth.hydrate()
  fetchProfileImage()

  const onPointerDownCapture = (e) => {
    if (!profileOpen.value) return
    const target = /** @type {Node | null} */ (e?.target ?? null)
    if (!target) return
    const btn = profileBtnEl.value
    const dd = profileDropdownEl.value
    if (btn?.contains(target)) return
    if (dd?.contains(target)) return
    closeProfileDropdown()
  }

  const onKeyDown = (e) => {
    if (!profileOpen.value) return
    if (e?.key === 'Escape') closeProfileDropdown()
  }

  // Use capture so we still close even if inner components stop propagation.
  document.addEventListener('pointerdown', onPointerDownCapture, true)
  document.addEventListener('keydown', onKeyDown)

  onUnmounted(() => {
    document.removeEventListener('pointerdown', onPointerDownCapture, true)
    document.removeEventListener('keydown', onKeyDown)
  })
})

</script>