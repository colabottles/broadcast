<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <section class="welcome-section" aria-labelledby="welcome-heading">
      <div class="welcome-content">
        <div>
          <h2 id="welcome-heading">Welcome back, {{ userName }}!</h2>
          <p class="welcome-subtitle">{{ getGreeting() }}</p>
        </div>
        <NuxtLink to="/create" class="btn btn-primary btn-lg">
          ✨ Create New Post
        </NuxtLink>
      </div>
    </section>

    <!-- Quick Post Widget -->
    <section class="quick-post-widget" aria-labelledby="quick-post-heading">
      <div class="quick-post-header">
        <h3 id="quick-post-heading">Quick Post</h3>
        <button
          type="button"
          class="btn-text"
          @click="toggleQuickPost">
          {{ showQuickPost ? 'Hide' : 'Show' }}
        </button>
      </div>

      <div v-if="showQuickPost" class="quick-post-form">
        <textarea
          v-model="quickPostContent"
          placeholder="What's on your mind? Post quickly to all connected platforms..."
          :maxlength="300"
          rows="3"
          class="quick-post-textarea"></textarea>

        <div class="quick-post-footer">
          <div class="quick-post-info">
            <span :class="['char-count', { 'char-warning': quickPostContent.length > 280 }]">
              {{ quickPostContent.length }}/300
            </span>
            <span v-if="connectedPlatforms > 0" class="platforms-indicator">
              📡 Posting to {{ connectedPlatforms }} platform{{ connectedPlatforms !== 1 ? 's' : ''
              }}
            </span>
          </div>

          <div class="quick-post-actions">
            <NuxtLink
              to="/create"
              class="btn btn-outline btn-sm">
              Advanced Options
            </NuxtLink>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              @click="handleQuickPost"
              :disabled="!quickPostContent.trim() || connectedPlatforms === 0 || isPosting">
              <span v-if="isPosting" class="spinner" aria-hidden="true"></span>
              {{ isPosting ? 'Posting...' : 'Post Now' }}
            </button>
          </div>
        </div>

        <div v-if="quickPostMessage"
          :class="['quick-post-message', `message-${quickPostMessage.type}`]">
          {{ quickPostMessage.text }}
        </div>

        <div v-if="connectedPlatforms === 0" class="quick-post-warning">
          <p>⚠️ No platforms connected. <NuxtLink to="/platforms">Connect your accounts</NuxtLink>
            to start posting.</p>
        </div>
      </div>
    </section>

    <!-- Quick Stats Overview -->
    <section class="stats-grid" aria-label="Account statistics">
      <!-- Post Usage - All Tiers -->
      <div class="stat-card stat-primary">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Posts This Month</h3>
          <div class="stat-value">
            {{ postsThisMonth }} <span class="stat-limit">/ {{ postLimit === 999999 ? '∞' :
              postLimit }}</span>
          </div>
          <div class="stat-progress">
            <div
              class="stat-progress-bar"
              :style="{ width: `${getUsagePercentage()}%` }"
              :class="{ 'stat-progress-warning': getUsagePercentage() > 80 }"></div>
          </div>
        </div>
      </div>

      <!-- Connected Platforms - All Tiers -->
      <div class="stat-card">
        <div class="stat-icon">🔗</div>
        <div class="stat-content">
          <h3>Connected Platforms</h3>
          <div class="stat-value">{{ connectedPlatforms }} / 3</div>
          <NuxtLink to="/platforms" class="stat-link">
            {{ connectedPlatforms === 0 ? 'Connect platforms' : 'Manage' }}
          </NuxtLink>
        </div>
      </div>

      <!-- Subscription - All Tiers -->
      <div class="stat-card">
        <div class="stat-icon">💎</div>
        <div class="stat-content">
          <h3>Current Plan</h3>
          <div class="stat-value stat-tier">{{ formatTier(subscriptionTier) }}</div>
          <NuxtLink
            to="/pricing"
            class="stat-link"
            v-if="subscriptionTier === 'starter'">
            Upgrade now
          </NuxtLink>
        </div>
      </div>

      <!-- Creator+ Only: Scheduled Posts -->
      <div v-if="isCreatorPlus" class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <h3>Scheduled Posts</h3>
          <div class="stat-value">{{ scheduledPostsCount }}</div>
          <span class="stat-link">Upcoming</span>
        </div>
      </div>

      <!-- Professional+ Only: Team Members -->
      <div v-if="isProfessionalPlus" class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Team Members</h3>
          <div class="stat-value">{{ teamMembersCount }} / {{ maxTeamMembers }}</div>
          <span class="stat-link">Invite team</span>
        </div>
      </div>

      <!-- Professional+ Only: Analytics -->
      <div v-if="isProfessionalPlus" class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>Total Reach</h3>
          <div class="stat-value">{{ formatNumber(totalReach) }}</div>
          <span class="stat-link">View analytics</span>
        </div>
      </div>
    </section>

    <!-- Quick Actions - All Tiers -->
    <section class="quick-actions" aria-labelledby="quick-actions-heading">
      <h3 id="quick-actions-heading">Quick Actions</h3>
      <div class="action-grid">
        <button class="action-card" @click="$router.push('/create')">
          <div class="action-icon">✍️</div>
          <div class="action-content">
            <h4>Create Post</h4>
            <p>Broadcast to all platforms</p>
          </div>
        </button>

        <button class="action-card" @click="$router.push('/platforms')">
          <div class="action-icon">🔌</div>
          <div class="action-content">
            <h4>Connect Platforms</h4>
            <p>Link social accounts</p>
          </div>
        </button>

        <button
          class="action-card"
          @click="$router.push('/create')"
          v-if="isCreatorPlus">
          <div class="action-icon">⏰</div>
          <div class="action-content">
            <h4>Schedule Post</h4>
            <p>Plan ahead</p>
          </div>
        </button>

        <button class="action-card" @click="$router.push('/pricing')">
          <div class="action-icon">💳</div>
          <div class="action-content">
            <h4>Manage Billing</h4>
            <p>View subscription</p>
          </div>
        </button>
      </div>
    </section>

    <!-- Upgrade CTA - Starter Only -->
    <section v-if="subscriptionTier === 'starter'" class="upgrade-cta">
      <div class="upgrade-content">
        <div class="upgrade-icon">🚀</div>
        <div>
          <h3>Unlock More Features</h3>
          <p>Upgrade to Creator for unlimited posts, scheduling, and priority support — just
            $6/month</p>
        </div>
        <NuxtLink to="/pricing" class="btn btn-primary">
          View Plans
        </NuxtLink>
      </div>
    </section>

    <!-- Recent Activity - All Tiers -->
    <section class="recent-activity" aria-labelledby="recent-activity-heading">
      <div class="section-header">
        <h3 id="recent-activity-heading">Recent Posts</h3>
        <NuxtLink
          to="/history"
          class="view-all-link"
          v-if="recentPosts.length > 0">
          View all →
        </NuxtLink>
      </div>

      <div v-if="recentPosts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h4>No posts yet</h4>
        <p>Start broadcasting your message across platforms</p>
        <NuxtLink to="/create" class="btn btn-primary">
          Create Your First Post
        </NuxtLink>
      </div>

      <div v-else class="posts-list">
        <article
          v-for="post in recentPosts"
          :key="post.id"
          class="post-item">
          <div class="post-content">
            <p class="post-text">{{ post.content.substring(0, 120) }}{{ post.content.length > 120 ?
              '...' : '' }}</p>
            <div class="post-meta">
              <span class="post-date">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                </svg>
                {{ formatDate(post.created_at) }}
              </span>
              <span class="post-platforms">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
                {{ post.platforms.join(', ') }}
              </span>
            </div>
          </div>
          <div class="post-status">
            <span :class="['status-badge', `status-${post.status}`]">
              {{ post.status }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <!-- Analytics Preview - Professional+ Only -->
    <section v-if="isProfessionalPlus" class="analytics-preview">
      <h3>Performance Overview</h3>
      <div class="analytics-grid">
        <div class="analytics-card">
          <h4>Engagement Rate</h4>
          <div class="analytics-value">{{ engagementRate }}%</div>
          <div class="analytics-trend trend-up">↑ 12% vs last month</div>
        </div>
        <div class="analytics-card">
          <h4>Top Platform</h4>
          <div class="analytics-value">{{ topPlatform }}</div>
          <div class="analytics-metric">{{ topPlatformEngagement }} interactions</div>
        </div>
        <div class="analytics-card">
          <h4>Best Time to Post</h4>
          <div class="analytics-value">{{ bestTimeToPost }}</div>
          <div class="analytics-metric">Based on engagement</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()
const supabase = useSupabaseClient()

// Redirect to login if not authenticated
watch(user, (newUser) => {
  if (!newUser) {
    router.push('/login')
  }
}, { immediate: true })

// User data
const userName = computed(() => {
  return user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'User'
})

// Define Profile type
interface Profile {
  posts_this_month: number
  post_limit: number
  subscription_tier: string
}

// Quick Post state
const showQuickPost = ref(true)
const quickPostContent = ref('')
const isPosting = ref(false)
const quickPostMessage = ref<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

// Toggle quick post
const toggleQuickPost = () => {
  showQuickPost.value = !showQuickPost.value
}

// Handle quick post
const handleQuickPost = async () => {
  if (!quickPostContent.value.trim() || connectedPlatforms.value === 0) return

  isPosting.value = true
  quickPostMessage.value = null

  try {
    // Get all connected platforms
    const { data: connections } = await supabase
      .from('platform_connections')
      .select('platform')
      .eq('user_id', user.value!.id)
      .eq('is_active', true)

    interface PlatformConnection {
      platform: string
    }

    interface PostResult {
      success: boolean
      message?: string
    }

    interface PostResponse {
      success: boolean
      results?: Record<string, PostResult>
    }

    const platformConnections = connections as PlatformConnection[] | null
    const platformIds = platformConnections?.map(c => c.platform) || []

    // Post to all connected platforms
    const response = await $fetch<PostResponse>('/api/post', {
      method: 'POST',
      body: {
        content: quickPostContent.value,
        platforms: platformIds,
        tags: [],
        images: []
      }
    })

    // Check results
    const results = response.results || {}
    const successCount = Object.values(results).filter(r => r.success).length

    if (successCount > 0) {
      quickPostMessage.value = {
        type: 'success',
        text: `Posted successfully to ${successCount} platform${successCount !== 1 ? 's' : ''}! 🎉`
      }

      // Clear form
      quickPostContent.value = ''

      // Reload stats and recent posts
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      quickPostMessage.value = {
        type: 'error',
        text: 'Failed to post. Please try again or use the full editor.'
      }
    }
  } catch (error: any) {
    quickPostMessage.value = {
      type: 'error',
      text: error.data?.message || 'Failed to post. Please try again.'
    }
  } finally {
    isPosting.value = false

    // Clear message after 5 seconds
    setTimeout(() => {
      quickPostMessage.value = null
    }, 5000)
  }
}

// Recent posts
interface Post {
  id: string
  content: string
  created_at: string
  platforms: string[]
  status: string
}

// Stats
const postsThisMonth = ref(0)
const postLimit = ref(25)
const connectedPlatforms = ref(0)
const subscriptionTier = ref('starter')
const scheduledPostsCount = ref(0)
const teamMembersCount = ref(1)
const totalReach = ref(0)
const recentPosts = ref<Post[]>([])

// Tier checks
const isCreatorPlus = computed(() => ['creator', 'professional', 'enterprise'].includes(subscriptionTier.value))
const isProfessionalPlus = computed(() => ['professional', 'enterprise'].includes(subscriptionTier.value))

// Team limits by tier
const maxTeamMembers = computed(() => {
  const limits: Record<string, number> = {
    starter: 1,
    creator: 1,
    professional: 5,
    enterprise: 999
  }
  return limits[subscriptionTier.value] || 1
})

// Analytics data (Professional+ only)
const engagementRate = ref(0)
const topPlatform = ref('LinkedIn')
const topPlatformEngagement = ref(0)
const bestTimeToPost = ref('2:00 PM')

// Helper functions
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning!'
  if (hour < 18) return 'Good afternoon!'
  return 'Good evening!'
}

