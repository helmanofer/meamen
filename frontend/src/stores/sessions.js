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
        const response = await api.get('/training_sessions/')
        this.sessions = response.data || []
      } catch (error) {
        console.error('Error fetching sessions:', error)
        this.error = 'Failed to load sessions'
        this.sessions = this.getMockSessions()
      } finally {
        this.loading = false
      }
    },

    async fetchSessionTemplates() {
      this.loading = true
      this.error = null
      try {
        // TODO: Replace with actual API call when templates endpoint exists
        this.sessionTemplates = this.getMockTemplates()
      } catch (error) {
        console.error('Error fetching session templates:', error)
        this.error = 'Failed to load session templates'
        this.sessionTemplates = this.getMockTemplates()
      } finally {
        this.loading = false
      }
    },

    async createSession(sessionData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/training_sessions/', sessionData)
        this.sessions.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating session:', error)
        this.error = 'Failed to create session'
        
        // Mock creation for development
        const mockSession = {
          id: Date.now(),
          ...sessionData,
          created_at: new Date().toISOString(),
          status: 'scheduled'
        }
        this.sessions.push(mockSession)
        return mockSession
      } finally {
        this.loading = false
      }
    },

    async updateSession(sessionId, sessionData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`/training_sessions/${sessionId}`, sessionData)
        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = response.data
        }
        return response.data
      } catch (error) {
        console.error('Error updating session:', error)
        this.error = 'Failed to update session'
        
        // Mock update for development
        const index = this.sessions.findIndex(s => s.id === sessionId)
        if (index !== -1) {
          this.sessions[index] = { ...this.sessions[index], ...sessionData }
        }
      } finally {
        this.loading = false
      }
    },

    async deleteSession(sessionId) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/training_sessions/${sessionId}`)
        this.sessions = this.sessions.filter(s => s.id !== sessionId)
      } catch (error) {
        console.error('Error deleting session:', error)
        this.error = 'Failed to delete session'
        
        // Mock deletion for development
        this.sessions = this.sessions.filter(s => s.id !== sessionId)
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
    },

    // Mock data methods for development
    getMockSessions() {
      const now = new Date()
      return [
        {
          id: 1,
          trainee_id: 1,
          trainee_name: 'Sarah Johnson',
          title: 'Morning Strength Training',
          description: 'Upper body focus with compound movements',
          scheduled_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          duration: 60,
          status: 'scheduled',
          location: 'Gym - Area A',
          notes: 'Focus on form and progressive overload'
        },
        {
          id: 2,
          trainee_id: 2,
          trainee_name: 'Michael Chen',
          title: 'HIIT Cardio Session',
          description: 'High-intensity interval training',
          scheduled_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration: 45,
          status: 'scheduled',
          location: 'Gym - Cardio Zone',
          notes: 'Monitor heart rate zones'
        },
        {
          id: 3,
          trainee_id: 3,
          trainee_name: 'Emily Rodriguez',
          title: 'Recovery & Mobility',
          description: 'Stretching and foam rolling session',
          scheduled_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
          duration: 30,
          status: 'scheduled',
          location: 'Studio B',
          notes: 'Focus on tight hip flexors'
        }
      ]
    },

    getMockTemplates() {
      return [
        {
          id: 1,
          name: 'Strength Training - Upper Body',
          description: 'Comprehensive upper body workout focusing on compound movements',
          duration: 60,
          exercises: [
            { name: 'Bench Press', sets: 3, reps: '8-10', rest: 90 },
            { name: 'Pull-ups', sets: 3, reps: '6-8', rest: 90 },
            { name: 'Overhead Press', sets: 3, reps: '8-10', rest: 90 },
            { name: 'Rows', sets: 3, reps: '10-12', rest: 60 }
          ]
        },
        {
          id: 2,
          name: 'HIIT Cardio',
          description: 'High-intensity interval training for cardiovascular fitness',
          duration: 45,
          exercises: [
            { name: 'Burpees', sets: 4, reps: '30s work / 30s rest', rest: 0 },
            { name: 'Mountain Climbers', sets: 4, reps: '30s work / 30s rest', rest: 0 },
            { name: 'Jump Squats', sets: 4, reps: '30s work / 30s rest', rest: 0 },
            { name: 'High Knees', sets: 4, reps: '30s work / 30s rest', rest: 0 }
          ]
        },
        {
          id: 3,
          name: 'Lower Body Strength',
          description: 'Leg day focused on building strength and power',
          duration: 75,
          exercises: [
            { name: 'Squats', sets: 4, reps: '6-8', rest: 120 },
            { name: 'Deadlifts', sets: 4, reps: '5-6', rest: 120 },
            { name: 'Lunges', sets: 3, reps: '10 each leg', rest: 90 },
            { name: 'Calf Raises', sets: 3, reps: '15-20', rest: 60 }
          ]
        }
      ]
    }
  }
})