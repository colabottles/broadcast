<template>
  <div class="billing-page">
    <h2>Billing & Subscription</h2>
    <p class="page-subtitle">Manage your subscription and payment methods</p>

    <!-- Status Messages -->
    <div v-if="statusMessage" :class="['alert', `alert-${statusMessage.type}`]" role="alert">
      {{ statusMessage.text }}
    </div>

    <!-- Current Plan -->
    <section class="billing-section" aria-labelledby="current-plan-heading">
      <h3 id="current-plan-heading">Current Plan</h3>

      <div class="plan-card">
        <div class="plan-header">
          <div>
            <h4>{{ planName }}</h4>
            <p class="plan-status" :class="`status-${profile?.subscription_status}`">
              {{ statusText }}
            </p>
          </div>
          <div class="plan-price">
            <span class="price-amount">{{ planPrice }}</span>
            <span class="price-period" v-if="planPrice !== 'Free'">/month</span>
          </div>
        </div>

        <div class="plan-details">
          <div class="detail-item">
            <span class="detail-label">Post Limit:</span>
            <span class="detail-value">
              {{ profile?.post_limit === 999999 ? 'Unlimited' : profile?.post_limit }} posts/month
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Posts This Month:</span>
            <span class="detail-value">
              {{ profile?.posts_this_month || 0 }} / {{ profile?.post_limit === 999999 ? '∞' : profile?.post_limit }}
            </span>
          </div>
          <div v-if="profile?.subscription_status === 'trialing'" class="detail-item">
            <span class="detail-label">Trial Ends:</span>
            <span class="detail-value">{{ trialEndDate }}</span>
          </div>
        </div>

        <div class="plan-actions">
          <NuxtLink
            v-if="profile?.subscription_tier === 'starter'"
            to="/pricing"
            class="btn btn-primary"
          >
            Upgrade Plan
          </NuxtLink>
          <button
            v-else
            @click="manageSubscription"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Loading...' : 'Manage Subscription' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Usage Stats -->
    <section class="billing-section" aria-labelledby="usage-heading">
      <h3 id="usage-heading">This Month's Usage</h3>

      <div class="usage-chart">
        <div class="usage-bar">
          <div
            class="usage-fill"
            :style="{ width: `${usagePercentage}%` }"
            :class="{ 'usage-warning': usagePercentage > 80, 'usage-danger': usagePercentage > 95 }"
          ></div>
        </div>
        <p class="usage-text">
          {{ profile?.posts_this_month || 0 }} of {{ profile?.post_limit === 999999 ? '∞' : profile?.post_limit }} posts used
          <span v-if="profile?.post_limit !== 999999">({{ usagePercentage }}%)</span>
        </p>
      </div>

      <div v-if="usagePercentage > 80 && profile?.subscription_tier === 'starter'" class="alert alert-info" style="margin-top: 1rem;">
        You're approaching your monthly limit.
        <NuxtLink to="/pricing">Upgrade to get unlimited posts</NuxtLink>.
      </div>
    </section>

    <!-- Billing History -->
    <section class="billing-section" aria-labelledby="history-heading">
      <h3 id="history-heading">Billing History</h3>

      <div v-if="profile?.subscription_tier === 'starter'" class="empty-state">
        <p>No billing history yet. Upgrade to a paid plan to see your invoices here.</p>
      </div>
      <div v-else>
        <p class="text-muted">
          View and download your invoices in the
          <button @click="manageSubscription" class="text-link">
            Stripe Customer Portal
          </button>
        </p>
      </div>
    </section>

    <!-- Cancel Subscription -->
    <section v-if="profile?.subscription_tier !== 'starter'" class="billing-section danger-zone" aria-labelledby="cancel-heading">
      <h3 id="cancel-heading">Cancel Subscription</h3>
      <p>
        If you cancel, you'll continue to have access until the end of your billing period.
        You can reactivate anytime before then.
      </p>
      <button @click="manageSubscription" class="btn btn-outline">
        Manage Subscription
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
interface Profile {
  subscription_tier: string
  subscription_status: string
  post_limit: number
  posts_this_month: number
  stripe_customer_id?: string
}

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const loading = ref(false)
const statusMessage = ref<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

