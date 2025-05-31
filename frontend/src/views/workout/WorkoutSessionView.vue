<template>
  <div class="workout-session-view min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              class="btn-icon text-medium-gray hover:text-dark-gray"
              @click="handleBack"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 class="text-xl font-semibold text-dark-gray">
                {{ workoutName }}
              </h1>
              <p class="text-sm text-medium-gray">
                {{ workoutStatus }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Workout Timer -->
            <div class="text-right">
              <div class="text-lg font-mono font-semibold text-dark-gray">
                {{ formatTime(workoutDuration) }}
              </div>
              <div class="text-xs text-medium-gray">
                Workout Time
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center space-x-2">
              <button
                v-if="activeTraineeWorkout && activeTraineeWorkout.isWorkoutActive"
                class="btn btn-secondary"
                @click="pauseActiveWorkout"
              >
                Pause
              </button>
              <button
                v-else-if="activeTraineeWorkout && !activeTraineeWorkout.isWorkoutActive && activeTraineeWorkout.status === 'paused'"
                class="btn btn-primary"
                @click="resumeActiveWorkout"
              >
                Resume
              </button>
              
              <button
                class="btn-icon text-medium-gray hover:text-dark-gray relative"
                @click="showWorkoutMenu = !showWorkoutMenu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                
                <!-- Dropdown Menu -->
                <div
                  v-if="showWorkoutMenu"
                  class="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]"
                >
                  <button
                    class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                    @click="showWorkoutSummary = true; showWorkoutMenu = false"
                  >
                    Summary
                  </button>
                  <button
                    class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                    @click="confirmCompleteWorkout" :disabled="!activeTraineeWorkout"
                  >
                    Finish Workout
                  </button>
                  <hr class="my-1">
                  <button
                    class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    @click="confirmCancelWorkout" :disabled="!activeTraineeWorkout"
                  >
                    Cancel Workout
                  </button>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="flex items-center justify-between text-sm text-medium-gray mb-2">
            <span>Progress</span>
            <span>{{ completedExercises }}/{{ totalExercises }} exercises</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary-blue h-2 rounded-full transition-all duration-300"
              :style="{ width: `${workoutProgress}%` }"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Trainee & Plan Selection UI (Shown if no workouts started for currentTraineeId or no currentTraineeId) -->
      <div v-if="!activeTraineeWorkout && Object.keys(workoutStore.activeWorkout).length === 0" class="mb-6 p-4 bg-white shadow rounded-lg">
        <h2 class="text-xl font-semibold mb-4 text-dark-gray">Setup New Session</h2>

        <!-- Trainee Selection -->
        <div class="mb-4">
          <h3 class="text-lg font-medium mb-2 text-dark-gray">Select Trainees:</h3>
          <div v-for="trainee in availableTrainees" :key="trainee.id" class="flex items-center mb-1">
            <input
              type="checkbox"
              :id="`trainee-${trainee.id}`"
              :value="trainee.id"
              v-model="selectedTrainees"
              class="h-4 w-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
            />
            <label :for="`trainee-${trainee.id}`" class="ml-2 text-sm text-gray-700">{{ trainee.name }} (ID: {{ trainee.id }})</label>
          </div>
        </div>

        <!-- Plan Assignment -->
        <div v-if="selectedTrainees.length > 0" class="mb-4">
          <h3 class="text-lg font-medium mb-2 text-dark-gray">Assign Plans:</h3>
          <div v-for="traineeIdInSelection in selectedTrainees" :key="traineeIdInSelection" class="mb-3 p-3 border rounded-md">
            <p class="font-semibold text-gray-800 mb-1">{{ availableTrainees.find(t => t.id === traineeIdInSelection)?.name || 'Unknown Trainee' }}</p>
            <select
              v-model="traineePlans[traineeIdInSelection]"
              class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
            >
              <option disabled value="">Select a plan</option>
              <option v-for="program in availablePrograms" :key="program.id" :value="program.id">
                {{ program.name }}
              </option>
            </select>
          </div>
        </div>

        <button
          v-if="selectedTrainees.length > 0"
          @click="startWorkoutsForSelectedTrainees"
          class="btn btn-primary w-full"
          :disabled="!areAllSelectedTraineesAssignedPlans()"
        >
          Start Workouts for Selected Trainees
        </button>
        <p v-if="selectedTrainees.length > 0 && !areAllSelectedTraineesAssignedPlans()" class="text-red-500 text-sm mt-2">
          Please assign a plan to all selected trainees.
        </p>
      </div>

      <!-- Trainee Tabs/Switcher -->
      <div v-if="Object.keys(workoutStore.activeWorkout).length > 1" class="mb-4">
        <h3 class="text-lg font-medium mb-2 text-dark-gray">Switch Trainee:</h3>
        <div class="flex space-x-2">
          <button
            v-for="(_, id) in workoutStore.activeWorkout"
            :key="id"
            @click="currentTraineeId = id"
            class="btn"
            :class="{'btn-primary': currentTraineeId === id, 'btn-secondary': currentTraineeId !== id}"
          >
            {{ getTraineeNameById(id) || `Trainee ${id}` }}
          </button>
        </div>
      </div>

      <!-- No Active Workout State (for currentTraineeId) -->
      <div
        v-if="!activeTraineeWorkout && Object.keys(workoutStore.activeWorkout).length > 0"
        class="text-center py-12"
      >
        <p class="text-lg text-medium-gray">Select a trainee to view their workout.</p>
      </div>

      <!-- No Active Workout State (Original message, shown if no workouts active at all AND no selection process happening) -->
      <div
        v-if="!activeTraineeWorkout && Object.keys(workoutStore.activeWorkout).length === 0 && selectedTrainees.length === 0"
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
          No active workout
        </h3>
        <p class="text-medium-gray mb-4">
          Select trainees and assign plans above to start a session, or select an active trainee.
        </p>
        <!-- Removed router-link to /programs -->
      </div>

      <!-- Active Workout (for currentTraineeId) -->
      <div
        v-if="activeTraineeWorkout"
        class="space-y-6"
      >
        <!-- Exercise Navigation -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h2 class="text-lg font-semibold text-dark-gray mb-4">
            Exercises ({{ getTraineeNameById(currentTraineeId) }})
          </h2>
          <div class="flex space-x-2 overflow-x-auto pb-2">
            <button
              v-for="(exercise, index) in activeTraineeWorkout.exercises"
              :key="index"
              class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="{
                'bg-primary-blue text-white': index === activeTraineeWorkout.currentExerciseIndex,
                'bg-green-100 text-green-800': isExerciseCompleted(exercise),
                'bg-gray-100 text-gray-700': index !== activeTraineeWorkout.currentExerciseIndex && !isExerciseCompleted(exercise)
              }"
              @click="goToExercise(index)"
            >
              {{ index + 1 }}. {{ exercise.exercise_name }}
            </button>
          </div>
        </div>

        <!-- Current Exercise -->
        <div
          v-if="currentExercise"
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <ActiveExerciseCard
            :exercise="currentExercise"
            :exercise-index="activeTraineeWorkout.currentExerciseIndex"
            :current-set-index="activeTraineeWorkout.currentSetIndex"
            @complete-set="handleCompleteSet"
            @skip-set="handleSkipSet"
            @start-rest="handleStartRest"
            @go-to-set="goToSet"
          />
        </div>

        <!-- Rest Timer -->
        <!-- Global rest timer for now -->
        <RestTimer
          v-if="workoutStore.restTimer.isActive"
          :duration="workoutStore.restTimer.duration"
          :remaining="workoutStore.restTimer.remaining"
          @pause="workoutStore.pauseRestTimer"
          @reset="workoutStore.resetRestTimer"
        />
      </div>
    </main>

    <!-- Workout Summary Modal -->
    <WorkoutSummaryModal
      v-if="showWorkoutSummary && activeTraineeWorkout"
      :is-open="showWorkoutSummary"
      :workout="activeTraineeWorkout"
      @close="showWorkoutSummary = false"
      @complete="confirmCompleteWorkout"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"; // Added watch
