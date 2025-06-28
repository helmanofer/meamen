<template>
  <div v-if="isActive" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="text-center text-white">
      <div class="text-6xl font-bold mb-4">{{ formattedTime }}</div>
      <div class="text-lg">Rest Timer</div>
      <div class="mt-8 space-x-4">
        <button @click="stop" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Skip
        </button>
        <button @click="addTime(15)" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          +15s
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'

export default {
  name: 'RestTimer',
  setup() {
    const isActive = ref(false)
    const duration = ref(0)
    const timer = ref(null)

    const formattedTime = computed(() => {
      const minutes = Math.floor(duration.value / 60)
      const seconds = duration.value % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })

    const start = (seconds) => {
      duration.value = seconds
      isActive.value = true
      timer.value = setInterval(() => {
        if (duration.value > 0) {
          duration.value--
        } else {
          stop()
        }
      }, 1000)
    }

    const stop = () => {
      isActive.value = false
      clearInterval(timer.value)
    }

    const addTime = (seconds) => {
      duration.value += seconds
    }

    onUnmounted(() => {
      clearInterval(timer.value)
    })

    return {
      isActive,
      formattedTime,
      start,
      stop,
      addTime,
    }
  },
}
</script>