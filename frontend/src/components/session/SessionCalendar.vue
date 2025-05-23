<template>
  <div class="session-calendar card">
    <!-- Calendar Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <h2 class="text-h2 font-semibold text-dark-gray">
          {{ currentMonth }} {{ currentYear }}
        </h2>
        <div class="flex items-center space-x-2">
          <button
            class="p-2 text-medium-gray hover:text-dark-gray hover:bg-light-gray rounded-md"
            @click="previousMonth"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button
            class="p-2 text-medium-gray hover:text-dark-gray hover:bg-light-gray rounded-md"
            @click="nextMonth"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          class="btn btn-secondary text-sm"
          @click="goToToday"
        >
          Today
        </button>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-medium-gray">View:</span>
          <select
            v-model="viewMode"
            class="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="month">
              Month
            </option>
            <option value="week">
              Week
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Week View -->
      <div
        v-if="viewMode === 'week'"
        class="week-view"
      >
        <!-- Week Header -->
        <div class="grid grid-cols-8 gap-2 mb-4">
          <div class="text-xs font-medium text-medium-gray text-center py-2">
            Time
          </div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="text-xs font-medium text-medium-gray text-center py-2"
          >
            <div>{{ day.name }}</div>
            <div
              class="text-lg font-semibold"
              :class="{ 'text-primary-blue': day.isToday }"
            >
              {{ day.date }}
            </div>
          </div>
        </div>

        <!-- Week Time Slots -->
        <div class="grid grid-cols-8 gap-2 auto-rows-min">
          <div
            v-for="hour in timeSlots"
            :key="hour"
            class="contents"
          >
            <!-- Time Label -->
            <div class="text-xs text-medium-gray text-right py-2 pr-2 border-r border-gray-200">
              {{ formatHour(hour) }}
            </div>
            
            <!-- Day Columns -->
            <div
              v-for="day in weekDays"
              :key="`${day.date}-${hour}`"
              class="relative min-h-12 border border-gray-100 hover:bg-light-gray cursor-pointer"
              @click="handleTimeSlotClick(day.dateObj, hour)"
            >
              <!-- Sessions in this time slot -->
              <div
                v-for="session in getSessionsForTimeSlot(day.dateObj, hour)"
                :key="session.id"
                class="absolute inset-x-1 top-1 bg-primary-blue text-white text-xs p-1 rounded cursor-pointer hover:bg-primary-blue/80"
                @click.stop="$emit('session-click', session)"
              >
                <div class="font-medium truncate">
                  {{ session.title }}
                </div>
                <div class="truncate opacity-75">
                  {{ session.trainee_name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month View -->
      <div
        v-else
        class="month-view"
      >
        <!-- Day Names Header -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div
            v-for="dayName in dayNames"
            :key="dayName"
            class="text-sm font-medium text-medium-gray text-center py-2"
          >
            {{ dayName }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-2 auto-rows-fr">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            class="min-h-24 border border-gray-200 rounded-md p-2 hover:bg-light-gray cursor-pointer transition-colors"
            :class="{
              'bg-light-gray': !day.isCurrentMonth,
              'bg-primary-blue/10 border-primary-blue': day.isToday,
              'border-primary-blue': day.isSelected
            }"
            @click="handleDayClick(day)"
          >
            <!-- Day Number -->
            <div
              class="text-sm font-medium mb-1"
              :class="{
                'text-medium-gray': !day.isCurrentMonth,
                'text-primary-blue font-bold': day.isToday,
                'text-dark-gray': day.isCurrentMonth && !day.isToday
              }"
            >
              {{ day.day }}
            </div>

            <!-- Sessions for this day -->
            <div class="space-y-1">
              <div
                v-for="session in day.sessions.slice(0, 3)"
                :key="session.id"
                class="text-xs bg-primary-blue text-white px-1 py-0.5 rounded cursor-pointer hover:bg-primary-blue/80"
                @click.stop="$emit('session-click', session)"
              >
                <div class="truncate">
                  {{ formatTime(session.scheduled_at) }} {{ session.title }}
                </div>
              </div>
              
              <!-- More sessions indicator -->
              <div
                v-if="day.sessions.length > 3"
                class="text-xs text-medium-gray font-medium"
              >
                +{{ day.sessions.length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-primary-blue rounded" />
          <span class="text-sm text-medium-gray">Scheduled Sessions</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-success rounded" />
          <span class="text-sm text-medium-gray">Completed Sessions</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-warning rounded" />
          <span class="text-sm text-medium-gray">Pending Sessions</span>
        </div>
      </div>
      
      <div class="text-sm text-medium-gray">
        Click any date to schedule a new session
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['session-click', 'date-click', 'time-slot-click'])

// Component state
const currentDate = ref(new Date())
const selectedDate = ref(null)
const viewMode = ref('month')

// Constants
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6) // 6 AM to 7 PM

// Computed properties
const currentMonth = computed(() => monthNames[currentDate.value.getMonth()])
const currentYear = computed(() => currentDate.value.getFullYear())

const weekDays = computed(() => {
  const startOfWeek = new Date(currentDate.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    const today = new Date()
    
    return {
      name: dayNames[date.getDay()],
      date: date.getDate(),
      dateObj: new Date(date),
      isToday: date.toDateString() === today.toDateString()
    }
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  
  // Start of calendar (including previous month days)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // End of calendar (including next month days)
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
  
  const days = []
  const currentDateObj = new Date(startDate)
  const today = new Date()
  
  while (currentDateObj <= endDate) {
    const dayDate = new Date(currentDateObj)
    const daySession = props.sessions.filter(session => {
      const sessionDate = new Date(session.scheduled_at)
      return sessionDate.toDateString() === dayDate.toDateString()
    })
    
    days.push({
      date: dayDate.toISOString(),
      day: dayDate.getDate(),
      isCurrentMonth: dayDate.getMonth() === month,
      isToday: dayDate.toDateString() === today.toDateString(),
      isSelected: selectedDate.value && dayDate.toDateString() === selectedDate.value.toDateString(),
      sessions: daySession
    })
    
    currentDateObj.setDate(currentDateObj.getDate() + 1)
  }
  
  return days
})

// Methods
const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const handleDayClick = (day) => {
  selectedDate.value = new Date(day.date)
  emit('date-click', selectedDate.value)
}

const handleTimeSlotClick = (date, hour) => {
  const slotDateTime = new Date(date)
  slotDateTime.setHours(hour, 0, 0, 0)
  emit('time-slot-click', slotDateTime)
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatHour = (hour) => {
  const time = new Date()
  time.setHours(hour, 0, 0, 0)
  return time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const getSessionsForTimeSlot = (date, hour) => {
  return props.sessions.filter(session => {
    const sessionDate = new Date(session.scheduled_at)
    return sessionDate.toDateString() === date.toDateString() &&
           sessionDate.getHours() === hour
  })
}

// Watch for view mode changes to adjust current date display
watch(viewMode, (newMode) => {
  if (newMode === 'week') {
    // Ensure we're showing the week containing today if no date is selected
    if (!selectedDate.value) {
      currentDate.value = new Date()
    }
  }
})
</script>

<style scoped>
.calendar-grid {
  @apply w-full;
}

.week-view {
  @apply w-full overflow-x-auto;
  min-width: 800px;
}

.month-view .grid {
  min-height: 400px;
}

.auto-rows-fr {
  grid-auto-rows: 1fr;
}

.auto-rows-min {
  grid-auto-rows: min-content;
}
</style>