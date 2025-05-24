<template>
  <div class="program-detail-view container mx-auto px-4 py-6 max-w-6xl">
    <!-- Loading State -->
    <div
      v-if="programsStore.loading"
      class="flex justify-center py-8"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="programsStore.error"
      class="text-center py-8"
    >
      <div class="text-red-600 mb-4">
        {{ programsStore.error }}
      </div>
      <button
        class="btn btn-primary"
        @click="loadProgram"
      >
        Try Again
      </button>
    </div>

    <!-- Program Detail Content -->
    <div v-else-if="program">
      <!-- Header -->
      <header class="flex items-start justify-between mb-6">
        <div class="flex items-start">
          <button
            class="btn btn-secondary flex items-center mr-4 mt-1"
            @click="goBack"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
          <div>
            <h1 class="text-display font-bold text-dark-gray mb-2">
              {{ program.name }}
            </h1>
            <p class="text-medium-gray mb-3">
              {{ program.description }}
            </p>
            
            <!-- Quick Info Tags -->
            <div class="flex flex-wrap gap-2">
              <span
                v-if="program.category"
                class="px-3 py-1 bg-primary-blue/10 text-primary-blue rounded-full text-sm font-medium"
              >
                {{ program.category }}
              </span>
              <span
                v-if="program.difficulty"
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getDifficultyClass(program.difficulty)"
              >
                {{ program.difficulty }}
              </span>
              <span
                v-if="program.duration_minutes"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {{ program.duration_minutes }} minutes
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            class="btn btn-success flex items-center"
            @click="startWorkout"
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1"
              />
            </svg>
            Start Workout
          </button>
          <button
            class="btn btn-primary flex items-center"
            @click="assignToTrainee"
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
            Assign to Trainee
          </button>
          <div class="relative">
            <button
              class="btn btn-secondary"
              @click="showMenu = !showMenu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]"
            >
              <button
                class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                @click="editProgram"
              >
                Edit Template
              </button>
              <button
                class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                @click="duplicateProgram"
              >
                Duplicate
              </button>
              <button
                class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                @click="exportProgram"
              >
                Export
              </button>
              <hr class="my-1">
              <button
                class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                @click="deleteProgram"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Exercise List -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4">
              Workout Structure
            </h2>
            
            <div
              v-if="workoutExercises.length > 0"
              class="space-y-4"
            >
              <div
                v-for="(exercise, index) in workoutExercises"
                :key="index"
                class="border border-gray-200 rounded-lg p-4 hover:border-primary-blue transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold text-dark-gray mb-1">
                      {{ index + 1 }}. {{ exercise.exercise }}
                    </h3>
                    <div class="flex flex-wrap gap-4 text-sm text-medium-gray">
                      <span v-if="exercise.sets">
                        <strong>Sets:</strong> {{ exercise.sets }}
                      </span>
                      <span v-if="exercise.reps">
                        <strong>Reps:</strong> {{ exercise.reps }}
                      </span>
                      <span v-if="exercise.rest_seconds">
                        <strong>Rest:</strong> {{ formatRestTime(exercise.rest_seconds) }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-medium-gray">
                      Exercise {{ index + 1 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="text-center py-8 text-medium-gray"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No exercises defined for this template</p>
            </div>
          </div>

          <!-- Trainer Notes -->
          <div
            v-if="program.notes"
            class="bg-white rounded-lg shadow-sm p-6 mt-6"
          >
            <h2 class="text-h2 font-semibold text-dark-gray mb-4">
              Trainer Notes
            </h2>
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p class="text-dark-gray whitespace-pre-line">
                {{ program.notes }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column - Program Info -->
        <div class="space-y-6">
          <!-- Overview Card -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4">
              Overview
            </h2>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-medium-gray">Duration</span>
                <span class="font-medium text-dark-gray">
                  {{ program.duration_minutes ? `${program.duration_minutes} minutes` : 'Not specified' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-medium-gray">Difficulty</span>
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getDifficultyClass(program.difficulty)"
                >
                  {{ program.difficulty || 'Not specified' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-medium-gray">Category</span>
                <span class="font-medium text-dark-gray">
                  {{ program.category || 'Not specified' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-medium-gray">Total Exercises</span>
                <span class="font-medium text-dark-gray">
                  {{ workoutExercises.length }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-2">
                <span class="text-medium-gray">Created</span>
                <span class="font-medium text-dark-gray">
                  {{ formatDate(program.created_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Equipment Card -->
          <div
            v-if="equipmentList.length > 0"
            class="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 class="text-h2 font-semibold text-dark-gray mb-4">
              Equipment Needed
            </h2>
            
            <div class="flex flex-wrap gap-2">
              <span
                v-for="equipment in equipmentList"
                :key="equipment"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {{ equipment }}
              </span>
            </div>
            
            <div
              v-if="equipmentList.includes('None')"
              class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <p class="text-green-800 text-sm">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                No equipment required - bodyweight exercises only!
              </p>
            </div>
          </div>

          <!-- Statistics Card -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4">
              Statistics
            </h2>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-primary-blue">
                  {{ totalSets }}
                </div>
                <div class="text-xs text-medium-gray">
                  Total Sets
                </div>
              </div>
              
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">
                  {{ estimatedCalories }}
                </div>
                <div class="text-xs text-medium-gray">
                  Est. Calories
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4">
              Quick Actions
            </h2>
            
            <div class="space-y-3">
              <button
                class="w-full btn btn-primary text-left"
                @click="startWorkout"
              >
                Start This Workout
              </button>
              <button
                class="w-full btn btn-secondary text-left"
                @click="scheduleWorkout"
              >
                Schedule for Later
              </button>
              <button
                class="w-full btn btn-outline text-left"
                @click="previewWorkout"
              >
                Preview Workout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div
      v-else
      class="text-center py-12"
    >
      <h1 class="text-h1 font-bold text-dark-gray mb-4">
        Program Not Found
      </h1>
      <p class="text-medium-gray mb-6">
        The program you're looking for doesn't exist or has been removed.
      </p>
      <button
        class="btn btn-primary"
        @click="goBack"
      >
        Back to Programs
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProgramsStore } from '@/stores/programs';

const route = useRoute();
const router = useRouter();
const programsStore = useProgramsStore();

// State
const showMenu = ref(false);

// Computed
const program = computed(() => programsStore.programDetail);

const workoutExercises = computed(() => {
  if (!program.value?.exercises) return [];
  return program.value.exercises;
});

const equipmentList = computed(() => {
  if (!program.value?.equipment_needed) return [];
  return program.value.equipment_needed.split(',').map(item => item.trim()).filter(Boolean);
});

const totalSets = computed(() => {
  return workoutExercises.value.reduce((total, exercise) => {
    return total + (exercise.sets || 0);
  }, 0);
});

const estimatedCalories = computed(() => {
  // Simple estimation: 5 calories per minute for average workout
  const duration = program.value?.duration_minutes || 30;
  return Math.round(duration * 5);
});

// Methods
const getDifficultyClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatRestTime = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

const loadProgram = async () => {
  const programId = route.params.id;
  if (programId) {
    await programsStore.fetchProgramDetail(programId);
  }
};

const goBack = () => {
  router.push('/programs');
};

const startWorkout = () => {
  router.push(`/workout/${program.value.id}`);
};

const assignToTrainee = () => {
  // TODO: Implement assign to trainee functionality
  alert('Assign to trainee functionality coming soon!');
};

const editProgram = () => {
  showMenu.value = false;
  router.push(`/programs/builder/${program.value.id}`);
};

const duplicateProgram = async () => {
  showMenu.value = false;
  try {
    const duplicatedData = {
      ...program.value,
      name: `${program.value.name} (Copy)`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined
    };
    
    await programsStore.createProgram(duplicatedData);
    alert('Program duplicated successfully!');
    router.push('/programs');
  } catch (error) {
    console.error('Error duplicating program:', error);
    alert('Failed to duplicate program. Please try again.');
  }
};

const exportProgram = () => {
  showMenu.value = false;
  // TODO: Implement export functionality
  alert('Export functionality coming soon!');
};

const deleteProgram = async () => {
  showMenu.value = false;
  const confirmed = confirm(`Are you sure you want to delete "${program.value.name}"? This action cannot be undone.`);
  
  if (confirmed) {
    try {
      await programsStore.deleteProgram(program.value.id);
      alert('Program deleted successfully!');
      router.push('/programs');
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program. Please try again.');
    }
  }
};

const scheduleWorkout = () => {
  // TODO: Implement schedule functionality
  alert('Schedule workout functionality coming soon!');
};

const previewWorkout = () => {
  // TODO: Implement preview functionality
  alert('Preview workout functionality coming soon!');
};

// Lifecycle
onMounted(() => {
  loadProgram();
});

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadProgram();
  }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    showMenu.value = false;
  }
});
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary-blue text-white hover:bg-dark-blue;
}

.btn-secondary {
  @apply bg-gray-200 text-dark-gray hover:bg-gray-300;
}

.btn-success {
  @apply bg-green-600 text-white hover:bg-green-700;
}

.btn-outline {
  @apply border border-gray-300 text-dark-gray hover:bg-gray-50;
}
</style>