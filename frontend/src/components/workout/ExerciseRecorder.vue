<template>
  <div class="exercise-recorder bg-white rounded-lg shadow-md">
    <!-- No Exercise Selected -->
    <div v-if="!currentExercise" class="p-8 text-center">
      <div class="text-gray-400 mb-4">
        <svg
          class="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        No Exercise Selected
      </h3>
      <p class="text-gray-500">
        Select an exercise to start recording sets
      </p>
    </div>

    <!-- Exercise Recording Interface -->
    <div v-else class="p-6">
      <!-- Exercise Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-start space-x-4">
          <!-- Exercise Image/Icon -->
          <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <!-- Exercise Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ currentExercise.exercise_name }}
            </h3>
            <div class="flex items-center space-x-4 mt-1">
              <span class="text-sm text-gray-500">
                Sets: {{ currentExercise.completed_sets }}/{{ currentExercise.target_sets || '∞' }}
              </span>
              <span 
                class="px-2 py-1 rounded text-xs font-medium"
                :class="statusClass"
              >
                {{ statusText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Previous Performance -->
        <div v-if="previousPerformance.length" class="text-right">
          <p class="text-xs text-gray-500 mb-1">Last Performance</p>
          <div class="text-sm text-gray-700">
            {{ formatPreviousPerformance(previousPerformance[0]) }}
          </div>
        </div>
      </div>

      <!-- Sets Overview -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900">Sets</h4>
          <span class="text-sm text-gray-500">
            Set {{ currentSetNumber }}/{{ currentExercise.target_sets || '∞' }}
          </span>
        </div>
        
        <!-- Sets Progress -->
        <div class="flex space-x-2 overflow-x-auto pb-2">
          <div
            v-for="(set, index) in allSets"
            :key="index"
            class="flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[60px] text-center"
            :class="setButtonClass(set, index)"
          >
            {{ index + 1 }}
            <div v-if="set.completed" class="text-xs">
              {{ set.reps }}{{ set.weight ? `@${set.weight}kg` : '' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Current Set Recording -->
      <div v-if="currentExercise.status !== 'completed'" class="space-y-6">
        <!-- Set Input Form -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Reps Input -->
          <div>
            <label for="reps" class="block text-sm font-medium text-gray-700 mb-2">
              Reps *
            </label>
            <div class="relative">
              <input
                id="reps"
                v-model.number="setForm.reps"
                type="number"
                min="0"
                max="100"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold"
                placeholder="0"
                required
              >
              <!-- Quick Rep Buttons -->
              <div class="flex justify-center space-x-1 mt-2">
                <button
                  v-for="rep in quickReps"
                  :key="rep"
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  @click="setForm.reps = rep"
                >
                  {{ rep }}
                </button>
              </div>
            </div>
          </div>

          <!-- Weight Input -->
          <div>
            <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <div class="relative">
              <input
                id="weight"
                v-model.number="setForm.weight"
                type="number"
                min="0"
                step="0.5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-semibold"
                placeholder="0"
              >
              <!-- Weight Increment Buttons -->
              <div class="flex justify-center space-x-1 mt-2">
                <button
                  v-for="increment in weightIncrements"
                  :key="increment"
                  class="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  @click="adjustWeight(increment)"
                >
                  +{{ increment }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Set Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            v-model="setForm.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="How did this set feel? Any observations..."
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-4">
          <button
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            @click="skipSet"
          >
            Skip Set
          </button>
          
          <button
            :disabled="!canRecordSet"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            @click="recordSet"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Record Set</span>
          </button>
        </div>
      </div>

      <!-- Exercise Quality Rating -->
      <div class="border-t border-gray-200 pt-6 mt-6">
        <h4 class="font-medium text-gray-900 mb-4">Exercise Quality</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Form Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Form Rating (1-5 stars)
            </label>
            <div class="flex space-x-1">
              <button
                v-for="star in 5"
                :key="star"
                class="w-8 h-8 transition-colors"
                @click="setFormRating(star)"
              >
                <svg
                  class="w-full h-full"
                  :class="star <= (currentExercise.form_rating || 0) ? 'text-yellow-400' : 'text-gray-300'"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- RPE Rating -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              RPE (Rate of Perceived Exertion 1-10)
            </label>
            <select
              v-model="currentExercise.rpe"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="updateRPE"
            >
              <option value="">Select RPE</option>
              <option v-for="rpe in 10" :key="rpe" :value="rpe">
                {{ rpe }} - {{ rpeDescriptions[rpe] }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Exercise Actions -->
      <div class="border-t border-gray-200 pt-6 mt-6 flex justify-between">
        <button
          class="px-4 py-2 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          @click="skipExercise"
        >
          Skip Exercise
        </button>
        
        <button
          v-if="currentExercise.status === 'in_progress'"
          class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          @click="completeExercise"
        >
          Mark Complete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'

export default {
  name: 'ExerciseRecorder',
  props: {
    currentExercise: {
      type: Object,
      default: null
    },
    previousPerformance: {
      type: Array,
      default: () => []
    }
  },
  emits: ['record-set', 'skip-set', 'skip-exercise', 'complete-exercise', 'update-form-rating', 'update-rpe'],
  setup(props, { emit }) {
    const { showToast } = useToast()
    
    // Set form data
    const setForm = ref({
      reps: null,
      weight: null,
      notes: ''
    })

    // Quick action options
    const quickReps = [8, 10, 12, 15]
    const weightIncrements = [2.5, 5, 10]
    
    // RPE descriptions
    const rpeDescriptions = {
      1: 'Very Light',
      2: 'Light',
      3: 'Moderate',
      4: 'Somewhat Hard',
      5: 'Hard',
      6: 'Hard+',
      7: 'Very Hard',
      8: 'Very Hard+',
      9: 'Extremely Hard',
      10: 'Maximum Effort'
    }

    // Computed properties
    const statusClass = computed(() => {
      if (!props.currentExercise) return ''
      switch (props.currentExercise.status) {
        case 'not_started': return 'bg-gray-100 text-gray-700'
        case 'in_progress': return 'bg-blue-100 text-blue-700'
        case 'completed': return 'bg-green-100 text-green-700'
        case 'skipped': return 'bg-yellow-100 text-yellow-700'
        default: return 'bg-gray-100 text-gray-700'
      }
    })

    const statusText = computed(() => {
      if (!props.currentExercise) return ''
      switch (props.currentExercise.status) {
        case 'not_started': return 'Not Started'
        case 'in_progress': return 'In Progress'
        case 'completed': return 'Completed'
        case 'skipped': return 'Skipped'
        default: return 'Unknown'
      }
    })

    const currentSetNumber = computed(() => {
      if (!props.currentExercise?.sets_data) return 1
      return props.currentExercise.sets_data.length + 1
    })

    const allSets = computed(() => {
      if (!props.currentExercise) return []
      const recorded = props.currentExercise.sets_data || []
      const targetSets = props.currentExercise.target_sets || recorded.length + 1
      const total = Math.max(targetSets, recorded.length + 1)
      
      const sets = []
      for (let i = 0; i < total; i++) {
        if (i < recorded.length) {
          sets.push({
            ...recorded[i],
            completed: recorded[i].completed || false
          })
        } else {
          sets.push({
            set_number: i + 1,
            completed: false
          })
        }
      }
      return sets
    })

    const canRecordSet = computed(() => {
      return setForm.value.reps !== null && setForm.value.reps >= 0
    })

    // Methods
    const setButtonClass = (set, index) => {
      if (set.completed) {
        return 'bg-green-100 text-green-800'
      } else if (index === currentSetNumber.value - 1) {
        return 'bg-blue-100 text-blue-800 border-2 border-blue-300'
      } else {
        return 'bg-gray-100 text-gray-700'
      }
    }

    const adjustWeight = (increment) => {
      const current = setForm.value.weight || 0
      setForm.value.weight = current + increment
    }

    const recordSet = () => {
      if (!canRecordSet.value) return

      emit('record-set', {
        set_number: currentSetNumber.value,
        reps: setForm.value.reps,
        weight: setForm.value.weight,
        notes: setForm.value.notes
      })

      // Reset form
      setForm.value = {
        reps: null,
        weight: null,
        notes: ''
      }

      showToast('Set recorded successfully', 'success')
    }

    const skipSet = () => {
      emit('skip-set', {
        set_number: currentSetNumber.value
      })
      showToast('Set skipped', 'info')
    }

    const skipExercise = () => {
      if (confirm('Are you sure you want to skip this exercise?')) {
        emit('skip-exercise')
        showToast('Exercise skipped', 'info')
      }
    }

    const completeExercise = () => {
      emit('complete-exercise')
      showToast('Exercise completed', 'success')
    }

    const setFormRating = (rating) => {
      emit('update-form-rating', rating)
    }

    const updateRPE = () => {
      emit('update-rpe', props.currentExercise.rpe)
    }

    const formatPreviousPerformance = (performance) => {
      if (!performance) return ''
      const sets = performance.sets_data || []
      if (sets.length === 0) return 'No data'
      
      const completedSets = sets.filter(s => s.completed)
      if (completedSets.length === 0) return 'No completed sets'
      
      const lastSet = completedSets[completedSets.length - 1]
      return `${lastSet.reps} reps${lastSet.weight ? ` @ ${lastSet.weight}kg` : ''}`
    }

    // Auto-fill from previous performance
    watch(() => props.currentExercise, (newExercise) => {
      if (newExercise && props.previousPerformance.length > 0) {
        const lastPerformance = props.previousPerformance[0]
        const lastSets = lastPerformance.sets_data || []
        const lastCompletedSet = lastSets.filter(s => s.completed).pop()
        
        if (lastCompletedSet) {
          setForm.value.weight = lastCompletedSet.weight
          // Don't auto-fill reps, let trainer decide
        }
      }
    }, { immediate: true })

    return {
      setForm,
      quickReps,
      weightIncrements,
      rpeDescriptions,
      statusClass,
      statusText,
      currentSetNumber,
      allSets,
      canRecordSet,
      setButtonClass,
      adjustWeight,
      recordSet,
      skipSet,
      skipExercise,
      completeExercise,
      setFormRating,
      updateRPE,
      formatPreviousPerformance
    }
  }
}
</script>