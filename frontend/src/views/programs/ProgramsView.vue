<template>
  <div class="programs-view container mx-auto px-4 py-6">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-display font-bold text-dark-gray">
          Session Templates
        </h1>
        <p class="text-medium-gray">
          Create and manage reusable workout session templates
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <button
          class="btn btn-primary flex items-center"
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
    </header>

    <!-- Search and Filters -->
    <section class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <!-- Search -->
        <div class="lg:col-span-2">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search templates..."
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
              v-for="difficulty in programsStore.difficulties"
              :key="difficulty"
              :value="difficulty"
            >
              {{ difficulty }}
            </option>
          </select>
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
              v-for="category in programsStore.categories"
              :key="category"
              :value="category"
            >
              {{ category }}
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProgramsStore } from "@/stores/programs";
import ProgramCard from "@/components/program/ProgramCard.vue";

const router = useRouter();
const programsStore = useProgramsStore();

// Local filter state
const searchQuery = ref("");
const difficultyFilter = ref("");
const categoryFilter = ref("");

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
  // TODO: Implement assign program functionality
  console.log("Assign program:", program);
  alert(`"${program.name}" assignment feature coming soon!`);
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
