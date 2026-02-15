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

  const { error } = await supabase
    .from('platform_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', 'bluesky')

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to disconnect Bluesky'
    })
  }

  return { success: true }
})
