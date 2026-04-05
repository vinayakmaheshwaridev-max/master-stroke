import { create } from 'zustand'

/**
 * Theme store — manages light/dark mode with localStorage persistence.
 *
 * Usage:
 *   const { theme, toggleTheme } = useThemeStore()
 *
 * The store applies `data-theme` on <html> automatically.
 * System preference is used as fallback when no user choice exists.
 */

const STORAGE_KEY = 'ms-theme'

function getInitialTheme() {
  // Check localStorage first
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') return saved

  // Fallback to OS preference
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function applyTheme(theme) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)

  // Also update meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0e1110' : '#f9f9f7')
  }
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

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

  /** Toggle between light and dark */
  toggleTheme() {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
    set({ theme: next })
  },

  /** Set a specific theme */
  setTheme(theme) {
    if (theme !== 'dark' && theme !== 'light') return
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
}))
