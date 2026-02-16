<template>
  <div class="drafts-page">
    <div class="page-header">
      <h2>Saved Drafts</h2>
      <NuxtLink to="/create" class="btn btn-primary">
        Create New Post
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading drafts...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="drafts.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No drafts yet</h3>
      <p>Save your posts as drafts to finish them later</p>
      <NuxtLink to="/create" class="btn btn-primary">
        Create Your First Post
      </NuxtLink>
    </div>

    <!-- Drafts List -->
    <div v-else class="drafts-grid">
      <article
        v-for="draft in drafts"
        :key="draft.id"
        class="draft-card">
        <div class="draft-header">
          <h3 class="draft-title">
            {{ draft.content.substring(0, 60) }}{{ draft.content.length > 60 ? '...' : '' }}
          </h3>
          <div class="draft-meta">
            <span class="draft-date">
              {{ formatDate(draft.updated_at) }}
            </span>
          </div>
        </div>

        <div class="draft-content">
          <p>{{ draft.content.substring(0, 150) }}{{ draft.content.length > 150 ? '...' : '' }}</p>
        </div>

        <div class="draft-info">
          <div class="draft-badges">
            <span v-if="draft.platforms.length > 0" class="badge">
              {{ draft.platforms.length }} platform{{ draft.platforms.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="draft.tags.length > 0" class="badge">
              {{ draft.tags.length }} tag{{ draft.tags.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="draft.images && draft.images.length > 0" class="badge">
              {{ draft.images.length }} image{{ draft.images.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="draft.scheduled_for" class="badge badge-scheduled">
              Scheduled
            </span>
          </div>
        </div>

        <div class="draft-actions">
          <button
            class="btn btn-primary btn-sm"
            @click="loadDraft(draft)">
            Continue Editing
          </button>
          <button
            class="btn btn-outline btn-sm"
            @click="confirmDelete(draft.id)">
            Delete
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()
const supabase = useSupabaseClient()

// Redirect if not authenticated
watch(user, (newUser) => {
  if (!newUser) {
    router.push('/login')
  }
}, { immediate: true })

interface Draft {
  id: string
  content: string
  platforms: string[]
  tags: string[]
  images: any[]
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

const loading = ref(true)
const drafts = ref<Draft[]>([])

// Load drafts
const loadDrafts = async () => {
  if (!user.value) return

  loading.value = true

  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('user_id', user.value.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    drafts.value = data as Draft[]
  } catch (error: any) {
    console.error('Error loading drafts:', error)
  } finally {
    loading.value = false
  }
}

// Load draft into editor
const loadDraft = (draft: Draft) => {
  // Store draft in sessionStorage to load in create page
  sessionStorage.setItem('loadDraft', JSON.stringify(draft))
  router.push('/create')
}

// Delete draft
const confirmDelete = async (draftId: string) => {
  if (!confirm('Are you sure you want to delete this draft?')) return

  try {
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', draftId)

    if (error) throw error

    // Remove from local array
    drafts.value = drafts.value.filter(d => d.id !== draftId)
  } catch (error: any) {
    console.error('Error deleting draft:', error)
    alert('Failed to delete draft')
  }
}

// Format date
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

onMounted(() => {
  loadDrafts()
})

// SEO
useHead({
  title: 'Drafts - Broadcast',
  meta: [
    { name: 'description', content: 'Your saved post drafts' }
  ]
})
</script>

<style scoped>
.drafts-page {
  max-width: 1200px;
  margin-inline: auto;
  padding: var(--space-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2xl);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.page-header h2 {
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  gap: var(--space-md);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  background-color: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
}

.empty-state h3 {
  margin-bottom: var(--space-sm);
}

.empty-state p {
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.drafts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.draft-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  transition: all var(--transition-base);
}

.draft-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.draft-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.draft-title {
  font-size: var(--font-size-lg);
  margin: 0;
  color: var(--color-text);
  line-height: 1.4;
}

.draft-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.draft-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.draft-content {
  flex: 1;
}

.draft-content p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.draft-info {
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.draft-badges {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.badge-scheduled {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1e40af;
}

.draft-actions {
  display: flex;
  gap: var(--space-sm);
}

.draft-actions button {
  flex: 1;
}

@media (max-width: 640px) {
  .drafts-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header .btn {
    width: 100%;
  }
}
</style>