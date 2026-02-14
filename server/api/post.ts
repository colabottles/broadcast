import { createClient } from '@supabase/supabase-js'
import { TwitterApi } from 'twitter-api-v2'
import { AtpAgent } from '@atproto/api'

interface PostResult {
  success: boolean
  post_id?: string
  post_url?: string
  message?: string
}

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

  // Validate request
  if (!body.content || !body.platforms || body.platforms.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: content and platforms'
    })
  }

  // Check if scheduling is requested
  const isScheduled = body.scheduled_for && new Date(body.scheduled_for) > new Date()

  // Check user's post limit (unless scheduling)
  const { data: profile } = await supabase
    .from('profiles')
    .select('posts_this_month, post_limit, subscription_tier')
    .eq('id', user.id)
    .single()

  if (!isScheduled && profile && profile.posts_this_month >= profile.post_limit) {
    throw createError({
      statusCode: 403,
      message: `Post limit reached (${profile.post_limit}/${profile.post_limit}). Upgrade your plan to post more.`
    })
  }

  // Check if user can schedule posts (Creator+ plans)
  if (isScheduled && profile && !['creator', 'professional', 'enterprise'].includes(profile.subscription_tier)) {
    throw createError({
      statusCode: 403,
      message: 'Upgrade to Creator plan or higher to schedule posts.'
    })
  }

  // Get user's platform connections
  const { data: connections } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('user_id', user.id)
    .in('platform', body.platforms)
    .eq('is_active', true)

  if (!connections || connections.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No connected platforms found. Please connect your accounts first.'
    })
  }

  // Create post record in database
  const postStatus = isScheduled ? 'scheduled' : 'publishing'

  const { data: postRecord, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: body.content,
      tags: body.tags || [],
      platforms: body.platforms,
      images: body.images || [],
      status: postStatus,
      scheduled_for: isScheduled ? body.scheduled_for : null
    })
    .select()
    .single()

  if (postError || !postRecord) {
    throw createError({
      statusCode: 500,
      message: 'Failed to create post record'
    })
  }

  // If scheduled, return early (cron job will handle posting later)
  if (isScheduled) {
    return {
      success: true,
      scheduled: true,
      scheduled_for: body.scheduled_for,
      post_id: postRecord.id,
      message: 'Post scheduled successfully'
    }
  }

  // Post immediately
  const results: Record<string, PostResult> = {}

  // Post to each platform
  for (const connection of connections) {
    try {
      let result: PostResult

      switch (connection.platform) {
        case 'twitter':
          result = await postToTwitter(connection, body.content)
          break
        case 'bluesky':
          result = await postToBluesky(connection, body.content, body.images, body.tags)
          break
        case 'mastodon':
          result = await postToMastodon(connection, body.content)
          break
        case 'linkedin':
          result = await postToLinkedIn(connection, body.content)
          break
        default:
          result = {
            success: false,
            message: `Platform ${connection.platform} not yet supported`
          }
      }

      results[connection.platform] = {
        success: true,
        message: 'Posted successfully',
        post_id: result.post_id,
        post_url: result.post_url
      }

      // Save result to database
      await supabase
        .from('post_results')
        .insert({
          post_id: postRecord.id,
          platform: connection.platform,
          status: 'success',
          platform_post_id: result.post_id,
          platform_post_url: result.post_url
        })
    } catch (error: any) {
      results[connection.platform] = {
        success: false,
        message: error.message || 'Failed to post'
      }

      // Save failed result
      await supabase
        .from('post_results')
        .insert({
          post_id: postRecord.id,
          platform: connection.platform,
          status: 'failed',
          error_message: error.message
        })
    }
  }

  // Update post status
  const allSuccess = Object.values(results).every(r => r.success)
  await supabase
    .from('posts')
    .update({
      status: allSuccess ? 'published' : 'failed',
      published_at: allSuccess ? new Date().toISOString() : null
    })
    .eq('id', postRecord.id)

  return {
    success: true,
    results,
    post_id: postRecord.id,
    timestamp: new Date().toISOString()
  }
})

// Platform-specific posting functions
async function postToTwitter(connection: any, content: string): Promise<PostResult> {
  const client = new TwitterApi(connection.access_token)

  try {
    const tweet = await client.v2.tweet(content)

    return {
      success: true,
      post_id: tweet.data.id,
      post_url: `https://twitter.com/${connection.platform_username}/status/${tweet.data.id}`
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to post to Twitter')
  }
}

async function postToBluesky(connection: any, content: string, images?: any[], tags?: string[]): Promise<PostResult> {
  const agent = new AtpAgent({
    service: 'https://bsky.social'
  })

  await agent.resumeSession({
    did: connection.platform_user_id,
    handle: connection.platform_username,
    accessJwt: connection.access_token,
    refreshJwt: connection.refresh_token,
    active: true
  })

  try {
    // Add hashtags to content
    let fullText = content
    const facets: Array<{
      index: { byteStart: number; byteEnd: number }
      features: Array<{ $type: string; tag: string }>
    }> = []

    if (tags && tags.length > 0) {
      const hashtags = tags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')
      fullText = `${content}\n\n${hashtags}`

      // Create facets for each hashtag to make them clickable
      const encoder = new TextEncoder()

      tags.forEach(tag => {
        const cleanTag = tag.replace(/^#/, '')
        const hashtagText = `#${cleanTag}`
        const start = fullText.indexOf(hashtagText)

        if (start !== -1) {
          // Calculate byte positions (Bluesky uses UTF-8 byte positions)
          const beforeText = fullText.substring(0, start)
          const byteStart = encoder.encode(beforeText).length
          const byteEnd = byteStart + encoder.encode(hashtagText).length

          facets.push({
            index: {
              byteStart,
              byteEnd
            },
            features: [{
              $type: 'app.bsky.richtext.facet#tag',
              tag: cleanTag
            }]
          })
        }
      })
    }

    const postData: any = {
      text: fullText,
      createdAt: new Date().toISOString()
    }

    // Add facets if we have any
    if (facets.length > 0) {
      postData.facets = facets
    }

    // Handle images if provided
    if (images && images.length > 0) {
      const uploadedImages = []

      for (const image of images) {
        const imageResponse = await fetch(image.url)
        const imageBuffer = await imageResponse.arrayBuffer()

        const uploadResponse = await agent.uploadBlob(new Uint8Array(imageBuffer), {
          encoding: 'image/jpeg'
        })

        uploadedImages.push({
          alt: image.alt_text || '',
          image: uploadResponse.data.blob
        })
      }

      postData.embed = {
        $type: 'app.bsky.embed.images',
        images: uploadedImages
      }
    }

    const response = await agent.api.app.bsky.feed.post.create(
      { repo: connection.platform_user_id },
      postData
    )

    return {
      success: true,
      post_id: response.uri,
      post_url: `https://bsky.app/profile/${connection.platform_username}/post/${response.uri.split('/').pop()}`
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to post to Bluesky')
  }
}

async function postToMastodon(connection: any, content: string): Promise<PostResult> {
  try {
    const response = await fetch(`${connection.instance_url}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: content
      })
    })

    if (!response.ok) {
      throw new Error('Failed to post to Mastodon')
    }

    const data = await response.json()

    return {
      success: true,
      post_id: data.id,
      post_url: data.url
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to post to Mastodon')
  }
}

async function postToLinkedIn(connection: any, content: string): Promise<PostResult> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${connection.platform_user_id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to post to LinkedIn')
    }

    const data = await response.json()

    return {
      success: true,
      post_id: data.id,
      post_url: `https://www.linkedin.com/feed/update/${data.id}`
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to post to LinkedIn')
  }
}