const formatTier = (tier: string) => {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

const getUsagePercentage = () => {
  if (postLimit.value === 999999) return 0 // Unlimited
  return Math.min(Math.round((postsThisMonth.value / postLimit.value) * 100), 100)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDate = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Load dashboard data
onMounted(async () => {
  if (!user.value) return

  // Load profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('posts_this_month, post_limit, subscription_tier')
    .eq('id', user.value.id)
    .single()

  const profileData = profile as Profile | null

  if (profileData) {
    postsThisMonth.value = profileData.posts_this_month || 0
    postLimit.value = profileData.post_limit || 25
    subscriptionTier.value = profileData.subscription_tier || 'starter'
  }

  // Load connected platforms count
  const { count } = await supabase
    .from('platform_connections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.value.id)
    .eq('is_active', true)

  connectedPlatforms.value = count || 0

  // Load recent posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, created_at, platforms, status')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (posts) {
    recentPosts.value = posts as Post[]
  }

  // Load scheduled posts count (Creator+ only)
  if (isCreatorPlus.value) {
    const { count: scheduledCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
      .eq('status', 'scheduled')

    scheduledPostsCount.value = scheduledCount || 0
  }

  // Load analytics data (Professional+ only)
  if (isProfessionalPlus.value) {
    // TODO: Implement real analytics
    engagementRate.value = 4.2
    topPlatformEngagement.value = 1234
  }
})

// SEO
useHead({
  title: 'Dashboard - Broadcast',
  meta: [
    { name: 'description', content: 'Your Broadcast dashboard' }
  ]
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin-inline: auto;
  padding: var(--space-xl);
}

/* Welcome Section */
.welcome-section {
  margin-bottom: var(--space-2xl);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.welcome-section h2 {
  margin-bottom: var(--space-xs);
  font-size: var(--font-size-3xl);
}

.welcome-subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

.btn-lg {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-lg);
}

/* Stats Grid */
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
  display: flex;
  gap: var(--space-md);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-primary {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.stat-icon {
  font-size: 2rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: var(--space-xs);
}

.stat-tier {
  color: var(--color-primary);
}

.stat-limit {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  font-weight: 400;
}

.stat-progress {
  height: 6px;
  background-color: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
  margin-top: var(--space-sm);
}

.stat-progress-bar {
  height: 100%;
  background-color: var(--color-primary);
  transition: width var(--transition-base);
}

.stat-progress-warning {
  background-color: var(--color-warning);
}

.stat-link {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.stat-link:hover {
  text-decoration: underline;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: var(--space-2xl);
}

.quick-actions h3 {
  margin-bottom: var(--space-lg);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.action-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-base);
  text-align: left;
  width: 100%;
}

.action-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 2rem;
  line-height: 1;
}

.action-content h4 {
  color: var(--color-text);
  font-size: var(--font-size-md);
  margin-bottom: var(--space-xs);
}

.action-content p {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* Quick Post Widget */
.quick-post-widget {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.quick-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.quick-post-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-sm);
}

.btn-text:hover {
  text-decoration: underline;
}

.quick-post-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.quick-post-textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--font-size-md);
  resize: vertical;
  min-height: 80px;
}

.quick-post-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quick-post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.quick-post-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.char-count {
  font-weight: 600;
}

.char-warning {
  color: var(--color-warning);
}

.platforms-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.quick-post-actions {
  display: flex;
  gap: var(--space-sm);
}

.btn-sm {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-sm);
}

.quick-post-message {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.message-success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.message-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.message-info {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.quick-post-warning {
  padding: var(--space-md);
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.quick-post-warning p {
  margin: 0;
  color: #92400e;
}

.quick-post-warning a {
  color: #92400e;
  font-weight: 600;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .quick-post-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-post-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }

  .quick-post-actions {
    width: 100%;
  }

  .quick-post-actions .btn {
    flex: 1;
  }
}

/* Upgrade CTA */
.upgrade-cta {
  background: linear-gradient(135deg, var(--color-primary) 0%, #2563eb 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-2xl);
  color: white;
}

.upgrade-content {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.upgrade-icon {
  font-size: 3rem;
  line-height: 1;
}

.upgrade-cta h3 {
  margin-bottom: var(--space-xs);
  color: white;
}

.upgrade-cta p {
  margin: 0;
  opacity: 0.95;
}

.upgrade-cta .btn {
  margin-left: auto;
  background-color: white;
  color: var(--color-primary);
}

.upgrade-cta .btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

/* Recent Activity */
.recent-activity {
  margin-bottom: var(--space-2xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.view-all-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.view-all-link:hover {
  text-decoration: underline;
}

.empty-state {
  background-color: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
}

.empty-state h4 {
  margin-bottom: var(--space-sm);
  color: var(--color-text);
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.post-item {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  transition: border-color var(--transition-base);
}

.post-item:hover {
  border-color: var(--color-primary);
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-text {
  margin-bottom: var(--space-sm);
  color: var(--color-text);
  line-height: 1.5;
}

.post-meta {
  display: flex;
  gap: var(--space-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.post-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.status-published {
  background-color: #d1fae5;
  color: #065f46;
}

.status-scheduled {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-failed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-publishing {
  background-color: #fef3c7;
  color: #92400e;
}

/* Analytics Preview */
.analytics-preview {
  margin-bottom: var(--space-2xl);
}

.analytics-preview h3 {
  margin-bottom: var(--space-lg);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.analytics-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.analytics-card h4 {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.analytics-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.analytics-trend {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.trend-up {
  color: var(--color-success);
}

.analytics-metric {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-lg {
    width: 100%;
    text-align: center;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .upgrade-content {
    flex-direction: column;
  }

  .upgrade-cta .btn {
    margin-left: 0;
    width: 100%;
  }

  .post-item {
    flex-direction: column;
  }
}
</style>