import { useRouter, useRoute } from "vue-router";
import { useWorkoutSessionsStore } from "@/stores/workoutSessions";
import { useProgramsStore } from "@/stores/programs";
import { useTraineesStore } from "@/stores/trainees"; // Added
import { useAuthStore } from "@/stores/auth"; // Added
import ActiveExerciseCard from "@/components/workout/ActiveExerciseCard.vue";
import RestTimer from "@/components/workout/RestTimer.vue";
import WorkoutSummaryModal from "@/components/workout/WorkoutSummaryModal.vue";

const router = useRouter();
const route = useRoute();
const workoutStore = useWorkoutSessionsStore();
const programsStore = useProgramsStore();
const traineesStore = useTraineesStore(); // Added
const authStore = useAuthStore(); // Added

// State for multi-trainee management
const selectedTrainees = ref([]); // Array of trainee IDs
const traineePlans = ref({}); // Object mapping traineeId to planId (session template ID)
const currentTraineeId = ref(null); // ID of the currently active/viewed trainee
const availableTrainees = ref([]);
const availablePrograms = ref([]);

// Existing State
const showWorkoutMenu = ref(false);
const showWorkoutSummary = ref(false);
const workoutTimer = ref(null); // This timer might need to be per-trainee or re-evaluated

// Computed properties adapted for currentTraineeId
const activeTraineeWorkout = computed(() => {
  if (!currentTraineeId.value || !workoutStore.activeWorkout[currentTraineeId.value]) {
    return null;
  }
  return workoutStore.activeWorkout[currentTraineeId.value];
});

