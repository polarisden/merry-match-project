<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { fetchChatRoomsForUser } from "@/views/chat/chatApi";
import { apiUrl } from "@/lib/apiBase";
import mathNsearchLogo from '@/assets/icons/vector.svg'
import merryMatchLogo from '@/assets/icons/merry_match.svg'
import profile1Img from '@/assets/images/profile1.png'

const router = useRouter();
const authStore = useAuthStore();

const chatRooms = ref([]);
const loading = ref(false);
const errorMsg = ref("");
const currentUserId = ref(null);
const merryMatches = ref([]);

const unreadChatTotal = computed(() =>
  chatRooms.value.reduce((n, r) => n + (Number(r.unreadCount) || 0), 0),
)

async function loadCurrentUser() {
  const token = authStore.token;
  if (!token) return;
  try {
    const res = await fetch(apiUrl('/api/users/me/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const me = await res.json();
    currentUserId.value = me.id ?? me.userId ?? null;
  } catch { /* ignore */ }
}

async function loadMerryMatches() {
  const token = authStore.token;
  if (!token || !currentUserId.value) return;
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const matchRes = await fetch(apiUrl(`/api/matchList?userId=${currentUserId.value}`), { headers });
    if (!matchRes.ok) return;
    const matches = await matchRes.json();
    const results = await Promise.all(
      matches.map(async (match) => {
        const otherId = match.user1Id === currentUserId.value ? match.user2Id : match.user1Id;
        try {
          const picRes = await fetch(apiUrl(`/api/users/${otherId}/picture`), { headers });
          if (!picRes.ok) return null;
          const pic = await picRes.json();
          return { id: match.id, userId: otherId, img: pic.mainPicture };
        } catch { return null; }
      })
    );
    merryMatches.value = results.filter(Boolean);
  } catch { /* ignore */ }
}

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
  router.push({ path: "/matching", query: { room: id } });
}

async function openChatRoomFromMatch(otherUserId) {
  const token = authStore.token;
  if (!token || !currentUserId.value) return;
  try {
    const res = await fetch(
      apiUrl(`/api/chatroom-id?swiper_id=${currentUserId.value}&swiped_id=${otherUserId}`),
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) return;
    const data = await res.json();
    const roomId = data.chatroom_id;
    if (!roomId) return;
    openRoom(roomId);
  } catch (e) {
    console.error('Failed to get chat room id:', e);
  }
}

onMounted(async () => {
  authStore.hydrate();
  await loadCurrentUser();
  await Promise.all([loadRooms(), loadMerryMatches()]);
});
</script>

<template>
  <div class="lg:hidden h-full flex flex-col overflow-hidden px-4">
    <!-- Discover -->
    <div class="shrink-0 py-6">
      <div class="flex flex-col items-center gap-1 p-6 border border-purple-500 rounded-[16px] bg-gray-100 cursor-pointer active:opacity-80" @click="router.push('/matching')">
        <mathNsearchLogo class="w-[62px] h-[59px]" />
        <span class="block text-red-600 headline4">Discover New Match</span>
        <span class="w-[calc(94%)] body4 text-gray-700 text-center">Start find and Merry to get know and connect with new friend!</span>
      </div>
    </div>

    <!-- Merry Match list -->
    <div class="shrink-0 flex flex-col gap-4 pb-4">
      <span class="headline4 text-gray-900">Merry Match!</span>
      <div v-if="merryMatches.length === 0" class="flex items-center h-[100px]">
        <p class="body4 text-gray-400">No matches yet — keep swiping to find your Merry Match!</p>
      </div>
      <div v-else class="flex gap-[12px] overflow-x-auto pb-2">
        <div v-for="match in merryMatches" :key="match.id" class="relative shrink-0 cursor-pointer" @click="openChatRoomFromMatch(match.userId)">
          <img
            :src="match.img"
            :alt="'Match avatar'"
            class="size-[100px] object-cover rounded-[24px]"
          >
          <merryMatchLogo class="text-red-400 absolute right-0 bottom-0 w-[34px] h-5 stroke-4" />
        </div>
      </div>
    </div>

    <!-- Chat list -->
    <div class="flex flex-1 min-h-0 flex-col gap-4 pb-4">
      <div class="flex items-center gap-2 shrink-0">
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

      <div v-else class="flex flex-col gap-2 overflow-y-auto min-h-0">
        <div
          v-for="room in chatRooms"
          :key="room.id"
          class="min-h-[92px] py-4 px-3 flex gap-3 items-center cursor-pointer rounded-[16px] border border-white shrink-0"
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