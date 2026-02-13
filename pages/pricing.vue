<template>
  <div class="pricing-page">
    <section class="pricing-hero" aria-labelledby="pricing-heading">
      <h2 id="pricing-heading">Choose Your Plan</h2>
      <p class="pricing-subtitle">Start broadcasting for free, upgrade as you grow</p>
    </section>

    <section class="pricing-tiers" aria-label="Subscription plans">
      <div class="pricing-grid">

        <!-- Starter Plan -->
        <article class="pricing-card" aria-labelledby="starter-heading">
          <div class="pricing-card-header">
            <h3 id="starter-heading">Starter</h3>
            <div class="pricing-price">
              <span class="price-amount">$0</span>
              <span class="price-period">/month</span>
            </div>
            <p class="pricing-description">Perfect for getting started</p>
          </div>

          <ul class="pricing-features" role="list">
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>2 social platforms</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>25 posts per month</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Tag management</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Platform previews</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Draft saving</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Community support</span>
            </li>
          </ul>

          <button
            class="btn btn-outline pricing-btn"
            aria-label="Start with Starter plan"
            @click="handlePlanSelect('starter')"
          >
            Get Started
          </button>
        </article>

        <!-- Creator Plan (Popular) -->
        <article class="pricing-card pricing-card-popular" aria-labelledby="creator-heading">
          <div class="popular-badge" aria-label="Most popular plan">
            Most Popular
          </div>

          <div class="pricing-card-header">
            <h3 id="creator-heading">Creator</h3>
            <div class="pricing-price">
              <span class="price-amount">$15</span>
              <span class="price-period">/month</span>
            </div>
            <p class="pricing-description">For serious content creators</p>
          </div>

          <ul class="pricing-features" role="list">
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>5 social platforms</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Unlimited posts</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Post scheduling</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Advanced tag management</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Image uploads with alt text</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Post history & editing</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Priority email support</span>
            </li>
          </ul>

          <button
            class="btn btn-primary pricing-btn"
            aria-label="Start with Creator plan"
            @click="handlePlanSelect('creator', 'monthly')"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            {{ loading ? 'Loading...' : 'Start Free Trial' }}
          </button>
          <p class="trial-note">14-day free trial, no credit card required</p>
        </article>

        <!-- Professional Plan -->
        <article class="pricing-card" aria-labelledby="professional-heading">
          <div class="pricing-card-header">
            <h3 id="professional-heading">Professional</h3>
            <div class="pricing-price">
              <span class="price-amount">$49</span>
              <span class="price-period">/month</span>
            </div>
            <p class="pricing-description">For teams and businesses</p>
          </div>

          <ul class="pricing-features" role="list">
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>All platforms</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Unlimited everything</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Team collaboration (5 members)</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Advanced analytics</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Multiple accounts per platform</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Content calendar</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Custom approval workflows</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Priority support & onboarding</span>
            </li>
          </ul>

          <button
            class="btn btn-outline pricing-btn"
            aria-label="Start with Professional plan"
            @click="handlePlanSelect('professional', 'monthly')"
            :disabled="loading"
          >
            {{ loading ? 'Loading...' : 'Start Free Trial' }}
          </button>
          <p class="trial-note">14-day free trial, no credit card required</p>
        </article>

        <!-- Enterprise Plan -->
        <article class="pricing-card" aria-labelledby="enterprise-heading">
          <div class="pricing-card-header">
            <h3 id="enterprise-heading">Enterprise</h3>
            <div class="pricing-price">
              <span class="price-amount">Custom</span>
            </div>
            <p class="pricing-description">Tailored to your organization</p>
          </div>

          <ul class="pricing-features" role="list">
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Everything in Professional</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Unlimited team members</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>White-label solution</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>API access</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Custom integrations</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Dedicated account manager</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>SLA guarantee</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Custom training & support</span>
            </li>
          </ul>

          <button
            class="btn btn-outline pricing-btn"
            aria-label="Contact sales for Enterprise plan"
            @click="handleContactSales"
          >
            Contact Sales
          </button>
        </article>

      </div>
    </section>

    <!-- Comparison Table -->
    <section class="comparison-section" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Feature Comparison</h2>

      <div class="table-wrapper">
        <table class="comparison-table">
          <caption class="sr-only">Detailed comparison of all plan features</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col">Starter</th>
              <th scope="col">Creator</th>
              <th scope="col">Professional</th>
              <th scope="col">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Social Platforms</th>
              <td>2</td>
              <td>5</td>
              <td>All (6+)</td>
              <td>All (6+)</td>
            </tr>
            <tr>
              <th scope="row">Posts per Month</th>
              <td>25</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <th scope="row">Post Scheduling</th>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
            </tr>
            <tr>
              <th scope="row">Image Uploads</th>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
            </tr>
            <tr>
              <th scope="row">Post History</th>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
            </tr>
            <tr>
              <th scope="row">Team Members</th>
              <td>1</td>
              <td>1</td>
              <td>5</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <th scope="row">Analytics</th>
              <td><span aria-label="Not included">–</span></td>
              <td>Basic</td>
              <td>Advanced</td>
              <td>Advanced + Custom</td>
            </tr>
            <tr>
              <th scope="row">Multiple Accounts</th>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
            </tr>
            <tr>
              <th scope="row">API Access</th>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Not included">–</span></td>
              <td><span aria-label="Included">✓</span></td>
            </tr>
            <tr>
              <th scope="row">Support</th>
              <td>Community</td>
              <td>Email</td>
              <td>Priority</td>
              <td>Dedicated</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently Asked Questions</h2>

      <dl class="faq-list">
        <div class="faq-item">
          <dt>
            <h3>Can I change plans at any time?</h3>
          </dt>
          <dd>
            Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits.
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>What payment methods do you accept?</h3>
          </dt>
          <dd>
            We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and for Enterprise plans, we can arrange wire transfers or invoicing.
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>Is there a free trial?</h3>
          </dt>
          <dd>
            Yes! Creator and Professional plans come with a 14-day free trial. No credit card required. The Starter plan is free forever.
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>What happens if I exceed my post limit?</h3>
          </dt>
          <dd>
            On the Starter plan, you'll be prompted to upgrade. We'll never charge you without permission. You can also wait until the next billing cycle when your limit resets.
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>Do you offer annual billing?</h3>
          </dt>
          <dd>
            Yes! Annual billing saves you 20%. Creator is $144/year ($12/month equivalent) and Professional is $470/year ($39/month equivalent).
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>Which social platforms are supported?</h3>
          </dt>
          <dd>
            Currently: Twitter/X, Bluesky, Mastodon, LinkedIn, Threads, and Facebook. We're constantly adding more platforms based on user demand.
          </dd>
        </div>
      </dl>
    </section>

    <!-- CTA Section -->
    <section class="pricing-cta" aria-labelledby="cta-heading">
      <h2 id="cta-heading">Ready to start broadcasting?</h2>
      <p>Join thousands of creators broadcasting their message across multiple platforms.</p>
      <div class="btn-group">
        <NuxtLink to="/auth?mode=signup" class="btn btn-primary">Start Free Trial</NuxtLink>
        <NuxtLink to="/docs" class="btn btn-outline">View Documentation</NuxtLink>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()
