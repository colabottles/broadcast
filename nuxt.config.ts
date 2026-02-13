export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  nitro: {
    preset: 'netlify',
  },

  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/pricing', '/'],
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en'
      },
      title: 'Broadcast - Multi-Platform Social Media',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Broadcast - Post to multiple social media platforms simultaneously' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // Enable type checking
  typescript: {
    strict: true,
    typeCheck: true
  },

  runtimeConfig: {
    // Private keys (server-only)
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    twitterClientId: process.env.TWITTER_CLIENT_ID,
    twitterClientSecret: process.env.TWITTER_CLIENT_SECRET,
    twitterCallbackUrl: process.env.TWITTER_CALLBACK_URL,
    mastodonCallbackUrl: process.env.MASTODON_CALLBACK_URL,
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    linkedinCallbackUrl: process.env.LINKEDIN_CALLBACK_URL,
    cronSecret: process.env.CRON_SECRET,

    // Public keys (exposed to client)
    public: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
      },
      siteUrl: process.env.SITE_URL || 'http://localhost:3000'
    }
  }
})
