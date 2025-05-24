<template>
  <div class="day-view h-full flex flex-col">
    <!-- Day Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div class="flex items-center space-x-4">
        <h2 class="text-xl font-semibold text-dark-gray">
          {{ formattedDate }}
        </h2>
        <div
          v-if="dayAvailability.blocked"
          class="px-2 py-1 bg-error/10 text-error text-sm rounded"
        >
          Day Blocked
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          class="btn btn-secondary text-sm"
          :class="dayAvailability.blocked ? 'btn-error' : 'btn-success'"
          @click="toggleAvailability"
        >
          {{ dayAvailability.blocked ? 'Unblock Day' : 'Block Day' }}
        </button>
        
        <button
          class="btn btn-primary text-sm"
          @click="$emit('create-session', currentDate)"
        >
          Add Session
        </button>
      </div>
    </div>

    <!-- Time Grid -->
    <div class="flex-1 overflow-y-auto">
      <div class="grid grid-cols-1 auto-rows-min">
        <div
          v-for="timeSlot in timeSlots"
          :key="timeSlot.time.getTime()"
          class="relative border-b border-gray-100 hover:bg-light-gray cursor-pointer transition-colors"
          :class="{
            'bg-gray-50': !isWorkingHour(timeSlot.time.getHours()),
            'min-h-16': !hasSessionAtTime(timeSlot.time),
            'min-h-20': hasSessionAtTime(timeSlot.time)
          }"
          @click="handleTimeSlotClick(timeSlot)"
          @dragover.prevent="handleDragOver($event, timeSlot)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, timeSlot)"
        >
          <!-- Time Label -->
          <div class="absolute left-0 top-0 w-20 p-2 text-xs text-medium-gray font-medium bg-gray-50 border-r border-gray-200">
            {{ formatTime(timeSlot.time) }}
          </div>

          <!-- Time Slot Content -->
          <div class="ml-20 p-2 relative">
            <!-- Sessions -->
            <div
              v-for="session in timeSlot.sessions"
              :key="session.id"
              class="session-card mb-2 p-3 rounded-lg cursor-pointer hover:shadow-md transition-all"
              :class="getSessionClasses(session)"
              draggable="true"
              @click.stop="$emit('session-click', session)"
              @dragstart="handleSessionDragStart(session, $event)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-white">
                    {{ session.title }}
                  </h4>
                  <p class="text-sm text-white/80 mt-1">
                    {{ session.trainee_name }}
                  </p>
                  <div class="flex items-center mt-2 text-xs text-white/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    {{ session.duration }} minutes
                    <span
                      v-if="session.location"
                      class="ml-3 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {{ session.location }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <StatusBadge
                    :status="session.status"
                    :show-icon="false"
                  />
                  
                  <div class="relative">
                    <button
                      class="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded"
                      @click.stop="toggleSessionMenu(session.id)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    <!-- Session Menu -->
                    <div
                      v-if="activeSessionMenu === session.id"
                      class="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-20"
                    >
                      <div class="py-1">
                        <button
                          class="w-full text-left px-3 py-2 text-sm text-dark-gray hover:bg-light-gray"
                          @click="$emit('edit-session', session)"
                        >
                          Edit Session
                        </button>
                        <button
                          class="w-full text-left px-3 py-2 text-sm text-dark-gray hover:bg-light-gray"
                          @click="duplicateSession(session)"
                        >
                          Duplicate
                        </button>
                        <div class="border-t border-gray-200 my-1" />
                        <button
                          class="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10"
                          @click="$emit('delete-session', session)"
                        >
                          Delete Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Session Notes Preview -->
              <div
                v-if="session.notes"
                class="mt-2 text-xs text-white/70 bg-white/10 rounded p-2"
              >
                {{ truncateText(session.notes, 100) }}
              </div>
            </div>

            <!-- Empty Time Slot -->
            <div
              v-if="timeSlot.sessions.length === 0"
              class="flex items-center justify-center h-12 text-medium-gray text-sm border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-blue hover:text-primary-blue transition-colors"
            >
              Click to schedule session
            </div>

            <!-- Drop Zone Indicator -->
            <div
              v-if="isDragOverSlot === timeSlot.time.getTime() && draggedSession"
              class="absolute inset-0 bg-primary-blue/20 border-2 border-primary-blue border-dashed rounded-lg flex items-center justify-center"
            >
              <div class="text-primary-blue font-medium">
                Drop here
              </div>
            </div>

            <!-- Availability Indicator -->
            <div
              v-if="!timeSlot.available"
              class="absolute top-2 right-2 w-3 h-3 bg-error rounded-full"
              title="Time slot not available"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Current Time Indicator -->
    <div
      v-if="showCurrentTimeIndicator"
      class="absolute left-0 right-0 bg-error h-0.5 z-10 pointer-events-none"
      :style="currentTimeIndicatorStyle"
    >
      <div class="absolute -left-1 -top-1 w-3 h-3 bg-error rounded-full" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  currentDate: {
    type: Date,
    required: true
  },
  timeSlots: {
    type: Array,
    required: true
  },
  dayAvailability: {
    type: Object,
    required: true
  },
  workingHours: {
    type: Object,
    required: true
  },
  draggedSession: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'time-slot-click',
  'session-click',
  'edit-session',
  'delete-session',
  'create-session',
  'session-drag-start',
  'session-drop',
  'toggle-availability'
])

