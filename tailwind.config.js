/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        raised: 'rgb(var(--c-raised) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        mint: 'rgb(var(--c-mint) / <alpha-value>)',
        violet: 'rgb(var(--c-violet) / <alpha-value>)',
        amber: 'rgb(var(--c-amber) / <alpha-value>)',
        rose: 'rgb(var(--c-rose) / <alpha-value>)',
        sky: 'rgb(var(--c-sky) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '26px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,.28), 0 8px 24px -12px rgba(0,0,0,.5)',
        glow: '0 0 0 1px rgb(var(--c-mint) / .25), 0 0 34px -8px rgb(var(--c-mint) / .45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(.9)', opacity: '.7' },
          '70%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pop: {
          '0%': { transform: 'scale(.86)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up .35s cubic-bezier(.22,1,.36,1) both',
        'pulse-ring': 'pulseRing 1.6s cubic-bezier(.24,.6,.36,1) infinite',
        shimmer: 'shimmer 1.8s infinite',
        pop: 'pop .3s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
};
