<template>
  <div
    v-if="visible"
    class="fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out"
    :class="[
      visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      toastClasses
    ]"
  >
    <div class="flex items-start p-4 rounded-lg shadow-lg border">
      <!-- Icon -->
      <div class="flex-shrink-0 mr-3">
        <!-- Success Icon -->
        <svg
          v-if="type === 'success'"
          class="h-6 w-6 text-green-600"
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
        
        <!-- Error Icon -->
        <svg
          v-else-if="type === 'error'"
          class="h-6 w-6 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        
        <!-- Warning Icon -->
        <svg
          v-else-if="type === 'warning'"
          class="h-6 w-6 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        
        <!-- Info Icon -->
        <svg
          v-else
          class="h-6 w-6 text-blue-600"
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
      </div>
      
      <!-- Content -->
      <div class="flex-1">
        <h3 v-if="title" class="text-sm font-medium mb-1" :class="titleClasses">
          {{ title }}
        </h3>
        <p class="text-sm" :class="messageClasses">
          {{ message }}
        </p>
      </div>
      
      <!-- Close Button -->
      <button
        @click="close"
        class="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <svg
          class="h-4 w-4 text-gray-400"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  persistent: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const visible = ref(false);

const toastClasses = computed(() => {
  const classes = ['bg-white border-l-4'];
  
  switch (props.type) {
    case 'success':
      classes.push('border-green-500');
      break;
    case 'error':
      classes.push('border-red-500');
      break;
    case 'warning':
      classes.push('border-yellow-500');
      break;
    default:
      classes.push('border-blue-500');
  }
  
  return classes;
});

const titleClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800';
    case 'error':
      return 'text-red-800';
    case 'warning':
      return 'text-yellow-800';
    default:
      return 'text-blue-800';
  }
});

const messageClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-700';
    case 'error':
      return 'text-red-700';
    case 'warning':
      return 'text-yellow-700';
    default:
      return 'text-blue-700';
  }
});

const close = () => {
  visible.value = false;
  setTimeout(() => {
    emit('close');
  }, 300);
};

onMounted(() => {
  visible.value = true;
  
  if (!props.persistent && props.duration > 0) {
    setTimeout(() => {
      close();
    }, props.duration);
  }
});
</script>