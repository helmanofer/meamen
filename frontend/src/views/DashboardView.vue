<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          🏋️ FitTrainer Pro
        </h1>
        <p class="text-gray-600 mt-1">
          Welcome back, {{ authStore.user?.name || 'Trainer' }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-400 hover:text-gray-600">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-5 5v-5z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19V7a1 1 0 011-1h10a1 1 0 011 1v6"
            />
          </svg>
        </button>
        <button class="p-2 text-gray-400 hover:text-gray-600">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <div class="text-right">
          <p class="text-sm font-medium text-gray-900">
            {{ authStore.user?.name || 'John D.' }}
          </p>
          <p class="text-xs text-gray-500">
            Trainer
          </p>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Start New Session Section -->
      <div class="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          START NEW SESSION
        </h2>
        
        <button
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg mb-6 flex items-center justify-center space-x-2 transition-colors"
          @click="showSessionStarter = true"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>+ Begin Training</span>
        </button>

        <div v-if="quickStartTemplates.length > 0">
          <h3 class="text-sm font-medium text-gray-700 mb-3">
            Quick Start:
          </h3>
          <div class="space-y-2">
            <button
              v-for="template in quickStartTemplates.slice(0, 3)"
              :key="template.id"
              class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm flex items-center space-x-2 transition-colors"
              @click="quickStartSession(template)"
            >
              <span>⚡</span>
              <span>{{ template.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Active Sessions Section -->
      <div class="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          ACTIVE SESSIONS
        </h2>
        
        <div v-if="activeSessions.length > 0">
          <div class="mb-4">
            <div class="flex items-center space-x-2 text-red-600 mb-2">
              <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span class="font-medium">Live ({{ liveSessionsCount }})</span>
            </div>
            <div
              v-for="session in liveSessionsData"
              :key="session.id"
              class="mb-3 last:mb-0"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    • {{ session.traineeNames }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ session.duration }} ago
                  </p>
                </div>
                <button
                  class="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  @click="resumeSession(session)"
                >
                  Resume →
                </button>
              </div>
            </div>
          </div>

          <div v-if="pausedSessionsData.length > 0">
            <div class="flex items-center space-x-2 text-yellow-600 mb-2">
              <svg
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="font-medium">Paused ({{ pausedSessionsData.length }})</span>
            </div>
            <div
              v-for="session in pausedSessionsData"
              :key="session.id"
              class="mb-3 last:mb-0"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    • {{ session.traineeNames }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ session.duration }} ago
                  </p>
                </div>
                <div class="flex space-x-1">
                  <button
                    class="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                    @click="resumeSession(session)"
                  >
                    Resume →
                  </button>
                  <button
                    class="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                    @click="completeSession(session)"
                  >
                    Complete ✓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="text-center py-8 text-gray-500"
        >
          <svg
            class="w-12 h-12 mx-auto mb-3 text-gray-300"
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
          <p class="text-sm">
            No active training sessions
          </p>
          <p class="text-xs mt-1">
            Start a new session to see it here
          </p>
        </div>
      </div>

      <!-- Today's Stats Section -->
      <div class="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          TODAY'S STATS
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">📊 Sessions:</span>
            <span class="text-2xl font-bold text-blue-600">{{ todayStats.sessions }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">👥 Trainees:</span>
            <span class="text-2xl font-bold text-blue-600">{{ todayStats.trainees }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">💪 Sets Recorded:</span>
            <span class="text-2xl font-bold text-blue-600">{{ todayStats.setsRecorded }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">⏱️ Training Time:</span>
            <span class="text-2xl font-bold text-blue-600">{{ todayStats.trainingTime }}</span>
          </div>
          
          <div
            v-if="nextScheduledSession"
            class="pt-4 border-t border-gray-200"
          >
            <p class="text-sm text-gray-600 mb-1">
              Next:
            </p>
            <p class="text-sm font-medium text-gray-900">
              {{ nextScheduledSession.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ nextScheduledSession.time }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Quick Actions -->
    <div class="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100">
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        QUICK ACTIONS
      </h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          class="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          @click="$router.push('/trainees')"
        >
          <svg
            class="w-8 h-8 text-blue-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span class="text-sm font-medium text-gray-900">👥 Manage Trainees</span>
        </button>
        
        <button
          class="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          @click="$router.push('/sessions')"
        >
          <svg
            class="w-8 h-8 text-blue-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span class="text-sm font-medium text-gray-900">📚 Session Templates</span>
        </button>
        
        <button
          class="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          @click="$router.push('/programs')"
        >
          <svg
            class="w-8 h-8 text-blue-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span class="text-sm font-medium text-gray-900">📋 Programs</span>
        </button>
        
        <button
          class="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          @click="$router.push('/analytics')"
        >
          <svg
            class="w-8 h-8 text-blue-600 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
            />
          </svg>
          <span class="text-sm font-medium text-gray-900">📊 Analytics</span>
        </button>
      </div>
    </div>


    <!-- Session Starter Modal -->
    <div
      v-if="showSessionStarter"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showSessionStarter = false"
    >
      <div class="max-w-4xl w-full max-h-screen overflow-y-auto">
        <SessionStarter 
          @close="showSessionStarter = false" 
          @session-started="onSessionStarted"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTraineesStore } from '@/stores/trainees'
import { useSessionsStore } from '@/stores/sessions'
import { useWorkoutSessionsStore } from '@/stores/workoutSessions'
import { useRouter } from 'vue-router'
import SessionStarter from '@/components/session/SessionStarter.vue'

const authStore = useAuthStore()
const traineesStore = useTraineesStore()
const sessionsStore = useSessionsStore()
const workoutSessionsStore = useWorkoutSessionsStore()
const router = useRouter()

const showSessionStarter = ref(false)
const loading = ref(true)

// Quick Start Templates from backend
const quickStartTemplates = computed(() => {
  return sessionsStore.sessionTemplates.slice(0, 3) // Top 3 session templates
})

// Active Sessions Data - using current workout session state
const activeSessions = computed(() => {
  const sessions = []
  if (workoutSessionsStore.activeWorkout) {
    sessions.push({
      id: workoutSessionsStore.activeWorkout.id,
      status: workoutSessionsStore.activeWorkout.status,
      traineeNames: 'Current Trainee', // TODO: Get from actual trainee data
      startTime: workoutSessionsStore.activeWorkout.startTime,
      programName: workoutSessionsStore.activeWorkout.name
    })
  }
  return sessions
})

const liveSessionsData = computed(() => {
  return activeSessions.value
    .filter(session => session.status === 'in_progress')
    .map(session => ({
      id: session.id,
      traineeNames: session.traineeNames,
      duration: formatDuration(session.startTime),
      programName: session.programName
    }))
})

const pausedSessionsData = computed(() => {
  return activeSessions.value
    .filter(session => session.status === 'paused')
    .map(session => ({
      id: session.id,
      traineeNames: session.traineeNames,
      duration: formatDuration(session.startTime),
      programName: session.programName
    }))
})

const liveSessionsCount = computed(() => liveSessionsData.value.length)

// Today's Statistics
const todayStats = computed(() => {
  const todaySessions = sessionsStore.todaysSessions
  const workoutHistory = workoutSessionsStore.workoutHistory
  
  const uniqueTrainees = new Set()
  let totalSets = 0
  let totalMinutes = 0
  
  // Calculate from today's completed sessions
  todaySessions.forEach(session => {
    if (session.trainee_id) uniqueTrainees.add(session.trainee_id)
  })
  
  // Calculate from workout history (completed workouts today)
  const today = new Date().toDateString()
  const todaysWorkouts = workoutHistory.filter(workout => {
    return workout.startTime && new Date(workout.startTime).toDateString() === today
  })
  
  todaysWorkouts.forEach(workout => {
    if (workout.exercises) {
      workout.exercises.forEach(exercise => {
        totalSets += exercise.recordedSets?.filter(set => set.completed).length || 0
      })
    }
    if (workout.duration) totalMinutes += Math.floor(workout.duration / 60) // Convert seconds to minutes
  })
  
  return {
    sessions: todaySessions.length + todaysWorkouts.length,
    trainees: uniqueTrainees.size,
    setsRecorded: totalSets,
    trainingTime: formatTrainingTime(totalMinutes)
  }
})

// Next Scheduled Session
const nextScheduledSession = computed(() => {
  const upcoming = sessionsStore.upcomingSessions[0]
  
  if (!upcoming) return null
  
  return {
    name: upcoming.name || 'Training Session',
    time: formatNextSessionTime(upcoming.scheduled_at)
  }
})

// Session management functions
const quickStartSession = async (template) => {
  try {
    // Start workout with this template
    await workoutSessionsStore.startWorkout(template)
    router.push('/workout')
  } catch (error) {
    console.error('Failed to start quick session:', error)
  }
}

const resumeSession = () => {
  if (workoutSessionsStore.activeWorkout) {
    workoutSessionsStore.resumeWorkout()
    router.push('/workout')
  }
}

const completeSession = async () => {
  try {
    await workoutSessionsStore.completeWorkout()
    // Reload data after completion
    await loadData()
  } catch (error) {
    console.error('Failed to complete session:', error)
  }
}

const onSessionStarted = () => {
  showSessionStarter.value = false
  // Session starter will automatically navigate to live training view
}

// Utility functions
const formatDuration = (startTime) => {
  if (!startTime) return '0 min'
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 60) return `${diffMins} min`
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}

const formatTrainingTime = (minutes) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}.${Math.round(mins/6)}h` : `${hours}h`
}

const formatNextSessionTime = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${timeStr}`
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeStr}`
  } else {
    return `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} at ${timeStr}`
  }
}

const loadData = async () => {
  loading.value = true
  try {
    // Load all necessary data in parallel
    await Promise.all([
      traineesStore.trainees.length === 0 ? traineesStore.fetchTrainees() : Promise.resolve(),
      sessionsStore.sessions.length === 0 ? sessionsStore.fetchSessions() : Promise.resolve(),
      sessionsStore.sessionTemplates.length === 0 ? sessionsStore.fetchSessionTemplates() : Promise.resolve(),
      workoutSessionsStore.fetchWorkoutHistory()
    ])
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>