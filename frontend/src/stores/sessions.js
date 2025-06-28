import { defineStore } from 'pinia'
import api from '@/services/api'

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    sessions: [],
    sessionTemplates: [],
    loading: false,
    error: null,
    currentWeek: new Date(),
    selectedSession: null
  }),

  getters: {
    upcomingSessions: (state) => {
      const now = new Date()
      return state.sessions
        .filter(session => new Date(session.scheduled_at) > now)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    },

    todaysSessions: (state) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      return state.sessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at)
        return sessionDate >= today && sessionDate < tomorrow
      })
    },

    sessionsByDate: (state) => {
      const grouped = {}
      state.sessions.forEach(session => {
        const date = new Date(session.scheduled_at).toDateString()
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(session)
      })
      return grouped
    },

    weekSessions: (state) => {
      const startOfWeek = new Date(state.currentWeek)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 7)

      return state.sessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at)
        return sessionDate >= startOfWeek && sessionDate < endOfWeek
      })
    }
  },

  actions: {
    async fetchSessions() {
      this.loading = true
      this.error = null
      try {
        const response = await api.getSessions()
        this.sessions = response.data || []
      } catch (error) {
        console.error('Error fetching sessions:', error)
        this.error = 'Failed to load sessions'
        this.sessions = []
      } finally {
        this.loading = false
      }
    },

    async fetchSessionTemplates() {
      this.loading = true
      this.error = null
      try {
        const response = await api.getSessionTemplates()
        this.sessionTemplates = response.data || []
      } catch (error) {
        console.error('Error fetching session templates:', error)
        this.error = 'Failed to load session templates'
        this.sessionTemplates = []
      } finally {
        this.loading = false
      }
    },

    async createSession(sessionData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.createSession(sessionData)
        this.sessions.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating session:', error)
        this.error = 'Failed to create session'
        return null
      } finally {
        this.loading = false
      }
    },

    async updateSession(sessionId, sessionData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.updateSession(sessionId, sessionData)
        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating session:', error)
        this.error = 'Failed to update session'
        return null
      } finally {
        this.loading = false
      }
    },

    async deleteSession(sessionId) {
      this.loading = true
      this.error = null
      try {
        await api.deleteSession(sessionId)
        this.sessions = this.sessions.filter(s => s.id !== sessionId)
        return true
      } catch (error) {
        console.error('Error deleting session:', error)
        this.error = 'Failed to delete session'
        return false
      } finally {
        this.loading = false
      }
    },

    setCurrentWeek(date) {
      this.currentWeek = new Date(date)
    },

    setSelectedSession(session) {
      this.selectedSession = session
    },

    clearError() {
      this.error = null
    }
  }
})