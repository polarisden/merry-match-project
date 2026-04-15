<script setup>
import locationIcon from '@/assets/icons/location.svg'
import chatIcon from '@/assets/icons/chat.svg'
import heartIcon from '@/assets/icons/heart.svg'
import merryIcon from '@/assets/icons/merry.svg'
import merryMatchIcon from '@/assets/icons/merry_match.svg'
import { useMerryListPage } from '@/views/merrylist/useMerryListPage'
import ProfilePreviewPopUp from '@/components/modals/ProfilePreviewPopUp.vue'
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard.vue'

const {
  merryToYou,
  merryMatch,
  limitUsed,
  limitMax,
  profiles,
  isLoadingProfiles,
  loadProfilesError,
  isPreviewOpen,
  selectedProfile,
  isDeleteConfirmOpen,
  resetCountdownText,
  detailRows,
  openProfilePreview,
  closeProfilePreview,
  askRemoveProfile,
  cancelRemoveProfile,
  confirmRemoveProfile,
  goToChatRoom,
} = useMerryListPage()
</script>

<template>
  <div class="min-h-dvh bg-white text-gray-900">
    <main
      class="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6 sm:px-6 lg:max-w-[960px] lg:px-8 xl:max-w-[1100px]"
    >
      <div>
        <p class="body4 font-semibold uppercase tracking-[0.12em] text-beige-700">
          Merry list
        </p>
        <h1
          class="mt-2 merry-list-title leading-tight tracking-tight text-purple-500"
        >
          Let's know each other with Merry!
        </h1>

        <div
          class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-4"
        >
          <div
            class="rounded-2xl border border-gray-200/80 bg-white px-4 py-4 shadow-[0_4px_20px_rgba(64,50,133,0.08)]"
          >
            <p class="headline4 flex items-center gap-2 text-red-400">
              {{ merryToYou }}
              <span
                class="inline-flex h-[1.25em] w-[1.25em] shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <merryIcon class="block size-[1em] max-h-full" />
              </span>
            </p>
            <p class="body2 mt-1 text-gray-600">Merry to you</p>
          </div>
          <div
            class="rounded-2xl border border-gray-200/80 bg-white px-4 py-4 shadow-[0_4px_20px_rgba(64,50,133,0.08)]"
          >
            <p class="headline4 flex items-center gap-2 text-red-400">
              {{ merryMatch }}
              <span
                class="relative inline-flex h-[1.25em] w-[1.85em] shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                <merryIcon
                  class="absolute left-0 top-1/2 z-0 block size-[1em] max-h-full -translate-y-1/2"
                />
                <merryIcon
                  class="absolute left-[0.48em] top-1/2 z-1 block size-[1em] max-h-full -translate-y-1/2"
                />
              </span>
            </p>
            <p class="body2 mt-1 text-gray-600">Merry match</p>
          </div>
          <div
            class="col-span-2 flex flex-col items-end justify-center text-right max-lg:mt-1 lg:col-span-1 lg:min-w-44 lg:pl-2"
          >
            <p class="body2 font-semibold text-gray-700">
              Merry Limit today
              <span class="text-red-400">{{ limitUsed }}/{{ Number.isFinite(limitMax) ? limitMax : '--' }}</span>
            </p>
            <p class="body5 text-gray-500">{{ resetCountdownText }}</p>
          </div>
        </div>
      </div>

      <p v-if="isLoadingProfiles" class="body2 mt-8 text-gray-500">Loading profiles...</p>
      <p v-else-if="loadProfilesError" class="body2 mt-8 text-red-400">
        {{ loadProfilesError }}
      </p>

      <ul class="mt-8 divide-y divide-gray-200">
        <li
          v-for="p in profiles"
          :key="p.id"
          class="grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-3 py-6 first:pt-2 lg:grid-cols-[187px_minmax(0,1fr)_auto] lg:gap-x-6 lg:gap-y-3"
        >
          <div class="relative col-start-1 row-start-1 h-[104px] w-[104px] shrink-0 self-start lg:row-span-2 lg:h-[187px] lg:w-[187px]">
            <img
              :src="p.img"
              :alt="`${p.name} profile`"
              class="h-full w-full rounded-[24px] object-cover"
            />
            <span
              v-if="p.merryToday"
              class="body5 absolute bottom-0 rounded-bl-[24px] rounded-tr-lg bg-purple-100 px-2 py-0.5 text-[#95002A]"
            >
              Merry today
            </span>
          </div>

          <div
            class="col-start-2 row-start-1 flex min-w-0 flex-col items-end gap-2.5 self-start lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:justify-between"
          >
            <span
              v-if="p.canMessage"
              class="inline-flex items-center gap-2 rounded-full border border-[#E91E63] bg-white px-3.5 py-2 text-sm font-bold leading-none text-[#E91E63]"
            >
              <merryMatchIcon class="h-4.5 w-7.75 shrink-0" aria-hidden="true" />
              Merry Match!
            </span>
            <span
              v-else
              class="body3 inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1.5 text-gray-600"
            >
              Not Match yet
            </span>
            <div
              class="flex h-[48px] w-[160px] shrink-0 items-center justify-end gap-2 lg:mt-auto lg:w-auto lg:justify-end"
            >
              <button
                v-if="p.canMessage"
                type="button"
                class="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-gray-200/90 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50"
                aria-label="Message"
                @click="goToChatRoom(p)"
              >
                <chatIcon class="size-[18px] sm:size-5" />
              </button>
              <button
                type="button"
                class="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-gray-200/90 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50"
                aria-label="View profile"
                @click="openProfilePreview(p)"
              >
                <svg
                  class="size-[18px] sm:size-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                type="button"
                class="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-[#E91E63] text-white shadow-[0_2px_10px_rgba(233,30,99,0.35)] transition hover:bg-[#D81B60]"
                aria-label="Merry"
                @click="askRemoveProfile(p)"
              >
                <heartIcon class="size-[18px] sm:size-5" />
              </button>
            </div>
          </div>

          <div
            class="col-span-2 col-start-1 row-start-2 flex min-w-0 flex-col gap-3 lg:col-span-1 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <span class="headline4 text-gray-900">{{ p.name }}</span>
              <span class="headline4 font-bold tabular-nums text-gray-700">{{ p.age }}</span>
              <span class="inline-flex min-w-0 items-center gap-1.5 text-gray-600">
                <locationIcon class="size-4 shrink-0 text-red-200" />
                <span class="body2 text-gray-600">{{ p.location }}</span>
              </span>
            </div>

            <dl
              class="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 gap-y-2 border-t border-gray-100 pt-3 sm:gap-x-10 lg:max-w-xl lg:gap-x-10 xl:max-w-2xl"
            >
              <template v-for="row in detailRows(p)" :key="row.label">
                <dt class="body2 text-gray-900">{{ row.label }}</dt>
                <dd class="body2 min-w-0 truncate text-gray-700">{{ row.value }}</dd>
              </template>
            </dl>
          </div>
        </li>
      </ul>
    </main>

    <ProfilePreviewPopUp
      :open="isPreviewOpen"
      :target-user-id="selectedProfile?.id || ''"
      :fallback-photo-url="selectedProfile?.img || ''"
      @close="closeProfilePreview"
    />
    <div v-if="isPreviewOpen" class="fixed inset-0 z-50 bg-white lg:hidden">
      <ProfilePreviewCard
        :target-user-id="selectedProfile?.id || ''"
        :fallback-photo-url="selectedProfile?.img || ''"
        @close="closeProfilePreview"
      />
    </div>

    <div
      v-if="isDeleteConfirmOpen"
      class="fixed inset-0 z-70 flex items-center justify-center bg-black/40 px-4"
      @click.self="cancelRemoveProfile"
    >
      <div class="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl">
        <h3 class="headline4 text-gray-900">Remove this person from Merry list?</h3>
        <p class="body2 mt-2 text-gray-600">
          This action will remove your merry relation for this person.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="body2 cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            @click="cancelRemoveProfile"
          >
            Cancel
          </button>
          <button
            type="button"
            class="body2 cursor-pointer rounded-xl bg-[#E91E63] px-4 py-2 text-white hover:bg-[#D81B60]"
            @click="confirmRemoveProfile"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
