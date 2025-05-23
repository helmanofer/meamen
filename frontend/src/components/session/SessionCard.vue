<template>
  <div class="session-card card hover:shadow-md transition-shadow duration-200">
    <div class="flex items-start justify-between">
      <!-- Main Content -->
      <div class="flex-1">
        <div class="flex items-start space-x-4">
          <!-- Time Badge -->
          <div class="flex-shrink-0">
            <div class="w-16 h-16 rounded-lg bg-primary-blue text-white flex flex-col items-center justify-center">
              <span class="text-xs font-medium">{{ formatTime(session.scheduled_at) }}</span>
              <span class="text-xs opacity-75">{{ formatDate(session.scheduled_at) }}</span>
            </div>
          </div>

          <!-- Session Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2 mb-1">
              <h3 class="text-lg font-semibold text-dark-gray truncate">
                {{ session.title }}
              </h3>
              <StatusBadge :status="session.status" />
            </div>
            
            <p class="text-medium-gray text-sm mb-2">
              {{ session.description }}
            </p>
            
            <div class="flex items-center space-x-4 text-sm text-medium-gray">
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ session.trainee_name }}
              </div>
              
              <div class="flex items-center">
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
                {{ session.duration }} min
              </div>
              
              <div
                v-if="session.location"
                class="flex items-center"
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
              </div>
            </div>

            <!-- Session Notes Preview -->
            <div
              v-if="session.notes"
              class="mt-2 p-2 bg-light-gray rounded text-xs text-medium-gray"
            >
              <span class="font-medium">Notes:</span> {{ truncateText(session.notes, 100) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-2 ml-4">
        <button
          class="p-2 text-primary-blue hover:bg-light-blue rounded-md transition-colors"
          title="View Details"
          @click="$emit('view', session)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fill-rule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        
        <button
          class="p-2 text-primary-blue hover:bg-light-blue rounded-md transition-colors"
          title="Edit Session"
          @click="$emit('edit', session)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        
        <div class="relative">
          <button
            class="p-2 text-medium-gray hover:text-dark-gray hover:bg-light-gray rounded-md transition-colors"
            title="More Options"
            @click="showMenu = !showMenu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          <!-- Dropdown Menu -->
          <div
            v-if="showMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10"
          >
            <div class="py-1">
              <button
                class="w-full text-left px-4 py-2 text-sm text-dark-gray hover:bg-light-gray flex items-center"
                @click="duplicateSession"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                  <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                </svg>
                Duplicate Session
              </button>
              
              <button
                class="w-full text-left px-4 py-2 text-sm text-dark-gray hover:bg-light-gray flex items-center"
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
              
              <div class="border-t border-gray-200 my-1" />
              
              <button
                class="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center"
                @click="confirmDelete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
                    clip-rule="evenodd"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L7.586 12l-1.293 1.293a1 1 0 101.414 1.414L9 13.414l2.293 2.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                Cancel Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  session: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'edit', 'delete', 'duplicate', 'reschedule'])

const showMenu = ref(false)

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

const truncateText = (text, length) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const duplicateSession = () => {
  showMenu.value = false
  // Create a copy of the session with a new date
  const duplicatedSession = {
    ...props.session,
    id: null,
    scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Next week
  }
  // Emit duplicate event or handle duplication logic
  console.log('Duplicate session:', duplicatedSession)
}

const rescheduleSession = () => {
  showMenu.value = false
  // Emit reschedule event
  console.log('Reschedule session:', props.session)
}

const confirmDelete = () => {
  showMenu.value = false
  if (confirm(`Are you sure you want to cancel the session "${props.session.title}"?`)) {
    emit('delete', props.session)
  }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    showMenu.value = false
  }
})
</script>