<template>
  <div class="sessions-view">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-display font-bold text-dark-gray">
          Training Sessions
        </h1>
        <p class="text-medium-gray">
          Manage and schedule training sessions
        </p>
      </div>
      <div class="flex items-center space-x-3 mt-4 sm:mt-0">
        <button 
          class="btn btn-primary flex items-center"
          @click="showCreateModal = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Schedule Session
        </button>
        <button 
          class="btn btn-secondary flex items-center"
          @click="currentView = currentView === 'calendar' ? 'list' : 'calendar'"
        >
          <svg
            v-if="currentView === 'list'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ currentView === 'calendar' ? 'List View' : 'Calendar View' }}
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">
              Today's Sessions
            </p>
            <p class="text-h1 font-bold">
              {{ sessionsStore.todaysSessions.length }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">
              This Week
            </p>
            <p class="text-h1 font-bold">
              {{ sessionsStore.weekSessions.length }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">
              Upcoming
            </p>
            <p class="text-h1 font-bold">
              {{ sessionsStore.upcomingSessions.length }}
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">
              Templates
            </p>
            <p class="text-h1 font-bold">
              {{ sessionsStore.sessionTemplates.length }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- View Toggle Content -->
    <div class="content-area">
      <!-- Calendar View -->
      <SessionCalendar 
        v-if="currentView === 'calendar'"
        :sessions="sessionsStore.sessions"
        @session-click="handleSessionClick"
        @date-click="handleDateClick"
      />

      <!-- List View -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Today's Sessions -->
        <div v-if="sessionsStore.todaysSessions.length > 0">
          <h2 class="text-h2 font-semibold text-dark-gray mb-4">
            Today's Sessions
          </h2>
          <div class="grid gap-4">
            <SessionCard
              v-for="session in sessionsStore.todaysSessions"
              :key="session.id"
              :session="session"
              @edit="editSession"
              @delete="deleteSession"
              @view="viewSession"
            />
          </div>
        </div>

        <!-- Upcoming Sessions -->
        <div v-if="sessionsStore.upcomingSessions.length > 0">
          <h2 class="text-h2 font-semibold text-dark-gray mb-4">
            Upcoming Sessions
          </h2>
          <div class="grid gap-4">
            <SessionCard
              v-for="session in sessionsStore.upcomingSessions.slice(0, 5)"
              :key="session.id"
              :session="session"
              @edit="editSession"
              @delete="deleteSession"
              @view="viewSession"
            />
          </div>
          <div
            v-if="sessionsStore.upcomingSessions.length > 5"
            class="text-center mt-4"
          >
            <button
              class="btn btn-secondary"
              @click="showAllUpcoming = !showAllUpcoming"
            >
              {{ showAllUpcoming ? 'Show Less' : `View All ${sessionsStore.upcomingSessions.length} Sessions` }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="sessionsStore.sessions.length === 0 && !sessionsStore.loading"
          class="card text-center py-12"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 text-medium-gray mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 class="text-lg font-semibold text-dark-gray mb-2">
            No sessions scheduled
          </h3>
          <p class="text-medium-gray mb-4">
            Start by creating your first training session
          </p>
          <button
            class="btn btn-primary"
            @click="showCreateModal = true"
          >
            Schedule Your First Session
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="sessionsStore.loading"
      class="text-center py-8"
    >
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue" />
      <p class="text-medium-gray mt-2">
        Loading sessions...
      </p>
    </div>

    <!-- Create/Edit Session Modal -->
    <SessionFormModal
      v-if="showCreateModal || editingSession"
      :session="editingSession"
      :templates="sessionsStore.sessionTemplates"
      @close="closeModal"
      @save="handleSaveSession"
    />

    <!-- Session Detail Modal -->
    <SessionDetailModal
      v-if="viewingSession"
      :session="viewingSession"
      @close="viewingSession = null"
      @edit="editSession"
      @delete="deleteSession"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSessionsStore } from '@/stores/sessions'
import SessionCalendar from '@/components/session/SessionCalendar.vue'
import SessionCard from '@/components/session/SessionCard.vue'
import SessionFormModal from '@/components/session/SessionFormModal.vue'
import SessionDetailModal from '@/components/session/SessionDetailModal.vue'

const sessionsStore = useSessionsStore()

// Component state
const currentView = ref('list')
const showCreateModal = ref(false)
const editingSession = ref(null)
const viewingSession = ref(null)
const showAllUpcoming = ref(false)

// Event handlers
const handleSessionClick = (session) => {
  viewingSession.value = session
}

const handleDateClick = () => {
  // Pre-fill create modal with selected date
  showCreateModal.value = true
}

const editSession = (session) => {
  editingSession.value = session
  showCreateModal.value = false
  viewingSession.value = null
}

const viewSession = (session) => {
  viewingSession.value = session
}

const deleteSession = async (session) => {
  if (confirm(`Are you sure you want to delete the session "${session.title}"?`)) {
    await sessionsStore.deleteSession(session.id)
  }
}

const handleSaveSession = async (sessionData) => {
  try {
    if (editingSession.value) {
      await sessionsStore.updateSession(editingSession.value.id, sessionData)
    } else {
      await sessionsStore.createSession(sessionData)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving session:', error)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingSession.value = null
  viewingSession.value = null
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    sessionsStore.fetchSessions(),
    sessionsStore.fetchSessionTemplates()
  ])
})
</script>