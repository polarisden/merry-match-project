<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-gray-200">

    <div class="flex items-center justify-between px-[14px] py-[10px] lg:px-[160px]">
      <Logo />

      <!-- ================= MOBILE ================= -->
      <div class="flex items-center gap-3 md:hidden">

        <!-- Chat -->
        <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center relative">
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
          <HamburgerIcon />
        </button>
      </div>

      <!-- ================= MOBILE DROPDOWN ================= -->
      <div v-if="open"
        class="md:hidden fixed left-0 right-0 top-[74px] bottom-0 bg-white px-5 py-5 shadow-lg border-t overflow-y-auto z-40">
        <!-- ❌ ยังไม่ login -->
        <template v-if="!auth.isAuthenticated">
          <a href="#why" class="block py-2 text-gray-700">Why Merry Match?</a>
          <a href="#how" class="block py-2 text-gray-700">How to Merry</a>

          <RouterLink to="/login" @click="closeMenu">
            <button class="mt-4 w-full bg-red-500 text-white py-2 rounded-full">
              Login
            </button>
          </RouterLink>
        </template>

        <!-- ✅ login แล้ว -->
        <template v-else>
          <div class="mb-5">
            <button
              class="w-full body4 py-3 rounded-full text-white font-semibold text-sm bg-gradient-to-r from-[#742138] to-[#A878BF] shadow">
              ✨ More limit Merry!
            </button>
          </div>

          <!-- Menu (Mobile Dropdown) -->
          <div class="text-gray-700 body4 space-y-2">

            <RouterLink to="/profile/preview" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg">
              <Profile class="w-4 h-4" />
              <span>Profile</span>
            </RouterLink>

            <RouterLink to="/merry-list" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg">
              <Heart class="text-pink-100 w-4 h-4" />
              <span>Merry list</span>
            </RouterLink>

            <RouterLink to="/membership" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg">
              <Package class="w-4 h-4" />
              <span>Merry Membership</span>
            </RouterLink>

            <RouterLink to="/report" @click="closeMenu"
              class="flex items-center px-3 py-3 gap-3 hover:bg-gray-100 rounded-lg">
              <Compliant class="w-4 h-4" />
              <span>Compliant</span>
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

          <RouterLink to="/login">
            <button
              class="font-[Nunito] font-bold text-[16px] bg-red-500 hover:bg-red-700 text-white px-5 py-2 rounded-full">
              Login
            </button>
          </RouterLink>
        </template>

        <!-- ✅ login แล้ว -->
        <template v-else>
          <RouterLink to="/matching" class="font-[Nunito] font-bold text-[16px] text-red-700 hover:text-pink-500">
            Start Matching!
          </RouterLink>

          <RouterLink to="/membership" class="font-[Nunito] font-bold text-[16px] text-red-700 hover:text-pink-500">
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
              <div @click="toggleProfile" class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
                <img :src="profileImage" class="w-full h-full object-cover" />
              </div>

              <!-- Dropdown -->
              <div v-if="profileOpen" class="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-lg border p-4 z-50">
                <!-- Gradient Button -->
                <div class="mb-4">
                  <button
                    class="w-full body4 py-3 rounded-full text-white font-semibold text-sm bg-gradient-to-r from-[#742138] to-[#A878BF] shadow">
                    ✨ More limit Merry!
                  </button>
                </div>

                <!-- Menu -->
                <div class="body4 text-gray-700 space-y-1">
                  <RouterLink to="/profile/preview"
                    class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Profile class="w-4 h-4" />
                    <span>Profile</span>
                  </RouterLink>

                  <RouterLink to="/merry-list" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Heart class="text-pink-100 w-4 h-4" />
                    <span>Merry list</span>
                  </RouterLink>

                  <RouterLink to="/membership" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Package class="w-4 h-4" />
                    <span>Merry Membership</span>
                  </RouterLink>

                  <RouterLink to="/report" class="flex items-center px-3 py-2 gap-3 hover:bg-gray-100 rounded-lg">
                    <Compliant class="w-4 h-4" />
                    <span>Compliant</span>
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

import Logo from '@/assets/icons/logo.svg'
import ChatIcon from '@/assets/icons/chatnavbar.svg'
import BellIcon from '@/assets/icons/bellnavbar.svg'
import HamburgerIcon from '@/assets/icons/hamburger.svg'
import Logout from '@/assets/icons/logout.svg'
import Compliant from '@/assets/icons/complaint.svg'
import Heart from '@/assets/icons/heart.svg'
import Profile from '@/assets/icons/profile.svg'
import Package from '@/assets/icons/package.svg'

const auth = useAuthStore()

const open = ref(false)
const profileOpen = ref(false)
const unread = ref(0)

const profileImage = ref('https://i.pravatar.cc/100')

const toggleMenu = () => {
  open.value = !open.value
}

const toggleProfile = () => {
  profileOpen.value = !profileOpen.value
}

const closeMenu = () => {
  open.value = false
}

const handleLogout = () => {
  auth.clearToken()
  profileOpen.value = false
  open.value = false
}

onMounted(() => {
  auth.hydrate()
})
</script>