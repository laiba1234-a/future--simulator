/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Segoe UI',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      colors: {
        app: {
          bg: '#e8ecef',
          surface: '#f3f5f7',
          raised: '#dde3e8',
          border: '#b8c5d0',
          muted: '#2a3640',
          text: '#0b1218',
          accent: '#0a5c57',
          'accent-hover': '#084845',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 42, 52, 0.04), 0 8px 24px rgba(28, 42, 52, 0.06)',
        header:
          '0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 24px rgba(10, 92, 87, 0.08)',
        'glow-sm': '0 0 20px rgba(10, 92, 87, 0.14)',
        'glow-md':
          '0 0 32px rgba(10, 92, 87, 0.22), 0 0 16px rgba(56, 189, 248, 0.14)',
        'glow-lg':
          '0 0 48px rgba(13, 148, 136, 0.28), 0 0 24px rgba(99, 102, 241, 0.12)',
        'glow-teal': '0 4px 32px rgba(13, 148, 136, 0.32)',
        'glow-sky': '0 4px 32px rgba(56, 189, 248, 0.28)',
        'glow-violet': '0 4px 32px rgba(139, 92, 246, 0.26)',
        'glow-amber': '0 4px 28px rgba(245, 158, 11, 0.22)',
        'glow-emerald': '0 4px 28px rgba(16, 185, 129, 0.24)',
        'inner-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 8s ease-in-out infinite',
        'fade-up': 'fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-right': 'slide-right 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'gradient-x': 'gradient-x 4s ease infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
        float: 'float-y 5s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 16px rgba(13, 148, 136, 0.25), 0 0 6px rgba(56, 189, 248, 0.12)',
          },
          '50%': {
            boxShadow:
              '0 0 32px rgba(13, 148, 136, 0.4), 0 0 16px rgba(139, 92, 246, 0.18)',
          },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-shift': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.85' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
