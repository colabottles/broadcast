import { createClient } from '@supabase/supabase-js'
import { AtpAgent } from '@atproto/api'

import sharp from 'sharp'

// Platform image size limits (in KB)
const IMAGE_SIZE_LIMITS = {
  bluesky: 950,    // ~1MB limit
  mastodon: 8192,  // 8MB limit
  linkedin: 5120   // 5MB limit
}

// At the top of server/api/post.ts, add this helper function:
async function compressImage(
  imageBuffer: ArrayBuffer,
  maxSizeKB: number = 950
): Promise<Uint8Array> {
  const currentSizeKB = imageBuffer.byteLength / 1024

  // If already under limit, return as-is
  if (currentSizeKB <= maxSizeKB) {
    return new Uint8Array(imageBuffer)
  }

  console.log(`Compressing image from ${currentSizeKB.toFixed(0)}KB to fit under ${maxSizeKB}KB`)

  // Convert ArrayBuffer to Buffer for sharp
  const buffer = Buffer.from(new Uint8Array(imageBuffer))

  // Start with quality 85 and reduce if needed
  let quality = 85
  let compressed: Buffer

  while (quality > 20) {
    compressed = await sharp(buffer)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()

    const compressedSizeKB = compressed.byteLength / 1024

    if (compressedSizeKB <= maxSizeKB) {
      console.log(`Compressed to ${compressedSizeKB.toFixed(0)}KB at quality ${quality}`)
      return new Uint8Array(compressed)
    }

    quality -= 10
  }

  // If still too large after max compression, resize the image
  const resized = await sharp(buffer)
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()

  const finalSizeKB = resized.byteLength / 1024

  if (finalSizeKB > maxSizeKB) {
    throw new Error(`Unable to compress image to under ${maxSizeKB}KB (got ${finalSizeKB.toFixed(0)}KB)`)
  }

  console.log(`Resized and compressed to ${finalSizeKB.toFixed(0)}KB`)
  return new Uint8Array(resized)
}
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
  if (!isScheduled && profile) {
    // Unlimited for paid plans
    const unlimitedTiers = ['creator', 'professional', 'enterprise']
    const hasUnlimitedPosts = unlimitedTiers.includes(profile.subscription_tier)

    if (!hasUnlimitedPosts && profile.posts_this_month >= profile.post_limit) {
      throw createError({
        statusCode: 403,
        message: `Post limit reached (${profile.posts_this_month}/${profile.post_limit}). Upgrade to Creator plan for unlimited posts.`
      })
    }
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
    console.log('Processing platform:', connection.platform)
    try {
      let result: PostResult

      switch (connection.platform) {
        case 'bluesky':
          result = await postToBluesky(connection, body.content, body.images, body.tags)
          break
        case 'mastodon':
          result = await postToMastodon(connection, body.content, body.images, body.tags)
          break
        case 'linkedin':
          result = await postToLinkedIn(connection, body.content, body.images, body.tags)
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
      console.error(`Error posting to ${connection.platform}:`, error) // ADD THIS
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

        // Compress if needed
        const compressedImage = await compressImage(imageBuffer, 900)

        const uploadResponse = await agent.uploadBlob(compressedImage, {
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

    console.log('Bluesky post created:', response.uri) // ADD THIS

    return {
      success: true,
      post_id: response.uri,
      post_url: `https://bsky.app/profile/${connection.platform_username}/post/${response.uri.split('/').pop()}`
    }
  } catch (error: any) {
    console.error('Bluesky posting error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error(error.message || 'Failed to post to Bluesky')
  }
}

async function postToMastodon(connection: any, content: string, images?: any[], tags?: string[]): Promise<PostResult> {
  try {
    // Add hashtags to content
    let fullText = content
    if (tags && tags.length > 0) {
      const hashtags = tags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')
      fullText = `${content}\n\n${hashtags}`
    }

    // Handle media uploads first if there are images
    const mediaIds: string[] = []

    if (images && images.length > 0) {
      for (const image of images) {
        // Fetch the image from Supabase storage
        const imageResponse = await fetch(image.url)
        const imageBuffer = await imageResponse.arrayBuffer()

        // Compress if needed (Mastodon limit is 8MB, very generous)
        const compressedImage = await compressImage(imageBuffer, IMAGE_SIZE_LIMITS.mastodon)

        // Upload to Mastodon
        const formData = new FormData()
        formData.append('file', new Blob([Buffer.from(compressedImage)]), 'image.jpg')
        if (image.alt_text) {
          formData.append('description', image.alt_text)
        }

        const uploadResponse = await fetch(`${connection.instance_url}/api/v2/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.access_token}`
          },
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to Mastodon')
        }

        const uploadData = await uploadResponse.json()
        mediaIds.push(uploadData.id)
      }
    }

    // Create the post
    const postBody: any = {
      status: fullText
    }

    if (mediaIds.length > 0) {
      postBody.media_ids = mediaIds
    }

    console.log('Posting to Mastodon:', {
      instance: connection.instance_url,
      textLength: fullText.length,
      mediaCount: mediaIds.length
    })

    const response = await fetch(`${connection.instance_url}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mastodon API error:', errorText)
      throw new Error('Failed to post to Mastodon')
    }

    const data = await response.json()

    return {
      success: true,
      post_id: data.id,
      post_url: data.url
    }
  } catch (error: any) {
    console.error('Mastodon posting error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error(error.message || 'Failed to post to Mastodon')
  }
}

async function postToLinkedIn(connection: any, content: string, images?: any[], tags?: string[]): Promise<PostResult> {
  try {
    // Add hashtags to content (LinkedIn treats them as regular text)
    let fullText = content
    if (tags && tags.length > 0) {
      const hashtags = tags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')
      fullText = `${content}\n\n${hashtags}`
    }

    // LinkedIn requires the person's URN
    const personUrn = `urn:li:person:${connection.platform_user_id}`

    let postBody: any = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: fullText
          },
          shareMediaCategory: images && images.length > 0 ? 'IMAGE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    // Handle images if provided
    if (images && images.length > 0) {
      const media = []

      for (const image of images) {
        // Step 1: Register upload
        const registerResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.access_token}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: personUrn,
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          })
        })

        if (!registerResponse.ok) {
          const errorText = await registerResponse.text()
          console.error('LinkedIn register upload error:', errorText)
          throw new Error('Failed to register image upload with LinkedIn')
        }

        const registerData = await registerResponse.json()
        const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl
        const asset = registerData.value.asset

        // Step 2: Fetch and compress image
        const imageResponse = await fetch(image.url)
        const imageBuffer = await imageResponse.arrayBuffer()
        const compressedImage = await compressImage(imageBuffer, IMAGE_SIZE_LIMITS.linkedin)

        // Step 3: Upload the image
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.access_token}`
          },
          body: Buffer.from(compressedImage)
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to LinkedIn')
        }

        media.push({
          status: 'READY',
          description: {
            text: image.alt_text || ''
          },
          media: asset,
          title: {
            text: 'Image'
          }
        })
      }

      // Add media to post
      postBody.specificContent['com.linkedin.ugc.ShareContent'].media = media
    }

    console.log('Posting to LinkedIn:', {
      textLength: fullText.length,
      mediaCount: images?.length || 0
    })

    // Create the post
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LinkedIn API error:', errorText)
      throw new Error('Failed to post to LinkedIn')
    }

    const data = await response.json()

    return {
      success: true,
      post_id: data.id,
      post_url: `https://www.linkedin.com/feed/update/${data.id}`
    }
  } catch (error: any) {
    console.error('LinkedIn posting error:', error)
    throw new Error(error.message || 'Failed to post to LinkedIn')
  }
}