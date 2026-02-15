import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  const platform = body.platform

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  // Get current connection count
  const { data: connections, count } = await supabase
    .from('platform_connections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const currentCount = count || 0

  // Platform limits by tier
  const platformLimits: Record<string, number> = {
    starter: 2,
    creator: 999,  // Unlimited
    professional: 999,
    enterprise: 999
  }

  const limit = platformLimits[profile?.subscription_tier || 'starter']

  if (currentCount >= limit) {
    throw createError({
      statusCode: 403,
      message: `Platform limit reached (${limit}). Upgrade your plan to connect more platforms.`
    })
  }

  return {
    canConnect: true,
    currentCount,
    limit
  }
})