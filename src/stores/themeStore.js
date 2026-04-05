import { create } from 'zustand'

/**
 * Theme store — manages light / dark / cricket themes
 * with localStorage persistence.
 *
 * Usage:
 *   const { theme, toggleTheme, setTheme } = useThemeStore()
 *
 * The store applies `data-theme` on <html> automatically.
 * System preference is used as fallback when no user choice exists.
 */

const STORAGE_KEY = 'ms-theme'
const THEMES = ['light', 'dark', 'cricket']

const THEME_META_COLORS = {
  light: '#f9f9f7',
  dark: '#0e1110',
  cricket: '#faf8f2',
}

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (THEMES.includes(saved)) return saved

  return 'cricket'
}

function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)

  // Update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', THEME_META_COLORS[theme] || '#f9f9f7')
  }
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  /** All available themes */
  themes: THEMES,

  /** Initialize theme on app mount */
  init() {
    const theme = get().theme
    applyTheme(theme)

    // Listen for OS preference changes (only when no manual override)
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const newTheme = e.matches ? 'dark' : 'light'
        applyTheme(newTheme)
        set({ theme: newTheme })
      }
    })
  },

  /** Cycle to next theme: light → dark → cricket → light */
  toggleTheme() {
    const current = get().theme
    const idx = THEMES.indexOf(current)
    const next = THEMES[(idx + 1) % THEMES.length]
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },

  /** Set a specific theme by name */
  setTheme(theme) {
    if (!THEMES.includes(theme)) return
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
}))
