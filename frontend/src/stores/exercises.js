import { defineStore } from "pinia";
import api from "../services/api";

export const useExercisesStore = defineStore("exercises", {
  state: () => ({
    exercises: [],
    exerciseDetail: null,
    loading: false,
    error: null,
    filters: {
      search: "",
      category: "",
      muscle_group: "",
      equipment: "",
      difficulty: "",
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    },
    viewMode: "grid" // "grid" or "list"
  }),

  getters: {
    filteredExercises: (state) => {
      let filtered = [...state.exercises];
      
      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase();
        filtered = filtered.filter(exercise => 
          exercise.name.toLowerCase().includes(searchTerm) ||
          (exercise.description && exercise.description.toLowerCase().includes(searchTerm))
        );
      }
      
      if (state.filters.category) {
        filtered = filtered.filter(exercise => 
          exercise.category === state.filters.category
        );
      }
      
      if (state.filters.muscle_group) {
        filtered = filtered.filter(exercise => 
          exercise.muscle_groups && exercise.muscle_groups.includes(state.filters.muscle_group)
        );
      }
      
      if (state.filters.equipment) {
        filtered = filtered.filter(exercise => 
          exercise.equipment === state.filters.equipment
        );
      }
      
      if (state.filters.difficulty) {
        filtered = filtered.filter(exercise => 
          exercise.difficulty === state.filters.difficulty
        );
      }
      
      return filtered;
    },
    
    isLoading: (state) => state.loading,
    
    // Get unique values for filter options
    categories: (state) => {
      const categories = state.exercises
        .map(exercise => exercise.category)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      return categories.sort();
    },
    
    muscleGroups: (state) => {
      const muscleGroups = new Set();
      state.exercises.forEach(exercise => {
        if (exercise.muscle_groups) {
          exercise.muscle_groups.split(',').forEach(group => {
            muscleGroups.add(group.trim());
          });
        }
      });
      return Array.from(muscleGroups).sort();
    },
    
    equipmentTypes: (state) => {
      const equipment = state.exercises
        .map(exercise => exercise.equipment)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      return equipment.sort();
    },
    
    difficultyLevels: (state) => {
      const difficulties = state.exercises
        .map(exercise => exercise.difficulty)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      return difficulties.sort();
    }
  },

  actions: {
    async fetchExercises() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          skip: (this.pagination.page - 1) * this.pagination.limit,
          limit: this.pagination.limit,
        };

        const response = await api.getExercises(params);
        
        // Handle different API response structures
        if (Array.isArray(response.data)) {
          this.exercises = response.data;
          this.pagination.total = response.data.length;
        } else if (response.data && Array.isArray(response.data.items)) {
          this.exercises = response.data.items;
          this.pagination.total = response.data.total || response.data.items.length;
        } else {
          this.exercises = [];
          this.pagination.total = 0;
        }
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch exercises";
        console.error("Error fetching exercises:", error);
        this.exercises = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchExerciseDetail(id) {
      this.loading = true;
      this.error = null;
      this.exerciseDetail = null;

      try {
        const response = await api.getExercise(id);
        this.exerciseDetail = response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch exercise details";
        console.error("Error fetching exercise details:", error);
      } finally {
        this.loading = false;
      }
    },

    async createExercise(exerciseData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.createExercise(exerciseData);
        this.exercises.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to create exercise";
        console.error("Error creating exercise:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateExercise(id, exerciseData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.updateExercise(id, exerciseData);
        const index = this.exercises.findIndex(e => e.id === id);
        if (index !== -1) {
          this.exercises[index] = response.data;
        }
        if (this.exerciseDetail && this.exerciseDetail.id === id) {
          this.exerciseDetail = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to update exercise";
        console.error("Error updating exercise:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteExercise(id) {
      this.loading = true;
      this.error = null;

      try {
        await api.deleteExercise(id);
        this.exercises = this.exercises.filter(e => e.id !== id);
        return true;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to delete exercise";
        console.error("Error deleting exercise:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters() {
      this.filters = {
        search: "",
        category: "",
        muscle_group: "",
        equipment: "",
        difficulty: "",
      };
    },

    setViewMode(mode) {
      this.viewMode = mode;
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchExercises();
    },

    clearDetail() {
      this.exerciseDetail = null;
    }
  }
});