<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="statusClasses"
  >
    <svg
      v-if="showIcon"
      class="w-3 h-3 mr-1"
      :class="iconClasses"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path :d="iconPath" />
    </svg>
    {{ statusText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

const statusConfig = {
  scheduled: {
    text: 'Scheduled',
    classes: 'bg-primary-blue/10 text-primary-blue border border-primary-blue/20',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
  },
  completed: {
    text: 'Completed',
    classes: 'bg-success/10 text-success border border-success/20',
    iconPath: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
  },
  cancelled: {
    text: 'Cancelled',
    classes: 'bg-error/10 text-error border border-error/20',
    iconPath: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
  },
  pending: {
    text: 'Pending',
    classes: 'bg-warning/10 text-warning border border-warning/20',
    iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
  },
  in_progress: {
    text: 'In Progress',
    classes: 'bg-info/10 text-info border border-info/20',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
  },
  missed: {
    text: 'Missed',
    classes: 'bg-gray-100 text-gray-600 border border-gray-200',
    iconPath: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
  }
}

const currentStatus = computed(() => {
  return statusConfig[props.status] || statusConfig.pending
})

const statusText = computed(() => currentStatus.value.text)
const statusClasses = computed(() => currentStatus.value.classes)
const iconPath = computed(() => currentStatus.value.iconPath)
const iconClasses = computed(() => {
  // Icon color should match text color
  return ''
})
</script>