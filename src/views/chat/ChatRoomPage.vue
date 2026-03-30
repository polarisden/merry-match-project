<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import ChatHeader from "@/components/chat/ChatHeader.vue";
import ChatList from "@/components/chat/ChatList.vue";
import ChatListItem from "@/components/chat/ChatListItem.vue";
import MessageBubble from "@/components/chat/MessageBubble.vue";
import ImageMessage from "@/components/chat/ImageMessage.vue";
import MessageInput from "@/components/chat/MessageInput.vue";
import MarryMatchIcon from "@/assets/icons/merry_match.svg";
import DragonImage from "@/assets/images/dragon.png";
import MatchUser from "@/assets/images/match-pic.png";

const route = useRoute();
const contactName = computed(() => {
  const p = route.params.contact;
  return typeof p === "string" && p.length > 0 ? p : "Daeny";
});

const peerAvatar = MatchUser;
const dragonImage = DragonImage;

const messages = ref([
  { id: "1", side: "incoming", type: "text", text: "Hi" },
  {
    id: "2",
    side: "incoming",
    type: "text",
    text: "Do you like ma dragons?",
  },
  {
    id: "3",
    side: "incoming",
    type: "image",
    src: dragonImage,
    alt: "messageImage",
  },
  {
    id: "4",
    side: "outgoing",
    type: "text",
    text: "Yep, they're cool...",
  },
  {
    id: "5",
    side: "outgoing",
    type: "text",
    text: "But i like u better 😘😁",
  },
]);

function appendOutgoing(text) {
  messages.value.push({
    id: String(Date.now()),
    side: "outgoing",
    type: "text",
    text,
  });
}

function messageSpacingClass(index) {
  if (index === 0) return "";
  const prev = messages.value[index - 1];
  const curr = messages.value[index];
  return prev?.side !== curr?.side ? "mt-7" : "mt-2";
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <!-- Reserve space for future navbar on lg+ -->
    <div
      class="hidden lg:block h-16 border-b border-gray-200 bg-bg-main"
      aria-hidden="true"
    />

    <div class="min-h-dvh lg:min-h-[calc(100dvh-4rem)] lg:grid lg:grid-cols-[316px_1fr]">
      <!-- Reserve space for future sidebar on lg+ -->
      <aside
        class="hidden lg:block border-r border-gray-200 bg-bg-main"
        aria-hidden="true"
      />

      <!-- Chat column -->
      <div class="flex w-full max-w-md flex-col mx-auto lg:mx-0 lg:max-w-none">
        <div class="flex h-dvh flex-col lg:h-[calc(100dvh-4rem)]">
          <ChatHeader :contact-name="contactName" />

          <ChatList>
            <div
              class="mx-auto flex h-[78px] w-full max-w-[520px] items-center gap-3 rounded-2xl bg-purple-100 px-4 py-3 body5 text-red-700 lg:h-[90px] lg:max-w-[749px] lg:justify-center lg:body4"
              role="status"
            >
              <MarryMatchIcon class="text-red-400 size-20" />
              <p class="self-center">
                Now you and {{ contactName }} are Merry Match!
                <br />
                You can messege something nice and make a good conversation. Happy
                Merry!
              </p>
            </div>
            <div class="flex flex-col">
              <template v-for="(m, idx) in messages" :key="m.id">
                <div :class="messageSpacingClass(idx)">
                  <ChatListItem
                    v-if="m.side === 'incoming'"
                    variant="incoming"
                    :avatar-src="peerAvatar"
                    :avatar-alt="`profile-pic ${contactName}`"
                  >
                    <MessageBubble v-if="m.type === 'text'" variant="incoming">
                      {{ m.text }}
                    </MessageBubble>
                    <ImageMessage v-else :src="m.src" :alt="m.alt" />
                  </ChatListItem>
                  <ChatListItem v-else variant="outgoing">
                    <MessageBubble variant="outgoing">
                      {{ m.text }}
                    </MessageBubble>
                  </ChatListItem>
                </div>
              </template>
            </div>
          </ChatList>
        </div>
      </div>
    </div>
  </div>

  <!-- Full-width input bar -->
  <div class="fixed inset-x-0 bottom-0 z-20 lg:left-[317px]">
    <MessageInput @send="appendOutgoing" />
  </div>
</template>
