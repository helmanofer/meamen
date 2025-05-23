<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-dark-gray">
          Select Exercise
        </h2>
        <button
          class="text-medium-gray hover:text-dark-gray transition-colors"
          @click="closeModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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

      <!-- Search and Filters -->
      <div class="p-6 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search exercises..."
                class="input-field pl-10 w-full"
                @input="onSearchInput"
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 absolute left-3 top-3 text-medium-gray"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <select
              v-model="categoryFilter"
              class="input-field w-full"
              @change="onFilterChange"
            >
              <option value="">
                All Categories
              </option>
              <option
                v-for="category in exercisesStore.categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Muscle Group Filter -->
          <div>
            <select
              v-model="muscleGroupFilter"
              class="input-field w-full"
              @change="onFilterChange"
            >
              <option value="">
                All Muscle Groups
              </option>
              <option
                v-for="muscleGroup in exercisesStore.muscleGroups"
                :key="muscleGroup"
                :value="muscleGroup"
              >
                {{ muscleGroup }}
              </option>
            </select>
          </div>

          <!-- Equipment Filter -->
          <div>
            <select
              v-model="equipmentFilter"
              class="input-field w-full"
              @change="onFilterChange"
            >
              <option value="">
                All Equipment
              </option>
              <option
                v-for="equipment in exercisesStore.equipmentTypes"
                :key="equipment"
                :value="equipment"
              >
                {{ equipment }}
              </option>
            </select>
          </div>
        </div>

        <!-- Active Filters -->
        <div
          v-if="hasActiveFilters"
          class="mt-4 flex items-center space-x-2"
        >
          <span class="text-sm text-medium-gray">Active filters:</span>
          <button
            v-if="searchQuery"
            class="filter-tag"
            @click="searchQuery = ''; onSearchInput()"
          >
            Search: "{{ searchQuery }}" ×
          </button>
          <button
            v-if="categoryFilter"
            class="filter-tag"
            @click="categoryFilter = ''; onFilterChange()"
          >
            {{ categoryFilter }} ×
          </button>
          <button
            v-if="muscleGroupFilter"
            class="filter-tag"
            @click="muscleGroupFilter = ''; onFilterChange()"
          >
            {{ muscleGroupFilter }} ×
          </button>
          <button
            v-if="equipmentFilter"
            class="filter-tag"
            @click="equipmentFilter = ''; onFilterChange()"
          >
            {{ equipmentFilter }} ×
          </button>
          <button
            class="text-sm text-primary-blue hover:text-dark-blue"
            @click="clearFilters"
          >
            Clear all
          </button>
        </div>
      </div>

      <!-- Exercise List -->
      <div
        class="flex-1 overflow-y-auto p-6"
        style="max-height: 60vh;"
      >
        <!-- Loading State -->
        <div
          v-if="exercisesStore.loading"
          class="flex justify-center py-8"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue" />
        </div>

        <!-- Error State -->
        <div
          v-else-if="exercisesStore.error"
          class="text-center py-8"
        >
          <p class="text-red-600 mb-4">
            {{ exercisesStore.error }}
          </p>
          <button
            class="btn btn-primary"
            @click="exercisesStore.fetchExercises()"
          >
            Try Again
          </button>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredExercises.length === 0"
          class="text-center py-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto h-12 w-12 text-medium-gray mb-4"
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
          <h3 class="text-lg font-medium text-dark-gray mb-2">
            No exercises found
          </h3>
          <p class="text-medium-gray">
            {{ hasActiveFilters ? 'Try adjusting your filters' : 'No exercises available' }}
          </p>
        </div>

        <!-- Exercise Grid -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="exercise in filteredExercises"
            :key="exercise.id"
            class="exercise-card bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-blue cursor-pointer transition-colors"
            @click="selectExercise(exercise)"
          >
            <!-- Exercise Image -->
            <div class="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
              <img
                v-if="exercise.image_url"
                :src="exercise.image_url"
                :alt="exercise.name"
                class="w-full h-full object-cover"
                @error="onImageError"
              >
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-medium-gray"
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

            <!-- Exercise Info -->
            <div>
              <h4 class="font-medium text-dark-gray mb-1">
                {{ exercise.name }}
              </h4>
              
              <div class="flex items-center space-x-2 mb-2">
                <span
                  v-if="exercise.difficulty"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getDifficultyClass(exercise.difficulty)"
                >
                  {{ exercise.difficulty }}
                </span>
                <span
                  v-if="exercise.category"
                  class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                >
                  {{ exercise.category }}
                </span>
              </div>

              <div class="flex items-center justify-between">
                <span
                  v-if="exercise.equipment"
                  class="text-xs text-medium-gray flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 mr-1"
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
                
                <button
                  class="text-primary-blue hover:text-dark-blue text-sm font-medium"
                  @click.stop="selectExercise(exercise)"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <span class="text-sm text-medium-gray">
          {{ filteredExercises.length }} exercises available
        </span>
        <button
          class="btn btn-secondary"
          @click="closeModal"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useExercisesStore } from "@/stores/exercises";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "select"]);

const exercisesStore = useExercisesStore();

// Local filter state
const searchQuery = ref("");
const categoryFilter = ref("");
const muscleGroupFilter = ref("");
const equipmentFilter = ref("");

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    categoryFilter.value ||
    muscleGroupFilter.value ||
    equipmentFilter.value
  );
});

const filteredExercises = computed(() => {
  let filtered = [...exercisesStore.exercises];
  
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(exercise => 
      exercise.name.toLowerCase().includes(searchTerm) ||
      (exercise.description && exercise.description.toLowerCase().includes(searchTerm))
    );
  }
  
  if (categoryFilter.value) {
    filtered = filtered.filter(exercise => 
      exercise.category === categoryFilter.value
    );
  }
  
  if (muscleGroupFilter.value) {
    filtered = filtered.filter(exercise => 
      exercise.muscle_groups && exercise.muscle_groups.includes(muscleGroupFilter.value)
    );
  }
  
  if (equipmentFilter.value) {
    filtered = filtered.filter(exercise => 
      exercise.equipment === equipmentFilter.value
    );
  }
  
  return filtered;
});

// Methods
const onSearchInput = () => {
  // Search happens via computed property
};

const onFilterChange = () => {
  // Filtering happens via computed property
};

const clearFilters = () => {
  searchQuery.value = "";
  categoryFilter.value = "";
  muscleGroupFilter.value = "";
  equipmentFilter.value = "";
};

const closeModal = () => {
  clearFilters();
  emit("close");
};

const selectExercise = (exercise) => {
  emit("select", exercise);
  closeModal();
};

const getDifficultyClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    case 'expert':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const onImageError = (event) => {
  event.target.style.display = 'none';
};

// Initialize
onMounted(() => {
  if (exercisesStore.exercises.length === 0) {
    exercisesStore.fetchExercises();
  }
});
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent;
}

.filter-tag {
  @apply px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors;
}

.exercise-card:hover {
  transform: translateY(-1px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>