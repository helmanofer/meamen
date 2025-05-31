<template>
  <div
    v-if="loading"
    class="flex justify-center py-8"
  >
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue" />
  </div>
  
  <div
    v-else-if="!loading && !trainee"
    class="text-center py-8"
  >
    <div class="text-medium-gray">
      <p class="text-lg">
        Trainee not found
      </p>
      <p class="text-sm mt-2">
        The trainee you're looking for doesn't exist or you don't have permission to view them.
      </p>
      <button 
        class="btn btn-primary mt-4"
        @click="$router.push('/trainees')"
      >
        Back to Trainees
      </button>
    </div>
  </div>
  
  <div v-else-if="trainee">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img
            :src="trainee.profile_image || profilePlaceholder"
            :alt="trainee.name"
            class="w-20 h-20 rounded-full object-cover"
            @error="$event.target.src = profilePlaceholder"
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
            {{ traineeSessionsStats.total }}
          </p>
          <p class="text-sm text-dark-blue">
            {{ traineeSessionsStats.percentage }}% completion
          </p>
        </div>
        <div class="bg-light-blue rounded-lg p-4">
          <h4 class="text-sm text-medium-gray">
            Current Weight
          </h4>
          <p class="text-h1 font-bold text-primary-blue">
            {{ trainee.current_weight ? trainee.current_weight + 'kg' : 'Not provided' }}
          </p>
          <p class="text-sm text-success">
            <!-- TODO: Add weight change calculation -->
          </p>
        </div>
        <div class="bg-light-blue rounded-lg p-4">
          <h4 class="text-sm text-medium-gray">
            Next Session
          </h4>
          <p class="text-h1 font-bold text-primary-blue">
            {{ nextSession ? new Date(nextSession.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Not scheduled' }}
          </p>
          <p class="text-sm text-dark-blue">
            {{ nextSession ? new Date(nextSession.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '' }}
          </p>
        </div>
        <div class="bg-light-blue rounded-lg p-4">
          <h4 class="text-sm text-medium-gray">
            Training Days
          </h4>
          <p class="text-h1 font-bold text-primary-blue">
            {{ trainingSchedule.frequency }}
          </p>
          <p class="text-sm text-dark-blue">
            {{ trainingSchedule.days }}
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
                <!-- Goals UI will be implemented later -->
                <!-- <div>
                  <label class="text-sm text-medium-gray">Goals</label>
                  <p class="text-dark-gray">
                    {{ trainee.goals || 'No goals set' }}
                  </p>
                </div> -->
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
                    {{ trainee.current_weight ? trainee.current_weight + ' kg' : 'Not provided' }}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-medium-gray">Medical Notes</label>
                  <p class="text-dark-gray">
                    {{ trainee.medical_notes || 'None' }}
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
          <!-- Weight History -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">
              Weight History
            </h3>
            <div
              v-if="trainee.measurement_history && trainee.measurement_history.length > 0"
              class="space-y-3"
            >
              <div 
                v-for="measurement in trainee.measurement_history.slice(0, 5)" 
                :key="measurement.date"
                class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <span class="text-medium-gray">{{ new Date(measurement.date).toLocaleDateString() }}</span>
                <span class="font-medium text-dark-gray">{{ measurement.weight }}kg</span>
              </div>
            </div>
            <div
              v-else
              class="text-center py-8 text-medium-gray"
            >
              <p>No weight measurements recorded yet</p>
              <button class="btn btn-primary mt-4">
                Add Measurement
              </button>
            </div>
          </div>
          
          <!-- Body Measurements -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">
              Body Measurements
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-light-blue rounded-lg">
                <p class="text-sm text-medium-gray">
                  Height
                </p>
                <p class="text-lg font-semibold text-dark-gray">
                  {{ trainee.height ? trainee.height + ' cm' : 'Not recorded' }}
                </p>
              </div>
              <div class="text-center p-4 bg-light-blue rounded-lg">
                <p class="text-sm text-medium-gray">
                  Current Weight
                </p>
                <p class="text-lg font-semibold text-dark-gray">
                  {{ trainee.current_weight ? trainee.current_weight + ' kg' : 'Not recorded' }}
                </p>
              </div>
              <div class="text-center p-4 bg-light-blue rounded-lg">
                <p class="text-sm text-medium-gray">
                  BMI
                </p>
                <p class="text-lg font-semibold text-dark-gray">
                  {{ (trainee.height && trainee.current_weight) ? ((trainee.current_weight / Math.pow(trainee.height / 100, 2)).toFixed(1)) : 'N/A' }}
                </p>
              </div>
              <div class="text-center p-4 bg-light-blue rounded-lg">
                <p class="text-sm text-medium-gray">
                  Heart Rate
                </p>
                <p class="text-lg font-semibold text-dark-gray">
                  {{ trainee.resting_heart_rate ? trainee.resting_heart_rate + ' bpm' : 'Not recorded' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="activeTab === 'workouts'"
          class="space-y-6"
        >
          <!-- Recent Sessions -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-dark-gray">
                Recent Sessions
              </h3>
              <button class="btn btn-primary">
                Schedule Session
              </button>
            </div>
            <div
              v-if="recentSessions.length > 0"
              class="space-y-3"
            >
              <div 
                v-for="session in recentSessions" 
                :key="session.id"
                class="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p class="font-medium text-dark-gray">
                    {{ session.name || 'Training Session' }}
                  </p>
                  <p class="text-sm text-medium-gray">
                    {{ new Date(session.scheduled_at).toLocaleDateString() }}
                  </p>
                </div>
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ session.status || 'scheduled' }}
                </span>
              </div>
            </div>
            <div
              v-else
              class="text-center py-8 text-medium-gray"
            >
              <p>No workout sessions recorded yet</p>
            </div>
          </div>
          
          <!-- Training Programs -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-dark-gray">
                Training Programs
              </h3>
              <button 
                class="btn btn-primary"
                @click="showAssignProgramModal = true"
              >
                {{ assignedPrograms.length > 0 ? 'Manage Programs' : 'Assign Program' }}
              </button>
            </div>
            
            <!-- Assigned Programs -->
            <div v-if="assignedPrograms.length > 0" class="space-y-4">
              <div 
                v-for="program in assignedPrograms" 
                :key="program.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h4 class="font-medium text-dark-gray">{{ program.name }}</h4>
                    <p class="text-sm text-medium-gray mt-1">{{ program.description }}</p>
                    <div class="flex items-center mt-2 text-xs text-medium-gray space-x-4">
                      <span v-if="program.difficulty">{{ program.difficulty }}</span>
                      <span v-if="program.duration_minutes">{{ program.duration_minutes }} min</span>
                      <span v-if="program.category">{{ program.category }}</span>
                    </div>
                    <div v-if="program.exercises && program.exercises.length > 0" class="mt-3">
                      <p class="text-xs text-medium-gray">{{ program.exercises.length }} exercises</p>
                    </div>
                    <div class="mt-2 text-xs text-medium-gray">
                      Assigned: {{ new Date(program.assignment.assigned_at).toLocaleDateString() }}
                    </div>
                  </div>
                  <div class="ml-3 flex flex-col items-end space-y-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ program.assignment.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Program Assigned -->
            <div v-else class="text-center py-8 text-medium-gray">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-lg">No programs assigned</p>
              <p class="text-sm mt-2">Assign training programs to get this trainee started</p>
            </div>
          </div>
        </div>

        <div
          v-if="activeTab === 'progress'"
          class="space-y-6"
        >
          <!-- Goals Progress - TODO: Implement goals UI later -->
          <!-- <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">Goals</h3>
            <div v-if="trainee.goals && trainee.goals.length > 0" class="space-y-3">
              <div 
                v-for="(goal, index) in trainee.goals" 
                :key="index"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <p class="font-medium text-dark-gray">{{ goal }}</p>
                <div class="mt-2 bg-gray-200 rounded-full h-2">
                  <div class="bg-primary-blue h-2 rounded-full" :style="{ width: '60%' }"></div>
                </div>
                <p class="text-xs text-medium-gray mt-1">60% progress</p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-medium-gray">
              <p>No goals set yet</p>
              <button class="btn btn-primary mt-4" @click="editProfile">Set Goals</button>
            </div>
          </div> -->
          
          <!-- Session Statistics -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">
              Session Statistics
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div class="text-center p-4 bg-light-blue rounded-lg">
                <p class="text-sm text-medium-gray">
                  Total Sessions
                </p>
                <p class="text-2xl font-bold text-dark-gray">
                  {{ traineeSessionsStats.total }}
                </p>
              </div>
              <div class="text-center p-4 bg-light-blue rounded-lg">
                <p class="text-sm text-medium-gray">
                  Completed
                </p>
                <p class="text-2xl font-bold text-dark-gray">
                  {{ traineeSessionsStats.completed }}
                </p>
              </div>
              <div class="text-center p-4 bg-light-blue rounded-lg">
                <p class="text-sm text-medium-gray">
                  Completion Rate
                </p>
                <p class="text-2xl font-bold text-dark-gray">
                  {{ traineeSessionsStats.percentage }}%
                </p>
              </div>
            </div>
          </div>
          
          <!-- Achievements -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">
              Recent Achievements
            </h3>
            <div class="text-center py-8 text-medium-gray">
              <p>Achievements tracking coming soon...</p>
            </div>
          </div>
        </div>

        <div
          v-if="activeTab === 'notes'"
          class="space-y-6"
        >
          <!-- Add New Note -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">
              Add Note
            </h3>
            <div class="space-y-4">
              <textarea
                v-model="newNote"
                rows="4"
                class="input-field"
                placeholder="Enter trainer notes, observations, or feedback..."
              />
              <button 
                class="btn btn-primary"
                :disabled="!newNote.trim()"
                @click="addNote"
              >
                Add Note
              </button>
            </div>
          </div>
          
          <!-- Notes History -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">
              Training Notes
            </h3>
            <div
              v-if="trainerNotes.length > 0"
              class="space-y-4"
            >
              <div 
                v-for="note in trainerNotes" 
                :key="note.id"
                class="p-4 border border-gray-200 rounded-lg"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="text-sm text-medium-gray">{{ new Date(note.created_at).toLocaleDateString() }}</span>
                  <button class="text-danger hover:text-red-700 text-sm">
                    Delete
                  </button>
                </div>
                <p class="text-dark-gray">
                  {{ note.content }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="text-center py-8 text-medium-gray"
            >
              <p>No notes recorded yet</p>
            </div>
          </div>
          
          <!-- Medical Notes -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-dark-gray mb-4">
              Medical Information
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-dark-gray mb-2">Medical Notes</label>
                <p class="text-dark-gray bg-gray-50 p-3 rounded-lg">
                  {{ trainee.medical_notes || 'No medical notes recorded' }}
                </p>
              </div>
              <!-- Injuries - TODO: Implement injuries UI later -->
              <!-- <div v-if="trainee.injuries && trainee.injuries.length > 0">
                <label class="block text-sm font-medium text-dark-gray mb-2">Current Injuries</label>
                <div class="space-y-2">
                  <span 
                    v-for="injury in trainee.injuries" 
                    :key="injury"
                    class="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm mr-2"
                  >
                    {{ injury }}
                  </span>
                </div>
              </div> -->
            </div>
          </div>
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

  <!-- Edit Trainee Modal -->
  <EditTraineeModal
    :is-open="showEditModal"
    :trainee="trainee"
    @close="showEditModal = false"
    @updated="handleTraineeUpdated"
  />

  <!-- Assign Program Modal -->
  <AssignProgramModal
    :is-open="showAssignProgramModal"
    :trainee="trainee"
    @close="showAssignProgramModal = false"
    @assigned="handleProgramAssigned"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTraineesStore } from '@/stores/trainees';
import { useSessionsStore } from '@/stores/sessions';
import { useProgramsStore } from '@/stores/programs';
import EditTraineeModal from '@/components/trainee/EditTraineeModal.vue';
import AssignProgramModal from '@/components/trainee/AssignProgramModal.vue';
import profilePlaceholder from '@/assets/profile-placeholder.png';

const route = useRoute();
const router = useRouter();
const traineesStore = useTraineesStore();
const sessionsStore = useSessionsStore();
const programsStore = useProgramsStore();

const activeTab = ref('profile');
const showEditModal = ref(false);
const showAssignProgramModal = ref(false);
const newNote = ref('');
const trainerNotes = ref([]);
const tabs = [
  { id: 'profile', name: 'Profile' },
  { id: 'measurements', name: 'Measurements' },
  { id: 'workouts', name: 'Workouts' },
  { id: 'progress', name: 'Progress' },
  { id: 'notes', name: 'Notes' }
];

const trainee = computed(() => traineesStore.traineeDetail);
const loading = computed(() => traineesStore.loading);
const currentTraineeAssignedPrograms = computed(() => traineesStore.currentTraineeAssignedPrograms);

// Get assigned programs details
const assignedPrograms = computed(() => {
  if (!currentTraineeAssignedPrograms.value || currentTraineeAssignedPrograms.value.length === 0) return [];
  
  return currentTraineeAssignedPrograms.value.map(program => {
    // Assuming the API now returns programs with assignment details nested
    // and workout_structure is already part of the program object or needs parsing.
    // Adjust this transformation based on the actual structure of data from fetchTraineePrograms.
    
    let workoutStructure = [];
    if (program.workout_structure && typeof program.workout_structure === 'string') {
      try {
        workoutStructure = JSON.parse(program.workout_structure);
      } catch (e) {
        console.error('Error parsing workout_structure for program:', program.id, e);
        workoutStructure = [];
      }
    } else if (Array.isArray(program.workout_structure)) {
      workoutStructure = program.workout_structure;
    }

    // Ensure 'assignment' object exists, as the template uses program.assignment.assigned_at etc.
    // If the API returns assignment details at the top level of the program object,
    // or if it's already nested as 'assignment', this might need adjustment.
    // For this example, let's assume the backend for getTraineePrograms returns
    // program objects that include an `assignment` sub-object.
    // If not, we might need to synthesize it or adjust the template.
    // Example: if assignment details are top-level:
    // const assignmentDetails = { assigned_at: program.assigned_at, status: program.assignment_status };

    return {
      id: program.id,
      name: program.name || "Unnamed Program",
      description: program.description || "",
      difficulty: program.difficulty || "",
      category: program.category || "",
      duration_minutes: program.duration_minutes || null,
      equipment_needed: program.equipment_needed || "",
      exercises: workoutStructure,
      notes: program.notes || "",
      // Assuming program object from currentTraineeAssignedPrograms includes an 'assignment' object
      // If 'assignment' details are directly on the program object, adjust accordingly.
      // e.g., assignment: { assigned_at: program.assigned_at, status: program.status }
      // For now, let's expect program.assignment to exist as per the original template structure.
      assignment: program.assignment || { assigned_at: new Date().toISOString(), status: 'active' } // Fallback if not provided
    };
  }).filter(Boolean);
});

// Get next session for this trainee
const nextSession = computed(() => {
  if (!trainee.value) return null;
  const upcoming = sessionsStore.upcomingSessions;
  return upcoming.find(session => session.trainee_id === trainee.value.id);
});

// Get trainee sessions stats
const traineeSessionsStats = computed(() => {
  if (!trainee.value) return { total: 0, completed: 0, percentage: 0 };
  
  const traineeSessions = sessionsStore.sessions.filter(session => 
    session.trainee_id === trainee.value.id
  );
  
  const total = traineeSessions.length;
  const completed = traineeSessions.filter(session => 
    session.status === 'completed' || new Date(session.scheduled_at) < new Date()
  ).length;
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { total, completed, percentage };
});

// Get training schedule info
const trainingSchedule = computed(() => {
  // This would ideally come from a training program assigned to the trainee
  // For now, calculate from scheduled sessions pattern
  if (!trainee.value) return { frequency: 'Not set', days: 'Not scheduled' };
  
  const traineeSessions = sessionsStore.sessions.filter(session => 
    session.trainee_id === trainee.value.id && 
    new Date(session.scheduled_at) > new Date()
  );
  
  if (traineeSessions.length === 0) return { frequency: 'Not set', days: 'Not scheduled' };
  
  // Simple frequency calculation (sessions per week)
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  
  const nextWeekSessions = traineeSessions.filter(session => 
    new Date(session.scheduled_at) <= oneWeekFromNow
  );
  
  const frequency = `${nextWeekSessions.length}x/week`;
  
  // Get unique days of week
  const days = [...new Set(nextWeekSessions.map(session => 
    new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short' })
  ))].join(', ');
  
  return { frequency, days: days || 'Varies' };
});

// Get recent sessions for workouts tab
const recentSessions = computed(() => {
  if (!trainee.value) return [];
  
  return sessionsStore.sessions
    .filter(session => session.trainee_id === trainee.value.id)
    .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
    .slice(0, 5);
});

onMounted(async () => {
  const traineeId = route.params.id;
  console.log('TraineeDetailView mounted with ID:', traineeId);
  
  if (traineeId) {
    try {
      console.log('Fetching trainee detail for ID:', traineeId);
      await traineesStore.fetchTraineeDetail(traineeId);
      await traineesStore.fetchTraineePrograms(traineeId); // Fetch assigned programs
      // Also fetch sessions to get next session info
      await sessionsStore.fetchSessions();
      // Fetch programs to show assigned program details - still needed if other parts use it
      await programsStore.fetchPrograms();
    } catch (error) {
      console.error('Error loading trainee data:', error);
    }
  } else {
    console.error('No trainee ID found in route params');
  }
});

const editProfile = () => {
  showEditModal.value = true;
};

const handleTraineeUpdated = () => {
  // Refresh trainee data after update
  const traineeId = route.params.id;
  if (traineeId) {
    await traineesStore.fetchTraineeDetail(traineeId);
    await traineesStore.fetchTraineePrograms(traineeId); // Refresh programs list
  }
};

const handleProgramAssigned = async () => {
  // Refresh trainee data after program assignment
  const traineeId = route.params.id;
  if (traineeId) {
    await traineesStore.fetchTraineeDetail(traineeId);
    await traineesStore.fetchTraineePrograms(traineeId); // Refresh programs list
  }
};

const addNote = () => {
  if (!newNote.value.trim()) return;
  
  // Add note to local array (in a real app, this would save to backend)
  const note = {
    id: Date.now(),
    content: newNote.value.trim(),
    created_at: new Date().toISOString()
  };
  
  trainerNotes.value.unshift(note);
  newNote.value = '';
};

</script>