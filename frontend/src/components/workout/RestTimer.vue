<template>
  <div class="rest-timer bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <!-- Timer Header -->
    <div class="bg-primary-blue text-white p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          Rest Time
        </h3>
        <div class="flex items-center space-x-2">
          <button
            class="text-white hover:text-blue-100 transition-colors"
            title="Pause Timer"
            @click="$emit('pause')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button
            class="text-white hover:text-blue-100 transition-colors"
            title="Stop Timer"
            @click="$emit('reset')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Timer Display -->
    <div class="p-6 text-center">
      <!-- Circular Progress -->
      <div class="relative w-32 h-32 mx-auto mb-4">
        <svg
          class="w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
        >
          <!-- Background circle -->
          <path
            class="text-gray-200"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <!-- Progress circle -->
          <path
            class="text-primary-blue transition-all duration-1000 ease-linear"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="`${progressPercentage}, 100`"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        
        <!-- Timer Text -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-3xl font-mono font-bold text-dark-gray">
              {{ formatTime(remaining) }}
            </div>
            <div class="text-xs text-medium-gray">
              remaining
            </div>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="text-center">
        <p class="text-lg font-medium text-dark-gray mb-1">
          {{ timeStatus }}
        </p>
        <p class="text-sm text-medium-gray">
          Total rest time: {{ formatTime(duration) }}
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="flex items-center justify-center space-x-4 mt-6">
        <button
          class="btn btn-secondary flex items-center"
          :disabled="remaining <= 15"
          @click="addTime(-15)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 12H4"
            />
          </svg>
          15s
        </button>
        
        <button
          class="btn btn-primary"
          @click="$emit('reset')"
        >
          Skip Rest
        </button>
        
        <button
          class="btn btn-secondary flex items-center"
          @click="addTime(15)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          15s
        </button>
      </div>
    </div>

    <!-- Rest Complete Notification -->
    <div
      v-if="remaining <= 0"
      class="bg-green-100 border-t border-green-200 p-4 text-center"
    >
      <div class="flex items-center justify-center mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-green-600 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-lg font-semibold text-green-800">Rest Complete!</span>
      </div>
      <p class="text-sm text-green-700 mb-3">
        Ready for your next set
      </p>
      <button
        class="btn btn-success"
        @click="$emit('reset')"
      >
        Continue Workout
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  duration: {
    type: Number,
    required: true,
  },
  remaining: {
    type: Number,
    required: true,
  },
});

defineEmits(["pause", "reset"]);

// Computed
const progressPercentage = computed(() => {
  if (props.duration === 0) return 0;
  return ((props.duration - props.remaining) / props.duration) * 100;
});

const timeStatus = computed(() => {
  if (props.remaining <= 0) return "Rest Complete!";
  if (props.remaining <= 10) return "Almost done...";
  if (props.remaining <= 30) return "Final stretch";
  return "Take your rest";
});

// Methods
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const addTime = (seconds) => {
  // This would need to be handled by the parent component
  // For now, we'll just emit an event if needed
  console.log(`Would add ${seconds} seconds to timer`);
};
</script>

<style scoped>
/* Timer animations */
.rest-timer {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse animation for timer when low */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.timer-low {
  animation: pulse 1s infinite;
}
</style>