<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <h1 class="text-3xl font-bold mb-4">Profile Settings</h1>
    <form @submit.prevent="updateProfile" class="bg-white p-6 rounded shadow-md w-full max-w-md">
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          v-model="profile.email"
          type="email"
          id="email"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div class="mb-4">
        <label for="avatar" class="block text-sm font-medium text-gray-700">Avatar</label>
        <div class="flex items-center">
          <img
            v-if="profile.avatar_url"
            :src="profile.avatar_url"
            alt="Avatar"
            class="w-16 h-16 rounded-full mr-4"
          />
          <input
            type="file"
            id="avatar"
            @change="onAvatarChange"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input
          v-model="profile.name"
          type="text"
          id="name"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div v-if="error" class="mb-4 text-red-500 text-sm">{{ error }}</div>
      <div v-if="!profile.is_verified" class="mb-4 text-yellow-500 text-sm">
        Your email is not verified. 
        <button @click="sendVerificationEmail" class="text-indigo-600 underline">
          Click here to resend verification email.
        </button>
      </div>
      <div v-if="success" class="mb-4 text-green-500 text-sm">{{ success }}</div>
      <div v-if="error" class="mb-4 text-red-500 text-sm">{{ error }}</div>
      <button
        @click="confirmAccountDeletion"
        class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mt-4"
      >
        Delete Account
      </button>
      <div v-if="success" class="mb-4 text-green-500 text-sm">{{ success }}</div>
      <button
        type="submit"
        class="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Save Changes
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SettingsView",
  data() {
    return {
      profile: {
        email: "",
        name: "",
        avatar: null,
        avatar_url: "",
        is_verified: false,
      },
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
  mounted() {
    this.fetchProfile();
  },
};
</script>

<style scoped>
</style>
