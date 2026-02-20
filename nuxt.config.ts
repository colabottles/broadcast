export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase'],

  nitro: {
    preset: 'netlify'
  },

  ssr: true, // Disable SSR - use client-side rendering
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/pricing', '/signup', '/forgot-password'],
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
    },
    baseURL: '/',
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    // Disable type checking in dev (Windows compatibility)
    typeCheck: false
  },
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    mastodonCallbackUrl: process.env.MASTODON_CALLBACK_URL,
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID,
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    linkedinCallbackUrl: process.env.LINKEDIN_CALLBACK_URL,
    cronSecret: process.env.CRON_SECRET,
    public: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
      },
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || (process.dev ? 'http://localhost:3000' : 'https://brdcst.netlify.app')
    }
  }
})