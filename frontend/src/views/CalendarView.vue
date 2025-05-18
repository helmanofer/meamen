<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-display font-bold text-dark-gray">Calendar</h1>
        <p class="text-medium-gray">
          Schedule and manage your training sessions
        </p>
      </div>
      <button class="btn btn-primary flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clip-rule="evenodd"
          />
        </svg>
        Schedule Session
      </button>
    </div>

    <!-- Calendar Controls -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex space-x-4">
          <button class="btn btn-secondary">Today</button>
          <div class="flex">
            <button class="btn btn-secondary rounded-r-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button class="btn btn-secondary rounded-l-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <h2 class="text-h2 font-semibold py-2">December 2023</h2>
        </div>
        <div class="flex space-x-2">
          <button class="btn btn-secondary">Month</button>
          <button class="btn btn-secondary">Week</button>
          <button class="btn btn-secondary">Day</button>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Days of Week -->
      <div class="grid grid-cols-7 border-b">
        <div
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="day"
          class="py-2 text-center text-sm font-medium text-medium-gray"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7">
        <div
          v-for="i in 35"
          :key="i"
          class="min-h-[120px] border-b border-r p-2"
        >
          <div class="flex justify-between items-start">
            <span
              :class="[
                'text-sm',
                i === 15
                  ? 'w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center'
                  : '',
              ]"
            >
              {{ ((i - 3 + 31) % 31) + 1 }}
            </span>
            <span v-if="i === 15" class="text-xs text-success">Today</span>
          </div>

          <!-- Example Events -->
          <div v-if="i === 15" class="mt-2 space-y-1">
            <div
              class="text-xs bg-primary-blue/20 text-primary-blue rounded p-1"
            >
              9:00 AM - John Smith
            </div>
            <div class="text-xs bg-success/20 text-success rounded p-1">
              2:00 PM - Sarah Johnson
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalendarView",
};
</script>