const loading = ref(false)

type Plan = 'starter' | 'creator' | 'professional' | 'enterprise'
type Billing = 'monthly' | 'yearly'

// Handle plan selection
const handlePlanSelect = async (plan: Plan, billing?: Billing) => {
  // Starter is free, just need to sign up
  if (plan === 'starter') {
    if (!user.value) {
      router.push('/auth?mode=signup')
    } else {
      router.push('/dashboard')
    }
    return
  }

  // For paid plans, redirect to login if not authenticated
  if (!user.value) {
    // Store intended plan in session storage
    if (process.client) {
      sessionStorage.setItem('intended_plan', JSON.stringify({ plan, billing }))
    }
    router.push('/auth')
    return
  }

  // Create checkout session
  loading.value = true
  try {
    const response = await $fetch('/api/stripe/create-checkout', {
      method: 'POST',
      body: {
        plan,
        billing: billing || 'monthly'
      }
    })

    if (response.url) {
      // Redirect to Stripe Checkout
      window.location.href = response.url
    }
  } catch (error: any) {
    console.error('Checkout error:', error)
    alert('Failed to start checkout. Please try again.')
  } finally {
    loading.value = false
  }
}

// Handle contact sales
const handleContactSales = () => {
  // In production, this would open a contact form or send to a sales page
  window.location.href = 'mailto:sales@broadcast.app?subject=Enterprise Inquiry'
}

