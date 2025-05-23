<template>
  <div>
    <div class="mb-6">
      <h1 class="text-display font-bold text-dark-gray">
        Messages
      </h1>
      <p class="text-medium-gray">
        Chat with your trainees and manage communications
      </p>
    </div>

    <div class="bg-white rounded-lg shadow-sm flex h-[calc(100vh-12rem)]">
      <!-- Conversations List -->
      <div class="w-1/3 border-r">
        <!-- Search -->
        <div class="p-4 border-b">
          <div class="relative">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              class="form-input pl-10" 
            >
            <div class="absolute left-3 top-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-medium-gray"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Conversations -->
        <div class="overflow-y-auto h-[calc(100%-73px)]">
          <div 
            v-for="i in 10" 
            :key="i" 
            :class="[
              'p-4 border-b hover:bg-light-gray cursor-pointer',
              i === 1 ? 'bg-light-gray' : ''
            ]"
          >
            <div class="flex items-center">
              <img
                :src="`https://randomuser.me/api/portraits/${i % 2 ? 'men' : 'women'}/${i + 30}.jpg`"
                :alt="`Contact ${i}`"
                class="w-12 h-12 rounded-full object-cover"
              >
              <div class="ml-4 flex-1">
                <div class="flex justify-between items-start">
                  <h3 class="font-medium">
                    John Smith
                  </h3>
                  <span class="text-xs text-medium-gray">10:30 AM</span>
                </div>
                <p class="text-sm text-medium-gray truncate">
                  Hey, how did the morning session go?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Chat Header -->
        <div class="p-4 border-b flex justify-between items-center">
          <div class="flex items-center">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Contact"
              class="w-10 h-10 rounded-full object-cover"
            >
            <div class="ml-3">
              <h3 class="font-medium">
                John Smith
              </h3>
              <p class="text-xs text-medium-gray">
                Last active 5m ago
              </p>
            </div>
          </div>
          <button class="text-medium-gray hover:text-dark-gray">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Received Message -->
          <div class="flex items-end">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Contact"
              class="w-8 h-8 rounded-full object-cover"
            >
            <div class="ml-2 max-w-[75%]">
              <div class="bg-light-gray rounded-lg p-3">
                <p>Hey, how did the morning session go?</p>
              </div>
              <p class="text-xs text-medium-gray mt-1">
                10:30 AM
              </p>
            </div>
          </div>

          <!-- Sent Message -->
          <div class="flex items-end justify-end">
            <div class="mr-2 max-w-[75%]">
              <div class="bg-primary-blue text-white rounded-lg p-3">
                <p>Great! Sarah completed all her sets and we increased the weights on bench press.</p>
              </div>
              <p class="text-xs text-medium-gray mt-1 text-right">
                10:32 AM
              </p>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t">
          <div class="flex space-x-4">
            <button class="text-medium-gray hover:text-dark-gray">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Type your message..." 
              class="flex-1 form-input" 
            >
            <button class="text-primary-blue hover:text-dark-blue">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessagesView'
}
</script>