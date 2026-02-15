import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  // Get user from middleware
  const user = event.context.user
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const body = await readBody(event)
  if (!body.instance) {
    throw createError({
      statusCode: 400,
      message: 'Instance URL is required'
    })
  }

  try {
    // Register app with Mastodon instance
    const registerResponse = await fetch(`${body.instance}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_name: 'Broadcast',
        redirect_uris: config.mastodonCallbackUrl,
        scopes: 'read write',
        website: config.public.siteUrl
      })
    })

    if (!registerResponse.ok) {
      const errorText = await registerResponse.text()
      console.error('Mastodon registration error:', errorText)
      throw new Error('Failed to register with Mastodon instance')
    }

    const appData = await registerResponse.json()

    // Generate state for CSRF protection
    const state = crypto.randomUUID()

    // Generate authorization URL
    const params = new URLSearchParams({
      client_id: appData.client_id,
      redirect_uri: config.mastodonCallbackUrl as string,
      response_type: 'code',
      scope: 'read write',
      state: state
    })

    const authUrl = `${body.instance}/oauth/authorize?${params.toString()}`

    // Store state and app credentials for callback
    const { data: insertData, error: insertError } = await supabase
      .from('oauth_state')
      .insert({
        user_id: user.id,
        state: state,
        platform: 'mastodon',
        instance_url: body.instance,
        client_id: appData.client_id,
        client_secret: appData.client_secret,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      })
      .select()

    if (insertError) {
      console.error('Failed to save oauth_state:', insertError)
      throw new Error(`Failed to save OAuth state: ${insertError.message}`)
    }

    console.log('OAuth state saved successfully:', insertData)

    return {
      authUrl: authUrl
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to connect to Mastodon'
    })
  }
})