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
          Edit Exercise
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
            <!-- Exercise Name -->
            <div class="md:col-span-2">
              <label
                for="name"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Exercise Name *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="input-field w-full"
                :class="{ 'border-red-300': errors.name }"
                placeholder="e.g., Push-ups, Squats, Bench Press"
                required
              >
              <p
                v-if="errors.name"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors.name }}
              </p>
            </div>

            <!-- Category -->
            <div>
              <label
                for="category"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Category
              </label>
              <select
                id="category"
                v-model="form.category"
                class="input-field w-full"
              >
                <option value="">
                  Select category
                </option>
                <option value="Strength">
                  Strength
                </option>
                <option value="Cardio">
                  Cardio
                </option>
                <option value="Flexibility">
                  Flexibility
                </option>
                <option value="Balance">
                  Balance
                </option>
                <option value="Plyometric">
                  Plyometric
                </option>
                <option value="Functional">
                  Functional
                </option>
              </select>
            </div>

            <!-- Difficulty -->
            <div>
              <label
                for="difficulty"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Difficulty Level
              </label>
              <select
                id="difficulty"
                v-model="form.difficulty"
                class="input-field w-full"
              >
                <option value="">
                  Select difficulty
                </option>
                <option value="Beginner">
                  Beginner
                </option>
                <option value="Intermediate">
                  Intermediate
                </option>
                <option value="Advanced">
                  Advanced
                </option>
                <option value="Expert">
                  Expert
                </option>
              </select>
            </div>
          </div>

          <!-- Muscle Groups -->
          <div>
            <label class="block text-sm font-medium text-dark-gray mb-2">
              Muscle Groups
            </label>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label
                v-for="muscle in muscleGroupOptions"
                :key="muscle"
                class="flex items-center space-x-2 text-sm"
              >
                <input
                  v-model="selectedMuscleGroups"
                  type="checkbox"
                  :value="muscle"
                  class="rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                >
                <span>{{ muscle }}</span>
              </label>
            </div>
          </div>

          <!-- Equipment -->
          <div>
            <label
              for="equipment"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Equipment Required
            </label>
            <select
              id="equipment"
              v-model="form.equipment"
              class="input-field w-full"
            >
              <option value="">
                Select equipment
              </option>
              <option value="None">
                None (Bodyweight)
              </option>
              <option value="Dumbbells">
                Dumbbells
              </option>
              <option value="Barbells">
                Barbells
              </option>
              <option value="Resistance Bands">
                Resistance Bands
              </option>
              <option value="Kettlebells">
                Kettlebells
              </option>
              <option value="Pull-up Bar">
                Pull-up Bar
              </option>
              <option value="Bench">
                Bench
              </option>
              <option value="Cable Machine">
                Cable Machine
              </option>
              <option value="Medicine Ball">
                Medicine Ball
              </option>
              <option value="Stability Ball">
                Stability Ball
              </option>
              <option value="TRX">
                TRX
              </option>
              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label
              for="description"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="input-field w-full resize-none"
              placeholder="Brief description of the exercise..."
            />
          </div>

          <!-- Instructions -->
          <div>
            <label
              for="instructions"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Exercise Instructions
            </label>
            <textarea
              id="instructions"
              v-model="form.instructions"
              rows="4"
              class="input-field w-full resize-none"
              placeholder="Step-by-step instructions for performing the exercise..."
            />
          </div>

          <!-- Tips -->
          <div>
            <label
              for="tips"
              class="block text-sm font-medium text-dark-gray mb-2"
            >
              Tips & Safety Notes
            </label>
            <textarea
              id="tips"
              v-model="form.tips"
              rows="3"
              class="input-field w-full resize-none"
              placeholder="Safety tips, common mistakes to avoid, form cues..."
            />
          </div>

          <!-- Media URLs -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Image URL -->
            <div>
              <label
                for="image_url"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Image URL
              </label>
              <input
                id="image_url"
                v-model="form.image_url"
                type="url"
                class="input-field w-full"
                placeholder="https://example.com/exercise-image.jpg"
              >
            </div>

            <!-- Video URL -->
            <div>
              <label
                for="video_url"
                class="block text-sm font-medium text-dark-gray mb-2"
              >
                Video URL
              </label>
              <input
                id="video_url"
                v-model="form.video_url"
                type="url"
                class="input-field w-full"
                placeholder="https://example.com/exercise-video.mp4"
              >
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <!-- Delete Button (only show for existing exercises) -->
          <button
            v-if="exercise"
            type="button"
            class="btn btn-danger flex items-center"
            :disabled="loading"
            @click="handleDelete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v1M4 7h16"
              />
            </svg>
            Delete
          </button>
          <div v-else />

          <div class="flex items-center space-x-4">
            <button
              type="button"
              class="btn btn-secondary"
              :disabled="loading"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary flex items-center"
              :disabled="loading || !form.name.trim()"
            >
              <div
                v-if="loading"
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
              />
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useExercisesStore } from "@/stores/exercises";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  exercise: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close", "updated", "deleted"]);

