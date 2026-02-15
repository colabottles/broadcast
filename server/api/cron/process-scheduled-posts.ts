// This endpoint should be called by a cron job every minute
// Example: Vercel Cron, GitHub Actions, or external cron service

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify cron secret to prevent unauthorized access
  const cronSecret = getHeader(event, 'x-cron-secret')
  if (cronSecret !== config.cronSecret) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const supabase = createClient(config.public.supabase.url, config.supabaseServiceKey)

  try {
    // Get all scheduled posts that are due
    const now = new Date().toISOString()

    const { data: scheduledPosts, error } = await supabase
      .from('posts')
      .select('*, profiles!inner(id)')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(50) // Process 50 posts at a time

    if (error) {
      console.error('Error fetching scheduled posts:', error)
      return { processed: 0, error: error.message }
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return { processed: 0, message: 'No posts to process' }
    }

    let processed = 0
    let failed = 0

    // Process each scheduled post
    for (const post of scheduledPosts) {
      try {
        // Update status to publishing
        await supabase
          .from('posts')
          .update({ status: 'publishing' })
          .eq('id', post.id)

        // Call the posting logic
        // This is a simplified version - in production you'd extract the posting logic
        // into a shared function that both the immediate post API and cron can use

        // Get user's platform connections
        const { data: connections } = await supabase
          .from('platform_connections')
          .select('*')
          .eq('user_id', post.user_id)
          .in('platform', post.platforms)
          .eq('is_active', true)

        if (!connections || connections.length === 0) {
          await supabase
            .from('posts')
            .update({ status: 'failed' })
            .eq('id', post.id)

          failed++
          continue
        }

        // Post to platforms (simplified - would call actual posting functions)
        let allSuccess = true

        for (const connection of connections) {
          try {
            // TODO: Call actual platform posting functions here
            // For now, just mark as success

            await supabase
              .from('post_results')
              .insert({
                post_id: post.id,
                platform: connection.platform,
                status: 'success',
                platform_post_id: `scheduled-${Date.now()}`,
                platform_post_url: '#'
              })
          } catch (err: any) {
            allSuccess = false
            await supabase
              .from('post_results')
              .insert({
                post_id: post.id,
                platform: connection.platform,
                status: 'failed',
                error_message: err.message
              })
          }
        }

        // Update final post status
        await supabase
          .from('posts')
          .update({
            status: allSuccess ? 'published' : 'failed',
            published_at: allSuccess ? new Date().toISOString() : null
          })
          .eq('id', post.id)

        processed++
      } catch (err) {
        console.error('Error processing post', post.id, ':', err)
        failed++
      }
    }

    return {
      processed,
      failed,
      total: scheduledPosts.length,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('Cron job error:', error)
    return { error: error.message }
  }
})
