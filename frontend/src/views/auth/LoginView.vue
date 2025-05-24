<template>
  <AuthLayout>
    <template #title>
      Sign in to your account
    </template>
    <template #subtitle>
      Or
      <router-link
        to="/register"
        class="font-medium text-primary-blue hover:text-dark-blue"
      >
        create a new account
      </router-link>
    </template>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Error Alert -->
      <div
        v-if="error"
        class="p-3 bg-red-100 text-error text-sm rounded-md"
      >
        {{ error }}
      </div>

      <!-- Email Input -->
      <div>
        <label
          for="email"
          class="form-label"
        >Email address</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="form-input"
          :disabled="loading"
        >
      </div>

      <!-- Password Input -->
      <div>
        <div class="flex justify-between">
          <label
            for="password"
            class="form-label"
          >Password</label>
          <router-link
            to="/forgot-password"
            class="text-sm text-primary-blue hover:text-dark-blue"
          >
            Forgot your password?
          </router-link>
        </div>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="form-input pr-10"
            :disabled="loading"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3"
            @click="showPassword = !showPassword"
          >
            <svg
              v-if="showPassword"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Remember Me Checkbox -->
      <div class="flex items-center">
        <input
          id="remember_me"
          v-model="rememberMe"
          type="checkbox"
          class="h-4 w-4 text-primary-blue focus:ring-primary-blue border-medium-gray rounded"
          :disabled="loading"
        >
        <label
          for="remember_me"
          class="ml-2 block text-sm text-dark-gray"
        >
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
    const showPassword = ref(false);

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
      showPassword,
      handleSubmit,
    };
  },
};
</script>
