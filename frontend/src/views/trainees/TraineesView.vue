<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-display font-bold text-dark-gray">Trainees</h1>
        <p class="text-medium-gray">Manage your trainees and their progress</p>
      </div>
      <button class="btn btn-primary flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        Add New Trainee
      </button>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="relative">
          <input 
            type="text" 
            placeholder="Search trainees..." 
            class="form-input pl-10" 
          />
          <div class="absolute left-3 top-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-medium-gray" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Status Filter -->
        <select class="form-input">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>

        <!-- Program Filter -->
        <select class="form-input">
          <option value="">All Programs</option>
          <option value="strength">Strength Training</option>
          <option value="cardio">Cardio</option>
          <option value="hiit">HIIT</option>
        </select>

        <!-- Sort -->
        <select class="form-input">
          <option value="name">Sort by Name</option>
          <option value="recent">Most Recent</option>
          <option value="progress">Progress</option>
        </select>
      </div>
    </div>

    <!-- Trainee Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Trainee Card -->
      <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-4">
          <div class="flex items-center">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Trainee" class="w-16 h-16 rounded-full object-cover" />
            <div class="ml-4">
              <h3 class="font-semibold">John Smith</h3>
              <p class="text-sm text-medium-gray">Strength Training</p>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-success mt-1">
                Active
              </span>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-sm text-medium-gray">Sessions</p>
              <p class="font-semibold">24/30</p>
            </div>
            <div>
              <p class="text-sm text-medium-gray">Progress</p>
              <p class="font-semibold">80%</p>
            </div>
          </div>

          <div class="mt-4">
            <div class="w-full bg-light-gray rounded-full h-2">
              <div class="bg-success h-2 rounded-full" style="width: 80%"></div>
            </div>
          </div>
        </div>

        <div class="border-t px-4 py-3 bg-light-gray">
          <div class="flex justify-between">
            <button class="text-sm text-primary-blue hover:text-dark-blue flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              View Profile
            </button>
            <button class="text-sm text-primary-blue hover:text-dark-blue flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              </svg>
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TraineesView'
}
</script>