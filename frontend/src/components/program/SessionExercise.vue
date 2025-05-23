<template>
  <div class="session-exercise bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
    <!-- Exercise Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-3">
        <!-- Exercise Image/Icon -->
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            v-if="exercise.exercise_data?.image_url"
            :src="exercise.exercise_data.image_url"
            :alt="exercise.exercise_name"
            class="w-full h-full object-cover"
            @error="onImageError"
          >
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-medium-gray"
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
          <h4 class="font-medium text-dark-gray">
            {{ exercise.exercise_name }}
          </h4>
          <div class="flex items-center space-x-2 text-sm text-medium-gray">
            <span v-if="exercise.exercise_data?.muscle_groups">
              {{ exercise.exercise_data.muscle_groups }}
            </span>
            <span
              v-if="exercise.exercise_data?.difficulty"
              class="px-2 py-1 bg-gray-100 rounded text-xs"
            >
              {{ exercise.exercise_data.difficulty }}
            </span>
          </div>
        </div>
      </div>

      <!-- Exercise Controls -->
      <div class="flex items-center space-x-2">
        <button
          v-if="exerciseIndex > 0"
          class="btn-icon text-medium-gray hover:text-primary-blue"
          title="Move Up"
          @click="$emit('move-up', exerciseIndex)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
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
          @click="$emit('move-down', exerciseIndex)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
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
          title="Remove Exercise"
          @click="$emit('remove', exerciseIndex)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Exercise Configuration -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <!-- Sets -->
      <div>
        <label class="config-label">Sets</label>
        <input
          v-model.number="localExercise.sets"
          type="number"
          min="1"
          max="20"
          class="config-input"
          @input="emitUpdate"
        >
      </div>

      <!-- Reps -->
      <div>
        <label class="config-label">Reps</label>
        <input
          v-model.number="localExercise.reps"
          type="number"
          min="1"
          max="100"
          class="config-input"
          @input="emitUpdate"
        >
      </div>

      <!-- Weight -->
      <div>
        <label class="config-label">Weight (kg)</label>
        <input
          v-model.number="localExercise.weight"
          type="number"
          min="0"
          step="0.5"
          class="config-input"
          placeholder="Optional"
          @input="emitUpdate"
        >
      </div>

      <!-- Duration per Set -->
      <div>
        <label class="config-label">Duration (sec)</label>
        <input
          v-model.number="localExercise.duration_per_set"
          type="number"
          min="5"
          max="600"
          class="config-input"
          @input="emitUpdate"
        >
      </div>

      <!-- Rest Between Sets -->
      <div>
        <label class="config-label">Rest (sec)</label>
        <input
          v-model.number="localExercise.rest_between_sets"
          type="number"
          min="0"
          max="600"
          class="config-input"
          @input="emitUpdate"
        >
      </div>

      <!-- RPE/Intensity -->
      <div>
        <label class="config-label">RPE (1-10)</label>
        <select
          v-model.number="localExercise.rpe"
          class="config-input"
          @change="emitUpdate"
        >
          <option value="">
            Auto
          </option>
          <option
            v-for="n in 10"
            :key="n"
            :value="n"
          >
            {{ n }}
          </option>
        </select>
      </div>
    </div>

    <!-- Exercise Notes -->
    <div class="mt-3">
      <label class="config-label">Exercise Notes</label>
      <textarea
        v-model="localExercise.notes"
        rows="2"
        class="config-input w-full resize-none"
        placeholder="Add specific instructions, form cues, or modifications..."
        @input="emitUpdate"
      />
    </div>

    <!-- Exercise Summary -->
    <div class="mt-3 p-3 bg-gray-50 rounded-lg">
      <div class="flex items-center justify-between text-sm">
        <span class="text-medium-gray">
          {{ localExercise.sets }} sets × {{ localExercise.reps }} reps
          <span v-if="localExercise.weight"> @ {{ localExercise.weight }}kg</span>
        </span>
        <span class="text-medium-gray">
          ~{{ estimatedTime }} min total
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  exercise: {
    type: Object,
    required: true,
  },
  exerciseIndex: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update", "remove", "move-up", "move-down"]);

// State
const localExercise = ref({ ...props.exercise });

// Computed
const estimatedTime = computed(() => {
  const setsTime = (localExercise.value.sets || 1) * (localExercise.value.duration_per_set || 60);
  const restTime = Math.max(0, (localExercise.value.sets || 1) - 1) * (localExercise.value.rest_between_sets || 60);
  return Math.ceil((setsTime + restTime) / 60);
});

// Methods
const emitUpdate = () => {
  emit("update", props.exerciseIndex, localExercise.value);
};

const onImageError = (event) => {
  event.target.style.display = 'none';
};

// Watch for prop changes
watch(() => props.exercise, (newExercise) => {
  localExercise.value = { ...newExercise };
}, { deep: true });
</script>

<style scoped>
.config-label {
  @apply block text-xs font-medium text-gray-700 mb-1;
}

.config-input {
  @apply w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-blue focus:border-transparent;
}

.btn-icon {
  @apply p-1 rounded transition-colors;
}
</style>