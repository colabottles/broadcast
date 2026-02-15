# Netlify Deployment Guide

Complete guide to deploying Broadcast to Netlify.

---

## Prerequisites

Before deploying:

- ✅ GitHub account
- ✅ Netlify account (free tier is fine)
- ✅ Supabase project set up
- ✅ Stripe account configured
- ✅ Platform API keys ready

---

## Step 1: Push to GitHub

1. Create a new GitHub repository:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Broadcast app"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/broadcast.git

# Push to GitHub
git push -u origin main
```

2. Make sure `.env` is in `.gitignore`:
```bash
# Already in .gitignore, but verify:
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

---

## Step 2: Connect to Netlify

### Option A: Netlify Dashboard (Recommended)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your repositories
5. Select your `broadcast` repository
6. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.output/public`
   - **Functions directory**: `.output/server`
7. Click "Deploy site"

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Follow prompts:
# - Create & configure a new site
# - Choose your team
# - Enter site name (e.g., broadcast-app)
# - Build command: npm run build
# - Publish directory: .output/public
# - Functions directory: .output/server

# Deploy
netlify deploy --prod
```

---

## Step 3: Configure Environment Variables

In Netlify Dashboard → Site Settings → Environment Variables, add:

### Required Variables

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs
STRIPE_PRICE_STARTER=price_free
STRIPE_PRICE_CREATOR_MONTHLY=price_xxx
STRIPE_PRICE_CREATOR_YEARLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_xxx

# Mastodon
MASTODON_CLIENT_ID=your-client-id
MASTODON_CLIENT_SECRET=your-client-secret
MASTODON_CALLBACK_URL=https://yoursite.netlify.app/api/auth/mastodon/callback

# App Configuration
SITE_URL=https://yoursite.netlify.app
CRON_SECRET=generate-a-random-secret-here

# Node Environment
NODE_ENV=production
```

### How to Set Environment Variables

**Via Dashboard:**

1. Go to Site Settings → Environment Variables
2. Click "Add a variable"
3. Enter key and value
4. Click "Save"
5. Repeat for all variables

**Via CLI:**

```bash
# Set individual variables
netlify env:set SUPABASE_URL "https://your-project.supabase.co"
netlify env:set STRIPE_SECRET_KEY "sk_live_xxx"

# Or import from .env file
netlify env:import .env.production
```

---

## Step 4: Update External Services

### Supabase

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Update:
   - **Site URL**: `https://yoursite.netlify.app`
   - **Redirect URLs**:
     - `https://yoursite.netlify.app/confirm`
     - `https://yoursite.netlify.app/dashboard`
     - `https://yoursite.netlify.app/api/auth/mastodon/callback`

### Stripe

1. **Webhook Endpoint**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://yoursite.netlify.app/api/stripe/webhook`
   - Events: Select all subscription & payment events
   - Copy webhook signing secret
   - Add to Netlify environment variables as `STRIPE_WEBHOOK_SECRET`

2. **Checkout Success URLs**:
   - These are already dynamic in the code using `SITE_URL`
   - Just ensure `SITE_URL` env var is set correctly

### Mastodon

- Dynamic registration handles this automatically!
- No changes needed

---

## Step 5: Custom Domain (Optional)

### Add Custom Domain

1. In Netlify Dashboard → Domain Settings
2. Click "Add custom domain"
3. Enter your domain (e.g., `broadcast.app`)
4. Follow DNS instructions:

**If using Netlify DNS:**

- Transfer nameservers to Netlify
- Automatic SSL certificate

**If using external DNS:**

- Add CNAME record: `www` → `yoursite.netlify.app`
- Add A record: `@` → Netlify Load Balancer IP
- SSL certificate auto-provisioned

### Update Environment Variables

After adding custom domain:

```bash
SITE_URL=https://yourdomain.com
MASTODON_CALLBACK_URL=https://yourdomain.com/api/auth/mastodon/callback
```

Then update all external services (Supabase, Stripe) with new URLs.

---

## Step 6: Verify Deployment

### Health Checks

Test these URLs:

1. **Homepage**: `https://yoursite.netlify.app/`
   - Should load posting interface

2. **Pricing**: `https://yoursite.netlify.app/pricing`
   - Should show plans

3. **Login**: `https://yoursite.netlify.app/login`
   - Should show login form

4. **API Health**: Check Netlify Function logs
   - Site Settings → Functions → Check for errors

### Test User Flow

1. **Sign up**: Create a test account
2. **Login**: Verify authentication works
3. **Connect Platform**: Try Bluesky (easiest)
4. **Create Post**: Post something
5. **Check Dashboard**: View post in dashboard
6. **Test Upgrade**: Try upgrading to Creator plan
7. **Billing Portal**: Access Stripe customer portal

---

## Step 7: Monitoring & Logs

### Netlify Analytics

- Go to Site Analytics
- View:
  - Page views
  - Unique visitors
  - Top pages
  - Bandwidth usage

### Function Logs

1. Site Settings → Functions
2. Click on a function to see logs
3. Monitor for errors

### Real-time Logs

```bash
# Watch logs in real-time
netlify logs --follow

# Or specific function
netlify functions:logs --follow
```

### Recommended Monitoring Tools

**Error Tracking:**
- [Sentry](https://sentry.io) - Free tier available
- Tracks JavaScript errors
- Server-side error monitoring

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com) - Free
- Checks if site is up every 5 minutes
- Email alerts on downtime

