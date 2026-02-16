import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify cron secret to prevent unauthorized access
  const authHeader = getHeader(event, 'authorization')
  const cronSecret = config.cronSecret

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  try {
    // Reset posts_this_month to 0 for all users
    const { error } = await supabase
      .from('profiles')
      .update({ posts_this_month: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all users

    if (error) {
      throw error
    }

    console.log('Monthly post limits reset successfully')

    return {
      success: true,
      message: 'Monthly post limits reset',
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Failed to reset monthly limits:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to reset monthly limits'
    })
  }
})