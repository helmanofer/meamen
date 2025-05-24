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
  getTrainees(trainerId, params = {}) {
    return axios.get("/trainees/", { 
      params: { trainer_id: trainerId, ...params } 
    });
  },
  getTrainee(id, trainerId) {
    return axios.get(`/trainees/${id}`, {
      params: { trainer_id: trainerId }
    });
  },
  createTrainee(traineeData, trainerId) {
    return axios.post("/trainees/", traineeData, {
      params: { trainer_id: trainerId }
    });
  },
  updateTrainee(id, traineeData, trainerId) {
    return axios.put(`/trainees/${id}`, traineeData, {
      params: { trainer_id: trainerId }
    });
  },
  deleteTrainee(id, trainerId) {
    return axios.delete(`/trainees/${id}`, {
      params: { trainer_id: trainerId }
    });
  },

  // Measurements and progress photos
  addTraineeMeasurement(traineeId, measurementData, trainerId) {
    return axios.post(`/trainees/${traineeId}/measurements`, measurementData, {
      params: { trainer_id: trainerId }
    });
  },
  addTraineeProgressPhoto(traineeId, photoData, trainerId) {
    return axios.post(`/trainees/${traineeId}/photos`, photoData, {
      params: { trainer_id: trainerId }
    });
  },

  // Program assignment endpoints
  assignProgramToTrainee(traineeId, programId, trainerId) {
    return axios.post(`/trainees/${traineeId}/assign-program`, 
      { program_id: programId }, 
      { params: { trainer_id: trainerId } }
    );
  },
  unassignProgramFromTrainee(traineeId, programId, trainerId) {
    return axios.delete(`/trainees/${traineeId}/unassign-program/${programId}`, {
      params: { trainer_id: trainerId }
    });
  },
  getTraineePrograms(traineeId, trainerId) {
    return axios.get(`/trainees/${traineeId}/programs`, {
      params: { trainer_id: trainerId }
    });
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

  // Session templates endpoints
  getSessionTemplates(params) {
    return axios.get("/session-templates/", { params });
  },
  getSessionTemplate(id) {
    return axios.get(`/session-templates/${id}`);
  },
  createSessionTemplate(templateData) {
    return axios.post("/session-templates/", templateData);
  },
  updateSessionTemplate(id, templateData) {
    return axios.put(`/session-templates/${id}`, templateData);
  },
  deleteSessionTemplate(id) {
    return axios.delete(`/session-templates/${id}`);
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
