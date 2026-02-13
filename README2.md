# 🚀 Broadcast

**The accessible, multi-platform social media publishing tool.**

Post to Twitter/X, Bluesky, Mastodon, LinkedIn, Threads, and Facebook — all in one place. Built with accessibility-first principles and designed for creators, teams, and businesses.

---

## ✨ Features

### Core Features
- ✅ **Multi-Platform Posting** - Post to 6+ platforms simultaneously
- ✅ **Image Uploads** - Up to 4 images per post with mandatory alt text
- ✅ **Post Scheduling** - Schedule posts for optimal timing (Creator+ plans)
- ✅ **Analytics Dashboard** - Track performance across all platforms
- ✅ **Team Collaboration** - Work together (Professional+ plans)

### Accessibility
- ✅ **WCAG 2.2 Level AA Compliant**
- ✅ **Mandatory Alt Text** - Posts won't send without image descriptions
- ✅ **Semantic HTML5** - Proper landmarks throughout
- ✅ **Keyboard Navigation** - Fully navigable without mouse
- ✅ **Screen Reader Optimized** - Comprehensive ARIA labels

### Platform Support
- ✅ **Twitter/X** - OAuth 2.0 integration
- ✅ **Bluesky** - App password authentication
- ✅ **Mastodon** - Dynamic per-instance OAuth
- ⏳ **LinkedIn** - Coming soon
- ⏳ **Threads** - Waiting for official API
- ⏳ **Facebook** - Coming soon

### Subscription Plans
- **Starter (Free)** - 2 platforms, 25 posts/month
- **Creator ($15/mo)** - 5 platforms, unlimited posts, scheduling
- **Professional ($49/mo)** - All platforms, teams, advanced analytics
- **Enterprise (Custom)** - White-label, API access, SLA

---

## 🛠 Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TypeScript
- **Styling**: Vanilla CSS (no frameworks)
- **Authentication**: Supabase Auth (email, Google OAuth)
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (images)
- **Payments**: Stripe (subscriptions)
- **Hosting**: Netlify
- **Cron Jobs**: EasyCron (scheduled posts)

---

## 📦 Project Structure

```
broadcast/
├── app.vue                   # Root layout with navigation
├── assets/css/main.css      # Vanilla CSS with dark mode
├── pages/
│   ├── index.vue            # Posting interface
│   ├── login.vue            # Authentication
│   ├── signup.vue           # Registration
│   ├── dashboard.vue        # User dashboard
│   ├── platforms.vue        # Platform connections
│   ├── pricing.vue          # Subscription plans
│   ├── billing.vue          # Billing management
│   └── analytics.vue        # Analytics dashboard
├── composables/
│   ├── usePlatforms.ts      # Platform utilities
│   └── useTheme.ts          # Dark mode logic
├── server/api/
│   ├── post.ts              # Main posting endpoint
│   ├── upload-image.post.ts # Image upload
│   ├── auth/                # Platform OAuth
│   ├── stripe/              # Payment processing
│   └── cron/                # Scheduled tasks
└── public/                  # Static assets
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account
- Platform API keys

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/broadcast.git
cd broadcast

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your credentials to .env
# See setup guides below for details

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📚 Setup Guides

Complete step-by-step guides for every service:

1. **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Database & authentication
2. **[STRIPE_SETUP.md](./STRIPE_SETUP.md)** - Payment processing
3. **[PLATFORM_APIS.md](./PLATFORM_APIS.md)** - Social platform APIs
4. **[NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)** - Deploy to production
5. **[CRON_SETUP.md](./CRON_SETUP.md)** - Scheduled posts

### Quick Setup Order

1. **Supabase** (~15 min)
   - Create project
   - Run SQL schema
   - Copy credentials

2. **Stripe** (~20 min)
   - Create products
   - Set up webhook
   - Copy API keys

3. **Platform APIs** (~30 min)
   - Twitter developer account
   - Bluesky (no setup needed!)
   - Mastodon (dynamic)

4. **Deploy to Netlify** (~10 min)
   - Connect GitHub
   - Set environment variables
   - Deploy

5. **Cron Jobs** (~5 min)
   - Sign up for EasyCron
   - Configure webhook
   - Test

**Total setup time: ~90 minutes** ⏱️

---

## 🌐 Deployment

### Deploy to Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
netlify deploy --prod
```

See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for complete instructions.

### Alternative: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

---

## 💰 Cost Breakdown

### Free Tier (Perfect for MVP)
- Netlify: $0
- Supabase: $0 (500MB storage, 50K MAU)
- EasyCron: $0 (100 executions/day)
- Stripe: 2.9% + $0.30 per transaction only
- **Total: $0/month** + transaction fees

### When to Upgrade
- Netlify Pro: $19/mo (at ~$500/mo revenue)
- Supabase Pro: $25/mo (when you hit limits)
- **Break-even**: ~3-4 paying customers

---

## 🎯 Revenue Projections

**Conservative Estimates:**

| Month | Free Users | Paid Users | MRR | Annual |
|-------|-----------|-----------|-----|---------|
| 1 | 100 | 10 | $150 | $1,800 |
| 3 | 300 | 30 | $450 | $5,400 |
| 6 | 500 | 75 | $1,125 | $13,500 |
| 12 | 2,000 | 250 | $3,750 | $45,000 |

**Assumptions:**
- 5% free-to-paid conversion
- Average $15/user (mostly Creator plan)
- 3% monthly churn

---

## 🧪 Testing

### Run Tests Locally

```bash
# Start dev server
npm run dev

# Test features:
# 1. Sign up → Create account
# 2. Connect platform → Try Bluesky (easiest)
# 3. Create post → Add image with alt text
# 4. Schedule post → Set for 5 mins from now
# 5. Upgrade plan → Test Stripe checkout
```

### Test Cards (Stripe)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002

---

## 📊 Monitoring

### Recommended Tools
- **Errors**: [Sentry](https://sentry.io) (free tier)
- **Uptime**: [UptimeRobot](https://uptimerobot.com) (free)
- **Analytics**: Built-in Netlify Analytics

### Check Health
- Homepage: `https://yoursite.com`
- API: Check Netlify function logs
- Database: Supabase dashboard
- Payments: Stripe dashboard

---

## 🔒 Security

- ✅ All API keys in environment variables
- ✅ Supabase Row Level Security (RLS)
- ✅ Stripe webhook signature verification
- ✅ HTTPS enforced (via Netlify)
- ✅ CORS configured automatically
- ✅ Rate limiting (via Supabase)
- ✅ Input validation on all forms

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

---

## 🙋 Support

- **Documentation**: Read the setup guides
- **Issues**: [GitHub Issues](https://github.com/yourusername/broadcast/issues)
- **Email**: support@broadcast.app

---

## 🎉 You're Ready to Launch!

Everything is set up and ready. Your next steps:

1. ✅ Complete setup (follow guides above)
2. ✅ Deploy to Netlify
3. ✅ Set up cron jobs
4. ✅ Test everything thoroughly
5. 🚀 Launch and start marketing!

**Built with ❤️ for creators, by creators.**

---

## Additional Documentation

- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility testing guide
- [DARK_MODE.md](./DARK_MODE.md) - Dark mode implementation
- [PRICING.md](./PRICING.md) - Business model details
- [QUICKSTART.md](./QUICKSTART.md) - Quick installation guide

---

**Ready to broadcast?** 📢
