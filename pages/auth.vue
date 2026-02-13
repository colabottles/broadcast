<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>{{ isSignup ? 'Create your account' : 'Welcome back' }}</h1>
        <p class="auth-subtitle">
          {{ isSignup ? 'Start broadcasting to multiple platforms' : 'Sign in to continue posting' }}
        </p>

        <!-- Tab Switcher -->
        <div class="auth-tabs" role="tablist">
          <button
            role="tab"
            :aria-selected="!isSignup"
            :class="['auth-tab', { 'active': !isSignup }]"
            @click="isSignup = false"
          >
            Sign In
          </button>
          <button
            role="tab"
            :aria-selected="isSignup"
            :class="['auth-tab', { 'active': isSignup }]"
            @click="isSignup = true"
          >
            Sign Up
          </button>
        </div>

        <!-- Status Messages -->
        <div v-if="errorMessage" class="alert alert-error" role="alert">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>

        <!-- OAuth Providers -->
        <div class="oauth-buttons">
          <button
            @click="handleOAuthLogin('google')"
            class="btn btn-outline oauth-btn"
            :disabled="loading"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <button
            @click="handleOAuthLogin('github')"
            class="btn btn-outline oauth-btn"
            :disabled="loading"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Continue with GitHub
          </button>

          <button
            @click="handleOAuthLogin('twitter')"
            class="btn btn-outline oauth-btn"
            :disabled="loading"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Continue with Twitter
          </button>

          <button
            @click="handleOAuthLogin('discord')"
            class="btn btn-outline oauth-btn"
            :disabled="loading"
          >
            <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="#5865F2" aria-hidden="true">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            Continue with Discord
          </button>
        </div>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- Email/Password Form -->
        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Name (Sign Up Only) -->
          <div v-if="isSignup" class="form-group">
            <label for="name" class="label-required">Full Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="John Doe"
              required
              aria-required="true"
            />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="label-required">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              aria-required="true"
              :aria-invalid="emailError ? 'true' : 'false'"
              :aria-describedby="emailError ? 'email-error' : undefined"
            />
            <p v-if="emailError" id="email-error" class="alert alert-error" role="alert">
              {{ emailError }}
            </p>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="label-required">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              :placeholder="isSignup ? 'At least 8 characters' : '••••••••'"
              required
              aria-required="true"
              :aria-invalid="passwordError ? 'true' : 'false'"
              :aria-describedby="passwordError ? 'password-error' : 'password-help'"
            />
            <p v-if="isSignup" id="password-help" class="sr-only">
              Password must be at least 8 characters long
            </p>
            <p v-if="passwordError" id="password-error" class="alert alert-error" role="alert">
              {{ passwordError }}
            </p>
          </div>

          <!-- Confirm Password (Sign Up Only) -->
          <div v-if="isSignup" class="form-group">
            <label for="confirm-password" class="label-required">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              required
              aria-required="true"
              :aria-invalid="confirmPasswordError ? 'true' : 'false'"
              :aria-describedby="confirmPasswordError ? 'confirm-password-error' : undefined"
            />
            <p v-if="confirmPasswordError" id="confirm-password-error" class="alert alert-error" role="alert">
              {{ confirmPasswordError }}
            </p>
          </div>

          <!-- Forgot Password (Sign In Only) -->
          <div v-if="!isSignup" class="forgot-password">
            <NuxtLink to="/forgot-password" class="auth-link">Forgot password?</NuxtLink>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary"
            style="width: 100%; margin-top: 1rem;"
            :disabled="loading"
            :aria-busy="loading"
          >
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            {{ loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create account' : 'Sign in') }}
          </button>
        </form>

        <!-- Terms (Sign Up Only) -->
        <p v-if="isSignup" class="auth-terms">
          By creating an account, you agree to our
          <NuxtLink to="/terms" class="auth-link">Terms of Service</NuxtLink>
          and
          <NuxtLink to="/privacy" class="auth-link">Privacy Policy</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const route = useRoute()

// Determine initial tab from query parameter
const isSignup = ref(route.query.mode === 'signup')

// Form state
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Redirect if already logged in
watch(user, (newUser) => {
  if (newUser) {
    router.push('/dashboard')
  }
}, { immediate: true })

// Update URL when switching tabs
watch(isSignup, (newValue) => {
  router.replace({ query: { mode: newValue ? 'signup' : 'signin' } })
  // Clear errors when switching
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
})

// Validate email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Handle form submission
const handleSubmit = async () => {
  // Reset errors
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validation
  if (isSignup.value && !name.value) {
    errorMessage.value = 'Name is required'
    return
  }
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }
  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }
  if (isSignup.value && password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }
  if (!isSignup.value && password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }
  if (isSignup.value && !confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return
  }
  if (isSignup.value && password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    if (isSignup.value) {
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            full_name: name.value,
          },
        },
      })

      if (error) {
        errorMessage.value = error.message
      } else {
        successMessage.value = 'Account created! Please check your email to confirm your account.'
        // Clear form
        name.value = ''
        email.value = ''
        password.value = ''
        confirmPassword.value = ''
      }
    } else {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })

      if (error) {
        errorMessage.value = error.message
      } else {
        successMessage.value = 'Successfully signed in! Redirecting...'
        // Redirect happens automatically via the watcher
      }
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

// Handle OAuth login
const handleOAuthLogin = async (provider: 'google' | 'github' | 'twitter' | 'azure' | 'discord' | 'linkedin_oidc') => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/confirm`,
      },
    })

    if (error) {
      errorMessage.value = error.message
      loading.value = false
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred'
    loading.value = false
  }
}

// SEO
useHead({
  title: computed(() => isSignup.value ? 'Sign Up - Broadcast' : 'Sign In - Broadcast'),
  meta: [
    {
      name: 'description',
      content: computed(() =>
        isSignup.value
          ? 'Create a Broadcast account and start posting to multiple social media platforms'
          : 'Sign in to Broadcast and manage your social media posts'
      )
    }
  ]
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background-color: var(--color-surface);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.auth-card h1 {
  text-align: center;
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-2xl);
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: var(--space-xl);
}

.auth-tabs {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-xl);
  background-color: var(--color-surface);
  padding: var(--space-xs);
  border-radius: var(--radius-md);
}

.auth-tab {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-muted);
}

.auth-tab:hover {
  color: var(--color-text);
  background-color: var(--color-bg);
}

.auth-tab.active {
  background-color: var(--color-bg);
  color: var(--color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.auth-divider {
  position: relative;
  text-align: center;
  margin-block: var(--space-xl);
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-border);
}

.auth-divider span {
  position: relative;
  background-color: var(--color-bg);
  padding-inline: var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
}

.oauth-btn svg {
  flex-shrink: 0;
}

.forgot-password {
  text-align: right;
  margin-top: var(--space-sm);
}

.auth-terms {
  margin-top: var(--space-md);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.auth-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>