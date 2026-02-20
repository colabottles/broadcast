<template>
  <div class="auth-callback">
    <p>Completing sign in...</p>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()
const user = useSupabaseUser()

onMounted(async () => {
  console.log('Callback mounted, waiting for session...')

  // Wait a moment for Supabase to process the callback
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Check if we have a user
  const { data: { session }, error } = await supabase.auth.getSession()

  console.log('Session after OAuth:', session)
  console.log('User after OAuth:', user.value)

  if (session || user.value) {
    console.log('Redirecting to dashboard...')
    router.push('/')
  } else {
    console.error('No session found after OAuth')
    router.push('/login?error=no_session')
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 1.2rem;
}
</style>