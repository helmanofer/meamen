const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ id: string; name: string; email: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () =>
    request<{ id: string; name: string; email: string; role: string }>('/auth/me'),

  // Trainees
  getTrainees: () =>
    request<Array<{ id: string; name: string; email: string }>>('/trainees'),
  addTrainee: (data: { name: string; email: string; password: string }) =>
    request('/trainees', { method: 'POST', body: JSON.stringify(data) }),
  updateTrainee: (id: string, data: { name?: string; email?: string }) =>
    request<{ id: string; name: string; email: string }>(`/trainees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeTrainee: (id: string) =>
    request(`/trainees/${id}`, { method: 'DELETE' }),

  // Sessions
  getSessions: (traineeId?: string) =>
    request<Array<{
      id: string; name: string; order: number;
      trainee: { id: string; name: string };
      exercises: Array<{ id: string; name: string; sets: number; reps: number | null; weight: number | null; duration: number | null; youtubeUrl: string | null; order: number; notes: string | null }>;
    }>>(`/sessions${traineeId ? `?traineeId=${traineeId}` : ''}`),
  getSession: (id: string) =>
    request<{
      id: string; name: string; order: number;
      trainee: { id: string; name: string };
      exercises: Array<{
        id: string; name: string; sets: number; reps: number | null; weight: number | null; duration: number | null; youtubeUrl: string | null; order: number; notes: string | null;
        logs: Array<{ id: string; setsCompleted: number | null; repsCompleted: number | null; weightUsed: number | null; completedAt: string; notes: string | null }>;
      }>;
    }>(`/sessions/${id}`),
  createSession: (data: { name: string; traineeId: string; order?: number }) =>
    request('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  updateSession: (id: string, data: { name?: string; order?: number }) =>
    request(`/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSession: (id: string) =>
    request(`/sessions/${id}`, { method: 'DELETE' }),

  // Exercises
  addExercise: (sessionId: string, data: { name: string; sets?: number; reps?: number; weight?: number; duration?: number; youtubeUrl?: string; order?: number; notes?: string }) =>
    request(`/exercises/session/${sessionId}`, { method: 'POST', body: JSON.stringify(data) }),
  updateExercise: (id: string, data: Record<string, unknown>) =>
    request(`/exercises/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExercise: (id: string) =>
    request(`/exercises/${id}`, { method: 'DELETE' }),

  // Progress
  getProgress: (traineeId?: string) =>
    request<Array<{
      id: string; name: string;
      trainee: { id: string; name: string };
      exercises: Array<{
        id: string; name: string; sets: number; reps: number | null; weight: number | null; duration: number | null; order: number; notes: string | null;
        logs: Array<{ id: string; setsCompleted: number | null; repsCompleted: number | null; weightUsed: number | null; completedAt: string; notes: string | null }>;
      }>;
    }>>(`/sessions/progress${traineeId ? `?traineeId=${traineeId}` : ''}`),

  // Exercise Logs
  logExercise: (exerciseId: string, data: { setsCompleted?: number; repsCompleted?: number; weightUsed?: number; notes?: string }) =>
    request(`/exercises/${exerciseId}/log`, { method: 'POST', body: JSON.stringify(data) }),
  getExerciseLogs: (exerciseId: string) =>
    request<Array<{ id: string; setsCompleted: number | null; repsCompleted: number | null; weightUsed: number | null; completedAt: string; notes: string | null }>>(`/exercises/${exerciseId}/logs`),
  updateExerciseLog: (logId: string, data: { setsCompleted?: number; repsCompleted?: number; weightUsed?: number; notes?: string }) =>
    request(`/exercises/log/${logId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExerciseLog: (logId: string) =>
    request(`/exercises/log/${logId}`, { method: 'DELETE' }),

  // Templates
  getTemplates: () =>
    request<Array<{
      id: string; name: string; createdAt: string;
      exercises: Array<{ id: string; name: string; sets: number; reps: number | null; weight: number | null; duration: number | null; youtubeUrl: string | null; order: number; notes: string | null }>;
    }>>('/templates'),
  createTemplate: (data: { name: string; exercises?: Array<{ name: string; sets?: number; reps?: number; weight?: number; duration?: number; youtubeUrl?: string; notes?: string }> }) =>
    request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: string, data: { name: string }) =>
    request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) =>
    request(`/templates/${id}`, { method: 'DELETE' }),
  addTemplateExercise: (templateId: string, data: { name: string; sets?: number; reps?: number; weight?: number; duration?: number; youtubeUrl?: string; notes?: string }) =>
    request(`/templates/${templateId}/exercises`, { method: 'POST', body: JSON.stringify(data) }),
  updateTemplateExercise: (templateId: string, exerciseId: string, data: Record<string, unknown>) =>
    request(`/templates/${templateId}/exercises/${exerciseId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplateExercise: (templateId: string, exerciseId: string) =>
    request(`/templates/${templateId}/exercises/${exerciseId}`, { method: 'DELETE' }),
  createSessionFromTemplate: (data: { templateId: string; traineeId: string }) =>
    request('/sessions/from-template', { method: 'POST', body: JSON.stringify(data) }),

  // Dedication
  getDedicationStats: (traineeId?: string) =>
    request<{
      currentStreakWeeks: number; longestStreakWeeks: number; perfectWeeks: number;
      totalWorkoutDays: number; minWeeklyFrequency: number;
      activityDays: Record<string, number>;
      badges: Array<{ key: string; earnedAt: string; name?: string; icon?: string }>;
    }>(`/dedication/stats${traineeId ? `?traineeId=${traineeId}` : ''}`),
  getBadgeDefinitions: () =>
    request<Array<{ key: string; name: string; description: string; category: string; icon: string }>>('/dedication/badges'),
  getLeaderboard: () =>
    request<Array<{ rank: number; traineeId: string; name: string; currentStreakWeeks: number; totalWorkoutDays: number; badgeCount: number }>>('/dedication/leaderboard'),
  getDedicationConfig: () =>
    request<{ leaderboardEnabled: boolean }>('/dedication/config'),
  getRewards: (traineeId?: string) =>
    request<Array<{ id: string; condition: string; description: string; met: boolean }>>(`/dedication/rewards${traineeId ? `?traineeId=${traineeId}` : ''}`),
  createReward: (data: { condition: string; description: string }) =>
    request('/dedication/rewards', { method: 'POST', body: JSON.stringify(data) }),
  deleteReward: (id: string) =>
    request(`/dedication/rewards/${id}`, { method: 'DELETE' }),
  updateDedicationSettings: (data: { leaderboardOptOut?: boolean; traineeId?: string; minWeeklyFrequency?: number }) =>
    request('/dedication/settings', { method: 'PUT', body: JSON.stringify(data) }),
}
