<template>
  <div
    class="program-card bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    @click="$emit('click', program)"
  >
    <!-- Program Header -->
    <div class="p-6 pb-4">
      <div class="flex items-start justify-between mb-3">
        <h3 class="text-h3 font-semibold text-dark-gray truncate pr-2">
          {{ program.name }}
        </h3>
        <div class="flex items-center space-x-1">
          <!-- More actions menu -->
          <div
            class="relative"
            @click.stop
          >
            <button
              class="btn-icon text-medium-gray hover:text-dark-gray"
              @click="showMenu = !showMenu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]"
            >
              <button
                class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                @click="editProgram"
              >
                Edit
              </button>
              <button
                class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                @click="assignProgram"
              >
                Assign
              </button>
              <button
                class="block w-full px-4 py-2 text-left text-sm text-dark-gray hover:bg-gray-50"
                @click="duplicateProgram"
              >
                Duplicate
              </button>
              <hr class="my-1">
              <button
                class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                @click="deleteProgram"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Program Info -->
      <div class="flex items-center space-x-3 mb-3">
        <span
          v-if="program.difficulty"
          class="px-2 py-1 rounded-full text-xs font-medium"
          :class="getDifficultyClass(program.difficulty)"
        >
          {{ program.difficulty }}
        </span>
        <span
          v-if="program.duration_weeks"
          class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
        >
          {{ program.duration_weeks }} weeks
        </span>
      </div>

      <!-- Description -->
      <p
        v-if="program.description"
        class="text-sm text-medium-gray leading-relaxed line-clamp-2"
      >
        {{ program.description }}
      </p>
    </div>

    <!-- Program Stats -->
    <div class="px-6 pb-4">
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-lg font-semibold text-dark-gray">
            {{ program.sessions?.length || 0 }}
          </div>
          <div class="text-xs text-medium-gray">
            Sessions
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-dark-gray">
            {{ totalExercises }}
          </div>
          <div class="text-xs text-medium-gray">
            Exercises
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-dark-gray">
            {{ assignedCount }}
          </div>
          <div class="text-xs text-medium-gray">
            Assigned
          </div>
        </div>
      </div>
    </div>

    <!-- Goals Tags -->
    <div
      v-if="goalsList.length > 0"
      class="px-6 pb-4"
    >
      <div class="flex flex-wrap gap-1">
        <span
          v-for="goal in goalsList.slice(0, 3)"
          :key="goal"
          class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
        >
          {{ goal }}
        </span>
        <span
          v-if="goalsList.length > 3"
          class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
        >
          +{{ goalsList.length - 3 }} more
        </span>
      </div>
    </div>

    <!-- Program Footer -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <span class="text-xs text-medium-gray">
          {{ formatDate(program.created_at) }}
        </span>
        <div class="flex items-center space-x-2">
          <button
            class="btn-sm btn-success"
            @click.stop="startWorkout"
          >
            Start Workout
          </button>
          <button
            class="btn-sm btn-primary"
            @click.stop="$emit('assign', program)"
          >
            Assign
          </button>
          <button
            class="btn-sm btn-secondary"
            @click.stop="$emit('edit', program)"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  program: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click", "edit", "assign", "duplicate", "delete"]);

const router = useRouter();

// State
const showMenu = ref(false);

// Computed
const totalExercises = computed(() => {
  return (props.program.sessions || []).reduce((total, session) => {
    return total + (session.exercises ? session.exercises.length : 0);
  }, 0);
});

const assignedCount = computed(() => {
  // TODO: Get actual assigned count from backend
  return props.program.assigned_count || 0;
});

const goalsList = computed(() => {
  if (!props.program.goals) return [];
  return props.program.goals.split(",").map(goal => goal.trim());
});

// Methods
const getDifficultyClass = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    case 'expert':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
};

const editProgram = () => {
  showMenu.value = false;
  emit('edit', props.program);
};

const assignProgram = () => {
  showMenu.value = false;
  emit('assign', props.program);
};

const duplicateProgram = () => {
  showMenu.value = false;
  emit('duplicate', props.program);
};

const deleteProgram = () => {
  showMenu.value = false;
  const confirmed = confirm(`Are you sure you want to delete "${props.program.name}"? This action cannot be undone.`);
  if (confirmed) {
    emit('delete', props.program);
  }
};

const startWorkout = () => {
  router.push(`/workout/${props.program.id}`);
};

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    showMenu.value = false;
  }
});
</script>

<style scoped>
.btn-icon {
  @apply p-2 rounded-md transition-colors;
}

.btn-sm {
  @apply px-3 py-1 text-xs font-medium rounded-md transition-colors;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.program-card:hover {
  transform: translateY(-1px);
}
</style>