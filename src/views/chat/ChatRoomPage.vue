<script setup>
import { computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import ChatHeader from "@/components/chat/ChatHeader.vue";
import ChatList from "@/components/chat/ChatList.vue";
import ChatListItem from "@/components/chat/ChatListItem.vue";
import MessageBubble from "@/components/chat/MessageBubble.vue";
import ImageMessage from "@/components/chat/ImageMessage.vue";
import MessageInput from "@/components/chat/MessageInput.vue";
import MarryMatchIcon from "@/assets/icons/merry_match.svg";
import { useChatRoom } from "@/views/chat/useChatRoom";

const route = useRoute();

const chatListRef = ref(null);

const {
  chatRoomId,
  messages,
  loading,
  sending,
  uploading,
  loadError,
  sendError,
  unreadTotal,
  isEmpty,
  listScrollEl,
  sendText,
  sendImageFile,
  messageSpacingClass,
  peerName,
  peerImageUrl,
} = useChatRoom(route);

watchEffect(() => {
  listScrollEl.value = chatListRef.value?.rootEl ?? null;
});

const contactName = computed(() => {
  if (peerName.value && peerName.value.length > 0) return peerName.value;
  const p = route.params.contact;
  return typeof p === "string" && p.length > 0 ? p : "Daeny";
});

const peerAvatar = computed(() => peerImageUrl.value || "");

const isDev = import.meta.env.DEV;

function onChatImagePickError(msg) {
  sendError.value = typeof msg === "string" ? msg : "Invalid image";
}

function onSendImageDraft({ file, caption }) {
  sendImageFile(file, caption ?? "");
}
</script>

<template>
  <div class="min-h-dvh bg-bg">
    <span class="sr-only" aria-live="polite">
      Unread messages elsewhere: {{ unreadTotal }}
    </span>

    <!-- Reserve space for future navbar on lg+ -->
    <div
      class="hidden lg:block h-16 border-b border-gray-200 bg-bg-main"
      aria-hidden="true"
    />

    <div class="min-h-dvh lg:min-h-[calc(100dvh-4rem)] lg:grid lg:grid-cols-[316px_1fr]">
      <!-- Reserve space for future sidebar on lg+ -->

      <!-- Chat column -->
      <div class="flex w-full max-w-md flex-col mx-auto lg:mx-0 lg:max-w-none">
        <div class="flex h-dvh flex-col lg:h-[calc(100dvh-4rem)]">
          <ChatHeader :contact-name="contactName" />

          <p
            v-if="loadError"
            class="mx-4 mt-2 rounded-lg border border-red-200 bg-red-100 px-3 py-2 body2 text-red-700"
            role="alert"
          >
            {{ loadError }}
          </p>
          <p
            v-if="sendError"
            class="mx-4 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 body2 text-amber-900"
            role="alert"
          >
            {{ sendError }}
          </p>

          <ChatList ref="chatListRef">
            <div
              v-if="loading"
              class="mx-auto flex min-h-[120px] w-full max-w-[520px] flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-4 py-8 lg:max-w-[749px]"
              role="status"
              aria-busy="true"
            >
              <p class="body2 text-gray-600">
                Loading messages…
              </p>
            </div>

            <template v-else>
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

              <div
                v-if="isEmpty"
                class="mx-auto mt-6 w-full max-w-[520px] rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center lg:max-w-[749px]"
              >
                <p class="body2 text-gray-600">
                  No messages yet. Say hi to start the conversation.
                </p>
                <p
                  v-if="isDev"
                  class="mt-2 body5 text-gray-400"
                >
                  Room ID (mock / query <code class="rounded bg-gray-200 px-1">room</code>): {{ chatRoomId }}
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
                      <div
                        v-else
                        class="flex flex-col gap-1"
                      >
                        <ImageMessage
                          :src="m.imageUrl"
                          :alt="m.alt || 'Chat image'"
                        />
                        <p
                          v-if="m.text"
                          class="inline-flex w-fit max-w-[85%] rounded-tl-[24px] rounded-tr-[24px] rounded-br-[24px] bg-purple-200 px-6 py-3 body2 leading-snug text-gray-900 wrap-break-word"
                        >
                          {{ m.text }}
                        </p>
                      </div>
                    </ChatListItem>
                    <ChatListItem v-else variant="outgoing">
                      <MessageBubble v-if="m.type === 'text'" variant="outgoing">
                        {{ m.text }}
                      </MessageBubble>
                      <div
                        v-else
                        class="flex flex-col items-end gap-1"
                      >
                        <ImageMessage
                          :src="m.imageUrl"
                          :alt="m.alt || 'Your chat image'"
                        />
                        <p
                          v-if="m.text"
                          class="inline-flex w-fit max-w-[85%] rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] bg-purple-600 px-6 py-3 body2 leading-snug text-white wrap-break-word"
                        >
                          {{ m.text }}
                        </p>
                      </div>
                    </ChatListItem>
                  </div>
                </template>
              </div>
            </template>
          </ChatList>
        </div>
      </div>
    </div>
  </div>

  <!-- Full-width input bar -->
  <div
    class="fixed inset-x-0 bottom-0 z-20 lg:left-[317px]"
    :aria-busy="sending || uploading"
  >
    <MessageInput
      :disabled="loading"
      :sending="sending"
      :uploading="uploading"
      @send="sendText"
      @send-image="onSendImageDraft"
      @image-error="onChatImagePickError"
    />
  </div>
</template>
