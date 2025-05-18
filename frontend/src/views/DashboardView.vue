<template>
  <div>
    <div class="mb-6">
      <h1 class="text-display font-bold text-dark-gray">Welcome, Trainer</h1>
      <p class="text-medium-gray">Here's what's happening today</p>
    </div>

    <!-- Overview Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Trainees Card -->
      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">Total Trainees</p>
            <p class="text-h1 font-bold">12</p>
          </div>
        </div>
      </div>

      <!-- Sessions This Week Card -->
      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">Sessions This Week</p>
            <p class="text-h1 font-bold">8</p>
          </div>
        </div>
      </div>

      <!-- Unread Messages Card -->
      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">Unread Messages</p>
            <p class="text-h1 font-bold">3</p>
          </div>
        </div>
      </div>

      <!-- Pending Tasks Card -->
      <div class="card">
        <div class="flex items-center">
          <div class="rounded-full p-3 bg-light-blue text-primary-blue mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p class="text-medium-gray text-sm">Pending Tasks</p>
            <p class="text-h1 font-bold">5</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Today's Schedule -->
      <div class="lg:col-span-2">
        <div class="card mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-h2 font-semibold">Today's Schedule</h2>
            <button class="btn btn-secondary text-sm py-1">View Calendar</button>
          </div>
          <div class="space-y-4">
            <!-- Session Item -->
            <div class="flex items-center p-3 bg-light-gray rounded-md">
              <div class="w-12 h-12 rounded-full bg-primary-blue text-white flex items-center justify-center text-lg font-bold mr-4">
                8:00
              </div>
              <div class="flex-1">
                <p class="font-medium">Morning Strength Training</p>
                <p class="text-sm text-medium-gray">Client: Sarah Johnson</p>
              </div>
              <div class="flex space-x-2">
                <button class
="p-2 text-primary-blue hover:bg-light-blue rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="p-2 text-primary-blue hover:bg-light-blue rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0
 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center p-3
 bg-light-gray rounded-md">
              <div class="w-12 h-12 rounded-full bg-primary-blue text-white flex items-center justify-center text-lg font-bold mr-4">
                10:30
              </div>
              <div class="flex-1">
                <p class="font-medium">HIIT Workout</p>
                <p class="text-sm text-medium-
gray">Client: Michael Chen</p>
              </div>
              <div class="flex
 space-x-2">
                <button class="p-2 text-primary-blue hover:bg-light-blue rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="p-2 text-primary-blue hover:bg-light-blue rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="eveno
dd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center p-3 bg-light-gray rounded-md">
              <div class="w-12 h-12 rounded-full bg-primary-blue text-white flex items-center justify-center text-lg font-bold mr-4">
                2:00
              </div>
              <div class="flex-1">
                <p class="font-medium">Recovery & Stretching</p>
                <p class="text-sm text-medium-gray">Client: Emily Rodriguez</p>
              </div>
              <div class="flex space-x-2">
                <button class="p-2 text-primary-blue hover:bg-light-blue rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button class="p-2 text-primary-blue hover:bg-light-blue rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-h2 font-semibold">Recent Activity</h2>
            <button class="btn btn-secondary text-sm py-1">View All</button>
          </div>
          <div class="space-y-4">
            <div class="flex">
              <div class="w-10 h-10 rounded-full bg-primary-blue/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="font-medium">Michael Chen completed HIIT Workout</p>
                <p class="text-sm text-medium-gray">Today at 11:45 AM</p>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="font-medium">Emily Rodriguez reached her weight goal</p>
                <p class="text-sm text-medium-gray">Yesterday at 5:30 PM</p>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-10 h-10 rounded-full bg-primary-blue/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-blue" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="font-medium">Sarah Johnson viewed her workout plan</p>
                <p class="text-sm text-medium-gray">Yesterday at 2:15 PM</p>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <p class="font-medium">Alex Thompson reported knee discomfort</p>
                <p class="text-sm text-medium-gray">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="card">
          <h2 class="text-h2 font-semibold mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button class="btn btn-primary w-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Add New Trainee
            </button>
            <button class="btn btn-secondary w-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              Schedule Session
            </button>
            <button class="btn btn-secondary w-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              Create Workout
            </button>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="card">
          <h2 class="text-h2 font-semibold mb-4">Performance Metrics</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Session Completion Rate</span>
                <span class="text-sm font-medium">92%</span>
              </div>
              <div class="w-full bg-light-gray rounded-full h-2">
                <div class="bg-success h-2 rounded-full" style="width: 92%"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Trainee Satisfaction</span>
                <span class="text-sm font-medium">87%</span>
              </div>
              <div class="w-full bg-light-gray rounded-full h-2">
                <div class="bg-primary-blue h-2 rounded-full" style="width: 87%"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Goal Achievement</span>
                <span class="text-sm font-medium">75%</span>
              </div>
              <div class="w-full bg-light-gray rounded-full h-2">
                <div class="bg-warning h-2 rounded-full" style="width: 75%"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">Communication Response</span>
                <span class="text-sm font-medium">96%</span>
              </div>
              <div class="w-full bg-light-gray rounded-full h-2">
                <div class="bg-success h-2 rounded-full" style="width: 96%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Messages -->
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-h2 font-semibold">Recent Messages</h2>
            <button class="btn btn-secondary text-sm py-1">View All</button>
          </div>
          <div class="space-y-4">
            <div class="flex">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah" class="w-10 h-10 rounded-full mr-3">
              <div>
                <p class="font-medium">Sarah Johnson</p>
                <p class="text-sm text-medium-gray truncate">Thanks for the updated workout plan!</p>
                <p class="text-xs text-medium-gray">10 min ago</p>
              </div>
            </div>
            
            <div class="flex">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael" class="w-10 h-10 rounded-full mr-3">
              <div>
                <p class="font-medium">Michael Chen</p>
                <p class="text-sm text-medium-gray truncate">Can we reschedule tomorrow's session?</p>
                <p class="text-xs text-medium-gray">1 hour ago</p>
              </div>
            </div>
            
            <div class="flex">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Emily" class="w-10 h-10 rounded-full mr-3">
              <div>
                <p class="font-medium">Emily Rodriguez</p>
                <p class="text-sm text-medium-gray truncate">I've been feeling much better after...</p>
                <p class="text-xs text-medium-gray">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView'
}
</script>