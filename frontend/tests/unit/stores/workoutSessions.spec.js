import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWorkoutSessionsStore } from '@/stores/workoutSessions';
import { useAuthStore } from '@/stores/auth'; // Needed for trainer_id in completeWorkout

// Mock API service
vi.mock('@/services/api', () => ({
  default: {
    createSession: vi.fn(),
    // Add other API methods if they are used directly by the store and need mocking
  },
}));

// Mock Auth Store
vi.mock('@/stores/auth', async () => { // Corrected: added async, removed extra dot
  const actualAuth = await vi.importActual('@/stores/auth');
  return {
    useAuthStore: vi.fn(() => ({
        // If useAuthStore is a function that returns an object (typical setup)
        // We might not need to spread ...actualAuth.useAuthStore() directly here
        // but rather mock its return value if it's complex.
        // For simple cases like just providing a user object, this is fine.
        user: { id: 'trainer-123' },
        // Mock other parts of the auth store if workoutSessions store interacts with them
    })),
  };
});


describe('useWorkoutSessionsStore', () => {
  let store;
  let authStore;

  const sessionTemplateMock = {
    id: 'template-1',
    name: 'Full Body Workout',
    description: 'A comprehensive workout plan.',
    exercises: [
      { exercise_id: 'ex1', exercise_name: 'Push Ups', sets: 3, reps: 10, weight: null, rest_between_sets: 60 },
      { exercise_id: 'ex2', exercise_name: 'Squats', sets: 3, reps: 12, weight: 50, rest_between_sets: 90 },
    ],
  };

  const trainee1Id = 'trainee-abc';
  const trainee2Id = 'trainee-xyz';

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useWorkoutSessionsStore();
    authStore = useAuthStore(); // Initialize mocked auth store
    // Reset mocks before each test if they are stateful (e.g., call counts)
    vi.mocked(api.createSession).mockClear();
  });

  it('initializes with correct default state', () => {
    expect(store.activeWorkout).toEqual({});
    expect(store.workoutHistory).toEqual([]);
    expect(store.restTimer.isActive).toBe(false);
    expect(store.loading).toBe(false);
    expect(store.error).toBe(null);
  });

  describe('startWorkout', () => {
    it('starts a workout for a single trainee', () => {
      store.startWorkout(sessionTemplateMock, trainee1Id);

      expect(store.activeWorkout[trainee1Id]).toBeDefined();
      const workout = store.activeWorkout[trainee1Id];
      expect(workout.name).toBe(sessionTemplateMock.name);
      expect(workout.isWorkoutActive).toBe(true);
      expect(workout.currentExerciseIndex).toBe(0);
      expect(workout.currentSetIndex).toBe(0);
      expect(workout.exercises.length).toBe(sessionTemplateMock.exercises.length);
      expect(workout.exercises[0].recordedSets.length).toBe(sessionTemplateMock.exercises[0].sets);
    });

    it('starts workouts for multiple trainees independently', () => {
      store.startWorkout(sessionTemplateMock, trainee1Id);
      const anotherTemplate = { ...sessionTemplateMock, id: 'template-2', name: 'Leg Day' };
      store.startWorkout(anotherTemplate, trainee2Id);

      expect(store.activeWorkout[trainee1Id]).toBeDefined();
      expect(store.activeWorkout[trainee1Id].name).toBe(sessionTemplateMock.name);

      expect(store.activeWorkout[trainee2Id]).toBeDefined();
      expect(store.activeWorkout[trainee2Id].name).toBe(anotherTemplate.name);
      expect(store.activeWorkout[trainee1Id].isWorkoutActive).toBe(true);
      expect(store.activeWorkout[trainee2Id].isWorkoutActive).toBe(true);
    });
  });

  describe('Getters', () => {
    beforeEach(() => {
      store.startWorkout(sessionTemplateMock, trainee1Id);
      const anotherTemplate = { ...sessionTemplateMock, id: 'template-2', exercises: [{ ...sessionTemplateMock.exercises[0], exercise_name: 'Lunges'}] };
      store.startWorkout(anotherTemplate, trainee2Id);
    });

    it('currentExercise(traineeId) returns correct exercise', () => {
      const exercise1 = store.currentExercise(trainee1Id);
      expect(exercise1.exercise_name).toBe('Push Ups');

      const exercise2 = store.currentExercise(trainee2Id);
      expect(exercise2.exercise_name).toBe('Lunges');

      store.activeWorkout[trainee1Id].currentExerciseIndex = 1;
      const nextExercise1 = store.currentExercise(trainee1Id);
      expect(nextExercise1.exercise_name).toBe('Squats');
    });

    it('workoutProgress(traineeId) calculates progress correctly', () => {
      // Assuming 0 progress initially
      expect(store.workoutProgress(trainee1Id)).toBe(0);
      // TODO: Add more detailed progress test after completing some sets
    });
  });

  describe('Actions with traineeId', () => {
    beforeEach(() => {
      store.startWorkout(sessionTemplateMock, trainee1Id);
      store.startWorkout({ ...sessionTemplateMock, id: 'template-2' }, trainee2Id);
    });

    it('completeSet affects only the specified trainee', () => {
      const setData = { actualReps: 10, actualWeight: 0 };
      store.completeSet(trainee1Id, 0, 0, setData);

      const trainee1Workout = store.activeWorkout[trainee1Id];
      expect(trainee1Workout.exercises[0].recordedSets[0].completed).toBe(true);
      expect(trainee1Workout.exercises[0].recordedSets[0].actualReps).toBe(10);
      // currentSetIndex should advance for trainee1
      expect(trainee1Workout.currentSetIndex).toBe(1);

      const trainee2Workout = store.activeWorkout[trainee2Id];
      // trainee2's workout should be unaffected
      expect(trainee2Workout.exercises[0].recordedSets[0].completed).toBe(false);
      expect(trainee2Workout.currentSetIndex).toBe(0);
    });

    it('advanceWorkout advances only for the specified trainee', () => {
      // Complete all sets of the first exercise for trainee1
      for (let i = 0; i < sessionTemplateMock.exercises[0].sets; i++) {
        store.completeSet(trainee1Id, 0, i, { actualReps: 10, actualWeight: 0 });
      }
      // After last set of first exercise, advanceWorkout is called internally by completeSet
      // It should move to the next exercise for trainee1
      expect(store.activeWorkout[trainee1Id].currentExerciseIndex).toBe(1);
      expect(store.activeWorkout[trainee1Id].currentSetIndex).toBe(0);

      // trainee2 should still be on the first exercise, first set
      expect(store.activeWorkout[trainee2Id].currentExerciseIndex).toBe(0);
      expect(store.activeWorkout[trainee2Id].currentSetIndex).toBe(0);
    });

    it('pauseWorkout and resumeWorkout toggle isWorkoutActive for the correct trainee', () => {
      store.pauseWorkout(trainee1Id);
      expect(store.activeWorkout[trainee1Id].isWorkoutActive).toBe(false);
      expect(store.activeWorkout[trainee2Id].isWorkoutActive).toBe(true); // trainee2 unaffected

      store.resumeWorkout(trainee1Id);
      expect(store.activeWorkout[trainee1Id].isWorkoutActive).toBe(true);
    });

    it('completeWorkout calls api.createSession with correct trainee_id and trainer_id, then cleans up', async () => {
      const mockApiResponse = { data: { id: 'session-123' } };
      vi.mocked(api.createSession).mockResolvedValue(mockApiResponse);

      // Mock authStore.user.id
      // This is now handled by the vi.mock at the top of the file
      // authStore.user = { id: 'trainer-123' }; // Ensure authStore is mutable if doing it this way

      await store.completeWorkout(trainee1Id);

      expect(api.createSession).toHaveBeenCalledTimes(1);
      const payload = vi.mocked(api.createSession).mock.calls[0][0];
      expect(payload.trainee_id).toBe(trainee1Id);
      expect(payload.trainer_id).toBe('trainer-123'); // From mocked authStore

      expect(store.activeWorkout[trainee1Id]).toBeUndefined(); // Workout removed for trainee1
      expect(store.workoutHistory.length).toBe(1);
      expect(store.workoutHistory[0].name).toBe(sessionTemplateMock.name);
      expect(store.workoutHistory[0].id).toBe(mockApiResponse.data.id);

      expect(store.activeWorkout[trainee2Id]).toBeDefined(); // trainee2's workout unaffected
    });

    it('cancelWorkout removes workout for the specified trainee', () => {
        store.cancelWorkout(trainee1Id);
        expect(store.activeWorkout[trainee1Id]).toBeUndefined();
        expect(store.activeWorkout[trainee2Id]).toBeDefined(); // trainee2 unaffected
    });
  });
});

// Helper to ensure exercises and sets are properly initialized for tests
function initializeMockExercises(exercises) {
    return exercises.map(exercise => ({
        ...exercise,
        recordedSets: Array.from({ length: exercise.sets || 3 }, (_, index) => ({
            setNumber: index + 1,
            targetReps: exercise.reps || 10,
            actualReps: null,
            targetWeight: exercise.weight || null,
            actualWeight: null,
            restTime: exercise.rest_between_sets || 60,
            duration: null,
            notes: "",
            completed: false,
            startTime: null,
            endTime: null
        })),
        startTime: null,
        endTime: null,
        notes: exercise.notes || ""
    }));
}
