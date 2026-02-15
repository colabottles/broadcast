import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify cron secret
  const authHeader = getHeader(event, 'authorization')
  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  // Reset posts_this_month for all users
  const { error } = await supabase
    .from('profiles')
    .update({ posts_this_month: 0 })
    .neq('id', '00000000-0000-0000-0000-000000000000') // Update all

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to reset monthly limits'
    })
  }

  return {
    success: true,
    message: 'Monthly post limits reset successfully',
    timestamp: new Date().toISOString()
  }
})