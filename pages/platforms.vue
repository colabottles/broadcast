<template>
  <div class="platforms-page">
    <h2>Connected Platforms</h2>
    <p class="page-subtitle">Connect your social media accounts to start broadcasting</p>

    <!-- Status Messages -->
    <div v-if="statusMessage" :class="['alert', `alert-${statusMessage.type}`]" role="alert">
      {{ statusMessage.text }}
    </div>

    <!-- Connected Platforms List -->
    <section class="platforms-grid" aria-label="Available social media platforms">

      <!-- Bluesky -->
      <article class="platform-card" :class="{ 'platform-connected': isConnected('bluesky') }">
        <div class="platform-header">
          <div class="platform-info">
            <h3>Bluesky</h3>
            <p class="platform-description">Post to your Bluesky account</p>
          </div>
          <div class="platform-status">
            <span v-if="isConnected('bluesky')" class="status-badge status-connected">
              Connected
            </span>
            <span v-else class="status-badge status-disconnected">
              Not connected
            </span>
          </div>
        </div>

        <div v-if="isConnected('bluesky')" class="platform-details">
          <p><strong>Handle:</strong> @{{ getConnection('bluesky')?.platform_username }}</p>
          <p><strong>Connected:</strong> {{ formatDate(getConnection('bluesky')?.created_at) }}</p>
        </div>

        <div class="platform-actions">
          <button
            v-if="!isConnected('bluesky')"
            @click="showBlueskyModal = true"
            class="btn btn-primary"
            :disabled="loading">
            Connect Bluesky
          </button>
          <button
            v-else
            @click="disconnectPlatform('bluesky')"
            class="btn btn-outline"
            :disabled="loading">
            Disconnect
          </button>
        </div>
      </article>

      <!-- Mastodon -->
      <article class="platform-card" :class="{ 'platform-connected': isConnected('mastodon') }">
        <div class="platform-header">
          <div class="platform-info">
            <h3>Mastodon</h3>
            <p class="platform-description">Post to your Mastodon account</p>
          </div>
          <div class="platform-status">
            <span v-if="isConnected('mastodon')" class="status-badge status-connected">
              Connected
            </span>
            <span v-else class="status-badge status-disconnected">
              Not connected
            </span>
          </div>
        </div>

        <div v-if="isConnected('mastodon')" class="platform-details">
          <p><strong>Username:</strong> @{{ getConnection('mastodon')?.platform_username }}</p>
          <p><strong>Connected:</strong> {{ formatDate(getConnection('mastodon')?.created_at) }}</p>
        </div>

        <div class="platform-actions">
          <button
            v-if="!isConnected('mastodon')"
            @click="showMastodonModal = true"
            class="btn btn-primary"
            :disabled="loading">
            Connect Mastodon
          </button>
          <button
            v-else
            @click="disconnectPlatform('mastodon')"
            class="btn btn-outline"
            :disabled="loading">
            Disconnect
          </button>
        </div>
      </article>

      <!-- LinkedIn -->
      <article class="platform-card" :class="{ 'platform-connected': isConnected('linkedin') }">
        <div class="platform-header">
          <div class="platform-info">
            <h3>LinkedIn</h3>
            <p class="platform-description">Post to your LinkedIn profile</p>
          </div>
          <div class="platform-status">
            <span v-if="isConnected('linkedin')" class="status-badge status-connected">
              Connected
            </span>
            <span v-else class="status-badge status-disconnected">
              Not connected
            </span>
          </div>
        </div>

        <div v-if="isConnected('linkedin')" class="platform-details">
          <p><strong>Name:</strong> {{ getConnection('linkedin')?.platform_username }}</p>
          <p><strong>Connected:</strong> {{ formatDate(getConnection('linkedin')?.created_at) }}</p>
        </div>

        <div class="platform-actions">
          <button
            v-if="!isConnected('linkedin')"
            @click="connectPlatform('linkedin')"
            class="btn btn-primary"
            :disabled="loading">
            Connect LinkedIn
          </button>
          <button
            v-else
            @click="disconnectPlatform('linkedin')"
            class="btn btn-outline"
            :disabled="loading">
            Disconnect
          </button>
        </div>
      </article>
    </section>

    <!-- Bluesky Modal -->
    <div v-if="showBlueskyModal" class="modal-overlay" @click="showBlueskyModal = false">
      <div class="modal-content" @click.stop role="dialog" aria-labelledby="bluesky-modal-title">
        <h3 id="bluesky-modal-title">Connect Bluesky Account</h3>

        <form @submit.prevent="connectBluesky">
          <div class="form-group">
            <label for="bluesky-handle" class="label-required">Handle</label>
            <input
              id="bluesky-handle"
              v-model="blueskyHandle"
              type="text"
              placeholder="username.bsky.social"
              required />
          </div>

          <div class="form-group">
            <label for="bluesky-password" class="label-required">App Password</label>
            <input
              id="bluesky-password"
              v-model="blueskyPassword"
              type="password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              required />
            <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.5rem;">
              Generate an app password at
              <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener">
                bsky.app/settings/app-passwords
              </a>
            </p>
          </div>

          <div class="btn-group">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner" aria-hidden="true"></span>
              {{ loading ? 'Connecting...' : 'Connect' }}
            </button>
            <button type="button" class="btn btn-outline" @click="showBlueskyModal = false">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Mastodon Modal -->
    <div v-if="showMastodonModal" class="modal-overlay" @click="showMastodonModal = false">
      <div class="modal-content" @click.stop role="dialog" aria-labelledby="mastodon-modal-title">
        <h3 id="mastodon-modal-title">Connect Mastodon Account</h3>

        <form @submit.prevent="connectMastodon">
          <div class="form-group">
            <label for="mastodon-instance" class="label-required">Instance URL</label>
            <input
              id="mastodon-instance"
              v-model="mastodonInstance"
              type="url"
              placeholder="https://mastodon.social"
              required />
            <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-top: 0.5rem;">
              Enter your Mastodon instance URL (e.g., mastodon.social, fosstodon.org)
            </p>
          </div>

          <div class="btn-group">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Connecting...' : 'Connect' }}
            </button>
            <button type="button" class="btn btn-outline" @click="showMastodonModal = false">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
