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
            Assign Program to {{ trainee?.name }}
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

        <!-- Current Assignments -->
        <div v-if="currentAssignments.length > 0" class="mb-4 p-3 bg-blue-50 rounded-md">
          <p class="text-sm text-blue-800 mb-2">
            <strong>Currently assigned programs:</strong>
          </p>
          <div class="space-y-2">
            <div 
              v-for="assignment in currentAssignments" 
              :key="assignment.id"
              class="flex justify-between items-center p-2 bg-white rounded border"
            >
              <span class="text-sm">{{ getProgramName(assignment.program_id) }}</span>
              <button
                @click="unassignProgram(assignment.program_id)"
                :disabled="loading"
                class="text-xs text-red-600 hover:text-red-800 underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Program Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select a Program:
          </label>
          
          <!-- Loading state -->
          <div v-if="programsLoading" class="text-center py-4">
            <div class="loading-spinner h-6 w-6 mx-auto"></div>
          </div>
          
          <!-- Programs list -->
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="program in availablePrograms"
              :key="program.id"
              class="p-3 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'border-primary-blue bg-blue-50': selectedProgramId === program.id,
                'border-gray-200 hover:border-gray-300': selectedProgramId !== program.id && !isProgramAssigned(program.id),
                'border-gray-300 bg-gray-50 opacity-60': isProgramAssigned(program.id)
              }"
              @click="!isProgramAssigned(program.id) && (selectedProgramId = program.id)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ program.name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ program.description }}</p>
                  <div class="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                    <span v-if="program.difficulty">{{ program.difficulty }}</span>
                    <span v-if="program.duration_minutes">{{ program.duration_minutes }} min</span>
                    <span v-if="program.category">{{ program.category }}</span>
                    <span v-if="isProgramAssigned(program.id)" class="text-blue-600 font-medium">Already Assigned</span>
                  </div>
                </div>
                <div
                  v-if="selectedProgramId === program.id"
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
          <div v-if="!programsLoading && availablePrograms.length === 0" class="text-center py-8 text-gray-500">
            <p>No programs available</p>
            <router-link to="/programs" class="text-primary-blue hover:text-dark-blue text-sm mt-2 inline-block">
              Create a program first
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
            :disabled="!selectedProgramId || loading"
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
import { ref, computed, watch, onMounted } from 'vue';
import { useProgramsStore } from '@/stores/programs';
import { useTraineesStore } from '@/stores/trainees';
import { useToast } from '@/composables/useToast';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  trainee: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'assigned']);

const programsStore = useProgramsStore();
const traineesStore = useTraineesStore();
const { success, error: showError } = useToast();

const selectedProgramId = ref(null);
const loading = ref(false);
const error = ref('');
const programsLoading = ref(false);
const currentAssignments = ref([]);

const availablePrograms = computed(() => programsStore.programs || []);

const isProgramAssigned = (programId) => {
  return currentAssignments.value.some(assignment => assignment.program_id === programId);
};

const getProgramName = (programId) => {
  const program = availablePrograms.value.find(p => p.id === programId);
  return program?.name || 'Unknown Program';
};

const closeModal = () => {
  selectedProgramId.value = null;
  error.value = '';
  emit('close');
};

const assignProgram = async () => {
  if (!selectedProgramId.value || !props.trainee) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await traineesStore.assignProgramToTrainee(props.trainee.id, selectedProgramId.value);
    success('Program assigned successfully!');
    // Refresh current assignments
    await loadCurrentAssignments();
    selectedProgramId.value = null; // Clear selection for next assignment
    emit('assigned');
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to assign program';
    showError('Failed to assign program');
  } finally {
    loading.value = false;
  }
};

const unassignProgram = async (programId) => {
  if (!props.trainee) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await traineesStore.unassignProgramFromTrainee(props.trainee.id, programId);
    success('Program unassigned successfully!');
    // Refresh current assignments
    await loadCurrentAssignments();
    emit('assigned');
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to unassign program';
    showError('Failed to unassign program');
  } finally {
    loading.value = false;
  }
};

const loadCurrentAssignments = async () => {
  if (!props.trainee) return;
  
  try {
    currentAssignments.value = await traineesStore.fetchTraineePrograms(props.trainee.id);
  } catch (err) {
    console.error('Failed to load current assignments:', err);
  }
};

// Load programs when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    selectedProgramId.value = null;
    error.value = '';
    
    // Load current assignments
    await loadCurrentAssignments();
    
    if (availablePrograms.value.length === 0) {
      programsLoading.value = true;
      try {
        await programsStore.fetchPrograms();
      } catch (err) {
        error.value = 'Failed to load programs';
      } finally {
        programsLoading.value = false;
      }
    }
  }
});
</script>