<template>
  <div class="pricing-page">
    <section class="pricing-hero" aria-labelledby="pricing-heading">
      <h1 id="pricing-heading">Choose Your Plan</h1>
      <p class="pricing-subtitle">Start broadcasting for free, upgrade as you grow</p>

      <!-- Billing Toggle -->
      <div class="billing-toggle">
        <span :class="['billing-option', { active: billingPeriod === 'monthly' }]">
          Monthly
        </span>
        <button
          @click="toggleBilling"
          class="toggle-switch-btn"
          :aria-label="`Switch to ${billingPeriod === 'monthly' ? 'yearly' : 'monthly'} billing`"
          role="switch"
          :aria-checked="billingPeriod === 'yearly'">
          <span class="toggle-slider"></span>
        </button>
        <span :class="['billing-option', { active: billingPeriod === 'yearly' }]">
          Yearly
          <span class="save-badge">Save 20%</span>
        </span>
      </div>
    </section>

    <section class="pricing-tiers" aria-label="Subscription plans">
      <div class="pricing-grid">

        <!-- Starter Plan -->
        <article class="pricing-card" aria-labelledby="starter-heading">
          <header class="pricing-card-header">
            <h2 id="starter-heading">Starter</h2>
            <div class="pricing-price">
              <span class="price-amount">$0</span>
              <span class="price-period">/month</span>
            </div>
            <p class="pricing-description">Perfect for trying out Broadcast</p>
          </header>

          <ul class="pricing-features" role="list">
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Up to 2 platforms</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>25 posts per month</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Basic image uploads</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Draft saving</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Tag management</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Community support</span>
            </li>
          </ul>

          <button
            class="btn btn-outline pricing-btn"
            aria-label="Start with Starter plan"
            @click="handlePlanSelect('starter')">
            Get Started Free
          </button>
        </article>

        <!-- Creator Plan (Popular) -->
        <article class="pricing-card pricing-card-popular" aria-labelledby="creator-heading">
          <div class="popular-badge" aria-label="Most popular plan">
            Most Popular
          </div>

          <header class="pricing-card-header">
            <h2 id="creator-heading">Creator</h2>
            <div class="pricing-price">
              <span class="price-amount">${{ creatorPrice }}</span>
              <span class="price-period">/{{ billingPeriod === 'monthly' ? 'month' : 'year'
                }}</span>
            </div>
            <p v-if="billingPeriod === 'yearly'" class="pricing-savings">
              ${{ creatorMonthlySavings }}/month
            </p>
            <p class="pricing-description">Everything you need to create</p>
          </header>

          <ul class="pricing-features" role="list">
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>All 3 platforms</strong></span>
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
              <span><strong>Unlimited image uploads</strong></span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Draft saving</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Post history</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Platform previews</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Priority email support</span>
            </li>
          </ul>

          <p class="trial-note">{{ billingPeriod === 'monthly' ? 'Billed monthly' : 'Billed annually' }} • Cancel anytime</p>

          <button
            class="btn btn-primary pricing-btn"
            aria-label="Start with Creator plan"
            @click="handlePlanSelect('creator', billingPeriod)"
            :disabled="loading">
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            {{ loading ? 'Loading...' : 'Upgrade to Creator' }}
          </button>
        </article>

        <!-- Professional Plan -->
        <article class="pricing-card" aria-labelledby="professional-heading">
          <header class="pricing-card-header">
            <h2 id="professional-heading">Professional</h2>
            <div class="pricing-price">
              <span class="price-amount">${{ professionalPrice }}</span>
              <span class="price-period">/{{ billingPeriod === 'monthly' ? 'month' : 'year'
                }}</span>
            </div>
            <p v-if="billingPeriod === 'yearly'" class="pricing-savings">
              ${{ professionalMonthlySavings }}/month
            </p>
            <p class="pricing-description">For teams and businesses</p>
          </header>

          <ul class="pricing-features" role="list">
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span><strong>Everything in Creator</strong></span>
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
              <span>Content calendar view</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Team workflows</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Performance reports</span>
            </li>
            <li>
              <span class="feature-icon" aria-hidden="true">✓</span>
              <span>Priority support & onboarding</span>
            </li>
          </ul>

          <p class="trial-note">{{ billingPeriod === 'monthly' ? 'Billed monthly' : 'Billed annually' }} • Cancel anytime</p>

          <button
            class="btn btn-outline pricing-btn"
            aria-label="Start with Professional plan"
            @click="handlePlanSelect('professional', billingPeriod)"
            :disabled="loading">
            {{ loading ? 'Loading...' : 'Upgrade to Pro' }}
          </button>
        </article>

        <!-- Enterprise Plan -->
        <article class="pricing-card" aria-labelledby="enterprise-heading">
          <header class="pricing-card-header">
            <h2 id="enterprise-heading">Enterprise</h2>
            <div class="pricing-price">
              <span class="price-amount">Custom</span>
            </div>
            <p class="pricing-description">Tailored to your organization</p>
          </header>

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
              <span>Custom training</span>
            </li>
          </ul>

          <button
            class="btn btn-outline pricing-btn"
            aria-label="Contact sales for Enterprise plan"
            @click="handleContactSales">
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
              <td>Up to 2</td>
              <td>All 3</td>
              <td>All 3</td>
              <td>All 3</td>
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
              <td>Basic (up to 4)</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <th scope="row">Draft Saving</th>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
              <td><span aria-label="Included">✓</span></td>
            </tr>
            <tr>
              <th scope="row">Analytics</th>
              <td><span aria-label="Not included">–</span></td>
              <td>Basic</td>
              <td>Advanced</td>
              <td>Custom</td>
            </tr>
            <tr>
              <th scope="row">Team Members</th>
              <td>1</td>
              <td>1</td>
              <td>5</td>
              <td>Unlimited</td>
            </tr>
            <tr>
              <th scope="row">Support</th>
              <td>Community</td>
              <td>Priority Email</td>
              <td>Priority + Onboarding</td>
              <td>Dedicated Manager</td>
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
            Yes! You can upgrade or downgrade your plan at any time. Changes take effect
            immediately.
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>What payment methods do you accept?</h3>
          </dt>
          <dd>
            We accept all major credit cards (Visa, Mastercard, American Express, Discover) through
            Stripe. For Enterprise plans, we can arrange wire transfers or invoicing.
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>What happens if I exceed my post limit?</h3>
          </dt>
          <dd>
            On the Starter plan, you'll be prompted to upgrade when you reach 25 posts. We'll never
            charge you without permission. You can also wait until the next month when your limit
            resets.
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>Do you offer annual billing?</h3>
          </dt>
          <dd>
            Yes! Annual billing saves you 20%. Creator is $58/year (save $14) and Professional is
            $278/year (save $70).
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>Which social platforms are supported?</h3>
          </dt>
          <dd>
            Currently we support Bluesky, Mastodon, and LinkedIn. More platforms are coming soon!
          </dd>
        </div>

        <div class="faq-item">
          <dt>
            <h3>Can I cancel anytime?</h3>
          </dt>
          <dd>
            Absolutely! You can cancel your subscription at any time. You'll continue to have access
            until the end of your billing period.
          </dd>
        </div>
      </dl>
    </section>

    <!-- CTA Section -->
    <section class="pricing-cta" aria-labelledby="cta-heading">
      <h2 id="cta-heading">Ready to start broadcasting?</h2>
      <p>Join content creators broadcasting their message across multiple platforms.</p>
      <div class="btn-group">
        <NuxtLink to="/signup" class="btn btn-primary">Get Started Free</NuxtLink>
        <button @click="handleContactSales" class="btn btn-outline">Contact Sales</button>
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

