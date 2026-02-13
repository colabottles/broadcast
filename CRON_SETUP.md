# Cron Jobs Setup Guide

Complete guide to setting up scheduled tasks for Broadcast.

---

## What Needs Cron Jobs?

Broadcast needs a cron job to:
1. **Process scheduled posts** - Check every minute for posts that are due
2. **Sync analytics** (optional) - Pull stats from platforms
3. **Send reminder emails** (optional) - Trial ending, payment failed, etc.

---

## Option 1: EasyCron (Recommended - Free)

Simplest option for MVP. Free tier handles everything you need.

### Setup

1. Go to [easycron.com](https://www.easycron.com)
2. Sign up for free account
3. Create new cron job:
   - **URL**: `https://yoursite.netlify.app/api/cron/process-scheduled-posts`
   - **Cron Expression**: `* * * * *` (every minute)
   - **Name**: "Process Scheduled Posts"
   - **HTTP Method**: POST
   - **Custom Headers**: 
     ```
     x-cron-secret: your-secret-from-env
     ```

4. Test it:
   - Click "Execute Now"
   - Check response: Should return `{"processed": 0}`
   - Check Netlify function logs

### Free Tier Limits
- ✅ Unlimited cron jobs
- ✅ 1-minute intervals
- ✅ 100 executions/day (more than enough)
- ✅ Email notifications on failures

### Cost
- **Free**: Up to 100 executions/day
- **Pro ($3.99/mo)**: Unlimited executions
- You won't need Pro unless you have thousands of scheduled posts

---

## Option 2: Cron-Job.org (Free Alternative)

Another simple free option.

### Setup

1. Go to [cron-job.org](https://cron-job.org)
2. Sign up for free
3. Create new cron job:
   - **Title**: "Process Scheduled Posts"
   - **URL**: `https://yoursite.netlify.app/api/cron/process-scheduled-posts`
   - **Schedule**: Every 1 minute
   - **Request Method**: POST
   - **Add Header**: `x-cron-secret: your-secret`

### Free Tier
- ✅ Unlimited jobs
- ✅ 1-minute minimum interval
- ✅ Basic monitoring
- ✅ Email alerts

---

## Option 3: GitHub Actions (Free for Public Repos)

Use GitHub Actions as a cron service.

### Setup

Create `.github/workflows/cron.yml`:

```yaml
name: Process Scheduled Posts

on:
  schedule:
    # Runs every minute
    - cron: '* * * * *'
  workflow_dispatch: # Allows manual triggering

jobs:
  process-posts:
    runs-on: ubuntu-latest
    
    steps:
      - name: Process scheduled posts
        run: |
          curl -X POST \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            https://yoursite.netlify.app/api/cron/process-scheduled-posts
```

### Add Secret

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CRON_SECRET`
4. Value: Your cron secret from `.env`
5. Save

### Pros & Cons

**Pros:**
- ✅ Completely free
- ✅ Reliable (GitHub infrastructure)
- ✅ Version controlled
- ✅ Easy to modify

**Cons:**
- ❌ Public repos only for free
- ❌ More complex setup
- ❌ Harder to monitor

---

## Option 4: Netlify Scheduled Functions (Pro Plan Only)

If you upgrade to Netlify Pro ($19/mo), you can use built-in cron.

### Setup

1. Create `netlify/functions/scheduled-process-posts.ts`:

```typescript
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // This function runs on schedule
  // No need for cron secret since it's internal
  
  const response = await fetch(`${process.env.SITE_URL}/api/cron/process-scheduled-posts`, {
    method: 'POST',
    headers: {
      'x-cron-secret': process.env.CRON_SECRET || ''
    }
  })
  
  const data = await response.json()
  
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}

export { handler }
```

2. Update `netlify.toml`:

```toml
[functions."scheduled-process-posts"]
  schedule = "* * * * *"  # Every minute
```

### Pros & Cons

**Pros:**
- ✅ Native to Netlify
- ✅ No external dependencies
- ✅ Better security (internal)

**Cons:**
- ❌ Requires Pro plan ($19/mo)
- ❌ More expensive for just cron

---

## Option 5: Vercel Cron (If You Switch to Vercel)

If you deploy to Vercel instead, they have built-in cron.

### Setup

Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/process-scheduled-posts",
    "schedule": "* * * * *"
  }]
}
```

**Note**: Requires Pro plan ($20/mo)

---

## Recommended Setup for MVP

### Start with EasyCron (Free)

1. **Deploy to Netlify** (free)
2. **Set up EasyCron** (free)
3. **Total cost**: $0/month
4. **Works perfectly** for MVP and first customers

### When to Upgrade

Upgrade when:
- You hit 100 scheduled posts/day
- You want better monitoring
- You prefer everything in one place (Netlify Pro)
- You're making $50+/mo (can afford it)

---

## Security Best Practices

### Cron Secret

Generate a strong secret:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use this online: https://generate-secret.vercel.app
```

Add to environment variables:
```bash
CRON_SECRET=your-generated-secret-here
```

### Verify in Your API

The endpoint already checks:
```typescript
const cronSecret = getHeader(event, 'x-cron-secret')
if (cronSecret !== config.cronSecret) {
  throw createError({
    statusCode: 401,
    message: 'Unauthorized'
  })
}
```

### IP Whitelisting (Optional)

For extra security, whitelist the cron service IP:

**EasyCron IPs:**
- 34.215.98.196
- 52.42.153.219

Add to Netlify (Pro plan only):
```toml
[functions."api/cron/*"]
  allowed_sources = ["34.215.98.196", "52.42.153.219"]
```

---

## Monitoring Cron Jobs

### Check Execution

**EasyCron:**
- Dashboard shows execution history
- Email alerts on failures
- Logs show response from your API

**GitHub Actions:**
- Go to Actions tab
- View workflow runs
- Check logs for each run

### Monitor Your API

**Netlify Function Logs:**
```bash
# Watch logs in real-time
netlify functions:logs --follow

# Or check in dashboard
# Site Settings → Functions → process-scheduled-posts
```

**Add Logging:**
```typescript
// In your cron handler
console.log('Cron started:', new Date().toISOString())
console.log('Processed posts:', processed)
console.log('Failed posts:', failed)
```

### Set Up Alerts

**Email Alerts:**
- EasyCron sends email on job failure
- Configure in EasyCron dashboard

**Slack Alerts (Optional):**
Add webhook in cron endpoint:
```typescript
if (failed > 0) {
  await fetch('https://hooks.slack.com/services/YOUR/WEBHOOK/URL', {
    method: 'POST',
    body: JSON.stringify({
      text: `⚠️ ${failed} scheduled posts failed to send`
    })
  })
}
```

---

## Testing Cron Jobs

### Test Manually

```bash
# Test your cron endpoint
curl -X POST \
  -H "x-cron-secret: your-secret" \
  https://yoursite.netlify.app/api/cron/process-scheduled-posts

# Should return:
# {"processed": 0, "message": "No posts to process"}
```

### Create Test Post

1. Log into your app
2. Create a post
3. Schedule it for 2 minutes from now
4. Wait 2 minutes
5. Check if it posted
6. Check cron logs
7. Check post status in database

### Verify in Database

```sql
-- Check scheduled posts
SELECT * FROM posts 
WHERE status = 'scheduled' 
AND scheduled_for <= NOW();

-- Check processed posts
SELECT * FROM posts 
WHERE status = 'published' 
AND scheduled_for IS NOT NULL;

-- Check post results
SELECT * FROM post_results 
WHERE post_id = 'your-post-id';
```

---

## Troubleshooting

### Cron Job Not Running

**Check EasyCron:**
1. Is job enabled?
2. Check execution history
3. Look for error messages
4. Verify URL is correct

**Check Your API:**
```bash
# Test endpoint manually
curl -X POST \
  -H "x-cron-secret: your-secret" \
  https://yoursite.netlify.app/api/cron/process-scheduled-posts

# Check response
```

### Posts Not Being Processed

**Check Database:**
```sql
-- Are there scheduled posts?
SELECT COUNT(*) FROM posts WHERE status = 'scheduled';

-- Are they due?
SELECT * FROM posts 
WHERE status = 'scheduled' 
AND scheduled_for <= NOW();
```

**Check Logs:**
- Netlify function logs
- Look for errors
- Verify cron secret matches

**Check Connections:**
- Do users have active platform connections?
- Are tokens still valid?

### High Failure Rate

**Common Issues:**
1. **Expired tokens** - Implement token refresh
2. **Rate limits** - Add delays between posts
3. **Invalid credentials** - User needs to reconnect
4. **API downtime** - Platform temporarily unavailable

**Solution:**
Add retry logic with exponential backoff:
```typescript
async function postWithRetry(platform, content, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await postToPlatform(platform, content)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
}
```

---

## Scaling Considerations

### Current Setup (MVP)
- ✅ Cron runs every minute
- ✅ Processes 50 posts per run
- ✅ **Capacity**: 50 x 60 = 3,000 posts/hour
- ✅ **Daily**: 72,000 scheduled posts
- ✅ **More than enough** for MVP!

### When You Grow

If you get to thousands of scheduled posts per hour:

1. **Increase batch size**:
```typescript
.limit(100) // Instead of 50
```

2. **Multiple workers**:
   - Run cron every 30 seconds
   - Process different batches

3. **Queue system**:
   - Use Redis or RabbitMQ
   - Better for high-scale

4. **Dedicated server**:
   - Move to AWS Lambda
   - Or dedicated Node.js server

**But don't worry about this yet!** Current setup handles thousands of users easily.

---

## Optional: Additional Cron Jobs

### Analytics Sync (Every Hour)

```typescript
// netlify/functions/sync-analytics.ts
// Runs every hour to pull stats from platforms

export default defineEventHandler(async (event) => {
  // Verify cron secret
  // Get recent posts
  // Fetch stats from each platform
  // Update post_analytics table
})
```

**EasyCron Setup:**
- Schedule: `0 * * * *` (every hour)
- URL: `/api/cron/sync-analytics`

### Email Reminders (Daily)

```typescript
// netlify/functions/send-reminders.ts
// Runs daily to send emails

export default defineEventHandler(async (event) => {
  // Find trials ending soon
  // Find failed payments
  // Send emails via SendGrid/Mailgun
})
```

**EasyCron Setup:**
- Schedule: `0 9 * * *` (9 AM daily)
- URL: `/api/cron/send-reminders`

---

## Cron Expression Reference

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sunday = 0)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**
- `* * * * *` - Every minute
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Every day at midnight
- `0 9 * * 1` - Every Monday at 9 AM

---

## Final Checklist

Before going live:

- [ ] Cron secret generated and set in environment variables
- [ ] Cron service configured (EasyCron recommended)
- [ ] Cron job tested manually
- [ ] Test scheduled post created and processed
- [ ] Monitoring/alerts set up
- [ ] Error logging working
- [ ] Rate limiting considered
- [ ] Retry logic implemented
- [ ] Documentation updated

---

## Cost Summary

**Recommended Free Setup:**
- Netlify: $0
- EasyCron: $0
- Total: $0/month

**Handles:**
- 72,000 scheduled posts/day
- Unlimited users (within Netlify limits)
- Perfect for MVP and first revenue

**When to Upgrade:**
- Netlify Pro: When you hit bandwidth/build limits
- EasyCron Pro: When you hit 100 executions/day limit
- Probably at $500-1000/mo revenue

---

## You're All Set! 🎉

Your cron jobs are configured and ready. Scheduled posts will now:
1. ✅ Be stored in database
2. ✅ Processed automatically when due
3. ✅ Posted to all selected platforms
4. ✅ Results tracked in database

**Everything is production-ready!** 🚀
