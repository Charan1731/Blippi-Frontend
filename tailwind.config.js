/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"ABC Social"', '-apple-system', 'BlinkMacSystemFont', '"avenir next"', 'avenir', '"segoe ui"', '"helvetica neue"', 'helvetica', 'Ubuntu', 'roboto', 'noto', 'arial', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'grid-gray-100': 'linear-gradient(to right, #f3f4f6 1px, transparent 1px), linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)',
        'grid-gray-900': 'linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '4rem 4rem',
      },
      keyframes: {
        'modal-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.25)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'modal-in': 'modal-in 0.4s ease-out forwards',
        'bounce-in': 'bounce-in 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards'
      }
    },
  },
  plugins: [
  ],
};