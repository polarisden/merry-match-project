<template>
  <MainLayout>
    <div class="bg-bg text-white">

      <!-- ================= HERO ================= -->
      <section
        class="min-h-[1035px] flex flex-col items-center justify-center relative overflow-hidden lg:min-h-[880px]">
        <div class="hidden lg:block">

          <!-- Heart -->
          <svg class="absolute z-0 
            w-[26px] h-[24px] 
            top-[140px] left-[860px]" viewBox="0 0 26 24" fill="none">
            <path
              d="M12.5267 23.8807L12.5173 23.8767L12.488 23.8607C12.3164 23.7663 12.1461 23.6694 11.9773 23.57C9.94775 22.364 8.05103 20.9472 6.31867 19.3433C3.25067 16.4805 0 12.2324 0 7.00027C0 3.09617 3.28533 9.46041e-05 7.25067 9.46041e-05C8.353 -0.00530477 9.44238 0.237888 10.4378 0.711587C11.4331 1.18528 12.3089 1.8773 13 2.73616C13.6912 1.87712 14.5672 1.185 15.5628 0.711296C16.5585 0.237591 17.6481 -0.00550555 18.7507 9.46041e-05C22.7147 9.46041e-05 26 3.09617 26 7.00027C26 12.2337 22.7493 16.4818 19.6813 19.3419C17.949 20.9459 16.0523 22.3627 14.0227 23.5687C13.8539 23.6685 13.6836 23.7658 13.512 23.8607L13.4827 23.8767L13.4733 23.882L13.4693 23.8834C13.3247 23.96 13.1636 24 13 24C12.8364 24 12.6753 23.96 12.5307 23.8834L12.5267 23.882V23.8807Z"
              fill="#531741" />
          </svg>

          <!-- emoji -->
          <img :src="emoji5" class="absolute z-5 top-[480px] right-[128px]">

          <!-- Big Circle -->
          <svg class="absolute z-0 
            w-[60px] h-[60px] 
            bottom-[370px] left-[1300px]" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="30" fill="#32000E" />
          </svg>

          <!-- Small Brown Dot -->
          <svg class="absolute z-0 
            w-[8px] h-[8px] 
            bottom-[300px] right-[200px]" viewBox="0 0 8 8" fill="none">
            <circle cx="4" cy="4" r="4" fill="#7B4429" />
          </svg>

          <!-- Pink Dot -->
          <svg class="absolute z-0 
            w-[7px] h-[7px] 
            top-[70px] right-[1340px]" viewBox="0 0 7 7" fill="none">
            <circle cx="3.5" cy="3.5" r="3.5" fill="#FF6390" />
          </svg>

          <!-- Big Blur Circle -->
          <svg class="absolute z-0 opacity-70 
            w-[58px] h-[67px] 
            top-[100px] left-[-5px]" viewBox="0 0 58 67" fill="none">
            <circle cx="24.5" cy="33.5" r="33.5" fill="#411032" />
          </svg>

        </div>
        <!-- Top Image -->
        <div class="absolute z-0 top-[-96px] left-[-30px] lg:top-[-140px] lg:left-[960px]">
          <img :src="person1"
            class="w-[217.77px] h-[305px] object-cover rounded-[120px] lg:w-[286px] lg:h-[500px] lg:rounded-[150px]" />

          <!-- Chat bubble -->
          <div
            class="absolute top-[242.78px] left-[127.49px] lg:top-[400px] lg:left-[185px] w-[90.28px] h-[25.01px] lg:w-[144px] lg:h-[40px] bg-red-700 text-white shadow rounded-[14.64px] rounded-bl-none  
                  lg:rounded-[150px] lg:rounded-bl-none flex items-center justify-center font-[Nunito] font-semibold text-[8px] lg:font-[Nunito] lg:font-semibold lg:text-[12px] text-center">
            Hi! Nice to meet you
          </div>
        </div>

        <!-- Bottom Image -->
        <div class="absolute z-0 top-[658px] left-[162px] translate-x-10 lg:top-[340px] lg:left-[180px]">
          <img :src="person2"
            class="w-[269px] h-[376.75px] object-cover rounded-[120px] grayscale lg:w-[286px] lg:h-[500px] lg:rounded-[150px]" />

          <!-- Chat bubble -->
          <div
            class="absolute top-[58.77px] right-[130px] w-[115.29px] h-[30.89px] bg-red-700 text-white shadow rounded-[18px] rounded-br-none flex items-center justify-center font-[Nunito] font-semibold text-[10px] 
                      lg:top-[80px] lg:right-[175px] lg:w-[153px] lg:h-[41px] lg:rounded-[24px] lg:rounded-br-none lg:font-[Nunito] lg:font-semibold lg:text-[12px] text-center">
            Nice to meet you too!
          </div>
        </div>

        <div class="text-center max-w-md z-10 -translate-y-20">
          <h1 class="headline1 text-center mb-6">
            Make the <br /> first ‘Merry’
          </h1>
          <p class="body1 text-gray-300 mb-15 leading-relaxed">
            If you feel lonely, let's start meeting
            <br /> new people in your area!
            <br /> Don't forget to get Merry with us
          </p>

          <button
            class="font-[Nunito] font-bold text-[16px] leading-[150%] tracking-normal text-center bg-red-500 hover:bg-red-700 transition px-6 py-3 rounded-full shadow-lg">
            Start matching!
          </button>
        </div>

      </section>

      <!-- ================= WHY MERRY ================= -->
      <section id="why"
        class="scroll-mt-50 lg:scroll-mt-20 px-6 py-16 lg:max-w-[1120px] lg:mx-auto lg:flex lg:items-center lg:gap-16">

        <div class="lg:w-1/2">
          <h2 class="headline2 font-bold text-pink-400 mb-6">
            Why Merry Match?
          </h2>

          <div class="text-gray-300 leading-relaxed space-y-6">
            <p class="body1">
              Merry Match is a new generation of online dating website for everyone
            </p>

            <p class="body2">
              Whether you’re committed to dating, meeting new people, expanding your social network, meeting locals
              while
              traveling, or even just making a small chat with strangers.
            </p>

            <p class="body2">
              This site allows you to make your own dating profile, discover new people, save favorite profiles, and let
              them know that you’re interested
            </p>

          </div>
        </div>

        <!-- CARD ZONE -->
        <div class="relative mt-16 h-[260px] lg:mt-0 lg:w-1/3 lg:h-[420px]">

          <!-- FAST -->
          <div class="absolute bg-[#a02c6d] text-white shadow-md z-30 flex items-center rounded-[18px]
                w-[149px] h-[62px] left-[58px] top-0
                lg:w-[180px] lg:h-[70px] lg:left-[80px] lg:top-[50px]">

            <div class="absolute left-4 top-3 flex items-center">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.628 3.06669L7.51118 3.17393C5.66751 4.86648 2.94226 5.1758 0.766171 3.9395C0.243003 3.64218 0.351831 2.92036 0.943583 2.76317L9.61297 0.457061C10.1548 0.3128 10.657 0.772988 10.4961 1.26679L7.93124 9.136C7.75553 9.67427 6.96539 9.77044 6.64118 9.29319L4.41587 6.01448"
                  stroke="white" stroke-width="0.859794" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span class="font-['Nunito'] font-bold text-[14px] leading-[150%] ml-[6px]">
                Fast
              </span>
            </div>

            <svg class="absolute left-[85px] top-0 lg:left-[110px]" width="61" height="48" viewBox="0 0 61 48"
              fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M59.5391 27.7529C59.887 27.5614 60.1768 27.2794 60.3776 26.9367C60.5784 26.594 60.6828 26.2034 60.6799 25.8062C60.6769 25.409 60.5666 25.02 60.3606 24.6804C60.1547 24.3408 59.8608 24.0631 59.51 23.8768L38.0378 12.5082L20.3482 30.1978C19.935 30.611 19.3746 30.8431 18.7903 30.8431C18.2059 30.8431 17.6455 30.611 17.2324 30.1978C16.8192 29.7846 16.5871 29.2242 16.5871 28.6399C16.5871 28.0556 16.8192 27.4952 17.2324 27.082L34.9219 9.39241L23.5533 -12.0798C23.3671 -12.4306 23.0894 -12.7245 22.7498 -12.9305C22.4101 -13.1364 22.0212 -13.2467 21.624 -13.2497C21.2268 -13.2527 20.8362 -13.1482 20.4935 -12.9474C20.1508 -12.7466 19.8688 -12.4568 19.6773 -12.1089C9.93244 5.62777 3.28749 24.898 0.0288456 44.8713C-0.0276015 45.2163 -0.00113872 45.5698 0.106042 45.9025C0.213222 46.2353 0.398051 46.5377 0.645247 46.7849C0.892443 47.0321 1.19491 47.217 1.52766 47.3241C1.86042 47.4313 2.21389 47.4578 2.5589 47.4013C22.5322 44.1428 41.8025 37.4979 59.5391 27.7529Z"
                fill="#CF4FA9" />
            </svg>
          </div>

          <!-- SECURE -->
          <div class="absolute bg-purple-300 text-pink-900 shadow-lg z-10 flex items-center rounded-[18px]
                w-[250px] h-[68px] left-[14px] top-[54px]
                lg:w-[300px] lg:h-[80px] lg:left-[20px] lg:top-[110px]">

            <div class="absolute left-[160px] top-4 lg:left-[200px] lg:top-7 flex items-center">
              <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M0.648106 7.19468C1.73126 10.6503 7.59292 10.6503 8.67608 7.19468C8.79307 6.82145 8.86002 6.41454 8.86002 5.97202C8.86002 2.46737 9.01213 2.19378 8.67562 1.85672C8.33856 1.51966 5.21255 0.429688 4.66209 0.429688C4.11163 0.429688 0.985624 1.51966 0.649111 1.85672C0.312052 2.19378 0.464166 2.46737 0.464166 5.97202C0.464166 6.41454 0.531116 6.82145 0.648106 7.19468Z"
                  stroke="#7D2262" stroke-width="0.859794" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M3.23975 5.42228C3.81133 5.99477 4.73892 5.99501 5.31081 5.42284L6.40789 4.3252"
                  stroke="#7D2262" stroke-width="0.859794" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span
                style="font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 13.76px; line-height: 150%; letter-spacing: 0; margin-left: 6px;">
                Secure
              </span>
            </div>

            <svg class="absolute left-[18px] top-[16.5px] lg:left-[40px] lg:top-[28px]" width="61" height="52"
              viewBox="0 0 61 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M31.946 0.642002C31.5124 0.229777 30.9377 0 30.3403 0C29.7428 0 29.1681 0.229777 28.7346 0.642002C22.129 6.93317 13.3314 10.383 4.22276 10.2541C3.72653 10.2476 3.24117 10.3999 2.83715 10.689C2.43312 10.978 2.13148 11.3886 1.97603 11.8613C0.662754 15.8751 -0.00427958 20.0733 2.06597e-05 24.2977C2.06597e-05 42.8415 12.6465 58.4174 29.7584 62.8333C30.1401 62.932 30.5405 62.932 30.9222 62.8333C48.0341 58.4174 60.6805 42.8415 60.6805 24.2977C60.6805 19.9598 59.9866 15.7779 58.7045 11.8613C58.5496 11.388 58.2482 10.9767 57.8441 10.6871C57.4401 10.3975 56.9544 10.2447 56.4578 10.2509L56.0128 10.2541C46.6898 10.2541 38.2225 6.60273 31.946 0.642002ZM41.574 25.6583C41.7607 25.4088 41.8958 25.1244 41.9713 24.8218C42.0468 24.5192 42.0613 24.2045 42.0138 23.8962C41.9663 23.5879 41.8579 23.2922 41.6949 23.0266C41.5318 22.7609 41.3175 22.5306 41.0644 22.3492C40.8114 22.1678 40.5247 22.039 40.2213 21.9703C39.9179 21.9016 39.6038 21.8944 39.2976 21.9492C38.9914 22.0039 38.6991 22.1195 38.4381 22.2892C38.1771 22.4588 37.9525 22.6791 37.7775 22.937L27.7077 37.0742L22.6541 32.0061C22.2117 31.5926 21.6265 31.3675 21.0219 31.3782C20.4172 31.3889 19.8403 31.6346 19.4127 32.0634C18.9851 32.4922 18.7402 33.0708 18.7295 33.6772C18.7189 34.2835 18.9433 34.8704 19.3555 35.3141L26.3571 42.3359C26.5967 42.576 26.8855 42.7609 27.2035 42.8778C27.5215 42.9947 27.8611 43.0408 28.1986 43.0129C28.5361 42.985 28.8636 42.8837 29.1582 42.7162C29.4528 42.5486 29.7075 42.3187 29.9046 42.0425L41.574 25.6583Z"
                fill="#EFC4E2" />
            </svg>
          </div>

          <!-- EASY -->
          <div class="absolute bg-pink-200 text-pink-700 shadow-xl z-20 flex items-center rounded-[18px]
                w-[206px] h-[91px] left-[121px] top-[111px]
                lg:w-[260px] lg:h-[120px] lg:left-[160px] lg:top-[178px]">

            <div class="absolute left-[20px] top-[58px] lg:left-[20px] lg:top-[80px] flex items-center">
              <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M6.22287 0.817745L7.27034 2.91034C7.37299 3.11577 7.57115 3.25822 7.80093 3.29119L10.1442 3.62847C10.7231 3.71206 10.9535 4.41371 10.5345 4.81575L8.84004 6.44391C8.67352 6.60402 8.59772 6.83418 8.63711 7.06021L9.037 9.35883C9.13548 9.92745 8.53028 10.3613 8.01281 10.0923L5.91848 9.00624C5.71316 8.89969 5.46726 8.89969 5.26135 9.00624L3.16702 10.0923C2.64955 10.3613 2.04435 9.92745 2.14343 9.35883L2.54272 7.06021C2.58211 6.83418 2.50631 6.60402 2.33979 6.44391L0.645344 4.81575C0.226358 4.41371 0.456741 3.71206 1.03568 3.62847L3.3789 3.29119C3.60869 3.25822 3.80744 3.11577 3.91009 2.91034L4.95696 0.817745C5.21599 0.300335 5.96384 0.300335 6.22287 0.817745Z"
                  stroke="#C70039" stroke-width="0.859794" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span
                style="font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 13.76px; line-height: 150%; letter-spacing: 0; margin-left:8px">
                Easy
              </span>
            </div>

            <svg class="absolute left-[129px] top-[13.5px] lg:left-[184px] lg:top-[42px]" width="77" height="78"
              viewBox="0 0 77 78" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M55.2264 1.13545C59.0766 -1.80971 64.5757 1.36522 63.9502 6.17212L61.0394 28.5179L79.5882 41.3049C83.5841 44.0582 82.2658 50.2646 77.4944 51.1567L55.3492 55.2956L48.9166 76.8845C47.5315 81.536 41.223 82.1981 38.9018 77.9404L28.1216 58.1558L5.59741 58.7122C0.749566 58.8308 -1.8292 53.0328 1.50446 49.5111L16.9847 33.1459L9.4965 11.8981C7.88341 7.31986 12.5991 3.07497 16.9815 5.15888L37.3297 14.8292L55.2243 1.13905L55.2264 1.13545Z"
                fill="#DF89C6" />
            </svg>
          </div>

          <!-- รูปคน -->
          <img :src="person4" class="absolute top-[158.2px] left-[40.23px] w-[60.18px] h-[60.18px] rounded-full object-cover lg:w-[80px] lg:h-[80px] 
            lg:top-[260px] lg:left-[60px]" />

          <img :src="person3" class="absolute top-[28.27px] left-[245.68px] w-[37.83px] h-[37.83px] rounded-full object-cover lg:w-[50px] lg:h-[50px] 
            lg:top-[74px] lg:left-[300px]" />

          <!-- วงกลม -->
          <div class="absolute left-2 top-[180px] w-2 h-2 bg-purple-400 rounded-full lg:left-[10px] lg:top-[300px]">
          </div>
          <div class="absolute right-2 top-[10px] w-2 h-2 bg-beige-800 rounded-full lg:right-[-30px] lg:top-[50px]">
          </div>

        </div>
      </section>

      <!-- ================= HOW TO MERRY ================= -->
      <section id="how" class="scroll-mt-50 lg:scroll-mt-20 px-6 pb-20 pt-15">

        <h2 class="text-center headline2 font-bold text-purple-300 mb-12">
          How to Merry
        </h2>

        <div class="space-y-6 lg:flex gap-6 lg:px-40">

          <!-- Card -->
          <div v-for="(card, index) in cards" :key="index"
            class="bg-purple-900 rounded-[40px] p-8 text-center shadow-lg lg:w-[262px] lg:h-[348px]">
            <div
              class="w-[120px] h-[120px] mx-auto mb-8 flex items-center justify-center rounded-full bg-purple-800 text-2xl">
              <img :src="card.icon" class="w-10 h-10 object-contain " />
            </div>

            <h3 class="headline4 mb-3">
              {{ card.title }}
            </h3>

            <p class="body2 text-gray-500">
              {{ card.desc }}
            </p>
          </div>

        </div>
      </section>

      <!-- ================= FINAL CTA ================= -->
      <section class="w-full flex justify-center lg:py-20">
        <div class="relative w-full max-w-[375px] h-[564px] 
           lg:max-w-[1120px] lg:h-[369px]
           rounded-none lg:rounded-[40px]
           overflow-hidden flex items-center justify-center">>
          <!-- Gradient Background -->
          <div class="absolute inset-0"
            style="background: radial-gradient(106.64% 594.8% at 3.13% 0%, #820025 35.64%, #A95BCD 100%);">
          </div>

          <!-- Heart Shape #1 -->
          <svg class="absolute"
            style="width: 217px; height: 201px; top: 20px; left: -45px; opacity: 0.3; transform: rotate(-15deg);"
            viewBox="0 0 24 24" fill="#FF6390">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>

          <!-- Heart Shape #2 -->
          <svg
            class="absolute opacity-50 w-[30px] h-[28px] bottom-[110px] right-[40px] lg:bottom-[130px] lg:right-[80px]"
            style="transform: rotate(-9.53deg);" viewBox="0 0 24 24" fill="#DF89C6">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>

          <!-- Heart Shape #3 -->
          <svg
            class="absolute opacity-50 w-[116px] h-[107px] bottom-[-5px] right-[-40px] lg:bottom-[10px] lg:right-[-20px]"
            style="transform: rotate(15deg);" viewBox="0 0 24 24" fill="#DF89C6">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>

          <!-- Content -->
          <div class="relative text-center z-10 px-6 text-white">

            <h2 class="headline2 font-bold leading-tight pb-10">
              Let’s start finding <br /> and matching someone new
            </h2>

            <button
              class="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:opacity-90 transition">
              Start matching!
            </button>

          </div>

        </div>
      </section>

    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '@/layouts/MainLayout.vue'
import person1 from '@/assets/icons/person-1.jpg'
import person2 from '@/assets/icons/person-2.jpg'
import person3 from '@/assets/icons/person-3.jpg'
import person4 from '@/assets/icons/person-4.jpg'
import emoji1 from '../assets/icons/emoji-1.png'
import emoji2 from '../assets/icons/emoji-2.png'
import emoji3 from '../assets/icons/emoji-3.png'
import emoji4 from '../assets/icons/emoji-4.png'
import emoji5 from '../assets/icons/emoji-5.png'

const cards = [
  {
    icon: emoji1,
    title: "Upload your cool picture",
    desc: "Lorem ipsum is a placeholder text",
  },
  {
    icon: emoji2,
    title: "Explore and find the one you like",
    desc: "Lorem ipsum is a placeholder text",
  },
  {
    icon: emoji3,
    title: "Click ‘Merry’ for get to know!",
    desc: "Lorem ipsum is a placeholder text",
  },
  {
    icon: emoji4,
    title: "Start chatting and relationship",
    desc: "Lorem ipsum is a placeholder text",
  },
];

</script>