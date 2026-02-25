import { createClient } from '@supabase/supabase-js'
import { AtpAgent } from '@atproto/api'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const query = getQuery(event)
  const q = (query.q as string || '').trim()
  const platform = (query.platform as string || '').trim()

  if (!q || q.length < 2) {
    return { results: [] }
  }

  // Get user's connection for the requested platform
  const { data: connection } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .eq('is_active', true)
    .single()

  if (!connection) {
    return { results: [] }
  }

  try {
    switch (platform) {
      case 'bluesky':
        return await searchBlueskyUsers(connection, q)
      case 'mastodon':
        return await searchMastodonUsers(connection, q)
      case 'linkedin':
        // LinkedIn has no people search API for third-party apps
        return { results: [] }
      default:
        return { results: [] }
    }
  } catch (error: any) {
    console.error(`User search error for ${platform}:`, error)
    return { results: [] }
  }
})

async function searchBlueskyUsers(connection: any, q: string) {
  const agent = new AtpAgent({ service: 'https://bsky.social' })

  await agent.resumeSession({
    did: connection.platform_user_id,
    handle: connection.platform_username,
    accessJwt: connection.access_token,
    refreshJwt: connection.refresh_token,
    active: true
  })

  const response = await agent.api.app.bsky.actor.searchActors({ q, limit: 8 })

  const results = response.data.actors.map((actor: any) => ({
    platform: 'bluesky',
    id: actor.did,
    handle: actor.handle,
    display_name: actor.displayName || actor.handle,
    avatar: actor.avatar || null,
    // For insertion into post text
    mention_text: `@${actor.handle}`
  }))

  return { results }
}

async function searchMastodonUsers(connection: any, q: string) {
  const response = await fetch(
    `${connection.instance_url}/api/v2/search?q=${encodeURIComponent(q)}&type=accounts&limit=8`,
    {
      headers: {
        'Authorization': `Bearer ${connection.access_token}`
      }
    }
  )

  if (!response.ok) {
    throw new Error('Mastodon search failed')
  }

  const data = await response.json()

  const results = (data.accounts || []).map((account: any) => {
    // Build full handle including instance for cross-instance mentions
    const instanceHost = new URL(connection.instance_url).host
    const fullHandle = account.acct.includes('@')
      ? `@${account.acct}`
      : `@${account.acct}@${instanceHost}`

    return {
      platform: 'mastodon',
      id: account.id,
      handle: account.acct,
      display_name: account.display_name || account.username,
      avatar: account.avatar || null,
      mention_text: fullHandle
    }
  })

  return { results }
}