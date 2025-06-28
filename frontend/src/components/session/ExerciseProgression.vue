<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <h3 class="font-semibold text-gray-900 mb-2">Session Progress</h3>
    <div class="space-y-2">
      <div v-for="(exercise, index) in exercises" :key="exercise.id" class="flex items-center">
        <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
             :class="getExerciseStatusClass(exercise)">
          {{ index + 1 }}
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900">{{ exercise.exercise_name }}</p>
        </div>
        <div class="text-sm font-medium" :class="getExerciseStatusClass(exercise)">
          {{ exercise.status }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseProgression',
  props: {
    exercises: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getExerciseStatusClass(exercise) {
      switch (exercise.status) {
        case 'completed':
          return 'bg-green-500 text-white';
        case 'in_progress':
          return 'bg-yellow-500 text-white';
        case 'skipped':
          return 'bg-red-500 text-white';
        default:
          return 'bg-gray-300 text-gray-700';
      }
    },
  },
};
</script>