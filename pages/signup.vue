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
          class="btn btn-oauth"
          @click="signUpWithGoogle"
          :disabled="loading"
          aria-label="Sign Up with Google">
          <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4"
              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
            <path fill="#34A853"
              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
            <path fill="#FBBC05"
              d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
            <path fill="#EA4335"
              d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
          </svg>
        </button>
        <button
          type="button"
          class="btn btn-oauth"
          @click="signUpWithGitHub"
          :disabled="loading"
          aria-label="Sign Up with GitHub">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </button>
        <button
          type="button"
          class="btn btn-oauth"
          @click="signUpWithLinkedIn"
          :disabled="loading"
          aria-label="Sign Up with LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
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

// GitHub Sign Up
const signUpWithGitHub = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/` }
    })
    if (error) throw error
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to sign up with GitHub'
  } finally {
    loading.value = false
  }
}

// LinkedIn Sign Up
const signUpWithLinkedIn = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: 'openid profile email'
      }
    })
    if (error) throw error
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to sign up with LinkedIn'
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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-md);
}

.auth-header h2 {
  margin-bottom: var(--space-xs);
  color: var(--color-text);
}

.auth-header p {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin: 0;
}

.oauth-buttons {
  display: flex;
  flex-direction: row;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.btn-oauth {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-oauth:hover:not(:disabled) {
  background-color: var(--color-bg);
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-oauth:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: var(--space-sm) 0;
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
  gap: var(--space-xs);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.form-group input {
  padding: var(--space-sm) var(--space-md);
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

.form-group input:-webkit-autofill,
.form-group input:-webkit-autofill:hover,
.form-group input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px var(--color-surface) inset;
  -webkit-text-fill-color: var(--color-text);
  transition: background-color 5000s ease-in-out 0s;
}

.help-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.btn-full {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-md);
  margin-top: var(--space-xs);
}

.terms-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
  line-height: 1.4;
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
  .auth-page {
    align-items: flex-start;
    padding: var(--space-md);
    padding-top: var(--space-lg);
  }

  .auth-container {
    max-width: 100%;
    width: 100%;
    margin-bottom: var(--space-lg);
  }
}
</style>