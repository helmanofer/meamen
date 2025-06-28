<template>
  <div class="min-h-screen bg-gray-50">
    <!-- No Active Session -->
    <div
      v-if="!currentSession"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-center">
        <div class="text-gray-400 mb-4">
          <svg
            class="w-20 h-20 mx-auto"
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
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          No Active Session
        </h2>
        <p class="text-gray-500 mb-6">
          Start a new training session to begin
        </p>
        <router-link
          to="/dashboard"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center space-x-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Dashboard</span>
        </router-link>
      </div>
    </div>

    <!-- Active Session Interface -->
    <div
      v-else
      class="flex flex-col h-screen"
    >
      <!-- Session Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Session Info -->
          <div class="flex items-center space-x-4">
            <button
              class="text-gray-400 hover:text-gray-500 transition-colors"
              @click="$router.go(-1)"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-bold text-gray-900">
                Live Training Session
              </h1>
              <p class="text-sm text-gray-500">
                {{ sessionDuration }} • {{ currentSession.location || 'No location' }}
              </p>
            </div>
          </div>

          <!-- Session Controls -->
          <div class="flex items-center space-x-3">
            <StatusBadge :status="sessionStatus" />
            
            <!-- Pause/Resume Button -->
            <button
              v-if="sessionStatus === 'active'"
              class="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors flex items-center space-x-2"
              @click="pauseSession"
            >
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
              <span>Pause</span>
            </button>
            
            <button
              v-else-if="sessionStatus === 'paused'"
              class="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors flex items-center space-x-2"
              @click="resumeSession"
            >
              <svg
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Resume</span>
            </button>

            <!-- Complete Session Button -->
            <button
              class="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors flex items-center space-x-2"
              @click="completeSession"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Complete</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Trainee Switcher Sidebar -->
        <div
          v-if="canSwitchTrainee"
          class="w-80 bg-white border-r border-gray-200 flex flex-col"
        >
          <div class="p-4 border-b border-gray-200">
            <h3 class="font-semibold text-gray-900">
              Trainees
            </h3>
            <p class="text-sm text-gray-500">
              {{ currentSession.trainees.length }} selected
            </p>
          </div>
          
          <div class="flex-1 overflow-y-auto">
            <div class="p-4 space-y-3">
              <div
                v-for="(trainee, index) in currentSession.trainees"
                :key="trainee.id"
                class="p-3 border-2 rounded-lg cursor-pointer transition-all"
                :class="[
                  index === currentTraineeIndex
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
                @click="switchToTrainee(index)"
              >
                <div class="flex items-center space-x-3">
                  <img
                    :src="trainee.avatar || '/src/assets/profile-placeholder.png'"
                    :alt="trainee.name"
                    class="w-10 h-10 rounded-full"
                  >
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">
                      {{ trainee.name }}
                    </p>
                    <p class="text-sm text-gray-500">
                      Record #{{ trainee.record_id }}
                    </p>
                    <div v-if="trainee.session_info" class="text-xs text-blue-600 mt-1">
                      <span v-if="trainee.session_info.type === 'program'">📋 {{ trainee.session_info.name }}</span>
                      <span v-else-if="trainee.session_info.type === 'session'">🏃‍♂️ {{ trainee.session_info.name }}</span>
                      <span v-else-if="trainee.session_info.type === 'template'">📝 {{ trainee.session_info.name }}</span>
                      <span v-else>🎯 Freestyle Session</span>
                    </div>
                  </div>
                  <div
                    v-if="index === currentTraineeIndex"
                    class="text-blue-500"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
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
            </div>
          </div>

          <!-- Keyboard Shortcuts -->
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <p class="text-xs text-gray-500 mb-2">
              Keyboard Shortcuts:
            </p>
            <div class="text-xs text-gray-400 space-y-1">
              <div>← → Switch trainees</div>
              <div>Space Pause/Resume</div>
              <div>Esc Back to dashboard</div>
            </div>
          </div>
        </div>

        <!-- Training Interface -->
        <div class="flex-1 flex flex-col">
          <!-- Current Trainee Header -->
          <div class="bg-white border-b border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <img
                  :src="currentTrainee?.avatar || '/src/assets/profile-placeholder.png'"
                  :alt="currentTrainee?.name"
                  class="w-12 h-12 rounded-full"
                >
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ currentTrainee?.name || 'Select Trainee' }}
                  </h2>
                  <div class="text-sm text-gray-500">
                    <p>Current trainee • Record #{{ currentTrainee?.record_id }}</p>
                    <div v-if="currentTrainee?.session_info" class="text-blue-600 mt-1">
                      <span v-if="currentTrainee.session_info.type === 'program'">📋 Following program: {{ currentTrainee.session_info.name }}</span>
                      <span v-else-if="currentTrainee.session_info.type === 'session'">🏃‍♂️ Scheduled session: {{ currentTrainee.session_info.name }}</span>
                      <span v-else-if="currentTrainee.session_info.type === 'template'">📝 Using template: {{ currentTrainee.session_info.name }}</span>
                      <span v-else>🎯 Freestyle session</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Trainee Navigation (for multi-trainee) -->
              <div
                v-if="canSwitchTrainee"
                class="flex items-center space-x-2"
              >
                <button
                  class="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  @click="switchToPreviousTrainee"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span class="text-sm text-gray-500">
                  {{ currentTraineeIndex + 1 }} of {{ currentSession.trainees.length }}
                </span>
                <button
                  class="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  @click="switchToNextTrainee"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Exercise Recording Interface -->
          <div class="flex-1 p-6 overflow-y-auto">
            <div class="max-w-4xl mx-auto">
              <!-- Exercise Recorder Component -->
              <ExerciseRecorder
                :current-exercise="currentExercise"
                :previous-performance="previousPerformance"
                @record-set="handleRecordSet"
                @skip-set="handleSkipSet"
                @skip-exercise="handleSkipExercise"
                @complete-exercise="handleCompleteExercise"
                @update-form-rating="handleUpdateFormRating"
                @update-rpe="handleUpdateRPE"
              />

              <!-- Exercise Progression -->
              <div class="mt-6">
                <ExerciseProgression :exercises="currentTraineeExerciseRecords" />
              </div>

              <!-- Session Notes -->
              <div class="mt-6 bg-white rounded-lg shadow-md p-6">
                <h4 class="font-semibold text-gray-900 mb-3">
                  Session Notes
                </h4>
                <textarea
                  v-model="sessionNotes"
                  placeholder="Add notes about this training session..."
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @blur="updateNotes"
                />
                <div class="flex justify-between items-center mt-3">
                  <p
                    v-if="lastSaved"
                    class="text-xs text-gray-500"
                  >
                    Last saved: {{ formatTime(lastSaved) }}
                  </p>
                  <div class="text-xs text-gray-400">
                    Auto-saves every 30 seconds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <RestTimer ref="restTimer" />
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLiveSessionStore } from '@/stores/liveSession'
import { useRouter } from 'vue-router'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ExerciseRecorder from '@/components/workout/ExerciseRecorder.vue'

