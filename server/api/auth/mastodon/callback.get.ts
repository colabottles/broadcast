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
      .eq('platform', 'mastodon')
      .single()

    if (stateError || !stateRecord) {
      throw new Error('Invalid state parameter')
    }

    // Check if state has expired (increased to 30 minutes)
    if (new Date(stateRecord.expires_at) < new Date()) {
      throw new Error('State has expired')
    }

    const instanceUrl = stateRecord.instance_url

    // Exchange code for access token - FIXED: parenthesis instead of backtick
    const tokenResponse = await fetch(`${instanceUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: stateRecord.client_id,
        client_secret: stateRecord.client_secret,
        redirect_uri: config.mastodonCallbackUrl as string,
        scope: 'read write'
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Failed to exchange code for token: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()

    // Get user profile - FIXED: parenthesis instead of backtick
    const profileResponse = await fetch(`${instanceUrl}/api/v1/accounts/verify_credentials`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      throw new Error(`Failed to fetch Mastodon profile: ${errorText}`)
    }

    const profileData = await profileResponse.json()

    // Store connection in database
    const { error: insertError } = await supabase
      .from('platform_connections')
      .upsert({
        user_id: stateRecord.user_id,
        platform: 'mastodon',
        platform_user_id: profileData.id,
        platform_username: profileData.username,
        access_token: tokenData.access_token,
        instance_url: instanceUrl,
        is_active: true
      }, {
        onConflict: 'user_id,platform'
      })

    if (insertError) {
      throw new Error('Failed to save Mastodon connection')
    }

    // Delete used state
    await supabase
      .from('oauth_state')
      .delete()
      .eq('state', state)

    // Redirect to platforms page
    return sendRedirect(event, `${config.public.siteUrl}/platforms?connected=mastodon`)

  } catch (error: any) {
    console.error('Mastodon OAuth error:', error)
    return sendRedirect(event, `${config.public.siteUrl}/platforms?error=${encodeURIComponent(error.message)}`)
  }
})