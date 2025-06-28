<template>
  <div
    class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 trainee-card"
  >
    <!-- Header with Avatar and Info -->
    <div
      class="flex items-center justify-between mb-4"
      @click="$emit('click', trainee)"
    >
      <div class="flex items-center cursor-pointer">
        <img
          :src="trainee.avatar || profilePlaceholder"
          :alt="trainee.name"
          class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          @error="$event.target.src = profilePlaceholder"
        >
        <div class="ml-4">
          <h3 class="font-semibold text-lg text-gray-900">
            {{ trainee.name || "Unknown Trainee" }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ trainee.email || "No email" }}
          </p>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
              statusClass,
            ]"
          >
            {{ formatStatus() }}
          </span>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="flex flex-col space-y-2">
        <button
          class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          title="Assign Program"
          @click.stop="$emit('assign-program', trainee)"
        >
          <svg
            class="w-4 h-4 mr-2"
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
          Programs
        </button>
      </div>
    </div>
    
    <!-- Training Info -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide">
          Programs
        </p>
        <p class="text-lg font-semibold text-gray-900">
          {{ programsAssigned }}
        </p>
        <p
          class="text-xs"
          :class="programsAssigned > 0 ? 'text-blue-600' : 'text-gray-400'"
        >
          {{ programsAssigned > 0 ? 'Assigned' : 'None' }}
        </p>
      </div>
      <div class="text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide">
          Sessions
        </p>
        <p class="text-lg font-semibold text-gray-900">
          {{ sessionStats.completed }}
        </p>
        <p class="text-xs text-gray-500">
          of {{ sessionStats.total }} completed
        </p>
      </div>
      <div class="text-center">
        <p class="text-xs text-gray-500 uppercase tracking-wide">
          Progress
        </p>
        <p class="text-lg font-semibold text-gray-900">
          {{ progressPercentage }}%
        </p>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            class="bg-green-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          />
        </div>
      </div>
    </div>
    
    <!-- Latest Activity -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">
            Last Activity
          </p>
          <p class="text-sm text-gray-700">
            {{ lastActivityText }}
          </p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">
            Next Session
          </p>
          <p class="text-sm text-gray-700">
            {{ nextSessionText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import profilePlaceholder from '@/assets/profile-placeholder.png';

const props = defineProps({
  trainee: {
    type: Object,
    required: true
  }
});

defineEmits(['click', 'assign-program']);

// Calculate session statistics based on backend data
const sessionStats = computed(() => {
  // For now, return dummy data since we don't have session records in the trainee object
  // In a real implementation, this would come from session records related to the trainee
  return {
    completed: 0,
    total: 0
  };
});

const progressPercentage = computed(() => {
  const { completed, total } = sessionStats.value;
  if (!total) return 0;
  return Math.round((completed / total) * 100);
});

const programsAssigned = computed(() => {
  const assignments = props.trainee.program_assignments;
  return (assignments && Array.isArray(assignments)) ? assignments.length : 0;
});

const statusClass = computed(() => {
  // Since there's no is_active field in the backend, assume all trainees are active
  return 'bg-green-100 text-green-800';
});

const formatStatus = () => {
  // Default to Active since we don't have status tracking in the backend model yet
  return 'Active';
};

const lastActivityText = computed(() => {
  // This would ideally come from the last session record
  if (props.trainee.updated_at) {
    const date = new Date(props.trainee.updated_at);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }
  return 'No activity';
});

const nextSessionText = computed(() => {
  // This would come from scheduled sessions
  // For now, show placeholder
  return 'Not scheduled';
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};
</script>

<style scoped>
.trainee-card:hover {
  transform: translateY(-1px);
}
</style>