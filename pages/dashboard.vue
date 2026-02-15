<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="dashboard-title">
        <h2>Dashboard</h2>
        <p>Welcome back, {{ user?.user_metadata?.full_name || user?.email }}</p>
      </div>
      <button @click="handleLogout" class="btn btn-outline">
        Sign out
      </button>
    </div>

    <div class="dashboard-content">
      <!-- Quick Stats -->
      <section class="stats-grid" aria-label="Account statistics">
        <div class="stat-card">
          <h3>Posts This Month</h3>
          <p class="stat-value">{{ stats.postsThisMonth }}</p>
          <p class="stat-detail">{{ stats.postsRemaining }} remaining</p>
        </div>

        <div class="stat-card">
          <h3>Connected Platforms</h3>
          <p class="stat-value">{{ stats.connectedPlatforms }}</p>
          <p class="stat-detail">{{ stats.availablePlatforms }} available</p>
        </div>

        <div class="stat-card">
          <h3>Current Plan</h3>
          <p class="stat-value">{{ stats.currentPlan }}</p>
          <NuxtLink to="/pricing" class="stat-detail">Upgrade plan</NuxtLink>
        </div>

        <div class="stat-card">
          <h3>Drafts Saved</h3>
          <p class="stat-value">{{ stats.drafts }}</p>
          <p class="stat-detail">Ready to post</p>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions" aria-labelledby="quick-actions-heading">
        <h3 id="quick-actions-heading">Quick Actions</h3>
        <div class="action-buttons">
          <NuxtLink to="/" class="btn btn-primary">
            Create New Post
          </NuxtLink>
          <NuxtLink to="/platforms" class="btn btn-outline">
            Connect Platforms
          </NuxtLink>
          <NuxtLink to="/billing" class="btn btn-outline">
            Manage Billing
          </NuxtLink>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="recent-activity" aria-labelledby="recent-activity-heading">
        <h3 id="recent-activity-heading">Recent Posts</h3>
        <div v-if="recentPosts.length === 0" class="empty-state">
          <p>No posts yet. Create your first post to get started!</p>
          <NuxtLink to="/" class="btn btn-primary">Create Post</NuxtLink>
        </div>
        <div v-else class="activity-list">
          <div
            v-for="post in recentPosts"
            :key="post.id"
            class="activity-item"
          >
            <div class="activity-content">
              <p class="activity-text">{{ post.content }}</p>
              <div class="activity-meta">
                <span>{{ formatDate(post.created_at) }}</span>
                <span>•</span>
                <span>{{ post.platforms.length }} platforms</span>
              </div>
            </div>
            <span :class="['activity-status', `status-${post.status}`]">
              {{ post.status }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Mock stats (will be replaced with real data from database)
const stats = ref({
  postsThisMonth: 12,
  postsRemaining: 13,
  connectedPlatforms: 2,
  availablePlatforms: 6,
  currentPlan: 'Starter',
  drafts: 3
})

// Mock recent posts (will be replaced with real data from database)
const recentPosts = ref([
  {
    id: 1,
    content: 'Just launched our new feature! Check it out...',
    platforms: ['linkedin', 'bluesky', 'mastodon'],
    status: 'success',
    created_at: new Date().toISOString()
  }
])

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Handle logout
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    router.push('/auth')
  }
}

// SEO
useHead({
  title: 'Dashboard - Broadcast',
  meta: [
    { name: 'description', content: 'Manage your Broadcast account and posts' }
  ]
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2xl);
  gap: var(--space-lg);
}

.dashboard-title h2 {
  margin: 0;
}

.dashboard-title p {
  margin: 0;
  color: var(--color-text-muted);
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

.stat-detail a {
  color: var(--color-primary);
  text-decoration: none;
}

.stat-detail a:hover {
  text-decoration: underline;
}

.quick-actions {
  margin-bottom: var(--space-2xl);
}

.quick-actions h3 {
  margin-bottom: var(--space-lg);
}

.action-buttons {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.recent-activity h3 {
  margin-bottom: var(--space-lg);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 var(--space-sm) 0;
  font-weight: 500;
}

.activity-meta {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.activity-status {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: capitalize;
}

.status-success {
  background-color: rgba(25, 135, 84, 0.1);
  color: var(--color-success);
}

.status-pending {
  background-color: rgba(255, 193, 7, 0.1);
  color: var(--color-warning);
}

.status-failed {
  background-color: rgba(220, 53, 69, 0.1);
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }

  .activity-item {
    flex-direction: column;
  }
}
</style>