import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default {
  // Auth endpoints
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },
  register(userData) {
    return apiClient.post('/auth/register', userData)
  },
  forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email })
  },
  resetPassword(token, newPassword) {
    return apiClient.post('/auth/reset-password', { token, password: newPassword })
  },
  getUserProfile() {
    return apiClient.get('/auth/profile')
  },
  
  // Trainee endpoints
  getTrainees(params) {
    return apiClient.get('/trainees', { params })
  },
  getTrainee(id) {
    return apiClient.get(`/trainees/${id}`)
  },
  createTrainee(traineeData) {
    return apiClient.post('/trainees', traineeData)
  },
  updateTrainee(id, traineeData) {
    return apiClient.put(`/trainees/${id}`, traineeData)
  },
  deleteTrainee(id) {
    return apiClient.delete(`/trainees/${id}`)
  },
  
  // Measurements
  getTraineeMeasurements(traineeId, params) {
    return apiClient.get(`/trainees/${traineeId}/measurements`, { params })
  },
  addTraineeMeasurement(traineeId, measurementData) {
    return apiClient.post(`/trainees/${traineeId}/measurements`, measurementData)
  },
  
  // Exercise endpoints
  getExercises(params) {
    return apiClient.get('/exercises', { params })
  },
  getExercise(id) {
    return apiClient.get(`/exercises/${id}`)
  },
  createExercise(exerciseData) {
    return apiClient.post('/exercises', exerciseData)
  },
  updateExercise(id, exerciseData) {
    return apiClient.put(`/exercises/${id}`, exerciseData)
  },
  deleteExercise(id) {
    return apiClient.delete(`/exercises/${id}`)
  },
  
  // Training programs endpoints
  getPrograms(params) {
    return apiClient.get('/programs', { params })
  },
  getProgram(id) {
    return apiClient.get(`/programs/${id}`)
  },
  createProgram(programData) {
    return apiClient.post('/programs', programData)
  },
  updateProgram(id, programData) {
    return apiClient.put(`/programs/${id}`, programData)
  },
  deleteProgram(id) {
    return apiClient.delete(`/programs/${id}`)
  },
  
  // Training sessions endpoints
  getSessions(params) {
    return apiClient.get('/sessions', { params })
  },
  getSession(id) {
    return apiClient.get(`/sessions/${id}`)
  },
  createSession(sessionData) {
    return apiClient.post('/sessions', sessionData)
  },
  updateSession(id, sessionData) {
    return apiClient.put(`/sessions/${id}`, sessionData)
  },
  deleteSession(id) {
    return apiClient.delete(`/sessions/${id}`)
  },
  
  // Session records endpoints
  getSessionRecords(params) {
    return apiClient.get('/session-records', { params })
  },
  getSessionRecord(id) {
    return apiClient.get(`/session-records/${id}`)
  },
  createSessionRecord(recordData) {
    return apiClient.post('/session-records', recordData)
  },
  updateSessionRecord(id, recordData) {
    return apiClient.put(`/session-records/${id}`, recordData)
  },
  
  // Messages endpoints
  getMessages(params) {
    return apiClient.get('/messages', { params })
  },
  sendMessage(messageData) {
    return apiClient.post('/messages', messageData)
  },
  markMessageRead(id) {
    return apiClient.patch(`/messages/${id}/read`)
  },
  
  // Notifications endpoints
  getNotifications() {
    return apiClient.get('/notifications')
  },
  markNotificationRead(id) {
    return apiClient.patch(`/notifications/${id}/read`)
  }
}