/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0b0c10',
        surface: '#13151c',
        'surface-2': '#1a1d27',
        'surface-3': '#232736',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-light': 'rgba(255, 255, 255, 0.14)',
        coral: {
          50: '#fff5f2',
          100: '#ffe8e1',
          200: '#ffd4c7',
          300: '#ffb5a1',
          400: '#ff8566',
          500: '#ff5722',
          600: '#f03e0a',
          700: '#c82e05',
          800: '#a32709',
          900: '#85240e',
        },
        accent: '#ff5722',
        'accent-hover': '#f03e0a',
        'accent-dim': 'rgba(255, 87, 34, 0.12)',
        'accent-glow': 'rgba(255, 87, 34, 0.25)',
        gold: '#f59e0b',
        'gold-dim': 'rgba(245, 158, 11, 0.15)',
        silver: '#94a3b8',
        'silver-dim': 'rgba(148, 163, 184, 0.15)',
        bronze: '#d97706',
        'bronze-dim': 'rgba(217, 119, 6, 0.15)',
        muted: '#94a3b8',
        'muted-dark': '#64748b',
        ink: '#0b0c10',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-coral': '0 0 25px rgba(255, 87, 34, 0.25)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.25)',
        'card-subtle': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

