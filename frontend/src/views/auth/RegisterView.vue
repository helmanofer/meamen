<template>
  <AuthLayout>
    <template #title>
      Create your account
    </template>
    <template #subtitle>
      Or <router-link
        to="/login"
        class="font-medium text-primary-blue hover:text-dark-blue"
      >
        sign in to your existing account
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
      
      <!-- User Type Selection -->
      <div>
        <label class="form-label">I am a</label>
        <div class="grid grid-cols-2 gap-4 mt-1">
          <button 
            type="button" 
            :class="[
              'p-4 border rounded-md flex flex-col items-center justify-center text-center',
              userType === 'trainer' 
                ? 'border-primary-blue bg-light-blue text-primary-blue' 
                : 'border-medium-gray text-medium-gray hover:border-primary-blue hover:text-primary-blue'
            ]"
            @click.prevent="userType = 'trainer'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span class="font-medium">Trainer</span>
            <span class="text-xs mt-1">I train clients</span>
          </button>
          
          <button 
            type="button" 
            :class="[
              'p-4 border rounded-md flex flex-col items-center justify-center text-center',
              userType === 'trainee' 
                ? 'border-primary-blue bg-light-blue text-primary-blue' 
                : 'border-medium-gray text-medium-gray hover:border-primary-blue hover:text-primary-blue'
            ]"
            @click.prevent="userType = 'trainee'"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="font-medium">Trainee</span>
            <span class="text-xs mt-1">I work with a trainer</span>
          </button>
        </div>
      </div>

      <!-- Name Input -->
      <div>
        <label
          for="name"
          class="form-label"
        >Full name</label>
        <input 
          id="name" 
          v-model="name" 
          type="text" 
          autocomplete="name" 
          required 
          class="form-input" 
          :disabled="loading" 
        >
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
        <label
          for="password"
          class="form-label"
        >Password</label>
        <input 
          id="password" 
          v-model="password" 
          type="password" 
          autocomplete="new-password" 
          required 
          class="form-input" 
          :disabled="loading" 
        >
        <!-- Password Strength Indicator -->
        <div class="mt-1">
          <div class="flex h-1 overflow-hidden bg-light-gray rounded">
            <div 
              :class="[
                'transition-all duration-300 ease-in-out',
                passwordStrength < 2 ? 'bg-error' : passwordStrength < 3 ? 'bg-warning' : 'bg-success'
              ]"
              :style="{ width: `${passwordStrength * 25}%` }"
            />
          </div>
          <p class="text-xs mt-1 text-medium-gray">
            {{ passwordStrengthText }}
          </p>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="flex items-start">
        <input 
          id="terms" 
          v-model="acceptTerms" 
          type="checkbox" 
          required 
          class="h-4 w-4 mt-1 text-primary-blue focus:ring-primary-blue border-medium-gray rounded" 
          :disabled="loading" 
        >
        <label
          for="terms"
          class="ml-2 text-sm text-dark-gray"
        >
          I agree to the 
          <a
            href="#"
            class="text-primary-blue hover:text-dark-blue"
          >Terms of Service</a> 
          and 
          <a
            href="#"
            class="text-primary-blue hover:text-dark-blue"
          >Privacy Policy</a>
        </label>
      </div>

      <!-- Submit Button -->
      <div>
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
          :disabled="loading || !acceptTerms || !userType"
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
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </div>
    </form>

    <template #footer>
      <p class="text-sm text-medium-gray">
        Already have an account? 
        <router-link
          to="/login"
          class="font-medium text-primary-blue hover:text-dark-blue"
        >
          Sign in
        </router-link>
      </p>
    </template>
  </AuthLayout>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const userType = ref('trainer')
    const acceptTerms = ref(false)
    const loading = ref(false)
    const error = ref('')
    
    const passwordStrength = computed(() => {
      const value = password.value
      if (!value) return 0
      
      let score = 0
      
      // Length
      if (value.length > 5) score += 1
      if (value.length > 8) score += 1
      
      // Complexity
      if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
      if (/[0-9]/.test(value)) score += 1
      if (/[^A-Za-z0-9]/.test(value)) score += 1
      
      return Math.min(4, score)
    })
    
    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value
      if (strength === 0) return 'Enter a password'
      if (strength === 1) return 'Password is weak'
      if (strength === 2) return 'Password is fair'
      if (strength === 3) return 'Password is good'
      return 'Password is strong'
    })
    
    const handleSubmit = async () => {
      if (!userType.value || !acceptTerms.value) return
      
      loading.value = true
      error.value = ''
      
      try {
        const success = await authStore.register({
          name: name.value,
          email: email.value,
          password: password.value,
          role: userType.value
        })
        
        if (success) {
          router.push('/dashboard')
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
      name,
      email,
      password,
      userType,
      acceptTerms,
      loading,
      error,
      passwordStrength,
      passwordStrengthText,
      handleSubmit
    }
  }
}
</script>