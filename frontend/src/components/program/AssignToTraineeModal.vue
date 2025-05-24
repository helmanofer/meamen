<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

      <!-- Modal panel -->
      <div
        class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">
            Assign "{{ program?.name }}" to Trainee
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Program Info -->
        <div class="mb-4 p-3 bg-blue-50 rounded-md">
          <p class="text-sm text-blue-800">
            <strong>Program:</strong> {{ program?.name }}
          </p>
          <p v-if="program?.description" class="text-sm text-blue-700 mt-1">
            {{ program.description }}
          </p>
          <div class="flex items-center mt-2 text-xs text-blue-600 space-x-4">
            <span v-if="program?.difficulty">{{ program.difficulty }}</span>
            <span v-if="program?.duration_minutes">{{ program.duration_minutes }} min</span>
            <span v-if="program?.category">{{ program.category }}</span>
          </div>
        </div>

        <!-- Trainee Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select a Trainee:
          </label>
          
          <!-- Loading state -->
          <div v-if="traineesLoading" class="text-center py-4">
            <div class="loading-spinner h-6 w-6 mx-auto"></div>
          </div>
          
          <!-- Trainees list -->
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="trainee in availableTrainees"
              :key="trainee.id"
              class="p-3 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'border-primary-blue bg-blue-50': selectedTraineeId === trainee.id,
                'border-gray-200 hover:border-gray-300': selectedTraineeId !== trainee.id
              }"
              @click="selectedTraineeId = trainee.id"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ trainee.name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ trainee.email }}</p>
                  <div class="text-xs text-gray-500 mt-1">
                    <span v-if="trainee.assigned_program_id" class="text-yellow-600">
                      ⚠️ Already has a program assigned
                    </span>
                    <span v-else class="text-green-600">
                      ✓ Available for assignment
                    </span>
                  </div>
                </div>
                <div
                  v-if="selectedTraineeId === trainee.id"
                  class="ml-3 text-primary-blue"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="!traineesLoading && availableTrainees.length === 0" class="text-center py-8 text-gray-500">
            <p>No trainees found</p>
            <router-link to="/trainees/add" class="text-primary-blue hover:text-dark-blue text-sm mt-2 inline-block">
              Add a trainee first
            </router-link>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-md">
          {{ error }}
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end space-x-3">
          <button
            @click="closeModal"
            class="btn btn-secondary"
            :disabled="loading"
          >
            Cancel
          </button>
          <button
            @click="assignProgram"
            :disabled="!selectedTraineeId || loading"
            class="btn btn-primary"
          >
            <div v-if="loading" class="loading-spinner h-4 w-4 mr-2"></div>
            Assign Program
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTraineesStore } from '@/stores/trainees';
import { useToast } from '@/composables/useToast';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  program: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'assigned']);

const traineesStore = useTraineesStore();
const { success, error: showError } = useToast();

const selectedTraineeId = ref(null);
const loading = ref(false);
const error = ref('');
const traineesLoading = ref(false);

const availableTrainees = computed(() => traineesStore.trainees || []);

const closeModal = () => {
  selectedTraineeId.value = null;
  error.value = '';
  emit('close');
};

const assignProgram = async () => {
  if (!selectedTraineeId.value || !props.program) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await traineesStore.assignProgramToTrainee(selectedTraineeId.value, props.program.id);
    success(`Program "${props.program.name}" assigned successfully!`);
    emit('assigned');
    closeModal();
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to assign program';
    showError('Failed to assign program');
  } finally {
    loading.value = false;
  }
};

// Load trainees when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    selectedTraineeId.value = null;
    error.value = '';
    
    if (availableTrainees.value.length === 0) {
      traineesLoading.value = true;
      try {
        await traineesStore.fetchTrainees();
      } catch (err) {
        error.value = 'Failed to load trainees';
      } finally {
        traineesLoading.value = false;
      }
    }
  }
});
</script>