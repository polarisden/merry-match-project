<script setup>
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { apiUrl } from "@/lib/apiBase"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

/** Internal path only (avoid open redirects). */
function safeInternalRedirect(raw) {
  if (typeof raw !== "string") return ""
  const t = raw.trim()
  if (!t.startsWith("/") || t.startsWith("//")) return ""
  return t
}

const loginImage = new URL("../assets/icons/image_login.svg", import.meta.url).href
const ellipse2Icon = new URL("../assets/icons/Ellipse2.svg", import.meta.url).href
const ellipse3Icon = new URL("../assets/icons/Ellipse3.svg", import.meta.url).href

const email = ref("")
const password = ref("")

const loginLoading = ref(false)
const loginError = ref("")

// NOTE: If your backend uses a different path/field names, update this.
const LOGIN_ENDPOINT = apiUrl("/api/auth/login")

async function submitLogin() {
  loginError.value = ""

  if (!email.value) return (loginError.value = "Please enter your email.")
  if (!password.value) return (loginError.value = "Please enter your password.")

  try {
    loginLoading.value = true

    const payload = {
      email: email.value.trim().toLowerCase(),
      password: password.value,
    }

    const res = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const contentType = res.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json") ? await res.json() : await res.text()

    if (!res.ok) {
      if (typeof body === "string") {
        loginError.value = body
      } else {
        loginError.value =
          body?.message ?? body?.error ?? body?.status ?? `Login failed with status ${res.status}`
        // If backend only returns {error:"Bad Request"}, show raw JSON too.
        loginError.value = `${loginError.value}`
      }
      return
    }

    // If backend returns a token, store it here for auto-login flows.
    if (typeof body === "object" && body) {
      const token =
        body.token ??
        body.accessToken ??
        body.access_token ??
        body.data?.token ??
        body.data?.accessToken ??
        body.data?.access_token

      if (token && typeof token === "string") {
        authStore.setToken(token)
      }
    }
    const next = safeInternalRedirect(typeof route.query.redirect === "string" ? route.query.redirect : "")
    router.push(next || "/")
  } catch (e) {
    loginError.value = e instanceof Error ? e.message : "Login failed"
  } finally {
    loginLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-200 flex justify-start lg:justify-center">
    <div class="w-full max-w-[390px] lg:max-w-[1200px] mx-auto px-4 pt-6 pb-10 lg:px-10 lg:pt-12 lg:pb-16">
      <div class="lg:grid lg:grid-cols-[420px_1fr] lg:items-center lg:gap-x-[130px]">
        <div class="flex justify-center lg:justify-start lg:w-[450px]">
          <img
            :src="loginImage"
            alt="Login illustration"
            class="w-[177px] h-[266px] lg:w-[450px] lg:h-[677px] rounded-full object-cover"
          />
        </div>

        <img
          :src="ellipse2Icon"
          alt=""
          aria-hidden="true"
          class="hidden lg:block fixed left-0 top-[86px] w-[81px] h-[100px] pointer-events-none select-none z-10"
        />
        <img
          :src="ellipse3Icon"
          alt=""
          aria-hidden="true"
          class="hidden lg:block fixed left-[80px] top-[210px] w-2 h-2 pointer-events-none select-none z-10"
        />

        <div class="mt-7 lg:mt-0 lg:max-w-[343px]">
          <p class="text-[14px] tracking-wide uppercase text-beige-700 tagline">
            Login
          </p>

          <h1 class="mt-2 text-purple-500 text-[42px] leading-[1.03] headline3 tracking-[-0.02em]">
            Welcome back to
            <br />
            Merry Match
          </h1>
  
          <form
            class="mt-8 space-y-6"
            @submit.prevent="submitLogin"
          >
            <div>
              <label
                for="email"
                class="block text-[18px] leading-[1.2] text-black body2"
              >
                Email
              </label>
              <input
                id="email"
                type="text"
                placeholder="Enter email"
                class="mt-2 w-full h-11 rounded-lg border body2 border-gray-400 bg-gray-200 px-3 text-[18px] text-gray-900 placeholder:text-gray-500 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                v-model="email"
              />
            </div>
  
            <div>
              <label
                for="password"
                class="block text-[18px] leading-[1.2] text-black body2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter password"
                class="mt-2 w-full h-11 rounded-lg border body2 border-gray-400 bg-gray-200 px-3 text-[18px] text-gray-900 placeholder:text-gray-500 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                v-model="password"
              />
            </div>

            <p
              v-if="loginError"
              class="mt-2 text-red-500 text-sm"
            >
              {{ loginError }}
            </p>
  
            <button
              type="submit"
              class="mt-1 w-[343px] max-w-full h-12 rounded-full body4 bg-red-500 text-white text-[20px] font-semibold leading-none"
              :disabled="loginLoading"
            >
              {{ loginLoading ? "Loading..." : "Log in" }}
            </button>
          </form>
  
          <p class="mt-8 body2 leading-[1.1] text-black">
            Don’t have an account?
            <RouterLink
              to="/Register"
              class="ml-2 text-red-500 body2"
            >
              Register
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
