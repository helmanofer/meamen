<template>
  <div class="session-builder bg-gray-50 rounded-lg p-6 border border-gray-200">
    <!-- Session Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-4">
        <h3 class="text-h3 font-semibold text-dark-gray">
          Session {{ sessionIndex + 1 }}
        </h3>
        <div class="flex items-center space-x-2">
          <button
            v-if="sessionIndex > 0"
            class="btn-icon text-medium-gray hover:text-primary-blue"
            title="Move Up"
            @click="$emit('move-up', sessionIndex)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button
            class="btn-icon text-medium-gray hover:text-primary-blue"
            title="Move Down"
            @click="$emit('move-down', sessionIndex)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          class="btn-icon text-medium-gray hover:text-primary-blue"
          :title="isExpanded ? 'Collapse' : 'Expand'"
          @click="toggleExpanded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 transition-transform"
            :class="{ 'rotate-180': isExpanded }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          class="btn-icon text-red-500 hover:text-red-700"
          title="Remove Session"
          @click="$emit('remove', sessionIndex)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
              clip-rule="evenodd"
            />
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Session Basic Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="form-label">Session Name</label>
        <input
          v-model="localSession.name"
          type="text"
          class="input-field w-full"
          placeholder="e.g., Upper Body Strength"
          @input="emitUpdate"
        >
      </div>
      
      <div>
        <label class="form-label">Rest Between Exercises (seconds)</label>
        <input
          v-model.number="localSession.rest_between_exercises"
          type="number"
          min="0"
          max="600"
          class="input-field w-full"
          @input="emitUpdate"
        >
      </div>
    </div>

    <!-- Session Description -->
    <div class="mb-4">
      <label class="form-label">Session Description</label>
      <textarea
        v-model="localSession.description"
        rows="2"
        class="input-field w-full resize-none"
        placeholder="Describe the focus and goals of this session..."
        @input="emitUpdate"
      />
    </div>

    <!-- Expandable Exercises Section -->
    <div v-if="isExpanded">
      <!-- Exercises Header -->
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-medium text-dark-gray">
          Exercises ({{ localSession.exercises.length }})
        </h4>
        <button
          class="btn btn-primary flex items-center"
          @click="showExerciseSelector = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
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

      <!-- Exercises List -->
      <div
        v-if="localSession.exercises.length === 0"
        class="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto h-8 w-8 text-medium-gray mb-2"
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
        <p class="text-medium-gray text-sm">
          No exercises added yet
        </p>
        <button
          class="text-primary-blue hover:text-dark-blue text-sm mt-1"
          @click="showExerciseSelector = true"
        >
          Add your first exercise
        </button>
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <SessionExercise
          v-for="(exercise, index) in localSession.exercises"
          :key="exercise.id || `exercise-${index}`"
          :exercise="exercise"
          :exercise-index="index"
          @update="updateExercise"
          @remove="removeExercise"
          @move-up="moveExerciseUp"
          @move-down="moveExerciseDown"
        />
      </div>
    </div>

    <!-- Collapsed Summary -->
    <div
      v-else
      class="text-sm text-medium-gray"
    >
      {{ localSession.exercises.length }} exercises • 
      {{ estimatedDuration }} min estimated
    </div>

    <!-- Exercise Selector Modal -->
    <ExerciseSelectorModal
      v-if="showExerciseSelector"
      :is-open="showExerciseSelector"
      @close="showExerciseSelector = false"
      @select="addExercise"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import SessionExercise from "@/components/program/SessionExercise.vue";
import ExerciseSelectorModal from "@/components/program/ExerciseSelectorModal.vue";

const props = defineProps({
  session: {
    type: Object,
    required: true,
  },
  sessionIndex: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update", "remove", "move-up", "move-down"]);

// State
const isExpanded = ref(true);
const showExerciseSelector = ref(false);
const localSession = ref({ ...props.session });

// Computed
const estimatedDuration = computed(() => {
  const exerciseTime = localSession.value.exercises.reduce((total, exercise) => {
    const setsTime = (exercise.sets || 1) * (exercise.duration_per_set || 60);
    const restTime = (exercise.sets || 1) * (exercise.rest_between_sets || 60);
    return total + setsTime + restTime;
  }, 0);
  
  const betweenExerciseRest = (localSession.value.exercises.length - 1) * 
    (localSession.value.rest_between_exercises || 60);
  
  return Math.ceil((exerciseTime + betweenExerciseRest) / 60);
});

// Methods
const emitUpdate = () => {
  emit("update", props.sessionIndex, localSession.value);
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const generateExerciseId = () => {
  return 'exercise_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const addExercise = (exercise) => {
  const sessionExercise = {
    id: generateExerciseId(),
    exercise_id: exercise.id,
    exercise_name: exercise.name,
    exercise_data: exercise,
    sets: 3,
    reps: 10,
    weight: null,
    duration_per_set: 60,
    rest_between_sets: 60,
    notes: ""
  };
  
  localSession.value.exercises.push(sessionExercise);
  emitUpdate();
};

const updateExercise = (exerciseIndex, updatedExercise) => {
  localSession.value.exercises[exerciseIndex] = { ...updatedExercise };
  emitUpdate();
};

const removeExercise = (exerciseIndex) => {
  localSession.value.exercises.splice(exerciseIndex, 1);
  emitUpdate();
};

const moveExerciseUp = (exerciseIndex) => {
  if (exerciseIndex > 0) {
    const exercises = [...localSession.value.exercises];
    [exercises[exerciseIndex - 1], exercises[exerciseIndex]] = 
    [exercises[exerciseIndex], exercises[exerciseIndex - 1]];
    localSession.value.exercises = exercises;
    emitUpdate();
  }
};

const moveExerciseDown = (exerciseIndex) => {
  if (exerciseIndex < localSession.value.exercises.length - 1) {
    const exercises = [...localSession.value.exercises];
    [exercises[exerciseIndex], exercises[exerciseIndex + 1]] = 
    [exercises[exerciseIndex + 1], exercises[exerciseIndex]];
    localSession.value.exercises = exercises;
    emitUpdate();
  }
};

// Watch for prop changes
watch(() => props.session, (newSession) => {
  localSession.value = { ...newSession };
}, { deep: true });
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent;
}

.form-label {
  @apply block text-sm font-medium text-dark-gray mb-1;
}

.btn-icon {
  @apply p-2 rounded-md transition-colors;
}
</style>