<template>
  <AuthLayout>
    <template #title>
      Reset your password
    </template>
    <template #subtitle>
      Enter your email address and we'll send you a link to reset your password
    </template>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Success Message -->
      <div v-if="success" class="p-3 bg-green-100 text-success text-sm rounded-md">
        We've sent you an email with instructions to reset your password. Please check your inbox.
      </div>

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
          :disabled="loading || success" 
        />
      </div>

      <!-- Submit Button -->
      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
          :disabled="loading || success"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </div>
    </form>

    <template #footer>
      <p class="text-sm text-medium-gray">
        Remember your password? 
        <router-link to="/login" class="font-medium text-primary-blue hover:text-dark-blue">
          Sign in
        </router-link>
      </p>
    </template>
  </AuthLayout>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const authStore = useAuthStore()
    
    const email = ref('')
    const loading = ref(false)
    const error = ref('')
    const success = ref(false)
    
    const handleSubmit = async () => {
      loading.value = true
      error.value = ''
      success.value = false
      
      try {
        const result = await authStore.forgotPassword(email.value)
        if (result) {
          success.value = true
        } else {
          error.value = authStore.error
        }
      } catch (err) {
        error.value = 'An unexpected error occurred. Please try again.'
        console.error(err)
      } finally {
        loading.value = false
      }
    }
    
    return {
      email,
      loading,
      error,
      success,
      handleSubmit
    }
  }
}
</script>