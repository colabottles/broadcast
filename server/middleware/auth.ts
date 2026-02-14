import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Skip auth check for public API routes
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/stripe/webhook'
  ]

  if (publicPaths.some(path => event.path?.startsWith(path))) {
    return
  }

  // Only check auth for API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  try {
    // Use the Nuxt Supabase composable
    const user = await serverSupabaseUser(event)

    if (user) {
      event.context.user = user
    }
  } catch (error) {
    // If there's an error getting the user, just continue
    // The individual API routes will handle unauthorized access
    console.error('Auth middleware error:', error)
  }
})