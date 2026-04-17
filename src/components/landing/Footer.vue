<template>
    <footer class="bg-[#f5f6fa] text-center pt-6 pb-6 border-t">

        <!-- Logo -->
        <div class="flex justify-center">
            <LogoFooter />
        </div>

        <!-- Subtitle -->
        <p class="text-gray-700 body1 px-4 lg:text-lg max-w-md lg:max-w-xl mx-auto leading-relaxed">
            New generation of online dating website for everyone
        </p>

        <!-- Copyright -->
        <p class="text-gray-600 body4 pt-16 pb-6 lg:text-sm lg:mb-8">
            copyright ©2022 merrymatch.com All rights reserved
        </p>

        <!-- Social Icons -->
        <div class="flex justify-center gap-4 lg:gap-6">
            <div
                class="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center hover:scale-110 transition">
                <FbIcon />
            </div>

            <div
                class="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center hover:scale-110 transition">
                <IgIcon />
            </div>

            <div
                class="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center hover:scale-110 transition">
                <TwIcon />
            </div>
        </div>

    </footer>
</template>

<script setup>
import LogoFooter from '@/assets/icons/logo-footer.svg'
import FbIcon from '@/assets/icons/fb.svg'
import IgIcon from '@/assets/icons/ig.svg'
import TwIcon from '@/assets/icons/tw.svg'
</script>