const workoutName = computed(() => {
  // Uses new getter from workoutStore, expecting it to handle null currentTraineeId or missing workout
  return activeTraineeWorkout.value?.name || "Workout Session";
});

const workoutStatus = computed(() => {
  if (!activeTraineeWorkout.value) return "No active workout for selected trainee";
  if (activeTraineeWorkout.value.status === 'paused') return "Paused";
  if (activeTraineeWorkout.value.isWorkoutActive) return "In Progress";
  return "Ready to start";
});

const currentExercise = computed(() => {
  return currentTraineeId.value ? workoutStore.currentExercise(currentTraineeId.value) : null;
});
const workoutProgress = computed(() => {
  return currentTraineeId.value ? workoutStore.workoutProgress(currentTraineeId.value) : 0;
});
const totalExercises = computed(() => {
  return currentTraineeId.value ? workoutStore.totalExercises(currentTraineeId.value) : 0;
});
const completedExercises = computed(() => {
  return currentTraineeId.value ? workoutStore.completedExercises(currentTraineeId.value) : 0;
});
const workoutDuration = computed(() => {
  // This getter in the store already checks for workoutStartTime
  return currentTraineeId.value ? workoutStore.workoutDuration(currentTraineeId.value) : 0;
});


// Methods

// -- New methods for multi-trainee management --
const getTraineeNameById = (traineeId) => {
  if (!traineeId) return 'Unknown Trainee';
  const idToCompare = typeof traineeId === 'string' ? parseInt(traineeId, 10) : traineeId;
  const trainee = availableTrainees.value.find(t => t.id === idToCompare);
  return trainee ? trainee.name : `Trainee ${traineeId}`;
};

const areAllSelectedTraineesAssignedPlans = () => {
  if (selectedTrainees.value.length === 0) return false;
  return selectedTrainees.value.every(tid => traineePlans.value[tid] && traineePlans.value[tid] !== "");
};

const startWorkoutsForSelectedTrainees = async () => {
  if (!areAllSelectedTraineesAssignedPlans()) {
    alert("Please assign a plan to all selected trainees.");
    return;
  }

  let firstStartedTraineeId = null;

  for (const traineeId of selectedTrainees.value) {
    const planId = traineePlans.value[traineeId];
    const program = availablePrograms.value.find(p => p.id === planId);

    if (program) {
      let parsedDescription = {};
      let exercises = [];
      let sessionDescription = program.name; // Default description to program name

      if (program.description) {
        try {
          parsedDescription = JSON.parse(program.description);
          exercises = Array.isArray(parsedDescription.exercises) ? parsedDescription.exercises : [];
          sessionDescription = parsedDescription.description || program.name;
        } catch (e) {
          console.warn(`Program description for ${program.name} (ID: ${program.id}) is not valid JSON or missing 'exercises'. Using program name as description and empty exercises array. Error: ${e.message}`);
          // Keep default exercises = [] and sessionDescription = program.name
        }
      } else {
         console.warn(`Program description for ${program.name} (ID: ${program.id}) is empty. Using program name as description and empty exercises array.`);
      }

      const sessionTemplate = {
        id: program.id,
        name: program.name,
        description: sessionDescription,
        exercises: exercises,
      };

      try {
        // Ensure traineeId is passed as a number if your store expects numbers
        const numericTraineeId = typeof traineeId === 'string' ? parseInt(traineeId, 10) : traineeId;
        await workoutStore.startWorkout(sessionTemplate, numericTraineeId);
        if (!firstStartedTraineeId) {
          firstStartedTraineeId = numericTraineeId;
        }
        console.log(`Workout started for trainee ${numericTraineeId} with plan ${planId}`);
      } catch (error) {
        console.error(`Failed to start workout for trainee ${traineeId}:`, error);
        alert(`Failed to start workout for ${getTraineeNameById(traineeId)}.`);
      }
    } else {
      console.warn(`Plan with ID ${planId} not found for trainee ${traineeId}.`);
      alert(`Plan not found for ${getTraineeNameById(traineeId)}.`);
    }
  }

  if (firstStartedTraineeId) {
    currentTraineeId.value = firstStartedTraineeId;
  }
  // Reset selection
  selectedTrainees.value = [];
  traineePlans.value = {};
};

