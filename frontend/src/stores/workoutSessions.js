import { defineStore } from "pinia";
import api from "../services/api";

export const useWorkoutSessionsStore = defineStore("workoutSessions", {
  state: () => ({
    activeWorkout: null,
    workoutHistory: [],
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    isWorkoutActive: false,
    workoutStartTime: null,
    exerciseStartTime: null,
    restTimer: {
      isActive: false,
      remaining: 0,
      duration: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    currentExercise: (state) => {
      if (!state.activeWorkout || !state.activeWorkout.exercises) return null;
      return state.activeWorkout.exercises[state.currentExerciseIndex] || null;
    },

    currentSet: (state) => {
      const exercise = state.activeWorkout?.exercises?.[state.currentExerciseIndex];
      if (!exercise || !exercise.recordedSets) return null;
      return exercise.recordedSets[state.currentSetIndex] || null;
    },

    workoutProgress: (state) => {
      if (!state.activeWorkout?.exercises) return 0;
      
      const totalSets = state.activeWorkout.exercises.reduce((total, exercise) => {
        return total + (exercise.sets || 0);
      }, 0);
      
      const completedSets = state.activeWorkout.exercises.reduce((total, exercise) => {
        return total + (exercise.recordedSets?.filter(set => set.completed).length || 0);
      }, 0);
      
      return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    },

    totalExercises: (state) => {
      return state.activeWorkout?.exercises?.length || 0;
    },

    completedExercises: (state) => {
      if (!state.activeWorkout?.exercises) return 0;
      return state.activeWorkout.exercises.filter(exercise => 
        exercise.recordedSets?.every(set => set.completed)
      ).length;
    },

    workoutDuration: (state) => {
      if (!state.workoutStartTime) return 0;
      return Math.floor((Date.now() - state.workoutStartTime) / 1000);
    }
  },

  actions: {
    async startWorkout(sessionTemplate) {
      this.loading = true;
      this.error = null;

      try {
        // Initialize workout from session template
        const workout = {
          id: sessionTemplate.id,
          name: sessionTemplate.name,
          description: sessionTemplate.description,
          templateId: sessionTemplate.id,
          exercises: this.initializeExercises(sessionTemplate.exercises || []),
          startTime: new Date().toISOString(),
          status: 'in_progress'
        };

        this.activeWorkout = workout;
        this.isWorkoutActive = true;
        this.workoutStartTime = Date.now();
        this.currentExerciseIndex = 0;
        this.currentSetIndex = 0;
        this.exerciseStartTime = Date.now();

        return workout;
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

    completeSet(exerciseIndex, setIndex, setData) {
      if (!this.activeWorkout?.exercises) return;

      const exercise = this.activeWorkout.exercises[exerciseIndex];
      if (!exercise?.recordedSets?.[setIndex]) return;

      // Update the set with recorded data
      exercise.recordedSets[setIndex] = {
        ...exercise.recordedSets[setIndex],
        ...setData,
        completed: true,
        endTime: new Date().toISOString()
      };

      // Auto-advance to next set or exercise
      this.advanceWorkout();
    },

    advanceWorkout() {
      const currentExercise = this.currentExercise;
      if (!currentExercise) return;

      // Check if there are more sets in current exercise
      const nextSetIndex = this.currentSetIndex + 1;
      if (nextSetIndex < currentExercise.recordedSets.length) {
        this.currentSetIndex = nextSetIndex;
        return;
      }

      // Mark current exercise as complete
      currentExercise.endTime = new Date().toISOString();

      // Move to next exercise
      const nextExerciseIndex = this.currentExerciseIndex + 1;
      if (nextExerciseIndex < this.activeWorkout.exercises.length) {
        this.currentExerciseIndex = nextExerciseIndex;
        this.currentSetIndex = 0;
        this.exerciseStartTime = Date.now();
        
        // Mark new exercise as started
        this.activeWorkout.exercises[nextExerciseIndex].startTime = new Date().toISOString();
      }
    },

    skipSet(exerciseIndex, setIndex) {
      if (!this.activeWorkout?.exercises) return;

      const exercise = this.activeWorkout.exercises[exerciseIndex];
      if (!exercise?.recordedSets?.[setIndex]) return;

      exercise.recordedSets[setIndex].completed = true;
      exercise.recordedSets[setIndex].endTime = new Date().toISOString();
      exercise.recordedSets[setIndex].notes = "Skipped";

      this.advanceWorkout();
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

    async pauseWorkout() {
      if (this.activeWorkout) {
        this.activeWorkout.status = 'paused';
        this.isWorkoutActive = false;
        this.resetRestTimer();
      }
    },

    async resumeWorkout() {
      if (this.activeWorkout) {
        this.activeWorkout.status = 'in_progress';
        this.isWorkoutActive = true;
      }
    },

    async completeWorkout() {
      if (!this.activeWorkout) return;

      this.loading = true;
      this.error = null;

      try {
        // Mark workout as completed
        this.activeWorkout.status = 'completed';
        this.activeWorkout.endTime = new Date().toISOString();
        this.activeWorkout.duration = this.workoutDuration;

        // Save workout session to backend
        const workoutData = {
          trainee_id: 1, // TODO: Get from auth store
          trainer_id: 1, // TODO: Get from auth store  
          name: `${this.activeWorkout.name} - Completed`,
          description: JSON.stringify({
            templateId: this.activeWorkout.templateId,
            exercises: this.activeWorkout.exercises,
            startTime: this.activeWorkout.startTime,
            endTime: this.activeWorkout.endTime,
            duration: this.activeWorkout.duration,
            summary: this.getWorkoutSummary()
          }),
          scheduled_time: new Date().toISOString()
        };

        const response = await api.createSession(workoutData);
        
        // Add to workout history
        this.workoutHistory.unshift({
          ...this.activeWorkout,
          id: response.data.id
        });

        // Reset active workout
        this.resetWorkout();

        return response.data;
      } catch (error) {
        this.error = "Failed to save workout";
        console.error("Error completing workout:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelWorkout() {
      this.resetWorkout();
    },

    resetWorkout() {
      this.activeWorkout = null;
      this.isWorkoutActive = false;
      this.workoutStartTime = null;
      this.exerciseStartTime = null;
      this.currentExerciseIndex = 0;
      this.currentSetIndex = 0;
      this.resetRestTimer();
    },

    goToExercise(exerciseIndex) {
      if (exerciseIndex >= 0 && exerciseIndex < this.totalExercises) {
        this.currentExerciseIndex = exerciseIndex;
        this.currentSetIndex = 0;
        this.exerciseStartTime = Date.now();
        
        // Mark exercise as started if not already
        const exercise = this.activeWorkout.exercises[exerciseIndex];
        if (!exercise.startTime) {
          exercise.startTime = new Date().toISOString();
        }
      }
    },

    goToSet(setIndex) {
      const currentExercise = this.currentExercise;
      if (currentExercise && setIndex >= 0 && setIndex < currentExercise.recordedSets.length) {
        this.currentSetIndex = setIndex;
      }
    },

    getWorkoutSummary() {
      if (!this.activeWorkout?.exercises) return {};

      const totalSets = this.activeWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.recordedSets.length;
      }, 0);

      const completedSets = this.activeWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.recordedSets.filter(set => set.completed).length;
      }, 0);

      const totalVolume = this.activeWorkout.exercises.reduce((total, exercise) => {
        return total + exercise.recordedSets.reduce((exerciseVolume, set) => {
          if (set.completed && set.actualWeight && set.actualReps) {
            return exerciseVolume + (set.actualWeight * set.actualReps);
          }
          return exerciseVolume;
        }, 0);
      }, 0);

      return {
        totalExercises: this.totalExercises,
        completedExercises: this.completedExercises,
        totalSets,
        completedSets,
        totalVolume,
        duration: this.workoutDuration
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