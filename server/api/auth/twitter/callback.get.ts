import { createClient } from '@supabase/supabase-js'
import { TwitterApi } from 'twitter-api-v2'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string

  if (!code || !state) {
    throw createError({
      statusCode: 400,
      message: 'Missing code or state parameter'
    })
  }

  try {
    // Verify state and get code verifier
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_state')
      .select('*')
      .eq('state', state)
      .eq('platform', 'twitter')
      .single()

    if (stateError || !stateRecord) {
      throw new Error('Invalid state parameter')
    }

    // Check if state has expired
    if (new Date(stateRecord.expires_at) < new Date()) {
      throw new Error('State has expired')
    }

    // Initialize Twitter client
    const client = new TwitterApi({
      clientId: config.twitterClientId as string,
      clientSecret: config.twitterClientSecret as string,
    })

    // Exchange code for access token
    const { client: loggedClient, accessToken, refreshToken } = await client.loginWithOAuth2({
      code,
      codeVerifier: stateRecord.code_verifier,
      redirectUri: config.twitterCallbackUrl as string,
    })

    // Get user profile
    const { data: userData } = await loggedClient.v2.me()

    // Store connection in database
    const { error: insertError } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: stateRecord.user_id,
        platform: 'twitter',
        platform_user_id: userData.id,
        platform_username: userData.username,
        access_token: accessToken,
        refresh_token: refreshToken,
        is_active: true
      }, {
        onConflict: 'user_id,platform'
      })

    if (insertError) {
      throw new Error('Failed to save Twitter connection')
    }

    // Delete used state
    await supabase
      .from('oauth_state')
      .delete()
      .eq('state', state)

    // Redirect to platforms page
    return sendRedirect(event, `${config.public.siteUrl}/platforms?connected=twitter`)
  } catch (error: any) {
    console.error('Twitter OAuth error:', error)
    return sendRedirect(event, `${config.public.siteUrl}/platforms?error=${encodeURIComponent(error.message)}`)
  }
})