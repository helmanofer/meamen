<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">
        Active Sessions
      </h3>
      <button
        :disabled="loading"
        class="text-gray-400 hover:text-gray-500 transition-colors disabled:cursor-not-allowed"
        @click="refreshSessions"
      >
        <svg 
          class="w-5 h-5" 
          :class="{ 'animate-spin': loading }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.955 8.955 0 0112 21a8.961 8.961 0 01-9-9.001M2 9a8.961 8.961 0 019-9.001M12 3a8.955 8.955 0 0112 2m-.582 5h-.007V4"
          />
        </svg>
      </button>
    </div>

    <!-- No Active Sessions -->
    <div
      v-if="!hasActiveSessions && !loading"
      class="text-center py-8"
    >
      <div class="text-gray-400 mb-4">
        <svg
          class="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      </div>
      <p class="text-gray-500 text-sm">
        No active training sessions
      </p>
      <p class="text-gray-400 text-xs mt-1">
        Start a new session to see it here
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="space-y-3"
    >
      <div
        v-for="i in 2"
        :key="i"
        class="animate-pulse"
      >
        <div class="h-20 bg-gray-200 rounded-lg" />
      </div>
    </div>

    <!-- Active Sessions List -->
    <div
      v-else-if="hasActiveSessions"
      class="space-y-3"
    >
      <div
        v-for="session in activeSessions"
        :key="session.id"
        class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
      >
        <!-- Session Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-1">
              <h4 class="font-medium text-gray-900">
                {{ getTraineeName(session) }}
              </h4>
              <StatusBadge :status="session.status" />
            </div>
            <p class="text-sm text-gray-500">
              {{ formatSessionDuration(session) }} • {{ session.location || 'No location' }}
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              v-if="session.status === 'paused'"
              class="text-green-600 hover:text-green-700 transition-colors"
              title="Resume Session"
              @click="resumeSession(session)"
            >
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button
              v-else-if="session.status === 'active'"
              class="text-yellow-600 hover:text-yellow-700 transition-colors"
              title="Pause Session"
              @click="pauseSession(session)"
            >
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button
              class="text-blue-600 hover:text-blue-700 transition-colors"
              title="Open Session"
              @click="openSession(session)"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Session Progress -->
        <div class="bg-gray-50 rounded p-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">
              Current: {{ getCurrentActivity(session) }}
            </span>
            <span class="text-gray-500">
              Started {{ formatTime(session.start_time) }}
            </span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <button
            class="text-sm text-gray-600 hover:text-gray-700 transition-colors"
            @click="addNotes(session)"
          >
            📝 Add Notes
          </button>
          <div class="flex space-x-2">
            <button
              class="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors"
              @click="completeSession(session)"
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="text-center py-4"
    >
      <p class="text-red-500 text-sm">
        {{ error }}
      </p>
      <button
        class="mt-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        @click="refreshSessions"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue'
import { useLiveSessionStore } from '@/stores/liveSession'
import { useTraineesStore } from '@/stores/trainees'
import { useRouter } from 'vue-router'
import StatusBadge from '@/components/common/StatusBadge.vue'

export default {
  name: 'ActiveSessions',
  components: {
    StatusBadge
  },
  setup() {
    const liveSessionStore = useLiveSessionStore()
    const traineesStore = useTraineesStore()
    const router = useRouter()

    let refreshInterval = null

    const loading = computed(() => liveSessionStore.loading)
    const error = computed(() => liveSessionStore.error)
    const activeSessions = computed(() => liveSessionStore.activeSessions)
    const hasActiveSessions = computed(() => liveSessionStore.hasActiveSessions)

    const refreshSessions = async () => {
      await liveSessionStore.fetchActiveSessions()
    }

    const resumeSession = async (session) => {
      // Set as current session and resume
      liveSessionStore.currentSession = session
      await liveSessionStore.resumeCurrentSession()
    }

    const pauseSession = async (session) => {
      // Set as current session and pause
      liveSessionStore.currentSession = session
      await liveSessionStore.pauseCurrentSession()
    }

    const completeSession = async (session) => {
      if (confirm('Are you sure you want to complete this session?')) {
        liveSessionStore.currentSession = session
        await liveSessionStore.completeCurrentSession()
        await refreshSessions()
      }
    }

    const openSession = (session) => {
      // Set as current session and navigate to live training
      liveSessionStore.currentSession = session
      router.push('/live-training')
    }

    const addNotes = (session) => {
      const notes = prompt('Add notes for this session:', session.trainer_notes || '')
      if (notes !== null) {
        liveSessionStore.currentSession = session
        liveSessionStore.updateSessionNotes(notes)
      }
    }

    const getTraineeName = (session) => {
      // Try to get trainee name from session metadata first
      if (session.session_metadata?.trainee_name) {
        return session.session_metadata.trainee_name
      }
      
      // Get the name from trainees store
      const trainee = traineesStore.trainees.find(t => t.id === session.trainee_id)
      return trainee?.name || `Trainee ${session.trainee_id}`
    }

    const getCurrentActivity = (session) => {
      return session.session_metadata?.current_exercise || 'In progress'
    }

    const formatSessionDuration = (session) => {
      if (!session.start_time) return '0m'
      
      const startTime = new Date(session.start_time)
      const now = new Date()
      const durationMs = now - startTime
      const minutes = Math.floor(durationMs / (1000 * 60))
      
      if (minutes < 60) {
        return `${minutes}m`
      } else {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m`
      }
    }

    const formatTime = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    }

    onMounted(async () => {
      await refreshSessions()
      
      // Refresh every 30 seconds
      refreshInterval = setInterval(refreshSessions, 30000)
    })

    onUnmounted(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    })

    return {
      loading,
      error,
      activeSessions,
      hasActiveSessions,
      refreshSessions,
      resumeSession,
      pauseSession,
      completeSession,
      openSession,
      addNotes,
      getTraineeName,
      getCurrentActivity,
      formatSessionDuration,
      formatTime
    }
  }
}
</script>