// Component state
const activeSessionMenu = ref(null)
const isDragOverSlot = ref(null)

// Computed
const formattedDate = computed(() => {
  return props.currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const showCurrentTimeIndicator = computed(() => {
  const today = new Date()
  return props.currentDate.toDateString() === today.toDateString()
})

const currentTimeIndicatorStyle = computed(() => {
  if (!showCurrentTimeIndicator.value) return {}
  
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  
  // Find the time slot index
  const slotIndex = props.timeSlots.findIndex(slot => {
    const slotHour = slot.time.getHours()
    const slotMinute = slot.time.getMinutes()
    return hour === slotHour && minute >= slotMinute && minute < slotMinute + 30 // 30-minute slots
  })
  
  if (slotIndex === -1) return { display: 'none' }
  
  // Calculate position (assuming each slot is 64px high)
  const topPosition = (slotIndex * 64) + ((minute % 30) * 64 / 30)
  
  return {
    top: `${topPosition}px`
  }
})

// Methods
const isWorkingHour = (hour) => {
  return hour >= props.workingHours.start && hour < props.workingHours.end
}

const formatTime = (time) => {
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const hasSessionAtTime = (time) => {
  return props.timeSlots.find(slot => 
    slot.time.getTime() === time.getTime()
  )?.sessions.length > 0
}

const handleTimeSlotClick = (timeSlot) => {
  if (timeSlot.sessions.length === 0) {
    emit('time-slot-click', props.currentDate, timeSlot.time.getHours(), timeSlot.time.getMinutes())
  }
}

const getSessionClasses = (session) => {
  const baseClasses = 'border-l-4'
  
  switch (session.status) {
    case 'scheduled':
      return `${baseClasses} bg-primary-blue border-l-primary-blue`
    case 'completed':
      return `${baseClasses} bg-success border-l-success`
    case 'cancelled':
      return `${baseClasses} bg-error border-l-error`
    case 'in_progress':
      return `${baseClasses} bg-warning border-l-warning text-dark-gray`
    default:
      return `${baseClasses} bg-gray-500 border-l-gray-500`
  }
}

const toggleSessionMenu = (sessionId) => {
  activeSessionMenu.value = activeSessionMenu.value === sessionId ? null : sessionId
}

const duplicateSession = (session) => {
  // Close menu
  activeSessionMenu.value = null
  
  // Emit duplicate event (implementation in parent)
  console.log('Duplicate session:', session)
}

const truncateText = (text, length) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const toggleAvailability = () => {
  emit('toggle-availability', props.currentDate)
}

const handleSessionDragStart = (session, event) => {
  emit('session-drag-start', session)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', session.id.toString())
}

const handleDragOver = (event, timeSlot) => {
  event.preventDefault()
  isDragOverSlot.value = timeSlot.time.getTime()
}

const handleDragLeave = () => {
  isDragOverSlot.value = null
}

const handleDrop = (event, timeSlot) => {
  event.preventDefault()
  isDragOverSlot.value = null
  
  if (props.draggedSession) {
    emit('session-drop', props.currentDate, timeSlot.time.getHours(), timeSlot.time.getMinutes())
  }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    activeSessionMenu.value = null
  }
})
</script>

<style scoped>
.day-view {
  @apply relative;
}

.session-card {
  @apply relative overflow-hidden;
}

.session-card:hover {
  @apply shadow-lg;
  transform: translateY(-1px);
}

/* Drag and drop styles */
[draggable="true"] {
  @apply cursor-move;
}

[draggable="true"]:active {
  @apply opacity-50;
}

/* Grid layout */
.auto-rows-min {
  grid-auto-rows: min-content;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>