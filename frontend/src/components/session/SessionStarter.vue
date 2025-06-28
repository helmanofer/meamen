<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">
        Start New Training Session
      </h2>
      <button
        class="text-gray-400 hover:text-gray-500 transition-colors"
        @click="$emit('close')"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="startSession"
    >
      <!-- Selected Trainees List -->
      <div v-if="selectedTraineesWithSessions.length > 0">
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Selected Trainees & Their Sessions
        </label>
        <div class="space-y-3 mb-4">
          <div
            v-for="(traineeSession, index) in selectedTraineesWithSessions"
            :key="traineeSession.trainee.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div class="flex items-center space-x-3">
              <img
                :src="traineeSession.trainee.avatar || '/src/assets/profile-placeholder.png'"
                :alt="traineeSession.trainee.name"
                class="w-8 h-8 rounded-full"
              >
              <div>
                <p class="font-medium text-gray-900">{{ traineeSession.trainee.name }}</p>
                <div v-if="traineeSession.selectedSession" class="text-sm text-blue-600">
                  <span v-if="traineeSession.selectedSession.type === 'program'">
                    📋 {{ traineeSession.selectedSession.name }}
                  </span>
                  <span v-else-if="traineeSession.selectedSession.type === 'session'">
                    🏃‍♂️ {{ traineeSession.selectedSession.name }}
                  </span>
                  <span v-else>
                    🎯 Freestyle Session
                  </span>
                </div>
                <p v-else class="text-sm text-gray-500">No session selected</p>
              </div>
            </div>
            <button
              type="button"
              class="text-red-500 hover:text-red-700 transition-colors"
              @click="removeTrainee(index)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Add Trainee Section -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          Add Trainee to Session
          <span class="text-red-500">*</span>
        </label>
        
        <!-- Trainee Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">
            Select Trainee
          </label>
          <select
            v-model="currentTraineeId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @change="onTraineeSelected"
          >
            <option value="">Choose a trainee...</option>
            <option
              v-for="trainee in availableTrainees"
              :key="trainee.id"
              :value="trainee.id"
            >
              {{ trainee.name }}
            </option>
          </select>
        </div>

        <!-- Session Selection for Current Trainee -->
        <div v-if="currentTraineeId && currentTraineeData">
          <label class="block text-sm font-medium text-gray-600 mb-2">
            Select Session for {{ currentTraineeData.name }}
          </label>
          
          <div v-if="loadingCurrentTraineeData" class="flex items-center text-sm text-gray-500">
            <LoadingSpinner size="sm" class="mr-2" />
            Loading trainee's sessions...
          </div>
          
          <div v-else class="space-y-3">
            <!-- Assigned Programs -->
            <div v-if="currentTraineePrograms.length > 0">
              <h4 class="text-sm font-medium text-gray-600 mb-2">
                📋 Assigned Programs ({{ currentTraineePrograms.length }})
              </h4>
              <div class="grid grid-cols-1 gap-2">
                <label
                  v-for="program in currentTraineePrograms"
                  :key="`program-${program.id}`"
                  class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="[
                    currentSessionSelection === `program-${program.id}`
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <input
                    v-model="currentSessionSelection"
                    :value="`program-${program.id}`"
                    type="radio"
                    class="sr-only"
                  >
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ program.name }}</p>
                    <p class="text-sm text-gray-500">{{ program.description || 'No description' }}</p>
                    <div class="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                      <span v-if="program.duration_weeks">{{ program.duration_weeks }} weeks</span>
                      <span v-if="program.difficulty">{{ program.difficulty }}</span>
                      <span class="text-green-600 font-medium">Active Program</span>
                    </div>
                  </div>
                  <div class="text-blue-600 text-lg">📋</div>
                </label>
              </div>
            </div>

            <!-- Upcoming Sessions -->
            <div v-if="currentTraineeSessions.length > 0">
              <h4 class="text-sm font-medium text-gray-600 mb-2">
                📅 Upcoming Sessions ({{ currentTraineeSessions.length }})
              </h4>
              <div class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                <label
                  v-for="session in currentTraineeSessions"
                  :key="`session-${session.id}`"
                  class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all"
                  :class="[
                    currentSessionSelection === `session-${session.id}`
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  ]"
                >
                  <input
                    v-model="currentSessionSelection"
                    :value="`session-${session.id}`"
                    type="radio"
                    class="sr-only"
                  >
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ session.name || 'Training Session' }}</p>
                    <p class="text-sm text-gray-500">{{ session.description || 'No description' }}</p>
                    <div class="flex items-center space-x-3 text-xs mt-1">
                      <span class="text-green-600 font-medium">
                        ⏰ {{ formatScheduledTime(session.scheduled_time) }}
                      </span>
                      <span v-if="session.duration_minutes" class="text-gray-400">
                        {{ session.duration_minutes }}min
                      </span>
                    </div>
                  </div>
                  <div class="text-green-600 text-lg">🏃‍♂️</div>
                </label>
              </div>
            </div>

            <!-- Freestyle Option -->
            <div>
              <h4 class="text-sm font-medium text-gray-600 mb-2">
                Custom Session
              </h4>
              <label
                class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all"
                :class="[
                  currentSessionSelection === 'freestyle'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <input
                  v-model="currentSessionSelection"
                  value="freestyle"
                  type="radio"
                  class="sr-only"
                >
                <div class="flex-1">
                  <p class="font-medium text-gray-900">Freestyle Session</p>
                  <p class="text-sm text-gray-500">Create exercises on the go</p>
                </div>
                <div class="text-orange-600 text-lg">🎯</div>
              </label>
            </div>

            <!-- Add Button -->
            <div class="pt-3">
              <button
                type="button"
                :disabled="!currentSessionSelection"
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                @click="addTraineeWithSession"
              >
                Add {{ currentTraineeData.name }} to Session
              </button>
            </div>
          </div>
        </div>
      </div>


      <!-- Session Notes -->
      <div>
        <label
          for="notes"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Session Notes
        </label>
        <textarea
          id="notes"
          v-model="notes"
          rows="3"
          placeholder="Add any notes for this session..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!canStartSession || loading"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center space-x-2"
        >
          <LoadingSpinner
            v-if="loading"
            size="sm"
          />
          <span>Start Session</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTraineesStore } from '@/stores/trainees'
