<template>
  <div class="view-container">
    <header class="view-header">
      <div>
        <h1 class="text-display font-bold text-dark-gray">
          Trainees
        </h1>
        <p class="text-medium-gray">
          Manage your trainees and their progress
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <button
          class="btn btn-primary flex items-center"
          @click="createTrainee"
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
          Add Trainee
        </button>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search trainees..."
            class="search-input"
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
    </header>

    <section class="filters-section">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Compact Filters -->
        <div class="flex flex-wrap gap-3">
          <select
            v-model="statusFilter"
            class="input-field w-36"
          >
            <option value="">
              All Status
            </option>
            <option value="active">
              Active
            </option>
            <option value="paused">
              Paused
            </option>
            <option value="completed">
              Completed
            </option>
          </select>
          
          <select
            v-model="goalFilter"
            class="input-field w-40"
          >
            <option value="">
              All Goals
            </option>
            <option value="weight_loss">
              Weight Loss
            </option>
            <option value="muscle_gain">
              Muscle Gain
            </option>
            <option value="endurance">
              Endurance
            </option>
            <option value="general_fitness">
              General Fitness
            </option>
          </select>

          <button
            v-if="hasActiveFilters"
            class="btn btn-secondary text-sm"
            @click="clearFilters"
          >
            Clear Filters
          </button>
        </div>

        <!-- View Controls and Count -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-medium-gray">
            {{ filteredTrainees.length }} trainees
          </span>
          <div class="view-controls">
            <button
              class="btn-icon"
              :class="{ 'text-primary-blue': viewMode === 'grid' }"
              title="Grid View"
              @click="viewMode = 'grid'"
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
              :class="{ 'text-primary-blue': viewMode === 'list' }"
              title="List View"
              @click="viewMode = 'list'"
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

    <section class="trainees-list">
      <!-- Loading State -->
      <LoadingSkeleton v-if="traineesStore.loading" :count="6" />
      
      <!-- Error State -->
      <div
        v-else-if="traineesStore.error"
        class="text-center py-12"
      >
        <div class="text-red-600 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto h-12 w-12 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-lg font-medium">Failed to load trainees</p>
          <p class="text-sm text-gray-600 mt-1">{{ traineesStore.error }}</p>
        </div>
        <button
          class="btn btn-primary"
          @click="traineesStore.fetchTrainees()"
        >
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredTrainees.length === 0 && !traineesStore.loading"
        class="text-center text-medium-gray py-8"
      >
        No trainees found.
        <button
          class="text-primary-blue underline ml-1"
          @click="createTrainee"
        >
          Add your first trainee
        </button>
      </div>

      <!-- Content -->
      <transition-group
        v-else
        :name="viewMode === 'grid' ? 'grid' : 'list'"
        tag="div"
        :class="{
          'responsive-grid':
            viewMode === 'grid',
          'space-y-4': viewMode === 'list',
        }"
      >
        <TraineeCard
          v-for="trainee in filteredTrainees"
          :key="trainee.id"
          :trainee="trainee"
          @click="openTraineeDetail(trainee)"
          @assign-program="openAssignProgramModal(trainee)"
        />
      </transition-group>
    </section>

    <!-- Assign Program Modal -->
    <AssignProgramModal
      :is-open="showAssignModal"
      :trainee="selectedTrainee"
      @close="closeAssignProgramModal"
      @assigned="handleProgramAssigned"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTraineesStore } from "@/stores/trainees";
import TraineeCard from "@/components/trainee/TraineeCard.vue";
import LoadingSkeleton from "@/components/common/LoadingSkeleton.vue";
import AssignProgramModal from "@/components/trainee/AssignProgramModal.vue";

// State
const router = useRouter();
const traineesStore = useTraineesStore();
const searchQuery = ref("");
const statusFilter = ref("");
const goalFilter = ref("");
const viewMode = ref("grid");
const showAssignModal = ref(false);
const selectedTrainee = ref(null);

// Initialize data
onMounted(async () => {
  await traineesStore.fetchTrainees();
  console.log('Trainees loaded:', traineesStore.trainees);
  console.log('First trainee structure:', traineesStore.trainees[0]);
});

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    searchQuery.value ||
    statusFilter.value ||
    goalFilter.value
  );
});

const filteredTrainees = computed(() => {
  return traineesStore.trainees.filter((trainee) => {
    const matchesSearch = trainee.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesStatus =
      !statusFilter.value || trainee.status === statusFilter.value;
    const matchesGoal =
      !goalFilter.value || trainee.goal === goalFilter.value;

    return matchesSearch && matchesStatus && matchesGoal;
  });
});

// Methods
const openTraineeDetail = (trainee) => {
  console.log('Opening trainee detail for:', trainee);
  console.log('Trainee ID:', trainee.id);
  console.log('Navigating to:', `/trainees/${trainee.id}`);
  router.push(`/trainees/${trainee.id}`);
};



const createTrainee = () => {
  router.push('/trainees/add');
};

const clearFilters = () => {
  searchQuery.value = "";
  statusFilter.value = "";
  goalFilter.value = "";
};

const openAssignProgramModal = (trainee) => {
  selectedTrainee.value = trainee;
  showAssignModal.value = true;
};

const closeAssignProgramModal = () => {
  showAssignModal.value = false;
  selectedTrainee.value = null;
};

const handleProgramAssigned = () => {
  // Refresh trainees list to show updated program assignments
  traineesStore.fetchTrainees();
};
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
