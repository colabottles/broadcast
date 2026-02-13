# Stripe Payment Integration Guide

Complete guide to setting up Stripe for Broadcast subscriptions.

---

## 🎯 Overview

Broadcast uses Stripe for:
- Subscription management (Creator, Professional, Enterprise)
- 14-day free trials
- Automatic billing
- Customer portal (change cards, cancel, invoices)
- Webhook notifications

---

## Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete business verification (required for live mode)

---

## Step 2: Get API Keys

### Test Mode (Development)

1. Go to [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Keep this secure!

3. Add to your `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Live Mode (Production)

1. Complete Stripe activation
2. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
3. Copy live keys (start with `pk_live_` and `sk_live_`)
4. Update production `.env`

---

## Step 3: Create Products & Prices

### Creator Plan

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Click "+ Add product"
3. Fill in:
   - **Name**: Creator Plan
   - **Description**: For serious content creators - unlimited posts to 5 platforms
   - **Pricing model**: Standard pricing
   - **Price**: $15.00
   - **Billing period**: Monthly
   - **Currency**: USD
4. Click "Save product"
5. Copy the **Price ID** (starts with `price_`)
6. Repeat for Yearly pricing ($144/year)

### Professional Plan

1. Create another product:
   - **Name**: Professional Plan
   - **Description**: For teams and businesses - unlimited posts to all platforms
   - **Price**: $49.00 monthly
   - **Price**: $470.00 yearly
2. Copy both Price IDs

### Update .env with Price IDs

```bash
STRIPE_PRICE_CREATOR_MONTHLY=price_xxx
STRIPE_PRICE_CREATOR_YEARLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_xxx
```

---

## Step 4: Configure Webhook

Webhooks notify your app when subscriptions change.

### Development (Using Stripe CLI)

1. Install Stripe CLI: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. Login to Stripe CLI:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret (starts with `whsec_`)

5. Add to `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

6. Keep this terminal running while developing

### Production Webhook

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "+ Add endpoint"
3. Enter endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click "Add endpoint"
6. Copy the **Signing secret**
7. Add to production `.env`

---

## Step 5: Enable Customer Portal

The customer portal lets users manage their subscriptions.

1. Go to [Customer Portal Settings](https://dashboard.stripe.com/test/settings/billing/portal)
2. Click "Activate test link"
3. Configure settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to view invoice history
   - ✅ Allow customers to cancel subscriptions
   - ✅ Prorate subscription changes
4. Set cancellation options:
   - ✅ Cancel at period end (recommended)
   - Or: Cancel immediately
5. Save changes

---

## Step 6: Configure Free Trials

Free trials are already configured in the code (14 days).

To adjust trial length, edit:
```typescript
// server/api/stripe/create-checkout.post.ts
subscription_data: {
  trial_period_days: 14, // Change this number
  // ...
}
```

---

## Step 7: Test the Integration

### Test Credit Cards

Use these test cards in development:

**Success:**
- `4242 4242 4242 4242` - Visa
- `5555 5555 5555 4444` - Mastercard
- Any future expiry date
- Any 3-digit CVC

**Requires 3D Secure:**
- `4000 0027 6000 3184`

**Declined:**
- `4000 0000 0000 0002` - Generic decline
- `4000 0000 0000 9995` - Insufficient funds

### Testing Flow

1. Start your app: `npm run dev`
2. Go to `/pricing`
3. Click "Start Free Trial" on Creator plan
4. Use test card: `4242 4242 4242 4242`
5. Check:
   - ✅ Redirects to dashboard
   - ✅ Dashboard shows "Free Trial" status
   - ✅ Profile updated in database
   - ✅ Post limit changed
6. Test webhook:
   - Cancel subscription in Stripe dashboard
   - Verify user downgraded to Starter

---

## Step 8: Production Checklist

Before going live:

### Required Configuration

- [ ] Switch to live API keys
- [ ] Create live products/prices
- [ ] Set up production webhook
- [ ] Update `SITE_URL` in `.env`
- [ ] Test live payment flow
- [ ] Verify webhook events work
- [ ] Enable Customer Portal in live mode

### Stripe Dashboard Settings

- [ ] Add business information
- [ ] Set up bank account for payouts
- [ ] Configure tax collection (if applicable)
- [ ] Set up email receipts
- [ ] Configure branding (logo, colors)
- [ ] Set statement descriptor (what appears on credit card)

### Security

- [ ] Never commit `.env` file
- [ ] Use environment variables in production
- [ ] Verify webhook signatures
- [ ] Use HTTPS for all webhooks
- [ ] Set up Stripe webhook IP allowlist (optional)

---

## Subscription Flow Diagram

```
User clicks "Subscribe"
        ↓
Create Stripe Checkout Session
        ↓
User enters payment info
        ↓
14-day trial starts
        ↓
checkout.session.completed webhook
        ↓
Update database (trial status)
        ↓
User has full access
        ↓
After 14 days: First payment
        ↓
invoice.payment_succeeded webhook
        ↓
Update database (active status)
```

---

## Webhook Events Explained

### `checkout.session.completed`
- **When**: User completes checkout
- **Action**: Create subscription record, start trial

### `customer.subscription.updated`
- **When**: Plan change, trial ends, reactivation
- **Action**: Update subscription status

### `customer.subscription.deleted`
- **When**: User cancels or subscription expires
- **Action**: Downgrade to free plan

### `invoice.payment_failed`
- **When**: Payment declined
- **Action**: Mark as past_due, email user

### `invoice.payment_succeeded`
- **When**: Successful payment
- **Action**: Ensure active status

---

## Common Issues & Solutions

### Webhook not receiving events

**Problem**: Webhook endpoint not getting called

**Solutions**:
- Check Stripe CLI is running (development)
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure endpoint is publicly accessible (production)
- Review webhook logs in Stripe dashboard

### Payment fails during testing

**Problem**: Test payments don't work

**Solutions**:
- Use test mode API keys
- Use test credit card numbers
- Check for JavaScript errors in console
- Verify Stripe publishable key is correct

### Subscription not updating in database

**Problem**: User subscribed but database not updated

**Solutions**:
- Check webhook is configured
- Verify webhook secret is correct
- Check server logs for errors
- Ensure RLS policies allow updates
- Verify Supabase service key is used in webhook handler

### Customer Portal not working

**Problem**: "Manage Subscription" button doesn't work

**Solutions**:
- Activate Customer Portal in Stripe dashboard
- Verify stripe_customer_id exists in database
- Check for JavaScript errors
- Ensure user has a subscription

---

## Monitoring & Analytics

### Stripe Dashboard

Monitor your business:
- **Revenue**: Total MRR, churn rate
- **Customers**: Active subscribers, trial conversions
- **Payments**: Success rate, failed payments
- **Events**: Webhook delivery status

### Key Metrics to Track

1. **MRR** (Monthly Recurring Revenue)
2. **Churn Rate** (% of cancellations)
3. **Trial Conversion** (% who convert to paid)
4. **Failed Payments** (requires follow-up)
5. **Average Revenue Per User**

---

## Pricing Strategy Tips

### Recommended Approach

1. **Start with monthly** pricing
2. **Add yearly** option with 20% discount
3. **Offer 14-day trial** (no credit card required)
4. **Use tiered pricing** (we already have this)
5. **Allow easy upgrades/downgrades**

### Pricing Psychology

- ✅ Position middle tier as "Most Popular"
- ✅ Show annual savings ($180 vs $144)
- ✅ Use social proof ("Join 1000+ creators")
- ✅ Offer trial with no credit card
- ✅ Make starter plan generous enough to hook users

---

## Advanced Features (Optional)

### Promotion Codes

Create discount codes in Stripe:
1. Go to [Coupons](https://dashboard.stripe.com/test/coupons)
2. Create coupon (%, fixed amount, or trial extension)
3. Users enter at checkout

Already enabled in code:
```typescript
allow_promotion_codes: true
```

### Usage-Based Billing

For pay-as-you-go pricing:
- Metered billing
- Report usage via API
- Charge based on posts sent

### Tax Collection

Stripe Tax handles sales tax automatically:
1. Enable in Stripe settings
2. Add one line to checkout session
3. Stripe calculates tax per region

---

## Support & Resources

### Official Documentation

- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Checkout Quickstart](https://stripe.com/docs/checkout/quickstart)
- [Customer Portal Guide](https://stripe.com/docs/billing/subscriptions/customer-portal)

### Testing Tools

- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhook Tester](https://webhook.site)

### Getting Help

- [Stripe Support](https://support.stripe.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/stripe-payments)
- Stripe Discord Community

---

## Cost of Stripe

### Fees

- **Standard**: 2.9% + $0.30 per successful charge
- **No monthly fees** (pay-as-you-go)
- **No setup fees**
- **Free failed payments**

### Example Revenue Calculation

100 customers at $15/month = $1,500 revenue

**Stripe fees**: ~$50 (2.9% + $0.30 × 100)

**Your net**: ~$1,450/month

**Annual net** (assuming no churn): ~$17,400/year

---

## Next Steps

1. ✅ Create Stripe account
2. ✅ Set up products & prices
3. ✅ Configure webhook
4. ✅ Test with test cards
5. ✅ Enable Customer Portal
6. 🚀 Launch and start earning!

Your payment system is now ready to generate revenue! 💰
