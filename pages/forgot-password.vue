<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Reset your password</h1>
        <p class="auth-subtitle">Enter your email to receive a password reset link</p>

        <!-- Status Messages -->
        <div v-if="errorMessage" class="alert alert-error" role="alert">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success" role="alert">
          {{ successMessage }}
        </div>

        <!-- Reset Form -->
        <form @submit.prevent="handleReset" novalidate v-if="!successMessage">
          <div class="form-group">
            <label for="email" class="label-required">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              aria-required="true" />
          </div>

          <button
            type="submit"
            class="btn btn-primary"
            style="width: 100%; margin-top: 1rem;"
            :disabled="loading">
            {{ loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <!-- Footer Links -->
        <div class="auth-footer">
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
const config = useRuntimeConfig()

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleReset = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value) {
    errorMessage.value = 'Email is required'
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${config.public.siteUrl}/reset-password`,
    })

    if (error) {
      errorMessage.value = error.message
    } else {
      successMessage.value = 'Check your email for a password reset link!'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Reset Password - Broadcast',
  meta: [
    { name: 'description', content: 'Reset your Broadcast account password' }
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