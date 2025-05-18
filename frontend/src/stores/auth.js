import { defineStore } from "pinia";
import axios from "axios";

import API_BASE_URL from "../config/apiConfig";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();
        for (const key in credentials) {
          formData.append(key, credentials[key]);
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/jwt/login`,
          formData
        );
        this.token = response.data.access_token;
        localStorage.setItem("token", this.token);

        // Fetch user details
        await this.fetchUserProfile();

        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Login failed. Please try again.";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/auth/register", userData);
        this.token = response.data.token;
        localStorage.setItem("token", this.token);

        // Fetch user details
        await this.fetchUserProfile();

        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Registration failed. Please try again.";
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserProfile() {
      if (!this.token) return;

      this.loading = true;

      try {
        const response = await axios.get("h/users/me", {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        this.user = response.data.id;
      } catch (error) {
        this.error = "Failed to fetch user profile";
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    },

    async forgotPassword(email) {
      this.loading = true;
      this.error = null;

      try {
        await axios.post("/api/auth/forgot-password", { email });
        return true;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
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
        await axios.post("/api/auth/reset-password", {
          token,
          password: newPassword,
        });
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || "Password reset failed";
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
