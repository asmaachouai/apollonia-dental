/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        primary: { DEFAULT: '#1E3A5F', light: '#2E5B96', dark: '#0F1E30' },
        accent:  { DEFAULT: '#00B4D8', light: '#90E0EF' },
      }
    }
  },
  plugins: []
}