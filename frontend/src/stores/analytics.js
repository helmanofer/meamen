import { defineStore } from 'pinia'
import { useSessionsStore } from './sessions'
import { useTraineesStore } from './trainees'
import { useWorkoutSessionsStore } from './workoutSessions'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    loading: false,
    error: null,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    selectedMetrics: [
      'sessions_completed',
      'client_progress',
      'revenue',
      'attendance_rate'
    ],
    customReports: [],
    exportFormats: ['pdf', 'csv', 'xlsx'],
    clientMetrics: {},
    businessMetrics: {},
    performanceMetrics: {}
  }),

  getters: {
    // Session Analytics
    totalSessions: () => {
      const sessionsStore = useSessionsStore()
      return sessionsStore.sessions.length
    },

    completedSessions: () => {
      const sessionsStore = useSessionsStore()
      return sessionsStore.sessions.filter(s => s.status === 'completed').length
    },

    cancelledSessions: () => {
      const sessionsStore = useSessionsStore()
      return sessionsStore.sessions.filter(s => s.status === 'cancelled').length
    },

    attendanceRate: (state) => {
      const total = state.totalSessions
      const completed = state.completedSessions
      return total > 0 ? Math.round((completed / total) * 100) : 0
    },

    // Client Analytics
    totalClients: () => {
      const traineesStore = useTraineesStore()
      return traineesStore.trainees.length
    },

    activeClients: (state) => {
      const traineesStore = useTraineesStore()
      const sessionsStore = useSessionsStore()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const activeClientIds = new Set(
        sessionsStore.sessions
          .filter(s => new Date(s.scheduled_at) > thirtyDaysAgo)
          .map(s => s.trainee_id)
      )
      
      return activeClientIds.size
    },

    newClientsThisMonth: (state) => {
      const traineesStore = useTraineesStore()
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      return traineesStore.trainees.filter(t => 
        new Date(t.created_at || Date.now()) >= startOfMonth
      ).length
    },

    // Revenue Analytics (mock data for now)
    monthlyRevenue: (state) => {
      const sessionsStore = useSessionsStore()
      const completedSessions = sessionsStore.sessions.filter(s => s.status === 'completed')
      const avgSessionPrice = 75 // Mock price per session
      
      return completedSessions.length * avgSessionPrice
    },

    projectedMonthlyRevenue: (state) => {
      const currentDay = new Date().getDate()
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
      const dailyAverage = state.monthlyRevenue / currentDay
      
      return Math.round(dailyAverage * daysInMonth)
    },

    // Performance Analytics
    sessionsPerWeek: () => {
      const sessionsStore = useSessionsStore()
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      return sessionsStore.sessions.filter(s => 
        new Date(s.scheduled_at) > weekAgo
      ).length
    },

    avgSessionDuration: () => {
      const sessionsStore = useSessionsStore()
      const sessions = sessionsStore.sessions.filter(s => s.duration)
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)
      
      return sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0
    },

    // Trend Data
    sessionTrends: (state) => {
      const sessionsStore = useSessionsStore()
      const last30Days = []
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayCompletedSessions = sessionsStore.sessions.filter(s => {
          const sessionDate = new Date(s.scheduled_at).toISOString().split('T')[0]
          return sessionDate === dateStr && s.status === 'completed'
        }).length
        
        last30Days.push({
          date: dateStr,
          completed: dayCompletedSessions,
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })
      }
      
      return last30Days
    },

    clientProgressData: (state) => {
      const traineesStore = useTraineesStore()
      
      return traineesStore.trainees.map(trainee => ({
        id: trainee.id,
        name: trainee.name,
        sessionsCompleted: state.getClientSessionCount(trainee.id),
        progressPercentage: state.calculateClientProgress(trainee.id),
        lastSession: state.getLastSessionDate(trainee.id),
        goalsAchieved: state.getGoalsAchieved(trainee.id)
      }))
    },

    weeklyRevenueData: (state) => {
      const weeks = []
      const avgSessionPrice = 75
      
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7))
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        const sessionsStore = useSessionsStore()
        const weekSessions = sessionsStore.sessions.filter(s => {
          const sessionDate = new Date(s.scheduled_at)
          return sessionDate >= weekStart && sessionDate <= weekEnd && s.status === 'completed'
        }).length
        
        weeks.push({
          week: `Week ${8 - i}`,
          revenue: weekSessions * avgSessionPrice,
          sessions: weekSessions,
          startDate: weekStart.toISOString().split('T')[0]
        })
      }
      
      return weeks
    },

    topPerformingClients: (state) => {
      return state.clientProgressData
        .sort((a, b) => b.sessionsCompleted - a.sessionsCompleted)
        .slice(0, 5)
    },

    // Time-based Analytics
    peakHours: () => {
      const sessionsStore = useSessionsStore()
      const hourCounts = {}
      
      sessionsStore.sessions.forEach(session => {
        const hour = new Date(session.scheduled_at).getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })
      
      return Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
          label: new Date().setHours(hour, 0, 0, 0)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    },

    busyDays: () => {
      const sessionsStore = useSessionsStore()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayCounts = {}
      
      sessionsStore.sessions.forEach(session => {
        const day = new Date(session.scheduled_at).getDay()
        dayCounts[day] = (dayCounts[day] || 0) + 1
      })
      
      return Object.entries(dayCounts)
        .map(([day, count]) => ({
          day: parseInt(day),
          name: dayNames[day],
          count
        }))
        .sort((a, b) => b.count - a.count)
    }
  },

  actions: {
    // Data fetching
    async fetchAnalyticsData() {
      this.loading = true
      this.error = null
      
      try {
        // In a real app, this would fetch from multiple endpoints
        // For now, we'll calculate from existing store data
        await this.calculateClientMetrics()
        await this.calculateBusinessMetrics()
        await this.calculatePerformanceMetrics()
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        this.error = 'Failed to load analytics data'
      } finally {
        this.loading = false
      }
    },

    async calculateClientMetrics() {
      const traineesStore = useTraineesStore()
      const metrics = {}
      
      traineesStore.trainees.forEach(trainee => {
        metrics[trainee.id] = {
          totalSessions: this.getClientSessionCount(trainee.id),
          completedSessions: this.getClientCompletedSessions(trainee.id),
          progressPercentage: this.calculateClientProgress(trainee.id),
          averageRating: this.getClientAverageRating(trainee.id),
          lastSessionDate: this.getLastSessionDate(trainee.id),
          goalsAchieved: this.getGoalsAchieved(trainee.id)
        }
      })
      
      this.clientMetrics = metrics
    },

    async calculateBusinessMetrics() {
      this.businessMetrics = {
        totalRevenue: this.monthlyRevenue,
        projectedRevenue: this.projectedMonthlyRevenue,
        averageSessionPrice: 75, // Mock data
        clientRetentionRate: 85, // Mock data
        newClientAcquisition: this.newClientsThisMonth,
        sessionUtilization: this.attendanceRate
      }
    },

    async calculatePerformanceMetrics() {
      this.performanceMetrics = {
        averageSessionDuration: this.avgSessionDuration,
        sessionsPerWeek: this.sessionsPerWeek,
        peakOperatingHours: this.peakHours,
        mostPopularDay: this.busyDays[0]?.name || 'Monday',
        clientSatisfactionScore: 4.6 // Mock data
      }
    },

    // Helper methods for calculations
    getClientSessionCount(clientId) {
      const sessionsStore = useSessionsStore()
      return sessionsStore.sessions.filter(s => s.trainee_id === clientId).length
    },

    getClientCompletedSessions(clientId) {
      const sessionsStore = useSessionsStore()
      return sessionsStore.sessions.filter(s => 
        s.trainee_id === clientId && s.status === 'completed'
      ).length
    },

    calculateClientProgress(clientId) {
      // Mock calculation - in real app would use actual fitness metrics
      const completed = this.getClientCompletedSessions(clientId)
      const total = this.getClientSessionCount(clientId)
      
      if (total === 0) return 0
      
      // Base progress on completion rate with some randomness for demo
      const baseProgress = (completed / total) * 60
      const bonusProgress = Math.random() * 40
      
      return Math.min(100, Math.round(baseProgress + bonusProgress))
    },

    getClientAverageRating(clientId) {
      // Mock data - in real app would calculate from session feedback
      return Math.round((Math.random() * 2 + 3) * 10) / 10 // 3.0 to 5.0
    },

    getLastSessionDate(clientId) {
      const sessionsStore = useSessionsStore()
      const clientSessions = sessionsStore.sessions
        .filter(s => s.trainee_id === clientId)
        .sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at))
      
      return clientSessions.length > 0 ? clientSessions[0].scheduled_at : null
    },

    getGoalsAchieved(clientId) {
      // Mock data - in real app would track actual fitness goals
      const completed = this.getClientCompletedSessions(clientId)
      return Math.min(completed, Math.floor(Math.random() * 5) + 1)
    },

    // Date range management
    setDateRange(start, end) {
      this.dateRange = { start: new Date(start), end: new Date(end) }
      this.fetchAnalyticsData()
    },

    setPresetDateRange(preset) {
      const end = new Date()
      let start = new Date()
      
      switch (preset) {
        case 'week':
          start.setDate(end.getDate() - 7)
          break
        case 'month':
          start.setDate(end.getDate() - 30)
          break
        case 'quarter':
          start.setDate(end.getDate() - 90)
          break
        case 'year':
          start.setFullYear(end.getFullYear() - 1)
          break
        default:
          start.setDate(end.getDate() - 30)
      }
      
      this.setDateRange(start, end)
    },

    // Report generation
    async generateReport(type, format = 'pdf') {
      this.loading = true
      
      try {
        const reportData = await this.compileReportData(type)
        
        // In a real app, this would call a backend service to generate the report
        console.log(`Generating ${type} report in ${format} format`, reportData)
        
        // Mock successful generation
        return {
          success: true,
          downloadUrl: `/reports/${type}_${Date.now()}.${format}`,
          filename: `${type}_report_${new Date().toISOString().split('T')[0]}.${format}`
        }
      } catch (error) {
        console.error('Error generating report:', error)
        this.error = 'Failed to generate report'
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async compileReportData(type) {
      switch (type) {
        case 'client_progress':
          return {
            type: 'Client Progress Report',
            dateRange: this.dateRange,
            data: this.clientProgressData,
            summary: {
              totalClients: this.totalClients,
              activeClients: this.activeClients,
              averageProgress: Math.round(
                this.clientProgressData.reduce((sum, c) => sum + c.progressPercentage, 0) / 
                this.clientProgressData.length
              )
            }
          }
        
        case 'business_performance':
          return {
            type: 'Business Performance Report',
            dateRange: this.dateRange,
            data: {
              revenue: this.businessMetrics,
              sessions: {
                total: this.totalSessions,
                completed: this.completedSessions,
                attendance: this.attendanceRate
              },
              clients: {
                total: this.totalClients,
                active: this.activeClients,
                new: this.newClientsThisMonth
              }
            }
          }
        
        case 'session_analytics':
          return {
            type: 'Session Analytics Report',
            dateRange: this.dateRange,
            data: {
              trends: this.sessionTrends,
              peakHours: this.peakHours,
              busyDays: this.busyDays,
              performance: this.performanceMetrics
            }
          }
        
        default:
          throw new Error(`Unknown report type: ${type}`)
      }
    },

    // Utility methods
    clearError() {
      this.error = null
    },

    exportData(format = 'csv') {
      // Mock export functionality
      const data = {
        sessions: this.sessionTrends,
        clients: this.clientProgressData,
        revenue: this.weeklyRevenueData
      }
      
      console.log(`Exporting data in ${format} format:`, data)
      
      // In a real app, this would trigger a download
      return data
    }
  }
})