const exercisesStore = useExercisesStore();

// Form data
const form = ref({
  name: "",
  description: "",
  category: "",
  difficulty: "",
  equipment: "",
  instructions: "",
  tips: "",
  image_url: "",
  video_url: "",
});

const selectedMuscleGroups = ref([]);
const loading = ref(false);
const errors = ref({});

// Muscle group options
const muscleGroupOptions = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Abs",
  "Obliques",
  "Glutes",
  "Quadriceps",
  "Hamstrings",
  "Calves",
  "Full Body",
];

// Computed
const formattedMuscleGroups = computed(() => {
  return selectedMuscleGroups.value.join(", ");
});

// Methods
const validateForm = () => {
  errors.value = {};

  if (!form.value.name.trim()) {
    errors.value.name = "Exercise name is required";
  }

  return Object.keys(errors.value).length === 0;
};

const populateForm = () => {
  if (props.exercise) {
    form.value = {
      name: props.exercise.name || "",
      description: props.exercise.description || "",
      category: props.exercise.category || "",
      difficulty: props.exercise.difficulty || "",
      equipment: props.exercise.equipment || "",
      instructions: props.exercise.instructions || "",
      tips: props.exercise.tips || "",
      image_url: props.exercise.image_url || "",
      video_url: props.exercise.video_url || "",
    };

    // Handle muscle groups
    if (props.exercise.muscle_groups) {
      selectedMuscleGroups.value = props.exercise.muscle_groups
        .split(",")
        .map(group => group.trim())
        .filter(group => muscleGroupOptions.includes(group));
    } else {
      selectedMuscleGroups.value = [];
    }
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    description: "",
    category: "",
    difficulty: "",
    equipment: "",
    instructions: "",
    tips: "",
    image_url: "",
    video_url: "",
  };
  selectedMuscleGroups.value = [];
  errors.value = {};
};

const closeModal = () => {
  if (!loading.value) {
    resetForm();
    emit("close");
  }
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;

  try {
    const exerciseData = {
      ...form.value,
      muscle_groups: formattedMuscleGroups.value || null,
    };

    // Remove empty string values
    Object.keys(exerciseData).forEach(key => {
      if (exerciseData[key] === "") {
        exerciseData[key] = null;
      }
    });

    const updatedExercise = await exercisesStore.updateExercise(props.exercise.id, exerciseData);
    
    emit("updated", updatedExercise);
    emit("close");
  } catch (error) {
    console.error("Error updating exercise:", error);
    // Handle validation errors from the backend
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        // Handle FastAPI validation errors
        error.response.data.detail.forEach(err => {
          if (err.loc && err.loc[1]) {
            errors.value[err.loc[1]] = err.msg;
          }
        });
      } else {
        errors.value.general = error.response.data.detail;
      }
    }
  } finally {
    loading.value = false;
  }
};

const handleDelete = async () => {
  if (!props.exercise) return;
  
  const confirmed = confirm(`Are you sure you want to delete "${props.exercise.name}"? This action cannot be undone.`);
  if (!confirmed) return;

  loading.value = true;

  try {
    await exercisesStore.deleteExercise(props.exercise.id);
    emit("deleted", props.exercise);
    emit("close");
  } catch (error) {
    console.error("Error deleting exercise:", error);
    alert("Failed to delete exercise. Please try again.");
  } finally {
    loading.value = false;
  }
};

// Watch for modal open/close and exercise changes
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.exercise) {
    populateForm();
  } else if (!newValue) {
    resetForm();
  }
});

watch(() => props.exercise, (newExercise) => {
  if (newExercise && props.isOpen) {
    populateForm();
  }
});
</script>

<style scoped>
/* Custom scrollbar for the form */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>