// -- Existing methods adapted --
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const isExerciseCompleted = (exercise) => {
  return exercise.recordedSets?.every(set => set.completed) || false;
};

const goToExercise = (exerciseIndex) => {
  if (currentTraineeId.value && activeTraineeWorkout.value) {
    workoutStore.goToExercise(currentTraineeId.value, exerciseIndex);
  } else {
    console.warn("goToExercise called without currentTraineeId or active workout for trainee.");
  }
};

const goToSet = (setIndex) => {
  if (currentTraineeId.value && activeTraineeWorkout.value) {
    workoutStore.goToSet(currentTraineeId.value, setIndex);
  } else {
    console.warn("goToSet called without currentTraineeId or active workout for trainee.");
  }
};

const handleCompleteSet = (setData) => {
  if (!currentTraineeId.value || !activeTraineeWorkout.value) return;
  workoutStore.completeSet(
    currentTraineeId.value,
    activeTraineeWorkout.value.currentExerciseIndex,
    activeTraineeWorkout.value.currentSetIndex,
    setData
  );
};

const handleSkipSet = () => {
  if (!currentTraineeId.value || !activeTraineeWorkout.value) return;
  workoutStore.skipSet(
    currentTraineeId.value,
    activeTraineeWorkout.value.currentExerciseIndex,
    activeTraineeWorkout.value.currentSetIndex
  );
};

const handleStartRest = (duration) => {
  // Rest timer is global as per previous store modifications
  workoutStore.startRestTimer(duration);
};

const pauseActiveWorkout = () => { // Renamed
  if (currentTraineeId.value) {
    workoutStore.pauseWorkout(currentTraineeId.value);
  }
};

const resumeActiveWorkout = () => { // Renamed
  if (currentTraineeId.value) {
    workoutStore.resumeWorkout(currentTraineeId.value);
  }
};

const completeActiveTraineeWorkout = async () => { // New method
  if (!currentTraineeId.value) return;
  const traineeName = getTraineeNameById(currentTraineeId.value);
  try {
    // The trainer_id is handled by the store, using the authStore internally.
    await workoutStore.completeWorkout(currentTraineeId.value);
    alert(`Workout for ${traineeName} completed successfully!`);

    // If this was the last active workout, set currentTraineeId to null
    if (Object.keys(workoutStore.activeWorkout).length === 0) {
      currentTraineeId.value = null;
    } else if (!workoutStore.activeWorkout[currentTraineeId.value]) {
      // If current trainee's workout was removed, pick another if available
      currentTraineeId.value = Object.keys(workoutStore.activeWorkout)[0] || null;
    }
    // Optionally, navigate if all workouts are done:
    // if (Object.keys(workoutStore.activeWorkout).length === 0) router.push("/dashboard");
  } catch (error) {
    console.error(`Error completing workout for ${traineeName}:`, error);
    alert(`Failed to save workout for ${traineeName}. Please try again.`);
  }
};

const confirmCompleteWorkout = () => { // Adapted from completeWorkout
  if (!currentTraineeId.value || !activeTraineeWorkout.value) {
    alert("No active workout selected to complete.");
    return;
  }
  const traineeName = getTraineeNameById(currentTraineeId.value);
  const confirmed = confirm(`Are you sure you want to finish the workout for ${traineeName}?`);
  if (confirmed) {
    completeActiveTraineeWorkout();
  }
  showWorkoutSummary.value = false;
  showWorkoutMenu.value = false;
};

const confirmCancelWorkout = () => { // Adapted from cancelWorkout
  if (!currentTraineeId.value || !activeTraineeWorkout.value) {
    alert("No active workout selected to cancel.");
    return;
  }
  const traineeName = getTraineeNameById(currentTraineeId.value);
  const confirmed = confirm(`Are you sure you want to cancel the workout for ${traineeName}? All progress will be lost.`);
  if (confirmed) {
    workoutStore.cancelWorkout(currentTraineeId.value);
    alert(`Workout for ${traineeName} cancelled.`);
    // Logic to switch currentTraineeId if needed
    if (Object.keys(workoutStore.activeWorkout).length === 0) {
      currentTraineeId.value = null;
    } else if (!workoutStore.activeWorkout[currentTraineeId.value]) {
      currentTraineeId.value = Object.keys(workoutStore.activeWorkout)[0] || null;
    }
    // if (Object.keys(workoutStore.activeWorkout).length === 0) router.push("/dashboard");
  }
  showWorkoutMenu.value = false;
};

