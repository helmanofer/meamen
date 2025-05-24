import { defineStore } from "pinia";
import api from "../services/api";

export const useProgramsStore = defineStore("programs", {
  state: () => ({
    programs: [], // These will be session templates
    programDetail: null,
    loading: false,
    error: null,
    filters: {
      search: "",
      difficulty: "",
      category: "",
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0
    }
  }),

  getters: {
    filteredPrograms: (state) => {
      // Session templates are already in the right format
      let filtered = state.programs.map(template => {
        let workoutStructure = [];
        try {
          workoutStructure = template.workout_structure ? JSON.parse(template.workout_structure) : [];
        } catch (e) {
          workoutStructure = [];
        }
        
        return {
          id: template.id,
          name: template.name,
          description: template.description || "",
          difficulty: template.difficulty || "",
          category: template.category || "",
          duration_minutes: template.duration_minutes || null,
          equipment_needed: template.equipment_needed || "",
          exercises: workoutStructure,
          notes: template.notes || "",
          created_at: template.created_at
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
      
      if (state.filters.category) {
        filtered = filtered.filter(program => 
          program.category === state.filters.category
        );
      }
      
      return filtered;
    },
    
    isLoading: (state) => state.loading,
    
    // Get unique values for filter options
    difficulties: (state) => {
      const difficulties = state.programs
        .map(template => template.difficulty)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      return difficulties.sort();
    },
    
    categories: (state) => {
      const categories = state.programs
        .map(template => template.category)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index);
      return categories.sort();
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

        const response = await api.getSessionTemplates(params);
        
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
        this.error = error.response?.data?.detail || "Failed to fetch session templates";
        console.error("Error fetching session templates:", error);
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
        const response = await api.getSessionTemplate(id);
        const template = response.data;
        
        // Transform the template data to match our expected format
        let workoutStructure = [];
        try {
          workoutStructure = template.workout_structure ? JSON.parse(template.workout_structure) : [];
        } catch (e) {
          workoutStructure = [];
        }
        
        this.programDetail = {
          id: template.id,
          name: template.name,
          description: template.description || "",
          difficulty: template.difficulty || "",
          category: template.category || "",
          duration_minutes: template.duration_minutes || null,
          equipment_needed: template.equipment_needed || "",
          exercises: workoutStructure,
          notes: template.notes || "",
          created_at: template.created_at,
          updated_at: template.updated_at
        };
      } catch (error) {
        this.error = error.response?.data?.detail || "Failed to fetch session template details";
        console.error("Error fetching session template details:", error);
      } finally {
        this.loading = false;
      }
    },

    async createProgram(programData) {
      this.loading = true;
      this.error = null;

      try {
        // Transform program data to session template format
        const templateData = {
          name: programData.name,
          description: programData.description || null,
          category: programData.category || null,
          difficulty: programData.difficulty || null,
          duration_minutes: programData.duration_minutes || null,
          equipment_needed: programData.equipment_needed || null,
          workout_structure: programData.exercises ? JSON.stringify(programData.exercises) : null,
          notes: programData.notes || null
        };

        const response = await api.createSessionTemplate(templateData);
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
        // Transform program data to session template format
        const templateData = {
          name: programData.name,
          description: programData.description || null,
          category: programData.category || null,
          difficulty: programData.difficulty || null,
          duration_minutes: programData.duration_minutes || null,
          equipment_needed: programData.equipment_needed || null,
          workout_structure: programData.exercises ? JSON.stringify(programData.exercises) : null,
          notes: programData.notes || null
        };

        const response = await api.updateSessionTemplate(id, templateData);
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
        await api.deleteSessionTemplate(id);
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
        category: "",
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