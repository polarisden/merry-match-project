<script setup>
import faceImg from '@/assets/images/face.png'
import profile1Img from '@/assets/images/profile1.png'
import profile2Img from '@/assets/images/profile2.png'
import locationLogo from '@/assets/icons/location.svg'
import frameLogo from '@/assets/icons/Frame.svg'
import arrowLeftLogo from '@/assets/icons/arrow.svg'
import arrowRightLogo from '@/assets/icons/arrow_right.svg'
import xLogo from '@/assets/icons/x.svg'
import heartLogo from '@/assets/icons/heart.svg'
import filterLogo from '@/assets/icons/filter.svg'
import mathNsearchLogo from '@/assets/icons/vector.svg'
import merryMatchLogo from '@/assets/icons/merry_match.svg'
import ProfilePreviewPopUp from '@/components/modals/ProfilePreviewPopUp.vue'
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard.vue'
import ChatRoomCard from '@/views/chat/ChatRoomPage.vue'
import { ref, computed } from 'vue'

const selectedChat = ref(null)

const showPreview = ref(false)
const showMobilePreview = ref(false)
const showFilter = ref(false)

const genderOptions = ref({ default: false, female: false, nonbinary: false })
const filterMinAge = ref(18)
const filterMaxAge = ref(50)

const filterMinPercent = computed(() => ((filterMinAge.value - 18) / (100 - 18)) * 100)
const filterMaxPercent = computed(() => ((filterMaxAge.value - 18) / (100 - 18)) * 100)

function onFilterMinInput(e) {
  const val = Number(e.target.value)
  filterMinAge.value = Math.min(val, filterMaxAge.value - 1)
}
function onFilterMaxInput(e) {
  const val = Number(e.target.value)
  filterMaxAge.value = Math.max(val, filterMinAge.value + 1)
}

function clearFilter() {
  genderOptions.value = { default: false, female: false, nonbinary: false }
  filterMinAge.value = 18
  filterMaxAge.value = 50
}

const minAge = ref(18)
const maxAge = ref(50)

const minPercent = computed(() => ((minAge.value - 18) / (100 - 18)) * 100)
const maxPercent = computed(() => ((maxAge.value - 18) / (100 - 18)) * 100)

function onMinInput(e) {
  const val = Number(e.target.value)
  minAge.value = Math.min(val, maxAge.value - 1)
}
function onMaxInput(e) {
  const val = Number(e.target.value)
  maxAge.value = Math.max(val, minAge.value + 1)
}

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

