<template>
  <nav class="sticky top-0 z-50 bg-white border-b border-gray-200">

    <div class="flex items-center justify-between px-[14px] py-[10px] lg:px-[160px]">
      <Logo />

      <!-- ================= MOBILE ================= -->
      <div class="flex items-center gap-3 md:hidden">

        <!-- Chat -->
        <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <ChatIcon />
        </div>

        <!-- ✅ Bell (เฉพาะตอน login) -->
        <div
          v-if="isLoggedIn"
          class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center relative">
          <BellIcon />

          <!-- dot -->
          <span
            v-if="unread > 0"
            class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-pink-500 rounded-full">
          </span>
        </div>

        <!-- Hamburger -->
        <button @click="toggleMenu">
          <HamburgerIcon />
        </button>
      </div>

      <!-- ================= DESKTOP ================= -->
      <div class="hidden md:flex items-center gap-8 text-sm font-medium">

        <a href="#why" class="text-gray-700 hover:text-pink-500">
          Why Merry Match?
        </a>
        <a href="#how" class="text-gray-700 hover:text-pink-500">
          How to Merry
        </a>

        <!-- ❌ ยังไม่ login -->
        <button
          v-if="!isLoggedIn"
          class="bg-red-500 hover:bg-red-700 text-white px-5 py-2 rounded-full">
          Login
        </button>

        <!-- ✅ login แล้ว -->
        <div v-else class="flex items-center gap-4">

          <!-- Bell -->
          <div class="relative w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <BellIcon />
            <span
              v-if="unread > 0"
              class="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full">
            </span>
          </div>

          <!-- Profile -->
          <div class="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
            <img :src="profileImage" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <!-- ================= DROPDOWN ================= -->
    <div
      v-if="open"
      class="md:hidden absolute top-full left-0 w-full bg-white px-5 py-5 shadow-lg border-t">

      <!-- ❌ ยังไม่ login -->
      <template v-if="!isLoggedIn">
        <a href="#why" class="block py-2 text-gray-700">Why Merry Match?</a>
        <a href="#how" class="block py-2 text-gray-700">How to Merry</a>

        <button
          class="mt-4 w-full bg-red-500 hover:bg-pink-500 text-white py-2 rounded-full">
          Login
        </button>
      </template>

      <!-- ✅ login แล้ว (เหมือนรูป) -->
      <template v-else>

        <!-- Gradient Button -->
        <div class="mb-5">
          <button
            class="w-full py-3 rounded-full text-white font-semibold text-sm
                   bg-gradient-to-r from-[#7B1E3A] to-[#A855F7] shadow">
            ✨ More limit Merry!
          </button>
        </div>

        <!-- Menu -->
        <div class="space-y-4 text-gray-600">

          <div class="flex items-center gap-3">
            <img :src="Profile" class="text-pink-400>">
            <span>Profile</span>
          </div>

          <div class="flex items-center gap-3">
            <img :src="Heart" class="text-pink-400>">
            <span>Merry list</span>
          </div>

          <div class="flex items-center gap-3">
            <img :src="Package" class="text-pink-400>">
            <span>Merry Membership</span>
          </div>

          <div class="flex items-center gap-3">
            <img :src="Compliant" class="text-pink-400>">
            <span>Compliant</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t my-5"></div>

        <!-- Logout -->
        <div class="flex items-center gap-3 text-gray-500">
          <img :src="Logout">
          <span>Log out</span>
        </div>

      </template>
    </div>

  </nav>
</template>

<script setup>
import { ref } from 'vue'

import Logo from '@/assets/icons/logo.svg'
import ChatIcon from '@/assets/icons/chatnavbar.svg'
import BellIcon from '@/assets/icons/bellnavbar.svg'
import HamburgerIcon from '@/assets/icons/hamburger.svg'
import Logout from '@/assets/icons/logout.svg'
import Compliant from '@/assets/icons/complaint.svg'
import Heart from '@/assets/icons/heart.svg'
import Profile from '@/assets/icons/profile.svg'
import Package from '@/assets/icons/package.svg'

// state
const open = ref(false)
const isLoggedIn = ref(false) // 🔥 เปลี่ยน false เพื่อ test
const unread = ref(2)

const profileImage = ref('https://i.pravatar.cc/100')

const toggleMenu = () => {
  open.value = !open.value
}
</script>