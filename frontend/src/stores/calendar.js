import { defineStore } from 'pinia'
import { useSessionsStore } from './sessions'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    currentView: 'month', // 'month', 'week', 'day'
    currentDate: new Date(),
    selectedDate: null,
    showWeekends: true,
    workingHours: {
      start: 6, // 6 AM
      end: 22, // 10 PM
    },
    timeSlotDuration: 30, // minutes
    availability: {}, // { 'YYYY-MM-DD': { blocked: true, hours: [] } }
    draggedSession: null,
    viewPreferences: {
      showCompletedSessions: true,
      showCancelledSessions: false,
      compactView: false,
    },
    loading: false,
    error: null
  }),

  getters: {
    // Get sessions for current view period
    currentViewSessions: (state) => {
      const sessionsStore = useSessionsStore()
      const sessions = sessionsStore.sessions
      
      const start = state.getViewStartDate()
      const end = state.getViewEndDate()
      
      return sessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at)
        return sessionDate >= start && sessionDate <= end
      })
    },

    // Get sessions for a specific date
    getSessionsForDate: (state) => (date) => {
      const sessionsStore = useSessionsStore()
      const dateStr = date.toDateString()
      
      return sessionsStore.sessions.filter(session => {
        return new Date(session.scheduled_at).toDateString() === dateStr
      })
    },

    // Get sessions for a specific time slot
    getSessionsForTimeSlot: (state) => (date, hour, minute = 0) => {
      const sessionsStore = useSessionsStore()
      
      return sessionsStore.sessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at)
        return sessionDate.toDateString() === date.toDateString() &&
               sessionDate.getHours() === hour &&
               sessionDate.getMinutes() === minute
      })
    },

    // Get availability for a specific date
    getAvailabilityForDate: (state) => (date) => {
      const dateStr = date.toISOString().split('T')[0]
      return state.availability[dateStr] || { blocked: false, hours: [] }
    },

    // Check if a time slot is available
    isTimeSlotAvailable: (state) => (date, hour, minute = 0, duration = 60) => {
      const availability = state.getAvailabilityForDate(date)
      
      // Check if day is blocked
      if (availability.blocked) return false
      
      // Check working hours
      if (hour < state.workingHours.start || hour >= state.workingHours.end) return false
      
      // Check for existing sessions
      const sessionsStore = useSessionsStore()
      const conflictingSessions = sessionsStore.sessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at)
        const sessionEnd = new Date(sessionDate.getTime() + session.duration * 60000)
        const slotStart = new Date(date)
        slotStart.setHours(hour, minute, 0, 0)
        const slotEnd = new Date(slotStart.getTime() + duration * 60000)
        
        return sessionDate.toDateString() === date.toDateString() &&
               ((slotStart >= sessionDate && slotStart < sessionEnd) ||
                (slotEnd > sessionDate && slotEnd <= sessionEnd) ||
                (slotStart <= sessionDate && slotEnd >= sessionEnd))
      })
      
      return conflictingSessions.length === 0
    },

    // Get time slots for a day
    getTimeSlotsForDay: (state) => (date) => {
      const slots = []
      const startHour = state.workingHours.start
      const endHour = state.workingHours.end
      const slotDuration = state.timeSlotDuration
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const slotTime = new Date(date)
          slotTime.setHours(hour, minute, 0, 0)
          
          slots.push({
            time: slotTime,
            available: state.isTimeSlotAvailable(date, hour, minute, slotDuration),
            sessions: state.getSessionsForTimeSlot(date, hour, minute)
          })
        }
      }
      
      return slots
    },

    // Calculate view date range
    getViewStartDate: (state) => () => {
      const date = new Date(state.currentDate)
      
      switch (state.currentView) {
        case 'month':
          date.setDate(1)
          date.setDate(date.getDate() - date.getDay()) // Start of week containing first day
          break
        case 'week':
          date.setDate(date.getDate() - date.getDay()) // Start of current week
          break
        case 'day':
          // Keep current date
          break
      }
      
      date.setHours(0, 0, 0, 0)
      return date
    },

    getViewEndDate: (state) => () => {
      const start = state.getViewStartDate()
      const end = new Date(start)
      
      switch (state.currentView) {
        case 'month':
          end.setDate(end.getDate() + 42) // 6 weeks
          break
        case 'week':
          end.setDate(end.getDate() + 7)
          break
        case 'day':
          end.setDate(end.getDate() + 1)
          break
      }
      
      return end
    },

    // Get calendar grid for current view
    getCalendarGrid: (state) => {
      const start = state.getViewStartDate()
      const end = state.getViewEndDate()
      const days = []
      const currentDate = new Date(start)
      
      while (currentDate < end) {
        days.push({
          date: new Date(currentDate),
          isCurrentMonth: state.currentView === 'month' ? 
            currentDate.getMonth() === state.currentDate.getMonth() : true,
          isToday: currentDate.toDateString() === new Date().toDateString(),
          isSelected: state.selectedDate && 
            currentDate.toDateString() === state.selectedDate.toDateString(),
          sessions: state.getSessionsForDate(currentDate),
          availability: state.getAvailabilityForDate(currentDate)
        })
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      return days
    }
  },

  actions: {
    // Navigation actions
    goToToday() {
      this.currentDate = new Date()
    },

    goToPrevious() {
      const date = new Date(this.currentDate)
      
      switch (this.currentView) {
        case 'month':
          date.setMonth(date.getMonth() - 1)
          break
        case 'week':
          date.setDate(date.getDate() - 7)
          break
        case 'day':
          date.setDate(date.getDate() - 1)
          break
      }
      
      this.currentDate = date
    },

    goToNext() {
      const date = new Date(this.currentDate)
      
      switch (this.currentView) {
        case 'month':
          date.setMonth(date.getMonth() + 1)
          break
        case 'week':
          date.setDate(date.getDate() + 7)
          break
        case 'day':
          date.setDate(date.getDate() + 1)
          break
      }
      
      this.currentDate = date
    },

    goToDate(date) {
      this.currentDate = new Date(date)
    },

    // View management
    setView(view) {
      this.currentView = view
    },

    setSelectedDate(date) {
      this.selectedDate = date ? new Date(date) : null
    },

    // Availability management
    async setDayAvailability(date, availability) {
      const dateStr = date.toISOString().split('T')[0]
      this.availability[dateStr] = availability
      
      // TODO: Save to backend
      try {
        // await api.post('/availability', { date: dateStr, ...availability })
      } catch (error) {
        console.error('Error saving availability:', error)
        this.error = 'Failed to save availability'
      }
    },

    async blockDay(date) {
      await this.setDayAvailability(date, { blocked: true, hours: [] })
    },

    async unblockDay(date) {
      await this.setDayAvailability(date, { blocked: false, hours: [] })
    },

    // Session drag and drop
    startDragSession(session) {
      this.draggedSession = session
    },

    async dropSession(targetDate, targetHour, targetMinute = 0) {
      if (!this.draggedSession) return false
      
      const newDateTime = new Date(targetDate)
      newDateTime.setHours(targetHour, targetMinute, 0, 0)
      
      // Check if target slot is available
      if (!this.isTimeSlotAvailable(targetDate, targetHour, targetMinute, this.draggedSession.duration)) {
        this.error = 'Time slot not available'
        this.draggedSession = null
        return false
      }
      
      try {
        const sessionsStore = useSessionsStore()
        await sessionsStore.updateSession(this.draggedSession.id, {
          scheduled_at: newDateTime.toISOString()
        })
        
        this.draggedSession = null
        return true
      } catch (error) {
        console.error('Error moving session:', error)
        this.error = 'Failed to move session'
        this.draggedSession = null
        return false
      }
    },

    cancelDrag() {
      this.draggedSession = null
    },

    // Preferences
    updateViewPreferences(preferences) {
      this.viewPreferences = { ...this.viewPreferences, ...preferences }
      
      // Save to localStorage
      localStorage.setItem('calendar-preferences', JSON.stringify(this.viewPreferences))
    },

    loadViewPreferences() {
      const saved = localStorage.getItem('calendar-preferences')
      if (saved) {
        this.viewPreferences = { ...this.viewPreferences, ...JSON.parse(saved) }
      }
    },

    // Working hours
    setWorkingHours(start, end) {
      this.workingHours = { start, end }
      
      // Save to localStorage
      localStorage.setItem('working-hours', JSON.stringify(this.workingHours))
    },

    loadWorkingHours() {
      const saved = localStorage.getItem('working-hours')
      if (saved) {
        this.workingHours = JSON.parse(saved)
      }
    },

    // Utility
    clearError() {
      this.error = null
    },

    // Initialize calendar
    async initialize() {
      this.loadViewPreferences()
      this.loadWorkingHours()
      
      // Load availability data
      try {
        // TODO: Load from backend
        // const response = await api.get('/availability')
        // this.availability = response.data
      } catch (error) {
        console.error('Error loading availability:', error)
      }
    }
  }
})