import ExerciseProgression from '@/components/session/ExerciseProgression.vue'

export default {
  name: 'LiveTrainingView',
  components: {
    StatusBadge,
    ExerciseRecorder,
    RestTimer,
    ExerciseProgression
  },
  setup() {
    const liveSessionStore = useLiveSessionStore()
    const router = useRouter()
    const restTimer = ref(null)
    
    const sessionNotes = ref('')

    const currentSession = computed(() => liveSessionStore.currentSession)
    const currentTrainee = computed(() => liveSessionStore.currentTrainee)
    const currentTraineeIndex = computed(() => liveSessionStore.currentTraineeIndex)
    const sessionDuration = computed(() => {
      const duration = liveSessionStore.sessionDuration
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      const seconds = duration % 60
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`
      } else {
        return `${seconds}s`
      }
    })
    const canSwitchTrainee = computed(() => liveSessionStore.canSwitchTrainee)
    const sessionStatus = computed(() => liveSessionStore.sessionStatus)
    const lastSaved = computed(() => liveSessionStore.lastSaved)
    
    // Exercise recording computed properties
    const currentExercise = computed(() => liveSessionStore.currentExercise)
    const previousPerformance = computed(() => liveSessionStore.previousPerformance)

    const pauseSession = async () => {
      await liveSessionStore.pauseCurrentSession()
    }

    const resumeSession = async () => {
      await liveSessionStore.resumeCurrentSession()
    }

    const completeSession = async () => {
      if (confirm('Are you sure you want to complete this session? This action cannot be undone.')) {
        await liveSessionStore.completeCurrentSession()
        router.push('/dashboard')
      }
    }

    const switchToTrainee = (index) => {
      liveSessionStore.switchToTrainee(index)
    }

    const switchToNextTrainee = () => {
      liveSessionStore.switchToNextTrainee()
    }

    const switchToPreviousTrainee = () => {
      liveSessionStore.switchToPreviousTrainee()
    }

    const updateNotes = async () => {
      if (sessionNotes.value !== currentSession.value?.trainer_notes) {
        await liveSessionStore.updateSessionNotes(sessionNotes.value)
      }
    }

    const formatTime = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    }

    // Exercise recording methods
    const handleRecordSet = async (setData) => {
      if (!currentExercise.value) return
      
      await liveSessionStore.recordSet(currentExercise.value.id, setData)

      if (currentExercise.value.rest_period_seconds) {
        restTimer.value.start(currentExercise.value.rest_period_seconds)
      }
    }

    const handleSkipSet = async (setData) => {
      // For now, just record the set as skipped (0 reps)
      if (!currentExercise.value) return
      
      await liveSessionStore.recordSet(currentExercise.value.id, {
        ...setData,
        reps: 0,
        notes: (setData.notes || '') + ' (Skipped)'
      })
    }

    const handleSkipExercise = async () => {
      if (!currentExercise.value) return
      
      await liveSessionStore.skipExercise(currentExercise.value.id)
    }

    const handleCompleteExercise = async () => {
      if (!currentExercise.value) return
      
      await liveSessionStore.completeExercise(currentExercise.value.id)
    }

    const handleUpdateFormRating = async (rating) => {
      if (!currentExercise.value) return
      
      await liveSessionStore.updateExerciseRecord(currentExercise.value.id, {
        form_rating: rating
      })
    }

    const handleUpdateRPE = async (rpe) => {
      if (!currentExercise.value) return
      
      await liveSessionStore.updateExerciseRecord(currentExercise.value.id, {
        rpe: rpe
      })
    }

    const handleKeyboardShortcuts = (event) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          switchToPreviousTrainee()
          break
        case 'ArrowRight':
          event.preventDefault()
          switchToNextTrainee()
          break
        case ' ':
          event.preventDefault()
          if (sessionStatus.value === 'active') {
            pauseSession()
          } else if (sessionStatus.value === 'paused') {
            resumeSession()
          }
          break
        case 'Escape':
          event.preventDefault()
          router.push('/dashboard')
          break
      }
    }

    onMounted(() => {
      // Initialize session notes
      if (currentSession.value?.trainer_notes) {
        sessionNotes.value = currentSession.value.trainer_notes
      }
      
      // Add keyboard event listeners
      document.addEventListener('keydown', handleKeyboardShortcuts)
      
      // If no current session, try to get active sessions
      if (!currentSession.value) {
        liveSessionStore.fetchActiveSessions()
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyboardShortcuts)
    })

    return {
      currentSession,
      currentTrainee,
      currentTraineeIndex,
      sessionDuration,
      canSwitchTrainee,
      sessionStatus,
      lastSaved,
      sessionNotes,
      currentExercise,
      previousPerformance,
      pauseSession,
      resumeSession,
      completeSession,
      switchToTrainee,
      switchToNextTrainee,
      switchToPreviousTrainee,
      updateNotes,
      formatTime,
      handleRecordSet,
      handleSkipSet,
      handleSkipExercise,
      handleCompleteExercise,
      handleUpdateFormRating,
      handleUpdateRPE
    }
  }
}
</script>