import { useLiveSessionStore } from '@/stores/liveSession'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import api from '@/services/api'

export default {
  name: 'SessionStarter',
  components: {
    LoadingSpinner
  },
  emits: ['close', 'sessionStarted'],
  setup(props, { emit }) {
    const traineesStore = useTraineesStore()
    const liveSessionStore = useLiveSessionStore()
    const authStore = useAuthStore()
    const router = useRouter()

    const notes = ref('')
    const loading = ref(false)
    
    // Current trainee being added
    const currentTraineeId = ref('')
    const currentSessionSelection = ref('')
    const loadingCurrentTraineeData = ref(false)
    const currentTraineePrograms = ref([])
    const currentTraineeSessions = ref([])
    
    // Selected trainees with their sessions
    const selectedTraineesWithSessions = ref([])

    const trainees = computed(() => traineesStore.trainees)
    const availableTrainees = computed(() => 
      trainees.value.filter(trainee => 
        !selectedTraineesWithSessions.value.some(ts => ts.trainee.id === trainee.id)
      )
    )
    const currentTraineeData = computed(() => 
      trainees.value.find(trainee => trainee.id === parseInt(currentTraineeId.value))
    )

    const canStartSession = computed(() => {
      return selectedTraineesWithSessions.value.length > 0 && 
             selectedTraineesWithSessions.value.every(ts => ts.selectedSession)
    })

    const onTraineeSelected = async () => {
      if (currentTraineeId.value) {
        await fetchCurrentTraineeData()
      } else {
        currentTraineePrograms.value = []
        currentTraineeSessions.value = []
      }
      currentSessionSelection.value = ''
    }

    const fetchCurrentTraineeData = async () => {
      if (!currentTraineeId.value) return
      
      loadingCurrentTraineeData.value = true
      try {
        const trainerId = authStore.user?.id || 1
        const traineeId = parseInt(currentTraineeId.value)
        
        // Fetch trainee's assigned programs
        const programsResponse = await api.getTraineePrograms(traineeId, trainerId)
        currentTraineePrograms.value = programsResponse.data.data || []
        
        // Fetch trainee's scheduled sessions
        const sessionsResponse = await api.getSessions({ 
          trainee_id: traineeId,
          status: 'scheduled'
        })
        
        // Filter for upcoming sessions only
        const now = new Date()
        currentTraineeSessions.value = (sessionsResponse.data || [])
          .filter(session => {
            if (!session.scheduled_time) return false
            const sessionDate = new Date(session.scheduled_time)
            return sessionDate > now
          })
          .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
          .slice(0, 5)
          
      } catch (error) {
        console.error('Error fetching trainee data:', error)
        currentTraineePrograms.value = []
        currentTraineeSessions.value = []
      } finally {
        loadingCurrentTraineeData.value = false
      }
    }

    const addTraineeWithSession = () => {
      if (!currentTraineeData.value || !currentSessionSelection.value) return
      
      let sessionInfo = null
      if (currentSessionSelection.value !== 'freestyle') {
        if (currentSessionSelection.value.startsWith('program-')) {
          const programId = parseInt(currentSessionSelection.value.replace('program-', ''))
          const program = currentTraineePrograms.value.find(p => p.id === programId)
          sessionInfo = {
            type: 'program',
            id: programId,
            name: program?.name || `Program #${programId}`
          }
        } else if (currentSessionSelection.value.startsWith('session-')) {
          const sessionId = parseInt(currentSessionSelection.value.replace('session-', ''))
          const session = currentTraineeSessions.value.find(s => s.id === sessionId)
          sessionInfo = {
            type: 'session',
            id: sessionId,
            name: session?.name || `Session #${sessionId}`
          }
        }
      } else {
        sessionInfo = {
          type: 'freestyle',
          name: 'Freestyle Session'
        }
      }
      
      selectedTraineesWithSessions.value.push({
        trainee: { ...currentTraineeData.value },
        selectedSession: sessionInfo
      })
      
      // Reset current selections
      currentTraineeId.value = ''
      currentSessionSelection.value = ''
      currentTraineePrograms.value = []
      currentTraineeSessions.value = []
    }

    const removeTrainee = (index) => {
      selectedTraineesWithSessions.value.splice(index, 1)
    }

    const formatScheduledTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = date - now
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      
      if (diffDays === 0) return `Today at ${timeStr}`
      if (diffDays === 1) return `Tomorrow at ${timeStr}`
      if (diffDays < 7) return `${date.toLocaleDateString('en-US', { weekday: 'short' })} at ${timeStr}`
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`
    }

    const startSession = async () => {
      if (!canStartSession.value) return

      loading.value = true
      try {
        const sessionData = {
          trainee_ids: selectedTraineesWithSessions.value.map(ts => ts.trainee.id),
          notes: notes.value,
          trainee_session_selections: {}
        }

        // Build session selections for each trainee
        selectedTraineesWithSessions.value.forEach(ts => {
          const traineeId = ts.trainee.id
          const session = ts.selectedSession
          
          if (session.type === 'freestyle') {
            sessionData.trainee_session_selections[traineeId] = {
              type: 'freestyle'
            }
          } else {
            sessionData.trainee_session_selections[traineeId] = {
              type: session.type,
              id: session.id
            }
          }
        })

        await liveSessionStore.startSession(sessionData)
        
        emit('sessionStarted')
        emit('close')
        
        // Navigate to live training view
        router.push('/live-training')
      } catch (error) {
        console.error('Failed to start session:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(async () => {
      await traineesStore.fetchTrainees()
    })

    return {
      notes,
      loading,
      currentTraineeId,
      currentSessionSelection,
      loadingCurrentTraineeData,
      currentTraineePrograms,
      currentTraineeSessions,
      selectedTraineesWithSessions,
      trainees,
      availableTrainees,
      currentTraineeData,
      canStartSession,
      onTraineeSelected,
      addTraineeWithSession,
      removeTrainee,
      startSession,
      formatScheduledTime
    }
  }
}
</script>