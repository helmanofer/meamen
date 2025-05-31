import { defineStore } from "pinia";
import api from "../services/api";

export const useTraineesStore = defineStore("trainees", {
  state: () => ({
    trainees: [],
    traineeDetail: null,
    measurements: [],
    loading: false,
    error: null,
    filters: {
      search: "",
      status: "",
      program: "",
      sort: "name"
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    },
    currentTraineeAssignedPrograms: []
  }),

  getters: {
    filteredTrainees: (state) => {
      // This getter returns trainees filtered by the current search term
      // In a real application, this filtering would typically be done on the server
      if (!state.search) return state.trainees;
      
      const searchTerm = state.search.toLowerCase();
      return state.trainees.filter(trainee => 
        trainee.name.toLowerCase().includes(searchTerm) ||
        (trainee.email && trainee.email.toLowerCase().includes(searchTerm))
      );
    },
    
    isLoading: (state) => state.loading
  },

  actions: {
    async fetchTrainees() {
      this.loading = true;
      this.error = null;

      try {
        // For now, use a default trainer_id of 1
        // In a real app, this would come from the authenticated user
        const trainerId = 1;
        
        const params = {
          skip: (this.pagination.page - 1) * this.pagination.limit,
          limit: this.pagination.limit,
          ...this.filters
        };

        const response = await api.getTrainees(trainerId, params);
        
        // The API returns a simple array of trainees
        this.trainees = Array.isArray(response.data) ? response.data : [];
        this.pagination.total = this.trainees.length;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch trainees";
        console.error("Error fetching trainees:", error);
        this.trainees = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchTraineeDetail(id) {
      this.loading = true;
      this.error = null;
      this.traineeDetail = null;

      try {
        const trainerId = 1; // Default trainer ID
        const response = await api.getTrainee(id, trainerId);
        this.traineeDetail = response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch trainee details";
        console.error("Error fetching trainee details:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchMeasurements(traineeId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getTraineeMeasurements(traineeId);
        this.measurements = response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch measurements";
        console.error("Error fetching measurements:", error);
      } finally {
        this.loading = false;
      }
    },

    async createTrainee(traineeData) {
      this.loading = true;
      this.error = null;

      try {
        // For now, use a default trainer_id of 1
        // In a real app, this would come from the authenticated user
        const trainerId = 1;
        const response = await api.createTrainee(traineeData, trainerId);
        // Add the new trainee to the list
        this.trainees.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to create trainee";
        console.error("Error creating trainee:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateTrainee(id, traineeData) {
      this.loading = true;
      this.error = null;

      try {
        const trainerId = 1; // Default trainer ID
        const response = await api.updateTrainee(id, traineeData, trainerId);
        // Update the trainee in the list
        const index = this.trainees.findIndex(t => t.id === id);
        if (index !== -1) {
          this.trainees[index] = response.data;
        }
        // Update the detail view if it's the same trainee
        if (this.traineeDetail && this.traineeDetail.id === id) {
          this.traineeDetail = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to update trainee";
        console.error("Error updating trainee:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteTrainee(id) {
      this.loading = true;
      this.error = null;

      try {
        const trainerId = 1; // Default trainer ID
        await api.deleteTrainee(id, trainerId);
        // Remove the trainee from the list
        this.trainees = this.trainees.filter(t => t.id !== id);
        return true;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to delete trainee";
        console.error("Error deleting trainee:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addMeasurement(traineeId, measurementData) {
      this.loading = true;
      this.error = null;

      try {
        const trainerId = 1; // Default trainer ID
        const response = await api.addTraineeMeasurement(traineeId, measurementData, trainerId);
        // Update the trainee's measurement history
        if (this.traineeDetail && this.traineeDetail.id === traineeId) {
          this.traineeDetail = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to add measurement";
        console.error("Error adding measurement:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addProgressPhoto(traineeId, photoData) {
      this.loading = true;
      this.error = null;

      try {
        const trainerId = 1; // Default trainer ID
        const response = await api.addTraineeProgressPhoto(traineeId, photoData, trainerId);
        // Update the trainee's progress photos
        if (this.traineeDetail && this.traineeDetail.id === traineeId) {
          this.traineeDetail = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to add progress photo";
        console.error("Error adding progress photo:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // Reset to first page when filters change
      this.fetchTrainees();
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchTrainees();
    },

    clearFilters() {
      this.filters = {
        search: "",
        status: "",
        program: "",
        sort: "name"
      };
      this.fetchTrainees();
    },

    clearDetail() {
      this.traineeDetail = null;
      this.measurements = [];
    },

    async assignProgramToTrainee(traineeId, programId) {
      this.loading = true;
      this.error = null;

      try {
        const trainerId = 1; // Default trainer ID
        const response = await api.assignProgramToTrainee(traineeId, programId, trainerId);
        
        // Update the trainee in the list
        const traineeIndex = this.trainees.findIndex(t => t.id === traineeId);
        if (traineeIndex !== -1) {
          this.trainees[traineeIndex] = response.data;
        }
        
        // Update trainee detail if it's the same trainee
        if (this.traineeDetail && this.traineeDetail.id === traineeId) {
          this.traineeDetail = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to assign program";
        console.error("Error assigning program:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async unassignProgramFromTrainee(traineeId, programId) {
      this.loading = true;
      this.error = null;

      try {
        const trainerId = 1; // Default trainer ID
        const response = await api.unassignProgramFromTrainee(traineeId, programId, trainerId);
        
        // Update the trainee in the list
        const traineeIndex = this.trainees.findIndex(t => t.id === traineeId);
        if (traineeIndex !== -1) {
          this.trainees[traineeIndex] = response.data;
        }
        
        // Update trainee detail if it's the same trainee
        if (this.traineeDetail && this.traineeDetail.id === traineeId) {
          this.traineeDetail = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to unassign program";
        console.error("Error unassigning program:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTraineePrograms(traineeId) {
      this.loading = true;
      this.error = null;
      this.currentTraineeAssignedPrograms = [];

      try {
        const trainerId = 1; // Default trainer ID
        const response = await api.getTraineePrograms(traineeId, trainerId);
        this.currentTraineeAssignedPrograms = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch trainee programs";
        console.error("Error fetching trainee programs:", error);
        this.currentTraineeAssignedPrograms = []; // Also clear on error
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});