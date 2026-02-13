<template>
  <div class="analytics-page">
    <h2>Analytics</h2>
    <p class="page-subtitle">Track your post performance across platforms</p>

    <!-- Overall Stats -->
    <section class="stats-grid" aria-label="Overall statistics">
      <div class="stat-card">
        <h3>Total Posts</h3>
        <p class="stat-value">{{ overallStats.totalPosts }}</p>
        <p class="stat-detail">All time</p>
      </div>

      <div class="stat-card">
        <h3>Total Views</h3>
        <p class="stat-value">{{ formatNumber(overallStats.totalViews) }}</p>
        <p class="stat-detail">Across all platforms</p>
      </div>

      <div class="stat-card">
        <h3>Engagement Rate</h3>
        <p class="stat-value">{{ overallStats.avgEngagement }}%</p>
        <p class="stat-detail">Average across posts</p>
      </div>

      <div class="stat-card">
        <h3>Best Platform</h3>
        <p class="stat-value">{{ overallStats.bestPlatform || 'N/A' }}</p>
        <p class="stat-detail">Highest engagement</p>
      </div>
    </section>

    <!-- Platform Breakdown -->
    <section class="analytics-section" aria-labelledby="platform-heading">
      <h3 id="platform-heading">Platform Performance</h3>

      <div v-if="platformStats.length === 0" class="empty-state">
        <p>No analytics data yet. Start posting to see your performance!</p>
        <NuxtLink to="/" class="btn btn-primary">Create Post</NuxtLink>
      </div>

      <div v-else class="platform-list">
        <div
          v-for="platform in platformStats"
          :key="platform.platform"
          class="platform-stat-card"
        >
          <div class="platform-header">
            <h4>{{ getPlatformName(platform.platform) }}</h4>
            <span class="platform-badge">{{ platform.posts }} posts</span>
          </div>

          <div class="platform-metrics">
            <div class="metric">
              <span class="metric-label">Views</span>
              <span class="metric-value">{{ formatNumber(platform.views) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Likes</span>
              <span class="metric-value">{{ formatNumber(platform.likes) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Comments</span>
              <span class="metric-value">{{ formatNumber(platform.comments) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Shares</span>
              <span class="metric-value">{{ formatNumber(platform.shares) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Engagement</span>
              <span class="metric-value">{{ platform.engagement_rate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Posts Performance -->
    <section class="analytics-section" aria-labelledby="recent-heading">
      <h3 id="recent-heading">Recent Posts</h3>

      <div v-if="recentPosts.length === 0" class="empty-state">
        <p>No posts yet</p>
      </div>

      <div v-else class="posts-table">
        <table>
          <thead>
            <tr>
              <th>Post</th>
              <th>Platform</th>
              <th>Date</th>
              <th>Views</th>
              <th>Engagement</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in recentPosts" :key="post.id">
              <td class="post-content">{{ truncate(post.content, 50) }}</td>
              <td>{{ post.platforms.join(', ') }}</td>
              <td>{{ formatDate(post.created_at) }}</td>
              <td>{{ formatNumber(post.total_views) }}</td>
              <td>
                <span :class="['engagement-badge', getEngagementClass(post.avg_engagement)]">
                  {{ post.avg_engagement }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Note for Professional plans -->
    <div v-if="subscriptionTier === 'starter' || subscriptionTier === 'creator'" class="upgrade-notice">
      <p>
        📊 <strong>Want detailed analytics?</strong>
        <NuxtLink to="/pricing">Upgrade to Professional</NuxtLink> for advanced analytics, custom reports, and API access.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Profile {
  subscription_tier: string
}

interface Post {
  id: string
  status: string
  content: string
  platforms: string[]
  created_at: string
}

interface AnalyticsData {
  views: number
  likes: number
  comments: number
  shares: number
  engagement_rate: string
  platform: string
}

interface PlatformStats {
  platform: string
  posts: number
  views: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number
}

interface RecentPost {
  id: string
  content: string
  platforms: string[]
  created_at: string
  total_views: number
  avg_engagement: number
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const overallStats = ref({
  totalPosts: 0,
  totalViews: 0,
  avgEngagement: 0,
  bestPlatform: ''
})

const platformStats = ref<PlatformStats[]>([])
const recentPosts = ref<RecentPost[]>([])
const subscriptionTier = ref('starter')

// Load data on mount
onMounted(async () => {
  await loadProfile()
  await loadAnalytics()
})

const loadProfile = async () => {
  if (!user.value?.id) return

  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.value.id)
    .single()

  const profileData = data as Profile | null

  if (profileData) {
    subscriptionTier.value = profileData.subscription_tier
  }
}

const loadAnalytics = async () => {
  if (!user.value?.id) return

  // Get overall stats
  const { data: postsData } = await supabase
    .from('posts')
    .select('id, status')
    .eq('user_id', user.value.id)
    .eq('status', 'published')

  const posts = postsData as Post[] | null
  overallStats.value.totalPosts = posts?.length || 0

  // Get analytics data (simplified - in production would aggregate from post_analytics)
  const { data: analyticsData } = await supabase
    .from('post_analytics')
    .select(`
      *,
      posts!inner(user_id)
    `)
    .eq('posts.user_id', user.value.id)

  const analytics = analyticsData as AnalyticsData[] | null

  if (analytics && analytics.length > 0) {
    overallStats.value.totalViews = analytics.reduce((sum, a) => sum + a.views, 0)
    overallStats.value.avgEngagement = Math.round(
      analytics.reduce((sum, a) => sum + parseFloat(a.engagement_rate), 0) / analytics.length
    )

    // Get platform breakdown
    const platformMap = new Map<string, PlatformStats>()
    analytics.forEach(a => {
      if (!platformMap.has(a.platform)) {
        platformMap.set(a.platform, {
          platform: a.platform,
          posts: 0,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagement_rate: 0
        })
      }
      const stats = platformMap.get(a.platform)!
      stats.posts++
      stats.views += a.views
      stats.likes += a.likes
      stats.comments += a.comments
      stats.shares += a.shares
      stats.engagement_rate += parseFloat(a.engagement_rate)
    })

    platformStats.value = Array.from(platformMap.values()).map(p => ({
      ...p,
      engagement_rate: Math.round(p.engagement_rate / p.posts)
    }))

    // Find best platform
    const best = platformStats.value.reduce((max, p) =>
      p.engagement_rate > max.engagement_rate ? p : max
    , platformStats.value[0])
    overallStats.value.bestPlatform = getPlatformName(best.platform)
  }

  // Get recent posts (simplified)
  const { data: recentPostsData } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.value.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  const postsTyped = recentPostsData as Post[] | null

  recentPosts.value = (postsTyped || []).map(p => ({
    id: p.id,
    content: p.content,
    platforms: p.platforms,
    created_at: p.created_at,
    total_views: Math.floor(Math.random() * 1000), // Mock data
    avg_engagement: Math.floor(Math.random() * 10) // Mock data
  }))
}

// Helper functions
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const truncate = (str: string, length: number) => {
  return str.length > length ? str.substring(0, length) + '...' : str
}

const getPlatformName = (platform: string) => {
  const names: Record<string, string> = {
    twitter: 'Twitter/X',
    bluesky: 'Bluesky',
    mastodon: 'Mastodon',
    linkedin: 'LinkedIn',
    threads: 'Threads',
    facebook: 'Facebook'
  }
  return names[platform] || platform
}

const getEngagementClass = (engagement: number) => {
  if (engagement >= 5) return 'high'
  if (engagement >= 2) return 'medium'
  return 'low'
}

// SEO
useHead({
  title: 'Analytics - Broadcast',
  meta: [
    { name: 'description', content: 'View your post performance and analytics' }
  ]
})
</script>

<style scoped>
.analytics-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin-bottom: var(--space-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.stat-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.stat-card h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin: 0 0 var(--space-sm) 0;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-primary);
}

.stat-detail {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: var(--space-xs) 0 0 0;
}

.analytics-section {
  margin-bottom: var(--space-2xl);
}

.platform-list {
  display: grid;
  gap: var(--space-lg);
}

.platform-stat-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.platform-header h4 {
  margin: 0;
}

.platform-badge {
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.platform-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--space-md);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.metric-value {
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.posts-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
}

.post-content {
  max-width: 300px;
}

.engagement-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.engagement-badge.high {
  background-color: rgba(25, 135, 84, 0.1);
  color: var(--color-success);
}

.engagement-badge.medium {
  background-color: rgba(255, 193, 7, 0.1);
  color: var(--color-warning);
}

.engagement-badge.low {
  background-color: rgba(108, 117, 125, 0.1);
  color: var(--color-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
}

.upgrade-notice {
  padding: var(--space-md);
  background-color: rgba(13, 202, 240, 0.1);
  border-left: 4px solid var(--color-info);
  border-radius: var(--radius-md);
  margin-top: var(--space-2xl);
}

.upgrade-notice p {
  margin: 0;
}

.upgrade-notice a {
  color: var(--color-primary);
  font-weight: 600;
}
</style>