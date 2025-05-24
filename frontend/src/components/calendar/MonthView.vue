<template>
  <div class="month-view">
    <!-- Day Names Header -->
    <div class="grid grid-cols-7 gap-1 mb-1">
      <div
        v-for="dayName in dayNames"
        :key="dayName"
        class="text-sm font-medium text-medium-gray text-center py-3"
      >
        {{ dayName }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1 auto-rows-fr">
      <div
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        class="min-h-32 border border-gray-200 rounded-lg p-2 cursor-pointer transition-all duration-200 hover:bg-light-gray"
        :class="{
          'bg-gray-50': !day.isCurrentMonth,
          'bg-primary-blue/5 border-primary-blue': day.isToday,
          'bg-primary-blue/10 border-primary-blue border-2': day.isSelected,
          'opacity-50': !day.isCurrentMonth && !preferences.showWeekends && isWeekend(day.date)
        }"
        @click="handleDayClick(day)"
        @dragover.prevent
        @drop="handleDrop(day.date, $event)"
      >
        <!-- Day Number -->
        <div
          class="text-sm font-medium mb-2"
          :class="{
            'text-medium-gray': !day.isCurrentMonth,
            'text-primary-blue font-bold': day.isToday,
            'text-dark-gray': day.isCurrentMonth && !day.isToday
          }"
        >
          {{ day.date.getDate() }}
        </div>

        <!-- Day Availability Status -->
        <div
          v-if="day.availability.blocked"
          class="mb-2"
        >
          <div class="text-xs bg-error/10 text-error px-1 py-0.5 rounded flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                clip-rule="evenodd"
              />
            </svg>
            Blocked
          </div>
        </div>

        <!-- Sessions -->
        <div class="space-y-1">
          <div
            v-for="session in getFilteredSessions(day.sessions)"
            :key="session.id"
            class="session-item text-xs px-2 py-1 rounded cursor-pointer transition-colors"
            :class="getSessionClasses(session)"
            draggable="true"
            @click.stop="$emit('session-click', session)"
            @dragstart="handleSessionDragStart(session, $event)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">
                  {{ formatTime(session.scheduled_at) }} {{ session.title }}
                </div>
                <div class="text-xs opacity-75 truncate">
                  {{ session.trainee_name }}
                </div>
              </div>
              <div
                v-if="session.status === 'completed'"
                class="ml-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- More sessions indicator -->
          <div
            v-if="getHiddenSessionsCount(day.sessions) > 0"
            class="text-xs text-medium-gray font-medium px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
            @click.stop="$emit('show-more-sessions', day.date, day.sessions)"
          >
            +{{ getHiddenSessionsCount(day.sessions) }} more
          </div>
        </div>

        <!-- Drop Zone Indicator -->
        <div
          v-if="isDragOver && draggedSession"
          class="absolute inset-0 bg-primary-blue/20 border-2 border-primary-blue border-dashed rounded-lg flex items-center justify-center"
        >
          <div class="text-primary-blue font-medium">
            Drop here
          </div>
        </div>
      </div>
    </div>

    <!-- Session Detail Modal Trigger -->
    <SessionDetailModal
      v-if="selectedSession"
      :session="selectedSession"
      @close="selectedSession = null"
      @edit="$emit('edit-session', $event)"
      @delete="$emit('delete-session', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SessionDetailModal from '@/components/session/SessionDetailModal.vue'

const props = defineProps({
  currentDate: {
    type: Date,
    required: true
  },
  calendarDays: {
    type: Array,
    required: true
  },
  selectedDate: {
    type: Date,
    default: null
  },
  preferences: {
    type: Object,
    required: true
  },
  draggedSession: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'day-click',
  'session-click', 
  'edit-session', 
  'delete-session',
  'session-drag-start',
  'session-drop',
  'show-more-sessions'
])

// Component state
const selectedSession = ref(null)
const isDragOver = ref(false)

// Constants
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const maxVisibleSessions = 3

// Computed
const draggedSession = computed(() => props.draggedSession)

// Methods
const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const handleDayClick = (day) => {
  emit('day-click', day.date)
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const getFilteredSessions = (sessions) => {
  let filtered = [...sessions]
  
  if (!props.preferences.showCompletedSessions) {
    filtered = filtered.filter(s => s.status !== 'completed')
  }
  
  if (!props.preferences.showCancelledSessions) {
    filtered = filtered.filter(s => s.status !== 'cancelled')
  }
  
  // Sort by time
  filtered.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
  
  // Limit visible sessions
  return filtered.slice(0, maxVisibleSessions)
}

const getHiddenSessionsCount = (sessions) => {
  const filtered = getFilteredSessions(sessions)
  const total = sessions.filter(s => {
    if (!props.preferences.showCompletedSessions && s.status === 'completed') return false
    if (!props.preferences.showCancelledSessions && s.status === 'cancelled') return false
    return true
  }).length
  
  return Math.max(0, total - maxVisibleSessions)
}

const getSessionClasses = (session) => {
  const baseClasses = 'hover:opacity-80'
  
  switch (session.status) {
    case 'scheduled':
      return `${baseClasses} bg-primary-blue text-white`
    case 'completed':
      return `${baseClasses} bg-success text-white`
    case 'cancelled':
      return `${baseClasses} bg-error text-white`
    case 'in_progress':
      return `${baseClasses} bg-warning text-dark-gray`
    default:
      return `${baseClasses} bg-gray-500 text-white`
  }
}

const handleSessionDragStart = (session, event) => {
  emit('session-drag-start', session)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', session.id.toString())
}

const handleDrop = (date, event) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (draggedSession.value) {
    // Default to 9 AM for day drops
    emit('session-drop', date, 9, 0)
  }
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}
</script>

<style scoped>
.month-view {
  @apply h-full;
}

.auto-rows-fr {
  grid-auto-rows: 1fr;
}

.session-item {
  @apply relative;
}

.session-item:hover {
  @apply scale-105 z-10;
}

/* Drag and drop styles */
.session-item[draggable="true"] {
  @apply cursor-move;
}

.session-item[draggable="true"]:active {
  @apply opacity-50;
}

/* Calendar grid responsive */
@media (max-width: 768px) {
  .min-h-32 {
    min-height: 6rem;
  }
  
  .session-item {
    @apply text-xs;
  }
}
</style>