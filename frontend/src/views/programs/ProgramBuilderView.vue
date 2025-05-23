<template>
  <div class="program-builder-view container mx-auto px-4 py-6">
    <!-- Header -->
    <header class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-display font-bold text-dark-gray">
          {{ isEditing ? 'Edit Session Template' : 'Create New Session Template' }}
        </h1>
        <p class="text-medium-gray">
          {{ isEditing ? 'Modify your session template' : 'Build a reusable workout session template' }}
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <button
          class="btn btn-secondary"
          @click="$router.push('/programs')"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary flex items-center"
          :disabled="!canSave || saving"
          @click="saveProgram"
        >
          <div
            v-if="saving"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
          />
          {{ saving ? 'Saving...' : (isEditing ? 'Update Template' : 'Save Template') }}
        </button>
      </div>
    </header>

    <!-- Template Information Section -->
    <section class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-h2 font-semibold mb-4">
        Template Information
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Program Name -->
        <div class="md:col-span-2">
          <label
            for="program-name"
            class="form-label"
          >
            Template Name *
          </label>
          <input
            id="program-name"
            v-model="program.name"
            type="text"
            class="input-field w-full"
            :class="{ 'border-red-300': errors.name }"
            placeholder="e.g., Upper Body Strength Session"
            required
          >
          <p
            v-if="errors.name"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors.name }}
          </p>
        </div>

        <!-- Difficulty -->
        <div>
          <label
            for="difficulty"
            class="form-label"
          >
            Difficulty Level
          </label>
          <select
            id="difficulty"
            v-model="program.difficulty"
            class="input-field w-full"
          >
            <option value="">
              Select difficulty
            </option>
            <option value="Beginner">
              Beginner
            </option>
            <option value="Intermediate">
              Intermediate
            </option>
            <option value="Advanced">
              Advanced
            </option>
            <option value="Expert">
              Expert
            </option>
          </select>
        </div>

        <!-- Duration -->
        <div>
          <label
            for="duration"
            class="form-label"
          >
            Duration (weeks)
          </label>
          <input
            id="duration"
            v-model.number="program.duration_weeks"
            type="number"
            min="1"
            max="52"
            class="input-field w-full"
            placeholder="8"
          >
        </div>

        <!-- Goals -->
        <div class="md:col-span-2">
          <label class="form-label">
            Primary Goals
          </label>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label
              v-for="goal in availableGoals"
              :key="goal"
              class="flex items-center space-x-2 text-sm"
            >
              <input
                v-model="selectedGoals"
                type="checkbox"
                :value="goal"
                class="rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
              >
              <span>{{ goal }}</span>
            </label>
          </div>
        </div>

        <!-- Description -->
        <div class="md:col-span-2">
          <label
            for="description"
            class="form-label"
          >
            Template Description
          </label>
          <textarea
            id="description"
            v-model="program.description"
            rows="3"
            class="input-field w-full resize-none"
            placeholder="Describe the session objectives, target muscle groups, and key exercises..."
          />
        </div>
      </div>
    </section>

    <!-- Exercises Section -->
    <section class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-h2 font-semibold">
          Exercises
        </h2>
        <button
          class="btn btn-primary flex items-center"
          @click="showExerciseSelector = true"
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

      <!-- Exercises List -->
      <div
        v-if="program.exercises.length === 0"
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
          No exercises yet
        </h3>
        <p class="text-medium-gray mb-4">
          Start building your session template by adding exercises
        </p>
        <button
          class="btn btn-primary"
          @click="showExerciseSelector = true"
        >
          Add First Exercise
        </button>
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <SessionExercise
          v-for="(exercise, index) in program.exercises"
          :key="exercise.id || `exercise-${index}`"
          :exercise="exercise"
          :exercise-index="index"
          @update="updateExercise"
          @remove="removeExercise"
          @move-up="moveExerciseUp"
          @move-down="moveExerciseDown"
        />
      </div>
    </section>

    <!-- Exercise Selector Modal -->
    <ExerciseSelectorModal
      v-if="showExerciseSelector"
      :is-open="showExerciseSelector"
      @close="showExerciseSelector = false"
      @select="addExercise"
    />

    <!-- Template Summary Section -->
    <section class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-h2 font-semibold mb-4">
        Template Summary
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-dark-gray mb-2">
            Total Exercises
          </h4>
          <p class="text-2xl font-bold text-primary-blue">
            {{ totalExercises }}
          </p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-dark-gray mb-2">
            Estimated Duration
          </h4>
          <p class="text-2xl font-bold text-primary-blue">
            {{ estimatedDuration }} min
          </p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-dark-gray mb-2">
            Difficulty
          </h4>
          <p class="text-2xl font-bold text-primary-blue">
            {{ program.difficulty || 'Not Set' }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useProgramsStore } from "@/stores/programs";
