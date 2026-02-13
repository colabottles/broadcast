<template>
  <div id="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <header class="site-header" role="banner">
      <div class="container">
        <div class="header-content">
          <div class="header-brand">
            <h1>Broadcast</h1>
            <p>Multi-platform social media posting</p>
          </div>
          <nav class="header-nav" role="navigation" aria-label="Main navigation">
            <NuxtLink to="/" class="nav-link">Home</NuxtLink>
            <NuxtLink to="/pricing" class="nav-link">Pricing</NuxtLink>

            <!-- User menu for logged in users -->
            <NuxtLink v-if="user" to="/dashboard" class="nav-link">Dashboard</NuxtLink>
            <NuxtLink v-else to="/auth" class="btn btn-primary">Sign in</NuxtLink>

            <button
              @click="toggleTheme"
              class="theme-toggle"
              :aria-label="`Switch to ${nextTheme} mode`"
              :title="`Switch to ${nextTheme} mode`"
            >
              <span v-if="currentTheme === 'light'" aria-hidden="true">🌙</span>
              <span v-else aria-hidden="true">☀️</span>
              <span class="sr-only">{{ currentTheme === 'light' ? 'Dark' : 'Light' }} mode</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

    <main id="main-content" class="main-content" role="main">
      <div class="container">
        <NuxtPage />
      </div>
    </main>

    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <p>&copy; 2026 Broadcast. Built with accessibility ♿️ in mind &amp; ❤️ for creators, by a creator.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { theme, setTheme, initTheme, getCurrentTheme } = useTheme()

const currentTheme = computed(() => getCurrentTheme())

const nextTheme = computed(() => {
  return currentTheme.value === 'light' ? 'dark' : 'light'
})

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
}

onMounted(() => {
  initTheme()
})

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>
