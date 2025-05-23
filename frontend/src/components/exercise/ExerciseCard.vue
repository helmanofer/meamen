<template>
  <div
    class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer exercise-card"
    :class="{ 'flex items-center': viewMode === 'list' }"
    @click="$emit('click', exercise)"
  >
    <!-- Exercise Image/Thumbnail -->
    <div 
      :class="[
        'relative overflow-hidden bg-light-gray',
        viewMode === 'grid' ? 'h-48' : 'w-32 h-24 flex-shrink-0'
      ]"
    >
      <img
        v-if="exercise.image_url"
        :src="exercise.image_url"
        :alt="exercise.name"
        :class="[
          'w-full h-full object-cover',
          viewMode === 'grid' ? '' : 'rounded-l-xl'
        ]"
      >
      <div
        v-else
        :class="[
          'w-full h-full flex items-center justify-center text-medium-gray',
          viewMode === 'grid' ? '' : 'rounded-l-xl'
        ]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      
      <!-- Difficulty Badge -->
      <div
        v-if="exercise.difficulty"
        class="absolute top-2 right-2"
      >
        <span
          :class="[
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            difficultyClass
          ]"
        >
          {{ exercise.difficulty }}
        </span>
      </div>
      
      <!-- Video indicator -->
      <div
        v-if="exercise.video_url"
        class="absolute bottom-2 left-2"
      >
        <div class="bg-black bg-opacity-70 rounded-full p-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
            />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Exercise Content -->
    <div :class="['p-4', viewMode === 'list' ? 'flex-1' : '']">
      <div class="flex items-start justify-between mb-2">
        <h3 
          :class="[
            'font-semibold text-dark-gray truncate',
            viewMode === 'grid' ? 'text-lg' : 'text-base'
          ]"
        >
          {{ exercise.name }}
        </h3>
        
        <!-- Quick Add Button -->
        <button
          class="btn-icon text-primary-blue hover:text-dark-blue ml-2 flex-shrink-0"
          title="Add to Program"
          @click.stop="$emit('add-to-program', exercise)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
        </button>
      </div>
      
      <!-- Muscle Groups -->
      <div
        v-if="exercise.muscle_groups"
        class="mb-2"
      >
        <div class="flex flex-wrap gap-1">
          <span
            v-for="group in muscleGroupsList"
            :key="group"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          >
            {{ group }}
          </span>
        </div>
      </div>
      
      <!-- Equipment -->
      <div
        v-if="exercise.equipment"
        class="mb-2"
      >
        <span class="text-sm text-medium-gray">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 inline mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          {{ exercise.equipment }}
        </span>
      </div>
      
      <!-- Description (truncated for grid view) -->
      <p 
        v-if="exercise.description"
        :class="[
          'text-sm text-medium-gray',
          viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1'
        ]"
      >
        {{ exercise.description }}
      </p>
      
      <!-- Category -->
      <div
        v-if="exercise.category"
        class="mt-2"
      >
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {{ exercise.category }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  exercise: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
});

defineEmits(['click', 'add-to-program']);

const muscleGroupsList = computed(() => {
  if (!props.exercise.muscle_groups) return [];
  return props.exercise.muscle_groups.split(',').map(group => group.trim());
});

const difficultyClass = computed(() => {
  switch (props.exercise.difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});
</script>

<style scoped>
.exercise-card:hover {
  transform: translateY(-1px);
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>