<template>
  <div class="add-trainee-view container mx-auto px-4 py-6 max-w-4xl">
    <!-- Header -->
    <header class="flex items-center mb-6">
      <button
        class="btn btn-secondary flex items-center mr-4"
        @click="goBack"
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
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Trainees
      </button>
      <div>
        <h1 class="text-display font-bold text-dark-gray">
          Add New Trainee
        </h1>
        <p class="text-medium-gray">
          Create a new trainee profile with their personal information
        </p>
      </div>
    </header>

    <!-- Form -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Information Section -->
          <div class="md:col-span-2">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">
              Basic Information
            </h2>
          </div>

          <!-- Full Name -->
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
              class="input-field w-full"
              placeholder="Enter full name"
              :class="{ 'border-red-500': errors.name }"
            >
            <p
              v-if="errors.name"
              class="text-red-500 text-sm mt-1"
            >
              {{ errors.name }}
            </p>
          </div>

          <!-- Email -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Email Address *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-field w-full"
              placeholder="Enter email address"
              :class="{ 'border-red-500': errors.email }"
            >
            <p
              v-if="errors.email"
              class="text-red-500 text-sm mt-1"
            >
              {{ errors.email }}
            </p>
          </div>

          <!-- Phone -->
          <div>
            <label
              for="phone"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Phone Number
            </label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="input-field w-full"
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
              class="input-field w-full"
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
              class="input-field w-full"
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

          <!-- Physical Information Section -->
          <div class="md:col-span-2 mt-6">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">
              Physical Information
            </h2>
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
              class="input-field w-full"
              placeholder="Enter height in cm"
              min="100"
              max="250"
            >
          </div>

          <!-- Current Weight -->
          <div>
            <label
              for="current_weight"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Current Weight (kg)
            </label>
            <input
              id="current_weight"
              v-model.number="form.current_weight"
              type="number"
              step="0.1"
              class="input-field w-full"
              placeholder="Enter weight in kg"
              min="30"
              max="300"
            >
          </div>

          <!-- Contact Information Section -->
          <div class="md:col-span-2 mt-6">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">
              Contact & Emergency Information
            </h2>
          </div>

          <!-- Address -->
          <div class="md:col-span-2">
            <label
              for="address"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Address
            </label>
            <textarea
              id="address"
              v-model="form.address"
              rows="3"
              class="input-field w-full"
              placeholder="Enter full address"
            />
          </div>

          <!-- Emergency Contact -->
          <div class="md:col-span-2">
            <label
              for="emergency_contact"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Emergency Contact
            </label>
            <input
              id="emergency_contact"
              v-model="form.emergency_contact"
              type="text"
              class="input-field w-full"
              placeholder="Name and phone number of emergency contact"
            >
          </div>

          <!-- Health Information Section -->
          <div class="md:col-span-2 mt-6">
            <h2 class="text-h2 font-semibold text-dark-gray mb-4 pb-2 border-b border-gray-200">
              Health Information
            </h2>
          </div>

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
              rows="4"
              class="input-field w-full"
              placeholder="Enter any medical conditions, allergies, or important health information..."
            />
            <p class="text-xs text-gray-500 mt-1">
              Include any medical conditions, injuries, or other health information relevant to training
            </p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="loading"
            @click="goBack"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || !isFormValid"
          >
            <span
              v-if="loading"
              class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
            />
            {{ loading ? 'Creating...' : 'Create Trainee' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTraineesStore } from '@/stores/trainees';

const router = useRouter();
const traineesStore = useTraineesStore();

// Form state
const loading = ref(false);
const errors = ref({});

const form = ref({
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  height: null,
  current_weight: null,
  address: '',
  emergency_contact: '',
  medical_notes: ''
});

// Computed
const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.email.trim() && isValidEmail(form.value.email);
});

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = () => {
  errors.value = {};
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required';
  }
  
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required';
  } else if (!isValidEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  
  try {
    // Clean up form data - remove empty values
    const traineeData = {
      name: form.value.name.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim() || null,
      date_of_birth: form.value.date_of_birth || null,
      gender: form.value.gender || null,
      height: form.value.height || null,
      current_weight: form.value.current_weight || null,
      address: form.value.address.trim() || null,
      emergency_contact: form.value.emergency_contact.trim() || null,
      medical_notes: form.value.medical_notes.trim() || null
    };
    
    await traineesStore.createTrainee(traineeData);
    
    // Success - navigate back to trainees list
    router.push('/trainees');
  } catch (error) {
    console.error('Create trainee error:', error);
    
    // Handle validation errors from backend
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.detail;
      if (Array.isArray(validationErrors)) {
        validationErrors.forEach(err => {
          if (err.loc && err.loc.length > 1) {
            errors.value[err.loc[1]] = err.msg;
          }
        });
      }
    } else {
      // Show general error
      alert('Failed to create trainee. Please try again.');
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/trainees');
};
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-colors;
}

.input-field:focus {
  @apply ring-2 ring-primary-blue border-transparent;
}

.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-primary-blue text-white hover:bg-dark-blue disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-dark-gray hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>