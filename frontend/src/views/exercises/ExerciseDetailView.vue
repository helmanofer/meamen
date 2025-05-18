<template>
  <div class="exercise-detail-view flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl mt-10">
      <h1 class="text-3xl font-bold mb-4 text-center text-gray-800">Exercise Detail</h1>
      <p class="text-gray-600 text-center mb-8">
        This is a placeholder for the Exercise Detail View.<br>
        UI and data will be implemented according to the design.
      </p>
      <div class="flex justify-center">
        <router-link
          to="/exercises"
          class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to Exercises
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ExerciseDetailView",
};
</script>

<style scoped>
.exercise-detail-view {
  /* Additional styling can be added here if needed */
}
</style>
