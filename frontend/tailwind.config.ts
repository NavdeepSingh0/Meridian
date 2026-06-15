import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#64B6AC',
        'primary-hover': '#52A49A',
        'primary-active': '#468E85',
        surface: '#DAFFEF',
        base: '#FCFFFD',
        ink: '#1C2B28',
        'ink-muted': '#4A6260',
        border: '#D4E8E4',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        chip: '6px',
        pill: '9999px',
        mockup: '16px',
      },
      boxShadow: {
        'card-resting': '0 1px 3px rgba(28, 43, 40, 0.06), 0 4px 16px rgba(28, 43, 40, 0.04)',
        'card-elevated': '0 4px 20px rgba(28, 43, 40, 0.10), 0 1px 3px rgba(28, 43, 40, 0.06)',
      },
      transitionDuration: {
        fast: '150ms',
        mid: '200ms',
        reveal: '400ms',
      },
      transitionTimingFunction: {
        reveal: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
