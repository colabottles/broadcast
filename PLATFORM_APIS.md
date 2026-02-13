# Platform API Integration Guide

This guide will help you set up API access for each social media platform that Broadcast supports.

---

## 🐦 Twitter/X API Setup

### Step 1: Create Twitter Developer Account

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Sign in with your Twitter account
3. Apply for Developer Access:
   - Choose "Hobbyist" or "Professional" (Professional recommended for production)
   - Answer questions about your use case
   - Wait for approval (usually instant to 24 hours)

### Step 2: Create an App

1. Go to [developer.twitter.com/apps](https://developer.twitter.com/en/portal/dashboard)
2. Click "Create App" or "+ Create Project"
3. Fill in app details:
   - **App name**: Broadcast (or your app name)
   - **Description**: Multi-platform social media posting application
   - **Website**: Your website URL
   - **Callback URL**: `http://localhost:3000/api/auth/twitter/callback`
   - For production, add: `https://yourdomain.com/api/auth/twitter/callback`

### Step 3: Get API Credentials

1. In your app settings, go to "Keys and tokens"
2. Copy these values:
   - **API Key** (Client ID)
   - **API Key Secret** (Client Secret)
3. Add to your `.env` file:

```bash
TWITTER_CLIENT_ID=your-api-key
TWITTER_CLIENT_SECRET=your-api-key-secret
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/twitter/callback
```

### Step 4: Set Permissions

1. In app settings, go to "User authentication settings"
2. Click "Set up"
3. Configure:
   - **App permissions**: Read and write
   - **Type of App**: Web App
   - **Callback URI**: `http://localhost:3000/api/auth/twitter/callback`
   - **Website URL**: Your website
4. Save

### Pricing & Limits

- **Free tier**: 1,500 tweets/month (as of 2024)
- **Basic ($100/month)**: 3,000 tweets/month + more features
- **Pro ($5,000/month)**: 300,000 tweets/month
- Check current pricing: [developer.twitter.com/pricing](https://developer.twitter.com/en/products/twitter-api)

---

## 🦋 Bluesky API Setup

### The Easy Way (No OAuth Required!)

Bluesky uses **app passwords** instead of OAuth, making it much simpler:

1. **No developer account needed!**
2. Users authenticate with their own credentials
3. They generate an app password at [bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)

### How It Works

1. User enters their Bluesky handle (e.g., `username.bsky.social`)
2. User creates an app password in their Bluesky settings
3. User enters app password in Broadcast
4. Broadcast stores encrypted credentials

### No Configuration Required!

Bluesky's API is:
- ✅ Free
- ✅ No rate limits for normal use
- ✅ No developer account needed
- ✅ No OAuth setup
- ✅ Works immediately

---

## 🐘 Mastodon API Setup

### Important: Per-Instance Setup

Each Mastodon instance is separate. Users must authenticate with their specific instance (e.g., mastodon.social, fosstodon.org, etc.).

### Option 1: Let Users Handle It (Recommended)

The easiest approach:
1. User enters their Mastodon instance URL
2. Broadcast dynamically registers as an app on that instance
3. User completes OAuth flow
4. No configuration needed from you!

### Option 2: Pre-register (For Popular Instances)

If you want to support specific instances:

1. Go to the instance (e.g., `https://mastodon.social`)
2. Navigate to `Settings → Development → New Application`
3. Fill in:
   - **Application name**: Broadcast
   - **Redirect URI**: `http://localhost:3000/api/auth/mastodon/callback`
   - **Scopes**: `read write follow`
4. Save and copy:
   - Client ID
   - Client Secret

### Dynamic Registration (Recommended)

Mastodon supports automatic app registration via API:

```typescript
// This happens automatically in the code
POST https://{instance}/api/v1/apps
{
  "client_name": "Broadcast",
  "redirect_uris": "http://localhost:3000/api/auth/mastodon/callback",
  "scopes": "read write follow",
  "website": "https://yourdomain.com"
}
```

### Pricing & Limits

- ✅ **Free!** (community-run instances)
- ✅ No rate limits for normal posting
- ✅ Decentralized - no central API to pay for

---

## 💼 LinkedIn API Setup (Coming Soon)

### Step 1: Create LinkedIn App

1. Go to [developers.linkedin.com](https://www.linkedin.com/developers/)
2. Click "Create app"
3. Fill in details:
   - **App name**: Broadcast
   - **Company**: Your company LinkedIn page
   - **Privacy policy URL**: Your privacy policy
   - **App logo**: Upload a logo
4. Click "Create app"

### Step 2: Request API Access

1. In your app, go to "Products" tab
2. Request access to:
   - **Sign In with LinkedIn**
   - **Share on LinkedIn**
3. Wait for approval (can take 1-7 days)

### Step 3: Get Credentials

1. Go to "Auth" tab
2. Copy:
   - Client ID
   - Client Secret
3. Add Redirect URLs:
   - `http://localhost:3000/api/auth/linkedin/callback`
   - Your production URL

### Pricing & Limits

- **Community tier**: Free (limited posts)
- Check current limits: [developers.linkedin.com](https://www.linkedin.com/developers/)

---

## 🧵 Threads API Setup (Coming Soon)

### Current Status

As of early 2024, Threads API is still in development:
- Meta is working on API access
- No public API yet
- Beta program may be available

### When Available

1. You'll likely need:
   - Instagram Professional/Business account
   - Meta Developer account
   - App review process (like Facebook/Instagram)

### Workarounds (Until Official API)

- Direct posting not available yet
- May need to use Instagram Graph API when Threads integrates

---

## 📘 Facebook API Setup (Coming Soon)

### Step 1: Create Facebook App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create new app:
   - Type: Business
   - Use case: Publishing posts
3. Add **Facebook Login** product

### Step 2: Configure Permissions

Request these permissions:
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `publish_to_groups` (if needed)

### Step 3: App Review

Facebook requires app review for publishing permissions:
1. Submit app for review
2. Provide screencast of how you use the API
3. Wait for approval (1-7 days typically)

### Pricing & Limits

- Free for basic usage
- Rate limits apply (varies by permission)

---

## 🔐 Security Best Practices

### Environment Variables

Never commit these to Git:
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### Token Storage

- ✅ Store in Supabase with RLS enabled
- ✅ Encrypt sensitive tokens
- ✅ Use HTTPS in production
- ✅ Implement token refresh

### Production Checklist

- [ ] Use HTTPS for all callbacks
- [ ] Update all callback URLs to production domain
- [ ] Enable rate limiting
- [ ] Monitor API usage
- [ ] Implement error logging (Sentry)
- [ ] Set up API key rotation
- [ ] Review OAuth scopes (request minimum needed)

---

## 📊 Rate Limits & Best Practices

### Twitter/X
- Respect rate limits (varies by tier)
- Implement exponential backoff
- Cache when possible

### Bluesky
- No strict rate limits
- Be reasonable with posting frequency
- ~10 posts/minute is safe

### Mastodon
- Varies by instance
- Most allow ~300 posts/hour
- Check instance-specific limits

### General Best Practices

1. **Queue posts**: Don't send all at once
2. **Retry logic**: Implement exponential backoff
3. **Error handling**: Log failures, notify users
4. **Respect limits**: Stay well below limits
5. **Monitor usage**: Track API calls

---

## 🧪 Testing

### Development Testing

1. **Use test accounts** on each platform
2. **Test failure scenarios**:
   - Invalid tokens
   - Rate limits
   - Network errors
   - Character limits
3. **Verify post formatting** per platform

### Production Checklist

- [ ] All API keys configured
- [ ] OAuth callbacks working
- [ ] Token refresh implemented
- [ ] Error logging active
- [ ] Rate limiting in place
- [ ] User notifications for failures
- [ ] Post history tracking
- [ ] Analytics/monitoring

---

## 🔧 Troubleshooting

### "Invalid credentials" error
- Check API keys in `.env`
- Verify callback URLs match exactly
- Ensure OAuth app is approved/active

### "Rate limit exceeded"
- Implement queuing system
- Add delays between posts
- Cache API responses
- Upgrade API tier if needed

### OAuth redirect issues
- Verify callback URL matches everywhere
- Check for HTTPS in production
- Ensure domain is whitelisted
- Test with exact URLs (no trailing slashes)

### Posts not sending
- Check platform connection is active
- Verify tokens haven't expired
- Check API error responses
- Review platform-specific character limits

---

## 📚 API Documentation

### Official Docs

- **Twitter/X**: [developer.twitter.com/docs](https://developer.twitter.com/en/docs)
- **Bluesky**: [atproto.com/docs](https://atproto.com/docs)
- **Mastodon**: [docs.joinmastodon.org/api](https://docs.joinmastodon.org/api/)
- **LinkedIn**: [learn.microsoft.com/linkedin](https://learn.microsoft.com/en-us/linkedin/)

### Support

- Twitter: [twittercommunity.com](https://twittercommunity.com/)
- Bluesky: [github.com/bluesky-social](https://github.com/bluesky-social)
- Mastodon: [joinmastodon.org/support](https://joinmastodon.org/support)

---

## 🚀 Next Steps

1. ✅ Set up Twitter API (most common)
2. ✅ Set up Bluesky (easiest - no setup!)
3. ✅ Set up Mastodon (dynamic registration)
4. ⏳ Wait for LinkedIn approval
5. ⏳ Monitor Threads API release
6. ⏳ Complete Facebook app review

Once configured, your users can connect their accounts and start posting!
