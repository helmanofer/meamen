<template>
  <div class="week-view h-full flex flex-col">
    <!-- Week Header -->
    <div class="grid grid-cols-8 gap-1 border-b border-gray-200 bg-gray-50">
      <!-- Time column header -->
      <div class="text-xs font-medium text-medium-gray text-center py-3 border-r border-gray-200">
        Time
      </div>
      
      <!-- Day headers -->
      <div
        v-for="day in weekDays"
        :key="day.date.toISOString()"
        class="text-center py-3 border-r border-gray-200 last:border-r-0"
        :class="{
          'bg-primary-blue/10': day.isToday,
          'opacity-50': !preferences.showWeekends && isWeekend(day.date)
        }"
      >
        <div class="text-xs font-medium text-medium-gray">
          {{ day.name }}
        </div>
        <div
          class="text-lg font-semibold mt-1"
          :class="{
            'text-primary-blue': day.isToday,
            'text-dark-gray': !day.isToday
          }"
        >
          {{ day.date.getDate() }}
        </div>
        <div
          v-if="day.availability.blocked"
          class="text-xs text-error mt-1"
        >
          Blocked
        </div>
      </div>
    </div>

    <!-- Time Grid -->
    <div class="flex-1 overflow-y-auto">
      <div class="grid grid-cols-8 gap-1 auto-rows-min">
        <div
          v-for="hour in timeSlots"
          :key="hour"
          class="contents"
        >
          <!-- Time Label -->
          <div class="text-xs text-medium-gray text-right py-3 pr-2 border-r border-gray-200 bg-gray-50 sticky left-0">
            {{ formatHour(hour) }}
          </div>
          
          <!-- Day Columns -->
          <div
            v-for="day in weekDays"
            :key="`${day.date.toISOString()}-${hour}`"
            class="relative min-h-16 border-r border-gray-100 border-b border-gray-100 last:border-r-0 hover:bg-light-gray cursor-pointer transition-colors"
            :class="{
              'bg-gray-50': !isWorkingHour(hour),
              'opacity-50': !preferences.showWeekends && isWeekend(day.date)
            }"
            @click="handleTimeSlotClick(day.date, hour)"
            @dragover.prevent="handleDragOver($event, day.date, hour)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, day.date, hour)"
          >
            <!-- Time Slot Sessions -->
            <div
              v-for="session in getSessionsForTimeSlot(day.date, hour)"
              :key="session.id"
              class="absolute inset-x-1 bg-opacity-90 text-white text-xs p-2 rounded cursor-pointer hover:bg-opacity-100 transition-all"
              :class="getSessionClasses(session)"
              :style="getSessionStyle(session)"
              draggable="true"
              @click.stop="$emit('session-click', session)"
              @dragstart="handleSessionDragStart(session, $event)"
            >
              <div class="font-medium truncate">
                {{ session.title }}
              </div>
              <div class="text-xs opacity-75 truncate">
                {{ session.trainee_name }}
              </div>
              <div class="text-xs opacity-75">
                {{ session.duration }}min
              </div>
            </div>

            <!-- Drop Zone Indicator -->
            <div
              v-if="isDragOverSlot === `${day.date.toDateString()}-${hour}` && draggedSession"
              class="absolute inset-0 bg-primary-blue/20 border-2 border-primary-blue border-dashed flex items-center justify-center"
            >
              <div class="text-primary-blue font-medium text-xs">
                Drop here
              </div>
            </div>

            <!-- Time Slot Availability Indicator -->
            <div
              v-if="!isTimeSlotAvailable(day.date, hour)"
              class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"
              title="Time slot not available"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Current Time Indicator -->
    <div
      v-if="showCurrentTimeIndicator"
      class="absolute bg-error h-0.5 z-10 pointer-events-none"
      :style="currentTimeIndicatorStyle"
    >
      <div class="absolute -left-2 -top-1 w-4 h-4 bg-error rounded-full" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  weekDays: {
    type: Array,
    required: true
  },
  timeSlots: {
    type: Array,
    required: true
  },
  sessions: {
    type: Array,
    required: true
  },
  workingHours: {
    type: Object,
    required: true
  },
  preferences: {
    type: Object,
    required: true
  },
  draggedSession: {
    type: Object,
    default: null
  },
  isTimeSlotAvailable: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'time-slot-click',
  'session-click',
  'session-drag-start',
  'session-drop'
])

