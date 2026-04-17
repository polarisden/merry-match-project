import { ref } from "vue"

export function useNotices() {
  const error = ref("")
  const success = ref("")
  const loading = ref(false)

  function clear() {
    error.value = ""
    success.value = ""
  }

  function setError(message) {
    error.value = message || ""
  }

  function setSuccess(message) {
    success.value = message || ""
  }

  function setLoading(value) {
    loading.value = Boolean(value)
  }

  return {
    error,
    success,
    loading,
    clear,
    setError,
    setSuccess,
    setLoading,
  }
}

