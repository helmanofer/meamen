<template>
  <div class="bar-chart" :style="{ height: `${height}px` }">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  height: {
    type: Number,
    default: 300
  },
  options: {
    type: Object,
    default: () => ({})
  },
  horizontal: {
    type: Boolean,
    default: false
  }
})

defineEmits(['data-point-click'])

const chartCanvas = ref(null)
let chart = null

// Default colors
const defaultColors = [
  '#3B82F6', // Primary blue
  '#10B981', // Success green
  '#F59E0B', // Warning yellow
  '#EF4444', // Error red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
]

const createChart = async () => {
  if (!chartCanvas.value || !props.data.length) return

  // Dynamic import Chart.js
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  const ctx = chartCanvas.value.getContext('2d')

  // Destroy existing chart
  if (chart) {
    chart.destroy()
  }

  // Prepare data
  const chartData = prepareData()
  const chartOptions = prepareOptions()

  // Create new chart
  chart = new Chart(ctx, {
    type: props.horizontal ? 'bar' : 'bar',
    data: chartData,
    options: chartOptions
  })
}

const prepareData = () => {
  if (!props.data.length) return { labels: [], datasets: [] }

  // Handle different data formats
  if (props.data[0] && typeof props.data[0] === 'object' && 'datasets' in props.data[0]) {
    // Multiple datasets format
    return {
      labels: props.data[0].labels || [],
      datasets: props.data[0].datasets.map((dataset, index) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        data: dataset.data || [],
        backgroundColor: dataset.backgroundColor || generateBarColors(dataset.data?.length || 1, index),
        borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
        borderWidth: dataset.borderWidth || 1,
        borderRadius: dataset.borderRadius || 4,
        borderSkipped: false,
        ...dataset
      }))
    }
  } else if (props.data[0] && typeof props.data[0] === 'object' && 'label' in props.data[0]) {
    // Simple format: [{ label: string, value: number }, ...]
    return {
      labels: props.data.map(item => item.label || ''),
      datasets: [{
        label: 'Data',
        data: props.data.map(item => item.value || 0),
        backgroundColor: generateBarColors(props.data.length),
        borderColor: defaultColors[0],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    }
  } else {
    // Simple array format: [number, number, ...]
    return {
      labels: props.data.map((_, index) => `Item ${index + 1}`),
      datasets: [{
        label: 'Data',
        data: props.data,
        backgroundColor: generateBarColors(props.data.length),
        borderColor: defaultColors[0],
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false
      }]
    }
  }
}

const generateBarColors = (count, datasetIndex = 0) => {
  const baseColor = defaultColors[datasetIndex % defaultColors.length]
  const colors = []
  
  for (let i = 0; i < count; i++) {
    // Create gradient of the base color
    const opacity = 0.3 + (0.7 * (i / Math.max(count - 1, 1)))
    colors.push(`${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`)
  }
  
  return colors
}

const prepareOptions = () => {
  const isHorizontal = props.horizontal
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: isHorizontal ? 'y' : 'x',
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return context[0].label
          },
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed[isHorizontal ? 'x' : 'y']
            return `${label}: ${formatValue(value)}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: !isHorizontal,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          callback: function(value) {
            return isHorizontal ? formatValue(value) : this.getLabelForValue(value)
          }
        },
        beginAtZero: isHorizontal
      },
      y: {
        display: true,
        grid: {
          display: isHorizontal,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          callback: function(value) {
            return isHorizontal ? this.getLabelForValue(value) : formatValue(value)
          }
        },
        beginAtZero: !isHorizontal
      }
    },
    onHover: (event, activeElements) => {
      chartCanvas.value.style.cursor = activeElements.length > 0 ? 'pointer' : 'default'
    },
    onClick: (event, activeElements) => {
      if (activeElements.length > 0) {
        const datasetIndex = activeElements[0].datasetIndex
        const index = activeElements[0].index
        const dataPoint = {
          datasetIndex,
          index,
          value: chart.data.datasets[datasetIndex].data[index],
          label: chart.data.labels[index]
        }
        emit('data-point-click', dataPoint)
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    ...props.options
  }
}

const formatValue = (value) => {
  if (typeof value !== 'number') return value
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k'
  } else if (value % 1 !== 0) {
    return value.toFixed(2)
  }
  return value.toString()
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    createChart()
  })
})

watch(() => props.data, () => {
  createChart()
}, { deep: true })

watch(() => props.options, () => {
  createChart()
}, { deep: true })

watch(() => props.horizontal, () => {
  createChart()
})

// Cleanup
const { onBeforeUnmount } = await import('vue')
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.bar-chart {
  @apply relative w-full;
}

.bar-chart canvas {
  @apply w-full h-full;
}
</style>