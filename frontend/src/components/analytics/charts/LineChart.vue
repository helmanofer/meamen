<template>
  <div class="line-chart" :style="{ height: `${height}px` }">
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

  // Dynamic import Chart.js to reduce bundle size
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
    type: 'line',
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
        borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
        backgroundColor: dataset.backgroundColor || `${defaultColors[index % defaultColors.length]}20`,
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill !== undefined ? dataset.fill : false,
        tension: dataset.tension || 0.4,
        pointRadius: dataset.pointRadius || 4,
        pointHoverRadius: dataset.pointHoverRadius || 6,
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
        borderColor: defaultColors[0],
        backgroundColor: `${defaultColors[0]}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    }
  } else {
    // Simple array format: [number, number, ...]
    return {
      labels: props.data.map((_, index) => `Point ${index + 1}`),
      datasets: [{
        label: 'Data',
        data: props.data,
        borderColor: defaultColors[0],
        backgroundColor: `${defaultColors[0]}20`,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    }
  }
}

const prepareOptions = () => {
  return {
    responsive: true,
    maintainAspectRatio: false,
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
            const value = context.parsed.y
            return `${label}: ${formatValue(value)}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          callback: function(value) {
            return formatValue(value)
          }
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: 'white',
        hoverBorderWidth: 2
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

// Cleanup
const { onBeforeUnmount } = await import('vue')
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.line-chart {
  @apply relative w-full;
}

.line-chart canvas {
  @apply w-full h-full;
}
</style>