// Billing period state
const billingPeriod = ref<Billing>('monthly')

// Pricing calculations
const creatorPrice = computed(() => {
  return billingPeriod.value === 'monthly' ? 6 : 58
})

const professionalPrice = computed(() => {
  return billingPeriod.value === 'monthly' ? 29 : 278
})

const creatorMonthlySavings = computed(() => {
  return billingPeriod.value === 'yearly' ? '4.83' : '6'
})

const professionalMonthlySavings = computed(() => {
  return billingPeriod.value === 'yearly' ? '23.17' : '29'
})

// Toggle billing period
const toggleBilling = () => {
  billingPeriod.value = billingPeriod.value === 'monthly' ? 'yearly' : 'monthly'
}

// Handle plan selection
const handlePlanSelect = async (plan: Plan, billing?: Billing) => {
  // Starter is free, just need to sign up
  if (plan === 'starter') {
    if (!user.value) {
      router.push('/signup')
    } else {
      router.push('/')
    }
    return
  }

  // For paid plans, redirect to login if not authenticated
  if (!user.value) {
    // Store intended plan in session storage
    if (process.client) {
      sessionStorage.setItem('intended_plan', JSON.stringify({ plan, billing: billing || billingPeriod.value }))
    }
    router.push('/login')
    return
  }

  // Create checkout session
  loading.value = true
  try {
    const response = await $fetch('/api/stripe/create-checkout', {
      method: 'POST',
      body: {
        plan,
        billing: billing || billingPeriod.value
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
  window.location.href = 'mailto:todd@toddl.dev?subject=Enterprise Inquiry'
}

// Check for intended plan on mount (after login redirect)
onMounted(() => {
  if (process.client && user.value) {
    const intendedPlan = sessionStorage.getItem('intended_plan')
    if (intendedPlan) {
      const { plan, billing } = JSON.parse(intendedPlan)
      sessionStorage.removeItem('intended_plan')
      billingPeriod.value = billing
      handlePlanSelect(plan, billing)
    }
  }
})

// SEO
useHead({
  title: 'Pricing - Broadcast',
  meta: [
    { name: 'description', content: 'Choose the perfect Broadcast plan for your needs. Start free and upgrade as you grow. Save 20% with annual billing.' }
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

/* Billing Toggle */
.billing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.billing-option {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.billing-option.active {
  color: var(--color-text);
}

.save-badge {
  display: inline-block;
  background-color: var(--color-success);
  color: white;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.toggle-switch-btn {
  position: relative;
  width: 3.5rem;
  height: 2rem;
  background-color: var(--color-border);
  border: none;
  border-radius: 2rem;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.toggle-switch-btn[aria-checked="true"] {
  background-color: var(--color-primary);
}

.toggle-slider {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: white;
  border-radius: 50%;
  transition: transform var(--transition-base);
}

.toggle-switch-btn[aria-checked="true"] .toggle-slider {
  transform: translateX(1.5rem);
}

.toggle-switch-btn:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-offset);
}

/* Pricing Savings Text */
.pricing-savings {
  font-size: var(--font-size-sm);
  color: var(--color-success);
  font-weight: 600;
  margin: var(--space-xs) 0 0 0;
}

/* Pricing Grid */
.pricing-tiers {
  margin-block: var(--space-2xl);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
  max-width: 1400px;
  margin-inline: auto;
}

/* Pricing Cards */
.pricing-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all var(--transition-base);
  min-width: 0;
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
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  white-space: nowrap;
}

.pricing-card-header {
  text-align: center;
  margin-bottom: var(--space-md);
}

.pricing-card-header h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-sm);
}

.pricing-price {
  margin-block: var(--space-sm);
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.price-period {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
}

.pricing-description {
  color: var(--color-text-muted);
  margin: 0;
  font-size: var(--font-size-sm);
}

/* Features List */
.pricing-features {
  list-style: none;
  flex: 1;
  margin-bottom: var(--space-md);
}

.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  padding-block: var(--space-xs);
  font-size: var(--font-size-sm);
}

.feature-icon {
  color: var(--color-success);
  font-weight: 700;
  flex-shrink: 0;
  font-size: var(--font-size-sm);
}

.pricing-btn {
  width: 100%;
  font-size: var(--font-size-sm);
  padding: var(--space-sm) var(--space-md);
}

.trial-note {
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-info );
  margin-top: var(--space-sm);
}

/* Comparison Table */
.comparison-section {
  margin-block: var(--space-2xl);
  padding-block: var(--space-xl);
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
  max-width: 1400px;
  margin-inline: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  table-layout: fixed;
}

.comparison-table th:first-child,
.comparison-table td:first-child {
  width: 25%;
  text-align: left;
}

.comparison-table th:nth-child(2),
.comparison-table td:nth-child(2),
.comparison-table th:nth-child(3),
.comparison-table td:nth-child(3),
.comparison-table th:nth-child(4),
.comparison-table td:nth-child(4),
.comparison-table th:nth-child(5),
.comparison-table td:nth-child(5) {
  width: 18.75%;
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
  font-size: var(--font-size-base);
}

.comparison-table tbody th {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.comparison-table td {
  text-align: center;
  font-size: var(--font-size-sm);
}

.comparison-table tbody tr:hover {
  background-color: var(--color-bg);
}

/* FAQ Section */
.faq-section {
  margin-block: var(--space-2xl);
}

.faq-section h2 {
  text-align: center;
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
@media (max-width: 1200px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .comparison-table th:first-child,
  .comparison-table td:first-child {
    width: 30%;
  }

  .comparison-table th:nth-child(n+2),
  .comparison-table td:nth-child(n+2) {
    width: 17.5%;
  }
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .comparison-table {
    font-size: var(--font-size-xs);
  }

  .comparison-table th,
  .comparison-table td {
    padding: var(--space-sm);
  }

  .comparison-table th:first-child,
  .comparison-table td:first-child {
    width: 40%;
  }

  .comparison-table th:nth-child(n+2),
  .comparison-table td:nth-child(n+2) {
    width: 15%;
  }
}
</style>