const handleBack = () => {
  const anyWorkoutTrulyActive = Object.values(workoutStore.activeWorkout).some(w => w.isWorkoutActive);

  if (anyWorkoutTrulyActive) {
    const currentTraineeIsActive = activeTraineeWorkout.value && activeTraineeWorkout.value.isWorkoutActive;
    let message = "There is at least one active workout. ";
    if (currentTraineeIsActive && currentTraineeId.value) {
      message += `Do you want to pause the current workout for ${getTraineeNameById(currentTraineeId.value)} and leave?`;
    } else {
      message += "Are you sure you want to leave while workouts are in progress?";
    }
    const confirmed = confirm(message);

    if (confirmed) {
      if (currentTraineeIsActive && currentTraineeId.value) {
        workoutStore.pauseWorkout(currentTraineeId.value);
      }
    } else {
      return; // User chose not to leave
    }
  }
  router.push("/dashboard");
};

const loadWorkoutFromRoute = async () => {
  // This function is largely superseded by the new multi-trainee UI.
  // Keeping it around but commenting out its core logic to prevent conflicts.
  console.warn("loadWorkoutFromRoute is called, but its functionality is limited in multi-trainee mode.");
  /*
  const templateId = route.params.templateId;
  if (templateId && !currentTraineeId.value && Object.keys(workoutStore.activeWorkout).length === 0) {
    try {
      await programsStore.fetchProgramDetail(templateId);
      if (programsStore.programDetail) {
        let parsedData = {};
        try {
          parsedData = JSON.parse(programsStore.programDetail.description || '{}');
        } catch (e) { parsedData = { exercises: [], description: "" }; }

        const sessionTemplate = {
          id: programsStore.programDetail.id,
          name: programsStore.programDetail.name,
          description: parsedData.description || programsStore.programDetail.name,
          exercises: parsedData.exercises || []
        };
        // To fully implement this, you'd need a way to specify which trainee
        // this route-loaded workout is for, or assign to a default/first selected.
        // For now, this path is disabled in favor of the explicit UI selection.
        // await workoutStore.startWorkout(sessionTemplate, SOME_DEFAULT_TRAINEE_ID);
        // if (SOME_DEFAULT_TRAINEE_ID) currentTraineeId.value = SOME_DEFAULT_TRAINEE_ID;
      }
    } catch (error) {
      console.error("Failed to load workout template from route:", error);
      // router.push("/programs");
    }
  }
  */
};
    } else {
      return;
    }
  }
  router.push("/dashboard");
};

const loadWorkoutFromRoute = async () => {
  const templateId = route.params.templateId;
  if (templateId && !workoutStore.activeWorkout) {
    try {
      // Load session template and start workout
      await programsStore.fetchProgramDetail(templateId);
      if (programsStore.programDetail) {
        // Parse the session template data
        let parsedData = {};
        try {
          parsedData = JSON.parse(programsStore.programDetail.description || '{}');
        } catch (e) {
          parsedData = {};
        }

        const sessionTemplate = {
          id: programsStore.programDetail.id,
          name: programsStore.programDetail.name,
          description: parsedData.description || "",
          exercises: parsedData.exercises || []
        };

        await workoutStore.startWorkout(sessionTemplate);
      }
    } catch (error) {
      console.error("Failed to load workout template:", error);
      router.push("/programs");
    }
  }
};

// Lifecycle
onMounted(async () => {
  // await loadWorkoutFromRoute(); // Commented out for now, new UI will handle workout starts

  try {
    await traineesStore.fetchTrainees();
    availableTrainees.value = traineesStore.trainees;
  } catch (error) {
    console.error("Failed to fetch trainees:", error);
    // Handle error appropriately, e.g., show a notification
  }

  try {
    await programsStore.fetchPrograms(); // Assuming programs are used as session templates
    availablePrograms.value = programsStore.programs;
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    // Handle error appropriately
  }

  // Re-evaluate timer logic for multi-trainee context.
  // The global workout timer might not be suitable if each trainee has their own start time.
  // workoutDuration computed property now handles this for the currentTraineeId.
  // if (workoutStore.isWorkoutActive) { // This needs to check based on currentTraineeId
  //   workoutTimer.value = setInterval(() => {
  //     // Force reactivity update for workout duration - handled by computed property
  //   }, 1000);
  // }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showWorkoutMenu.value = false;
    }
  });
});

onUnmounted(() => {
  if (workoutTimer.value) {
    clearInterval(workoutTimer.value);
  }
});
</script>

<style scoped>
.btn-icon {
  @apply p-2 rounded-md transition-colors;
}
</style>