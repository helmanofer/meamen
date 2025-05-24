<template>
  <div class="chart-container card">
    <!-- Chart Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-dark-gray">
          {{ title }}
        </h3>
        <p
          v-if="subtitle"
          class="text-sm text-medium-gray"
        >
          {{ subtitle }}
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Time Period Selector -->
        <select
          v-if="showPeriodSelector"
          v-model="selectedPeriod"
          class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
          @change="$emit('period-change', selectedPeriod)"
        >
          <option value="7d">
            Last 7 days
          </option>
          <option value="30d">
            Last 30 days
          </option>
          <option value="90d">
            Last 3 months
          </option>
          <option value="1y">
            Last year
          </option>
        </select>
        
        <!-- Chart Type Selector -->
        <div
          v-if="showTypeSelector"
          class="flex bg-light-gray rounded-lg p-1"
        >
          <button
            v-for="type in chartTypes"
            :key="type.value"
            class="px-2 py-1 text-sm rounded-md transition-colors"
            :class="currentType === type.value 
              ? 'bg-white text-primary-blue shadow-sm' 
              : 'text-medium-gray hover:text-dark-gray'"
            @click="changeChartType(type.value)"
          >
            <component
              :is="type.icon"
              class="h-4 w-4"
            />
          </button>
        </div>
        
        <!-- Export Button -->
        <button
          v-if="showExport"
          class="p-2 text-medium-gray hover:text-primary-blue hover:bg-light-blue rounded-md transition-colors"
          title="Export Chart"
          @click="$emit('export')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Chart Content -->
    <div
      class="chart-content relative"
      :style="{ height: `${height}px` }"
    >
      <!-- Loading State -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75"
      >
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-blue" />
          <span class="text-sm text-medium-gray">Loading chart...</span>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 text-error mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p class="text-sm text-error">
            {{ error }}
          </p>
          <button
            class="mt-2 text-xs text-primary-blue hover:text-primary-blue/80"
            @click="$emit('retry')"
          >
            Try again
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!data || data.length === 0"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 text-medium-gray mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p class="text-sm text-medium-gray">
            No data available
          </p>
          <p class="text-xs text-medium-gray mt-1">
            {{ emptyMessage || 'Try adjusting your filters' }}
          </p>
        </div>
      </div>

      <!-- Chart Component -->
      <component
        :is="chartComponent"
        v-else
        :data="data"
        :options="chartOptions"
        :height="height"
        @data-point-click="$emit('data-point-click', $event)"
      />
    </div>

    <!-- Chart Legend -->
    <div
      v-if="showLegend && legend"
      class="flex flex-wrap items-center justify-center mt-4 pt-4 border-t border-gray-100"
    >
      <div
        v-for="item in legend"
        :key="item.label"
        class="flex items-center space-x-2 mr-4 mb-2"
      >
        <div
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: item.color }"
        />
        <span class="text-xs text-medium-gray">{{ item.label }}</span>
      </div>
    </div>

    <!-- Chart Statistics -->
    <div
      v-if="showStats && stats"
      class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100"
    >
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="text-center"
      >
        <p class="text-lg font-semibold text-dark-gray">
          {{ stat.value }}
        </p>
        <p class="text-xs text-medium-gray">
          {{ stat.label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LineChart from './charts/LineChart.vue'
import BarChart from './charts/BarChart.vue'
import AreaChart from './charts/AreaChart.vue'
import PieChart from './charts/PieChart.vue'
import DoughnutChart from './charts/DoughnutChart.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  data: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar', 'area', 'pie', 'doughnut'].includes(value)
  },
  height: {
    type: Number,
    default: 300
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  emptyMessage: {
    type: String,
    default: ''
  },
  showPeriodSelector: {
    type: Boolean,
    default: true
  },
  showTypeSelector: {
    type: Boolean,
    default: false
  },
  showExport: {
    type: Boolean,
    default: true
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  showStats: {
    type: Boolean,
    default: false
  },
  legend: {
    type: Array,
    default: () => []
  },
  stats: {
    type: Array,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['period-change', 'type-change', 'export', 'retry', 'data-point-click'])

// Component state
const selectedPeriod = ref('30d')
const currentType = ref(props.type)

// Chart types for selector
const chartTypes = [
  { value: 'line', icon: 'LineChartIcon', label: 'Line' },
  { value: 'bar', icon: 'BarChartIcon', label: 'Bar' },
  { value: 'area', icon: 'AreaChartIcon', label: 'Area' }
]

// Computed properties
const chartComponent = computed(() => {
  const componentMap = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart,
    pie: PieChart,
    doughnut: DoughnutChart
  }
  return componentMap[currentType.value] || LineChart
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    ...props.options
  }
})

// Methods
const changeChartType = (type) => {
  currentType.value = type
  emit('type-change', type)
}
</script>

<style scoped>
.chart-container {
  @apply relative;
}

.chart-content {
  @apply w-full relative;
}

/* Custom scrollbar for horizontal scroll if needed */
.chart-content::-webkit-scrollbar {
  height: 6px;
}

.chart-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chart-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chart-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>