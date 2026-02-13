import { createClient } from '@supabase/supabase-js'
import { TwitterApi } from 'twitter-api-v2'

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

    // Initialize Twitter OAuth 2.0 client
    const client = new TwitterApi({
      clientId: config.twitterClientId as string,
      clientSecret: config.twitterClientSecret as string,
    })

    // Generate OAuth 2.0 authorization URL
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      config.twitterCallbackUrl as string,
      {
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      }
    )

    // Store state and code verifier in database for callback verification
    await supabase
      .from('oauth_state')
      .insert({
        user_id: user.id,
        state: state,
        code_verifier: codeVerifier,
        platform: 'twitter',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })

    return {
      authUrl: url
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to initialize Twitter OAuth'
    })
  }
})