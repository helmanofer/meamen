<template>
  <div class="calendar-header bg-white border-b border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <!-- Left Section - Navigation -->
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-1">
          <button
            class="p-2 text-medium-gray hover:text-dark-gray hover:bg-light-gray rounded-md transition-colors"
            @click="$emit('navigate', 'previous')"
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
            class="px-3 py-2 text-sm font-medium text-primary-blue hover:bg-primary-blue hover:text-white rounded-md transition-colors"
            @click="$emit('navigate', 'today')"
          >
            Today
          </button>
          
          <button
            class="p-2 text-medium-gray hover:text-dark-gray hover:bg-light-gray rounded-md transition-colors"
            @click="$emit('navigate', 'next')"
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

        <!-- Current Date Display -->
        <div class="flex items-center space-x-3">
          <h1 class="text-2xl font-bold text-dark-gray">
            {{ formattedDate }}
          </h1>
          <div class="text-sm text-medium-gray">
            {{ formattedSubtitle }}
          </div>
        </div>
      </div>

      <!-- Right Section - View Controls -->
      <div class="flex items-center space-x-4">
        <!-- View Selector -->
        <div class="flex items-center bg-light-gray rounded-lg p-1">
          <button
            v-for="view in views"
            :key="view.value"
            class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
            :class="currentView === view.value 
              ? 'bg-white text-primary-blue shadow-sm' 
              : 'text-medium-gray hover:text-dark-gray'"
            @click="$emit('view-change', view.value)"
          >
            {{ view.label }}
          </button>
        </div>

        <!-- Calendar Options Menu -->
        <div class="relative">
          <button
            class="p-2 text-medium-gray hover:text-dark-gray hover:bg-light-gray rounded-md transition-colors"
            @click="showOptionsMenu = !showOptionsMenu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Options Dropdown -->
          <div
            v-if="showOptionsMenu"
            class="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10"
          >
            <div class="p-4 space-y-3">
              <h3 class="text-sm font-semibold text-dark-gray">
                Calendar Options
              </h3>
              
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="localPreferences.showWeekends"
                    type="checkbox"
                    class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    @change="updatePreferences"
                  >
                  <span class="ml-2 text-sm text-dark-gray">Show weekends</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    v-model="localPreferences.showCompletedSessions"
                    type="checkbox"
                    class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    @change="updatePreferences"
                  >
                  <span class="ml-2 text-sm text-dark-gray">Show completed sessions</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    v-model="localPreferences.showCancelledSessions"
                    type="checkbox"
                    class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    @change="updatePreferences"
                  >
                  <span class="ml-2 text-sm text-dark-gray">Show cancelled sessions</span>
                </label>
                
                <label class="flex items-center">
                  <input
                    v-model="localPreferences.compactView"
                    type="checkbox"
                    class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                    @change="updatePreferences"
                  >
                  <span class="ml-2 text-sm text-dark-gray">Compact view</span>
                </label>
              </div>

              <div class="border-t border-gray-200 pt-3">
                <label class="block text-sm font-medium text-dark-gray mb-2">Working Hours</label>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs text-medium-gray">Start</label>
                    <select
                      v-model="localWorkingHours.start"
                      class="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      @change="updateWorkingHours"
                    >
                      <option
                        v-for="hour in 24"
                        :key="hour-1"
                        :value="hour-1"
                      >
                        {{ formatHour(hour-1) }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-medium-gray">End</label>
                    <select
                      v-model="localWorkingHours.end"
                      class="w-full text-sm border border-gray-300 rounded px-2 py-1"
                      @change="updateWorkingHours"
                    >
                      <option
                        v-for="hour in 24"
                        :key="hour-1"
                        :value="hour-1"
                      >
                        {{ formatHour(hour-1) }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Session Button -->
        <button
          class="btn btn-primary flex items-center"
          @click="$emit('create-session')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          New Session
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  currentDate: {
    type: Date,
    required: true
  },
  currentView: {
    type: String,
    required: true
  },
  preferences: {
    type: Object,
    required: true
  },
  workingHours: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['navigate', 'view-change', 'create-session', 'preferences-update', 'working-hours-update'])

// Component state
const showOptionsMenu = ref(false)
const localPreferences = ref({ ...props.preferences })
const localWorkingHours = ref({ ...props.workingHours })

// View options
const views = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' }
]

// Computed properties
const formattedDate = computed(() => {
  const options = { year: 'numeric', month: 'long' }
  
  switch (props.currentView) {
    case 'month':
      return props.currentDate.toLocaleDateString('en-US', options)
    case 'week':
      const weekStart = new Date(props.currentDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      } else {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`
      }
    case 'day':
      return props.currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    default:
      return ''
  }
})

const formattedSubtitle = computed(() => {
  const today = new Date()
  const isToday = props.currentDate.toDateString() === today.toDateString()
  
  switch (props.currentView) {
    case 'month':
      return isToday ? 'This month' : ''
    case 'week':
      const weekStart = new Date(props.currentDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      
      if (today >= weekStart && today <= weekEnd) {
        return 'This week'
      }
      return ''
    case 'day':
      return isToday ? 'Today' : ''
    default:
      return ''
  }
})

// Methods
const formatHour = (hour) => {
  const time = new Date()
  time.setHours(hour, 0, 0, 0)
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  })
}

const updatePreferences = () => {
  emit('preferences-update', { ...localPreferences.value })
}

const updateWorkingHours = () => {
  emit('working-hours-update', { ...localWorkingHours.value })
}

// Watch for prop changes to update local state
watch(() => props.preferences, (newPreferences) => {
  localPreferences.value = { ...newPreferences }
}, { deep: true })

watch(() => props.workingHours, (newWorkingHours) => {
  localWorkingHours.value = { ...newWorkingHours }
}, { deep: true })

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    showOptionsMenu.value = false
  }
})
</script>