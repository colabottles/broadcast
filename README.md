# 🚀 Broadcast

**The accessible, multi-platform social media publishing tool.**

Post to Twitter/X, Bluesky, Mastodon, and LinkedIn — all in one place. Built with accessibility-first principles and designed for creators, teams, and businesses.

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account
- Stripe account
- Platform API keys

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

<!-- MIT License - see [LICENSE](./LICENSE) file -->

---

## 🙋 Support

- **Documentation**: Read the setup guides
- **Issues**: [GitHub Issues](https://github.com/colabottles/broadcast/issues)

---

## Additional Documentation

- [ACCESSIBILITY.md](./ACCESSIBILITY.md) - Accessibility testing guide
- [DARK_MODE.md](./DARK_MODE.md) - Dark mode implementation
- [PRICING.md](./PRICING.md) - Business model details
- [QUICKSTART.md](./QUICKSTART.md) - Quick installation guide

---

**Ready to broadcast?** 📢