**Analytics:**
- [Plausible](https://plausible.io) - Privacy-friendly
- Or [Fathom](https://usefathom.com)
- Or use built-in Netlify Analytics

---

## Step 8: Performance Optimization

### Enable Netlify Features

1. **Asset Optimization**:
   - Site Settings → Build & Deploy → Post Processing
   - ✅ Bundle CSS
   - ✅ Minify CSS
   - ✅ Minify JS
   - ✅ Compress images

2. **Edge Functions** (if needed):
   - For faster response times
   - Available on Pro plan

### Add Headers for Security

Create `_headers` file in public directory:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/api/*
  Cache-Control: no-cache, no-store, must-revalidate
```

### Performance Tips

- Images already optimized (5MB limit)
- Supabase handles database performance
- Netlify CDN serves static assets globally
- Consider Netlify Analytics for performance insights

---

## Troubleshooting

### Build Fails

**Error: "Build exceeded time limit"**
- Solution: Contact Netlify support or upgrade plan
- Usually not an issue for this app

**Error: "Module not found"**
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Environment variable not found"**
- Check all required env vars are set in Netlify
- Redeploy: `netlify deploy --prod`

### Runtime Errors

**"Failed to connect to Supabase"**
- Verify `SUPABASE_URL` and `SUPABASE_KEY`
- Check Supabase project is active
- Verify redirect URLs are configured

**"Stripe webhook signature invalid"**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check webhook endpoint URL is correct
- Test with Stripe CLI: `stripe trigger payment_intent.succeeded`

**"Platform connection failed"**
- Check API keys are valid
- Verify callback URLs match everywhere
- Test with Postman/curl

### 502 Bad Gateway

Usually means a serverless function crashed:
1. Check function logs in Netlify
2. Look for JavaScript errors
3. Verify all dependencies are in `package.json`
4. Check function execution time (10s limit on free tier)

---

## Continuous Deployment

### Automatic Deploys

Netlify automatically deploys when you push to main:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Netlify automatically builds and deploys
```

### Deploy Previews

Every pull request gets a preview URL:
1. Create a branch: `git checkout -b feature-branch`
2. Push changes: `git push origin feature-branch`
3. Create PR on GitHub
4. Netlify creates preview URL
5. Test before merging

### Branch Deploys

Deploy specific branches:
1. Site Settings → Build & Deploy → Branch deploys
2. Add branch names to deploy
3. Each gets its own URL: `branch--yoursite.netlify.app`

---

## Scaling Considerations

### Free Tier Limits (Netlify)

- ✅ **Bandwidth**: 100 GB/month (plenty for MVP)
- ✅ **Build minutes**: 300/month
- ✅ **Function invocations**: 125K/month
- ✅ **Function runtime**: 10 seconds max
- ✅ **Concurrent builds**: 1

### When to Upgrade

Consider Pro plan ($19/mo) when:
- Traffic > 100 GB/month
- Need > 300 build minutes
- Want faster build times
- Need team features
- Want password protection
- Need A/B testing

### Database Scaling

- Supabase free tier: Good for thousands of users
- Upgrade when needed (starts at $25/mo)

### Stripe Fees

- No change based on hosting
- 2.9% + $0.30 per transaction

---

## Security Checklist

Before going live:

- [ ] All API keys in environment variables (never in code)
- [ ] `.env` in `.gitignore`
- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Supabase RLS policies enabled
- [ ] Stripe webhook signature verification working
- [ ] Rate limiting considered (Supabase handles this)
- [ ] CORS configured (automatic with Nuxt)
- [ ] Security headers added (see _headers file)
- [ ] Sensitive data encrypted in database
- [ ] Authentication working correctly
- [ ] Session management secure

---

## Post-Deployment Tasks

1. **Test Everything**:
   - Sign up flow
   - Platform connections
   - Posting
   - Payments
   - All features

2. **Set Up Monitoring**:
   - Add Sentry for errors
   - Set up UptimeRobot
   - Configure alerts

3. **Marketing**:
   - Add to Product Hunt
   - Share on Bluesky
   - Post to Reddit (r/SideProject)
   - Share on Hacker News

4. **Documentation**:
   - Create user guide
   - Add help center
   - Create video tutorials

5. **Support**:
   - Set up support email
   - Add FAQ page
   - Create Discord community

---

## Useful Commands

```bash
# Check deployment status
netlify status

# Open site in browser
netlify open

# Open site admin in browser
netlify open:admin

# View recent deploys
netlify deploy:list

# Roll back to previous deploy
netlify deploy:rollback

# View environment variables
netlify env:list

# View function logs
netlify functions:logs --follow

# Run functions locally
netlify dev
```

---

## Cost Breakdown (Monthly)

**Free Tier:**

- Netlify: $0
- Supabase: $0 (up to 500MB storage)
- Stripe: 2.9% + $0.30 per transaction only

**Recommended Startup Stack:**

- Netlify Pro: $19/mo (optional)
- Supabase Pro: $25/mo (when you hit limits)
- Total: $0-44/mo to start

**Revenue Threshold to Break Even:**

- At $15/user (Creator plan)
- Need ~3-4 paying customers to cover hosting
- Very achievable! 🚀

---

## Next Steps

1. ✅ Deploy to Netlify
2. ✅ Set up environment variables
3. ✅ Configure external services
4. ✅ Test deployment
5. ⏳ Set up cron jobs (next step!)
6. 🚀 Launch and start marketing!

Your app is now live and ready to make money! 💰
