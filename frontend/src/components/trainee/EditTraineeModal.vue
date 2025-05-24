<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-dark-gray">
          Edit Trainee Profile
        </h2>
        <button
          class="text-medium-gray hover:text-dark-gray transition-colors"
          @click="closeModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
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

      <!-- Form -->
      <form
        class="overflow-y-auto max-h-[calc(90vh-140px)]"
        @submit.prevent="handleSubmit"
      >
        <div class="p-6 space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div class="md:col-span-2">
              <label
                for="name"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Full Name *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="input-field"
                placeholder="Enter full name"
              >
            </div>

            <!-- Email -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="input-field"
                placeholder="Enter email address"
              >
            </div>

            <!-- Phone -->
            <div>
              <label
                for="phone"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Phone
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                class="input-field"
                placeholder="Enter phone number"
              >
            </div>

            <!-- Date of Birth -->
            <div>
              <label
                for="date_of_birth"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                v-model="form.date_of_birth"
                type="date"
                class="input-field"
              >
            </div>

            <!-- Gender -->
            <div>
              <label
                for="gender"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Gender
              </label>
              <select
                id="gender"
                v-model="form.gender"
                class="input-field"
              >
                <option value="">
                  Select gender
                </option>
                <option value="Male">
                  Male
                </option>
                <option value="Female">
                  Female
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <!-- Height -->
            <div>
              <label
                for="height"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Height (cm)
              </label>
              <input
                id="height"
                v-model.number="form.height"
                type="number"
                class="input-field"
                placeholder="Enter height in cm"
              >
            </div>

            <!-- Weight -->
            <div>
              <label
                for="current_weight"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Weight (kg)
              </label>
              <input
                id="current_weight"
                v-model.number="form.current_weight"
                type="number"
                step="0.1"
                class="input-field"
                placeholder="Enter weight in kg"
              >
            </div>

            <!-- Goals - TODO: Implement goals UI later -->
            <!-- <div class="md:col-span-2">
              <label
                for="goals"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Goals
              </label>
              <textarea
                id="goals"
                v-model="goalsText"
                rows="3"
                class="input-field"
                placeholder="Enter fitness goals (one per line)..."
              />
              <p class="text-xs text-gray-500 mt-1">Enter each goal on a separate line</p>
            </div> -->

            <!-- Injuries - TODO: Implement injuries UI later -->
            <!-- <div class="md:col-span-2">
              <label
                for="injuries"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Injuries
              </label>
              <textarea
                id="injuries"
                v-model="injuriesText"
                rows="2"
                class="input-field"
                placeholder="Enter any injuries (one per line)..."
              />
              <p class="text-xs text-gray-500 mt-1">Enter each injury on a separate line</p>
            </div> -->

            <!-- Medical Notes -->
            <div class="md:col-span-2">
              <label
                for="medical_notes"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Medical Notes
              </label>
              <textarea
                id="medical_notes"
                v-model="form.medical_notes"
                rows="3"
                class="input-field"
                placeholder="Enter any medical conditions or notes..."
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModal"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span
              v-if="loading"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            />
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useTraineesStore } from '@/stores/trainees'

export default {
  name: 'EditTraineeModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    trainee: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'updated'],
  setup(props, { emit }) {
    const traineesStore = useTraineesStore()
    const loading = ref(false)
    
    const form = ref({
      name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      height: '',
      current_weight: '',
      goals: [],
      injuries: [],
      medical_notes: ''
    })

    const goalsText = ref('')
    const injuriesText = ref('')

    // Watch for trainee changes to populate form
    watch(() => props.trainee, (newTrainee) => {
      if (newTrainee) {
        form.value = {
          name: newTrainee.name || '',
          email: newTrainee.email || '',
          phone: newTrainee.phone || '',
          date_of_birth: newTrainee.date_of_birth || '',
          gender: newTrainee.gender || '',
          height: newTrainee.height || '',
          current_weight: newTrainee.current_weight || '',
          goals: newTrainee.goals || [],
          injuries: newTrainee.injuries || [],
          medical_notes: newTrainee.medical_notes || ''
        }
        
        // Convert arrays to text for display
        // goalsText.value = Array.isArray(newTrainee.goals) ? newTrainee.goals.join('\n') : '' // TODO: Implement goals later
        // injuriesText.value = Array.isArray(newTrainee.injuries) ? newTrainee.injuries.join('\n') : '' // TODO: Implement injuries later
      }
    }, { immediate: true })

    const closeModal = () => {
      emit('close')
    }

    const handleSubmit = async () => {
      if (!props.trainee) return
      
      loading.value = true
      try {
        // Convert text to arrays and clean numeric fields
        const formData = {
          ...form.value,
          // goals: goalsText.value.split('\n').filter(goal => goal.trim() !== ''), // TODO: Implement goals later
          // injuries: injuriesText.value.split('\n').filter(injury => injury.trim() !== ''), // TODO: Implement injuries later
          // Convert empty strings to null for optional numeric fields
          height: form.value.height === '' || form.value.height === null ? null : Number(form.value.height),
          current_weight: form.value.current_weight === '' || form.value.current_weight === null ? null : Number(form.value.current_weight)
        }
        
        await traineesStore.updateTrainee(props.trainee.id, formData)
        emit('updated')
        emit('close')
      } catch (error) {
        console.error('Error updating trainee:', error)
        // Handle error (show toast, etc.)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      goalsText,
      injuriesText,
      closeModal,
      handleSubmit
    }
  }
}
</script>