<template>
  <div
    class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex items-center cursor-pointer trainee-card"
    @click="$emit('click', trainee)"
  >
    <img
      :src="trainee.profileImage ? trainee.profileImage : profilePlaceholder"
      :alt="trainee.name"
      class="w-16 h-16 rounded-full object-cover border border-light-gray"
    >
    <div class="ml-4 flex-1">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-lg text-dark-gray truncate">
          {{ trainee.name || "Unknown" }}
        </h2>
        <span
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            statusClass,
          ]"
        >
          {{ trainee.status || "Active" }}
        </span>
      </div>
      <p class="text-sm text-medium-gray mt-1">
        {{ trainee.program_name || trainee.programName || "No Program" }}
      </p>
      <div class="flex items-center mt-2 space-x-4">
        <div>
          <p class="text-xs text-medium-gray">
            Sessions
          </p>
          <p class="font-semibold text-sm">
            {{ trainee.completedSessions || 0 }}/{{ trainee.totalSessions || 0 }}
          </p>
        </div>
        <div>
          <p class="text-xs text-medium-gray">
            Progress
          </p>
          <div class="w-20 bg-light-gray rounded-full h-2 mt-1">
            <div
              class="bg-success h-2 rounded-full"
              :style="{ width: progressPercentage + '%' }"
            />
          </div>
          <p class="text-xs mt-1">
            {{ progressPercentage }}%
          </p>
        </div>
        <div>
          <p class="text-xs text-medium-gray">
            Last Active
          </p>
          <p class="text-sm">
            {{ trainee.lastActive ? formatDate(trainee.lastActive) : "N/A" }}
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

defineEmits(['click']);

const progressPercentage = computed(() => {
  if (!props.trainee.completedSessions || !props.trainee.totalSessions) return 0;
  return Math.round((props.trainee.completedSessions / props.trainee.totalSessions) * 100);
});

const statusClass = computed(() => {
  switch (props.trainee.status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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