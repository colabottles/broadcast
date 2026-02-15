# Platform API Integration Guide

This guide will help you set up API access for each social media platform that Broadcast supports.

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

### No Configuration Required

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

- **Bluesky**: [atproto.com/docs](https://atproto.com/docs)
- **Mastodon**: [docs.joinmastodon.org/api](https://docs.joinmastodon.org/api/)
- **LinkedIn**: [learn.microsoft.com/linkedin](https://learn.microsoft.com/en-us/linkedin/)

### Support

- Bluesky: [github.com/bluesky-social](https://github.com/bluesky-social)
- Mastodon: [joinmastodon.org/support](https://joinmastodon.org/support)

---

## 🚀 Next Steps

1. ✅ Set up Bluesky (easiest - no setup!)
2. ✅ Set up Mastodon (dynamic registration)
3. ⏳ Wait for LinkedIn approval

Once configured, your users can connect their accounts and start posting!
