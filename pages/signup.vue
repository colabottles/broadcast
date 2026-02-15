<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Create your account</h1>
        <p class="auth-subtitle">Start broadcasting to multiple platforms</p>

        <!-- Status Messages -->
        <div v-if="errorMessage" class="alert alert-error" role="alert">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>

        <!-- Signup Form -->
        <form @submit.prevent="handleSignup" novalidate>
          <div class="form-group">
            <label for="name" class="label-required">Full Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              placeholder="John Doe"
              required
              aria-required="true" />
          </div>

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
              :aria-describedby="emailError ? 'email-error' : undefined" />
            <p v-if="emailError" id="email-error" class="alert alert-error" role="alert">
              {{ emailError }}
            </p>
          </div>

          <div class="form-group">
            <label for="password" class="label-required">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="At least 8 characters"
              required
              aria-required="true"
              :aria-invalid="passwordError ? 'true' : 'false'"
              :aria-describedby="passwordError ? 'password-error' : 'password-help'" />
            <p id="password-help" class="sr-only">
              Password must be at least 8 characters long
            </p>
            <p v-if="passwordError" id="password-error" class="alert alert-error" role="alert">
              {{ passwordError }}
            </p>
          </div>

          <div class="form-group">
            <label for="confirm-password" class="label-required">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              required
              aria-required="true"
              :aria-invalid="confirmPasswordError ? 'true' : 'false'"
              :aria-describedby="confirmPasswordError ? 'confirm-password-error' : undefined" />
            <p v-if="confirmPasswordError" id="confirm-password-error" class="alert alert-error"
              role="alert">
              {{ confirmPasswordError }}
            </p>
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            style="width: 100%; margin-top: 1rem;"
            :disabled="loading"
            :aria-busy="loading">
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <!-- Terms -->
        <p class="auth-terms">
          By creating an account, you agree to our
          <a href="/terms" class="auth-link">Terms of Service</a>
          and
          <a href="/privacy" class="auth-link">Privacy Policy</a>
        </p>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or</span>
        </div>

        <!-- OAuth Providers -->
        <div class="oauth-buttons">
          <button
            @click="handleOAuthLogin('google')"
            class="btn btn-outline oauth-btn"
            :disabled="loading">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
              <path fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
              <path fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z" />
              <path fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <button
            @click="handleOAuthLogin('github')"
            class="btn btn-outline oauth-btn"
            :disabled="loading">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continue with GitHub
          </button>

          <button
            @click="handleOAuthLogin('linkedin_oidc')"
            class="btn btn-outline oauth-btn"
            :disabled="loading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077B5" aria-hidden="true">
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <!-- Footer Links -->
        <div class="auth-footer">
          <p>
            Already have an account?
            <NuxtLink to="/login" class="auth-link">Sign in</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

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
    router.push('/')
  }
})

// Validate email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Handle signup
const handleSignup = async () => {
  // Reset errors
  errorMessage.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validation
  if (!name.value) {
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
  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
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
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

// Handle OAuth login
const handleOAuthLogin = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
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
  title: 'Sign up - Broadcast',
  meta: [
    { name: 'description', content: 'Create a Broadcast account and start posting to multiple social media platforms' }
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

.auth-terms {
  margin-top: var(--space-md);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
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

.auth-footer {
  margin-top: var(--space-xl);
  text-align: center;
}

.auth-footer p {
  margin: 0;
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