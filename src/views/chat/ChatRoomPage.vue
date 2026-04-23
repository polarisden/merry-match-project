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

function toDate(value) {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isFinite(d.getTime()) ? d : null;
}

function dayKey(value) {
  const d = toDate(value);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function formatTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-En", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatDividerDate(value) {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-En", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

function showDateDivider(index) {
  if (!Array.isArray(messages.value) || index < 0 || index >= messages.value.length) return false;
  if (index === 0) return true;
  const prev = messages.value[index - 1];
  const curr = messages.value[index];
  const pk = dayKey(prev?.createdAt);
  const ck = dayKey(curr?.createdAt);
  if (!ck) return false;
  return pk !== ck;
}

function onChatImagePickError(msg) {
  sendError.value = typeof msg === "string" ? msg : "Invalid image";
}

function onSendImageDraft({ file, caption }) {
  sendImageFile(file, caption ?? "");
}
</script>

<template>
  <div class="h-full w-full min-w-0 bg-bg">
    <span class="sr-only" aria-live="polite">
      Unread messages elsewhere: {{ unreadTotal }}
    </span>

    <div class="h-full w-full min-w-0">
      <!-- Chat column: full viewport width under the optional top bar -->
      <div class="flex min-w-0 w-full h-full flex-col">
        <div class="flex min-h-0 h-full flex-col">
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
                v-if="isEmpty"
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
                    <div
                      v-if="showDateDivider(idx)"
                      class="my-2 flex w-full items-center justify-center"
                      role="separator"
                      :aria-label="`Messages from ${formatDividerDate(m.createdAt)}`"
                    >
                      <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {{ formatDividerDate(m.createdAt) }}
                      </span>
                    </div>

                    <ChatListItem
                      v-if="m.side === 'incoming'"
                      variant="incoming"
                      :avatar-src="peerAvatar"
                      :avatar-alt="`profile-pic ${contactName}`"
                    >
                      <div class="flex flex-col items-start gap-1">
                        <template v-if="m.type === 'text'">
                          <div class="flex items-end gap-2">
                            <MessageBubble variant="incoming">
                              {{ m.text }}
                            </MessageBubble>
                            <div v-if="formatTime(m.createdAt)" class="pb-1 text-[11px] leading-none text-gray-500">
                              {{ formatTime(m.createdAt) }}
                            </div>
                          </div>
                        </template>
                        <template v-else>
                          <div class="flex items-end gap-2">
                            <div class="flex flex-col gap-1">
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
                            <div v-if="formatTime(m.createdAt)" class="pb-1 text-[11px] leading-none text-gray-500">
                              {{ formatTime(m.createdAt) }}
                            </div>
                          </div>
                        </template>
                      </div>
                    </ChatListItem>
                    <ChatListItem v-else variant="outgoing">
                      <div class="flex flex-col items-end gap-1">
                        <template v-if="m.type === 'text'">
                          <div class="flex items-end gap-2">
                            <div
                              v-if="formatTime(m.createdAt) || m.isRead"
                              class="pb-1 text-[11px] leading-none text-gray-200/90"
                              aria-live="polite"
                            >
                              <div class="flex flex-col items-end gap-1">
                                <span v-if="m.isRead">Read</span>
                                <span v-if="formatTime(m.createdAt)">{{ formatTime(m.createdAt) }}</span>
                              </div>
                            </div>
                            <MessageBubble variant="outgoing">
                              {{ m.text }}
                            </MessageBubble>
                          </div>
                        </template>
                        <template v-else>
                          <div class="flex items-end gap-2">
                            <div
                              v-if="formatTime(m.createdAt) || m.isRead"
                              class="pb-1 text-[11px] leading-none text-gray-200/90"
                              aria-live="polite"
                            >
                              <div class="flex flex-col items-end gap-1">
                                <span v-if="m.isRead">Read</span>
                                <span v-if="formatTime(m.createdAt)">{{ formatTime(m.createdAt) }}</span>
                              </div>
                            </div>
                            <div class="flex flex-col items-end gap-1">
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
                          </div>
                        </template>
                      </div>
                    </ChatListItem>
                  </div>
                </template>
              </div>
            </template>
          </ChatList>

          <div
            class="relative z-10 w-full min-w-0 shrink-0"
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
        </div>
      </div>
    </div>
  </div>
</template>
