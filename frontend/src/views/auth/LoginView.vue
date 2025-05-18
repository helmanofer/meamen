<template>
  <AuthLayout>
    <template #title> Sign in to your account </template>
    <template #subtitle>
      Or
      <router-link
        to="/register"
        class="font-medium text-primary-blue hover:text-dark-blue"
        >create a new account</router-link
      >
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Error Alert -->
      <div v-if="error" class="p-3 bg-red-100 text-error text-sm rounded-md">
        {{ error }}
      </div>

      <!-- Email Input -->
      <div>
        <label for="email" class="form-label">Email address</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="form-input"
          :disabled="loading"
        />
      </div>

      <!-- Password Input -->
      <div>
        <div class="flex justify-between">
          <label for="password" class="form-label">Password</label>
          <router-link
            to="/forgot-password"
            class="text-sm text-primary-blue hover:text-dark-blue"
          >
            Forgot your password?
          </router-link>
        </div>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
          class="form-input"
          :disabled="loading"
        />
      </div>

      <!-- Remember Me Checkbox -->
      <div class="flex items-center">
        <input
          id="remember_me"
          v-model="rememberMe"
          type="checkbox"
          class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-medium-gray rounded"
          :disabled="loading"
        />
        <label for="remember_me" class="ml-2 block text-sm text-dark-gray">
          Remember me
        </label>
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
          :disabled="loading"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>
      </div>
    </form>

    <template #footer>
      <p class="text-sm text-medium-gray">
        New to Meamen?
        <router-link
          to="/register"
          class="font-medium text-primary-blue hover:text-dark-blue"
        >
          Create an account
        </router-link>
      </p>
    </template>
  </AuthLayout>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "LoginView",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const email = ref("");
    const password = ref("");
    const rememberMe = ref(false);
    const loading = ref(false);
    const error = ref("");

    const handleSubmit = async () => {
      loading.value = true;
      error.value = "";

      try {
        const success = await authStore.login({
          username: email.value,
          password: password.value,
        });

        if (success) {
          router.push("/dashboard");
        } else {
          error.value = authStore.error;
        }
      } catch (err) {
        error.value = "An unexpected error occurred. Please try again.";
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      password,
      rememberMe,
      loading,
      error,
      handleSubmit,
    };
  },
};
</script>
