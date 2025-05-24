<template>
  <div class="area-chart" :style="{ height: `${height}px` }">
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
  stacked: {
    type: Boolean,
    default: false
  }
})

defineEmits(['data-point-click'])

const chartCanvas = ref(null)
let chart = null

// Default colors with transparency for areas
const defaultColors = [
  { border: '#3B82F6', background: '#3B82F620' }, // Primary blue
  { border: '#10B981', background: '#10B98120' }, // Success green
  { border: '#F59E0B', background: '#F59E0B20' }, // Warning yellow
  { border: '#EF4444', background: '#EF444420' }, // Error red
  { border: '#8B5CF6', background: '#8B5CF620' }, // Purple
  { border: '#06B6D4', background: '#06B6D420' }, // Cyan
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
      datasets: props.data[0].datasets.map((dataset, index) => {
        const colorSet = defaultColors[index % defaultColors.length]
        return {
          label: dataset.label || `Dataset ${index + 1}`,
          data: dataset.data || [],
          borderColor: dataset.borderColor || colorSet.border,
          backgroundColor: dataset.backgroundColor || colorSet.background,
          borderWidth: dataset.borderWidth || 2,
          fill: dataset.fill !== undefined ? dataset.fill : (props.stacked ? 'origin' : 'start'),
          tension: dataset.tension || 0.4,
          pointRadius: dataset.pointRadius || 3,
          pointHoverRadius: dataset.pointHoverRadius || 5,
          pointBackgroundColor: dataset.pointBackgroundColor || colorSet.border,
          pointBorderColor: dataset.pointBorderColor || '#fff',
          pointBorderWidth: dataset.pointBorderWidth || 2,
          ...dataset
        }
      })
    }
  } else if (props.data[0] && typeof props.data[0] === 'object' && 'label' in props.data[0]) {
    // Simple format: [{ label: string, value: number }, ...]
    const colorSet = defaultColors[0]
    return {
      labels: props.data.map(item => item.label || ''),
      datasets: [{
        label: 'Data',
        data: props.data.map(item => item.value || 0),
        borderColor: colorSet.border,
        backgroundColor: colorSet.background,
        borderWidth: 2,
        fill: 'start',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: colorSet.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    }
  } else {
    // Simple array format: [number, number, ...]
    const colorSet = defaultColors[0]
    return {
      labels: props.data.map((_, index) => `Point ${index + 1}`),
      datasets: [{
        label: 'Data',
        data: props.data,
        borderColor: colorSet.border,
        backgroundColor: colorSet.background,
        borderWidth: 2,
        fill: 'start',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: colorSet.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
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
          },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets
            return datasets.map((dataset, index) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 2,
              pointStyle: 'circle',
              datasetIndex: index
            }))
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
        position: 'nearest',
        callbacks: {
          title: (context) => {
            return context[0].label
          },
          label: (context) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${formatValue(value)}`
          },
          beforeBody: (context) => {
            if (props.stacked && context.length > 1) {
              const total = context.reduce((sum, item) => sum + item.parsed.y, 0)
              return `Total: ${formatValue(total)}`
            }
          }
        }
      },
      filler: {
        propagate: true
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
        stacked: props.stacked,
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
        },
        beginAtZero: true
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: 'white',
        hoverBorderWidth: 3
      },
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round'
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
      duration: 1000,
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

watch(() => props.stacked, () => {
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
.area-chart {
  @apply relative w-full;
}

.area-chart canvas {
  @apply w-full h-full;
}
</style>