import { defineStore } from "pinia";
import api from "../services/api";

export const useProgramsStore = defineStore("programs", {
  state: () => ({
    programs: [], // These will be training session templates
    programDetail: null,
    loading: false,
    error: null,
    filters: {
      search: "",
      difficulty: "",
      duration: "",
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  }),

  getters: {
    filteredPrograms: (state) => {
      // Transform training sessions to program format
      let filtered = state.programs.map(session => {
        let parsedData = {};
        try {
          parsedData = session.description ? JSON.parse(session.description) : {};
        } catch (e) {
          parsedData = { description: session.description || "" };
        }
        
        return {
          id: session.id,
          name: session.name,
          description: parsedData.description || session.description || "",
          difficulty: parsedData.difficulty || "",
          duration_weeks: parsedData.duration_weeks || null,
          goals: parsedData.goals || "",
          exercises: parsedData.exercises || [],
          created_at: session.created_at,
          trainee_id: session.trainee_id,
          trainer_id: session.trainer_id
        };
      });
      
      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase();
        filtered = filtered.filter(program => 
          program.name.toLowerCase().includes(searchTerm) ||
          (program.description && program.description.toLowerCase().includes(searchTerm))
        );
      }
      
      if (state.filters.difficulty) {
        filtered = filtered.filter(program => 
          program.difficulty === state.filters.difficulty
        );
      }
      
      if (state.filters.duration) {
        filtered = filtered.filter(program => 
          program.duration_weeks === parseInt(state.filters.duration)
        );
      }
      
      return filtered;
    },
    
    isLoading: (state) => state.loading,
    
    // Get unique values for filter options
    difficulties: (state) => {
      const difficulties = state.programs
        .map(session => {
          try {
            const parsedData = session.description ? JSON.parse(session.description) : {};
            return parsedData.difficulty;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      return difficulties.sort();
    },
    
    durations: (state) => {
      const durations = state.programs
        .map(session => {
          try {
            const parsedData = session.description ? JSON.parse(session.description) : {};
            return parsedData.duration_weeks;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      return durations.sort((a, b) => a - b);
    }
  },

  actions: {
    async fetchPrograms() {
      this.loading = true;
      this.error = null;

      try {
        const params = {
          skip: (this.pagination.page - 1) * this.pagination.limit,
          limit: this.pagination.limit,
        };

        const response = await api.getSessions(params);
        
        // Handle different API response structures
        if (Array.isArray(response.data)) {
          this.programs = response.data;
          this.pagination.total = response.data.length;
        } else if (response.data && Array.isArray(response.data.items)) {
          this.programs = response.data.items;
          this.pagination.total = response.data.total || response.data.items.length;
        } else {
          this.programs = [];
          this.pagination.total = 0;
        }
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch programs";
        console.error("Error fetching programs:", error);
        this.programs = [];
      } finally {
        this.loading = false;
      }
    },

    async fetchProgramDetail(id) {
      this.loading = true;
      this.error = null;
      this.programDetail = null;

      try {
        const response = await api.getSession(id);
        this.programDetail = response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch session details";
        console.error("Error fetching session details:", error);
      } finally {
        this.loading = false;
      }
    },

    async createProgram(programData) {
      this.loading = true;
      this.error = null;

      try {
        // Transform program data to training session format
        const sessionData = {
          trainee_id: 0, // Use 0 for template sessions (not assigned to specific trainee)
          trainer_id: 1, // TODO: Get from auth store
          name: programData.name,
          description: programData.description || null,
          scheduled_time: null, // Templates don't have scheduled times
          // Store additional program data in description as JSON
          ...(programData.difficulty || programData.goals || programData.duration_weeks ? {
            description: JSON.stringify({
              description: programData.description || "",
              difficulty: programData.difficulty,
              goals: programData.goals,
              duration_weeks: programData.duration_weeks,
              exercises: programData.exercises || []
            })
          } : {})
        };

        const response = await api.createSession(sessionData);
        this.programs.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to create session template";
        console.error("Error creating session template:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateProgram(id, programData) {
      this.loading = true;
      this.error = null;

      try {
        // Transform program data to training session format
        const sessionData = {
          name: programData.name,
          description: JSON.stringify({
            description: programData.description || "",
            difficulty: programData.difficulty,
            goals: programData.goals,
            duration_weeks: programData.duration_weeks,
            exercises: programData.exercises || []
          })
        };

        const response = await api.updateSession(id, sessionData);
        const index = this.programs.findIndex(p => p.id === id);
        if (index !== -1) {
          this.programs[index] = response.data;
        }
        if (this.programDetail && this.programDetail.id === id) {
          this.programDetail = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to update session template";
        console.error("Error updating session template:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteProgram(id) {
      this.loading = true;
      this.error = null;

      try {
        await api.deleteSession(id);
        this.programs = this.programs.filter(p => p.id !== id);
        return true;
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to delete session template";
        console.error("Error deleting session template:", error);
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
        difficulty: "",
        duration: "",
      };
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchPrograms();
    },

    clearDetail() {
      this.programDetail = null;
    }
  }
});