import { createClient } from '@supabase/supabase-js'
import { AtpAgent } from '@atproto/api'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  // Get user from session
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)

  if (!body.handle || !body.password) {
    throw createError({
      statusCode: 400,
      message: 'Handle and password are required'
    })
  }

  try {
    // Create Bluesky agent
    const agent = new AtpAgent({
      service: 'https://bsky.social'
    })

    // Login to Bluesky
    const loginResponse = await agent.login({
      identifier: body.handle,
      password: body.password
    })

    if (!loginResponse.success || !agent.session) {
      throw new Error('Login failed')
    }

    // Extract handle from login response or identifier
    const handle = body.handle.replace('@', '')

    // Store connection in database
    const { error } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: user.id,
        platform: 'bluesky',
        platform_user_id: agent.session.did,
        platform_username: handle,
        access_token: agent.session.accessJwt,
        refresh_token: agent.session.refreshJwt,
        is_active: true
      }, {
        onConflict: 'user_id,platform'
      })

    if (error) {
      throw new Error('Failed to save connection')
    }

    return {
      success: true,
      platform: 'bluesky',
      username: handle
    }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Failed to connect Bluesky account'
    })
  }
})