import SessionExercise from "@/components/program/SessionExercise.vue";
import ExerciseSelectorModal from "@/components/program/ExerciseSelectorModal.vue";

const router = useRouter();
const route = useRoute();
const programsStore = useProgramsStore();

// State
const saving = ref(false);
const errors = ref({});
const showExerciseSelector = ref(false);

// Program data (now representing a single session template)
const program = ref({
  name: "",
  description: "",
  difficulty: "",
  duration_weeks: null,
  goals: "",
  exercises: []
});

const selectedGoals = ref([]);

const availableGoals = [
  "Strength Building",
  "Weight Loss",
  "Muscle Gain",
  "Endurance",
  "Flexibility",
  "Athletic Performance",
  "General Fitness",
  "Rehabilitation"
];

// Computed
const isEditing = computed(() => !!route.params.id);

const canSave = computed(() => {
  return program.value.name.trim() && program.value.exercises.length > 0;
});

const totalExercises = computed(() => {
  return program.value.exercises.length;
});

const estimatedDuration = computed(() => {
  const exerciseTime = program.value.exercises.reduce((total, exercise) => {
    const setsTime = (exercise.sets || 1) * (exercise.duration_per_set || 60);
    const restTime = (exercise.sets || 1) * (exercise.rest_between_sets || 60);
    return total + setsTime + restTime;
  }, 0);
  
  return Math.ceil(exerciseTime / 60);
});

// Methods
const validateProgram = () => {
  errors.value = {};

  if (!program.value.name.trim()) {
    errors.value.name = "Template name is required";
  }

  if (program.value.exercises.length === 0) {
    errors.value.exercises = "At least one exercise is required";
  }

  return Object.keys(errors.value).length === 0;
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
  
  program.value.exercises.push(sessionExercise);
};

const updateExercise = (exerciseIndex, updatedExercise) => {
  program.value.exercises[exerciseIndex] = { ...updatedExercise };
};

const removeExercise = (exerciseIndex) => {
  program.value.exercises.splice(exerciseIndex, 1);
};

const moveExerciseUp = (exerciseIndex) => {
  if (exerciseIndex > 0) {
    const exercises = [...program.value.exercises];
    [exercises[exerciseIndex - 1], exercises[exerciseIndex]] = 
    [exercises[exerciseIndex], exercises[exerciseIndex - 1]];
    program.value.exercises = exercises;
  }
};

const moveExerciseDown = (exerciseIndex) => {
  if (exerciseIndex < program.value.exercises.length - 1) {
    const exercises = [...program.value.exercises];
    [exercises[exerciseIndex], exercises[exerciseIndex + 1]] = 
    [exercises[exerciseIndex + 1], exercises[exerciseIndex]];
    program.value.exercises = exercises;
  }
};

const saveProgram = async () => {
  if (!validateProgram()) {
    return;
  }

  saving.value = true;

  try {
    const programData = {
      ...program.value,
      goals: selectedGoals.value.join(", ") || null,
    };

    // Remove empty string values
    Object.keys(programData).forEach(key => {
      if (programData[key] === "") {
        programData[key] = null;
      }
    });

    let savedProgram;
    if (isEditing.value) {
      savedProgram = await programsStore.updateProgram(route.params.id, programData);
    } else {
      savedProgram = await programsStore.createProgram(programData);
    }

    // Navigate to the program detail view
    router.push(`/programs/${savedProgram.id}`);
  } catch (error) {
    console.error("Error saving program:", error);
    // Handle validation errors from the backend
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        error.response.data.detail.forEach(err => {
          if (err.loc && err.loc[1]) {
            errors.value[err.loc[1]] = err.msg;
          }
        });
      } else {
        errors.value.general = error.response.data.detail;
      }
    }
  } finally {
    saving.value = false;
  }
};

const loadProgram = async () => {
  if (isEditing.value) {
    const programId = route.params.id;
    await programsStore.fetchProgramDetail(programId);
    
    if (programsStore.programDetail) {
      const loadedSession = programsStore.programDetail;
      
      // Parse the JSON data from description
      let parsedData = {};
      try {
        parsedData = loadedSession.description ? JSON.parse(loadedSession.description) : {};
      } catch (e) {
        parsedData = { description: loadedSession.description || "" };
      }
      
      program.value = {
        name: loadedSession.name || "",
        description: parsedData.description || "",
        difficulty: parsedData.difficulty || "",
        duration_weeks: parsedData.duration_weeks || null,
        goals: parsedData.goals || "",
        exercises: parsedData.exercises || []
      };

      // Parse goals
      if (parsedData.goals) {
        selectedGoals.value = parsedData.goals.split(",").map(g => g.trim());
      }
    }
  }
};

// Initialize
onMounted(() => {
  loadProgram();
});
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent;
}

.form-label {
  @apply block text-sm font-medium text-dark-gray mb-2;
}
</style>