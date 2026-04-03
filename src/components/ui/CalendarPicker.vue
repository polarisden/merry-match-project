<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import CalendarIcon from "@/assets/icons/calendar.svg?component" 

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Select date",
  },
})

const emit = defineEmits(["update:modelValue"])

const isOpen = ref(false)
const rootEl = ref(null)
const today = new Date()
const minYear = computed(() => today.getFullYear() - 100)

const maxBirthDate = computed(() => {
  const date = new Date(today)
  date.setFullYear(date.getFullYear() - 18)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
})

const currentMonth = ref(
  props.modelValue ? new Date(props.modelValue).getMonth() : today.getMonth(),
)
const currentYear = ref(
  props.modelValue ? new Date(props.modelValue).getFullYear() : 2008,
)

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const yearOptions = computed(() => {
  const maxYear = maxBirthDate.value.getFullYear()
  const min = minYear.value
  return Array.from({ length: maxYear - min + 1 }, (_, index) => maxYear - index)
})

const selectedDate = computed(() => {
  return props.modelValue ? new Date(props.modelValue) : null
})

const calendarDays = computed(() => {
  const firstDayIndex = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()

  const days = []

  for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i
    days.push({
      key: `prev-${day}`,
      day,
      date: new Date(currentYear.value, currentMonth.value - 1, day),
      outside: true,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      key: `current-${day}`,
      day,
      date: new Date(currentYear.value, currentMonth.value, day),
      outside: false,
    })
  }

  const remainder = (7 - (days.length % 7)) % 7
  for (let day = 1; day <= remainder; day += 1) {
    days.push({
      key: `next-${day}`,
      day,
      date: new Date(currentYear.value, currentMonth.value + 1, day),
      outside: true,
    })
  }

  return days
})

const displayValue = computed(() => {
  const defaultPlaceholder = maxBirthDate.value.toLocaleDateString("en-GB")
  if (!selectedDate.value) return defaultPlaceholder
  return selectedDate.value.toLocaleDateString("en-GB")
})

const canGoNextMonth = computed(() => {
  const thisYear = today.getFullYear()
  const thisMonth = today.getMonth()
  if (currentYear.value < thisYear) return true
  return currentMonth.value < thisMonth
})

const canGoPrevMonth = computed(() => {
  return !(currentYear.value === minYear.value && currentMonth.value === 0)
})

function goPrevMonth() {
  if (!canGoPrevMonth.value) return
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value -= 1
    return
  }
  currentMonth.value -= 1
}

function goNextMonth() {
  if (!canGoNextMonth.value) return
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value += 1
    return
  }
  currentMonth.value += 1
}

function selectDate(date) {
  if (isAfterMaxDate(date)) return
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  emit("update:modelValue", `${year}-${month}-${day}`)
  isOpen.value = false
}

function isAfterMaxDate(date) {
  return date > maxBirthDate.value
}

function isSameDate(a, b) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isTodayMonthAndDay(date) {
  return date.getMonth() === today.getMonth() && date.getDate() === today.getDate()
}

function handleClickOutside(event) {
  if (!rootEl.value) return
  if (!rootEl.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) return
    const date = new Date(newValue)
    if (Number.isNaN(date.getTime())) return
    currentMonth.value = date.getMonth()
    currentYear.value = date.getFullYear()
  },
)
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 pr-10 text-left text-[13px] outline-none transition focus:ring-2 focus:ring-purple-200 lg:bg-white"
      @click="isOpen = !isOpen"
    >
      <span :class="selectedDate ? 'body2 text-gray-900' : 'body2 text-gray-500'">
        {{ displayValue }}
      </span>
    </button>
    <CalendarIcon
      class="pointer-events-none absolute right-4 top-[10px] size-6 text-gray-500"
      aria-hidden="true"
    />

    <div
      v-if="isOpen"
      class="absolute z-20 mt-2 w-full min-w-[280px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
    >
      <div class="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          aria-label="Previous month"
          :disabled="!canGoPrevMonth"
          :class="{ 'opacity-40 cursor-not-allowed': !canGoPrevMonth }"
          @click="goPrevMonth"
        >
          &lt;
        </button>

        <div class="flex flex-1 items-center justify-center gap-2">
          <select
            v-model.number="currentMonth"
            class="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-purple-200"
            aria-label="Select month"
          >
            <option
              v-for="(monthName, monthIndex) in monthNames"
              :key="monthName"
              :value="monthIndex"
            >
              {{ monthName }}
            </option>
          </select>

          <select
            v-model.number="currentYear"
            class="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-purple-200"
            aria-label="Select year"
          >
            <option v-for="year in yearOptions" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          aria-label="Next month"
          :disabled="!canGoNextMonth"
          :class="{ 'opacity-40 cursor-not-allowed': !canGoNextMonth }"
          @click="goNextMonth"
        >
          &gt;
        </button>
      </div>

      <div class="mb-1 grid grid-cols-7 gap-1">
        <span
          v-for="day in weekdays"
          :key="day"
          class="text-center text-[11px] font-medium text-gray-500"
        >
          {{ day }}
        </span>
      </div>

      <div class="grid grid-cols-7 place-items-center gap-1">
        <button
          v-for="item in calendarDays"
          :key="item.key"
          type="button"
          class="flex size-8 items-center justify-center rounded-full text-sm transition"
          :class="[
            item.outside ? 'text-gray-400' : 'text-gray-800',
            isAfterMaxDate(item.date) ? 'opacity-35 cursor-not-allowed hover:bg-transparent' : '',
            isTodayMonthAndDay(item.date) && !isSameDate(selectedDate, item.date)
              ? 'rounded-full ring-1 ring-purple-500'
              : '',
            isSameDate(selectedDate, item.date)
              ? 'bg-purple-500 text-white hover:bg-purple-500'
              : 'hover:bg-purple-100',
          ]"
          :disabled="isAfterMaxDate(item.date)"
          @click="selectDate(item.date)"
        >
          {{ item.day }}
        </button>
      </div>
    </div>
  </div>
</template>
