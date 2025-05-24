<template>
  <div class="mini-chart" :style="{ height: `${height}px` }">
    <svg 
      :width="width" 
      :height="height" 
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full h-full"
    >
      <!-- Line Chart -->
      <template v-if="type === 'line'">
        <!-- Grid lines -->
        <g v-if="showGrid" opacity="0.1">
          <line
            v-for="i in 3"
            :key="`h-${i}`"
            x1="0"
            :y1="(height / 4) * i"
            :x2="width"
            :y2="(height / 4) * i"
            :stroke="strokeColor"
            stroke-width="1"
          />
        </g>
        
        <!-- Line path -->
        <path
          :d="linePath"
          fill="none"
          :stroke="strokeColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Area fill -->
        <path
          v-if="showArea"
          :d="areaPath"
          :fill="`url(#gradient-${chartId})`"
          opacity="0.2"
        />
        
        <!-- Data points -->
        <circle
          v-for="(point, index) in normalizedData"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          :r="pointRadius"
          :fill="strokeColor"
          opacity="0.8"
        />
        
        <!-- Gradient definition -->
        <defs v-if="showArea">
          <linearGradient :id="`gradient-${chartId}`" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="strokeColor" stop-opacity="0.3"/>
            <stop offset="100%" :stop-color="strokeColor" stop-opacity="0"/>
          </linearGradient>
        </defs>
      </template>

      <!-- Bar Chart -->
      <template v-if="type === 'bar'">
        <rect
          v-for="(point, index) in normalizedData"
          :key="index"
          :x="point.x - barWidth / 2"
          :y="point.y"
          :width="barWidth"
          :height="height - point.y - padding"
          :fill="strokeColor"
          opacity="0.8"
          rx="2"
        />
      </template>

      <!-- Area Chart -->
      <template v-if="type === 'area'">
        <path
          :d="areaPath"
          :fill="strokeColor"
          opacity="0.6"
        />
        <path
          :d="linePath"
          fill="none"
          :stroke="strokeColor"
          :stroke-width="strokeWidth"
        />
      </template>
    </svg>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    // Expected format: [{ value: number, label?: string }, ...]
  },
  type: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar', 'area'].includes(value)
  },
  color: {
    type: String,
    default: 'text-primary-blue'
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 60
  },
  showGrid: {
    type: Boolean,
    default: false
  },
  showArea: {
    type: Boolean,
    default: true
  },
  strokeWidth: {
    type: Number,
    default: 2
  },
  pointRadius: {
    type: Number,
    default: 2
  }
})

// Generate unique chart ID for gradients
const chartId = ref(`chart-${Math.random().toString(36).substr(2, 9)}`)

// Constants
const padding = 8

// Computed properties
const strokeColor = computed(() => {
  // Convert Tailwind class to actual color
  const colorMap = {
    'text-primary-blue': '#3B82F6',
    'text-success': '#10B981',
    'text-error': '#EF4444',
    'text-warning': '#F59E0B',
    'text-purple-600': '#9333EA',
    'text-indigo-600': '#4F46E5'
  }
  return colorMap[props.color] || '#3B82F6'
})

const barWidth = computed(() => {
  if (props.data.length === 0) return 0
  return Math.max(8, (props.width - padding * 2) / props.data.length - 4)
})

const normalizedData = computed(() => {
  if (props.data.length === 0) return []
  
  // Find min and max values
  const values = props.data.map(d => typeof d === 'object' ? d.value : d)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1
  
  // Calculate positions
  const availableWidth = props.width - padding * 2
  const availableHeight = props.height - padding * 2
  
  return props.data.map((dataPoint, index) => {
    const value = typeof dataPoint === 'object' ? dataPoint.value : dataPoint
    const normalizedValue = (value - minValue) / range
    
    return {
      x: padding + (index / (props.data.length - 1 || 1)) * availableWidth,
      y: padding + (1 - normalizedValue) * availableHeight,
      value,
      originalIndex: index
    }
  })
})

const linePath = computed(() => {
  if (normalizedData.value.length === 0) return ''
  
  let path = `M ${normalizedData.value[0].x} ${normalizedData.value[0].y}`
  
  for (let i = 1; i < normalizedData.value.length; i++) {
    const point = normalizedData.value[i]
    path += ` L ${point.x} ${point.y}`
  }
  
  return path
})

const areaPath = computed(() => {
  if (normalizedData.value.length === 0) return ''
  
  const baseY = props.height - padding
  let path = `M ${normalizedData.value[0].x} ${baseY}`
  path += ` L ${normalizedData.value[0].x} ${normalizedData.value[0].y}`
  
  for (let i = 1; i < normalizedData.value.length; i++) {
    const point = normalizedData.value[i]
    path += ` L ${point.x} ${point.y}`
  }
  
  const lastPoint = normalizedData.value[normalizedData.value.length - 1]
  path += ` L ${lastPoint.x} ${baseY} Z`
  
  return path
})
</script>

<style scoped>
.mini-chart {
  @apply w-full;
}

.mini-chart svg {
  @apply block;
}
</style>