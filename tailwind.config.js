const palette = ['bg', 'surface', 'raised', 'line', 'ink', 'muted', 'faint', 'mint', 'violet', 'amber', 'rose', 'sky'];
const accents = new Set(['mint', 'violet', 'amber', 'rose', 'sky']);
const solid = Object.fromEntries(palette.map((name) => [name, () => `rgb(var(--c-${name}))`]));
const hardShadow = '4px 4px 0 0 rgb(var(--c-line))';

/** @type {import('tailwindcss').Config} */
export default {
  future: { hoverOnlyWhenSupported: true },
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
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
      },
      // Legacy translucent accent panels become opaque paper, keeping their colored text/borders.
      backgroundColor: Object.fromEntries(palette.map((name) => [name, ({ opacityValue }) =>
        `rgb(var(--c-${accents.has(name) && Number(opacityValue) < 1 ? 'surface' : name}))`,
      ])),
      borderColor: solid,
      ringColor: solid,
      borderWidth: { DEFAULT: '2px' },
      spacing: {
        ...Object.fromEntries(Array.from({ length: 97 }, (_, n) => [n, `${n * 4}px`])),
        // Keep existing class names; snap legacy half steps upward to the four-pixel grid.
        '0.5': '4px', '1.5': '8px', '2.5': '12px', '3.5': '16px',
      },
      fontSize: { xs: ['14px', '20px'], sm: ['16px', '24px'] },
      borderRadius: {
        DEFAULT: '0', sm: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0', full: '0',
      },
      boxShadow: {
        DEFAULT: hardShadow, sm: hardShadow, md: hardShadow, lg: hardShadow,
        xl: hardShadow, '2xl': '8px 8px 0 0 rgb(var(--c-line))',
        inner: 'inset 4px 4px 0 0 rgb(var(--c-line))',
        soft: hardShadow,
        glow: '4px 4px 0 0 rgb(var(--c-mint))',
      },
      transitionDuration: Object.fromEntries(['DEFAULT', '0', '75', '100', '150', '200', '300', '500', '700', '1000'].map((key) => [key, '0ms'])),
      transitionTimingFunction: { DEFAULT: 'steps(1, end)', linear: 'steps(1, end)', in: 'steps(1, end)', out: 'steps(1, end)', 'in-out': 'steps(1, end)' },
      keyframes: {
        'fade-up': {
          from: { transform: 'translateY(8px)' }, to: { transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { borderColor: 'rgb(var(--c-line))' },
          '50%': { borderColor: 'rgb(var(--c-rose))' },
        },
        shimmer: {
          from: { visibility: 'visible' }, to: { visibility: 'hidden' },
        },
        pop: {
          from: { transform: 'translateY(4px)' }, to: { transform: 'translateY(0)' },
        },
        /* Sai thì lắc — phản hồi kiểu Duolingo: biết ngay mà không cần đọc chữ */
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%, 75%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(4px)' },
        },
        /* Đúng thì đóng dấu: nảy quá đà một nhịp rồi mới ổn định */
        stamp: {
          from: { transform: 'translateY(-8px)' }, to: { transform: 'translateY(0)' },
        },
        /* Dải phản hồi trượt lên từ đáy màn hình */
        'slide-up': {
          '0%': { transform: 'translateY(16px)' },
          '100%': { transform: 'translateY(0)' },
        },
        /* Mảnh giấy vụn ăn mừng */
        confetti: {
          '0%': { transform: 'translateY(0)', visibility: 'visible' },
          '100%': { transform: 'translateY(320px)', visibility: 'hidden' },
        },
      },
      animation: {
        'fade-up': 'fade-up .16s steps(2, end) both',
        'pulse-ring': 'pulseRing 1.6s steps(1, end) infinite',
        shimmer: 'shimmer 1.8s steps(1, end) infinite',
        pop: 'pop .12s steps(1, end) both',
        shake: 'shake .32s steps(1, end) both',
        stamp: 'stamp .16s steps(2, end) both',
        'slide-up': 'slide-up .16s steps(4, end) both',
        confetti: 'confetti 1.5s steps(20, end) forwards',
        spin: 'spin 1s steps(4, end) infinite',
        pulse: 'shimmer 1.8s steps(1, end) infinite',
      },
    },
  },
  plugins: [],
};
