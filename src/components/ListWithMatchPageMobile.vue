<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
import mathNsearchLogo from '@/assets/icons/vector.svg'
import merryMatchLogo from '@/assets/icons/merry_match.svg'
import profile1Img from '@/assets/images/profile1.png'
import profile2Img from '@/assets/images/profile2.png'
import faceImg from '@/assets/images/face.png'

const selectedChat = ref(null)

// Merry Match list
const merryMatches = ref([
  { id: 1, img: profile1Img, name: 'Name ja' },
  { id: 2, img: profile2Img, name: 'Name ja' },
  { id: 3, img: faceImg, name: 'Name ja' },
  { id: 4, img: profile1Img, name: 'Name ja' },
  { id: 5, img: profile1Img, name: 'Name ja' },
  { id: 6, img: profile2Img, name: 'Name ja' },
  { id: 7, img: faceImg, name: 'Name ja' },
  { id: 8, img: profile1Img, name: 'Name ja' },
  { id: 9, img: profile1Img, name: 'Name ja' },
  { id: 10, img: profile2Img, name: 'Name ja' },
  { id: 11, img: faceImg, name: 'Name ja' },
  { id: 12, img: profile1Img, name: 'Name ja' },
])
</script>

<template>
  <div class="lg:hidden flex flex-col gap-6 px-4 py-6">
    <div class="h-[171px] flex items-center justify-cente">
      <div class="flex flex-col items-center gap-1 p-6 border border-purple-500 rounded-[16px] bg-gray-100 cursor-pointer active:opacity-80" @click="router.push('/matching')">
        <mathNsearchLogo class="w-[62px] h-[59px]" />
        <span class="block text-red-600 headline4">Discover New Match</span>
        <span class="w-[calc(94%)] body4 text-gray-700 text-center">Start find and Merry to get know and connect with
          new friend!</span>
      </div>
    </div>

    <div class="flex flex-col gap-4 h-[146px]">
      <span class="headline4 text-gray-900">Merry Match!</span>
      <div class="flex gap-[12px] overflow-x-auto scrollbar-hide">
        <div v-for="match in merryMatches" :key="match.id" class="relative shrink-0">
          <img :src="match.img" class="size-[100px] object-cover rounded-[24px]">
          <merryMatchLogo class="text-red-400 absolute right-0 bottom-0 w-[34px] h-5 stroke-4" />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <span class="headline4 text-gray-900">Chat with Merry Match</span>
      <!-- chat message -->
      <div class="flex flex-col gap-2">
        <div class="h-[92px] py-4 px-3 flex gap-3 items-center cursor-pointer rounded-[16px] border border-white"
          :class="selectedChat === 1 ? 'border-purple-500! bg-gray-100' : ''" @click="selectedChat = 1">
          <img src="@/assets/images/profile1.png" class="size-[60px] object-cover rounded-full" />
          <div class="flex flex-col gap-[2px]">
            <span class="body2 text-gray-900">Name ja</span>
            <span class="body4 text-gray-700">Hello World!</span>
          </div>
        </div>
        <div class="h-[92px] py-4 px-3 flex gap-3 items-center cursor-pointer rounded-[16px] border border-white"
          :class="selectedChat === 2 ? 'border-purple-500! bg-gray-100' : ''" @click="selectedChat = 2">
          <img src="@/assets/images/profile2.png" class="size-[60px] object-cover rounded-full" />
          <div class="flex flex-col gap-[2px]">
            <span class="body2 text-gray-900">Name ja</span>
            <span class="body4 text-gray-700">Hello World!</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>