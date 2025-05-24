<template>
  <div
    v-if="loading"
    class="flex justify-center py-8"
  >
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue" />
  </div>
  
  <div v-else-if="trainee">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img
            :src="trainee.profile_image || 'https://via.placeholder.com/80'"
            :alt="trainee.name"
            class="w-20 h-20 rounded-full object-cover"
          >
          <div class="ml-6">
            <h1 class="text-display font-bold text-dark-gray">
              {{ trainee.name }}
            </h1>
            <p class="text-medium-gray">
              {{ trainee.email }}
            </p>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                trainee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ trainee.status || 'Active' }}
            </span>
          </div>
        </div>
        <div class="flex space-x-4">
          <button
            class="btn btn-secondary flex items-center"
            @click="sendMessage"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            </svg>
            Message
          </button>
          <button
            class="btn btn-primary flex items-center"
            @click="editProfile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="grid grid-cols-4 gap-6 mt-8">
        <div class="bg-light-blue rounded-lg p-4">
          <h4 class="text-sm text-medium-gray">
            Total Sessions
          </h4>
          <p class="text-h1 font-bold text-primary-blue">
            24
          </p>
          <p class="text-sm text-dark-blue">
            80% completion
          </p>
        </div>
        <div class="bg-light-blue rounded-lg p-4">
          <h4 class="text-sm text-medium-gray">
            Current Weight
          </h4>
          <p class="text-h1 font-bold text-primary-blue">
            75kg
          </p>
          <p class="text-sm text-success">
            -5kg since start
          </p>
        </div>
        <div class="bg-light-blue rounded-lg p-4">
          <h4 class="text-sm text-medium-gray">
            Body Fat
          </h4>
          <p class="text-h1 font-bold text-primary-blue">
            18%
          </p>
          <p class="text-sm text-success">
            -3% since start
          </p>
        </div>
        <div class="bg-light-blue rounded-lg p-4">
          <h4 class="text-sm text-medium-gray">
            Next Session
          </h4>
          <p class="text-h1 font-bold text-primary-blue">
            Today
          </p>
          <p class="text-sm text-dark-blue">
            3:00 PM
          </p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="border-b">
        <nav class="flex">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="[
              'px-6 py-4 text-sm font-medium whitespace-nowrap',
              activeTab === tab.id
                ? 'border-b-2 border-primary-blue text-primary-blue'
                : 'text-medium-gray hover:text-dark-gray hover:border-medium-gray'
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <div
          v-if="activeTab === 'profile'"
          class="space-y-6"
        >
          <div class="grid grid-cols-2 gap-6">
            <div>
              <h3 class="text-h3 font-semibold mb-4">
                Personal Information
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-medium-gray">Date of Birth</label>
                  <p class="text-dark-gray">
                    {{ trainee.date_of_birth || 'Not provided' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-medium-gray">Phone</label>
                  <p class="text-dark-gray">
                    {{ trainee.phone_number || 'Not provided' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-medium-gray">Email</label>
                  <p class="text-dark-gray">
                    {{ trainee.email }}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-medium-gray">Goals</label>
                  <p class="text-dark-gray">
                    {{ trainee.goals || 'No goals set' }}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-h3 font-semibold mb-4">
                Health Information
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-medium-gray">Height</label>
                  <p class="text-dark-gray">
                    {{ trainee.height ? trainee.height + ' cm' : 'Not provided' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-medium-gray">Weight</label>
                  <p class="text-dark-gray">
                    {{ trainee.weight ? trainee.weight + ' kg' : 'Not provided' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-medium-gray">Medical Conditions</label>
                  <p class="text-dark-gray">
                    {{ trainee.medical_conditions || 'None' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-medium-gray">Emergency Contact</label>
                  <p class="text-dark-gray">
                    {{ trainee.emergency_contact || 'Not provided' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="activeTab === 'measurements'"
          class="space-y-6"
        >
          <!-- Measurement charts and history would go here -->
          <p class="text-medium-gray">
            Measurement tracking coming soon...
          </p>
        </div>

        <div
          v-if="activeTab === 'workouts'"
          class="space-y-6"
        >
          <!-- Workout history and schedule would go here -->
          <p class="text-medium-gray">
            Workout tracking coming soon...
          </p>
        </div>

        <div
          v-if="activeTab === 'progress'"
          class="space-y-6"
        >
          <!-- Progress charts and achievements would go here -->
          <p class="text-medium-gray">
            Progress tracking coming soon...
          </p>
        </div>

        <div
          v-if="activeTab === 'notes'"
          class="space-y-6"
        >
          <!-- Notes and observations would go here -->
          <p class="text-medium-gray">
            Notes tracking coming soon...
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <div
    v-else
    class="text-center py-8"
  >
    <p class="text-medium-gray">
      Trainee not found
    </p>
    <button
      class="btn btn-primary mt-4"
      @click="$router.push('/trainees')"
    >
      Back to Trainees
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTraineesStore } from '@/stores/trainees';

const route = useRoute();
const router = useRouter();
const traineesStore = useTraineesStore();

const activeTab = ref('profile');
const tabs = [
  { id: 'profile', name: 'Profile' },
  { id: 'measurements', name: 'Measurements' },
  { id: 'workouts', name: 'Workouts' },
  { id: 'progress', name: 'Progress' },
  { id: 'notes', name: 'Notes' }
];

const trainee = computed(() => traineesStore.traineeDetail);
const loading = computed(() => traineesStore.loading);

onMounted(() => {
  const traineeId = route.params.id;
  console.log('TraineeDetailView mounted with ID:', traineeId);
  console.log('Route params:', route.params);
  console.log('Route path:', route.path);
  if (traineeId) {
    console.log('Fetching trainee detail for ID:', traineeId);
    traineesStore.fetchTraineeDetail(traineeId);
  } else {
    console.error('No trainee ID found in route params');
  }
});

const editProfile = () => {
  // TODO: Open edit modal or navigate to edit page
  console.log('Edit profile clicked');
};

const sendMessage = () => {
  // Navigate to messages with trainee pre-selected
  router.push({ name: 'Messages', query: { trainee: route.params.id } });
};
</script>