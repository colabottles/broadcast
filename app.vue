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

          <!-- Desktop nav -->
          <nav class="header-nav" role="navigation" aria-label="Main navigation">
            <template v-if="!user">
              <NuxtLink to="/" class="nav-link">Home</NuxtLink>
              <NuxtLink to="/pricing" class="nav-link">Pricing</NuxtLink>
              <NuxtLink to="/login" class="btn btn-primary">Sign In</NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/" class="nav-link">Dashboard</NuxtLink>
              <NuxtLink to="/create" class="nav-link">Create</NuxtLink>
              <NuxtLink to="/drafts" class="nav-link">Drafts</NuxtLink>
              <NuxtLink to="/platforms" class="nav-link">Platforms</NuxtLink>
              <NuxtLink to="/pricing" class="nav-link">Pricing</NuxtLink>
              <button @click="handleSignOut" class="btn btn-primary">Sign Out</button>
            </template>
            <button @click="toggleTheme" class="theme-toggle"
              :aria-label="`Switch to ${nextTheme} mode`"
              :title="`Switch to ${nextTheme} mode`">
              <span v-if="currentTheme === 'light'" aria-hidden="true">🌙</span>
              <span v-else aria-hidden="true">☀️</span>
              <span class="sr-only">{{ currentTheme === 'light' ? 'Dark' : 'Light' }} mode</span>
            </button>
          </nav>

          <!-- Mobile controls (theme toggle + hamburger) -->
          <div class="mobile-controls">
            <button @click="toggleTheme" class="theme-toggle"
              :aria-label="`Switch to ${nextTheme} mode`">
              <span v-if="currentTheme === 'light'" aria-hidden="true">🌙</span>
              <span v-else aria-hidden="true">☀️</span>
              <span class="sr-only">{{ currentTheme === 'light' ? 'Dark' : 'Light' }} mode</span>
            </button>
            <button class="hamburger"
              :aria-expanded="menuOpen"
              aria-controls="mobile-menu"
              :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen">
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
              <span class="hamburger-bar"></span>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <nav v-if="menuOpen" id="mobile-menu" class="mobile-nav" role="navigation"
          aria-label="Mobile navigation">
          <template v-if="!user">
            <NuxtLink to="/" class="mobile-nav-link" @click="menuOpen = false">Home</NuxtLink>
            <NuxtLink to="/pricing" class="mobile-nav-link" @click="menuOpen = false">Pricing
            </NuxtLink>
            <NuxtLink to="/login" class="mobile-nav-link mobile-nav-cta" @click="menuOpen = false">
              Sign In</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/" class="mobile-nav-link" @click="menuOpen = false">Dashboard</NuxtLink>
            <NuxtLink to="/create" class="mobile-nav-link" @click="menuOpen = false">Create
            </NuxtLink>
            <NuxtLink to="/drafts" class="mobile-nav-link" @click="menuOpen = false">Drafts
            </NuxtLink>
            <NuxtLink to="/platforms" class="mobile-nav-link" @click="menuOpen = false">Platforms
            </NuxtLink>
            <NuxtLink to="/pricing" class="mobile-nav-link" @click="menuOpen = false">Pricing
            </NuxtLink>
            <button
              @click="() => { handleSignOut(); menuOpen = false }"
              class="mobile-nav-link mobile-nav-cta">
              Sign Out
            </button>
          </template>
        </nav>
      </div>
    </header>

    <main id="main-content" class="main-content" role="main">
      <div class="container">
        <NuxtPage />
      </div>
    </main>

    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <p>&copy; 2026 Broadcast. Built with accessibility ♿️ in mind &amp; ❤️ for creators, by a
          creator.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const { theme, setTheme, initTheme, getCurrentTheme } = useTheme()

const currentTheme = computed(() => getCurrentTheme())
const nextTheme = computed(() => currentTheme.value === 'light' ? 'dark' : 'light')
const menuOpen = ref(false)

const toggleTheme = () => {
  setTheme(currentTheme.value === 'light' ? 'dark' : 'light')
}

const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

// Close menu on route change
const route = useRoute()
watch(() => route.path, () => {
  menuOpen.value = false
})

onMounted(() => {
  initTheme()
})

useHead({
  htmlAttrs: { lang: 'en' }
})
</script>

<style>
.container {
  max-width: 960px;
  margin-inline: auto;
  padding-inline: var(--space-xl);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: var(--space-md);
}

.header-brand {
  flex: 1;
  min-width: 0;
  /* prevents flex blowout */
}

.header-brand h1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-brand p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--font-size-sm);
}

/* Desktop nav: visible above 768px */
.header-nav {
  display: none;
  align-items: center;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .header-nav {
    display: flex;
  }
}

/* Mobile controls: hamburger + theme toggle, visible below 768px */
.mobile-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

@media (min-width: 768px) {
  .mobile-controls {
    display: none;
  }
}

/* Hamburger button */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: var(--space-xs);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.hamburger-bar {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
  border-radius: 2px;
  transition: background-color var(--transition-fast);
}

.hamburger:hover .hamburger-bar {
  background-color: var(--color-primary);
}

/* Mobile nav dropdown */
.mobile-nav {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
  padding-block: var(--space-md);
  gap: var(--space-xs);
}

.mobile-nav-link {
  display: block;
  width: 100%;
  padding: var(--space-md) var(--space-sm);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  text-align: left;
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.mobile-nav-link:hover,
.mobile-nav-link:focus-visible {
  background-color: var(--color-surface);
  color: var(--color-primary);
}

.mobile-nav-link.router-link-active {
  color: var(--color-primary);
  font-weight: 600;
}

.mobile-nav-cta {
  margin-top: var(--space-sm);
  color: var(--color-primary);
  font-weight: 700;
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}
</style>