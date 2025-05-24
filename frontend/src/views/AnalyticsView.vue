<template>
  <div class="analytics-view min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 class="text-display font-bold text-dark-gray">Analytics & Reports</h1>
        <p class="text-medium-gray">Track performance, progress, and business insights</p>
      </div>
      
      <div class="flex items-center space-x-3 mt-4 sm:mt-0">
        <!-- Date Range Selector -->
        <select
          v-model="selectedPeriod"
          @change="updateDateRange"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="quarter">Last 3 months</option>
          <option value="year">Last year</option>
        </select>
        
        <!-- Export Button -->
        <div class="relative">
          <button
            @click="showExportMenu = !showExportMenu"
            class="btn btn-secondary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Export Report
          </button>
          
          <!-- Export Menu -->
          <div v-if="showExportMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <div class="py-1">
              <button
                v-for="format in exportFormats"
                :key="format.value"
                @click="exportReport(format.value)"
                class="w-full text-left px-4 py-2 text-sm text-dark-gray hover:bg-light-gray flex items-center"
              >
                <component :is="format.icon" class="h-4 w-4 mr-2" />
                {{ format.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="analyticsStore.loading" class="flex items-center justify-center h-64">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
      <span class="ml-2 text-medium-gray">Loading analytics...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="analyticsStore.error" class="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-error font-medium">{{ analyticsStore.error }}</span>
      </div>
      <button
        @click="analyticsStore.clearError(); refreshData()"
        class="mt-2 text-sm text-error hover:text-error/80"
      >
        Try again
      </button>
    </div>

    <!-- Analytics Content -->
    <div v-else class="space-y-6">
      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sessions"
          :value="analyticsStore.totalSessions"
          icon="calendar"
          color="blue"
          :trend="{ direction: 'up', percentage: 12, period: 'vs last month' }"
          :chart-data="sessionTrendData"
          @action="viewSessionDetails"
        />
        
        <MetricCard
          title="Active Clients"
          :value="analyticsStore.activeClients"
          icon="user-group"
          color="green"
          :trend="{ direction: 'up', percentage: 8, period: 'vs last month' }"
          :progress="{ current: analyticsStore.activeClients, target: analyticsStore.totalClients, label: 'Client Activation' }"
          @action="viewClientDetails"
        />
        
        <MetricCard
          title="Monthly Revenue"
          :value="analyticsStore.monthlyRevenue"
          format="currency"
          icon="currency-dollar"
          color="purple"
          :trend="{ direction: 'up', percentage: 15, period: 'vs last month' }"
          :chart-data="revenueData"
          subtitle="Projected: $8,400"
          @action="viewRevenueDetails"
        />
        
        <MetricCard
          title="Attendance Rate"
          :value="analyticsStore.attendanceRate"
          format="percentage"
          icon="check-circle"
          color="green"
          :trend="{ direction: 'up', percentage: 3, period: 'vs last month' }"
          :progress="{ current: analyticsStore.attendanceRate, target: 100, label: 'Attendance Goal' }"
          @action="viewAttendanceDetails"
        />
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Session Trends Chart -->
        <ChartContainer
          title="Session Trends"
          subtitle="Daily completed sessions over time"
          :data="sessionTrendsChart"
          type="area"
          :height="350"
          @period-change="updateSessionTrendsPeriod"
          @export="exportChart('session-trends')"
        />
        
        <!-- Revenue Chart -->
        <ChartContainer
          title="Revenue Analysis"
          subtitle="Weekly revenue and session count"
          :data="revenueChart"
          type="bar"
          :height="350"
          :show-type-selector="true"
          @type-change="updateRevenueChartType"
          @export="exportChart('revenue')"
        />
      </div>

      <!-- Client Progress Section -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Client Progress Chart -->
        <div class="xl:col-span-2">
          <ChartContainer
            title="Client Progress Overview"
            subtitle="Individual client progress and performance"
            :data="clientProgressChart"
            type="bar"
            :height="400"
            horizontal
            :show-stats="true"
            :stats="clientProgressStats"
            @data-point-click="viewClientProgress"
            @export="exportChart('client-progress')"
          />
        </div>
        
        <!-- Top Performers -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-dark-gray">Top Performing Clients</h3>
            <button
              @click="viewAllClients"
              class="text-sm text-primary-blue hover:text-primary-blue/80"
            >
              View All
            </button>
          </div>
          
          <div class="space-y-4">
            <div
              v-for="(client, index) in topClients"
              :key="client.id"
              class="flex items-center justify-between p-3 bg-light-gray rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              @click="viewClientDetails(client)"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center text-sm font-medium">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium text-dark-gray">{{ client.name }}</p>
                  <p class="text-xs text-medium-gray">{{ client.sessionsCompleted }} sessions</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-success">{{ client.progressPercentage }}%</p>
                <p class="text-xs text-medium-gray">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Insights -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Peak Hours Analysis -->
        <div class="card">
          <h3 class="text-lg font-semibold text-dark-gray mb-4">Peak Operating Hours</h3>
          <div class="space-y-3">
            <div
              v-for="hour in peakHours"
              :key="hour.hour"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-dark-gray">
                  {{ formatHour(hour.hour) }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-24 bg-light-gray rounded-full h-2">
                  <div
                    class="bg-primary-blue h-2 rounded-full"
                    :style="{ width: `${(hour.count / maxHourCount) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm text-medium-gray w-8 text-right">{{ hour.count }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Business Insights -->
        <div class="card">
          <h3 class="text-lg font-semibold text-dark-gray mb-4">Business Insights</h3>
          <div class="space-y-4">
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 rounded-full bg-success mt-2"></div>
              <div>
                <p class="text-sm font-medium text-dark-gray">High Client Retention</p>
                <p class="text-xs text-medium-gray">85% of clients are actively booking sessions</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 rounded-full bg-warning mt-2"></div>
              <div>
                <p class="text-sm font-medium text-dark-gray">Peak Hour Optimization</p>
                <p class="text-xs text-medium-gray">Consider adding more slots during 6-8 PM</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 rounded-full bg-primary-blue mt-2"></div>
              <div>
                <p class="text-sm font-medium text-dark-gray">Revenue Growth</p>
                <p class="text-xs text-medium-gray">On track for 15% monthly growth target</p>
              </div>
            </div>
            
            <div class="pt-3 border-t border-gray-100">
              <button
                @click="generateInsightReport"
                class="btn btn-primary w-full text-sm"
              >
                Generate Detailed Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'
import MetricCard from '@/components/analytics/MetricCard.vue'
import ChartContainer from '@/components/analytics/ChartContainer.vue'
import { DocumentArrowDownIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

const analyticsStore = useAnalyticsStore()

// Component state
const selectedPeriod = ref('month')
const showExportMenu = ref(false)

// Export formats
const exportFormats = [
  { value: 'pdf', label: 'PDF Report', icon: DocumentTextIcon },
  { value: 'csv', label: 'CSV Data', icon: TableCellsIcon },
  { value: 'xlsx', label: 'Excel File', icon: DocumentArrowDownIcon }
]

// Computed properties
const sessionTrendData = computed(() => {
  return analyticsStore.sessionTrends.slice(-7).map(day => day.completed)
})

const revenueData = computed(() => {
  return analyticsStore.weeklyRevenueData.slice(-4).map(week => week.revenue)
})

const sessionTrendsChart = computed(() => {
  return {
    labels: analyticsStore.sessionTrends.map(day => day.label),
    datasets: [{
      label: 'Completed Sessions',
      data: analyticsStore.sessionTrends.map(day => day.completed),
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F620'
    }]
  }
})

const revenueChart = computed(() => {
  return {
    labels: analyticsStore.weeklyRevenueData.map(week => week.week),
    datasets: [
      {
        label: 'Revenue ($)',
        data: analyticsStore.weeklyRevenueData.map(week => week.revenue),
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
        yAxisID: 'y'
      },
      {
        label: 'Sessions',
        data: analyticsStore.weeklyRevenueData.map(week => week.sessions),
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        yAxisID: 'y1'
      }
    ]
  }
})

const clientProgressChart = computed(() => {
  const topClients = analyticsStore.topPerformingClients
  return {
    labels: topClients.map(client => client.name),
    datasets: [{
      label: 'Sessions Completed',
      data: topClients.map(client => client.sessionsCompleted),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    }]
  }
})

const clientProgressStats = computed(() => {
  const data = analyticsStore.clientProgressData
  const avgProgress = data.reduce((sum, c) => sum + c.progressPercentage, 0) / data.length
  const avgSessions = data.reduce((sum, c) => sum + c.sessionsCompleted, 0) / data.length
  
  return [
    { label: 'Avg Progress', value: `${Math.round(avgProgress)}%` },
    { label: 'Avg Sessions', value: Math.round(avgSessions) },
    { label: 'Active Clients', value: analyticsStore.activeClients },
    { label: 'Total Clients', value: analyticsStore.totalClients }
  ]
})

const topClients = computed(() => analyticsStore.topPerformingClients)

const peakHours = computed(() => analyticsStore.peakHours)

const maxHourCount = computed(() => {
  return Math.max(...peakHours.value.map(h => h.count))
})

// Methods
const updateDateRange = () => {
  analyticsStore.setPresetDateRange(selectedPeriod.value)
}

const refreshData = async () => {
  await analyticsStore.fetchAnalyticsData()
}

const exportReport = async (format) => {
  showExportMenu.value = false
  
  try {
    const result = await analyticsStore.generateReport('business_performance', format)
    if (result.success) {
      // In a real app, this would trigger a download
      console.log(`Report exported: ${result.filename}`)
      // You could show a success toast here
    }
  } catch (error) {
    console.error('Export failed:', error)
  }
}

const exportChart = (chartType) => {
  console.log(`Exporting ${chartType} chart`)
  // Implementation for chart export
}

const formatHour = (hour) => {
  const time = new Date()
  time.setHours(hour, 0, 0, 0)
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true
  })
}

// Event handlers
const viewSessionDetails = () => {
  console.log('Navigate to session details')
  // router.push('/sessions')
}

const viewClientDetails = (client) => {
  console.log('Navigate to client details:', client)
  // router.push(`/trainees/${client.id}`)
}

const viewRevenueDetails = () => {
  console.log('Navigate to revenue details')
  // Open revenue breakdown modal
}

const viewAttendanceDetails = () => {
  console.log('Navigate to attendance details')
  // Open attendance analysis modal
}

const viewClientProgress = (dataPoint) => {
  console.log('View client progress:', dataPoint)
  // Open client progress modal
}

const viewAllClients = () => {
  console.log('Navigate to all clients')
  // router.push('/trainees')
}

const updateSessionTrendsPeriod = (period) => {
  console.log('Update session trends period:', period)
  // Update chart data based on period
}

const updateRevenueChartType = (type) => {
  console.log('Update revenue chart type:', type)
  // Update chart type
}

const generateInsightReport = async () => {
  try {
    const result = await analyticsStore.generateReport('session_analytics', 'pdf')
    if (result.success) {
      console.log('Insight report generated:', result.filename)
    }
  } catch (error) {
    console.error('Failed to generate insight report:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await refreshData()
})

// Close export menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.relative')) {
    showExportMenu.value = false
  }
})

// Watch for period changes
watch(selectedPeriod, () => {
  updateDateRange()
})
</script>

<style scoped>
.analytics-view {
  @apply p-6;
}

/* Custom animations for metric cards */
.metric-card {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .analytics-view {
    @apply p-4;
  }
}
</style>