// Check for intended plan on mount (after login redirect)
onMounted(() => {
  if (process.client && user.value) {
    const intendedPlan = sessionStorage.getItem('intended_plan')
    if (intendedPlan) {
      const { plan, billing } = JSON.parse(intendedPlan)
      sessionStorage.removeItem('intended_plan')
      handlePlanSelect(plan, billing)
    }
  }
})

// SEO
useHead({
  title: 'Pricing - Broadcast',
  meta: [
    { name: 'description', content: 'Choose the perfect Broadcast plan for your needs. Start free and upgrade as you grow.' }
  ]
})
</script>

<style scoped>
/* Pricing Hero */
.pricing-hero {
  text-align: center;
  padding-block: var(--space-2xl);
}

.pricing-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
}

/* Pricing Grid */
.pricing-tiers {
  margin-block: var(--space-2xl);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-xl);
  max-width: 1400px;
  margin-inline: auto;
}

/* Pricing Cards */
.pricing-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all var(--transition-base);
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.pricing-card-popular {
  border-color: var(--color-primary);
  border-width: 3px;
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.pricing-card-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.pricing-card-header h3 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-sm);
}

.pricing-price {
  margin-block: var(--space-md);
}

.price-amount {
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-primary);
}

.price-period {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
}

.pricing-description {
  color: var(--color-text-muted);
  margin: 0;
}

/* Features List */
.pricing-features {
  list-style: none;
  flex: 1;
  margin-bottom: var(--space-lg);
}

.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding-block: var(--space-sm);
}

.feature-icon {
  color: var(--color-success);
  font-weight: 700;
  flex-shrink: 0;
}

.pricing-btn {
  width: 100%;
}

.trial-note {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
}

/* Comparison Table */
.comparison-section {
  margin-block: var(--space-2xl) * 2;
  padding-block: var(--space-2xl);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding-inline: var(--space-xl);
}

.comparison-section h2 {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.table-wrapper {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.comparison-table th,
.comparison-table td {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.comparison-table thead th {
  background-color: var(--color-bg);
  font-weight: 600;
  position: sticky;
  top: 0;
}

.comparison-table tbody th {
  font-weight: 600;
}

.comparison-table td {
  text-align: center;
}

.comparison-table tbody tr:hover {
  background-color: var(--color-bg);
}

/* FAQ Section */
.faq-section {
  margin-block: var(--space-2xl) * 2;
}

.faq-section h2 {
  text-align: center;
  margin-top: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.faq-list {
  max-width: 800px;
  margin-inline: auto;
}

.faq-item {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--color-border);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item dt h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-sm);
}

.faq-item dd {
  color: var(--color-text-muted);
  line-height: 1.7;
  margin: 0;
}

/* CTA Section */
.pricing-cta {
  text-align: center;
  padding: var(--space-2xl);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  margin-block: var(--space-2xl);
}

.pricing-cta h2 {
  margin-bottom: var(--space-sm);
}

.pricing-cta p {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  margin-bottom: var(--space-xl);
}

/* Responsive */
@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .comparison-table {
    font-size: var(--font-size-sm);
  }

  .comparison-table th,
  .comparison-table td {
    padding: var(--space-sm);
  }
}
</style>
