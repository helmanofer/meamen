<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center space-x-4">
          <h2 class="text-xl font-semibold text-dark-gray">
            {{ session.title }}
          </h2>
          <StatusBadge :status="session.status" />
        </div>
        <button
          class="text-medium-gray hover:text-dark-gray"
          @click="$emit('close')"
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

      <!-- Modal Body -->
      <div class="p-6 space-y-6">
        <!-- Session Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-lg bg-primary-blue text-white flex flex-col items-center justify-center">
                <span class="text-sm font-medium">{{ formatTime(session.scheduled_at) }}</span>
                <span class="text-xs opacity-75">{{ formatDate(session.scheduled_at) }}</span>
              </div>
              <div>
                <h3 class="font-semibold text-dark-gray">
                  {{ formatFullDate(session.scheduled_at) }}
                </h3>
                <p class="text-sm text-medium-gray">
                  {{ session.duration }} minutes
                </p>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-medium-gray mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="font-medium">{{ session.trainee_name }}</span>
              </div>

              <div
                v-if="session.location"
                class="flex items-center text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-medium-gray mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>{{ session.location }}</span>
              </div>

              <div class="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-medium-gray mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Created {{ formatRelativeDate(session.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column - Quick Actions -->
          <div class="space-y-3">
            <h4 class="font-semibold text-dark-gray">
              Quick Actions
            </h4>
            <div class="flex flex-col space-y-2">
              <button
                class="btn btn-secondary w-full justify-center flex items-center"
                @click="$emit('edit', session)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Session
              </button>
              
              <button
                v-if="session.status === 'scheduled'"
                class="btn btn-success w-full justify-center flex items-center"
                @click="markCompleted"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Mark Completed
              </button>
              
              <button
                class="btn btn-secondary w-full justify-center flex items-center"
                @click="rescheduleSession"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd"
                  />
                </svg>
                Reschedule
              </button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div
          v-if="session.description"
          class="space-y-2"
        >
          <h4 class="font-semibold text-dark-gray">
            Description
          </h4>
          <p class="text-medium-gray leading-relaxed">
            {{ session.description }}
          </p>
        </div>

        <!-- Exercise Plan -->
        <div
          v-if="session.exercises && session.exercises.length > 0"
          class="space-y-4"
        >
          <h4 class="font-semibold text-dark-gray">
            Exercise Plan
          </h4>
          <div class="space-y-3">
            <div
              v-for="(exercise, index) in session.exercises"
              :key="index"
              class="flex items-center justify-between p-4 bg-light-gray rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <div class="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center text-sm font-medium">
                  {{ index + 1 }}
                </div>
                <div>
                  <h5 class="font-medium text-dark-gray">
                    {{ exercise.name }}
                  </h5>
                  <p class="text-sm text-medium-gray">
                    {{ exercise.sets }} sets × {{ exercise.reps }}
                    <span v-if="exercise.rest"> • {{ exercise.rest }}s rest</span>
                  </p>
                </div>
              </div>
              
              <!-- Exercise status indicator -->
              <div class="flex items-center space-x-2">
                <div
                  v-if="session.status === 'completed'"
                  class="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
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
          </div>
        </div>

        <!-- Session Notes -->
        <div
          v-if="session.notes"
          class="space-y-2"
        >
          <h4 class="font-semibold text-dark-gray">
            Session Notes
          </h4>
          <div class="p-4 bg-light-gray rounded-lg">
            <p class="text-dark-gray leading-relaxed">
              {{ session.notes }}
            </p>
          </div>
        </div>

        <!-- Session History/Feedback (if completed) -->
        <div
          v-if="session.status === 'completed'"
          class="space-y-4"
        >
          <h4 class="font-semibold text-dark-gray">
            Session Results
          </h4>
          <div class="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div class="flex items-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-success mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="font-medium text-success">Session Completed</span>
            </div>
            <p class="text-sm text-success/80">
              This session was successfully completed.
            </p>
          </div>
        </div>

        <!-- Warning for past sessions -->
        <div
          v-if="isPastSession && session.status === 'scheduled'"
          class="p-4 bg-warning/10 border border-warning/20 rounded-lg"
        >
          <div class="flex items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-warning mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-medium text-warning">Past Session</span>
          </div>
          <p class="text-sm text-warning/80">
            This session was scheduled in the past. Consider updating its status or rescheduling.
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200">
        <div class="text-sm text-medium-gray">
          Session ID: {{ session.id }}
        </div>
        <div class="flex items-center space-x-3">
          <button
            class="text-sm text-error hover:text-error/80"
            @click="confirmDelete"
          >
            Cancel Session
          </button>
          <button
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  session: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

// Computed
const isPastSession = computed(() => {
  return new Date(props.session.scheduled_at) < new Date()
})

// Helper functions
const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatFullDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

// Actions
const markCompleted = () => {
  // TODO: Implement mark as completed functionality
  console.log('Mark session as completed:', props.session)
}

const rescheduleSession = () => {
  // TODO: Implement reschedule functionality
  console.log('Reschedule session:', props.session)
}

const confirmDelete = () => {
  if (confirm(`Are you sure you want to cancel the session "${props.session.title}"?`)) {
    emit('delete', props.session)
  }
}
</script>