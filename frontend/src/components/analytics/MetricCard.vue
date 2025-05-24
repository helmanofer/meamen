<template>
  <div class="metric-card card hover:shadow-lg transition-shadow duration-200">
    <div class="flex items-center justify-between">
      <!-- Left Section - Icon and Info -->
      <div class="flex items-center space-x-4">
        <div 
          class="rounded-full p-3"
          :class="iconClasses"
        >
          <component :is="iconComponent" class="h-6 w-6" />
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-medium-gray">{{ title }}</h3>
          <div class="flex items-baseline space-x-2">
            <p class="text-2xl font-bold text-dark-gray">{{ formattedValue }}</p>
            <span v-if="unit" class="text-sm text-medium-gray">{{ unit }}</span>
          </div>
          
          <!-- Trend Indicator -->
          <div v-if="trend" class="flex items-center mt-1">
            <svg 
              v-if="trend.direction === 'up'" 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 text-success mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            <svg 
              v-else-if="trend.direction === 'down'" 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 text-error mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <svg 
              v-else 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-4 w-4 text-medium-gray mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            
            <span 
              class="text-xs font-medium"
              :class="{
                'text-success': trend.direction === 'up',
                'text-error': trend.direction === 'down',
                'text-medium-gray': trend.direction === 'stable'
              }"
            >
              {{ trend.percentage }}% {{ trend.period }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right Section - Action Button -->
      <div v-if="actionButton" class="flex-shrink-0">
        <button
          @click="$emit('action')"
          class="p-2 text-medium-gray hover:text-primary-blue hover:bg-light-blue rounded-md transition-colors"
          :title="actionButton.tooltip"
        >
          <component :is="actionButton.icon" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Progress Bar (optional) -->
    <div v-if="progress" class="mt-4">
      <div class="flex justify-between text-xs text-medium-gray mb-1">
        <span>{{ progress.label }}</span>
        <span>{{ progress.current }} / {{ progress.target }}</span>
      </div>
      <div class="w-full bg-light-gray rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300"
          :class="progressBarColor"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Mini Chart (optional) -->
    <div v-if="chartData" class="mt-4">
      <MiniChart 
        :data="chartData" 
        :type="chartType"
        :color="iconColor"
      />
    </div>

    <!-- Additional Info -->
    <div v-if="subtitle" class="mt-3 pt-3 border-t border-gray-100">
      <p class="text-xs text-medium-gray">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MiniChart from './MiniChart.vue'

// Icon imports (you can add more as needed)
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  TrendingUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'chart-bar'
  },
  color: {
    type: String,
    default: 'blue'
  },
  trend: {
    type: Object,
    default: null
    // { direction: 'up|down|stable', percentage: 12, period: 'vs last month' }
  },
  progress: {
    type: Object,
    default: null
    // { current: 75, target: 100, label: 'Goal Progress' }
  },
  chartData: {
    type: Array,
    default: null
  },
  chartType: {
    type: String,
    default: 'line'
  },
  subtitle: {
    type: String,
    default: ''
  },
  actionButton: {
    type: Object,
    default: null
    // { icon: 'EyeIcon', tooltip: 'View Details' }
  },
  format: {
    type: String,
    default: 'number'
    // 'number', 'currency', 'percentage'
  }
})

defineEmits(['action'])

// Icon mapping
const iconMap = {
  'user-group': UserGroupIcon,
  'currency-dollar': CurrencyDollarIcon,
  'chart-bar': ChartBarIcon,
  'clock': ClockIcon,
  'trending-up': TrendingUpIcon,
  'calendar': CalendarIcon,
  'check-circle': CheckCircleIcon,
  'exclamation-triangle': ExclamationTriangleIcon,
  'eye': EyeIcon,
  'arrow-top-right': ArrowTopRightOnSquareIcon
}

// Computed properties
const iconComponent = computed(() => {
  return iconMap[props.icon] || ChartBarIcon
})

const iconColor = computed(() => {
  const colorMap = {
    blue: 'text-primary-blue',
    green: 'text-success',
    red: 'text-error',
    yellow: 'text-warning',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  }
  return colorMap[props.color] || 'text-primary-blue'
})

const iconClasses = computed(() => {
  const colorMap = {
    blue: 'bg-primary-blue/10 text-primary-blue',
    green: 'bg-success/10 text-success',
    red: 'bg-error/10 text-error',
    yellow: 'bg-warning/10 text-warning',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }
  return colorMap[props.color] || 'bg-primary-blue/10 text-primary-blue'
})

const progressBarColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage >= 80) return 'bg-success'
  if (percentage >= 60) return 'bg-warning'
  return 'bg-error'
})

const progressPercentage = computed(() => {
  if (!props.progress) return 0
  return Math.min(100, (props.progress.current / props.progress.target) * 100)
})

const formattedValue = computed(() => {
  const value = props.value
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    
    case 'percentage':
      return `${value}%`
    
    case 'number':
    default:
      if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US').format(value)
      }
      return value
  }
})
</script>

<style scoped>
.metric-card {
  @apply relative overflow-hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-blue), var(--primary-blue-light));
  opacity: 0;
  transition: opacity 0.2s;
}

.metric-card:hover::before {
  opacity: 1;
}
</style>