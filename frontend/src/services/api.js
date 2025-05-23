import axios from "axios";

// We don't create a custom axios instance here anymore
// because we're using the global axios configuration set up in apiSetup.js

// This service wraps axios calls with proper resource paths and error handling

export default {
  // Auth endpoints
  login(credentials) {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');
    
    return axios.post("/auth/jwt/login", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  register(userData) {
    return axios.post("/auth/register", userData);
  },
  forgotPassword(email) {
    return axios.post("/auth/request-password-reset", { email });
  },
  resetPassword(token, newPassword) {
    return axios.post("/auth/reset-password", { token, password: newPassword });
  },
  getUserProfile() {
    return axios.get("/users/me");
  },

  // Trainee endpoints
  getTrainees(params) {
    return axios.get("/trainees/", { params });
  },
  getTrainee(id) {
    return axios.get(`/trainees/${id}`);
  },
  createTrainee(traineeData, trainerId) {
    return axios.post("/trainees/", traineeData, {
      params: { trainer_id: trainerId }
    });
  },
  updateTrainee(id, traineeData) {
    return axios.put(`/trainees/${id}`, traineeData);
  },
  deleteTrainee(id) {
    return axios.delete(`/trainees/${id}`);
  },

  // Measurements
  getTraineeMeasurements(traineeId, params) {
    return axios.get(`/trainees/${traineeId}/measurements`, { params });
  },
  addTraineeMeasurement(traineeId, measurementData) {
    return axios.post(`/trainees/${traineeId}/measurements`, measurementData);
  },

  // Exercise endpoints
  getExercises(params) {
    return axios.get("/exercises/", { params });
  },
  getExercise(id) {
    return axios.get(`/exercises/${id}`);
  },
  createExercise(exerciseData) {
    return axios.post("/exercises/", exerciseData);
  },
  updateExercise(id, exerciseData) {
    return axios.put(`/exercises/${id}`, exerciseData);
  },
  deleteExercise(id) {
    return axios.delete(`/exercises/${id}`);
  },

  // Training programs endpoints
  getPrograms(params) {
    return axios.get("/programs", { params });
  },
  getProgram(id) {
    return axios.get(`/programs/${id}`);
  },
  createProgram(programData) {
    return axios.post("/programs", programData);
  },
  updateProgram(id, programData) {
    return axios.put(`/programs/${id}`, programData);
  },
  deleteProgram(id) {
    return axios.delete(`/programs/${id}`);
  },

  // Training sessions endpoints
  getSessions(params) {
    return axios.get("/training-sessions", { params });
  },
  getSession(id) {
    return axios.get(`/training-sessions/${id}`);
  },
  createSession(sessionData) {
    return axios.post("/training-sessions", sessionData);
  },
  updateSession(id, sessionData) {
    return axios.put(`/training-sessions/${id}`, sessionData);
  },
  deleteSession(id) {
    return axios.delete(`/training-sessions/${id}`);
  },

  // Session records endpoints
  getSessionRecords(params) {
    return axios.get("/session-records", { params });
  },
  getSessionRecord(id) {
    return axios.get(`/session-records/${id}`);
  },
  createSessionRecord(recordData) {
    return axios.post("/session-records", recordData);
  },
  updateSessionRecord(id, recordData) {
    return axios.put(`/session-records/${id}`, recordData);
  },

  // Messages endpoints
  getMessages(params) {
    return axios.get("/messages", { params });
  },
  sendMessage(messageData) {
    return axios.post("/messages", messageData);
  },
  markMessageRead(id) {
    return axios.patch(`/messages/${id}/read`);
  },

  // Notifications endpoints
  getNotifications() {
    return axios.get("/notifications");
  },
  markNotificationRead(id) {
    return axios.patch(`/notifications/${id}/read`);
  },

  // System endpoints
  healthCheck() {
    return axios.get('/');
  }
};
