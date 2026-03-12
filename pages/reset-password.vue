<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <template v-if="validSession">
          <h1>Set new password</h1>
          <p class="auth-subtitle">Choose a strong password for your account</p>

          <div v-if="errorMessage" class="alert alert-error" role="alert">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleReset" novalidate v-if="!successMessage">
            <div class="form-group">
              <label for="password" class="label-required">New Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="At least 8 characters"
                required
                aria-required="true"
                :aria-invalid="passwordError ? 'true' : 'false'"
                :aria-describedby="passwordError ? 'password-error' : 'password-hint'" />
              <p id="password-hint" class="help-text">Must be at least 8 characters</p>
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
                :aria-invalid="confirmError ? 'true' : 'false'"
                :aria-describedby="confirmError ? 'confirm-error' : undefined" />
              <p v-if="confirmError" id="confirm-error" class="alert alert-error" role="alert">
                {{ confirmError }}
              </p>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%; margin-top: 1rem;"
              :disabled="loading"
              :aria-busy="loading">
              <span v-if="loading" class="spinner" aria-hidden="true"></span>
              {{ loading ? 'Updating...' : 'Update Password' }}
            </button>
          </form>

          <div v-if="successMessage" class="auth-footer">
            <NuxtLink to="/login" class="btn btn-primary"
              style="width: 100%; display: block; text-align: center;">
              Back to Sign In
            </NuxtLink>
          </div>
        </template>

        <!-- Invalid / expired token -->
        <template v-else>
          <h1>Link expired</h1>
          <p class="auth-subtitle">
            This password reset link is invalid or has expired.
          </p>
          <NuxtLink
            to="/forgot-password"
            class="btn btn-primary"
            style="width: 100%; display: block; text-align: center;">
            Request a new link
          </NuxtLink>
        </template>

        <div class="auth-footer" v-if="!successMessage">
          <p>
            Remember your password?
            <NuxtLink to="/login" class="auth-link">Sign in</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const passwordError = ref('')
const confirmError = ref('')
const validSession = ref(false)

// Supabase sends the token in the URL hash as:
// #access_token=...&refresh_token=...&type=recovery
onMounted(async () => {
  const hash = window.location.hash
  const params = new URLSearchParams(hash.substring(1))
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const type = params.get('type')

  if (type === 'recovery' && accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (!error) {
      validSession.value = true
      // Clean the tokens out of the URL bar
      window.history.replaceState(null, '', window.location.pathname)
    }
  }
})

const handleReset = async () => {
  errorMessage.value = ''
  passwordError.value = ''
  confirmError.value = ''

  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }
  if (password.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }
  if (!confirmPassword.value) {
    confirmError.value = 'Please confirm your password'
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmError.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) {
      errorMessage.value = error.message
    } else {
      successMessage.value = 'Password updated successfully!'
      // Sign out all other sessions then redirect
      await supabase.auth.signOut({ scope: 'others' })
      setTimeout(() => router.push('/login'), 2000)
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Reset Password - Broadcast',
  meta: [
    { name: 'description', content: 'Set a new password for your Broadcast account' }
  ]
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  min-height: -webkit-fill-available;
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

.help-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: var(--space-xs) 0 0;
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

@media (max-width: 640px) {
  .auth-page {
    align-items: flex-start;
    padding: var(--space-md);
    padding-top: var(--space-xl);
  }

  .auth-card {
    padding: var(--space-xl) var(--space-lg);
  }
}
</style>