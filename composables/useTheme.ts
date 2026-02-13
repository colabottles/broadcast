export const useTheme = () => {
  const theme = useState<'light' | 'dark' | 'auto'>('theme', () => 'auto')

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme

    if (process.client) {
      const root = document.documentElement

      if (newTheme === 'auto') {
        // Remove the data-theme attribute to let system preference take over
        root.removeAttribute('data-theme')
        localStorage.removeItem('broadcast-theme')
      } else {
        // Set explicit theme
        root.setAttribute('data-theme', newTheme)
        localStorage.setItem('broadcast-theme', newTheme)
      }
    }
  }

  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('broadcast-theme') as 'light' | 'dark' | null
      
      if (savedTheme) {
        setTheme(savedTheme)
      } else {
        // Default to auto (system preference)
        setTheme('auto')
      }
    }
  }

  const getCurrentTheme = (): 'light' | 'dark' => {
    if (process.client) {
      if (theme.value === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return theme.value
    }
    return 'light'
  }

  return {
    theme,
    setTheme,
    initTheme,
    getCurrentTheme
  }
}
