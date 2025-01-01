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
    },
  },
  plugins: [
  ],
};