<template>
  <div class="space-y-4">
    <!-- Card skeleton -->
    <div v-for="n in count" :key="n" class="card">
      <div class="flex items-center space-x-4">
        <!-- Avatar skeleton -->
        <div class="loading-skeleton-avatar h-12 w-12"></div>
        <div class="flex-1 space-y-2">
          <!-- Title skeleton -->
          <div class="loading-skeleton-text w-1/2"></div>
          <!-- Subtitle skeleton -->
          <div class="loading-skeleton-text w-3/4 h-3"></div>
        </div>
      </div>
      <!-- Content skeleton -->
      <div class="mt-4 space-y-2">
        <div class="loading-skeleton-text w-full"></div>
        <div class="loading-skeleton-text w-5/6"></div>
        <div class="loading-skeleton-text w-4/6"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 3
  }
});
</script>