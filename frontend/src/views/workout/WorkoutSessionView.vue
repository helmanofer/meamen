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
                v-if="workoutStore.isWorkoutActive"
                class="btn btn-secondary"
                @click="pauseWorkout"
              >
                Pause
              </button>
              <button
                v-else-if="workoutStore.activeWorkout"
                class="btn btn-primary"
                @click="resumeWorkout"
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
                    @click="completeWorkout"
                  >
                    Finish Workout
                  </button>
                  <hr class="my-1">
                  <button
                    class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    @click="cancelWorkout"
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
      <!-- No Active Workout State -->
      <div
        v-if="!workoutStore.activeWorkout"
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
          Select a session template to start your workout
        </p>
        <router-link
          to="/programs"
          class="btn btn-primary"
        >
          Browse Session Templates
        </router-link>
      </div>

      <!-- Active Workout -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Exercise Navigation -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h2 class="text-lg font-semibold text-dark-gray mb-4">
            Exercises
          </h2>
          <div class="flex space-x-2 overflow-x-auto pb-2">
            <button
              v-for="(exercise, index) in workoutStore.activeWorkout.exercises"
              :key="index"
              class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="{
                'bg-primary-blue text-white': index === workoutStore.currentExerciseIndex,
                'bg-green-100 text-green-800': isExerciseCompleted(exercise),
                'bg-gray-100 text-gray-700': index !== workoutStore.currentExerciseIndex && !isExerciseCompleted(exercise)
              }"
              @click="workoutStore.goToExercise(index)"
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
            :exercise-index="workoutStore.currentExerciseIndex"
            :current-set-index="workoutStore.currentSetIndex"
            @complete-set="handleCompleteSet"
            @skip-set="handleSkipSet"
            @start-rest="handleStartRest"
            @go-to-set="workoutStore.goToSet"
          />
        </div>

        <!-- Rest Timer -->
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
      v-if="showWorkoutSummary"
      :is-open="showWorkoutSummary"
      :workout="workoutStore.activeWorkout"
      @close="showWorkoutSummary = false"
      @complete="completeWorkout"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useWorkoutSessionsStore } from "@/stores/workoutSessions";
import { useProgramsStore } from "@/stores/programs";
import ActiveExerciseCard from "@/components/workout/ActiveExerciseCard.vue";
import RestTimer from "@/components/workout/RestTimer.vue";
import WorkoutSummaryModal from "@/components/workout/WorkoutSummaryModal.vue";

const router = useRouter();
const route = useRoute();
const workoutStore = useWorkoutSessionsStore();
const programsStore = useProgramsStore();

// State
const showWorkoutMenu = ref(false);
const showWorkoutSummary = ref(false);
const workoutTimer = ref(null);

// Computed
const workoutName = computed(() => {
  return workoutStore.activeWorkout?.name || "Workout Session";
});

const workoutStatus = computed(() => {
  if (!workoutStore.activeWorkout) return "No active workout";
  if (workoutStore.activeWorkout.status === 'paused') return "Paused";
  if (workoutStore.isWorkoutActive) return "In Progress";
  return "Ready to start";
});

const currentExercise = computed(() => workoutStore.currentExercise);
const workoutProgress = computed(() => workoutStore.workoutProgress);
const totalExercises = computed(() => workoutStore.totalExercises);
const completedExercises = computed(() => workoutStore.completedExercises);
const workoutDuration = computed(() => workoutStore.workoutDuration);

// Methods
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

const handleCompleteSet = (setData) => {
  workoutStore.completeSet(
    workoutStore.currentExerciseIndex,
    workoutStore.currentSetIndex,
    setData
  );
};

const handleSkipSet = () => {
  workoutStore.skipSet(
    workoutStore.currentExerciseIndex,
    workoutStore.currentSetIndex
  );
};

const handleStartRest = (duration) => {
  workoutStore.startRestTimer(duration);
};

const pauseWorkout = () => {
  workoutStore.pauseWorkout();
};

const resumeWorkout = () => {
  workoutStore.resumeWorkout();
};

const completeWorkout = async () => {
  const confirmed = confirm("Are you sure you want to finish this workout?");
  if (!confirmed) return;

  try {
    await workoutStore.completeWorkout();
    router.push("/dashboard");
  } catch (error) {
    alert("Failed to save workout. Please try again.");
  }
};

const cancelWorkout = () => {
  const confirmed = confirm("Are you sure you want to cancel this workout? All progress will be lost.");
  if (!confirmed) return;

  workoutStore.cancelWorkout();
  router.push("/dashboard");
};

const handleBack = () => {
  if (workoutStore.activeWorkout) {
    const confirmed = confirm("You have an active workout. Do you want to pause and continue later?");
    if (confirmed) {
      workoutStore.pauseWorkout();
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
  await loadWorkoutFromRoute();
  
  // Start workout timer if workout is active
  if (workoutStore.isWorkoutActive) {
    workoutTimer.value = setInterval(() => {
      // Force reactivity update for workout duration
    }, 1000);
  }

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