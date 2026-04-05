import { useThemeStore } from '../../stores/themeStore'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        bg-surface-container-high dark:bg-surface-container
        hover:bg-surface-container-highest
        ${className}
      `.trim()}
    >
      {/* Sun icon */}
      <span
        className={`material-symbols-outlined text-xl absolute transition-all duration-300 ${
          isDark
            ? 'opacity-0 rotate-90 scale-50'
            : 'opacity-100 rotate-0 scale-100 text-amber-500'
        }`}
        style={!isDark ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        light_mode
      </span>

      {/* Moon icon */}
      <span
        className={`material-symbols-outlined text-xl absolute transition-all duration-300 ${
          isDark
            ? 'opacity-100 rotate-0 scale-100 text-blue-300'
            : 'opacity-0 -rotate-90 scale-50'
        }`}
        style={isDark ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        dark_mode
      </span>
    </button>
  )
}
