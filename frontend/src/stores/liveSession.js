import { defineStore } from 'pinia'
import api from '@/services/api'
import websocket from '@/services/websocket'

export const useLiveSessionStore = defineStore('liveSession', {
  state: () => ({
    activeSessions: [],
    currentSession: null,
    currentTraineeIndex: 0,
    loading: false,
    error: null,
    sessionTimer: null,
    isRecording: false,
    autoSaveInterval: null,
    lastSaved: null,
    // Exercise recording state
    exerciseRecords: [],
    currentExerciseIndex: 0,
    exerciseLoading: false,
    previousPerformance: []
  }),

  getters: {
    currentTrainee: (state) => {
      if (!state.currentSession || !state.currentSession.trainees) return null
      return state.currentSession.trainees[state.currentTraineeIndex]
    },

    sessionDuration: (state) => {
      if (!state.currentSession?.start_time) return 0
      const startTime = new Date(state.currentSession.start_time)
      const now = new Date()
      return Math.floor((now - startTime) / 1000) // Duration in seconds
    },

    canSwitchTrainee: (state) => {
      return state.currentSession && state.currentSession.trainees && state.currentSession.trainees.length > 1
    },

    hasActiveSessions: (state) => {
      return state.activeSessions.length > 0
    },

    sessionStatus: (state) => {
      return state.currentSession?.status || 'inactive'
    },

    currentExercise: (state) => {
      const currentTrainee = state.currentSession?.trainees[state.currentTraineeIndex]
      if (!currentTrainee) return null
      
      const traineeRecords = state.exerciseRecords.filter(r => r.trainee_id === currentTrainee.id)
      return traineeRecords[state.currentExerciseIndex] || null
    },

    currentTraineeExerciseRecords: (state) => {
      const currentTrainee = state.currentSession?.trainees[state.currentTraineeIndex]
      if (!currentTrainee) return []
      
      return state.exerciseRecords.filter(r => r.trainee_id === currentTrainee.id)
    }
  },

  actions: {
    async fetchActiveSessions() {
      this.loading = true
      this.error = null
      try {
        const response = await api.getActiveSessions()
        this.activeSessions = response.data || []
      } catch (error) {
        console.error('Error fetching active sessions:', error)
        this.error = 'Failed to load active sessions'
        this.activeSessions = []
      } finally {
        this.loading = false
      }
    },

    async startSession(sessionData) {
      this.loading = true
      this.error = null
      try {
        const response = await api.startTrainingSession(sessionData)
        const sessionRecord = response.data
        
        this.activeSessions.push(sessionRecord)
        this.currentSession = sessionRecord
        this.currentTraineeIndex = 0
        this.startTimer()
        this.startAutoSave()
        websocket.connect(sessionRecord.id)
        
        return sessionRecord
      } catch (error) {
        console.error('Error starting session:', error)
        this.error = 'Failed to start session'
        return null
      } finally {
        this.loading = false
      }
    },

    async pauseCurrentSession() {
      if (!this.currentSession) return
      
      this.loading = true
      this.error = null
      try {
        const response = await api.pauseSession(this.currentSession.id)
        this.currentSession.status = 'paused'
        this.stopTimer()
        return response.data
      } catch (error) {
        console.error('Error pausing session:', error)
        this.error = 'Failed to pause session'
        return null
      } finally {
        this.loading = false
      }
    },

    async resumeCurrentSession() {
      if (!this.currentSession) return
      
      this.loading = true
      this.error = null
      try {
        const response = await api.resumeSession(this.currentSession.id)
        this.currentSession.status = 'active'
        this.startTimer()
        return response.data
      } catch (error) {
        console.error('Error resuming session:', error)
        this.error = 'Failed to resume session'
        return null
      } finally {
        this.loading = false
      }
    },

    async completeCurrentSession() {
      if (!this.currentSession) return
      
      this.loading = true
      this.error = null
      try {
        const response = await api.completeSession(this.currentSession.id)
        this.currentSession.status = 'completed'
        this.currentSession.end_time = new Date().toISOString()
        this.stopTimer()
        this.stopAutoSave()
        this.activeSessions = this.activeSessions.filter(s => s.id !== this.currentSession.id)
        this.currentSession = null
        this.currentTraineeIndex = 0
        return response.data
      } catch (error) {
        console.error('Error completing session:', error)
        this.error = 'Failed to complete session'
        return null
      } finally {
        this.loading = false
      }
    },

    async updateSessionNotes(notes) {
      if (!this.currentSession) return
      
      try {
        const response = await api.updateSessionRecord(this.currentSession.id, {
          trainer_notes: notes
        })
        this.currentSession.trainer_notes = notes
        this.lastSaved = new Date()
        return response.data
      } catch (error) {
        console.error('Error updating session notes:', error)
        this.error = 'Failed to update notes'
        return null
      }
    },

    switchToTrainee(index) {
      if (!this.currentSession || !this.currentSession.trainees) return
      if (index >= 0 && index < this.currentSession.trainees.length) {
        this.currentTraineeIndex = index
      }
    },

    switchToNextTrainee() {
      if (!this.currentSession || !this.currentSession.trainees) return
      const nextIndex = (this.currentTraineeIndex + 1) % this.currentSession.trainees.length
      this.switchToTrainee(nextIndex)
    },

    switchToPreviousTrainee() {
      if (!this.currentSession || !this.currentSession.trainees) return
      const prevIndex = this.currentTraineeIndex === 0 
        ? this.currentSession.trainees.length - 1 
        : this.currentTraineeIndex - 1
      this.switchToTrainee(prevIndex)
    },

    startTimer() {
      if (this.sessionTimer) return
      
      this.sessionTimer = setInterval(() => {
        // Timer is handled by the getter sessionDuration
        // This just ensures the UI updates every second
      }, 1000)
    },

    stopTimer() {
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer)
        this.sessionTimer = null
      }
    },

    startAutoSave() {
      if (this.autoSaveInterval) return
      
      this.autoSaveInterval = setInterval(async () => {
        if (this.currentSession && this.isRecording) {
          try {
            await this.autoSaveSession()
          } catch (error) {
            console.warn('Auto-save failed:', error)
          }
        }
      }, 30000) // Auto-save every 30 seconds

      websocket.addListener((message) => {
        console.log('Received message:', message)
      })
    },

    stopAutoSave() {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval)
        this.autoSaveInterval = null
      }
    },

    async autoSaveSession() {
      if (!this.currentSession) return
      
      try {
        await api.updateSessionRecord(this.currentSession.id, {
          session_metadata: {
            ...this.currentSession.session_metadata,
            last_auto_save: new Date().toISOString(),
            current_trainee_index: this.currentTraineeIndex
          }
        })
        this.lastSaved = new Date()
      } catch (error) {
        console.warn('Auto-save failed:', error)
      }
    },

    clearError() {
      this.error = null
    },

    reset() {
      this.activeSessions = []
      this.currentSession = null
      this.currentTraineeIndex = 0
      this.isRecording = false
      this.stopTimer()
      this.stopAutoSave()
      this.lastSaved = null
      this.clearError()
    },

    getSessionName(selection, traineesStore) {
      if (!selection || selection.type === 'freestyle') {
        return 'Freestyle Session'
      }
      
      // For now, return a generic name based on type and ID
      // In a real implementation, you'd fetch the actual names from the stores
      switch (selection.type) {
        case 'program':
          return `Program #${selection.id}`
        case 'session':
          return `Session #${selection.id}`
        case 'template':
          return `Template #${selection.id}`
        default:
          return 'Unknown Session'
      }
    },

    // Exercise Recording Actions
    async fetchExerciseRecords() {
      if (!this.currentSession) return
      
      this.exerciseLoading = true
      this.error = null
      try {
        const response = await api.getExerciseRecordsBySession(this.currentSession.id)
        this.exerciseRecords = response.data || []
      } catch (error) {
        console.error('Error fetching exercise records:', error)
        this.error = 'Failed to load exercise records'
        this.exerciseRecords = []
      } finally {
        this.exerciseLoading = false
      }
    },

    async createExerciseRecord(exerciseRecordData) {
      this.exerciseLoading = true
      this.error = null
      try {
        const response = await api.createExerciseRecord(exerciseRecordData)
        this.exerciseRecords.push(response.data)
        return response.data
      } catch (error) {
        console.error('Error creating exercise record:', error)
        this.error = 'Failed to create exercise record'
        return null
      } finally {
        this.exerciseLoading = false
      }
    },

    async recordSet(exerciseRecordId, setData) {
      this.exerciseLoading = true
      this.error = null
      try {
        const response = await api.recordSet(exerciseRecordId, setData)
        
        // Update the exercise record in our state
        const index = this.exerciseRecords.findIndex(r => r.id === exerciseRecordId)
        if (index !== -1) {
          this.exerciseRecords[index] = response.data
        }
        
        return response.data
      } catch (error) {
        console.error('Error recording set:', error)
        this.error = 'Failed to record set'
        return null
      } finally {
        this.exerciseLoading = false
      }
    },

    async updateExerciseRecord(exerciseRecordId, updateData) {
      this.exerciseLoading = true
      this.error = null
      try {
        const response = await api.updateExerciseRecord(exerciseRecordId, updateData)
        
        // Update the exercise record in our state
        const index = this.exerciseRecords.findIndex(r => r.id === exerciseRecordId)
        if (index !== -1) {
          this.exerciseRecords[index] = response.data
        }
        
        return response.data
      } catch (error) {
        console.error('Error updating exercise record:', error)
        this.error = 'Failed to update exercise record'
        return null
      } finally {
        this.exerciseLoading = false
      }
    },

    async completeExercise(exerciseRecordId) {
      this.exerciseLoading = true
      this.error = null
      try {
        const response = await api.completeExercise(exerciseRecordId)
        
        // Update the exercise record in our state
        const index = this.exerciseRecords.findIndex(r => r.id === exerciseRecordId)
        if (index !== -1) {
          this.exerciseRecords[index] = response.data
        }
        
        return response.data
      } catch (error) {
        console.error('Error completing exercise:', error)
        this.error = 'Failed to complete exercise'
        return null
      } finally {
        this.exerciseLoading = false
      }
    },

    async skipExercise(exerciseRecordId) {
      this.exerciseLoading = true
      this.error = null
      try {
        const response = await api.skipExercise(exerciseRecordId)
        
        // Update the exercise record in our state
        const index = this.exerciseRecords.findIndex(r => r.id === exerciseRecordId)
        if (index !== -1) {
          this.exerciseRecords[index] = response.data
        }
        
        return response.data
      } catch (error) {
        console.error('Error skipping exercise:', error)
        this.error = 'Failed to skip exercise'
        return null
      } finally {
        this.exerciseLoading = false
      }
    },

    async fetchPreviousPerformance(traineeId, exerciseId) {
      try {
        const response = await api.getPreviousPerformance(traineeId, exerciseId, 5)
        this.previousPerformance = response.data || []
        return response.data
      } catch (error) {
        console.error('Error fetching previous performance:', error)
        this.previousPerformance = []
        return []
      }
    },

    switchToExercise(index) {
      const currentTraineeRecords = this.currentTraineeExerciseRecords
      if (index >= 0 && index < currentTraineeRecords.length) {
        this.currentExerciseIndex = index
      }
    },

    switchToNextExercise() {
      const currentTraineeRecords = this.currentTraineeExerciseRecords
      const nextIndex = (this.currentExerciseIndex + 1) % currentTraineeRecords.length
      this.switchToExercise(nextIndex)
    },

    switchToPreviousExercise() {
      const currentTraineeRecords = this.currentTraineeExerciseRecords
      const prevIndex = this.currentExerciseIndex === 0 
        ? currentTraineeRecords.length - 1 
        : this.currentExerciseIndex - 1
      this.switchToExercise(prevIndex)
    }
  }
})