interface PlatformConnection {
  platform: string
  platform_username: string
  created_at: string
  is_active: boolean
}

interface OAuthResponse {
  authUrl?: string
}

interface BlueskyResponse {
  success: boolean
  platform: string
  username: string
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const connections = ref<PlatformConnection[]>([])
const loading = ref(false)
const statusMessage = ref<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

// Bluesky modal
const showBlueskyModal = ref(false)
const blueskyHandle = ref('')
const blueskyPassword = ref('')

// Mastodon modal
const showMastodonModal = ref(false)
const mastodonInstance = ref('https://mastodon.social')

// Load connections on mount
onMounted(async () => {
  await loadConnections()
})

// Load user's platform connections
const loadConnections = async () => {
  if (!user.value?.id) return

  const { data, error } = await supabase
    .from('platform_connections')
    .select('*')
    .eq('user_id', user.value.id)

  const connectionsData = data as PlatformConnection[] | null

  if (!error && connectionsData) {
    connections.value = connectionsData
  }
}

// Check if platform is connected
const isConnected = (platform: string) => {
  return connections.value.some(c => c.platform === platform && c.is_active)
}

// Get connection details
const getConnection = (platform: string) => {
  return connections.value.find(c => c.platform === platform && c.is_active)
}

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Connect platform (OAuth)
const connectPlatform = async (platform: string) => {
  loading.value = true
  statusMessage.value = null

  try {
    // Call API to initiate OAuth
    const response = await $fetch<OAuthResponse>(`/api/auth/${platform}/connect`, {
      method: 'POST'
    })

    if (response.authUrl) {
      // Redirect to OAuth provider
      window.location.href = response.authUrl
    }
  } catch (error: any) {
    statusMessage.value = {
      type: 'error',
      text: error.message || `Failed to connect ${platform}`
    }
  } finally {
    loading.value = false
  }
}

// Connect Bluesky (direct auth)
const connectBluesky = async () => {
  loading.value = true
  statusMessage.value = null

  try {
    const response = await $fetch<BlueskyResponse>('/api/auth/bluesky/connect', {
      method: 'POST',
      body: {
        handle: blueskyHandle.value,
        password: blueskyPassword.value
      }
    })

    statusMessage.value = {
      type: 'success',
      text: 'Successfully connected Bluesky!'
    }

    showBlueskyModal.value = false
    blueskyHandle.value = ''
    blueskyPassword.value = ''

    await loadConnections()
  } catch (error: any) {
    statusMessage.value = {
      type: 'error',
      text: error.data?.message || 'Failed to connect Bluesky'
    }
  } finally {
    loading.value = false
  }
}

// Connect Mastodon (OAuth)
const connectMastodon = async () => {
  loading.value = true
  statusMessage.value = null

  try {
    const response = await $fetch<OAuthResponse>('/api/auth/mastodon/connect', {
      method: 'POST',
      body: {
        instance: mastodonInstance.value
      }
    })

    if (response && 'authUrl' in response && response.authUrl) {
      window.location.href = response.authUrl
    }
  } catch (error: any) {
    statusMessage.value = {
      type: 'error',
      text: error.data?.message || 'Failed to connect Mastodon'
    }
  } finally {
    loading.value = false
  }
}

// Disconnect platform
const disconnectPlatform = async (platform: string) => {
  if (!confirm(`Are you sure you want to disconnect ${platform}?`)) {
    return
  }

  loading.value = true
  statusMessage.value = null

  try {
    await $fetch(`/api/auth/${platform}/disconnect`, {
      method: 'POST'
    })

    statusMessage.value = {
      type: 'success',
      text: `Successfully disconnected ${platform}`
    }

    console.log('Before reload, connections:', connections.value.length)
    await loadConnections()
    console.log('After reload, connections:', connections.value.length)
  } catch (error: any) {
    statusMessage.value = {
      type: 'error',
      text: error.data?.message || `Failed to disconnect ${platform}`
    }
  } finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: 'Connect Platforms - Broadcast',
  meta: [
    { name: 'description', content: 'Connect your social media accounts to Broadcast' }
  ]
})
</script>

<style scoped>
.platforms-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin-bottom: var(--space-2xl);
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.platform-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  transition: all var(--transition-base);
}

.platform-card:hover:not(.platform-disabled) {
  border-color: var(--color-primary);
}

.platform-connected {
  border-color: var(--color-success);
  background-color: rgba(25, 135, 84, 0.05);
}

.platform-disabled {
  opacity: 0.6;
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
}

.platform-info h3 {
  margin: 0 0 var(--space-xs) 0;
  font-size: var(--font-size-xl);
}

.platform-description {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.status-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}

.status-connected {
  background-color: rgba(25, 135, 84, 0.1);
  color: var(--color-success);
}

.status-disconnected {
  background-color: rgba(108, 117, 125, 0.1);
  color: var(--color-secondary);
}

.status-coming-soon {
  background-color: rgba(13, 202, 240, 0.1);
  color: var(--color-info);
}

.platform-details {
  padding: var(--space-md);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

.platform-details p {
  margin: var(--space-xs) 0;
}

.platform-actions {
  margin-top: auto;
}

.platform-actions .btn {
  width: 100%;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal-content {
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: var(--space-lg);
}

@media (max-width: 768px) {
  .platforms-grid {
    grid-template-columns: 1fr;
  }
}
</style>