// Card deck
const profiles = ref([
  { id: 1, name: 'Daeny', age: 24, location: 'Bangkok, Thailand', img: faceImg },
  { id: 2, name: 'Aria', age: 22, location: 'Chiang Mai, Thailand', img: profile1Img },
  { id: 3, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 4, name: 'Yaraa', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 5, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 6, name: 'Daeny', age: 24, location: 'Bangkok, Thailand', img: faceImg },
  { id: 7, name: 'Aria', age: 22, location: 'Chiang Mai, Thailand', img: profile1Img },
  { id: 8, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 9, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 10, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 11, name: 'Daeny', age: 24, location: 'Bangkok, Thailand', img: faceImg },
  { id: 12, name: 'Aria', age: 22, location: 'Chiang Mai, Thailand', img: profile1Img },
  { id: 13, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 14, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
  { id: 15, name: 'Yara', age: 26, location: 'Phuket, Thailand', img: profile2Img },
])
const currentIndex = ref(0)

const currentProfile = computed(() => profiles.value[currentIndex.value])
const prevProfile = computed(() => profiles.value[currentIndex.value - 1] ?? null)
const nextProfile = computed(() => profiles.value[currentIndex.value + 1] ?? null)

function goNext() {
  if (currentIndex.value < profiles.value.length - 1) currentIndex.value++
}
function goPrev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function onDislike() {
  goNext()
}
function onLike() {
  goNext()
}
</script>

<template>
  <!-- mobile -->
  <div class="bg-bg min-h-dvh flex flex-col relative lg:hidden">
    <!-- <navbar> -->
    <ChatRoomCard />
    <div class="relative w-[375px]">
      <div class="relative h-[619px] w-[375px] overflow-hidden rounded-b-[24px]">
        <img :src="faceImg" alt="face" class="h-full w-full object-cover" />
        <div
          class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_61.94%,#390741_100%)]"
        ></div>

        <div class="h-[152px] absolute z-30 right-0 bottom-0 w-dvw pr-[16px] pl-[16px] pb-[16px] flex flex-col justify-center gap-1">
          <div class="text-white headline3 text-[36px]! flex justify-between items-center">
            <div class="flex gap-4">
              <span>Daeny</span>
              <span>24</span>
            </div>
            <div
              class="w-8 h-8 flex justify-center items-center rounded-full bg-[#FFFFFF33] shadow-[2px_2px_12px_0px_#4032851F] transition-opacity duration-300 ease-out active:opacity-80 cursor-pointer"
              @click="showMobilePreview = true"
            >
              <frameLogo class="w-4 h-4" />
            </div>
          </div>
          <div class="flex gap-[6px]">
            <locationLogo class="w-5 h-5 text-[#BEBFF1]" />
            <span class="text-gray-400 body-2 font-normal">Bangkok, Thailand</span>
          </div>
        </div>
      </div>

      <div class="absolute z-40 bottom-[-40px] left-1/2 -translate-x-1/2 flex gap-6">
        <button
          type="button"
          aria-label="Close"
          class="bg-white w-[80px] h-[80px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F]"
        >
          <xLogo class="size-[50px] text-gray-700 stroke-4" />
        </button>
        <button
          type="button"
          aria-label="Close"
          class="bg-white w-[80px] h-[80px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F]"
        >
          <heartLogo class="size-[50px] text-red-500" />
        </button>
      </div>
    </div>

    <footer class="h-[56px] relative mt-auto flex px-4 justify-between items-center">
      <div class="flex gap-[10px] cursor-pointer" @click="showFilter = true">
        <filterLogo />
        <span class="text-gray-500 body4">Filter</span>
      </div>
      <div class="flex gap-[10px] items-center">
        <span class="text-gray-700 body4">Merry limit today</span>
        <span class="text-red-400 body4">2/20</span>
      </div>
    </footer>
  </div>

  <!-- desktop -->
  <div class="hidden lg:flex">
    <!-- left container -->
    <section class="h-dvh w-[22%] flex flex-col relative">
      <div class="h-[259px] flex items-center justify-center border-b border-b-gray-300 px-4">
        <div class="flex flex-col items-center gap-1 p-6 border border-purple-500 rounded-[16px] bg-gray-100">
          <mathNsearchLogo class="w-[62px] h-[59px]"/>
          <span class="block text-red-600 headline4">Discover New Match</span>
          <span class="w-[calc(94%)] body4 text-gray-700 text-center">Start find and Merry to get know and connect with new friend!</span>
        </div>
      </div>
      <div class="px-4 py-6 flex flex-col gap-4 h-[194px]">
        <span class="headline4 text-gray-900">Merry Match!</span>
        <div class="flex gap-[12px] overflow-x-auto scrollbar-hide">
          <div v-for="match in merryMatches" :key="match.id" class="relative shrink-0">
            <img :src="match.img" class="size-[100px] object-cover rounded-[24px]">
            <merryMatchLogo class="text-red-400 absolute right-0 bottom-0 w-[34px] h-5 stroke-4"/>
          </div>
        </div>
      </div>
      <div class="flex flex-col px-4 gap-4">
        <span class="headline4 text-gray-900">Chat with Merry Match</span>
        <!-- chat message -->
        <div class="flex flex-col gap-2">
          <div class="h-[92px] py-4 px-3 flex gap-3 items-center cursor-pointer rounded-[16px] border border-white" :class="selectedChat === 1 ? 'border-purple-500! bg-gray-100' : ''" @click="selectedChat = 1">
            <img src="@/assets/images/profile1.png" class="size-[60px] object-cover rounded-full"/>
            <div class="flex flex-col gap-[2px]">
              <span class="body2 text-gray-900">Name ja</span>
              <span class="body4 text-gray-700">Hello World!</span>
            </div>
          </div>
          <div class="h-[92px] py-4 px-3 flex gap-3 items-center cursor-pointer rounded-[16px] border border-white" :class="selectedChat === 2 ? 'border-purple-500! bg-gray-100' : ''" @click="selectedChat = 2">
            <img src="@/assets/images/profile2.png" class="size-[60px] object-cover rounded-full"/>
            <div class="flex flex-col gap-[2px]">
              <span class="body2 text-gray-900">Name ja</span>
              <span class="body4 text-gray-700">Hello World!</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- middle container -->
    <section v-if="selectedChat === null" class="flex h-dvh w-[62%] flex-col bg-bg overflow-hidden">
      <div class="flex flex-1 items-center justify-center">
        <div class="flex flex-col items-center">
          <!-- card deck -->
          <div class="relative flex items-center justify-center">
            <!-- prev card (peek left) -->
            <div
              v-if="prevProfile"
              class="absolute right-[calc(100%+60px)] h-[540px] w-[540px] rounded-[32px] overflow-hidden pointer-events-none select-none"
            >
              <img :src="prevProfile.img" class="w-full h-full object-cover" alt="" />
              <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_61.94%,#390741_100%)]"></div>
            </div>

            <!-- main card -->
            <div
              v-if="currentProfile"
              class="relative h-[620px] w-[620px] rounded-[32px] overflow-hidden select-none z-10 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
            >
              <img :src="currentProfile.img" class="w-full h-full object-cover" alt="" />
              <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_55%,#390741_100%)]"></div>

              <!-- info + arrows -->
              <div class="absolute bottom-0 left-0 right-0 px-9 flex flex-col gap-1">
                <div class="text-white flex justify-between items-center h-[152px]">
                  <div class="flex gap-4 items-center headline3">
                    <span>{{ currentProfile.name }}</span>
                    <span>{{ currentProfile.age }}</span>
                    <div
                      class="w-8 h-8 flex justify-center items-center rounded-full bg-[#FFFFFF33] cursor-pointer"
                      @click="showPreview = true"
                    >
                      <frameLogo class="w-4 h-4" />
                    </div>
                  </div>
                  <div class="flex gap-3 items-center">
                    <button
                      v-if="currentIndex > 0"
                      @click="goPrev"
                      class="w-9 h-9 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#FFFFFF55] transition cursor-pointer"
                    >
                      <arrowLeftLogo class="w-4 h-4 text-white" />
                    </button>
                    <button
                      v-if="currentIndex < profiles.length - 1"
                      @click="goNext"
                      class="w-9 h-9 rounded-full bg-[#FFFFFF33] flex items-center justify-center hover:bg-[#FFFFFF55] transition cursor-pointer"
                    >
                      <arrowRightLogo class="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- next card (peek right) -->
            <div
              v-if="nextProfile"
              class="absolute left-[calc(100%+60px)] h-[540px] w-[540px] rounded-[32px] overflow-hidden pointer-events-none select-none"
            >
              <img :src="nextProfile.img" class="w-full h-full object-cover" alt="" />
              <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,65,0)_61.94%,#390741_100%)]"></div>
            </div>
          </div>

          <!-- action buttons -->
          <div class="flex gap-6 mt-[-36px] z-20 relative">
            <button
              @click="onDislike"
              class="bg-white w-[72px] h-[72px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F] hover:scale-105 transition-transform cursor-pointer"
            >
              <xLogo class="size-[44px] text-gray-700 stroke-4" />
            </button>
            <button
              @click="onLike"
              class="bg-white w-[72px] h-[72px] rounded-3xl flex justify-center items-center shadow-[2px_2px_12px_0px_#4032851F] hover:scale-105 transition-transform cursor-pointer"
            >
              <heartLogo class="size-[44px] text-red-500" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-center h-[56px] pb-8 shrink-0 items-center px-4">
        <div class="flex gap-[10px] items-center justify-center">
          <span class="body2 mx-auto text-gray-700">Merry limit today</span>
          <span class="body2 text-red-400">2/20</span>
        </div>
      </div>
    </section>

    <!-- chat room (replaces middle + right when chat selected) -->
    <ChatRoomCard v-if="selectedChat !== null" class="flex-1" />

    <!-- right container -->
    <section v-if="selectedChat === null" class="w-[16%] px-4 pt-6">
      <div class="flex flex-col gap-4">
        <span class="body2 font-bold! text-gray-900">Gender you interest</span>
        <div class="flex flex-col gap-4 items-start mb-15">
          <div class="flex gap-3 justify-center items-center">
            <input
              type="checkbox"
              class="size-[18px] shrink-0 cursor-pointer rounded border-2 border-purple-300 accent-purple-500"
            />
            <span class="body2 font-medium! gray-700">Default</span>
          </div>
          <div class="flex gap-3 justify-center items-center">
            <input
              type="checkbox"
              class="size-[18px] shrink-0 cursor-pointer rounded border-2 border-purple-300 accent-purple-500"
            />
            <span class="body2 font-medium! gray-700">Female</span>
          </div>
          <div class="flex gap-3 justify-center items-center">
            <input
              type="checkbox"
              class="size-[18px] shrink-0 cursor-pointer rounded border-2 border-purple-300 accent-purple-500"
            />
            <span class="body2 font-medium! gray-700">Non-bunary people</span>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <span class="body2 font-bold! text-gray-900">Age Range</span>

          <!-- dual range slider -->
          <div class="relative flex h-5 items-center">
            <div class="absolute h-[4px] w-full rounded-full bg-gray-300"></div>
            <div
              class="absolute h-[4px] rounded-full bg-purple-500"
              :style="{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }"
            ></div>
            <input
              type="range" min="18" max="100" step="1"
              :value="minAge"
              @input="onMinInput"
              class="range-thumb absolute inset-0 h-full w-full"
              :style="{ zIndex: minAge > maxAge - 10 ? 20 : 10 }"
            />
            <input
              type="range" min="18" max="100" step="1"
              :value="maxAge"
              @input="onMaxInput"
              class="range-thumb absolute inset-0 h-full w-full"
              :style="{ zIndex: minAge > maxAge - 10 ? 10 : 20 }"
            />
          </div>

          <!-- value boxes -->
          <div class="flex items-center gap-2">
            <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
              <span class="body2 text-gray-600">{{ minAge }}</span>
            </div>
            <span class="body2 text-gray-700">-</span>
            <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
              <span class="body2 text-gray-600">{{ maxAge }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <!-- filter bottom sheet (mobile) -->
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="showFilter" class="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
        <!-- backdrop -->
        <div class="absolute inset-0 bg-[#00000080]" @click="showFilter = false" />
        <!-- sheet -->
        <div class="relative z-10 bg-white rounded-t-[24px] px-6 pt-6 pb-10 flex flex-col gap-6">
          <!-- header -->
          <div class="flex items-center justify-between">
            <button @click="showFilter = false" class="cursor-pointer">
              <xLogo class="size-6 text-black stroke-2" />
            </button>
            <span class="headline4 text-[#1A1A6E]">Filter</span>
            <button class="body2 font-bold! text-red-500 cursor-pointer" @click="clearFilter">Clear</button>
          </div>

          <!-- gender -->
          <div class="flex flex-col gap-4">
            <span class="body2 font-bold! text-gray-900">Gender you interest</span>
            <label class="flex gap-3 items-center cursor-pointer">
              <input type="checkbox" v-model="genderOptions.default"
                class="size-[18px] shrink-0 rounded border-2 border-purple-300 accent-purple-500" />
              <span class="body2 font-medium!" :class="genderOptions.default ? 'text-gray-900' : 'text-gray-700'">Default</span>
            </label>
            <label class="flex gap-3 items-center cursor-pointer">
              <input type="checkbox" v-model="genderOptions.female"
                class="size-[18px] shrink-0 rounded border-2 border-purple-300 accent-purple-500" />
              <span class="body2 font-medium!" :class="genderOptions.female ? 'text-gray-900' : 'text-gray-700'">Female</span>
            </label>
            <label class="flex gap-3 items-center cursor-pointer">
              <input type="checkbox" v-model="genderOptions.nonbinary"
                class="size-[18px] shrink-0 rounded border-2 border-purple-300 accent-purple-500" />
              <span class="body2 font-medium!" :class="genderOptions.nonbinary ? 'text-gray-900' : 'text-gray-700'">Non-bunary people</span>
            </label>
          </div>

          <!-- age range -->
          <div class="flex flex-col gap-3">
            <span class="body2 font-bold! text-gray-900">Age Range</span>
            <div class="relative flex h-5 items-center">
              <div class="absolute h-[4px] w-full rounded-full bg-gray-300"></div>
              <div
                class="absolute h-[4px] rounded-full bg-purple-500"
                :style="{ left: `${filterMinPercent}%`, width: `${filterMaxPercent - filterMinPercent}%` }"
              ></div>
              <input type="range" min="18" max="100" step="1"
                :value="filterMinAge" @input="onFilterMinInput"
                class="range-thumb absolute inset-0 h-full w-full"
                :style="{ zIndex: filterMinAge > filterMaxAge - 10 ? 20 : 10 }" />
              <input type="range" min="18" max="100" step="1"
                :value="filterMaxAge" @input="onFilterMaxInput"
                class="range-thumb absolute inset-0 h-full w-full"
                :style="{ zIndex: filterMinAge > filterMaxAge - 10 ? 10 : 20 }" />
            </div>
            <div class="flex items-center gap-2">
              <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
                <span class="body2 text-gray-600">{{ filterMinAge }}</span>
              </div>
              <span class="body2 text-gray-700">-</span>
              <div class="flex h-[56px] flex-1 items-center justify-center rounded-2xl border border-gray-300">
                <span class="body2 text-gray-600">{{ filterMaxAge }}</span>
              </div>
            </div>
          </div>

          <!-- search button -->
          <button class="w-full h-[56px] rounded-full bg-red-500 text-white body2 font-bold! cursor-pointer hover:bg-red-600 transition-colors"
            @click="showFilter = false">
            Search
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- profile preview modal (desktop) -->
  <Teleport to="body">
    <ProfilePreviewPopUp :open="showPreview" @close="showPreview = false" />
  </Teleport>

  <!-- profile preview modal (mobile) -->
  <Teleport to="body">
    <div
      v-if="showMobilePreview"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 lg:hidden"
      @click.self="showMobilePreview = false"
    >
      <div class="relative overflow-y-auto max-h-dvh rounded-[24px] shadow-2xl">
        <button
          class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center cursor-pointer hover:bg-white transition"
          @click="showMobilePreview = false"
        >
          <xLogo class="size-5 text-gray-700" />
        </button>
        <ProfilePreviewCard />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s ease;
}
.sheet-enter-from .sheet-leave-to {
  transform: translateY(100%);
}

.range-thumb {
  cursor: pointer;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.range-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background-color: var(--color-purple-500);
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  cursor: pointer;
}

.range-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background-color: var(--color-purple-500);
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  cursor: pointer;
}

.range-thumb::-webkit-slider-runnable-track {
  background: transparent;
}

.range-thumb::-moz-range-track {
  background: transparent;
}
</style>
