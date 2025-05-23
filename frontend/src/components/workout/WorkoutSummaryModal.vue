<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-dark-gray">
          Workout Summary
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

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Workout Info -->
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-dark-gray mb-2">
            {{ workout.name }}
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-blue">
                {{ workoutSummary.duration }}
              </div>
              <div class="text-sm text-medium-gray">
                Duration
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-blue">
                {{ workoutSummary.completedExercises }}/{{ workoutSummary.totalExercises }}
              </div>
              <div class="text-sm text-medium-gray">
                Exercises
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-blue">
                {{ workoutSummary.completedSets }}/{{ workoutSummary.totalSets }}
              </div>
              <div class="text-sm text-medium-gray">
                Sets
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-primary-blue">
                {{ workoutSummary.totalVolume }}
              </div>
              <div class="text-sm text-medium-gray">
                Total Volume (kg)
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="p-6 border-b border-gray-100">
          <h4 class="font-medium text-dark-gray mb-4">
            Progress Overview
          </h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-medium-gray">Overall Completion</span>
              <span class="text-sm font-medium text-dark-gray">{{ Math.round(overallProgress) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-primary-blue h-2 rounded-full transition-all duration-300"
                :style="{ width: `${overallProgress}%` }"
              />
            </div>
          </div>
        </div>

        <!-- Exercise Details -->
        <div class="p-6">
          <h4 class="font-medium text-dark-gray mb-4">
            Exercise Details
          </h4>
          <div class="space-y-4">
            <div
              v-for="(exercise, index) in workout.exercises"
              :key="index"
              class="border border-gray-200 rounded-lg p-4"
            >
              <!-- Exercise Header -->
              <div class="flex items-center justify-between mb-3">
                <h5 class="font-medium text-dark-gray">
                  {{ exercise.exercise_name }}
                </h5>
                <div class="flex items-center space-x-2">
                  <span
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="getExerciseStatusClass(exercise)"
                  >
                    {{ getExerciseStatus(exercise) }}
                  </span>
                </div>
              </div>

              <!-- Sets Summary -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div
                  v-for="(set, setIndex) in exercise.recordedSets"
                  :key="setIndex"
                  class="bg-gray-50 rounded p-3"
                  :class="{ 'bg-green-50': set.completed }"
                >
                  <div class="font-medium text-dark-gray mb-1">
                    Set {{ set.setNumber }}
                  </div>
                  <div
                    v-if="set.completed"
                    class="space-y-1"
                  >
                    <div class="text-medium-gray">
                      {{ set.actualReps || '-' }} reps
                    </div>
                    <div class="text-medium-gray">
                      {{ set.actualWeight || '-' }} kg
                    </div>
                    <div
                      v-if="set.notes"
                      class="text-xs text-medium-gray italic"
                    >
                      "{{ set.notes }}"
                    </div>
                  </div>
                  <div
                    v-else
                    class="text-medium-gray"
                  >
                    Not completed
                  </div>
                </div>
              </div>

              <!-- Exercise Notes -->
              <div
                v-if="exercise.notes"
                class="mt-3 p-3 bg-blue-50 rounded"
              >
                <div class="text-xs font-medium text-blue-700 mb-1">
                  Exercise Notes
                </div>
                <div class="text-sm text-blue-800">
                  {{ exercise.notes }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <button
          class="btn btn-secondary"
          @click="closeModal"
        >
          Close
        </button>
        
        <div class="flex items-center space-x-3">
          <div
            v-if="!isWorkoutComplete"
            class="text-sm text-medium-gray"
          >
            Complete all exercises to finish workout
          </div>
          <button
            :disabled="!isWorkoutComplete"
            class="btn btn-success flex items-center"
            :class="{ 'opacity-50 cursor-not-allowed': !isWorkoutComplete }"
            @click="completeWorkout"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Finish Workout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  workout: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "complete"]);

// Computed
const workoutSummary = computed(() => {
  if (!props.workout?.exercises) return {};

  const totalSets = props.workout.exercises.reduce((total, exercise) => {
    return total + (exercise.recordedSets?.length || 0);
  }, 0);

  const completedSets = props.workout.exercises.reduce((total, exercise) => {
    return total + (exercise.recordedSets?.filter(set => set.completed).length || 0);
  }, 0);

  const totalVolume = props.workout.exercises.reduce((total, exercise) => {
    return total + (exercise.recordedSets?.reduce((exerciseVolume, set) => {
      if (set.completed && set.actualWeight && set.actualReps) {
        return exerciseVolume + (set.actualWeight * set.actualReps);
      }
      return exerciseVolume;
    }, 0) || 0);
  }, 0);

  const completedExercises = props.workout.exercises.filter(exercise => 
    exercise.recordedSets?.every(set => set.completed)
  ).length;

  // Calculate duration
  const startTime = props.workout.startTime ? new Date(props.workout.startTime) : new Date();
  const now = new Date();
  const durationMinutes = Math.floor((now - startTime) / (1000 * 60));

  return {
    totalExercises: props.workout.exercises.length,
    completedExercises,
    totalSets,
    completedSets,
    totalVolume: Math.round(totalVolume),
    duration: `${durationMinutes} min`
  };
});

const overallProgress = computed(() => {
  if (workoutSummary.value.totalSets === 0) return 0;
  return (workoutSummary.value.completedSets / workoutSummary.value.totalSets) * 100;
});

const isWorkoutComplete = computed(() => {
  return workoutSummary.value.completedExercises === workoutSummary.value.totalExercises;
});

// Methods
const getExerciseStatus = (exercise) => {
  const completedSets = exercise.recordedSets?.filter(set => set.completed).length || 0;
  const totalSets = exercise.recordedSets?.length || 0;
  
  if (completedSets === 0) return "Not Started";
  if (completedSets === totalSets) return "Completed";
  return `${completedSets}/${totalSets} Sets`;
};

const getExerciseStatusClass = (exercise) => {
  const completedSets = exercise.recordedSets?.filter(set => set.completed).length || 0;
  const totalSets = exercise.recordedSets?.length || 0;
  
  if (completedSets === 0) return "bg-gray-100 text-gray-800";
  if (completedSets === totalSets) return "bg-green-100 text-green-800";
  return "bg-yellow-100 text-yellow-800";
};

const closeModal = () => {
  emit("close");
};

const completeWorkout = () => {
  if (isWorkoutComplete.value) {
    emit("complete");
  }
};
</script>

<style scoped>
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