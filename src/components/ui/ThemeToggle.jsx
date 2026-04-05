import { useThemeStore } from '../../stores/themeStore'

const themeConfig = {
  light: {
    icon: 'light_mode',
    color: 'text-amber-500',
    label: 'Light',
    nextLabel: 'Switch to Dark mode',
  },
  dark: {
    icon: 'dark_mode',
    color: 'text-blue-300',
    label: 'Dark',
    nextLabel: 'Switch to Cricket mode',
  },
  cricket: {
    icon: 'sports_cricket',
    color: 'text-green-600',
    label: 'Cricket',
    nextLabel: 'Switch to Light mode',
  },
}

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore()
  const config = themeConfig[theme] || themeConfig.light

  return (
    <button
      onClick={toggleTheme}
      aria-label={config.nextLabel}
      title={config.nextLabel}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-300 ease-out
        hover:scale-110 active:scale-90
        bg-surface-container-high
        hover:bg-surface-container-highest
        group
        ${className}
      `.trim()}
    >
      {/* Render all icons, only the active one is visible */}
      {Object.entries(themeConfig).map(([key, cfg]) => (
        <span
          key={key}
          className={`material-symbols-outlined text-xl absolute transition-all duration-300 ${
            theme === key
              ? `opacity-100 rotate-0 scale-100 ${cfg.color}`
              : 'opacity-0 rotate-90 scale-50'
          }`}
          style={theme === key ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {cfg.icon}
        </span>
      ))}

      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {config.label}
      </span>
    </button>
  )
}
