import { defineStore } from "pinia"

const TOKEN_KEY = "token"

function safeReadToken() {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(TOKEN_KEY) ?? ""
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: safeReadToken(),
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(newToken) {
      const token = typeof newToken === "string" ? newToken : ""
      this.token = token

      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    },
    clearToken() {
      this.setToken("")
    },
    hydrate() {
      // Re-sync from localStorage (useful after hard refresh / manual storage changes)
      this.token = safeReadToken()
    },
    getAuthHeader() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {}
    },
  },
})

