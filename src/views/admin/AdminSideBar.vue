<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

import LogoIcon from "@/assets/icons/logo.svg"
import PackageIcon from "@/assets/icons/package.svg"
import ComplaintIcon from "@/assets/icons/complaint.svg"
import LogoutIcon from "@/assets/icons/logout.svg"

const route = useRoute()
const router = useRouter()

const active = computed(() => String(route.name || ""))

function go(path) {
  router.push(path)
}
</script>

<template>
  <div class="min-h-dvh w-full bg-gray-100">
    <div class="grid min-h-dvh w-full grid-cols-[260px_minmax(0,1fr)]">
      <!-- Sidebar -->
      <aside class="min-h-dvh bg-white border-r border-gray-100">
          <div class="px-6 pt-6 pb-4 flex flex-col mx-auto gap-4">
            <div class="h-10 flex mx-auto cursor-pointer" @click="go('/')">
              <LogoIcon class="h-20 w-42" aria-hidden="true" />
            </div>
            <p class="body2 text-gray-700 text-center">
              Admin Panel Control
            </p>
          </div>

          <nav class="py-10">
            <button
              type="button"
              class="w-full p-4 text-left hover:bg-gray-50 hover:cursor-pointer"
              :class="active === 'admin-packages' ? 'bg-gray-100' : ''"
              @click="go('/admin/packages')"
            >
              <span class="flex items-center gap-4">
                <PackageIcon class="h-6 w-6 text-gray-500" />
                <span class="body3 text-gray-700">Merry Package</span>
              </span>
            </button>

            <button
              type="button"
              class="w-full p-4 text-left hover:cursor-pointer"
              :class="active.startsWith('admin-complaints') ? 'bg-gray-100' : ''"
              @click="go('/admin/complaints')"
            >
              <span class="flex items-center gap-4">
                <ComplaintIcon class="h-6 w-6 text-pink-500" />
                <span class="body3 text-gray-800">Complaint</span>
              </span>
            </button>
          </nav>

          <div class="mt-120 border-t border-gray-300">
            <button
              type="button"
              class="w-full p-6 text-left hover:bg-gray-50 hover:cursor-pointer"
              @click="go('/')"
            >
              <span class="flex items-center gap-3">
                <LogoutIcon class="h-5 w-5 text-pink-500" aria-hidden="true" />
                <span class="body3 text-gray-800">Log out</span>
              </span>
            </button>
          </div>
      </aside>

      <!-- Main -->
      <main class="min-w-0 min-h-dvh">
        <RouterView />
      </main>
    </div>
  </div>
</template>

