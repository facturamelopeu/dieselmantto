/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0f1c',
          soft: '#0e1525',
        },
        surface: {
          DEFAULT: '#111a2e',
          2: '#162038',
          3: '#1c2945',
        },
        border: {
          DEFAULT: '#22304f',
          soft: '#1a2540',
        },
        ink: {
          DEFAULT: '#e8edf7',
          dim: '#9aa8c4',
          faint: '#62718f',
        },
        brand: {
          DEFAULT: '#2f6bff',
          2: '#1d4ed8',
        },
        accent: '#ff7a18',
        ok: '#22c98a',
        warn: '#f5b53d',
        danger: '#ff5169',
        info: '#3b9dff',
        violet: '#9d7bff',
      },
      boxShadow: {
        card: '0 10px 40px -12px rgba(0,0,0,.55)',
        pop: '0 24px 60px -18px rgba(0,0,0,.7)',
        glow: '0 10px 26px -10px rgba(47,107,255,.5)',
      },
      borderRadius: {
        xl2: '14px',
      },
      keyframes: {
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pop: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(.98)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        slideup: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fade: 'fade .2s ease',
        pop: 'pop .24s cubic-bezier(.2,.9,.3,1)',
        slideup: 'slideup .3s ease',
      },
    },
  },
  plugins: [],
};
