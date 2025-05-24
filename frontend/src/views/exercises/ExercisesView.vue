<template>
  <div class="exercises-view container mx-auto px-4 py-6">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-display font-bold text-dark-gray">
          Exercise Library
        </h1>
        <p class="text-medium-gray">
          Browse and manage your exercise collection
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <button
          class="btn btn-primary flex items-center"
          @click="createExercise"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Add Exercise
        </button>
      </div>
    </header>

    <!-- Search and Filters -->
    <section class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        <!-- Search -->
        <div class="xl:col-span-2">
          <div class="search-container">
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

        <!-- Difficulty Filter -->
        <div>
          <select
            v-model="difficultyFilter"
            class="input-field w-full"
            @change="onFilterChange"
          >
            <option value="">
              All Difficulties
            </option>
            <option
              v-for="difficulty in exercisesStore.difficultyLevels"
              :key="difficulty"
              :value="difficulty"
            >
              {{ difficulty }}
            </option>
          </select>
        </div>
      </div>

      <!-- View Controls and Clear Filters -->
      <div class="flex items-center justify-between">
        <button
          v-if="hasActiveFilters"
          class="text-sm text-primary-blue hover:text-dark-blue"
          @click="clearFilters"
        >
          Clear Filters
        </button>
        <div v-else />

        <div class="flex items-center space-x-4">
          <span class="text-sm text-medium-gray">
            {{ filteredExercisesCount }} exercises
          </span>
          
          <!-- View Mode Toggle -->
          <div class="flex items-center space-x-2">
            <button
              class="btn-icon"
              :class="{ 'text-primary-blue': exercisesStore.viewMode === 'grid' }"
              title="Grid View"
              @click="exercisesStore.setViewMode('grid')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              class="btn-icon"
              :class="{ 'text-primary-blue': exercisesStore.viewMode === 'list' }"
              title="List View"
              @click="exercisesStore.setViewMode('list')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

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
      v-else-if="exercisesStore.filteredExercises.length === 0"
      class="text-center py-12"
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
      <p class="text-medium-gray mb-4">
        {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by adding your first exercise' }}
      </p>
      <button
        v-if="!hasActiveFilters"
        class="btn btn-primary"
        @click="createExercise"
      >
        Add Exercise
      </button>
      <button
        v-else
        class="btn btn-secondary"
        @click="clearFilters"
      >
        Clear Filters
      </button>
    </div>

    <!-- Exercise Grid/List -->
    <section
      v-else
      class="exercises-list"
    >
      <transition-group
        :name="exercisesStore.viewMode === 'grid' ? 'grid' : 'list'"
        tag="div"
        :class="{
          'responsive-grid-extended':
            exercisesStore.viewMode === 'grid',
          'space-y-4': exercisesStore.viewMode === 'list',
        }"
      >
        <ExerciseCard
          v-for="exercise in exercisesStore.filteredExercises"
          :key="exercise.id"
          :exercise="exercise"
          :view-mode="exercisesStore.viewMode"
          @click="openExerciseDetail"
          @add-to-program="addToProgram"
        />
      </transition-group>
    </section>

    <!-- Add Exercise Modal -->
    <AddExerciseModal
      :is-open="showAddModal"
      @close="showAddModal = false"
      @created="onExerciseCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useExercisesStore } from "@/stores/exercises";
import ExerciseCard from "@/components/exercise/ExerciseCard.vue";
import AddExerciseModal from "@/components/exercise/AddExerciseModal.vue";

const router = useRouter();
const exercisesStore = useExercisesStore();

// Local filter state
const searchQuery = ref("");
const categoryFilter = ref("");
const muscleGroupFilter = ref("");
const equipmentFilter = ref("");
const difficultyFilter = ref("");

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    categoryFilter.value ||
    muscleGroupFilter.value ||
    equipmentFilter.value ||
    difficultyFilter.value
  );
});

const filteredExercisesCount = computed(() => {
  return exercisesStore.filteredExercises.length;
});

// Methods
const onSearchInput = () => {
  exercisesStore.setFilters({ search: searchQuery.value });
};

const onFilterChange = () => {
  exercisesStore.setFilters({
    category: categoryFilter.value,
    muscle_group: muscleGroupFilter.value,
    equipment: equipmentFilter.value,
    difficulty: difficultyFilter.value,
  });
};

const clearFilters = () => {
  searchQuery.value = "";
  categoryFilter.value = "";
  muscleGroupFilter.value = "";
  equipmentFilter.value = "";
  difficultyFilter.value = "";
  exercisesStore.clearFilters();
};

const openExerciseDetail = (exercise) => {
  router.push(`/exercises/${exercise.id}`);
};

const addToProgram = (exercise) => {
  // TODO: Implement add to program functionality
  console.log("Add to program:", exercise);
  alert(`"${exercise.name}" will be added to program (feature coming soon)`);
};

const showAddModal = ref(false);

const createExercise = () => {
  showAddModal.value = true;
};

const onExerciseCreated = (newExercise) => {
  // Exercise is already added to store by the createExercise action
  console.log("New exercise created:", newExercise);
};

// Initialize
onMounted(() => {
  exercisesStore.fetchExercises();
});
</script>

<style scoped>
/* Grid transition */
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* List transition */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
