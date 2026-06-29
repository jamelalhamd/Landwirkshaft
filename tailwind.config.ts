import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', md: '2rem', xl: '3rem' },
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Government identity — institutional blue + agricultural green
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1e5fbf',
          700: '#1a4e9c', // Brand primary
          800: '#163d7a',
          900: '#112d59',
          950: '#0a1d3a',
        },
        secondary: {
          50: '#fdf8f0',
          100: '#f9f0dc',
          200: '#e8d9bc',
          300: '#d8c09b',
          400: '#cbb088',
          500: '#bca475', // mofaex gold — brand accent
          600: '#a0885e',
          700: '#836c49',
          800: '#624f35',
          900: '#3f3222',
          950: '#231b0d',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
          subtle: 'rgb(var(--ink-subtle) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      fontSize: {
        // Accessibility-aware scale
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.2vw, 0.85rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.25vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.375rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.2vw, 2.25rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.8vw, 3rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3.75rem)',
      },
      boxShadow: {
        gov: '0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.10)',
        'gov-md': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        'gov-lg': '0 10px 20px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
      },
      borderRadius: {
        lg: '10px',
        xl: '14px',
        '2xl': '20px',
      },
      animation: {
        'marquee-rtl': 'marquee-rtl 40s linear infinite',
        'marquee-ltr': 'marquee-ltr 40s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out',
      },
      keyframes: {
        'marquee-rtl': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'marquee-ltr': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
