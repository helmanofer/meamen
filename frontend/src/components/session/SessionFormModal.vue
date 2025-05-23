<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-dark-gray">
          {{ session ? 'Edit Session' : 'Schedule New Session' }}
        </h2>
        <button
          class="text-medium-gray hover:text-dark-gray"
          @click="$emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <form
        class="p-6 space-y-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Template Selection -->
        <div
          v-if="!session && templates.length > 0"
          class="space-y-2"
        >
          <label class="block text-sm font-medium text-dark-gray">
            Start from Template (Optional)
          </label>
          <select
            v-model="selectedTemplate"
            class="input-field w-full"
            @change="applyTemplate"
          >
            <option value="">
              Create from scratch
            </option>
            <option
              v-for="template in templates"
              :key="template.id"
              :value="template"
            >
              {{ template.name }} ({{ template.duration }}min)
            </option>
          </select>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label
              for="title"
              class="block text-sm font-medium text-dark-gray"
            >
              Session Title *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="input-field w-full"
              placeholder="e.g., Upper Body Strength Training"
            >
          </div>

          <div class="space-y-2">
            <label
              for="trainee"
              class="block text-sm font-medium text-dark-gray"
            >
              Trainee *
            </label>
            <select
              id="trainee"
              v-model="form.trainee_id"
              required
              class="input-field w-full"
            >
              <option value="">
                Select a trainee
              </option>
              <option
                v-for="trainee in trainees"
                :key="trainee.id"
                :value="trainee.id"
              >
                {{ trainee.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label
              for="date"
              class="block text-sm font-medium text-dark-gray"
            >
              Date *
            </label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
              class="input-field w-full"
            >
          </div>

          <div class="space-y-2">
            <label
              for="time"
              class="block text-sm font-medium text-dark-gray"
            >
              Time *
            </label>
            <input
              id="time"
              v-model="form.time"
              type="time"
              required
              class="input-field w-full"
            >
          </div>

          <div class="space-y-2">
            <label
              for="duration"
              class="block text-sm font-medium text-dark-gray"
            >
              Duration (minutes) *
            </label>
            <input
              id="duration"
              v-model.number="form.duration"
              type="number"
              min="15"
              max="180"
              required
              class="input-field w-full"
              placeholder="60"
            >
          </div>
        </div>

        <!-- Location -->
        <div class="space-y-2">
          <label
            for="location"
            class="block text-sm font-medium text-dark-gray"
          >
            Location
          </label>
          <input
            id="location"
            v-model="form.location"
            type="text"
            class="input-field w-full"
            placeholder="e.g., Gym - Area A, Studio B, Online"
          >
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label
            for="description"
            class="block text-sm font-medium text-dark-gray"
          >
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="input-field w-full resize-none"
            placeholder="Brief description of the session goals and focus areas..."
          />
        </div>

        <!-- Session Goals/Notes -->
        <div class="space-y-2">
          <label
            for="notes"
            class="block text-sm font-medium text-dark-gray"
          >
            Session Notes
          </label>
          <textarea
            id="notes"
            v-model="form.notes"
            rows="3"
            class="input-field w-full resize-none"
            placeholder="Special instructions, modifications, or goals for this session..."
          />
        </div>

        <!-- Exercise Plan (if from template) -->
        <div
          v-if="form.exercises && form.exercises.length > 0"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-dark-gray">
              Exercise Plan
            </h3>
            <button
              type="button"
              class="text-sm text-medium-gray hover:text-dark-gray"
              @click="form.exercises = []"
            >
              Clear exercises
            </button>
          </div>
          
          <div class="space-y-3">
            <div
              v-for="(exercise, index) in form.exercises"
              :key="index"
              class="flex items-center justify-between p-3 bg-light-gray rounded-md"
            >
              <div class="flex-1">
                <div class="font-medium text-dark-gray">
                  {{ exercise.name }}
                </div>
                <div class="text-sm text-medium-gray">
                  {{ exercise.sets }} sets × {{ exercise.reps }}
                  <span v-if="exercise.rest"> • {{ exercise.rest }}s rest</span>
                </div>
              </div>
              <button
                type="button"
                class="text-error hover:text-error/80 ml-4"
                @click="removeExercise(index)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Recurring Sessions -->
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              id="recurring"
              v-model="form.is_recurring"
              type="checkbox"
              class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
            >
            <label
              for="recurring"
              class="ml-2 text-sm font-medium text-dark-gray"
            >
              Make this a recurring session
            </label>
          </div>

          <div
            v-if="form.is_recurring"
            class="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6"
          >
            <div class="space-y-2">
              <label
                for="frequency"
                class="block text-sm font-medium text-dark-gray"
              >
                Frequency
              </label>
              <select
                id="frequency"
                v-model="form.recurring_frequency"
                class="input-field w-full"
              >
                <option value="weekly">
                  Weekly
                </option>
                <option value="biweekly">
                  Every 2 weeks
                </option>
                <option value="monthly">
                  Monthly
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label
                for="occurrences"
                class="block text-sm font-medium text-dark-gray"
              >
                Number of sessions
              </label>
              <input
                id="occurrences"
                v-model.number="form.recurring_count"
                type="number"
                min="2"
                max="52"
                class="input-field w-full"
                placeholder="8"
              >
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!isFormValid"
            class="btn btn-primary"
            :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
          >
            {{ session ? 'Update Session' : 'Schedule Session' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTraineesStore } from '@/stores/trainees'

const props = defineProps({
  session: {
    type: Object,
    default: null
  },
  templates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const traineesStore = useTraineesStore()

// Component state
const selectedTemplate = ref('')
const form = ref({
  title: '',
  trainee_id: '',
  date: '',
  time: '',
  duration: 60,
  location: '',
  description: '',
  notes: '',
  exercises: [],
  is_recurring: false,
  recurring_frequency: 'weekly',
  recurring_count: 8
})

// Computed
const trainees = computed(() => traineesStore.trainees)

const isFormValid = computed(() => {
  return form.value.title &&
         form.value.trainee_id &&
         form.value.date &&
         form.value.time &&
         form.value.duration > 0
})

// Methods
const initializeForm = () => {
  if (props.session) {
    // Edit mode - populate form with session data
    const sessionDate = new Date(props.session.scheduled_at)
    form.value = {
      title: props.session.title,
      trainee_id: props.session.trainee_id,
      date: sessionDate.toISOString().split('T')[0],
      time: sessionDate.toTimeString().slice(0, 5),
      duration: props.session.duration,
      location: props.session.location || '',
      description: props.session.description || '',
      notes: props.session.notes || '',
      exercises: props.session.exercises || [],
      is_recurring: false,
      recurring_frequency: 'weekly',
      recurring_count: 8
    }
  } else {
    // Create mode - set default date to today
    const today = new Date()
    form.value.date = today.toISOString().split('T')[0]
    form.value.time = '09:00'
  }
}

const applyTemplate = () => {
  if (selectedTemplate.value) {
    form.value.title = selectedTemplate.value.name
    form.value.description = selectedTemplate.value.description
    form.value.duration = selectedTemplate.value.duration
    form.value.exercises = [...selectedTemplate.value.exercises]
  }
}

const removeExercise = (index) => {
  form.value.exercises.splice(index, 1)
}

const handleSubmit = () => {
  if (!isFormValid.value) return

  // Combine date and time into ISO string
  const scheduledAt = new Date(`${form.value.date}T${form.value.time}:00`).toISOString()

  const sessionData = {
    title: form.value.title,
    trainee_id: parseInt(form.value.trainee_id),
    scheduled_at: scheduledAt,
    duration: form.value.duration,
    location: form.value.location,
    description: form.value.description,
    notes: form.value.notes,
    exercises: form.value.exercises,
    status: 'scheduled'
  }

  // Handle recurring sessions
  if (form.value.is_recurring && !props.session) {
    sessionData.is_recurring = true
    sessionData.recurring_frequency = form.value.recurring_frequency
    sessionData.recurring_count = form.value.recurring_count
  }

  emit('save', sessionData)
}

// Lifecycle
onMounted(async () => {
  // Load trainees if not already loaded
  if (traineesStore.trainees.length === 0) {
    await traineesStore.fetchTrainees()
  }
  
  initializeForm()
})

// Watch for session prop changes (in case of switching between edit sessions)
watch(() => props.session, () => {
  initializeForm()
}, { immediate: true })
</script>