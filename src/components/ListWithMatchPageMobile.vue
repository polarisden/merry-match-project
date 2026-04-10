<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { fetchChatRoomsForUser } from "@/views/chat/chatApi";
import mathNsearchLogo from '@/assets/icons/vector.svg'
import merryMatchLogo from '@/assets/icons/merry_match.svg'
import profile1Img from '@/assets/images/profile1.png'
import profile2Img from '@/assets/images/profile2.png'
import faceImg from '@/assets/images/face.png'

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const chatRooms = ref([]);
const loading = ref(false);
const errorMsg = ref("");

const unreadChatTotal = computed(() =>
  chatRooms.value.reduce((n, r) => n + (Number(r.unreadCount) || 0), 0),
)

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

async function loadRooms() {
  errorMsg.value = "";
  authStore.hydrate();
  if (!authStore.token) {
    chatRooms.value = [];
    return;
  }
  loading.value = true;
  try {
    chatRooms.value = await fetchChatRoomsForUser(authStore.token);
  } catch (e) {
    chatRooms.value = [];
    errorMsg.value = e instanceof Error ? e.message : "Failed to load chats";
  } finally {
    loading.value = false;
  }
}

function openRoom(roomId) {
  const id = String(roomId || "").trim();
  if (!id) return;
  router.push({ path: "/matching", query: { ...route.query, room: id } });
}

onMounted(() => {
  loadRooms();
});
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
          <img
            :src="match.img"
            :alt="match.name ? `Match avatar of ${match.name}` : 'Match avatar'"
            class="size-[100px] object-cover rounded-[24px]"
          >
          <merryMatchLogo class="text-red-400 absolute right-0 bottom-0 w-[34px] h-5 stroke-4" />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <span class="headline4 text-gray-900">Chat with Merry Match</span>
        <span
          v-if="unreadChatTotal > 0"
          class="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 body5 font-medium text-white tabular-nums"
          :aria-label="`${unreadChatTotal} unread messages in chats`"
        >
          {{ unreadChatTotal > 99 ? '99+' : unreadChatTotal }}
        </span>
      </div>

      <p v-if="errorMsg" class="body4 text-red-600" role="alert">{{ errorMsg }}</p>
      <p v-else-if="!authStore.token" class="body4 text-gray-500">Log in to see your chats.</p>
      <p v-else-if="loading" class="body4 text-gray-500">Loading chats…</p>
      <p v-else-if="chatRooms.length === 0" class="body4 text-gray-500">No chat rooms yet.</p>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="room in chatRooms"
          :key="room.id"
          class="min-h-[92px] py-4 px-3 flex gap-3 items-center cursor-pointer rounded-[16px] border border-white"
          @click="openRoom(room.id)"
        >
          <img
            :src="room.peerImageUrl || profile1Img"
            :alt="room.peerName ? `Avatar of ${room.peerName}` : 'Chat peer avatar'"
            class="size-[60px] object-cover rounded-full"
          />
          <div class="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span class="body2 truncate text-gray-900">{{ room.peerName || 'Merry Match' }}</span>
            <span class="body4 truncate text-gray-700">{{ room.lastMessageText || 'Say hi!' }}</span>
          </div>
          <span
            v-if="(room.unreadCount || 0) > 0"
            class="inline-flex min-h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 body5 font-medium text-white tabular-nums"
            :aria-label="`${room.unreadCount} unread messages`"
          >
            {{ (room.unreadCount || 0) > 99 ? '99+' : room.unreadCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>