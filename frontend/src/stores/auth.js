import { defineStore } from "pinia";
import authService from "../services/authService";
import axios from "axios";
import apiConfig from "../config/apiConfig";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: () => authService.isAuthenticated(),
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        // Use authService for login
        await authService.login(credentials);
        
        // Fetch user details
        await this.fetchUserProfile();

        return true;
      } catch (error) {
        this.error =
          error.response?.data?.detail || "Login failed. Please try again.";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        // Use authService for registration
        await authService.register(userData);

        // Fetch user details
        await this.fetchUserProfile();

        return true;
      } catch (error) {
        this.error =
          error.response?.data?.detail ||
          "Registration failed. Please try again.";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserProfile() {
      if (!authService.isAuthenticated()) return;

      this.loading = true;

      try {
        const token = authService.getToken();
        const response = await axios.get(apiConfig.auth.me, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.user = response.data;
      } catch (error) {
        this.error = "Failed to fetch user profile";
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      authService.logout();
    },

    async forgotPassword(email) {
      this.loading = true;
      this.error = null;

      try {
        await axios.post(apiConfig.auth.forgotPassword, { email });
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.detail ||
          "Failed to send password reset email";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(token, newPassword) {
      this.loading = true;
      this.error = null;

      try {
        await axios.post(apiConfig.auth.resetPassword, {
          token,
          password: newPassword
        });
        return true;
      } catch (error) {
        this.error = error.response?.data?.detail || "Password reset failed";
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
