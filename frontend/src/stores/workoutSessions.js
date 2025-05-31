import { defineStore } from "pinia";
import api from "../services/api";
// import { useAuthStore } from './auth'; // TODO: Uncomment and ensure this path is correct

export const useWorkoutSessionsStore = defineStore("workoutSessions", {
  state: () => ({
    activeWorkout: {}, // Changed from null to {}
    workoutHistory: [],
    // currentExerciseIndex, currentSetIndex, isWorkoutActive, workoutStartTime, exerciseStartTime MOVED to activeWorkout[traineeId]
    restTimer: {
      isActive: false,
      remaining: 0,
      duration: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    currentExercise: (state) => (traineeId) => {
      const traineeWorkout = state.activeWorkout[traineeId];
      if (!traineeWorkout || !traineeWorkout.exercises) return null;
      return traineeWorkout.exercises[traineeWorkout.currentExerciseIndex] || null;
    },

    currentSet: (state) => (traineeId) => {
      const traineeWorkout = state.activeWorkout[traineeId];
      if (!traineeWorkout) return null;
      const exercise = traineeWorkout.exercises?.[traineeWorkout.currentExerciseIndex];
      if (!exercise || !exercise.recordedSets) return null;
      return exercise.recordedSets[traineeWorkout.currentSetIndex] || null;
    },

    workoutProgress: (state) => (traineeId) => {
      const traineeWorkout = state.activeWorkout[traineeId];
      if (!traineeWorkout?.exercises) return 0;
      
      const totalSets = traineeWorkout.exercises.reduce((total, exercise) => {
        return total + (exercise.sets || 0);
      }, 0);
      
      const completedSets = traineeWorkout.exercises.reduce((total, exercise) => {
        return total + (exercise.recordedSets?.filter(set => set.completed).length || 0);
      }, 0);
      
      return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    },

    totalExercises: (state) => (traineeId) => {
      const traineeWorkout = state.activeWorkout[traineeId];
      return traineeWorkout?.exercises?.length || 0;
    },

    completedExercises: (state) => (traineeId) => {
      const traineeWorkout = state.activeWorkout[traineeId];
      if (!traineeWorkout?.exercises) return 0;
      return traineeWorkout.exercises.filter(exercise =>
        exercise.recordedSets?.every(set => set.completed)
      ).length;
    },

    workoutDuration: (state) => (traineeId) => {
      const traineeWorkout = state.activeWorkout[traineeId];
      if (!traineeWorkout?.workoutStartTime) return 0;
      return Math.floor((Date.now() - traineeWorkout.workoutStartTime) / 1000);
    }
  },

  actions: {
    async startWorkout(sessionTemplate, traineeId) { // Added traineeId
      this.loading = true;
      this.error = null;

      try {
        // Initialize workout from session template
        const workoutData = {
          id: sessionTemplate.id,
          name: sessionTemplate.name,
          description: sessionTemplate.description,
          templateId: sessionTemplate.id,
          exercises: this.initializeExercises(sessionTemplate.exercises || []),
          startTime: new Date().toISOString(),
          status: 'in_progress',
          // Trainee-specific state
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          isWorkoutActive: true,
          workoutStartTime: Date.now(),
          exerciseStartTime: Date.now(),
        };

        this.activeWorkout[traineeId] = workoutData;

        return workoutData;
      } catch (error) {
        this.error = "Failed to start workout";
        console.error("Error starting workout:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    initializeExercises(exercises) {
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
    },

    completeSet(traineeId, exerciseIndex, setIndex, setData) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (!traineeWorkout?.exercises) return;

      const exercise = traineeWorkout.exercises[exerciseIndex];
      if (!exercise?.recordedSets?.[setIndex]) return;

      // Update the set with recorded data
      exercise.recordedSets[setIndex] = {
        ...exercise.recordedSets[setIndex],
        ...setData,
        completed: true,
        endTime: new Date().toISOString()
      };

      // Auto-advance to next set or exercise
      this.advanceWorkout(traineeId); // Added traineeId
    },

    advanceWorkout(traineeId) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (!traineeWorkout) return;

      const currentExercise = this.currentExercise(traineeId); // Needs traineeId
      if (!currentExercise) return;

      // Check if there are more sets in current exercise
      const nextSetIndex = traineeWorkout.currentSetIndex + 1;
      if (nextSetIndex < currentExercise.recordedSets.length) {
        traineeWorkout.currentSetIndex = nextSetIndex;
        return;
      }

      // Mark current exercise as complete
      currentExercise.endTime = new Date().toISOString();

      // Move to next exercise
      const nextExerciseIndex = traineeWorkout.currentExerciseIndex + 1;
      if (nextExerciseIndex < traineeWorkout.exercises.length) {
        traineeWorkout.currentExerciseIndex = nextExerciseIndex;
        traineeWorkout.currentSetIndex = 0;
        traineeWorkout.exerciseStartTime = Date.now();
        
        // Mark new exercise as started
        traineeWorkout.exercises[nextExerciseIndex].startTime = new Date().toISOString();
      }
    },

    skipSet(traineeId, exerciseIndex, setIndex) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (!traineeWorkout?.exercises) return;

      const exercise = traineeWorkout.exercises[exerciseIndex];
      if (!exercise?.recordedSets?.[setIndex]) return;

      exercise.recordedSets[setIndex].completed = true;
      exercise.recordedSets[setIndex].endTime = new Date().toISOString();
      exercise.recordedSets[setIndex].notes = "Skipped";

      this.advanceWorkout(traineeId); // Added traineeId
    },

    startRestTimer(duration) {
      this.restTimer = {
        isActive: true,
        remaining: duration,
        duration: duration
      };

      const interval = setInterval(() => {
        this.restTimer.remaining--;
        
        if (this.restTimer.remaining <= 0) {
          this.restTimer.isActive = false;
          clearInterval(interval);
        }
      }, 1000);
    },

    pauseRestTimer() {
      this.restTimer.isActive = false;
    },

    resetRestTimer() {
      this.restTimer = {
        isActive: false,
        remaining: 0,
        duration: 0
      };
    },

    async pauseWorkout(traineeId) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (traineeWorkout) {
        traineeWorkout.status = 'paused';
        traineeWorkout.isWorkoutActive = false; // Updated for trainee
        this.resetRestTimer(); // Global timer reset
      }
    },

    async resumeWorkout(traineeId) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (traineeWorkout) {
        traineeWorkout.status = 'in_progress';
        traineeWorkout.isWorkoutActive = true; // Updated for trainee
      }
    },

    async completeWorkout(traineeId) { // Added traineeId
      // const authStore = useAuthStore(); // TODO: Import and use actual auth store
      // const trainerId = authStore.user?.id;
      const trainerId = 1; // Placeholder for trainer_id

      const traineeWorkout = this.activeWorkout[traineeId];
      if (!traineeWorkout) return;

      this.loading = true;
      this.error = null;

      try {
        // Mark workout as completed
        traineeWorkout.status = 'completed';
        traineeWorkout.endTime = new Date().toISOString();
        traineeWorkout.duration = this.workoutDuration(traineeId); // Pass traineeId

        // Save workout session to backend
        const workoutData = {
          trainee_id: traineeId, // Use passed traineeId
          trainer_id: trainerId, // TODO: Get from auth store (e.g., useAuthStore().user.id)
          name: `${traineeWorkout.name} - Completed`,
          description: JSON.stringify({
            templateId: traineeWorkout.templateId,
            exercises: traineeWorkout.exercises,
            startTime: traineeWorkout.startTime,
            endTime: traineeWorkout.endTime,
            duration: traineeWorkout.duration,
            summary: this.getWorkoutSummary(traineeId) // Pass traineeId
          }),
          scheduled_time: new Date().toISOString()
        };

        const response = await api.createSession(workoutData);
        
        // Add to workout history
        this.workoutHistory.unshift({
          ...traineeWorkout, // Use traineeWorkout
          id: response.data.id
        });

        // Reset active workout for the specific trainee
        this.resetWorkout(traineeId); // Pass traineeId

        return response.data;
      } catch (error) {
        this.error = "Failed to save workout";
        console.error("Error completing workout:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelWorkout(traineeId) { // Added traineeId
      this.resetWorkout(traineeId); // Pass traineeId
    },

    resetWorkout(traineeId) { // Added traineeId
      if (this.activeWorkout[traineeId]) {
        delete this.activeWorkout[traineeId]; // Remove specific trainee's workout
      }
      // Global states like isWorkoutActive, workoutStartTime etc. are now part of activeWorkout[traineeId]
      // So, no need to reset them here individually for the global state.
      this.resetRestTimer(); // Reset global rest timer
    },

    goToExercise(traineeId, exerciseIndex) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (!traineeWorkout) return;

      // Use totalExercises getter with traineeId
      if (exerciseIndex >= 0 && exerciseIndex < this.totalExercises(traineeId)) {
        traineeWorkout.currentExerciseIndex = exerciseIndex;
        traineeWorkout.currentSetIndex = 0;
        traineeWorkout.exerciseStartTime = Date.now();
        
        // Mark exercise as started if not already
        const exercise = traineeWorkout.exercises[exerciseIndex];
        if (!exercise.startTime) {
          exercise.startTime = new Date().toISOString();
        }
      }
    },

    goToSet(traineeId, setIndex) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (!traineeWorkout) return;

      const currentExercise = this.currentExercise(traineeId); // Pass traineeId
      if (currentExercise && setIndex >= 0 && setIndex < currentExercise.recordedSets.length) {
        traineeWorkout.currentSetIndex = setIndex;
      }
    },

    getWorkoutSummary(traineeId) { // Added traineeId
      const traineeWorkout = this.activeWorkout[traineeId];
      if (!traineeWorkout?.exercises) return {};

      const totalSets = traineeWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.recordedSets.length;
      }, 0);

      const completedSets = traineeWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.recordedSets.filter(set => set.completed).length;
      }, 0);

      const totalVolume = traineeWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.recordedSets.reduce((exerciseVolume, set) => {
          if (set.completed && set.actualWeight && set.actualReps) {
            return exerciseVolume + (set.actualWeight * set.actualReps);
          }
          return exerciseVolume;
        }, 0);
      }, 0);

      return {
        totalExercises: this.totalExercises(traineeId), // Pass traineeId
        completedExercises: this.completedExercises(traineeId), // Pass traineeId
        totalSets,
        completedSets,
        totalVolume,
        duration: this.workoutDuration(traineeId) // Pass traineeId
      };
    },

    async fetchWorkoutHistory() {
      this.loading = true;
      this.error = null;

      try {
        // Fetch completed workout sessions
        const response = await api.getSessions({ limit: 50 });
        
        // Filter for completed workouts (those with workout data in description)
        this.workoutHistory = response.data
          .filter(session => {
            try {
              const data = JSON.parse(session.description || '{}');
              return data.templateId && data.exercises;
            } catch (e) {
              return false;
            }
          })
          .map(session => {
            const data = JSON.parse(session.description);
            return {
              id: session.id,
              name: session.name,
              startTime: data.startTime,
              endTime: data.endTime,
              duration: data.duration,
              summary: data.summary,
              exercises: data.exercises
            };
          });
      } catch (error) {
        this.error = "Failed to fetch workout history";
        console.error("Error fetching workout history:", error);
      } finally {
        this.loading = false;
      }
    }
  }
});