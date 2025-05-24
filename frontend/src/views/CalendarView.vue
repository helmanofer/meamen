<template>
  <div class="calendar-view min-h-screen bg-gray-50">
    <!-- Calendar Header -->
    <CalendarHeader
      :current-date="calendarStore.currentDate"
      :current-view="calendarStore.currentView"
      :preferences="calendarStore.viewPreferences"
      :working-hours="calendarStore.workingHours"
      @navigate="handleNavigation"
      @view-change="handleViewChange"
      @create-session="handleCreateSession"
      @preferences-update="handlePreferencesUpdate"
      @working-hours-update="handleWorkingHoursUpdate"
    />

    <!-- Calendar Content -->
    <div class="calendar-content flex-1 p-4">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center h-64"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue" />
        <span class="ml-2 text-medium-gray">Loading calendar...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="calendarStore.error"
        class="bg-error/10 border border-error/20 rounded-lg p-4 mb-4"
      >
        <div class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-error mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-error font-medium">{{ calendarStore.error }}</span>
        </div>
        <button
          class="mt-2 text-sm text-error hover:text-error/80"
          @click="calendarStore.clearError"
        >
          Dismiss
        </button>
      </div>

      <!-- Calendar Views -->
      <div
        class="calendar-container bg-white rounded-lg shadow-sm overflow-hidden"
        style="height: calc(100vh - 200px);"
      >
        <!-- Month View -->
        <MonthView
          v-if="calendarStore.currentView === 'month'"
          :current-date="calendarStore.currentDate"
          :calendar-days="calendarStore.getCalendarGrid"
          :selected-date="calendarStore.selectedDate"
          :preferences="calendarStore.viewPreferences"
          :dragged-session="calendarStore.draggedSession"
          @day-click="handleDayClick"
          @session-click="handleSessionClick"
          @edit-session="handleEditSession"
          @delete-session="handleDeleteSession"
          @session-drag-start="handleSessionDragStart"
          @session-drop="handleSessionDrop"
          @show-more-sessions="handleShowMoreSessions"
        />

        <!-- Week View -->
        <WeekView
          v-else-if="calendarStore.currentView === 'week'"
          :week-days="weekDays"
          :time-slots="timeSlots"
          :sessions="currentViewSessions"
          :working-hours="calendarStore.workingHours"
          :preferences="calendarStore.viewPreferences"
          :dragged-session="calendarStore.draggedSession"
          :is-time-slot-available="calendarStore.isTimeSlotAvailable"
          @time-slot-click="handleTimeSlotClick"
          @session-click="handleSessionClick"
          @session-drag-start="handleSessionDragStart"
          @session-drop="handleSessionDrop"
        />

        <!-- Day View -->
        <DayView
          v-else-if="calendarStore.currentView === 'day'"
          :current-date="calendarStore.currentDate"
          :time-slots="dayTimeSlots"
          :day-availability="dayAvailability"
          :working-hours="calendarStore.workingHours"
          :dragged-session="calendarStore.draggedSession"
          @time-slot-click="handleTimeSlotClick"
          @session-click="handleSessionClick"
          @edit-session="handleEditSession"
          @delete-session="handleDeleteSession"
          @create-session="handleCreateSession"
          @session-drag-start="handleSessionDragStart"
          @session-drop="handleSessionDrop"
          @toggle-availability="handleToggleAvailability"
        />
      </div>
    </div>

    <!-- Session Form Modal -->
    <SessionFormModal
      v-if="showSessionForm || editingSession"
      :session="editingSession"
      :templates="sessionsStore.sessionTemplates"
      @close="closeSessionForm"
      @save="handleSaveSession"
    />

    <!-- Session Detail Modal -->
    <SessionDetailModal
      v-if="viewingSession"
      :session="viewingSession"
      @close="viewingSession = null"
      @edit="handleEditSession"
      @delete="handleDeleteSession"
    />

    <!-- Sessions List Modal (for "show more") -->
    <div
      v-if="showSessionsList"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-dark-gray">
            Sessions for {{ selectedDateForList?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
          </h3>
          <button
            class="text-medium-gray hover:text-dark-gray"
            @click="closeSessionsList"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div class="p-4 space-y-3">
          <div
            v-for="session in sessionsForList"
            :key="session.id"
            class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-light-gray"
            @click="handleSessionClick(session)"
          >
            <div class="flex items-start justify-between">
              <div>
                <h4 class="font-medium text-dark-gray">
                  {{ session.title }}
                </h4>
                <p class="text-sm text-medium-gray">
                  {{ session.trainee_name }}
                </p>
                <p class="text-xs text-medium-gray">
                  {{ formatTime(session.scheduled_at) }} • {{ session.duration }}min
                </p>
              </div>
              <StatusBadge :status="session.status" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useSessionsStore } from '@/stores/sessions'
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import MonthView from '@/components/calendar/MonthView.vue'
import WeekView from '@/components/calendar/WeekView.vue'
import DayView from '@/components/calendar/DayView.vue'
import SessionFormModal from '@/components/session/SessionFormModal.vue'
import SessionDetailModal from '@/components/session/SessionDetailModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const calendarStore = useCalendarStore()
const sessionsStore = useSessionsStore()

// Component state
const loading = ref(true)
const showSessionForm = ref(false)
const editingSession = ref(null)
const viewingSession = ref(null)
const showSessionsList = ref(false)
const selectedDateForList = ref(null)
const sessionsForList = ref([])

// Computed properties
const currentViewSessions = computed(() => calendarStore.currentViewSessions)

const weekDays = computed(() => {
  const startOfWeek = new Date(calendarStore.currentDate)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    const today = new Date()
    
    return {
      date: new Date(date),
      name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
      isToday: date.toDateString() === today.toDateString(),
      availability: calendarStore.getAvailabilityForDate(date)
    }
  })
})

