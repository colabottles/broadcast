import { createClient } from '@supabase/supabase-js'

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
    // Verify state
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_state')
      .select('*')
      .eq('state', state)
      .eq('platform', 'linkedin')
      .single()

    if (stateError || !stateRecord) {
      throw new Error('Invalid state parameter')
    }

    // Check if state has expired
    if (new Date(stateRecord.expires_at) < new Date()) {
      throw new Error('State has expired')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.linkedinCallbackUrl as string,
        client_id: config.linkedinClientId as string,
        client_secret: config.linkedinClientSecret as string,
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile')
    }

    const profileData = await profileResponse.json()

    // Store connection in database
    const { error: insertError } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: stateRecord.user_id,
        platform: 'linkedin',
        platform_user_id: profileData.sub,
        platform_username: profileData.name || profileData.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        is_active: true
      }, {
        onConflict: 'user_id,platform'
      })

    if (insertError) {
      throw new Error('Failed to save LinkedIn connection')
    }

    // Delete used state
    await supabase
      .from('oauth_state')
      .delete()
      .eq('state', state)

    // Redirect to platforms page
    return sendRedirect(event, `${config.public.siteUrl}/platforms?connected=linkedin`)
  } catch (error: any) {
    console.error('LinkedIn OAuth error:', error)
    return sendRedirect(event, `${config.public.siteUrl}/platforms?error=${encodeURIComponent(error.message)}`)
  }
})