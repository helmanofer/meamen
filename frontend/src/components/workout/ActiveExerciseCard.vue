<template>
  <div class="active-exercise-card">
    <!-- Exercise Header -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-4">
          <!-- Exercise Image -->
          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
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
              class="h-8 w-8 text-medium-gray"
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
          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-semibold text-dark-gray">
              {{ exercise.exercise_name }}
            </h3>
            <div class="flex items-center space-x-4 mt-1">
              <span
                v-if="exercise.exercise_data?.muscle_groups"
                class="text-sm text-medium-gray"
              >
                {{ exercise.exercise_data.muscle_groups }}
              </span>
              <span
                v-if="exercise.exercise_data?.difficulty"
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
              >
                {{ exercise.exercise_data.difficulty }}
              </span>
            </div>
            <p
              v-if="exercise.notes"
              class="text-sm text-medium-gray mt-2"
            >
              {{ exercise.notes }}
            </p>
          </div>
        </div>

        <!-- Exercise Instructions Button -->
        <button
          class="btn-icon text-medium-gray hover:text-primary-blue flex-shrink-0"
          title="Exercise Instructions"
          @click="showInstructions = !showInstructions"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      <!-- Instructions (Expandable) -->
      <div
        v-if="showInstructions && exercise.exercise_data?.instructions"
        class="mt-4 p-4 bg-blue-50 rounded-lg"
      >
        <h4 class="font-medium text-dark-gray mb-2">
          Instructions
        </h4>
        <p class="text-sm text-dark-gray leading-relaxed whitespace-pre-line">
          {{ exercise.exercise_data.instructions }}
        </p>
      </div>
    </div>

    <!-- Sets Overview -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-medium text-dark-gray">
          Sets
        </h4>
        <span class="text-sm text-medium-gray">
          {{ completedSets }}/{{ totalSets }} completed
        </span>
      </div>
      
      <!-- Sets Navigation -->
      <div class="flex space-x-2 overflow-x-auto pb-2">
        <button
          v-for="(set, index) in exercise.recordedSets"
          :key="index"
          class="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[60px]"
          :class="{
            'bg-primary-blue text-white': index === currentSetIndex,
            'bg-green-100 text-green-800': set.completed && index !== currentSetIndex,
            'bg-gray-100 text-gray-700': !set.completed && index !== currentSetIndex
          }"
          @click="$emit('go-to-set', index)"
        >
          {{ index + 1 }}
        </button>
      </div>
    </div>

    <!-- Current Set Details -->
    <div
      v-if="currentSet"
      class="p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-semibold text-dark-gray">
          Set {{ currentSet.setNumber }}
        </h4>
        <span
          v-if="currentSet.completed"
          class="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium"
        >
          Completed
        </span>
      </div>

      <!-- Set Targets -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-50 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Reps</label>
          <div class="text-2xl font-bold text-primary-blue">
            {{ currentSet.targetReps }}
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Weight (kg)</label>
          <div class="text-2xl font-bold text-primary-blue">
            {{ currentSet.targetWeight || '-' }}
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Rest Time (sec)</label>
          <div class="text-2xl font-bold text-primary-blue">
            {{ currentSet.restTime }}
          </div>
        </div>
      </div>

      <!-- Set Recording Form -->
      <div
        v-if="!currentSet.completed"
        class="space-y-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Actual Reps -->
          <div>
            <label
              for="actual-reps"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Actual Reps *
            </label>
            <input
              id="actual-reps"
              v-model.number="setData.actualReps"
              type="number"
              min="0"
              max="100"
              class="input-field w-full text-center text-lg font-semibold"
              placeholder="0"
              required
            >
          </div>

          <!-- Actual Weight -->
          <div>
            <label
              for="actual-weight"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Actual Weight (kg)
            </label>
            <input
              id="actual-weight"
              v-model.number="setData.actualWeight"
              type="number"
              min="0"
              step="0.5"
              class="input-field w-full text-center text-lg font-semibold"
              placeholder="0"
            >
          </div>
        </div>

        <!-- Set Notes -->
        <div>
          <label
            for="set-notes"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes (optional)
          </label>
          <textarea
            id="set-notes"
            v-model="setData.notes"
            rows="2"
            class="input-field w-full resize-none"
            placeholder="How did this set feel? Any observations..."
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-4">
          <button
            class="btn btn-secondary"
            @click="skipSet"
          >
            Skip Set
          </button>
          
          <div class="flex items-center space-x-3">
            <button
              :disabled="!canCompleteSet"
              class="btn btn-primary flex items-center"
              @click="completeSet"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Complete Set
            </button>
          </div>
        </div>
      </div>

      <!-- Completed Set Display -->
      <div
        v-else
        class="space-y-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-green-50 rounded-lg p-4">
            <label class="block text-sm font-medium text-green-700 mb-1">Actual Reps</label>
            <div class="text-2xl font-bold text-green-800">
              {{ currentSet.actualReps || '-' }}
            </div>
          </div>
          
          <div class="bg-green-50 rounded-lg p-4">
            <label class="block text-sm font-medium text-green-700 mb-1">Actual Weight (kg)</label>
            <div class="text-2xl font-bold text-green-800">
              {{ currentSet.actualWeight || '-' }}
            </div>
          </div>
        </div>

        <div
          v-if="currentSet.notes"
          class="bg-gray-50 rounded-lg p-4"
        >
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <p class="text-dark-gray">
            {{ currentSet.notes }}
          </p>
        </div>

        <!-- Start Rest Timer Button -->
        <div class="flex justify-center pt-4">
          <button
            class="btn btn-primary flex items-center"
            @click="startRest"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start {{ currentSet.restTime }}s Rest
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  exercise: {
    type: Object,
    required: true,
  },
  exerciseIndex: {
    type: Number,
    required: true,
  },
  currentSetIndex: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["complete-set", "skip-set", "start-rest", "go-to-set"]);

// State
const showInstructions = ref(false);
const setData = ref({
  actualReps: null,
  actualWeight: null,
  notes: ""
});

// Computed
const currentSet = computed(() => {
  return props.exercise.recordedSets?.[props.currentSetIndex] || null;
});

const totalSets = computed(() => {
  return props.exercise.recordedSets?.length || 0;
});

const completedSets = computed(() => {
  return props.exercise.recordedSets?.filter(set => set.completed).length || 0;
});

const canCompleteSet = computed(() => {
  return setData.value.actualReps !== null && setData.value.actualReps >= 0;
});

// Methods
const completeSet = () => {
  if (!canCompleteSet.value) return;

  emit("complete-set", {
    ...setData.value,
    duration: null, // TODO: Track set duration
    startTime: new Date().toISOString()
  });

  // Reset form
  setData.value = {
    actualReps: null,
    actualWeight: null,
    notes: ""
  };
};

const skipSet = () => {
  emit("skip-set");
};

const startRest = () => {
  if (currentSet.value?.restTime) {
    emit("start-rest", currentSet.value.restTime);
  }
};

const onImageError = (event) => {
  event.target.style.display = 'none';
};
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent;
}

.btn-icon {
  @apply p-2 rounded-md transition-colors;
}
</style>