const timeSlots = computed(() => {
  const slots = []
  const startHour = Math.max(0, calendarStore.workingHours.start - 1)
  const endHour = Math.min(24, calendarStore.workingHours.end + 1)
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(hour)
  }
  
  return slots
})

const dayTimeSlots = computed(() => {
  return calendarStore.getTimeSlotsForDay(calendarStore.currentDate)
})

const dayAvailability = computed(() => {
  return calendarStore.getAvailabilityForDate(calendarStore.currentDate)
})

// Event handlers
const handleNavigation = (direction) => {
  switch (direction) {
    case 'previous':
      calendarStore.goToPrevious()
      break
    case 'next':
      calendarStore.goToNext()
      break
    case 'today':
      calendarStore.goToToday()
      break
  }
}

const handleViewChange = (view) => {
  calendarStore.setView(view)
}

const handleDayClick = (date) => {
  calendarStore.setSelectedDate(date)
  if (calendarStore.currentView === 'month') {
    calendarStore.setView('day')
    calendarStore.goToDate(date)
  }
}

const handleTimeSlotClick = (date, hour) => {
  // Pre-fill session form with selected time
  showSessionForm.value = true
  
  // You could pass the selected time to the session form here
  // For now, we'll let the form handle default values
}

const handleSessionClick = (session) => {
  viewingSession.value = session
  closeSessionsList()
}

const handleCreateSession = (date = null) => {
  editingSession.value = null
  showSessionForm.value = true
  
  if (date) {
    calendarStore.setSelectedDate(date)
  }
}

const handleEditSession = (session) => {
  editingSession.value = session
  showSessionForm.value = false
  viewingSession.value = null
}

const handleDeleteSession = async (session) => {
  if (confirm(`Are you sure you want to delete "${session.title}"?`)) {
    await sessionsStore.deleteSession(session.id)
    viewingSession.value = null
  }
}

const handleSaveSession = async (sessionData) => {
  try {
    if (editingSession.value) {
      await sessionsStore.updateSession(editingSession.value.id, sessionData)
    } else {
      await sessionsStore.createSession(sessionData)
    }
    closeSessionForm()
  } catch (error) {
    console.error('Error saving session:', error)
  }
}

const handleSessionDragStart = (session) => {
  calendarStore.startDragSession(session)
}

const handleSessionDrop = async (date, hour, minute) => {
  const success = await calendarStore.dropSession(date, hour, minute)
  if (!success && calendarStore.error) {
    // Error is already set in store
    setTimeout(() => calendarStore.clearError(), 3000)
  }
}

const handleShowMoreSessions = (date, sessions) => {
  selectedDateForList.value = date
  sessionsForList.value = sessions
  showSessionsList.value = true
}

const handlePreferencesUpdate = (preferences) => {
  calendarStore.updateViewPreferences(preferences)
}

const handleWorkingHoursUpdate = (workingHours) => {
  calendarStore.setWorkingHours(workingHours.start, workingHours.end)
}

const handleToggleAvailability = async (date) => {
  const availability = calendarStore.getAvailabilityForDate(date)
  if (availability.blocked) {
    await calendarStore.unblockDay(date)
  } else {
    await calendarStore.blockDay(date)
  }
}

// Utility functions
const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const closeSessionForm = () => {
  showSessionForm.value = false
  editingSession.value = null
}

const closeSessionsList = () => {
  showSessionsList.value = false
  selectedDateForList.value = null
  sessionsForList.value = []
}

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true
    
    // Initialize stores
    await Promise.all([
      calendarStore.initialize(),
      sessionsStore.fetchSessions(),
      sessionsStore.fetchSessionTemplates()
    ])
  } catch (error) {
    console.error('Error initializing calendar:', error)
    calendarStore.error = 'Failed to load calendar data'
  } finally {
    loading.value = false
  }
})

// Watch for session store updates to refresh calendar
watch(() => sessionsStore.sessions, () => {
  // Calendar will automatically update due to computed properties
}, { deep: true })
</script>

<style scoped>
.calendar-view {
  @apply h-screen flex flex-col;
}

.calendar-content {
  @apply flex-1 overflow-hidden;
}

.calendar-container {
  @apply relative;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-container {
    height: calc(100vh - 150px) !important;
  }
}

/* Animation for view transitions */
.calendar-container > * {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>