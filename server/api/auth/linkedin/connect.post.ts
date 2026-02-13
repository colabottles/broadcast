import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  // Get user from session
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  try {
    // Get user from Supabase
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Generate random state for CSRF protection
    const state = crypto.randomUUID()

    // LinkedIn OAuth 2.0 scopes
    const scopes = [
      'openid',
      'profile',
      'email',
      'w_member_social' // Permission to post on behalf of user
    ].join(' ')

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.linkedinClientId as string,
      redirect_uri: config.linkedinCallbackUrl as string,
      state: state,
      scope: scopes
    })

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`

    // Store state in database for callback verification
    await supabase
      .from('oauth_state')
      .insert({
        user_id: user.id,
        state: state,
        platform: 'linkedin',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })

    return {
      authUrl: authUrl
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to initialize LinkedIn OAuth'
    })
  }
})