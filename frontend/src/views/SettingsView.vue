<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <h1 class="text-3xl font-bold mb-4">
      Settings
    </h1>
    
    <div class="w-full max-w-md mb-6">
      <div class="flex justify-between mb-4">
        <button 
          :class="{'bg-indigo-600 text-white': activeTab === 'profile', 'bg-gray-200': activeTab !== 'profile'}" 
          class="py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @click="activeTab = 'profile'"
        >
          Profile
        </button>
        <button 
          :class="{'bg-indigo-600 text-white': activeTab === 'api', 'bg-gray-200': activeTab !== 'api'}" 
          class="py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @click="activeTab = 'api'"
        >
          API Settings
        </button>
      </div>
    </div>
    
    <!-- Profile Settings -->
    <form
      v-if="activeTab === 'profile'"
      class="bg-white p-6 rounded shadow-md w-full max-w-md"
      @submit.prevent="updateProfile"
    >
      <div class="mb-4">
        <label
          for="email"
          class="block text-sm font-medium text-gray-700"
        >Email</label>
        <input
          id="email"
          v-model="profile.email"
          type="email"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
      </div>
      <div class="mb-4">
        <label
          for="avatar"
          class="block text-sm font-medium text-gray-700"
        >Avatar</label>
        <div class="flex items-center">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            alt="Avatar"
            class="w-16 h-16 rounded-full mr-4"
          >
          <input
            id="avatar"
            type="file"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            @change="onAvatarChange"
          >
        </div>
      </div>
      <div class="mb-4">
        <label
          for="name"
          class="block text-sm font-medium text-gray-700"
        >Name</label>
        <input
          id="name"
          v-model="profile.name"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
      </div>
      <div
        v-if="error"
        class="mb-4 text-red-500 text-sm"
      >
        {{ error }}
      </div>
      <div
        v-if="!profile.is_verified"
        class="mb-4 text-yellow-500 text-sm"
      >
        Your email is not verified. 
        <button
          class="text-indigo-600 underline"
          @click="sendVerificationEmail"
        >
          Click here to resend verification email.
        </button>
      </div>
      <div
        v-if="success"
        class="mb-4 text-green-500 text-sm"
      >
        {{ success }}
      </div>
      <div
        v-if="error"
        class="mb-4 text-red-500 text-sm"
      >
        {{ error }}
      </div>
      <button
        class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mt-4"
        @click="confirmAccountDeletion"
      >
        Delete Account
      </button>
      <div
        v-if="success"
        class="mb-4 text-green-500 text-sm"
      >
        {{ success }}
      </div>
      <button
        type="submit"
        class="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Save Changes
      </button>
    </form>
    
    <!-- API Settings -->
    <div
      v-if="activeTab === 'api'"
      class="bg-white p-6 rounded shadow-md w-full max-w-md"
    >
      <h2 class="text-xl font-semibold mb-4">
        API Configuration
      </h2>
      
      <div class="mb-4">
        <label
          for="apiBaseUrl"
          class="block text-sm font-medium text-gray-700"
        >API Base URL</label>
        <input
          id="apiBaseUrl"
          v-model="apiSettings.baseUrl"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
        <p class="mt-2 text-sm text-gray-500">
          Current environment: {{ currentEnvironment }}
        </p>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Default Headers</label>
        <div
          v-for="(header, index) in apiSettings.headers"
          :key="index"
          class="flex mt-2"
        >
          <input
            v-model="header.key"
            type="text"
            placeholder="Header"
            class="w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
          <input
            v-model="header.value"
            type="text"
            placeholder="Value"
            class="w-2/3 ml-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>
        <button
          type="button"
          class="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
          @click="addHeader"
        >
          + Add Header
        </button>
      </div>
      
      <div
        v-if="apiError"
        class="mb-4 text-red-500 text-sm"
      >
        {{ apiError }}
      </div>
      <div
        v-if="apiSuccess"
        class="mb-4 text-green-500 text-sm"
      >
        {{ apiSuccess }}
      </div>
      
      <button
        class="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @click="saveApiSettings"
      >
        Save API Settings
      </button>
      
      <div class="mt-6 border-t pt-4">
        <h3 class="text-lg font-medium mb-2">
          API Status
        </h3>
        <button
          class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          @click="testApiConnection"
        >
          Test Connection
        </button>
        <div
          v-if="apiStatus"
          class="mt-2"
        >
          <div
            v-if="apiStatus.success"
            class="text-green-500"
          >
            ✅ Connected successfully
          </div>
          <div
            v-else
            class="text-red-500"
          >
            ❌ Connection failed: {{ apiStatus.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import apiConfig from "../config/apiConfig";

export default {
  name: "SettingsView",
  data() {
    return {
      activeTab: 'profile',
      profile: {
        email: "",
        name: "",
        avatar: null,
        avatar_url: "",
        is_verified: false,
      },
      apiSettings: {
        baseUrl: apiConfig.API_BASE_URL,
        headers: [
          { key: 'Content-Type', value: 'application/json' }
        ]
      },
      apiError: null,
      apiSuccess: null,
      apiStatus: null,
      currentEnvironment: process.env.NODE_ENV || 'development',
        async deleteAccount() {
          try {
            this.error = null;
            this.success = null;
            await axios.delete(`/users/me`);
            this.success = "Account deleted successfully!";
            setTimeout(() => {
              window.location.href = "/auth/login";
            }, 2000);
          } catch (err) {
            this.error = "Failed to delete account.";
          }
        },
        confirmAccountDeletion() {
          if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            this.deleteAccount();
          }
        },
      async sendVerificationEmail() {
        try {
          this.error = null;
          this.success = null;
          await axios.post("/auth/verify-email");
          this.success = "Verification email sent successfully!";
        } catch (err) {
          this.error = "Failed to send verification email.";
        }
      },
      error: null,
      success: null,
    };
  },
  mounted() {
    this.fetchProfile();
    
    // Load saved API settings if available
    const savedBaseUrl = localStorage.getItem('apiBaseUrl');
    const savedHeaders = localStorage.getItem('apiHeaders');
    
    if (savedBaseUrl) {
      this.apiSettings.baseUrl = savedBaseUrl;
    }
    
    if (savedHeaders) {
      try {
        this.apiSettings.headers = JSON.parse(savedHeaders);
      } catch (e) {
        console.error('Failed to parse saved API headers', e);
      }
    }
  },
  methods: {
    async fetchProfile() {
      try {
        const response = await axios.get("/users/me");
        this.profile = response.data;
        this.profile.is_verified = response.data.is_verified;
      } catch (err) {
        this.error = "Failed to load profile.";
      }
    },
    addHeader() {
      this.apiSettings.headers.push({ key: '', value: '' });
    },
    saveApiSettings() {
      try {
        this.apiError = null;
        this.apiSuccess = null;
        
        // Save API settings to localStorage
        localStorage.setItem('apiBaseUrl', this.apiSettings.baseUrl);
        localStorage.setItem('apiHeaders', JSON.stringify(this.apiSettings.headers));
        
        this.apiSuccess = "API settings saved successfully!";
        
        // Reload required for settings to take effect
        if (confirm("API settings saved. Reload the page for changes to take effect?")) {
          window.location.reload();
        }
      } catch (err) {
        this.apiError = "Failed to save API settings.";
      }
    },
    async testApiConnection() {
      try {
        this.apiStatus = null;
        
        // Try to connect to the API
        const response = await axios.get(`${this.apiSettings.baseUrl}`, {
          timeout: 5000
        });
        
        if (response.status === 200) {
          this.apiStatus = { success: true };
        } else {
          this.apiStatus = { 
            success: false, 
            message: `Unexpected status code: ${response.status}` 
          };
        }
      } catch (err) {
        this.apiStatus = { 
          success: false, 
          message: err.message || "Connection failed" 
        };
      }
    },
    async updateProfile() {
      try {
        this.error = null;
        this.success = null;

        const formData = new FormData();
        formData.append("email", this.profile.email);
        formData.append("name", this.profile.name);
        if (this.profile.avatar) {
          formData.append("avatar", this.profile.avatar);
        }

        await axios.patch("/users/me", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        this.success = "Profile updated successfully!";
      } catch (err) {
        this.error = "Failed to update profile.";
      }
    },
    onAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.profile.avatar = file;
        this.profile.avatar_url = URL.createObjectURL(file);
      }
    },
  },
};
</script>

<style scoped>
</style>