// Load user profile
const profile = ref<Profile | null>(null)

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  if (!user.value?.id) return

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .single()

  const profileData = data as Profile | null

  if (!error && profileData) {
    profile.value = profileData
  }
}

// Computed properties
const planName = computed(() => {
  const names: Record<string, string> = {
    starter: 'Starter',
    creator: 'Creator',
    professional: 'Professional',
    enterprise: 'Enterprise'
  }
  return names[profile.value?.subscription_tier || 'starter'] || 'Free'
})

const planPrice = computed(() => {
  const prices: Record<string, string> = {
    starter: 'Free',
    creator: '$15',
    professional: '$49',
    enterprise: 'Custom'
  }
  return prices[profile.value?.subscription_tier || 'starter'] || 'Free'
})

const statusText = computed(() => {
  const statuses: Record<string, string> = {
    active: 'Active',
    trialing: 'Free Trial',
    cancelled: 'Cancelled',
    past_due: 'Payment Failed'
  }
  return statuses[profile.value?.subscription_status || 'active'] || 'Active'
})

const usagePercentage = computed(() => {
  if (!profile.value || profile.value.post_limit === 999999) return 0
  return Math.round((profile.value.posts_this_month / profile.value.post_limit) * 100)
})

const trialEndDate = computed(() => {
  // This would come from subscription data in a real implementation
  const date = new Date()
  date.setDate(date.getDate() + 14)
  return date.toLocaleDateString()
})

// Manage subscription (opens Stripe Customer Portal)
const manageSubscription = async () => {
  loading.value = true
  statusMessage.value = null

  try {
    const response = await $fetch('/api/stripe/create-portal', {
      method: 'POST'
    })

    if (response.url) {
      window.location.href = response.url
    }
  } catch (error: any) {
  statusMessage.value = {
    type: 'error',
    text: 'Failed to open billing portal. Please try again.'
  }
} finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: 'Billing - Broadcast',
  meta: [
    { name: 'description', content: 'Manage your Broadcast subscription and billing' }
  ]
})
</script>

<style scoped>
.billing-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin-bottom: var(--space-2xl);
}

.billing-section {
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-2xl);
  border-bottom: 1px solid var(--color-border);
}

.billing-section:last-child {
  border-bottom: none;
}

.plan-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-lg);
  gap: var(--space-lg);
}

.plan-header h4 {
  margin: 0 0 var(--space-xs) 0;
  font-size: var(--font-size-2xl);
}

.plan-status {
  font-size: var(--font-size-sm);
  font-weight: 600;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
}

.status-active {
  background-color: rgba(25, 135, 84, 0.1);
  color: var(--color-success);
}

.status-trialing {
  background-color: rgba(13, 202, 240, 0.1);
  color: var(--color-info);
}

.status-cancelled {
  background-color: rgba(108, 117, 125, 0.1);
  color: var(--color-secondary);
}

.status-past_due {
  background-color: rgba(220, 53, 69, 0.1);
  color: var(--color-danger);
}

.plan-price {
  text-align: right;
}

.price-amount {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-primary);
}

.price-period {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-weight: 600;
  color: var(--color-text-muted);
}

.detail-value {
  font-weight: 600;
  color: var(--color-text);
}

.plan-actions {
  display: flex;
  gap: var(--space-md);
}

.plan-actions .btn {
  flex: 1;
}

.usage-chart {
  margin-top: var(--space-md);
}

.usage-bar {
  width: 100%;
  height: 2rem;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.usage-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width var(--transition-base);
}

.usage-fill.usage-warning {
  background-color: var(--color-warning);
}

.usage-fill.usage-danger {
  background-color: var(--color-danger);
}

.usage-text {
  margin-top: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
}

.text-muted {
  color: var(--color-text-muted);
}

.text-link {
  background: none;
  border: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font: inherit;
}

.text-link:hover {
  color: var(--color-primary-hover);
}

.danger-zone {
  border-color: var(--color-danger);
  background-color: rgba(220, 53, 69, 0.05);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
}

.danger-zone h3 {
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .plan-header {
    flex-direction: column;
  }

  .plan-price {
    text-align: left;
  }

  .plan-actions {
    flex-direction: column;
  }
}
</style>