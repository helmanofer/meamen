<template>
  <div class="exercise-detail-view container mx-auto px-4 py-6">
    <!-- Loading State -->
    <div v-if="exercisesStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="exercisesStore.error" class="text-center py-8">
      <p class="text-red-600 mb-4">{{ exercisesStore.error }}</p>
      <button @click="loadExercise" class="btn btn-primary">
        Try Again
      </button>
    </div>

    <!-- Exercise Not Found -->
    <div v-else-if="!exercise" class="text-center py-8">
      <h2 class="text-2xl font-bold text-dark-gray mb-4">Exercise Not Found</h2>
      <p class="text-medium-gray mb-4">The exercise you're looking for doesn't exist.</p>
      <router-link to="/exercises" class="btn btn-primary">
        Back to Exercise Library
      </router-link>
    </div>

    <!-- Exercise Detail Content -->
    <div v-else>
      <!-- Header with Navigation -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="$router.push('/exercises')"
          class="btn btn-secondary flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Library
        </button>

        <div class="flex items-center space-x-2">
          <button
            @click="editExercise"
            class="btn btn-primary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            @click="addToProgram"
            class="btn btn-success flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
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
            Add to Program
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Media Section -->
        <div class="space-y-6">
          <!-- Main Image/Video -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="aspect-video bg-light-gray relative">
              <img
                v-if="exercise.image_url"
                :src="exercise.image_url"
                :alt="exercise.name"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-medium-gray"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-16 w-16"
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

              <!-- Video Play Button -->
              <button
                v-if="exercise.video_url"
                @click="playVideo"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all"
              >
                <div class="bg-white rounded-full p-4 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-primary-blue"
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
              </button>
            </div>
          </div>

          <!-- Exercise Stats -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-h3 font-semibold mb-4">Exercise Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm text-medium-gray">Difficulty</span>
                <div class="mt-1">
                  <span
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      difficultyClass
                    ]"
                  >
                    {{ exercise.difficulty || 'Not specified' }}
                  </span>
                </div>
              </div>
              <div>
                <span class="text-sm text-medium-gray">Category</span>
                <div class="mt-1">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {{ exercise.category || 'Not specified' }}
                  </span>
                </div>
              </div>
              <div>
                <span class="text-sm text-medium-gray">Equipment</span>
                <p class="text-dark-gray font-medium">{{ exercise.equipment || 'None' }}</p>
              </div>
              <div>
                <span class="text-sm text-medium-gray">Created</span>
                <p class="text-dark-gray font-medium">{{ formatDate(exercise.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Information Section -->
        <div class="space-y-6">
          <!-- Header -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h1 class="text-display font-bold text-dark-gray mb-2">{{ exercise.name }}</h1>
            <p
              v-if="exercise.description"
              class="text-medium-gray leading-relaxed"
            >
              {{ exercise.description }}
            </p>
          </div>

          <!-- Muscle Groups -->
          <div v-if="exercise.muscle_groups" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-h3 font-semibold mb-4">Muscle Groups</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="group in muscleGroupsList"
                :key="group"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
              >
                {{ group }}
              </span>
            </div>
          </div>

          <!-- Instructions -->
          <div v-if="exercise.instructions" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-h3 font-semibold mb-4">Instructions</h3>
            <div class="text-dark-gray leading-relaxed whitespace-pre-line">
              {{ exercise.instructions }}
            </div>
          </div>

          <!-- Tips -->
          <div v-if="exercise.tips" class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-h3 font-semibold mb-4">Tips & Common Mistakes</h3>
            <div class="text-dark-gray leading-relaxed whitespace-pre-line">
              {{ exercise.tips }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useExercisesStore } from '@/stores/exercises';

const route = useRoute();
const exercisesStore = useExercisesStore();

const exercise = computed(() => exercisesStore.exerciseDetail);

const muscleGroupsList = computed(() => {
  if (!exercise.value?.muscle_groups) return [];
  return exercise.value.muscle_groups.split(',').map(group => group.trim());
});

const difficultyClass = computed(() => {
  switch (exercise.value?.difficulty?.toLowerCase()) {
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

const loadExercise = () => {
  const exerciseId = route.params.id;
  if (exerciseId) {
    exercisesStore.fetchExerciseDetail(exerciseId);
  }
};

const editExercise = () => {
  // TODO: Implement edit exercise functionality
  alert('Edit exercise feature coming soon!');
};

const addToProgram = () => {
  // TODO: Implement add to program functionality
  alert(`"${exercise.value.name}" will be added to program (feature coming soon)`);
};

const playVideo = () => {
  if (exercise.value?.video_url) {
    // TODO: Implement video player modal
    window.open(exercise.value.video_url, '_blank');
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
};

onMounted(() => {
  loadExercise();
});
</script>

<style scoped>
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
