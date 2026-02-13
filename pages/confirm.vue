<template>
  <div class="confirm-page">
    <div class="confirm-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner" style="width: 3rem; height: 3rem;" aria-hidden="true"></div>
        <h2>Confirming your account...</h2>
        <p>Please wait while we complete your sign in.</p>
      </div>

      <div v-else-if="error" class="error-state">
        <h2>Something went wrong</h2>
        <p class="alert alert-error">{{ error }}</p>
        <NuxtLink to="/login" class="btn btn-primary">
          Back to login
        </NuxtLink>
      </div>

      <div v-else class="success-state">
        <h2>Account confirmed!</h2>
        <p>Redirecting you to your dashboard...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  // Check if there's a session
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    // Successfully authenticated, redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } else {
    error.value = 'Could not confirm your account. Please try again.'
  }

  loading.value = false
})

useHead({
  title: 'Confirming Account - Broadcast',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background-color: var(--color-surface);
}

.confirm-container {
  max-width: 500px;
  width: 100%;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  text-align: center;
}

.loading-state,
.error-state,
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

.loading-state h2,
.error-state h2,
.success-state h2 {
  margin: 0;
}

.loading-state p,
.error-state p,
.success-state p {
  color: var(--color-text-muted);
  margin: 0;
}
</style>
