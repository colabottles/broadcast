<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h2>Create Account</h2>
        <p>Start broadcasting your message across platforms.</p>
      </div>

      <!-- OAuth Buttons -->
      <div class="oauth-buttons">
        <button
          type="button"
          class="btn btn-oauth btn-google"
          @click="signUpWithGoogle"
          :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4"
              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
            <path fill="#34A853"
              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
            <path fill="#FBBC05"
              d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
            <path fill="#EA4335"
              d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
          </svg>
          Continue with Google
        </button>
      </div>

      <div class="divider">
        <span>Or sign up with email</span>
      </div>

      <form @submit.prevent="handleSignup" class="auth-form">
        <!-- Full Name -->
        <div class="form-group">
          <label for="full-name">Full Name</label>
          <input
            id="full-name"
            v-model="fullName"
            type="text"
            placeholder="John Doe"
            required
            autocomplete="name" />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            autocomplete="email" />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password" />
          <p class="help-text">Must be at least 8 characters</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-error" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn btn-primary btn-full"
          :disabled="loading">
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>

        <!-- Terms -->
        <p class="terms-text">
          By creating an account, you agree to our
          <NuxtLink to="/terms">Terms of Service</NuxtLink> and
          <NuxtLink to="/privacy">Privacy Policy</NuxtLink>.
        </p>

        <!-- Sign In Link -->
        <p class="auth-switch">
          Already have an account?
          <NuxtLink to="/login">Sign in</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

// Form state
const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Google Sign Up
const signUpWithGoogle = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })

    if (error) throw error
  } catch (error: any) {
    console.error('Google sign-up error:', error)
    errorMessage.value = error.message || 'Failed to sign up with Google'
  } finally {
    loading.value = false
  }
}

// Email/Password Sign Up
const handleSignup = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value
        }
      }
    })

    if (error) throw error

    // Check if email confirmation is required
    if (data.user && !data.session) {
      successMessage.value = 'Check your email for the confirmation link!'
    } else {
      // Redirect to dashboard
      router.push('/')
    }
  } catch (error: any) {
    console.error('Signup error:', error)

    if (error.message.includes('User already registered')) {
      errorMessage.value = 'An account with this email already exists. Please sign in.'
    } else {
      errorMessage.value = error.message || 'Failed to create account'
    }
  } finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: 'Sign Up - Broadcast',
  meta: [
    { name: 'description', content: 'Create your Broadcast account and start posting to multiple social media platforms' }
  ]
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.auth-header h2 {
  margin-bottom: var(--space-sm);
  color: var(--color-text);
}

.auth-header p {
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.btn-oauth {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  background-color: white;
  color: var(--color-text);
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-oauth:hover:not(:disabled) {
  background-color: var(--color-bg);
  border-color: var(--color-text-muted);
}

.btn-oauth:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: var(--space-lg) 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.divider span {
  padding: 0 var(--space-md);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.form-group input {
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  transition: border-color var(--transition-base);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.btn-full {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--font-size-md);
}

.terms-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
}

.terms-text a {
  color: var(--color-primary);
  text-decoration: none;
}

.terms-text a:hover {
  text-decoration: underline;
}

.auth-switch {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.auth-switch a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-switch a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .auth-container {
    padding: var(--space-xl);
  }
}
</style>