/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 1.5s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'ledBlink': 'ledBlink 2s ease-in-out infinite',
        'cloudMove': 'cloudMove 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { 'box-shadow': '0 0 20px rgb(16 185 129 / 0.2)' },
          to: { 'box-shadow': '0 0 40px rgb(16 185 129 / 0.5), 0 0 80px rgb(16 185 129 / 0.2)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        ledBlink: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        cloudMove: {
          '0%': { transform: 'translateX(-220px)' },
          '50%': { transform: 'translateX(20px)' },
          '100%': { transform: 'translateX(-220px)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M60 0v60M0 60h60' stroke='%23e2e8f0' stroke-width='0.5'/%3E%3C/svg%3E\")",
        'grid-pattern-dark': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M60 0v60M0 60h60' stroke='%231e293b' stroke-width='0.5'/%3E%3C/svg%3E\")",
        'dot-pattern': "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
        'dot-pattern-dark': "radial-gradient(circle, #1e293b 1px, transparent 1px)",
        'hero-gradient': 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #042f2e 100%)',
        'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
      },
      backgroundSize: {
        'grid-60': '60px 60px',
        'dot-20': '20px 20px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgb(16 185 129 / 0.3)',
        'glow': '0 0 30px rgb(16 185 129 / 0.3)',
        'glow-lg': '0 0 60px rgb(16 185 129 / 0.4)',
        'card': '0 1px 3px rgb(0 0 0 / 0.05), 0 4px 12px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 20px rgb(0 0 0 / 0.1), 0 8px 40px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
}
