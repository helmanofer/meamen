<template>
  <div class="view-container">
    <!-- Header -->
    <header class="view-header">
      <div>
        <h1 class="text-display font-bold text-dark-gray">
          Session Templates
        </h1>
        <p class="text-medium-gray">
          Create and manage reusable workout session templates
        </p>
      </div>
    </header>

    <!-- Search and Filters -->
    <section class="filters-section">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Search -->
        <div class="flex-1 max-w-md">
          <div class="search-container">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search templates..."
              class="search-input"
              @input="onSearchInput"
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="search-icon"
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

        <!-- Filters and Create Button -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            v-model="difficultyFilter"
            class="input-field w-36"
            @change="onFilterChange"
          >
            <option value="">
              All Difficulty
            </option>
            <option
              v-for="difficulty in programsStore.difficulties"
              :key="difficulty"
              :value="difficulty"
            >
              {{ difficulty }}
            </option>
          </select>

          <select
            v-model="categoryFilter"
            class="input-field w-36"
            @change="onFilterChange"
          >
            <option value="">
              All Category
            </option>
            <option
              v-for="category in programsStore.categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>

          <button
            class="btn btn-primary flex items-center whitespace-nowrap"
            @click="createProgram"
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
            Create Template
          </button>
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

        <span class="text-sm text-medium-gray">
          {{ filteredProgramsCount }} templates
        </span>
      </div>
    </section>

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
      <p class="text-red-600 mb-4">
        {{ programsStore.error }}
      </p>
      <button
        class="btn btn-primary"
        @click="programsStore.fetchPrograms()"
      >
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="programsStore.filteredPrograms.length === 0"
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
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="text-lg font-medium text-dark-gray mb-2">
        No templates found
      </h3>
      <p class="text-medium-gray mb-4">
        {{ hasActiveFilters ? 'Try adjusting your filters' : 'Get started by creating your first session template' }}
      </p>
      <button
        v-if="!hasActiveFilters"
        class="btn btn-primary"
        @click="createProgram"
      >
        Create Template
      </button>
      <button
        v-else
        class="btn btn-secondary"
        @click="clearFilters"
      >
        Clear Filters
      </button>
    </div>

    <!-- Programs Grid -->
    <section
      v-else
      class="programs-list"
    >
      <div class="responsive-grid">
        <ProgramCard
          v-for="program in programsStore.filteredPrograms"
          :key="program.id"
          :program="program"
          @click="openProgramDetail"
          @edit="editProgram"
          @assign="assignProgram"
        />
      </div>
    </section>

    <!-- Assign to Trainee Modal -->
    <AssignToTraineeModal
      :is-open="showAssignModal"
      :program="selectedProgram"
      @close="closeAssignModal"
      @assigned="handleProgramAssigned"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProgramsStore } from "@/stores/programs";
import ProgramCard from "@/components/program/ProgramCard.vue";
import AssignToTraineeModal from "@/components/program/AssignToTraineeModal.vue";

const router = useRouter();
const programsStore = useProgramsStore();

// Local filter state
const searchQuery = ref("");
const difficultyFilter = ref("");
const categoryFilter = ref("");
const showAssignModal = ref(false);
const selectedProgram = ref(null);

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    difficultyFilter.value ||
    categoryFilter.value
  );
});

const filteredProgramsCount = computed(() => {
  return programsStore.filteredPrograms.length;
});

// Methods
const onSearchInput = () => {
  programsStore.setFilters({ search: searchQuery.value });
};

const onFilterChange = () => {
  programsStore.setFilters({
    difficulty: difficultyFilter.value,
    category: categoryFilter.value,
  });
};

const clearFilters = () => {
  searchQuery.value = "";
  difficultyFilter.value = "";
  categoryFilter.value = "";
  programsStore.clearFilters();
};

const createProgram = () => {
  router.push("/programs/builder");
};

const openProgramDetail = (program) => {
  router.push(`/programs/${program.id}`);
};

const editProgram = (program) => {
  router.push(`/programs/builder/${program.id}`);
};

const assignProgram = (program) => {
  selectedProgram.value = program;
  showAssignModal.value = true;
};

const closeAssignModal = () => {
  showAssignModal.value = false;
  selectedProgram.value = null;
};

const handleProgramAssigned = () => {
  // Program has been assigned, no need to refresh anything in this view
  console.log('Program assigned successfully');
};

// Initialize
onMounted(() => {
  programsStore.fetchPrograms();
});
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent;
}
</style>
