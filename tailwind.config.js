/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      colors: {
        charcoal: '#1F2937',
        sage: '#B2AC88',
        terracotta: '#C06C54',
        offwhite: '#F9FAFB',
        cream: '#F3F4F6'
      }
    },
  },
  plugins: [],
}