// Component state
const isDragOverSlot = ref(null)

// Computed
const showCurrentTimeIndicator = computed(() => {
  const now = new Date()
  const currentWeekStart = new Date(props.weekDays[0].date)
  const currentWeekEnd = new Date(props.weekDays[6].date)
  currentWeekEnd.setHours(23, 59, 59, 999)
  
  return now >= currentWeekStart && now <= currentWeekEnd
})

const currentTimeIndicatorStyle = computed(() => {
  if (!showCurrentTimeIndicator.value) return {}
  
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  
  // Calculate position based on current time
  const hourIndex = props.timeSlots.indexOf(hour)
  if (hourIndex === -1) return { display: 'none' }
  
  const dayIndex = props.weekDays.findIndex(day => 
    day.date.toDateString() === now.toDateString()
  )
  if (dayIndex === -1) return { display: 'none' }
  
  const topPercent = ((hourIndex * 64) + (minute * 64 / 60)) // 64px per hour (min-h-16)
  const leftPercent = ((dayIndex + 1) / 8) * 100 // +1 for time column
  const widthPercent = (1 / 8) * 100
  
  return {
    top: `${topPercent}px`,
    left: `${leftPercent}%`,
    width: `${widthPercent}%`
  }
})

// Methods
const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const isWorkingHour = (hour) => {
  return hour >= props.workingHours.start && hour < props.workingHours.end
}

const formatHour = (hour) => {
  const time = new Date()
  time.setHours(hour, 0, 0, 0)
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  })
}

const handleTimeSlotClick = (date, hour) => {
  emit('time-slot-click', date, hour, 0)
}

const getSessionsForTimeSlot = (date, hour) => {
  return props.sessions.filter(session => {
    const sessionDate = new Date(session.scheduled_at)
    const sessionHour = sessionDate.getHours()
    const sessionEnd = new Date(sessionDate.getTime() + session.duration * 60000)
    const sessionEndHour = sessionEnd.getHours()
    
    return sessionDate.toDateString() === date.toDateString() &&
           ((sessionHour <= hour && sessionEndHour > hour) || sessionHour === hour)
  })
}

const getSessionClasses = (session) => {
  switch (session.status) {
    case 'scheduled':
      return 'bg-primary-blue'
    case 'completed':
      return 'bg-success'
    case 'cancelled':
      return 'bg-error'
    case 'in_progress':
      return 'bg-warning text-dark-gray'
    default:
      return 'bg-gray-500'
  }
}

const getSessionStyle = (session) => {
  const sessionDate = new Date(session.scheduled_at)
  const hour = sessionDate.getHours()
  const minute = sessionDate.getMinutes()
  const duration = session.duration
  
  // Calculate height based on duration (64px per hour)
  const height = Math.max(16, (duration / 60) * 64)
  
  // Calculate top offset based on minutes
  const topOffset = (minute / 60) * 64
  
  return {
    height: `${height}px`,
    top: `${topOffset}px`,
    zIndex: 10
  }
}

const handleSessionDragStart = (session, event) => {
  emit('session-drag-start', session)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', session.id.toString())
}

const handleDragOver = (event, date, hour) => {
  event.preventDefault()
  isDragOverSlot.value = `${date.toDateString()}-${hour}`
}

const handleDragLeave = () => {
  isDragOverSlot.value = null
}

const handleDrop = (event, date, hour) => {
  event.preventDefault()
  isDragOverSlot.value = null
  
  if (props.draggedSession) {
    emit('session-drop', date, hour, 0)
  }
}
</script>

<style scoped>
.week-view {
  @apply relative;
}

.auto-rows-min {
  grid-auto-rows: min-content;
}

/* Sticky time column */
.sticky {
  position: sticky;
  left: 0;
  z-index: 1;
}

/* Session hover effects */
.session-item:hover {
  @apply shadow-lg;
  transform: scale(1.02);
}

/* Drag and drop styles */
[draggable="true"] {
  @apply cursor-move;
}

[draggable="true"]:active {
  @apply opacity-50;
}

/* Grid layout responsive */
@media (max-width: 768px) {
  .min-h-16 {
    min-height: 3rem;
  }
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